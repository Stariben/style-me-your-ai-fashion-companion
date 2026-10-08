import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';
import Stripe from 'npm:stripe@14.21.0';
import { grantSessionCredits } from '../../shared/grantCredits.ts';

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
    try {
      const base44 = createClientFromRequest(req);
      const result = await grantSessionCredits(base44, event.data.object);
      console.log(`Webhook session ${event.data.object.id}: ${result}`);
      if (result === 'locked') return new Response('Retry later', { status: 503 });
    } catch (err) {
      console.error('Error updating credits:', err.message);
      return new Response('Retry later', { status: 500 });
    }
  }

  return Response.json({ received: true });
});