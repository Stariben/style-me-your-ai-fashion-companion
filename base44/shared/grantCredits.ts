import { getCreditsRecord } from './credits.ts';

const byAge = (a: any, b: any) =>
  String(a.created_date).localeCompare(String(b.created_date)) || String(a.id).localeCompare(String(b.id));

// Grants the credits of a PAID Stripe checkout session exactly once (idempotent per session id).
// Used by both the Stripe webhook and the post-payment confirmation, so either can win.
// Everything happens inside the per-user lock, so the two callers never race.
// Returns 'granted' | 'duplicate' | 'locked' | 'skipped'.
export async function grantSessionCredits(base44: any, session: any): Promise<string> {
  const userEmail = session.metadata?.user_email;
  const credits = parseInt(session.metadata?.credits || '0');
  if (session.metadata?.base44_test_checkout === 'true' || session.payment_status !== 'paid') {
    console.log(`grant ${session.id}: skipped (status=${session.payment_status})`);
    return 'skipped';
  }
  if (!userEmail || !(credits > 0)) {
    console.log(`grant ${session.id}: skipped (missing metadata)`);
    return 'skipped';
  }

  const db = base44.asServiceRole.entities;
  const users = await db.User.filter({ email: userEmail });
  const user = (users.items ?? users)[0];
  if (!user) {
    console.log(`grant ${session.id}: skipped (user not found)`);
    return 'skipped';
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
    console.log(`grant ${session.id}: locked`);
    return 'locked';
  }

  try {
    const done = await db.ProcessedStripeSession.filter({ session_id: session.id });
    if ((done.items ?? done).length > 0) {
      console.log(`grant ${session.id}: duplicate`);
      return 'duplicate';
    }
    const marker = await db.ProcessedStripeSession.create({ session_id: session.id });
    try {
      const rec = await getCreditsRecord(db, user.id);
      await db.UserCredits.update(rec.id, { analysis_credits: (rec.analysis_credits || 0) + credits });
    } catch (err) {
      await db.ProcessedStripeSession.delete(marker.id).catch(() => {});
      throw err;
    }
    console.log(`grant ${session.id}: granted +${credits} to ${user.id}`);
    return 'granted';
  } finally {
    await db.AnalysisLock.delete(lock.id).catch(() => {});
  }
}