/**
 * Cloudflare Worker — Review Reminder Cron
 *
 * Trigger: daily cron at 10:00 UTC (see wrangler.toml)
 *
 * Flow (REQ-44–REQ-49):
 *  1. SELECT due review_requests (next_send_at <= now, clicked_at IS NULL, send_count < max_sends)
 *  2. For each row: apply resolveAction → if 'send': render template, send email, update DB
 *
 * Shared-code import strategy (design.md):
 *   Worker's tsconfig.json maps "$lib/*" → "../../src/lib/*".
 *   Wrangler bundles at deploy time, inlining the shared modules.
 *   All shared code uses only Web APIs (fetch, crypto) — no Node built-ins.
 */

import { resolveAction } from '$lib/server/reviews/sequence';
import { sendEmail } from '$lib/server/email/resend';
import { renderReview } from '$lib/server/email/templates/review';

interface Env {
	DB: D1Database;
	RESEND_API_KEY: string;
	RESEND_FROM: string;
	PUBLIC_SITE_URL: string;
}

interface DueReviewRow {
	id: string;
	lead_id: string;
	token: string;
	next_send_at: string;
	send_count: number;
	max_sends: number;
	clicked_at: string | null;
	// joined from leads
	lead_email: string;
	lead_name: string;
	lead_lang: string;
}

export default {
	async scheduled(_event: ScheduledEvent, env: Env, _ctx: ExecutionContext): Promise<void> {
		const now = new Date();
		const nowIso = now.toISOString();

		// 1. Query due review requests, joined with leads for email / name / lang
		const { results } = await env.DB
			.prepare(
				`SELECT
           rr.id,
           rr.lead_id,
           rr.token,
           rr.next_send_at,
           rr.send_count,
           rr.max_sends,
           rr.clicked_at,
           l.email  AS lead_email,
           l.name   AS lead_name,
           l.lang   AS lead_lang
         FROM review_requests rr
         JOIN leads l ON l.id = rr.lead_id
         WHERE rr.next_send_at < ?
           AND rr.clicked_at IS NULL
           AND rr.send_count < rr.max_sends`,
			)
			.bind(nowIso)
			.all<DueReviewRow>();

		console.log(`[review-reminders] ${results.length} due row(s) found`);

		for (const row of results) {
			const action = resolveAction(
				{
					next_send_at: row.next_send_at,
					send_count: row.send_count,
					max_sends: row.max_sends,
					clicked_at: row.clicked_at,
				},
				now,
			);

			if (action.kind !== 'send') {
				// skip or stop — should be rare since the WHERE already filtered these,
				// but resolveAction is the single source of truth.
				continue;
			}

			const trackedUrl = `${env.PUBLIC_SITE_URL}/r/${row.token}`;
			const lang = (row.lead_lang === 'en' ? 'en' : 'es') as 'en' | 'es';
			const template = renderReview(row.token, lang, env.PUBLIC_SITE_URL, row.lead_name);

			let resendId: string | null = null;
			let status: 'sent' | 'failed' = 'failed';

			try {
				const result = await sendEmail(
					{
						to: row.lead_email,
						subject: template.subject,
						html: template.html,
						text: template.text,
					},
					env.RESEND_API_KEY,
					env.RESEND_FROM,
				);
				resendId = result.id;
				status = 'sent';
				console.log(`[review-reminders] sent to ${row.lead_email} (resend_id=${resendId})`);
			} catch (err) {
				console.error(`[review-reminders] sendEmail failed for lead ${row.lead_id}:`, err);
			}

			const sentAt = new Date().toISOString();

			// Record email_messages row
			await env.DB
				.prepare(
					`INSERT INTO email_messages (id, lead_id, kind, resend_id, sent_at, status)
           VALUES (?, ?, 'review_reminder', ?, ?, ?)`,
				)
				.bind(crypto.randomUUID(), row.lead_id, resendId, sentAt, status)
				.run();

			if (status === 'sent') {
				// Record lead event
				await env.DB
					.prepare(
						`INSERT INTO lead_events (id, lead_id, step, meta, created_at)
             VALUES (?, ?, 'review_email_sent', ?, ?)`,
					)
					.bind(
						crypto.randomUUID(),
						row.lead_id,
						JSON.stringify({ token: row.token, trackedUrl }),
						sentAt,
					)
					.run();
			}

			// Advance sequence state
			await env.DB
				.prepare(
					`UPDATE review_requests
           SET send_count = send_count + 1,
               next_send_at = ?
           WHERE id = ?`,
				)
				.bind(action.next_send_at, row.id)
				.run();
		}

		console.log(`[review-reminders] done — processed ${results.length} row(s)`);
	},
};
