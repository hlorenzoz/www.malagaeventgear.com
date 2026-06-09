#!/usr/bin/env bun
/**
 * Generates src/lib/data/cover-thumbs.json — a compact map of
 *   { <full coverImage URL>: <card-sized variant URL (~768px wide)> }
 *
 * The blog index/category/author cards display covers at ~370px (≈740px @2x DPR),
 * but frontmatter coverImage points at the full-size image (e.g. 1600x900). Serving
 * the full image wastes ~480 KiB per card. We pick the smallest R2 variant ≥ 740px
 * (falling back to the largest available) so cards load a card-appropriate size.
 *
 * Run after a migration (one-off): `bun scripts/gen-cover-thumbs.ts`
 * The big manifest is NOT bundled into the app — only this small 75-entry map is.
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
const entries = Object.values(manifest.media);

// Index variants by their base (URL without the -WxH size suffix and extension).
const byBase = new Map<string, { url: string; width: number }[]>();
for (const e of entries) {
	if (!e.r2Url?.endsWith('.webp') && !/\.(jpe?g|png|avif)$/i.test(e.r2Url ?? '')) continue;
	const base = e.r2Url.replace(/(-\d+x\d+)?\.[a-z0-9]+$/i, '');
	if (!byBase.has(base)) byBase.set(base, []);
	byBase.get(base)!.push({ url: e.r2Url, width: e.width ?? 0 });
}

/** Picks the smallest variant width ≥ TARGET_WIDTH, else the largest available. */
function pickThumb(coverUrl: string): string {
	const base = coverUrl.replace(/(-\d+x\d+)?\.[a-z0-9]+$/i, '');
	const variants = byBase.get(base);
	if (!variants || variants.length === 0) return coverUrl;
	const sorted = [...variants].sort((a, b) => a.width - b.width);
	const big = sorted.find((v) => v.width >= TARGET_WIDTH);
	return (big ?? sorted[sorted.length - 1]).url;
}

const thumbs: Record<string, string> = {};
let matched = 0;
for (const file of readdirSync(BLOG_DIR).filter((f) => f.endsWith('.svx'))) {
	const raw = readFileSync(resolve(BLOG_DIR, file), 'utf8');
	const m = raw.match(/^coverImage:\s*(.+)$/m);
	if (!m) continue;
	const cover = m[1].trim().replace(/^["']|["']$/g, '');
	if (!cover.startsWith('https://cdn.malagaeventgear.com/')) continue;
	const thumb = pickThumb(cover);
	thumbs[cover] = thumb;
	if (thumb !== cover) matched++;
}

writeFileSync(OUT, JSON.stringify(thumbs, null, 2) + '\n');
console.log(`[cover-thumbs] wrote ${Object.keys(thumbs).length} entries (${matched} resized) → ${OUT}`);
