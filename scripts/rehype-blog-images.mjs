/**
 * rehype plugin (build-time) — optimizes blog body <img> elements from the WP
 * migration manifest:
 *   - srcset + sizes: responsive variants (R2 already holds 300/768/1024/1536/full),
 *     so the browser downloads a size that matches the ~768px prose column instead of
 *     the full-size image (Improve image delivery / LCP).
 *   - src: a ~1024px fallback variant for non-srcset cases.
 *   - alt: WP attachment alt_text (fallback: decoded title) — fixes a11y warnings + SEO.
 *   - width/height: intrinsic dimensions → reserves space (CLS).
 *   - loading="lazy" + decoding="async": defer offscreen body images.
 *
 * The manifest (scripts/migrate-wp/manifest.json) is read ONCE at build time in Node
 * and is NOT bundled into the client. Cover images on listing cards/hero are handled
 * separately (cover-thumbs.json); this only touches images inside post bodies.
 */
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { visit } from 'unist-util-visit';

const NAMED = {
	amp: '&', lt: '<', gt: '>', quot: '"', apos: "'", '#039': "'",
	hellip: '…', ndash: '–', mdash: '—', rsquo: '’', lsquo: '‘',
	ldquo: '“', rdquo: '”', nbsp: ' '
};

function decodeEntities(s) {
	if (!s) return '';
	return s
		.replace(/&#x([0-9a-f]+);/gi, (_, h) => String.fromCodePoint(parseInt(h, 16)))
		.replace(/&#(\d+);/g, (_, d) => String.fromCodePoint(parseInt(d, 10)))
		.replace(/&([a-z0-9#]+);/gi, (m, n) => NAMED[n.toLowerCase()] ?? m);
}

const stripHtml = (s) => (s || '').replace(/<[^>]+>/g, '').trim();

// Strip any -WxH size suffix + extension → the canonical base used to group variants.
const baseOf = (url) => url.replace(/(-\d+x\d+)?\.[a-z0-9]+$/i, '');

// Prose column is max-w-3xl (768px); below that the image is full-bleed (~100vw).
const SIZES = '(min-width: 768px) 768px, calc(100vw - 2rem)';
const FALLBACK_TARGET = 1024;

let cache = null;
function loadIndex() {
	if (cache) return cache;
	const byUrl = {};
	const byBase = new Map();
	try {
		const manifest = JSON.parse(
			readFileSync(resolve('scripts/migrate-wp/manifest.json'), 'utf8')
		);
		for (const e of Object.values(manifest.media ?? {})) {
			if (!e.r2Url) continue;
			byUrl[e.r2Url] = {
				alt: decodeEntities(e.alt) || decodeEntities(stripHtml(e.title)),
				width: e.width,
				height: e.height
			};
			const base = baseOf(e.r2Url);
			if (!byBase.has(base)) byBase.set(base, []);
			byBase.get(base).push({ url: e.r2Url, width: e.width ?? 0, height: e.height ?? 0 });
		}
	} catch {
		// Manifest absent (e.g. fresh checkout) — plugin becomes a no-op enricher.
	}
	for (const list of byBase.values()) list.sort((a, b) => a.width - b.width);
	cache = { byUrl, byBase };
	return cache;
}

export function rehypeBlogImages() {
	const { byUrl, byBase } = loadIndex();
	return (tree) => {
		visit(tree, 'element', (node) => {
			if (node.tagName !== 'img' || !node.properties) return;
			const src = node.properties.src;
			if (typeof src !== 'string') return;

			const meta = byUrl[src];
			// alt — ensure the attribute exists (empty = decorative → no a11y warning).
			if (!node.properties.alt) node.properties.alt = meta?.alt ?? '';
			node.properties.loading ??= 'lazy';
			node.properties.decoding ??= 'async';

			const variants = byBase.get(baseOf(src))?.filter((v) => v.width > 0);
			if (variants && variants.length > 1) {
				node.properties.srcset = variants.map((v) => `${v.url} ${v.width}w`).join(', ');
				node.properties.sizes ??= SIZES;
				// Fallback src: smallest variant ≥ target, else largest.
				const fallback =
					variants.find((v) => v.width >= FALLBACK_TARGET) ?? variants[variants.length - 1];
				node.properties.src = fallback.url;
				if (node.properties.width == null) node.properties.width = fallback.width;
				if (node.properties.height == null) node.properties.height = fallback.height;
			} else if (meta) {
				if (meta.width != null && node.properties.width == null) node.properties.width = meta.width;
				if (meta.height != null && node.properties.height == null)
					node.properties.height = meta.height;
			}
		});
	};
}
