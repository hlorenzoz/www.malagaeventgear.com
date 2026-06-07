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
 */

const R2_BUCKET = 'meg-blog-media';
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

	const cmd = buildWranglerCommand(r2Key, tempFilePath);
	console.log(`[r2-uploader] Uploading to R2: ${R2_BUCKET}/${r2Key}`);

	// Bun.spawn is used instead of exec to avoid TTY requirements in CI.
	// CLOUDFLARE_ACCOUNT_ID env var overrides the wrangler login account.
	const proc = Bun.spawn(cmd, {
		env: {
			...process.env,
			CLOUDFLARE_ACCOUNT_ID: CF_ACCOUNT_ID,
		},
		stdout: 'pipe',
		stderr: 'pipe',
	});

	const exitCode = await proc.exited;
	if (exitCode !== 0) {
		const stderr = await new Response(proc.stderr).text();
		throw new Error(
			`[r2-uploader] wrangler upload failed for ${r2Key} (exit ${exitCode}):\n${stderr}`
		);
	}

	console.log(`[r2-uploader] Uploaded: ${cdnUrl}`);
	return { r2Key, r2Url, cdnUrl, skipped: false };
}
