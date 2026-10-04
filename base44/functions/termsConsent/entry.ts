import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

const TERMS_VERSION = '2026-04';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const { action } = await req.json();
    const existing = await base44.asServiceRole.entities.TermsConsent.filter({
      user_id: user.id,
      terms_version: TERMS_VERSION,
    });

    if (action === 'get') {
      return Response.json({ accepted: existing.length > 0 });
    }

    if (action === 'accept') {
      if (existing.length === 0) {
        await base44.asServiceRole.entities.TermsConsent.create({
          user_id: user.id,
          user_email: user.email,
          accepted_at: new Date().toISOString(),
          terms_version: TERMS_VERSION,
        });
      }
      return Response.json({ accepted: true });
    }

    return Response.json({ error: 'Invalid action' }, { status: 400 });
  } catch (error) {
    console.error('termsConsent error:', error);
    return Response.json({ error: 'Une erreur est survenue' }, { status: 500 });
  }
});