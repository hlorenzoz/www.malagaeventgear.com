import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { getDB } from '$lib/server/db/client';
import { countRecentLeadsByIP } from '$lib/server/db/queries';
import { ContactInputSchema } from '$lib/server/leads/schema';
import { submitLead } from '$lib/server/leads/service';
import { verifyTurnstile } from '$lib/server/leads/turnstile';

// Dynamic POST — must NOT be prerendered
export const prerender = false;

// Rate-limit config: max 5 submissions per IP per 15 minutes (shared with /api/leads)
const RATE_LIMIT_MAX = 5;
const RATE_LIMIT_WINDOW_SECS = 15 * 60;

// Fallback package slug for general (non-package) contact inquiries.
const GENERAL_INQUIRY_SLUG = 'general-inquiry';

export const POST: RequestHandler = async ({ request, platform }) => {
	try {
		let body: unknown;
		try {
			body = await request.json();
		} catch {
			return json({ ok: false, error: 'invalid-json' }, { status: 400 });
		}

		// 1. Zod validation (lenient: name + email + message required)
		const parseResult = ContactInputSchema.safeParse(body);
		if (!parseResult.success) {
			return json(
				{ ok: false, error: 'validation-failed', issues: parseResult.error.issues },
				{ status: 422 },
			);
		}

		const input = parseResult.data;

		// 2. Honeypot — silent discard (200 to not reveal detection)
		if (input.website) {
			return json({ ok: true, leadId: 'bot', emailStatus: 'skipped' }, { status: 200 });
		}

		// 3. Turnstile siteverify (skip in dev when no secret configured)
		const turnstileSecret = platform?.env?.TURNSTILE_SECRET_KEY;
		if (turnstileSecret) {
			const ip = request.headers.get('CF-Connecting-IP') ?? '';
			const turnstileOk = await verifyTurnstile(input['cf-turnstile-response'], turnstileSecret, ip);
			if (!turnstileOk) {
				return json({ ok: false, error: 'turnstile-failed' }, { status: 422 });
			}
		}

		// 4. D1 rate-limit by CF-Connecting-IP
		const ip = request.headers.get('CF-Connecting-IP') ?? 'unknown';
		const db = getDB(platform);
		const recentCount = await countRecentLeadsByIP(db, ip, RATE_LIMIT_WINDOW_SECS);
		if (recentCount >= RATE_LIMIT_MAX) {
			return json({ ok: false, error: 'rate_limited' }, { status: 429 });
		}

		// 5. Detect lang from Accept-Language header
		const acceptLang = request.headers.get('Accept-Language') ?? 'es';
		const lang = acceptLang.toLowerCase().startsWith('es') ? 'es' : 'en';

		// 6. Map the contact payload onto the shared lead pipeline:
		//    message → comments, eventType (or fallback) → packageId.
		const { leadId, emailStatus } = await submitLead(
			db,
			{
				packageId: input.eventType || GENERAL_INQUIRY_SLUG,
				name: input.name,
				email: input.email,
				phone: input.phone,
				eventDate: input.eventDate,
				comments: input.message,
				'cf-turnstile-response': input['cf-turnstile-response'],
				website: input.website,
			},
			lang,
			ip,
			platform?.env,
		);

		return json({ ok: true, leadId, emailStatus }, { status: 201 });
	} catch (err) {
		console.error('[/api/contact] Unexpected error:', err);
		return json({ ok: false, error: 'internal' }, { status: 500 });
	}
};
