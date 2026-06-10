/**
 * rehype plugin (build-time) — rewrites legacy WordPress internal links in post bodies
 * to the new SvelteKit URL structure, so links resolve directly (no _redirects hop):
 *   - Package pages:  /wedding-pack/ → /packages/wedding/, /pricing/ → /packages/, etc.
 *   - Site pages:     /contact-us/ → /contact/, /home/ → /
 *   - Old post URLs:  /<slug>/ → /blog/<slug>/  (when <slug> is a migrated post)
 *   - WP category:    /category/<x>/ → /blog/category/<x>/
 * Absolute malagaeventgear.com URLs become root-relative. Unknown links are left as-is.
 */
import { readdirSync } from 'node:fs';
import { resolve } from 'node:path';
import { visit } from 'unist-util-visit';

const PACKAGE_MAP = {
	'wedding-pack': '/packages/wedding/',
	'mice-pack': '/packages/mice/',
	'basic-mice-pack': '/packages/basic-mice/',
	'eco-pack': '/packages/eco/',
	'product-presentation-pack': '/packages/product-presentation/'
};

const PAGE_MAP = {
	pricing: '/packages/',
	'contact-us': '/contact/',
	home: '/'
};

let postSlugs = null;
function loadPostSlugs() {
	if (postSlugs) return postSlugs;
	try {
		postSlugs = new Set(
			readdirSync(resolve('src/content/blog'))
				.filter((f) => f.endsWith('.svx'))
				.map((f) => f.replace(/\.svx$/, ''))
		);
	} catch {
		postSlugs = new Set();
	}
	return postSlugs;
}

const INTERNAL = /^https?:\/\/(?:www\.)?malagaeventgear\.com(\/[^?#]*)?/i;

/** Maps a legacy internal path to its new path, or null to leave unchanged. */
function rewritePath(path, slugs) {
	if (!path || path === '/') return null;
	// Already-new paths: leave.
	if (path.startsWith('/blog/') || path.startsWith('/packages/')) return null;

	const seg = path.replace(/^\/|\/$/g, ''); // strip leading/trailing slash
	if (!seg) return null;

	if (PACKAGE_MAP[seg]) return PACKAGE_MAP[seg];
	if (PAGE_MAP[seg]) return PAGE_MAP[seg];

	// WP category archive: /category/<x>/ → /blog/category/<x>/
	if (seg.startsWith('category/')) return `/blog/${seg.replace(/\/$/, '')}/`;

	// Single-segment old post URL that is now a migrated blog post.
	if (!seg.includes('/') && slugs.has(seg)) return `/blog/${seg}/`;

	return null;
}

export function rehypeInternalLinks() {
	const slugs = loadPostSlugs();
	return (tree) => {
		visit(tree, 'element', (node) => {
			if (node.tagName !== 'a' || !node.properties) return;
			const href = node.properties.href;
			if (typeof href !== 'string') return;

			const m = href.match(INTERNAL);
			if (!m) return; // external link — leave
			const path = m[1] ?? '/';
			const newPath = rewritePath(path, slugs);
			if (newPath) node.properties.href = newPath;
		});
	};
}
