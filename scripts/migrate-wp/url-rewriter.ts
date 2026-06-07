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
 */
const WP_URL_PATTERN =
	/https?:\/\/(?:www\.)?malagaeventgear\.com\/wp-content\/uploads\/[^\s"')>]+/g;

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
