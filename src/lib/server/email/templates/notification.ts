/**
 * Internal notification email template — sent to MEG team on new lead.
 * Fixed to English (internal use). Pure function, unit-testable with Vitest.
 */

import type { LeadData } from './confirmation';

interface EmailTemplate {
	subject: string;
	html: string;
	text: string;
}

function escapeHtml(s: string): string {
	return s
		.replace(/&/g, '&amp;')
		.replace(/</g, '&lt;')
		.replace(/>/g, '&gt;')
		.replace(/"/g, '&quot;');
}

export function renderNotification(lead: LeadData): EmailTemplate {
	const subject = `New lead: ${lead.name} — ${lead.packageId}`;

	const rows = [
		['Package', lead.packageId],
		['Name', lead.name],
		['Email', lead.email],
		lead.phone ? ['Phone / WhatsApp', lead.phone] : null,
		lead.eventDate ? ['Event Date', lead.eventDate] : null,
		lead.comments ? ['Comments', lead.comments] : null,
	].filter(Boolean) as [string, string][];

	const tableRows = rows
		.map(
			([label, value]) =>
				`<tr>
      <td style="padding:6px 12px;background:#f3f4f6;font-weight:600;white-space:nowrap;">${escapeHtml(label)}</td>
      <td style="padding:6px 12px;">${escapeHtml(value)}</td>
    </tr>`,
		)
		.join('\n');

	const html = `<!DOCTYPE html>
<html lang="en">
<head><meta charset="UTF-8"><title>${escapeHtml(subject)}</title></head>
<body style="font-family:system-ui,sans-serif;background:#f9fafb;padding:32px;">
  <div style="max-width:600px;margin:0 auto;background:#fff;border-radius:8px;padding:32px;box-shadow:0 1px 3px rgba(0,0,0,.1);">
    <h1 style="font-size:20px;color:#111827;margin-bottom:4px;">New Lead Received</h1>
    <p style="color:#6b7280;font-size:13px;margin-top:0;">Malaga Event Gear CRM — automated notification</p>
    <table style="width:100%;border-collapse:collapse;font-size:14px;margin-top:16px;">
      ${tableRows}
    </table>
    <p style="font-size:12px;color:#9ca3af;margin-top:24px;">This is an automated internal notification. Do not reply to this email.</p>
  </div>
</body>
</html>`;

	const textRows = rows.map(([label, value]) => `${label}: ${value}`).join('\n');
	const text = `New Lead Received\n\n${textRows}\n\n---\nAutomated notification from Malaga Event Gear CRM.`;

	return { subject, html, text };
}
