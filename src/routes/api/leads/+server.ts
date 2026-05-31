import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { getDB } from '$lib/server/db/client';
import { countRecentLeadsByIP } from '$lib/server/db/queries';
import { LeadInputSchema } from '$lib/server/leads/schema';
import { submitLead } from '$lib/server/leads/service';

// This route handles dynamic POST requests — must NOT be prerendered
export const prerender = false;

// Rate-limit config: max 5 submissions per IP per 15 minutes
const RATE_LIMIT_MAX = 5;
const RATE_LIMIT_WINDOW_SECS = 15 * 60;

async function verifyTurnstile(token: string, secret: string, ip: string): Promise<boolean> {
	const formData = new FormData();
	formData.append('secret', secret);
	formData.append('response', token);
	formData.append('remoteip', ip);

	try {
		const res = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
			method: 'POST',
			body: formData,
		});
		const data = (await res.json()) as { success: boolean };
		return data.success === true;
	} catch {
		// Network error during siteverify — fail closed
		return false;
	}
}

export const POST: RequestHandler = async ({ request, platform }) => {
	try {
		// Parse request body
		let body: unknown;
		try {
			body = await request.json();
		} catch {
			return json({ ok: false, error: 'invalid-json' }, { status: 400 });
		}

		// 1. Zod validation
		const parseResult = LeadInputSchema.safeParse(body);
		if (!parseResult.success) {
			return json(
				{ ok: false, error: 'validation-failed', issues: parseResult.error.issues },
				{ status: 422 },
			);
		}

		const input = parseResult.data;

		// 2. Honeypot — silent discard (200 to not reveal detection)
		if (input.website) {
			return json({ ok: true, leadId: 'bot' }, { status: 200 });
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

		// 5. Detect lang from Accept-Language header (simple, good enough)
		const acceptLang = request.headers.get('Accept-Language') ?? 'es';
		const lang = acceptLang.toLowerCase().startsWith('es') ? 'es' : 'en';

		// 6. Submit lead (insert to D1) + email lifecycle
		const { leadId } = await submitLead(db, input, lang, ip, platform?.env);

		return json({ ok: true, leadId }, { status: 201 });
	} catch (err) {
		// Log without leaking details to client
		console.error('[/api/leads] Unexpected error:', err);
		return json({ ok: false, error: 'internal' }, { status: 500 });
	}
};
