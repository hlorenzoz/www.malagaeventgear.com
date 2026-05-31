/**
 * Lead confirmation email template — sent to the lead after form submission.
 * Pure function: no I/O, no runtime template engine. Unit-testable with Vitest.
 */

export interface LeadData {
	name: string;
	email: string;
	phone?: string | null;
	eventDate?: string | null;
	packageId: string;
	comments?: string | null;
}

interface EmailTemplate {
	subject: string;
	html: string;
	text: string;
}

const copy = {
	en: {
		subject: (name: string) => `We received your request, ${name}!`,
		greeting: (name: string) => `Hi ${name},`,
		body: 'Thank you for contacting Malaga Event Gear. We have received your request and will get back to you within 24 hours.',
		details: 'Your request details:',
		package: 'Package',
		eventDate: 'Event date',
		phone: 'Phone / WhatsApp',
		comments: 'Comments',
		closing: 'We look forward to making your event unforgettable.',
		team: 'The Malaga Event Gear team',
	},
	es: {
		subject: (name: string) => `¡Recibimos tu solicitud, ${name}!`,
		greeting: (name: string) => `Hola ${name},`,
		body: 'Gracias por contactar a Malaga Event Gear. Recibimos tu solicitud y nos pondremos en contacto contigo dentro de las próximas 24 horas.',
		details: 'Detalles de tu solicitud:',
		package: 'Paquete',
		eventDate: 'Fecha del evento',
		phone: 'Teléfono / WhatsApp',
		comments: 'Comentarios',
		closing: 'Esperamos hacer tu evento inolvidable.',
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

export function renderConfirmation(lead: LeadData, lang: 'en' | 'es' = 'es'): EmailTemplate {
	const t = copy[lang] ?? copy.es;
	const subject = t.subject(lead.name);

	const rows: string[] = [
		`<tr><td style="padding:4px 8px;color:#6b7280;">${t.package}</td><td style="padding:4px 8px;">${escapeHtml(lead.packageId)}</td></tr>`,
		lead.eventDate
			? `<tr><td style="padding:4px 8px;color:#6b7280;">${t.eventDate}</td><td style="padding:4px 8px;">${escapeHtml(lead.eventDate)}</td></tr>`
			: '',
		lead.phone
			? `<tr><td style="padding:4px 8px;color:#6b7280;">${t.phone}</td><td style="padding:4px 8px;">${escapeHtml(lead.phone)}</td></tr>`
			: '',
		lead.email
			? `<tr><td style="padding:4px 8px;color:#6b7280;">Email</td><td style="padding:4px 8px;">${escapeHtml(lead.email)}</td></tr>`
			: '',
		lead.comments
			? `<tr><td style="padding:4px 8px;color:#6b7280;">${t.comments}</td><td style="padding:4px 8px;">${escapeHtml(lead.comments)}</td></tr>`
			: '',
	].filter(Boolean);

	const html = `<!DOCTYPE html>
<html lang="${lang}">
<head><meta charset="UTF-8"><title>${escapeHtml(subject)}</title></head>
<body style="font-family:system-ui,sans-serif;background:#f9fafb;padding:32px;">
  <div style="max-width:560px;margin:0 auto;background:#fff;border-radius:8px;padding:32px;box-shadow:0 1px 3px rgba(0,0,0,.1);">
    <h1 style="font-size:22px;color:#111827;margin-bottom:8px;">${escapeHtml(t.greeting(lead.name))}</h1>
    <p style="color:#374151;line-height:1.6;">${t.body}</p>
    <h2 style="font-size:16px;color:#111827;margin-top:24px;">${t.details}</h2>
    <table style="width:100%;border-collapse:collapse;font-size:14px;">
      ${rows.join('\n      ')}
    </table>
    <p style="color:#374151;margin-top:24px;line-height:1.6;">${t.closing}</p>
    <p style="color:#6b7280;font-size:13px;margin-top:16px;">${t.team}</p>
  </div>
</body>
</html>`;

	const text = [
		t.greeting(lead.name),
		'',
		t.body,
		'',
		t.details,
		`${t.package}: ${lead.packageId}`,
		lead.eventDate ? `${t.eventDate}: ${lead.eventDate}` : '',
		lead.phone ? `${t.phone}: ${lead.phone}` : '',
		`Email: ${lead.email}`,
		lead.comments ? `${t.comments}: ${lead.comments}` : '',
		'',
		t.closing,
		t.team,
	]
		.filter((line) => line !== null && line !== undefined)
		.join('\n');

	return { subject, html, text };
}
