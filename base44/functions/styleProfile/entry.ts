import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

import { hasAcceptedTerms } from '../../shared/termsConsent.ts';
import { toFetchableUrl, privatize } from '../../shared/privateFile.ts';

const LANG_NAMES = { fr: 'French', en: 'English', es: 'Spanish', ru: 'Russian', zh: 'Chinese', pt: 'Portuguese' };
const COOLDOWN_MS = 10 * 60 * 1000;
const MAX_RECOMMENDATIONS = 4;

const items = (r: any) => (Array.isArray(r) ? r : r?.items ?? []);

Deno.serve(async (req) => {
  let release = async () => {};
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await req.json();
    const { action, lang } = body;
    const db = base44.asServiceRole.entities;

    const loadProfile = async () => {
      const e = items(await db.StyleProfile.filter({ user_id: user.id }))[0] || null;
      return { existing: e, saved: e ? JSON.parse(e.profile_json || 'null') : null };
    };
    let { existing, saved } = await loadProfile();

    if (action === 'get') {
      return Response.json({ profile: saved, generated_at: existing?.generated_at || null });
    }
    if (action !== 'image' && action !== 'refresh') return Response.json({ error: 'Invalid action' }, { status: 400 });

    // Per-user lock (claim-then-verify, same AnalysisLock as analyzeOutfit): serializes AI generation
    const LOCK_TTL_MS = 600_000;
    const locks = db.AnalysisLock;
    const mine = await locks.create({ user_email: user.email, locked_at: new Date().toISOString() });
    release = async () => { await locks.delete(mine.id).catch(() => {}); };
    const activeLocks = items(await locks.filter({ user_email: user.email }))
      .filter((l: any) => new Date(l.locked_at).getTime() > Date.now() - LOCK_TTL_MS)
      .sort((a: any, b: any) => String(a.created_date).localeCompare(String(b.created_date)) || String(a.id).localeCompare(String(b.id)));
    if (activeLocks[0]?.id !== mine.id) {
      return Response.json({ error: 'Une opération est déjà en cours. Veuillez patienter.' }, { status: 409 });
    }
    // Re-read after winning the lock so the cooldown / existing images reflect the latest state
    ({ existing, saved } = await loadProfile());

    if (action === 'image') {
      // Generates one recommendation photo per call (keeps each request short)
      const idx = Number(body.index);
      const rec = saved?.recommendations?.[idx];
      if (!rec) return Response.json({ error: 'Invalid index' }, { status: 400 });
      if (rec.image_url) return Response.json({ image_url: rec.image_url });
      // Use the user's own most recent photo as the face/body reference
      const lastHist = items(await db.AnalysisHistory.filter(
        { $or: [{ user_id: user.id }, { created_by_id: user.id }] },
        '-created_date',
        1
      ))[0];
      const ref = lastHist?.person_image ? await toFetchableUrl(base44, lastHist.person_image) : null;
      const img = await base44.asServiceRole.integrations.Core.GenerateImage({
        prompt: ref
          ? `Edit the reference photo: keep this exact same person, with the identical face, facial features, skin tone, hair, facial hair, age and body build, so they are instantly recognizable. Dress them in: ${rec.name}. Full or 3/4 body, clean neutral studio background, natural pose, realistic photography, no text, no watermark, high quality. Do NOT change the face or generate a different person.`
          : `Professional fashion photo of a model who resembles this description: ${rec.model_description || `${saved.skin_tone}, ${saved.hair}, ${saved.body_type}`}. The model is wearing: ${rec.name}. Full or 3/4 body, clean neutral studio background, natural pose, no text, no watermark, high quality.`,
        ...(ref ? { existing_image_urls: [ref] } : {}),
      });
      rec.image_url = await privatize(base44, img?.url, user.id);
      await db.StyleProfile.update(existing.id, { profile_json: JSON.stringify(saved) });
      return Response.json({ image_url: rec.image_url });
    }

    if (!(await hasAcceptedTerms(base44, user.id))) {
      return Response.json({ error: 'Terms must be accepted', consentRequired: true }, { status: 403 });
    }

    // Cooldown: protects AI/image credits from repeated refreshes
    if (existing?.generated_at && Date.now() - new Date(existing.generated_at).getTime() < COOLDOWN_MS) {
      return Response.json({ profile: saved, generated_at: existing.generated_at, cooldown: true });
    }

    // Older records have no user_id, only created_by_id
    const history = items(await db.AnalysisHistory.filter(
      { $or: [{ user_id: user.id }, { created_by_id: user.id }] },
      '-created_date',
      10
    ));
    console.log(`styleProfile refresh: user=${user.id} history=${history.length}`);
    if (history.length === 0) return Response.json({ error: 'No analysis yet', noHistory: true }, { status: 400 });

    const digest = history.map((h: any, i: number) => {
      let r: any = {};
      try { r = JSON.parse(h.result_json || '{}'); } catch { /* ignore */ }
      return `#${i + 1} score ${h.match_score}/10 | person: ${r.person_description || ''} | outfit: ${r.outfit_description || ''} | pros: ${(r.pros || []).join('; ')} | cons: ${(r.cons || []).join('; ')}`;
    }).join('\n');

    const outputLang = LANG_NAMES[lang] || 'French';
    const raw = await base44.asServiceRole.integrations.Core.InvokeLLM({
      prompt: `You are an elite personal stylist. Below are the user's most recent outfit analyses (higher score = flattering).
${digest}

Build a concise personal style profile and ${MAX_RECOMMENDATIONS} clothing recommendations that would flatter this person. Base everything on the recurring physical traits and on what scored well.
All text fields MUST be written in ${outputLang}, except search_query, model_description and image_prompt which MUST be in English.`,
      response_json_schema: {
        type: 'object',
        properties: {
          skin_tone: { type: 'string' },
          undertone: { type: 'string', description: 'warm, cool or neutral' },
          hair: { type: 'string' },
          body_type: { type: 'string' },
          style_vibe: { type: 'string' },
          best_colors: { type: 'array', items: { type: 'string' }, description: '4-6 flattering colors' },
          best_cuts: { type: 'array', items: { type: 'string' }, description: '3-4 flattering cuts/silhouettes' },
          avoid: { type: 'array', items: { type: 'string' }, description: '2-3 things to avoid' },
          recommendations: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                name: { type: 'string' },
                reason: { type: 'string' },
                search_query: { type: 'string', description: 'short English shopping query' },
                model_description: { type: 'string', description: 'English: a model resembling this person (skin tone, hair, build, age range)' },
              },
            },
          },
        },
      },
    });
    const p = raw?.response ?? raw;

    const recs = (Array.isArray(p.recommendations) ? p.recommendations : [])
      .filter((r: any) => r && r.name)
      .slice(0, MAX_RECOMMENDATIONS);


    const profile = {
      skin_tone: p.skin_tone || '',
      undertone: p.undertone || '',
      hair: p.hair || '',
      body_type: p.body_type || '',
      style_vibe: p.style_vibe || '',
      best_colors: p.best_colors || [],
      best_cuts: p.best_cuts || [],
      avoid: p.avoid || [],
      recommendations: recs.map((r: any, i: number) => ({
        name: r.name,
        reason: r.reason || '',
        search_query: r.search_query || r.name,
        model_description: r.model_description || '',
        image_url: null,
      })),
    };

    const generated_at = new Date().toISOString();
    const data = { user_id: user.id, profile_json: JSON.stringify(profile), generated_at };
    if (existing) await db.StyleProfile.update(existing.id, data);
    else await db.StyleProfile.create(data);

    return Response.json({ profile, generated_at });
  } catch (error) {
    console.error('styleProfile error:', error);
    return Response.json({ error: 'Une erreur est survenue' }, { status: 500 });
  } finally {
    await release();
  }
});