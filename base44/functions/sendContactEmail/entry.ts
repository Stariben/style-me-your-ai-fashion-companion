import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

// Configuration par type de requête
const RATE_LIMITS = {
  contact: { max: 5, windowMs: 60 * 60 * 1000 },        // 5 messages / heure
  delete:  { max: 1, windowMs: 24 * 60 * 60 * 1000 },   // 1 suppression / jour
};

// Échappe les caractères dangereux pour l'email tout en gardant les apostrophes/accents
function sanitize(str, maxLen) {
  return String(str || '')
    .replace(/[\r\n]/g, ' ')
    .replace(/[<>]/g, '')
    .trim()
    .slice(0, maxLen);
}

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { subject, message, type } = body;

    // 1. Validation du type
    if (type !== 'contact' && type !== 'delete') {
      return Response.json({ error: 'Invalid type' }, { status: 400 });
    }

    // 2. Validation des entrées
    if (type === 'contact') {
      if (!subject || typeof subject !== 'string' || subject.trim().length === 0 || subject.length > 200) {
        return Response.json({ error: 'Sujet invalide (1-200 caractères requis)' }, { status: 400 });
      }
      if (!message || typeof message !== 'string' || message.trim().length === 0 || message.length > 2000) {
        return Response.json({ error: 'Message invalide (1-2000 caractères requis)' }, { status: 400 });
      }
    }

    // 3. Rate limit PERSISTANT via entité Base44
    const limit = RATE_LIMITS[type];
    const since = new Date(Date.now() - limit.windowMs).toISOString();

    const recent = await base44.asServiceRole.entities.ContactRateLimit.filter({
      user_email: user.email,
      request_type: type,
    });
    const recentCount = recent.filter((r) => r.timestamp >= since).length;

    if (recentCount >= limit.max) {
      const retryAfterMin = Math.ceil(limit.windowMs / 60000);
      return Response.json(
        {
          error: `Trop de requêtes. Réessayez dans ${retryAfterMin} minute(s).`,
          retryAfter: Math.ceil(limit.windowMs / 1000),
        },
        { status: 429, headers: { 'Retry-After': String(Math.ceil(limit.windowMs / 1000)) } }
      );
    }

    // 4. Préparation de l'email
    const safeName    = sanitize(user.full_name || 'N/A', 100);
    const safeEmail   = sanitize(user.email || '', 200);
    const safeSubject = type === 'contact' ? sanitize(subject, 200) : '';
    const safeMessage = type === 'contact' ? sanitize(message, 2000) : '';

    let emailSubject, emailBody;
    if (type === 'contact') {
      emailSubject = `[StyleMe Contact] ${safeSubject}`;
      emailBody = `Message de ${safeName} (${safeEmail}):\n\n${safeMessage}`;
    } else {
      emailSubject = `[StyleMe] Demande de suppression de compte`;
      emailBody = `Bonjour,\n\nL'utilisateur suivant a demandé la suppression de son compte :\n\nNom : ${safeName}\nEmail : ${safeEmail}\n\nConformément à notre politique de confidentialité, la suppression sera effectuée dans un délai de 30 jours.\n\nStyleMe`;
    }

    // 5. Enregistrer pour le rate limit
    await base44.asServiceRole.entities.ContactRateLimit.create({
      user_email: user.email,
      request_type: type,
      timestamp: new Date().toISOString(),
    });

    // 6. Envoyer l'email de confirmation à l'utilisateur
    const confirmationBody = type === 'contact'
      ? `Bonjour ${safeName},\n\nNous avons bien reçu votre message concernant : "${safeSubject}".\n\nNous vous répondrons dans les plus brefs délais.\n\nL'équipe StyleMe`
      : `Bonjour ${safeName},\n\nNous avons bien reçu votre demande de suppression de compte.\n\nConformément à notre politique de confidentialité, la suppression sera effectuée dans un délai de 30 jours.\n\nL'équipe StyleMe`;

    await base44.asServiceRole.integrations.Core.SendEmail({
      to: user.email,
      subject: type === 'contact' ? `[StyleMe] Votre message a bien été reçu` : `[StyleMe] Demande de suppression reçue`,
      body: confirmationBody,
      from_name: 'StyleMe',
    });

    // 7. Notifier les admins
    const admins = await base44.asServiceRole.entities.User.filter({ role: 'admin' });
    await Promise.all(
      admins
        .filter((a) => a.email !== user.email)
        .map((admin) =>
          base44.asServiceRole.integrations.Core.SendEmail({
            to: admin.email,
            subject: emailSubject,
            body: emailBody,
            from_name: 'StyleMe',
          })
        )
    );

    return Response.json({ success: true });
  } catch (error) {
    console.error('sendContactEmail error:', error);
    return Response.json({ error: 'Une erreur est survenue' }, { status: 500 });
  }
});