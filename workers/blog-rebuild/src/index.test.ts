/**
 * Unit tests for workers/blog-rebuild/src/index.ts
 *
 * SC-CRON-01: 2xx response logs success and does not throw
 * SC-CRON-02: non-2xx response throws Error including the status code
 * SC-CRON-03: DEPLOY_HOOK_URL missing/undefined → handler throws (W-02 verify gap)
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { triggerDeploy } from './index';

describe('triggerDeploy', () => {
	beforeEach(() => {
		vi.stubGlobal('fetch', vi.fn());
		vi.spyOn(console, 'log').mockImplementation(() => {});
		vi.spyOn(console, 'error').mockImplementation(() => {});
	});

	afterEach(() => {
		vi.restoreAllMocks();
	});

	// SC-CRON-01: Successful POST logs success and does not throw
	it('logs success on 2xx response and does not throw', async () => {
		const mockFetch = vi.fn().mockResolvedValue({
			ok: true,
			status: 200,
			statusText: 'OK',
			text: () => Promise.resolve(''),
		});
		vi.stubGlobal('fetch', mockFetch);

		await expect(triggerDeploy('https://hooks.example.com/deploy')).resolves.toBeUndefined();

		expect(mockFetch).toHaveBeenCalledOnce();
		expect(mockFetch).toHaveBeenCalledWith('https://hooks.example.com/deploy', { method: 'POST' });
		expect(console.log).toHaveBeenCalledWith(
			expect.stringContaining('[blog-rebuild]'),
			expect.anything(),
		);
	});

	it('logs success with the actual status code on 2xx', async () => {
		const mockFetch = vi.fn().mockResolvedValue({
			ok: true,
			status: 201,
			statusText: 'Created',
			text: () => Promise.resolve(''),
		});
		vi.stubGlobal('fetch', mockFetch);

		await triggerDeploy('https://hooks.example.com/deploy');

		// The log must include the status code (201)
		expect(console.log).toHaveBeenCalledWith(
			expect.stringContaining('[blog-rebuild]'),
			201,
		);
	});

	// SC-CRON-02: Non-2xx response throws Error including the status code
	it('throws an Error on non-2xx response', async () => {
		const mockFetch = vi.fn().mockResolvedValue({
			ok: false,
			status: 500,
			statusText: 'Internal Server Error',
			text: () => Promise.resolve('Server Error'),
		});
		vi.stubGlobal('fetch', mockFetch);

		await expect(triggerDeploy('https://hooks.example.com/deploy')).rejects.toThrow(Error);
	});

	it('includes the status code in the thrown error message on non-2xx', async () => {
		const mockFetch = vi.fn().mockResolvedValue({
			ok: false,
			status: 503,
			statusText: 'Service Unavailable',
			text: () => Promise.resolve('Unavailable'),
		});
		vi.stubGlobal('fetch', mockFetch);

		await expect(triggerDeploy('https://hooks.example.com/deploy')).rejects.toThrow('503');
	});

	it('throws an Error (not a string or other type) on non-2xx', async () => {
		const mockFetch = vi.fn().mockResolvedValue({
			ok: false,
			status: 422,
			statusText: 'Unprocessable Entity',
			text: () => Promise.resolve(''),
		});
		vi.stubGlobal('fetch', mockFetch);

		let thrown: unknown;
		try {
			await triggerDeploy('https://hooks.example.com/deploy');
		} catch (err) {
			thrown = err;
		}
		expect(thrown).toBeInstanceOf(Error);
	});

	// SC-CRON-03: DEPLOY_HOOK_URL missing or undefined (W-02 verify gap)
	// When the Cloudflare secret is not set, env.DEPLOY_HOOK_URL is undefined at runtime.
	// triggerDeploy must reject (not silently succeed) so the Worker platform records failure.
	it('throws when DEPLOY_HOOK_URL is undefined (missing secret)', async () => {
		// Simulate undefined being passed — as happens when the env secret is not configured.
		// fetch(undefined) throws a TypeError natively; triggerDeploy must propagate it.
		const mockFetch = vi.fn().mockRejectedValue(new TypeError('Failed to parse URL from undefined'));
		vi.stubGlobal('fetch', mockFetch);

		await expect(
			triggerDeploy(undefined as unknown as string)
		).rejects.toThrow();
	});

	it('does NOT silently swallow errors from fetch when URL is invalid', async () => {
		const mockFetch = vi.fn().mockRejectedValue(new TypeError('Invalid URL'));
		vi.stubGlobal('fetch', mockFetch);

		let thrown: unknown;
		try {
			await triggerDeploy('not-a-valid-url');
		} catch (err) {
			thrown = err;
		}
		// Must have thrown — never resolves undefined
		expect(thrown).toBeDefined();
	});
});
