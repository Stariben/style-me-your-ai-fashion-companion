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

          // Atomic increment (no read-modify-write)
          await base44.asServiceRole.entities.User.updateMany(
            { id: user.id },
            { $inc: { analysis_credits: credits } }
          );
          console.log(`Added ${credits} credits to ${userEmail}.`);
        }
      } catch (err) {
        console.error('Error updating credits:', err.message);
      }
    }
  }

  return Response.json({ received: true });
});