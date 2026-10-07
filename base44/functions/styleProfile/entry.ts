import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

import { hasAcceptedTerms } from '../../shared/termsConsent.ts';

const LANG_NAMES = { fr: 'French', en: 'English', es: 'Spanish', ru: 'Russian', zh: 'Chinese', pt: 'Portuguese' };
const COOLDOWN_MS = 10 * 60 * 1000;
const MAX_RECOMMENDATIONS = 4;

const items = (r: any) => (Array.isArray(r) ? r : r?.items ?? []);

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const { action, lang } = await req.json();
    const db = base44.asServiceRole.entities;

    const existing = items(await db.StyleProfile.filter({ user_id: user.id }))[0] || null;
    const saved = existing ? JSON.parse(existing.profile_json || 'null') : null;

    if (action === 'get') {
      return Response.json({ profile: saved, generated_at: existing?.generated_at || null });
    }
    if (action !== 'refresh') return Response.json({ error: 'Invalid action' }, { status: 400 });

    if (!(await hasAcceptedTerms(base44, user.id))) {
      return Response.json({ error: 'Terms must be accepted', consentRequired: true }, { status: 403 });
    }

    // Cooldown: protects AI/image credits from repeated refreshes
    if (existing?.generated_at && Date.now() - new Date(existing.generated_at).getTime() < COOLDOWN_MS) {
      return Response.json({ profile: saved, generated_at: existing.generated_at, cooldown: true });
    }

    const history = items(await db.AnalysisHistory.filter({ user_id: user.id }, { sort: '-created_date', limit: 10 }));
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

    const images = await Promise.all(recs.map((r: any) =>
      base44.asServiceRole.integrations.Core.GenerateImage({
        prompt: `Professional fashion photo of a model who resembles this description: ${r.model_description || `${p.skin_tone}, ${p.hair}, ${p.body_type}`}. The model is wearing: ${r.name}. Full or 3/4 body, clean neutral studio background, natural pose, no text, no watermark, high quality.`,
      }).then((x: any) => x?.url || null).catch((e: unknown) => { console.error('Profile image failed:', e); return null; })
    ));

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
        image_url: images[i],
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
  }
});