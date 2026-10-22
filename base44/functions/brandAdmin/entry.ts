import { createClientFromRequest } from 'npm:@base44/sdk@0.8.54';
import { sha256, newApiKey, SHOP_RE, publicBrand, monthStartIso } from '../../shared/brand.ts';

const API_VERSION = '2024-10';

async function shopifyGet(url: string, token: string) {
  const r = await fetch(url, { headers: { 'X-Shopify-Access-Token': token }, signal: AbortSignal.timeout(20000) });
  if (!r.ok) throw new Error(`Shopify a répondu ${r.status}. Vérifiez le domaine et le jeton (droit read_products).`);
  return r;
}

async function syncCatalog(db: any, brand: any) {
  await db.Brand.update(brand.id, { sync_status: 'syncing', sync_error: '' });
  try {
    const base = `https://${brand.shop_domain}`;
    const storeUrl = (brand.store_url || base).replace(/\/$/, '');
    const products: any[] = [];
    let url: string | null = `${base}/admin/api/${API_VERSION}/products.json?limit=250&status=active`;
    while (url && products.length < 2000) {
      const r = await shopifyGet(url, brand.shop_token);
      const j = await r.json();
      products.push(...(j.products || []));
      const m = (r.headers.get('link') || '').match(/<([^>]+)>;\s*rel="next"/);
      url = m && m[1].startsWith(base + '/') ? m[1] : null;
    }
    const rows = products
      .filter((p) => p.images?.length)
      .map((p) => {
        const variants = (p.variants || []).map((v: any) => ({ id: String(v.id), title: v.title, price: v.price, sku: v.sku || '' }));
        const prices = variants.map((v: any) => parseFloat(v.price)).filter((n: number) => !isNaN(n));
        return {
          brand_id: brand.id,
          external_id: String(p.id),
          title: String(p.title || '').slice(0, 200),
          image_url: p.images[0].src,
          images: p.images.slice(0, 5).map((i: any) => i.src),
          price: prices.length ? Math.min(...prices) : 0,
          currency: brand.currency || '',
          product_url: `${storeUrl}/products/${p.handle}`,
          available: p.status === 'active',
          variants_json: JSON.stringify(variants).slice(0, 20000),
        };
      });

    const old = await db.BrandProduct.filter({ brand_id: brand.id }, { limit: 5000 });
    const oldIds = old.items.map((o: any) => o.id);
    for (let i = 0; i < rows.length; i += 100) await db.BrandProduct.bulkCreate(rows.slice(i, i + 100));
    for (let i = 0; i < oldIds.length; i += 200) await db.BrandProduct.deleteMany({ id: { $in: oldIds.slice(i, i + 200) } });

    return await db.Brand.update(brand.id, {
      sync_status: rows.length ? 'ok' : 'empty',
      sync_error: '',
      product_count: rows.length,
      last_synced_at: new Date().toISOString(),
    });
  } catch (e) {
    console.error('syncCatalog failed:', e.message);
    return await db.Brand.update(brand.id, { sync_status: 'error', sync_error: String(e.message).slice(0, 300) });
  }
}

export default async function (req: Request) {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });
    const db = base44.asServiceRole.entities;
    const body = await req.json();
    const action = body.action;

    const found = await db.Brand.filter({ owner_id: user.id }, { limit: 1 });
    let brand = found.items[0] || null;

    if (action === 'save') {
      const name = String(body.name || '').trim().slice(0, 80);
      if (!name) return Response.json({ error: 'Le nom de la marque est requis' }, { status: 400 });
      const retention = Math.min(365, Math.max(1, Math.round(Number(body.retentionDays) || 30)));
      brand = brand
        ? await db.Brand.update(brand.id, { name, retention_days: retention })
        : await db.Brand.create({ owner_id: user.id, name, platform: 'shopify', retention_days: retention });
      return Response.json({ brand: publicBrand(brand) });
    }

    if (!brand) return Response.json({ error: 'Créez d\'abord votre espace marque' }, { status: 404 });

    if (action === 'get') {
      const used = await db.TryOnJob.count({ brand_id: brand.id, status: { $ne: 'failed' }, created_date: { $gte: monthStartIso() } });
      return Response.json({ brand: publicBrand(brand), usage: { used, quota: brand.monthly_quota ?? 100 } });
    }

    if (action === 'connect') {
      let domain = String(body.shopDomain || '').trim().toLowerCase().replace(/^https?:\/\//, '').split('/')[0];
      const token = String(body.token || '').trim();
      if (!SHOP_RE.test(domain)) return Response.json({ error: 'Domaine invalide (format : maboutique.myshopify.com)' }, { status: 400 });
      if (token.length < 10 || token.length > 200) return Response.json({ error: 'Jeton Admin API invalide' }, { status: 400 });
      let storeUrl = String(body.storeUrl || '').trim();
      if (storeUrl && !/^https:\/\/[^\s/]+$/.test(storeUrl.replace(/\/$/, ''))) {
        return Response.json({ error: 'URL publique invalide (ex : https://www.mamarque.com)' }, { status: 400 });
      }
      const shopRes = await shopifyGet(`https://${domain}/admin/api/${API_VERSION}/shop.json`, token).catch((e) => e);
      if (shopRes instanceof Error) return Response.json({ error: shopRes.message }, { status: 400 });
      const shop = (await shopRes.json()).shop || {};
      brand = await db.Brand.update(brand.id, {
        shop_domain: domain, shop_token: token, store_url: storeUrl.replace(/\/$/, ''), currency: shop.currency || '', platform: 'shopify',
      });
      brand = await syncCatalog(db, brand);
      return Response.json({ brand: publicBrand(brand) });
    }

    if (action === 'sync') {
      if (!brand.shop_token) return Response.json({ error: 'Connectez d\'abord votre boutique' }, { status: 400 });
      brand = await syncCatalog(db, brand);
      return Response.json({ brand: publicBrand(brand) });
    }

    if (action === 'products') {
      const r = await db.BrandProduct.filter({ brand_id: brand.id }, { sort: 'title', limit: 60 });
      return Response.json({
        products: r.items.map((p: any) => ({ id: p.external_id, title: p.title, image_url: p.image_url, price: p.price, currency: p.currency, product_url: p.product_url })),
      });
    }

    if (action === 'rotateKey') {
      const apiKey = newApiKey();
      await db.Brand.update(brand.id, {
        api_key_hash: await sha256(apiKey), api_key_prefix: apiKey.slice(0, 12), key_created_at: new Date().toISOString(),
      });
      return Response.json({ apiKey });
    }

    if (action === 'revokeKey') {
      await db.Brand.update(brand.id, { api_key_hash: '', api_key_prefix: '', key_created_at: '' });
      return Response.json({ ok: true });
    }

    if (action === 'jobs') {
      const r = await db.TryOnJob.filter({ brand_id: brand.id }, { sort: '-created_date', limit: 30 });
      const jobs = await Promise.all(r.items.map(async (j: any) => {
        const live = j.result_uri && (!j.expires_at || new Date(j.expires_at).getTime() > Date.now());
        let url = null;
        if (live) url = (await base44.asServiceRole.integrations.Core.CreateFileSignedUrl({ file_uri: j.result_uri, expires_in: 600 })).signed_url;
        return { id: j.id, product_title: j.product_title, status: j.status, created_date: j.created_date, expired: !!j.result_uri && !live, url };
      }));
      return Response.json({ jobs });
    }

    return Response.json({ error: 'Action inconnue' }, { status: 400 });
  } catch (error) {
    console.error('brandAdmin error:', error);
    return Response.json({ error: 'Une erreur est survenue' }, { status: 500 });
  }
}