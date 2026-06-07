/**
 * Image downloader — fetches WP image to a temp file.
 *
 * Temp files are cleaned up after upload via the provided cleanup callback.
 * Local files must NOT accumulate on disk (spec §3).
 */
import { writeFileSync, unlinkSync, mkdtempSync } from 'fs';
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

/**
 * Downloads an image from a URL to a temp file.
 *
 * @param url - The full URL of the image to download
 * @returns DownloadResult with tempPath, cleanup(), fileSize, mimeType
 */
export async function downloadImage(url: string): Promise<DownloadResult> {
	const response = await fetch(url);
	if (!response.ok) {
		throw new Error(
			`[downloader] Failed to download ${url}: ${response.status} ${response.statusText}`
		);
	}

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
			const { rmdirSync } = require('fs');
			rmdirSync(tempDir);
		} catch {
			// Ignore
		}
	};

	return { tempPath, cleanup, fileSize, mimeType };
}
