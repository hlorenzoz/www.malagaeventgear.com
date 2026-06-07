/**
 * Blog redirect generation — converts WP root-level post URLs to
 * Cloudflare Pages _redirects rules mapping them to /blog/<slug>/.
 *
 * SC-BR-01 through SC-BR-11 (blog-redirects spec)
 *
 * Design principles:
 *  - All public functions are pure (no I/O) — independently unit-testable.
 *  - I/O (reading/writing static/_redirects) is done in index.ts.
 *  - The managed block is delimited so re-runs replace only the blog rules.
 */

// ─── Constants ────────────────────────────────────────────────────────────────

/** Marker inserted in static/_redirects to delimit the managed blog-redirect block. */
export const BLOCK_BEGIN = '# BEGIN wp-blog-redirects (managed — do not edit manually)';
export const BLOCK_END = '# END wp-blog-redirects';

/** Cloudflare Pages hard limit for _redirects rules (free tier). */
const CLOUDFLARE_RULE_LIMIT = 100;

/** Accepted hostnames for the MEG site. */
const ACCEPTED_HOSTS = new Set([
	'malagaeventgear.com',
	'www.malagaeventgear.com',
]);

// ─── Pure functions ───────────────────────────────────────────────────────────

/**
 * Derives the old WordPress path from a WP REST API `link` field.
 *
 * - Strips scheme + domain, retains only the pathname.
 * - Ensures a trailing slash (site convention: trailingSlash: 'always').
 * - Strips query strings and hash fragments.
 * - Throws TypeError for non-absolute URLs or URLs not belonging to malagaeventgear.com.
 *
 * SC-BR-04, SC-BR-05, SC-BR-06
 */
export function deriveOldPath(wpLink: string): string {
	let parsed: URL;
	try {
		parsed = new URL(wpLink);
	} catch {
		throw new TypeError(
			`deriveOldPath: invalid URL — expected an absolute URL for malagaeventgear.com, got: ${JSON.stringify(wpLink)}`
		);
	}

	if (!ACCEPTED_HOSTS.has(parsed.hostname)) {
		throw new TypeError(
			`deriveOldPath: URL hostname "${parsed.hostname}" is not malagaeventgear.com`
		);
	}

	// Use only pathname — drops query and hash automatically via URL parsing
	let path = parsed.pathname;

	// Ensure trailing slash
	if (!path.endsWith('/')) {
		path = path + '/';
	}

	return path;
}

/**
 * Input shape for buildRedirects — a post must carry its WP permalink (`link`).
 */
export interface RedirectPost {
	slug: string;
	link: string;
}

/**
 * Builds one Cloudflare Pages redirect rule per post.
 *
 * Format: `<oldPath>  /blog/<slug>/  301`
 *
 * Skips posts where the old path already equals `/blog/<slug>/`.
 * Never emits wildcards.
 *
 * SC-BR-07, SC-BR-08
 */
export function buildRedirects(posts: RedirectPost[]): string[] {
	const rules: string[] = [];

	for (const post of posts) {
		const oldPath = deriveOldPath(post.link);
		const newPath = `/blog/${post.slug}/`;

		// Skip self-referential: no redirect needed if already at /blog/
		if (oldPath === newPath) {
			continue;
		}

		rules.push(`${oldPath}  ${newPath}  301`);
	}

	return rules;
}

/**
 * Builds redirect rules for WP category archives.
 *
 * Format: `/category/<cat-slug>/  /blog/category/<cat-slug>/  301`
 *
 * SC-BR-11 (SHOULD)
 */
export function buildCategoryRedirects(categorySlugs: string[]): string[] {
	return categorySlugs.map(
		(slug) => `/category/${slug}/  /blog/category/${slug}/  301`
	);
}

/**
 * Wraps an array of redirect rule strings in the managed BEGIN/END marker block.
 */
export function buildManagedBlock(rules: string[]): string {
	const lines = [BLOCK_BEGIN, ...rules, BLOCK_END, ''];
	return lines.join('\n');
}

/**
 * Merges new redirect rules into an existing _redirects file content string.
 *
 * - If the managed block already exists, replaces it in-place.
 * - If not, appends the managed block at the end.
 * - Lines outside the managed block (unrelated rules) are preserved.
 *
 * SC-BR-09
 */
export function mergeRedirectsFile(existing: string, rules: string[]): string {
	const managedBlock = buildManagedBlock(rules);

	// Find existing managed block boundaries
	const beginIdx = existing.indexOf(BLOCK_BEGIN);
	const endIdx = existing.indexOf(BLOCK_END);

	if (beginIdx !== -1 && endIdx !== -1 && endIdx > beginIdx) {
		// Replace the existing managed block (from BLOCK_BEGIN to end of BLOCK_END line)
		const beforeBlock = existing.slice(0, beginIdx);
		const afterBlockRaw = existing.slice(endIdx + BLOCK_END.length);
		// Strip one leading newline from afterBlock to avoid double blank lines
		const afterBlock = afterBlockRaw.startsWith('\n')
			? afterBlockRaw.slice(1)
			: afterBlockRaw;

		return beforeBlock + managedBlock + afterBlock;
	}

	// No managed block found — append
	const base = existing.endsWith('\n') || existing === '' ? existing : existing + '\n';
	return base + '\n' + managedBlock;
}

/**
 * Generates the full set of redirect rules (posts + optional taxonomy),
 * applying the Cloudflare 100-rule limit guard.
 *
 * Returns the merged _redirects file content string.
 *
 * SC-BR-10: warns and omits taxonomy if total > 100
 *
 * @param posts - All migrated WP posts (must carry `link` field)
 * @param categorySlugs - Category slugs for taxonomy redirects (SHOULD, optional)
 * @param existingFileContent - Current content of static/_redirects (pass '' if new)
 */
export function generateRedirectsContent(
	posts: RedirectPost[],
	categorySlugs: string[],
	existingFileContent: string
): string {
	const postRules = buildRedirects(posts);
	const taxRules = buildCategoryRedirects(categorySlugs);

	let finalRules: string[];
	const totalWithTax = postRules.length + taxRules.length;

	if (totalWithTax > CLOUDFLARE_RULE_LIMIT) {
		console.warn(
			`WARNING: redirect count (${totalWithTax}) exceeds ${CLOUDFLARE_RULE_LIMIT}; taxonomy redirects omitted`
		);
		finalRules = postRules;
	} else {
		finalRules = [...postRules, ...taxRules];
	}

	return mergeRedirectsFile(existingFileContent, finalRules);
}
