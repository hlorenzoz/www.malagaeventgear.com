/**
 * Review request email template — sent by the cron Worker to request a GMB review.
 * Pure function: no I/O. Unit-testable with Vitest.
 * The tracked link is /r/[token] (server-side 302 → GMB).
 */

interface EmailTemplate {
	subject: string;
	html: string;
	text: string;
}

const copy = {
	en: {
		subject: 'How was your experience with Malaga Event Gear?',
		greeting: (name: string) => `Hi ${name},`,
		body: 'We hope your event was a success! We would love to hear about your experience with Malaga Event Gear. Would you mind leaving us a quick Google review? It only takes 2 minutes and helps us a lot.',
		cta: 'Leave a review',
		closing: 'Thank you for choosing Malaga Event Gear!',
		team: 'The Malaga Event Gear team',
	},
	es: {
		subject: '¿Cómo fue tu experiencia con Malaga Event Gear?',
		greeting: (name: string) => `Hola ${name},`,
		body: '¡Esperamos que tu evento haya sido un éxito! Nos encantaría saber cómo fue tu experiencia con Malaga Event Gear. ¿Podrías dejarnos una reseña rápida en Google? Solo tarda 2 minutos y nos ayuda mucho.',
		cta: 'Dejar una reseña',
		closing: '¡Gracias por elegir Malaga Event Gear!',
		team: 'El equipo de Malaga Event Gear',
	},
} as const;

function escapeHtml(s: string): string {
	return s
		.replace(/&/g, '&amp;')
		.replace(/</g, '&lt;')
		.replace(/>/g, '&gt;')
		.replace(/"/g, '&quot;');
}

export function renderReview(
	token: string,
	lang: 'en' | 'es' = 'es',
	siteUrl: string,
	leadName: string = '',
): EmailTemplate {
	const t = copy[lang] ?? copy.es;
	const trackedLink = `${siteUrl}/r/${token}`;

	const html = `<!DOCTYPE html>
<html lang="${lang}">
<head><meta charset="UTF-8"><title>${escapeHtml(t.subject)}</title></head>
<body style="font-family:system-ui,sans-serif;background:#f9fafb;padding:32px;">
  <div style="max-width:560px;margin:0 auto;background:#fff;border-radius:8px;padding:32px;box-shadow:0 1px 3px rgba(0,0,0,.1);">
    <h1 style="font-size:22px;color:#111827;margin-bottom:8px;">${escapeHtml(t.greeting(leadName))}</h1>
    <p style="color:#374151;line-height:1.6;">${t.body}</p>
    <div style="text-align:center;margin:32px 0;">
      <a href="${escapeHtml(trackedLink)}"
         style="display:inline-block;background:#f59e0b;color:#fff;font-weight:600;padding:14px 32px;border-radius:6px;text-decoration:none;font-size:16px;">
        ${t.cta}
      </a>
    </div>
    <p style="color:#374151;line-height:1.6;">${t.closing}</p>
    <p style="color:#6b7280;font-size:13px;">${t.team}</p>
  </div>
</body>
</html>`;

	const text = [
		t.greeting(leadName),
		'',
		t.body,
		'',
		`${t.cta}: ${trackedLink}`,
		'',
		t.closing,
		t.team,
	].join('\n');

	return { subject: t.subject, html, text };
}
