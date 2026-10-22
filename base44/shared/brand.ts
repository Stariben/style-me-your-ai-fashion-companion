export const SHOP_RE = /^[a-z0-9][a-z0-9-]*\.myshopify\.com$/;

export async function sha256(text: string): Promise<string> {
  const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(text));
  return Array.from(new Uint8Array(buf)).map((b) => b.toString(16).padStart(2, '0')).join('');
}

export function newApiKey(): string {
  const bytes = crypto.getRandomValues(new Uint8Array(24));
  return 'sm_live_' + Array.from(bytes).map((b) => b.toString(16).padStart(2, '0')).join('');
}

export function monthStartIso(): string {
  const d = new Date();
  return new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), 1)).toISOString();
}

// Fields safe to send to the browser (never the shop token or the key hash)
export function publicBrand(b: any) {
  return {
    name: b.name,
    platform: b.platform,
    shop_domain: b.shop_domain || '',
    store_url: b.store_url || '',
    sync_status: b.sync_status || 'idle',
    sync_error: b.sync_error || '',
    last_synced_at: b.last_synced_at || '',
    product_count: b.product_count || 0,
    monthly_quota: b.monthly_quota ?? 100,
    retention_days: b.retention_days ?? 30,
    api_key_prefix: b.api_key_prefix || '',
    key_created_at: b.key_created_at || '',
    shop_connected: !!b.shop_token,
    has_key: !!b.api_key_hash,
  };
}