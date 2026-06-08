/**
 * Unit tests for the retry/backoff logic in r2-uploader.ts.
 * TDD Phase 8 — written RED before implementation.
 *
 * We test uploadWithRetry by injecting a mock spawn function and a mock sleep
 * function, so no real Bun.spawn or wrangler calls happen.
 */
import { describe, it, expect, vi } from 'vitest';
import { uploadWithRetry } from './r2-uploader';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** A mock spawn fn that always succeeds (exit code 0). */
function makeSuccessSpawn() {
	return vi.fn().mockResolvedValue({ exitCode: 0 });
}

/** A mock spawn fn that always fails (non-zero exit code). */
function makeFailSpawn(exitCode = 1) {
	return vi.fn().mockResolvedValue({ exitCode, stderr: 'wrangler error' });
}

/**
 * A mock spawn fn that fails the first N times, then succeeds.
 */
function makeFlakeySpawn(failCount: number) {
	let calls = 0;
	return vi.fn().mockImplementation(async () => {
		calls++;
		if (calls <= failCount) {
			return { exitCode: 1, stderr: `transient error (attempt ${calls})` };
		}
		return { exitCode: 0 };
	});
}

/** A no-op sleep function (no real waiting in tests). */
const noopSleep = vi.fn().mockResolvedValue(undefined);

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe('uploadWithRetry', () => {
	it('succeeds on the first attempt without retrying', async () => {
		const spawn = makeSuccessSpawn();
		const sleep = noopSleep;

		await expect(
			uploadWithRetry('blog/42/photo.webp', '/tmp/photo.webp', spawn, sleep)
		).resolves.not.toThrow();

		expect(spawn).toHaveBeenCalledTimes(1);
		expect(sleep).not.toHaveBeenCalled();
	});

	it('retries after a transient failure and succeeds on the second attempt', async () => {
		const spawn = makeFlakeySpawn(1); // fails once, then succeeds
		const sleep = vi.fn().mockResolvedValue(undefined);

		await expect(
			uploadWithRetry('blog/42/photo.webp', '/tmp/photo.webp', spawn, sleep)
		).resolves.not.toThrow();

		expect(spawn).toHaveBeenCalledTimes(2);
		expect(sleep).toHaveBeenCalledTimes(1); // one backoff sleep between attempts
	});

	it('retries up to 3 attempts total before throwing', async () => {
		const spawn = makeFailSpawn();
		const sleep = vi.fn().mockResolvedValue(undefined);

		await expect(
			uploadWithRetry('blog/42/photo.webp', '/tmp/photo.webp', spawn, sleep)
		).rejects.toThrow();

		expect(spawn).toHaveBeenCalledTimes(3); // max 3 attempts
		expect(sleep).toHaveBeenCalledTimes(2); // sleeps between attempts 1→2 and 2→3
	});

	it('uses exponential backoff: first sleep ≥ 1000ms, second sleep ≥ 2000ms', async () => {
		const spawn = makeFailSpawn();
		const sleepDelays: number[] = [];
		const sleep = vi.fn().mockImplementation(async (ms: number) => {
			sleepDelays.push(ms);
		});

		await expect(
			uploadWithRetry('blog/42/photo.webp', '/tmp/photo.webp', spawn, sleep)
		).rejects.toThrow();

		expect(sleepDelays.length).toBe(2);
		expect(sleepDelays[0]).toBeGreaterThanOrEqual(1000);
		expect(sleepDelays[1]).toBeGreaterThanOrEqual(2000);
	});

	it('error message includes the r2Key for context', async () => {
		const spawn = makeFailSpawn();
		const sleep = vi.fn().mockResolvedValue(undefined);

		await expect(
			uploadWithRetry('blog/77/banner.jpg', '/tmp/banner.jpg', spawn, sleep)
		).rejects.toThrow('blog/77/banner.jpg');
	});

	it('succeeds on the third attempt (two prior failures)', async () => {
		const spawn = makeFlakeySpawn(2); // fails twice, succeeds on third
		const sleep = vi.fn().mockResolvedValue(undefined);

		await expect(
			uploadWithRetry('blog/42/photo.webp', '/tmp/photo.webp', spawn, sleep)
		).resolves.not.toThrow();

		expect(spawn).toHaveBeenCalledTimes(3);
		expect(sleep).toHaveBeenCalledTimes(2);
	});
});
