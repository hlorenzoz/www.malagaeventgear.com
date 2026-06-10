#!/usr/bin/env bun
/**
 * One-off: generate a ~400px-wide WebP variant for every blog image that lacks one
 * and upload it to R2, then register it in the manifest so srcset ladders include 400w.
 *
 * WordPress generated 150/300/768/1024/1536/full but no ~400px step, so mobile (≈372px
 * display) still downloads the 768px variant. This adds the missing rung.
 *
 * Idempotent: skips a base image that already has a width-400 variant. Skips images whose
 * full width is ≤ 400 and non-raster sources (svg/avif) that cwebp can't downscale well.
 *
 * Run: `bun scripts/gen-400-variants.ts`  (needs cwebp + wrangler logged into account cc26ab18)
 */
import { readFileSync, writeFileSync } from 'fs';
import { downloadImage } from './migrate-wp/downloader';
import { uploadToR2, buildCdnUrl } from './migrate-wp/r2-uploader';
import type { MediaEntry } from './migrate-wp/types';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const MANIFEST = resolve(dirname(fileURLToPath(import.meta.url)), 'migrate-wp/manifest.json');
const TARGET = 400;
const baseOf = (s: string) => s.replace(/(-\d+x\d+)?\.[a-z0-9]+$/i, '');

interface Manifest {
	media: Record<string, MediaEntry>;
	[k: string]: unknown;
}

const manifest = JSON.parse(readFileSync(MANIFEST, 'utf8')) as Manifest;
const entries = Object.values(manifest.media);

// Group variants by base; track existing widths to know what already exists.
const groups = new Map<string, MediaEntry[]>();
for (const e of entries) {
	if (!e.r2Url) continue;
	const base = baseOf(e.r2Url);
	if (!groups.has(base)) groups.set(base, []);
	groups.get(base)!.push(e);
}

async function cwebpResize(input: string, output: string): Promise<void> {
	const proc = Bun.spawn(['cwebp', '-quiet', '-resize', String(TARGET), '0', '-q', '82', input, '-o', output]);
	const code = await proc.exited;
	if (code !== 0) throw new Error(`cwebp failed (${code}) for ${input}`);
}

let made = 0;
let skipped = 0;
let i = 0;
for (const [base, list] of groups) {
	i++;
	if (list.some((e) => e.width === TARGET)) { skipped++; continue; }
	const full = list.reduce((a, b) => (b.width > a.width ? b : a));
	if (!full.width || full.width <= TARGET) { skipped++; continue; }
	if (/svg|avif/i.test(full.mimeType ?? '')) { skipped++; continue; }

	const h = Math.round(TARGET * (full.height / full.width));
	const key400 = `${baseOf(full.r2Key)}-${TARGET}x${h}.webp`;
	const url400 = buildCdnUrl(key400);
	const fileName = key400.split('/').pop()!;

	try {
		const { tempPath, cleanup } = await downloadImage(full.r2Url);
		const out = `${tempPath}.400.webp`;
		await cwebpResize(tempPath, out);
		await uploadToR2(key400, out, false);
		cleanup();

		manifest.media[key400] = {
			...full,
			r2Key: key400,
			r2Url: url400,
			cdnUrl: url400,
			fileName,
			mimeType: 'image/webp',
			width: TARGET,
			height: h,
			// Generated variant — give it a unique key/originalUrl so it never clobbers a
			// real attachment entry and stays out of the WP→R2 rewrite map.
			originalUrl: url400
		};
		made++;
		if (made % 10 === 0) {
			writeManifest();
			console.log(`[400] ${i}/${groups.size} — ${made} made, ${skipped} skipped (checkpoint)`);
		}
	} catch (err) {
		console.error(`[400] FAILED ${base}:`, err instanceof Error ? err.message : err);
	}
}

function writeManifest() {
	writeFileSync(MANIFEST, JSON.stringify(manifest, null, 2) + '\n', 'utf8');
}

writeManifest();
console.log(`[400] DONE — ${made} variants generated, ${skipped} skipped, ${groups.size} bases total.`);
