import { describe, it, expect, vi } from 'vitest';
import { isRetryableStatus, fetchWithRetry } from './downloader';

const noSleep = async () => {};

describe('isRetryableStatus', () => {
	it('treats Cloudflare origin 522 as retryable', () => {
		expect(isRetryableStatus(522)).toBe(true);
	});

	it('treats 5xx + 408 + 429 as retryable', () => {
		for (const s of [500, 502, 503, 504, 520, 524, 408, 429]) {
			expect(isRetryableStatus(s)).toBe(true);
		}
	});

	it('treats 4xx (except 408/429) as definitive — not retryable', () => {
		for (const s of [400, 401, 403, 404, 410]) {
			expect(isRetryableStatus(s)).toBe(false);
		}
	});
});

describe('fetchWithRetry', () => {
	it('returns immediately on first success without sleeping', async () => {
		const fetchFn = vi.fn().mockResolvedValue(new Response('ok', { status: 200 }));
		const sleepFn = vi.fn(noSleep);

		const res = await fetchWithRetry('http://x/img.jpg', fetchFn, sleepFn);

		expect(res.status).toBe(200);
		expect(fetchFn).toHaveBeenCalledTimes(1);
		expect(sleepFn).not.toHaveBeenCalled();
	});

	it('retries a transient 522 then succeeds', async () => {
		const fetchFn = vi
			.fn()
			.mockResolvedValueOnce(new Response(null, { status: 522 }))
			.mockResolvedValueOnce(new Response('ok', { status: 200 }));
		const sleepFn = vi.fn(noSleep);

		const res = await fetchWithRetry('http://x/img.jpg', fetchFn, sleepFn);

		expect(res.status).toBe(200);
		expect(fetchFn).toHaveBeenCalledTimes(2);
		expect(sleepFn).toHaveBeenCalledTimes(1);
	});

	it('retries network errors (fetch throws) then succeeds', async () => {
		const fetchFn = vi
			.fn()
			.mockRejectedValueOnce(new Error('ECONNRESET'))
			.mockResolvedValueOnce(new Response('ok', { status: 200 }));
		const sleepFn = vi.fn(noSleep);

		const res = await fetchWithRetry('http://x/img.jpg', fetchFn, sleepFn);

		expect(res.status).toBe(200);
		expect(fetchFn).toHaveBeenCalledTimes(2);
	});

	it('fails fast on a definitive 404 (no retry)', async () => {
		const fetchFn = vi.fn().mockResolvedValue(new Response(null, { status: 404 }));
		const sleepFn = vi.fn(noSleep);

		await expect(fetchWithRetry('http://x/img.jpg', fetchFn, sleepFn)).rejects.toThrow(/404/);
		expect(fetchFn).toHaveBeenCalledTimes(1);
		expect(sleepFn).not.toHaveBeenCalled();
	});

	it('throws after 3 transient failures (2 backoffs)', async () => {
		const fetchFn = vi.fn().mockResolvedValue(new Response(null, { status: 522 }));
		const sleepFn = vi.fn(noSleep);

		await expect(fetchWithRetry('http://x/img.jpg', fetchFn, sleepFn)).rejects.toThrow(
			/after 3 attempts/
		);
		expect(fetchFn).toHaveBeenCalledTimes(3);
		expect(sleepFn).toHaveBeenCalledTimes(2);
	});
});
