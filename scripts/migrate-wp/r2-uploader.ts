/**
 * R2 uploader — wraps `wrangler r2 object put` via Bun.spawn.
 *
 * IMPORTANT: upload execution is guarded by `dryRun` flag.
 * In dry-run mode, the command is logged but NOT executed.
 * This prevents any writes to production R2 during testing.
 *
 * Design §4 — Cross-account auth:
 *   CLOUDFLARE_ACCOUNT_ID must be set to cc26ab18f887fb1c63c19e17a0bb313f
 *   for the wrangler command to target the correct account.
 *
 * Idempotency: the caller checks manifest before calling upload.
 * If the wpId is already in manifest, skip the call entirely.
 * Wrangler `put` is also idempotent (overwrites existing key).
 *
 * Retry / backoff (Phase 8):
 *   uploadWithRetry wraps a spawn call with up to 3 attempts and exponential
 *   backoff (1s, 2s, 4s). The spawn and sleep functions are injectable for
 *   testability. uploadToR2 uses this internally.
 */

const R2_BUCKET = 'images';
const CDN_BASE = 'https://cdn.malagaeventgear.com';
const CF_ACCOUNT_ID = 'cc26ab18f887fb1c63c19e17a0bb313f';

export interface UploadResult {
	r2Key: string;
	r2Url: string;
	cdnUrl: string;
	skipped: boolean;
}

/**
 * Builds the wrangler command array for uploading a file to R2.
 * Pure function — no side effects — unit testable.
 */
export function buildWranglerCommand(r2Key: string, tempFilePath: string): string[] {
	return [
		'bunx',
		'wrangler',
		'r2',
		'object',
		'put',
		`${R2_BUCKET}/${r2Key}`,
		'--file',
		tempFilePath,
		'--remote',
	];
}

/**
 * Returns the CDN URL for a given R2 key.
 */
export function buildCdnUrl(r2Key: string): string {
	return `${CDN_BASE}/${r2Key}`;
}

// ---------------------------------------------------------------------------
// Retry / backoff helpers
// ---------------------------------------------------------------------------

/** Maximum number of upload attempts before giving up. */
const MAX_ATTEMPTS = 3;

/** Base delay in ms for exponential backoff (attempt 1 → 1s, attempt 2 → 2s, …). */
const BASE_DELAY_MS = 1000;

/**
 * Spawn result interface for testability.
 * The real Bun.spawn process implements this via proc.exited + proc.stderr.
 */
export interface SpawnResult {
	exitCode: number;
	stderr?: string | AsyncIterable<Uint8Array> | ReadableStream<Uint8Array>;
}

/**
 * Injectable spawn function type.
 * In production: wraps Bun.spawn.
 * In tests: a mock returning { exitCode, stderr }.
 */
export type SpawnFn = (cmd: string[]) => Promise<SpawnResult>;

/**
 * Injectable sleep function type.
 * In production: Bun.sleep (or a Promise timeout).
 * In tests: a no-op mock.
 */
export type SleepFn = (ms: number) => Promise<void>;

/**
 * Uploads a file to R2 with up to MAX_ATTEMPTS attempts and exponential backoff.
 * On every failed attempt, sleeps for BASE_DELAY_MS * 2^(attempt-1) before retrying.
 * Throws on final failure with the r2Key in the error message for context.
 *
 * Pure logic — injectable spawn and sleep allow unit testing without real I/O.
 *
 * @param r2Key       The R2 object key (used in the wrangler command)
 * @param filePath    Absolute path to the local file
 * @param spawnFn     Inject a spawn implementation (defaults to real Bun.spawn wrapper)
 * @param sleepFn     Inject a sleep implementation (defaults to real Bun.sleep)
 */
export async function uploadWithRetry(
	r2Key: string,
	filePath: string,
	spawnFn: SpawnFn,
	sleepFn: SleepFn
): Promise<void> {
	let lastError = '';

	for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt++) {
		const cmd = buildWranglerCommand(r2Key, filePath);
		const result = await spawnFn(cmd);

		if (result.exitCode === 0) {
			return; // success
		}

		// Capture stderr text for error context
		if (typeof result.stderr === 'string') {
			lastError = result.stderr;
		} else if (result.stderr) {
			try {
				lastError = await new Response(result.stderr as ReadableStream).text();
			} catch {
				lastError = '(stderr unreadable)';
			}
		}

		if (attempt < MAX_ATTEMPTS) {
			const delay = BASE_DELAY_MS * Math.pow(2, attempt - 1);
			console.warn(
				`[r2-uploader] Upload failed for ${r2Key} (attempt ${attempt}/${MAX_ATTEMPTS}). ` +
					`Retrying in ${delay}ms...`
			);
			await sleepFn(delay);
		}
	}

	throw new Error(
		`[r2-uploader] Upload failed after ${MAX_ATTEMPTS} attempts for ${r2Key}:\n${lastError}`
	);
}

// ---------------------------------------------------------------------------
// Real Bun spawn/sleep implementations
// ---------------------------------------------------------------------------

/**
 * Real spawn wrapper for production use.
 * Injects CLOUDFLARE_ACCOUNT_ID into the child process environment.
 */
async function realSpawn(cmd: string[]): Promise<SpawnResult> {
	const proc = Bun.spawn(cmd, {
		env: {
			...process.env,
			CLOUDFLARE_ACCOUNT_ID: CF_ACCOUNT_ID,
		},
		stdout: 'pipe',
		stderr: 'pipe',
	});
	const exitCode = await proc.exited;
	return { exitCode, stderr: proc.stderr };
}

/** Real sleep implementation using Bun's built-in sleep. */
async function realSleep(ms: number): Promise<void> {
	await Bun.sleep(ms);
}

// ---------------------------------------------------------------------------
// Public upload API
// ---------------------------------------------------------------------------

/**
 * Uploads a file to R2 using wrangler CLI via Bun.spawn.
 *
 * @param r2Key - The R2 object key (e.g. "42/venue-main.jpg")
 * @param tempFilePath - Absolute path to the local temp file
 * @param dryRun - If true, log the command but do NOT execute it
 * @returns UploadResult with r2Key, r2Url, cdnUrl
 *
 * GUARD: when dryRun=true, returns a simulated result without executing wrangler.
 * This ensures no writes to production during testing or planning runs.
 */
export async function uploadToR2(
	r2Key: string,
	tempFilePath: string,
	dryRun: boolean
): Promise<UploadResult> {
	const cdnUrl = buildCdnUrl(r2Key);
	const r2Url = cdnUrl; // r2Url and cdnUrl are the same — CDN domain is canonical

	if (dryRun) {
		const cmd = buildWranglerCommand(r2Key, tempFilePath);
		console.log(`[r2-uploader] DRY-RUN — would execute: ${cmd.join(' ')}`);
		return { r2Key, r2Url, cdnUrl, skipped: true };
	}

	console.log(`[r2-uploader] Uploading to R2: ${R2_BUCKET}/${r2Key}`);

	await uploadWithRetry(r2Key, tempFilePath, realSpawn, realSleep);

	console.log(`[r2-uploader] Uploaded: ${cdnUrl}`);
	return { r2Key, r2Url, cdnUrl, skipped: false };
}
