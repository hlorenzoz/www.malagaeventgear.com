/**
 * WebP conversion policy and helpers.
 *
 * Conversion policy (confirmed with user):
 *   - image/png   → convert to webp (lossless-friendly, cwebp handles well)
 *   - image/jpeg  → convert to webp (space savings worth the quality loss at q=82)
 *   - image/webp  → upload as-is (already webp)
 *   - image/avif  → upload as-is (already modern format, no benefit in converting)
 *   - image/svg+xml → upload as-is (vector format, cwebp cannot handle)
 *   - anything else → upload as-is (unknown format, safe default)
 *
 * cwebp preserves the input's pixel dimensions — no resizing is done here.
 * WP already stores all size variants (thumbnail, medium, large, full) as separate
 * files; we convert each variant in place.
 *
 * Tool: /opt/homebrew/bin/cwebp (darwin). Expected on PATH when running migration.
 */
/** MIME types that should be converted to WebP before uploading to R2. */
const CONVERT_MIME_TYPES = new Set(['image/png', 'image/jpeg']);

/**
 * Pure function — determines whether a file should be converted to WebP.
 * Returns true ONLY for image/png and image/jpeg.
 */
export function shouldConvertToWebp(mimeType: string): boolean {
	return CONVERT_MIME_TYPES.has(mimeType);
}

/**
 * Pure function — builds the cwebp command array.
 * Format: ['cwebp', '-q', '<quality>', '<inputPath>', '-o', '<outputPath>']
 *
 * @param inputPath   Absolute path to the input file (png or jpeg)
 * @param outputPath  Absolute path for the output .webp file
 * @param quality     WebP quality 0-100 (default 82 — good balance for blog photos)
 */
export function buildCwebpCommand(
	inputPath: string,
	outputPath: string,
	quality = 82
): string[] {
	return ['cwebp', '-q', String(quality), inputPath, '-o', outputPath];
}

/**
 * Derives the output .webp path given an input path.
 * Replaces the original extension with .webp.
 * e.g. /tmp/abc/foo-300x200.png → /tmp/abc/foo-300x200.webp
 */
function deriveWebpPath(inputPath: string): string {
	return inputPath.replace(/\.[a-zA-Z0-9]+$/, '.webp');
}

/**
 * Derives the output .webp file name given an original file name.
 * e.g. foo-300x200.png → foo-300x200.webp
 */
export function deriveWebpFileName(originalFileName: string): string {
	return originalFileName.replace(/\.[a-zA-Z0-9]+$/, '.webp');
}

export interface ConvertResult {
	/** Absolute path to the file to upload (may be the original if not converted) */
	path: string;
	/** File name to use for the R2 key / MediaEntry.fileName */
	fileName: string;
	/** Whether conversion actually happened */
	converted: boolean;
}

/**
 * Converts an image file to WebP if the MIME type requires it.
 * Uses Bun.spawn to invoke cwebp.
 *
 * If the MIME type is not convertible, returns the original path unchanged.
 *
 * @param inputPath  Absolute path to the downloaded temp file
 * @param mimeType   MIME type detected from the download
 * @param originalFileName  Original file name (used to derive .webp name)
 */
export async function convertToWebp(
	inputPath: string,
	mimeType: string,
	originalFileName: string
): Promise<ConvertResult> {
	if (!shouldConvertToWebp(mimeType)) {
		return { path: inputPath, fileName: originalFileName, converted: false };
	}

	const outputPath = deriveWebpPath(inputPath);
	const cmd = buildCwebpCommand(inputPath, outputPath);

	const proc = Bun.spawn(cmd, {
		stdout: 'pipe',
		stderr: 'pipe',
	});

	const exitCode = await proc.exited;
	if (exitCode !== 0) {
		const stderr = await new Response(proc.stderr).text();
		throw new Error(
			`[webp] cwebp conversion failed for ${inputPath} (exit ${exitCode}):\n${stderr}`
		);
	}

	const webpFileName = deriveWebpFileName(originalFileName);
	return { path: outputPath, fileName: webpFileName, converted: true };
}
