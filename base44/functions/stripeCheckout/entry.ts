import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';
import Stripe from 'npm:stripe@14.21.0';

const PACKS = {
  pack10: { priceId: 'price_1TY8H2E9v6SxdgVsBiQNYICn', credits: 10 },
  pack50: { priceId: 'price_1TY8H2E9v6SxdgVsjkoC1T2W', credits: 50 },
};

Deno.serve(async (req) => {
  try {
    const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY"));
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const { packId, successUrl, cancelUrl } = await req.json();
    const pack = PACKS[packId];
    if (!pack) return Response.json({ error: 'Pack invalide' }, { status: 400 });

    // Anti Open-Redirect: only allow same-origin HTTPS URLs
    // Server-side allowlist, independent of the client-controlled Origin header
    const ALLOWED_HOSTS = [
      'style-me-your-ai-fashion-companio-2945c724.base44.app',
      'styleia.app',
      'www.styleia.app',
    ];
    const isAllowed = (u) => {
      try {
        const parsed = new URL(u);
        if (parsed.protocol !== 'https:') return false;
        return ALLOWED_HOSTS.includes(parsed.hostname) ||
          parsed.hostname === `preview-sandbox--${Deno.env.get("BASE44_APP_ID")}.base44.app`;
      } catch {
        return false;
      }
    };
    if (!isAllowed(successUrl) || !isAllowed(cancelUrl)) {
      return Response.json({ error: 'URLs de redirection invalides' }, { status: 400 });
    }

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [{ price: pack.priceId, quantity: 1 }],
      mode: 'payment',
      success_url: successUrl,
      cancel_url: cancelUrl,
      customer_email: user.email,
      metadata: {
        base44_app_id: Deno.env.get("BASE44_APP_ID"),
        user_email: user.email,
        pack_id: packId,
        credits: String(pack.credits),
      },
    });

    return Response.json({ url: session.url });
  } catch (error) {
    console.error('Stripe checkout error:', error);
    return Response.json({ error: 'Erreur lors de la création du paiement' }, { status: 500 });
  }
});