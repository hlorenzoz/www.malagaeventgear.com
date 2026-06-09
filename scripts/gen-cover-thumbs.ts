#!/usr/bin/env bun
/**
 * Generates src/lib/data/cover-thumbs.json — a compact map of
 *   { <full coverImage URL>: { thumb: <~768px URL>, srcset: "<u> <w>w, ..." } }
 *
 * Listing cards display covers at ~370px and the post hero at ~768px, but frontmatter
 * coverImage points at the full-size image (e.g. 1600x900). We expose:
 *   - thumb: the smallest R2 variant ≥ 740px → used as the card/hero <img src> fallback.
 *   - srcset: all available R2 variants → lets the browser pick the right size per DPR.
 * Cloudflare Transformations is not enabled, so we use the variants already on R2.
 *
 * Run after a migration (one-off): `bun scripts/gen-cover-thumbs.ts`
 * The big manifest is NOT bundled into the app — only this small map is.
 */
import { readFileSync, writeFileSync, readdirSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const MANIFEST = resolve(ROOT, 'scripts/migrate-wp/manifest.json');
const BLOG_DIR = resolve(ROOT, 'src/content/blog');
const OUT = resolve(ROOT, 'src/lib/data/cover-thumbs.json');

const TARGET_WIDTH = 740; // 370px card × 2 DPR

interface MediaEntry {
	r2Url: string;
	width: number;
}

const manifest = JSON.parse(readFileSync(MANIFEST, 'utf8')) as {
	media: Record<string, MediaEntry>;
};

// Group variants by base (URL without the -WxH suffix and extension).
const byBase = new Map<string, { url: string; width: number }[]>();
for (const e of Object.values(manifest.media)) {
	if (!e.r2Url) continue;
	const base = e.r2Url.replace(/(-\d+x\d+)?\.[a-z0-9]+$/i, '');
	if (!byBase.has(base)) byBase.set(base, []);
	byBase.get(base)!.push({ url: e.r2Url, width: e.width ?? 0 });
}
for (const list of byBase.values()) list.sort((a, b) => a.width - b.width);

interface CoverInfo {
	thumb: string;
	srcset?: string;
}

function coverInfo(coverUrl: string): CoverInfo {
	const base = coverUrl.replace(/(-\d+x\d+)?\.[a-z0-9]+$/i, '');
	const variants = (byBase.get(base) ?? []).filter((v) => v.width > 0);
	if (variants.length === 0) return { thumb: coverUrl };
	const thumb = (variants.find((v) => v.width >= TARGET_WIDTH) ?? variants[variants.length - 1]).url;
	const srcset = variants.length > 1 ? variants.map((v) => `${v.url} ${v.width}w`).join(', ') : undefined;
	return { thumb, srcset };
}

const covers: Record<string, CoverInfo> = {};
for (const file of readdirSync(BLOG_DIR).filter((f) => f.endsWith('.svx'))) {
	const raw = readFileSync(resolve(BLOG_DIR, file), 'utf8');
	const m = raw.match(/^coverImage:\s*(.+)$/m);
	if (!m) continue;
	const cover = m[1].trim().replace(/^["']|["']$/g, '');
	if (!cover.startsWith('https://cdn.malagaeventgear.com/')) continue;
	covers[cover] = coverInfo(cover);
}

writeFileSync(OUT, JSON.stringify(covers, null, 2) + '\n');
console.log(`[cover-thumbs] wrote ${Object.keys(covers).length} covers → ${OUT}`);
