/**
 * Thin Resend REST wrapper — Workers-safe, no SDK.
 * Uses fetch directly to POST https://api.resend.com/emails.
 *
 * The `fetchFn` parameter allows injecting a mock in tests.
 * In production, pass the global `fetch` (or omit — it defaults to globalThis.fetch).
 */

export interface EmailPayload {
	to: string | string[];
	subject: string;
	html: string;
	text?: string;
	from?: string;
}

export interface SendEmailResult {
	id: string;
}

export class ResendError extends Error {
	constructor(
		public status: number,
		message: string,
	) {
		super(`Resend error ${status}: ${message}`);
		this.name = 'ResendError';
	}
}

export async function sendEmail(
	payload: EmailPayload,
	apiKey: string,
	from: string,
	fetchFn: typeof fetch = globalThis.fetch,
): Promise<SendEmailResult> {
	const body = JSON.stringify({
		from: payload.from ?? from,
		to: payload.to,
		subject: payload.subject,
		html: payload.html,
		text: payload.text,
	});

	const response = await fetchFn('https://api.resend.com/emails', {
		method: 'POST',
		headers: {
			Authorization: `Bearer ${apiKey}`,
			'Content-Type': 'application/json',
		},
		body,
	});

	if (!response.ok) {
		let message = 'Unknown error';
		try {
			const data = (await response.json()) as { message?: string };
			message = data.message ?? message;
		} catch {
			// ignore parse error
		}
		throw new ResendError(response.status, message);
	}

	const data = (await response.json()) as { id: string };
	return { id: data.id };
}
