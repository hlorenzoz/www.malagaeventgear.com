/**
 * URL Rewriter — replaces all WP image URL variants in a Markdown body
 * with their corresponding CDN URLs from the manifest.
 *
 * Handles:
 *   - http / https schemes
 *   - www / no-www prefixes
 *   - WP size-suffixed filenames (e.g. photo-300x200.jpg → canonical photo.jpg mapping)
 *
 * Design §4 — URL-variant rewrite algorithm.
 * SC-CDN-04, SC-CDN-05
 */
import type { MediaEntry } from './types';

const WP_HOST = 'malagaeventgear.com';

/**
 * Well-known WP thumbnail size suffixes.
 * We generate variants for these common dimensions; additional sizes found
 * in the WP media_details.sizes are also registered at upload time.
 */
const COMMON_WP_SIZES = [
	'150x150',
	'300x200',
	'300x225',
	'768x432',
	'768x512',
	'768x576',
	'1024x683',
	'1024x768',
	'1200x800',
	'1920x1080',
];

/**
 * Given a set of MediaEntry objects from the manifest, builds a flat map of
 * every known URL variant → canonical CDN URL.
 */
export function buildUrlVariantMap(entries: MediaEntry[]): Record<string, string> {
	const map: Record<string, string> = {};

	for (const entry of entries) {
		const variants = generateUrlVariants(entry.originalUrl);
		for (const v of variants) {
			map[v] = entry.r2Url;
		}
	}

	return map;
}

/**
 * Given one original WP URL, generates all known variants:
 * - http / https
 * - with / without www
 * - original filename
 * - size-suffixed filenames (e.g. photo-300x200.jpg)
 */
export function generateUrlVariants(originalUrl: string): string[] {
	// Extract the path portion after the host
	const match = originalUrl.match(
		/^https?:\/\/(?:www\.)?malagaeventgear\.com(\/wp-content\/uploads\/.+)$/
	);
	if (!match) return [originalUrl];

	const path = match[1]; // e.g. /wp-content/uploads/2024/01/venue-main.jpg
	const variants = new Set<string>();

	const schemes = ['https', 'http'];
	const hosts = [WP_HOST, `www.${WP_HOST}`];
	const pathVariants = generatePathVariants(path);

	for (const scheme of schemes) {
		for (const host of hosts) {
			for (const pv of pathVariants) {
				variants.add(`${scheme}://${host}${pv}`);
			}
		}
	}

	return Array.from(variants);
}

/**
 * Given a WP image path, generates the base path plus common size-suffixed variants.
 * e.g. /wp-content/uploads/2024/01/venue-main.jpg →
 *   [original, ...-300x200.jpg, ...-768x512.jpg, ...]
 */
function generatePathVariants(path: string): string[] {
	const variants = [path];

	// Match paths ending in <name>.<ext>
	const fileMatch = path.match(/^(.+?)(-\d+x\d+)?(\.[a-z0-9]+)$/i);
	if (!fileMatch) return variants;

	const [, base, , ext] = fileMatch;
	// The "clean" base without any existing size suffix
	const cleanBase = base;

	for (const size of COMMON_WP_SIZES) {
		variants.push(`${cleanBase}-${size}${ext}`);
	}

	return variants;
}

/**
 * WP image URL pattern — matches any URL pointing to the WP uploads directory.
 * Exported so other modules can reuse it (e.g. orphan detection in index.ts).
 */
export const WP_URL_PATTERN =
	/https?:\/\/(?:www\.)?malagaeventgear\.com\/wp-content\/uploads\/[^\s"')>]+/g;

/**
 * Extracts all unique WP upload URLs found in a Markdown/HTML body.
 *
 * Reuses WP_URL_PATTERN. The result is deduplicated — each URL appears at most once.
 * Used by the orphan-collection pass to scan post bodies before rewriting.
 *
 * @param body - Raw Markdown or HTML string
 * @returns Array of unique WP upload URLs found in the body
 */
export function extractWpUrls(body: string): string[] {
	const seen = new Set<string>();
	// Reset lastIndex before each use (pattern has the /g flag)
	WP_URL_PATTERN.lastIndex = 0;
	let match: RegExpExecArray | null;
	while ((match = WP_URL_PATTERN.exec(body)) !== null) {
		seen.add(match[0]);
	}
	return Array.from(seen);
}

/**
 * Derives the R2 key for an orphan WP image URL.
 *
 * Formula:
 *   Strip scheme + host + /wp-content/uploads/
 *   Prefix with blog/orphan/
 *   If converted=true, swap the file extension to .webp
 *
 * Example:
 *   https://malagaeventgear.com/wp-content/uploads/2024/09/Methacrylate-lectern.jpeg
 *   converted=true → blog/orphan/2024/09/Methacrylate-lectern.webp
 *
 * @param wpUrl     - Original WP uploads URL (http/https, www/no-www)
 * @param converted - True if the file was converted to WebP
 * @returns R2 key string
 */
export function buildOrphanKey(wpUrl: string, converted: boolean): string {
	const match = wpUrl.match(
		/^https?:\/\/(?:www\.)?malagaeventgear\.com\/wp-content\/uploads\/(.+)$/
	);
	if (!match) {
		throw new Error(`[url-rewriter] buildOrphanKey: not a WP uploads URL: ${wpUrl}`);
	}
	const relativePath = match[1]; // e.g. 2024/09/Methacrylate-lectern.jpeg
	const path = converted ? relativePath.replace(/\.[a-zA-Z0-9]+$/, '.webp') : relativePath;
	return `blog/orphan/${path}`;
}

/**
 * Scans an array of post bodies and collects the SET of WP upload URLs that
 * are NOT present in urlVariantMap (i.e. orphans — referenced but not uploaded).
 *
 * The result is deduplicated across all bodies.
 *
 * @param bodies        - Array of post body strings (Markdown or HTML)
 * @param urlVariantMap - Current map built from manifest entries
 * @returns Set of orphan WP URLs (unique, ready for upload)
 */
export function collectOrphanUrls(
	bodies: string[],
	urlVariantMap: Record<string, string>
): Set<string> {
	const orphans = new Set<string>();
	for (const body of bodies) {
		for (const url of extractWpUrls(body)) {
			if (urlVariantMap[url] === undefined) {
				orphans.add(url);
			}
		}
	}
	return orphans;
}

/**
 * Replaces every WP image URL in a Markdown body with the CDN URL from urlVariantMap.
 *
 * Throws an Error (SC-CDN-05) if a WP URL is found that has no entry in the map.
 */
export function rewriteUrls(body: string, urlVariantMap: Record<string, string>): string {
	const unmapped: string[] = [];

	const result = body.replace(WP_URL_PATTERN, (match) => {
		const cdnUrl = urlVariantMap[match];
		if (cdnUrl === undefined) {
			unmapped.push(match);
			return match; // placeholder — will throw below
		}
		return cdnUrl;
	});

	if (unmapped.length > 0) {
		const list = unmapped.join('\n  ');
		throw new Error(
			`[url-rewriter] Unmapped WP image URL(s) found — migration cannot proceed:\n  ${list}\n` +
				`Ensure these images were fetched and added to the manifest before rewriting.`
		);
	}

	return result;
}
