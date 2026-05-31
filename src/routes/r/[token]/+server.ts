/**
 * GET /r/[token] — tracked review-request redirect.
 *
 * If the token is found and not yet clicked:
 *   1. SET clicked_at = now on the review_request row
 *   2. INSERT lead_events(step='review_clicked')
 * Always 302 → GMB review URL (from site.ts), even for unknown/already-clicked tokens.
 * This ensures the user's path to leaving a review is NEVER broken.
 *
 * prerender = false (dynamic server handler).
 */
import type { RequestHandler } from './$types';
import { siteConfig } from '$lib/data/site';

export const prerender = false;

const GMB_URL = siteConfig.socials[1]; // 'https://g.page/r/Cc8g7neiciATEBM/review'

export const GET: RequestHandler = async ({ params, platform }) => {
	const { token } = params;
	const db = platform?.env?.DB;

	if (db && token) {
		try {
			// Look up the review_request by token
			const row = await db
				.prepare(
					`SELECT id, lead_id, clicked_at FROM review_requests WHERE token = ? LIMIT 1`,
				)
				.bind(token)
				.first<{ id: string; lead_id: string; clicked_at: string | null }>();

			if (row && row.clicked_at === null) {
				const now = new Date().toISOString();

				// Mark clicked
				await db
					.prepare(`UPDATE review_requests SET clicked_at = ? WHERE id = ?`)
					.bind(now, row.id)
					.run();

				// Record event
				await db
					.prepare(
						`INSERT INTO lead_events (id, lead_id, step, meta, created_at)
             VALUES (?, ?, 'review_clicked', NULL, ?)`,
					)
					.bind(crypto.randomUUID(), row.lead_id, now)
					.run();
			}
		} catch (err) {
			// Non-fatal: log but still redirect — never block the user
			console.error('[/r/[token]] DB error:', err);
		}
	}

	// Always redirect to GMB review page
	return new Response(null, {
		status: 302,
		headers: { Location: GMB_URL },
	});
};
