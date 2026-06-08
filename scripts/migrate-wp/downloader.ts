/**
 * Image downloader — fetches WP image to a temp file.
 *
 * Temp files are cleaned up after upload via the provided cleanup callback.
 * Local files must NOT accumulate on disk (spec §3).
 *
 * Retry / backoff (Phase 8.1):
 *   fetchWithRetry wraps the fetch with up to 3 attempts and exponential backoff
 *   (1s, 2s, 4s) for TRANSIENT failures (network errors, HTTP 408/429/5xx incl.
 *   Cloudflare 52x). Definitive failures (e.g. 404/403) fail fast — no retry.
 *   fetch and sleep are injectable for testability.
 */
import { writeFileSync, unlinkSync, mkdtempSync, rmdirSync } from 'fs';
import { tmpdir } from 'os';
import { join, basename } from 'path';

export interface DownloadResult {
	/** Absolute path to the downloaded temp file */
	tempPath: string;
	/** Cleanup function — call after upload to remove the temp file */
	cleanup: () => void;
	/** File size in bytes */
	fileSize: number;
	/** MIME type from the Content-Type response header */
	mimeType: string;
}

const MAX_ATTEMPTS = 3;
const BASE_DELAY_MS = 1000;

export type FetchFn = (url: string) => Promise<Response>;
export type SleepFn = (ms: number) => Promise<void>;

/**
 * Whether an HTTP status is transient and worth retrying.
 * Retryable: 408 (timeout), 429 (rate limit), and any 5xx including Cloudflare
 * origin errors (520-524). Everything else (4xx) is definitive → fail fast.
 */
export function isRetryableStatus(status: number): boolean {
	return status === 408 || status === 429 || status >= 500;
}

/**
 * Fetches a URL with retry + exponential backoff for transient failures.
 * Pure logic — injectable fetch and sleep allow unit testing without real I/O.
 */
export async function fetchWithRetry(
	url: string,
	fetchFn: FetchFn = fetch,
	sleepFn: SleepFn = (ms) => Bun.sleep(ms)
): Promise<Response> {
	let lastError = '';

	for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt++) {
		let response: Response | null = null;

		try {
			response = await fetchFn(url);
		} catch (err) {
			// Network-level failure (DNS, connection reset, etc.) — transient.
			lastError = err instanceof Error ? err.message : String(err);
		}

		if (response) {
			if (response.ok) return response;
			// Got a response but a non-OK status.
			if (!isRetryableStatus(response.status)) {
				throw new Error(
					`[downloader] Failed to download ${url}: ${response.status} ${response.statusText}`
				);
			}
			lastError = `${response.status} ${response.statusText}`.trim();
		}

		if (attempt === MAX_ATTEMPTS) break;

		const delay = BASE_DELAY_MS * Math.pow(2, attempt - 1);
		console.warn(
			`[downloader] Download failed for ${url} (attempt ${attempt}/${MAX_ATTEMPTS}: ${lastError}). ` +
				`Retrying in ${delay}ms...`
		);
		await sleepFn(delay);
	}

	throw new Error(
		`[downloader] Failed to download ${url} after ${MAX_ATTEMPTS} attempts: ${lastError}`
	);
}

/**
 * Downloads an image from a URL to a temp file (with transient-failure retry).
 *
 * @param url - The full URL of the image to download
 * @returns DownloadResult with tempPath, cleanup(), fileSize, mimeType
 */
export async function downloadImage(url: string): Promise<DownloadResult> {
	const response = await fetchWithRetry(url);

	const arrayBuffer = await response.arrayBuffer();
	const buffer = Buffer.from(arrayBuffer);
	const fileSize = buffer.length;

	const mimeType =
		response.headers.get('Content-Type')?.split(';')[0]?.trim() ?? 'application/octet-stream';

	// Create a temp directory (unique per download) to avoid filename collisions
	const tempDir = mkdtempSync(join(tmpdir(), 'meg-migrate-'));
	const fileName = basename(new URL(url).pathname);
	const tempPath = join(tempDir, fileName);

	writeFileSync(tempPath, buffer);

	const cleanup = () => {
		try {
			unlinkSync(tempPath);
		} catch {
			// File may already be removed — not an error
		}
		try {
			// Remove the temp dir (best effort — may fail if non-empty)
			rmdirSync(tempDir);
		} catch {
			// Ignore
		}
	};

	return { tempPath, cleanup, fileSize, mimeType };
}
