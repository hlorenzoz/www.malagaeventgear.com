import { describe, expect, it, vi } from 'vitest';
import { verifyTurnstile } from './turnstile';

const SITEVERIFY_URL = 'https://challenges.cloudflare.com/turnstile/v0/siteverify';

describe('verifyTurnstile', () => {
	it('returns true when Cloudflare reports success', async () => {
		const fetchFn = vi.fn().mockResolvedValue({
			json: async () => ({ success: true }),
		}) as unknown as typeof fetch;

		const ok = await verifyTurnstile('token', 'secret', '1.2.3.4', fetchFn);

		expect(ok).toBe(true);
		expect(fetchFn).toHaveBeenCalledWith(SITEVERIFY_URL, expect.objectContaining({ method: 'POST' }));
	});

	it('returns false when Cloudflare reports failure', async () => {
		const fetchFn = vi.fn().mockResolvedValue({
			json: async () => ({ success: false }),
		}) as unknown as typeof fetch;

		const ok = await verifyTurnstile('token', 'secret', '1.2.3.4', fetchFn);

		expect(ok).toBe(false);
	});

	it('fails closed (false) on a network error', async () => {
		const fetchFn = vi.fn().mockRejectedValue(new Error('network down')) as unknown as typeof fetch;

		const ok = await verifyTurnstile('token', 'secret', '1.2.3.4', fetchFn);

		expect(ok).toBe(false);
	});
});
