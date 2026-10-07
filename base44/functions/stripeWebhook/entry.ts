import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';
import Stripe from 'npm:stripe@14.21.0';

Deno.serve(async (req) => {
  const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY"));
  const body = await req.text();
  const signature = req.headers.get('stripe-signature');
  const webhookSecret = Deno.env.get("STRIPE_WEBHOOK_SECRET");

  if (!webhookSecret) {
    console.error('STRIPE_WEBHOOK_SECRET is not set. Go to Stripe Dashboard > Developers > Webhooks > click your endpoint > copy the Signing secret (whsec_...) and set it as STRIPE_WEBHOOK_SECRET in Base44 environment variables.');
    return new Response('Webhook secret not configured', { status: 500 });
  }

  let event;
  try {
    event = await stripe.webhooks.constructEventAsync(body, signature, webhookSecret);
  } catch (err) {
    console.error('Webhook signature error:', err.message);
    return new Response('Webhook Error', { status: 400 });
  }

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object;
    const userEmail = session.metadata?.user_email;
    const credits = parseInt(session.metadata?.credits || '0');
    const sessionId = session.id;

    // Ignore Base44 merchant self-test charges and unpaid sessions
    if (session.metadata?.base44_test_checkout === 'true' || session.payment_status !== 'paid') {
      return Response.json({ received: true });
    }

    if (userEmail && credits > 0) {
      try {
        const base44 = createClientFromRequest(req);
        const users = await base44.asServiceRole.entities.User.filter({ email: userEmail });
        if (users.length > 0) {
          const user = users[0];

          // Idempotence (claim-then-verify): create a claim, then only the earliest claim wins.
          const claim = await base44.asServiceRole.entities.ProcessedStripeSession.create({ session_id: sessionId });
          const claims = await base44.asServiceRole.entities.ProcessedStripeSession.filter(
            { session_id: sessionId },
            { sort: 'created_date', limit: 50 }
          );
          const winner = [...claims.items ?? claims].sort(
            (a, b) => String(a.created_date).localeCompare(String(b.created_date)) || String(a.id).localeCompare(String(b.id))
          )[0];
          if (!winner || winner.id !== claim.id) {
            await base44.asServiceRole.entities.ProcessedStripeSession.delete(claim.id).catch(() => {});
            console.log(`Session ${sessionId} already processed for ${userEmail}, skipping.`);
            return Response.json({ received: true });
          }

          // Per-user lock (same AnalysisLock used by analyzeOutfit) serializes balance writes
          const LOCK_TTL_MS = 120_000;
          const locks = base44.asServiceRole.entities.AnalysisLock;
          let lock = null;
          for (let attempt = 0; attempt < 20 && !lock; attempt++) {
            const mine = await locks.create({ user_email: user.email, locked_at: new Date().toISOString() });
            const all = await locks.filter({ user_email: user.email });
            const active = (all.items ?? all)
              .filter((l) => new Date(l.locked_at).getTime() > Date.now() - LOCK_TTL_MS)
              .sort((a, b) => String(a.created_date).localeCompare(String(b.created_date)) || String(a.id).localeCompare(String(b.id)));
            if (active[0]?.id === mine.id) {
              lock = mine;
            } else {
              await locks.delete(mine.id).catch(() => {});
              await new Promise((r) => setTimeout(r, 500));
            }
          }
          if (!lock) {
            // Release the idempotency claim so Stripe's retry can grant the credits
            await base44.asServiceRole.entities.ProcessedStripeSession.delete(claim.id).catch(() => {});
            console.error(`Could not acquire credit lock for ${userEmail}`);
            return new Response('Retry later', { status: 503 });
          }
          try {
            const freshUser = await base44.asServiceRole.entities.User.get(user.id);
            await base44.asServiceRole.entities.User.update(user.id, {
              analysis_credits: (freshUser.analysis_credits || 0) + credits,
            });
            console.log(`Added ${credits} credits to ${userEmail}.`);
          } finally {
            await locks.delete(lock.id).catch(() => {});
          }
        }
      } catch (err) {
        console.error('Error updating credits:', err.message);
      }
    }
  }

  return Response.json({ received: true });
});