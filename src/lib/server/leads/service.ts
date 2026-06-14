import { insertEmailMessage, insertLead, insertLeadEvent, insertReviewRequest } from '$lib/server/db/queries';
import { sendEmail } from '$lib/server/email/resend';
import { renderConfirmation } from '$lib/server/email/templates/confirmation';
import { renderNotification } from '$lib/server/email/templates/notification';
import { resolveRecipients } from '$lib/server/leads/recipients';
import type { LeadInput } from './schema';

export interface SubmitLeadResult {
	leadId: string;
}

/**
 * Orchestrates lead persistence + email lifecycle:
 * 1. Insert lead row
 * 2. Insert lead_event(step='submitted') with IP in meta JSON
 * 3. Insert review_request (next_send_at = event_date + 1 day)
 * 4. Send confirmation email to lead — failure writes status='failed', does NOT roll back lead
 * 5. Resolve recipients → send internal notification — failure same policy
 * 6. Write email_messages + lead_events(step='email_sent') for each send attempt
 *
 * REQ-38: Lead insert is NEVER rolled back on email failure.
 */
export async function submitLead(
	db: D1Database,
	input: LeadInput,
	lang: string,
	ip: string,
	env?: App.Platform['env'],
): Promise<SubmitLeadResult> {
	// 1. Insert lead
	const leadId = await insertLead(db, {
		package_slug: input.packageId,
		name: input.name,
		email: input.email,
		phone: input.phone || null,
		event_date: input.eventDate || null,
		message: input.comments || null,
		lang,
		status: 'new',
	});

	// 2. Audit event: form_received with IP for rate-limit tracking
	await insertLeadEvent(db, {
		lead_id: leadId,
		step: 'submitted',
		meta: JSON.stringify({ ip, packageId: input.packageId }),
	});

	// 3. Create review_request (fires D+1 after event date)
	if (input.eventDate) {
		const eventDate = new Date(input.eventDate);
		eventDate.setDate(eventDate.getDate() + 1);
		const nextSendAt = eventDate.toISOString();

		await insertReviewRequest(db, {
			lead_id: leadId,
			event_date: input.eventDate,
			next_send_at: nextSendAt,
		});
	}

	// 4–6. Email lifecycle — failures are logged but do NOT abort the response.
	// Missing config must fail LOUDLY: a silent skip here is invisible in prod
	// (lead is created, but no email is ever sent — the Resend secret incident).
	const missingConfig: string[] = [];
	if (!env?.RESEND_API_KEY) missingConfig.push('RESEND_API_KEY');
	if (!env?.RESEND_FROM) missingConfig.push('RESEND_FROM');
	if (missingConfig.length > 0) {
		console.error(
			`[service] Email lifecycle SKIPPED for lead ${leadId} — missing config: ${missingConfig.join(', ')}. ` +
				`No confirmation/notification email was sent. Set the missing Worker secret(s) via 'wrangler secret put'.`,
		);
	}

	if (env?.RESEND_API_KEY && env?.RESEND_FROM) {
		const apiKey = env.RESEND_API_KEY;
		const from = env.RESEND_FROM;
		const locale = (lang === 'es' ? 'es' : 'en') as 'en' | 'es';
		const leadData = {
			name: input.name,
			email: input.email,
			phone: input.phone || null,
			eventDate: input.eventDate || null,
			packageId: input.packageId,
			comments: input.comments || null,
		};

		// 4a. Confirmation email → lead
		let confirmResendId: string | null = null;
		let confirmStatus: 'sent' | 'failed' = 'failed';
		try {
			const template = renderConfirmation(leadData, locale);
			const result = await sendEmail(
				{ to: input.email, subject: template.subject, html: template.html, text: template.text },
				apiKey,
				from,
			);
			confirmResendId = result.id;
			confirmStatus = 'sent';
		} catch (err) {
			console.error('[service] Confirmation email failed:', err);
		}

		await insertEmailMessage(db, {
			lead_id: leadId,
			kind: 'confirmation',
			resend_id: confirmResendId,
			status: confirmStatus,
		});

		if (confirmStatus === 'sent') {
			await insertLeadEvent(db, { lead_id: leadId, step: 'email_sent', meta: JSON.stringify({ kind: 'confirmation' }) });
		}

		// 4b. Notification email → internal recipients
		const recipients = await resolveRecipients(
			db,
			input.packageId,
			env.LEAD_NOTIFY_EMAILS ?? '',
		);

		if (recipients.length > 0) {
			let notifyResendId: string | null = null;
			let notifyStatus: 'sent' | 'failed' = 'failed';
			try {
				const template = renderNotification(leadData);
				const result = await sendEmail(
					{ to: recipients, subject: template.subject, html: template.html, text: template.text },
					apiKey,
					from,
				);
				notifyResendId = result.id;
				notifyStatus = 'sent';
			} catch (err) {
				console.error('[service] Notification email failed:', err);
			}

			await insertEmailMessage(db, {
				lead_id: leadId,
				kind: 'notification',
				resend_id: notifyResendId,
				status: notifyStatus,
			});

			if (notifyStatus === 'sent') {
				await insertLeadEvent(db, { lead_id: leadId, step: 'email_sent', meta: JSON.stringify({ kind: 'notification' }) });
			}
		} else {
			console.warn('[service] No notification recipients found — skipping notification email');
		}
	}

	return { leadId };
}
