import { getCreditsRecord } from './credits.ts';

// Grants the credits of a PAID Stripe checkout session exactly once (idempotent per session id).
// Used by both the Stripe webhook and the post-payment confirmation, so either can win.
// Returns 'granted' | 'duplicate' | 'locked' | 'skipped'. Throws on unexpected errors (claim is released).
export async function grantSessionCredits(base44: any, session: any): Promise<string> {
  const userEmail = session.metadata?.user_email;
  const credits = parseInt(session.metadata?.credits || '0');
  if (session.metadata?.base44_test_checkout === 'true' || session.payment_status !== 'paid') return 'skipped';
  if (!userEmail || !(credits > 0)) return 'skipped';

  const db = base44.asServiceRole.entities;
  const users = await db.User.filter({ email: userEmail });
  const user = (users.items ?? users)[0];
  if (!user) return 'skipped';

  const byAge = (a: any, b: any) =>
    String(a.created_date).localeCompare(String(b.created_date)) || String(a.id).localeCompare(String(b.id));

  const claim = await db.ProcessedStripeSession.create({ session_id: session.id });
  try {
    const claims = await db.ProcessedStripeSession.filter({ session_id: session.id }, { sort: 'created_date', limit: 50 });
    const winner = [...(claims.items ?? claims)].sort(byAge)[0];
    if (!winner || winner.id !== claim.id) {
      await db.ProcessedStripeSession.delete(claim.id).catch(() => {});
      return 'duplicate';
    }

    const LOCK_TTL_MS = 600_000;
    let lock: any = null;
    for (let attempt = 0; attempt < 20 && !lock; attempt++) {
      const mine = await db.AnalysisLock.create({ user_email: user.email, locked_at: new Date().toISOString() });
      const all = await db.AnalysisLock.filter({ user_email: user.email });
      const active = (all.items ?? all)
        .filter((l: any) => new Date(l.locked_at).getTime() > Date.now() - LOCK_TTL_MS)
        .sort(byAge);
      if (active[0]?.id === mine.id) lock = mine;
      else {
        await db.AnalysisLock.delete(mine.id).catch(() => {});
        await new Promise((r) => setTimeout(r, 500));
      }
    }
    if (!lock) {
      await db.ProcessedStripeSession.delete(claim.id).catch(() => {});
      return 'locked';
    }
    try {
      const rec = await getCreditsRecord(db, user.id);
      await db.UserCredits.update(rec.id, { analysis_credits: (rec.analysis_credits || 0) + credits });
    } finally {
      await db.AnalysisLock.delete(lock.id).catch(() => {});
    }
    return 'granted';
  } catch (err) {
    await db.ProcessedStripeSession.delete(claim.id).catch(() => {});
    throw err;
  }
}