/**
 * Cloudflare Turnstile server-side verification.
 *
 * Shared by the lead and contact endpoints. `fetchFn` is injectable for tests;
 * in production it defaults to the global fetch. Fails CLOSED (returns false)
 * on any network error so a verification outage never lets traffic through.
 */
export async function verifyTurnstile(
	token: string,
	secret: string,
	ip: string,
	fetchFn: typeof fetch = globalThis.fetch,
): Promise<boolean> {
	const formData = new FormData();
	formData.append('secret', secret);
	formData.append('response', token);
	formData.append('remoteip', ip);

	try {
		const res = await fetchFn('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
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
