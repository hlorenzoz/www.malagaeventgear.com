#!/usr/bin/env bun
/**
 * One-off: generate a ~600px-wide WebP variant for every BLOG COVER image and upload it to R2,
 * then register it in the manifest so the listing srcset ladder includes a 600w rung.
 *
 * Why: covers already have 150/300/400/768/full on R2, but the listing cards are full-width on
 * mobile (grid-cols-1, ≈380px CSS). At DPR ~1.75 the slot needs ~665px, so the browser jumps
 * straight from 400 → 768 and downloads ~250 KiB more than necessary. A 600px rung lets common
 * mid-DPR devices pick a much smaller file (helps LCP/FCP on /blog/).
 *
 * Scope: ONLY the covers declared in src/content/blog/*.svx frontmatter (not every body image).
 * Idempotent: skips a base that already has a width-600 variant, whose full width is ≤600, or
 * whose source is non-raster (svg/avif).
 *
 * Run: `bun scripts/gen-cover-variants.ts`  (needs cwebp + wrangler logged into account cc26ab18,
 *       `export CLOUDFLARE_ACCOUNT_ID=cc26ab18f887fb1c63c19e17a0bb313f`)
 * After it finishes, regenerate the map: `bun scripts/gen-cover-thumbs.ts`
 */
import { readFileSync, writeFileSync, readdirSync } from 'fs';
import { downloadImage } from './migrate-wp/downloader';
import { uploadToR2, buildCdnUrl } from './migrate-wp/r2-uploader';
import type { MediaEntry } from './migrate-wp/types';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const MANIFEST = resolve(ROOT, 'scripts/migrate-wp/manifest.json');
const BLOG_DIR = resolve(ROOT, 'src/content/blog');
// Width of the variant to generate. The listing card slot is ~370px CSS on every breakpoint, so the
// ideal source is 370×DPR: 600 covers DPR≤1.5, 700 covers DPR~1.75 (Lighthouse mobile) and beats the
// 768 rung. Run once per width (e.g. VARIANT_WIDTH=600 then VARIANT_WIDTH=700).
const TARGET = Number(process.env.VARIANT_WIDTH ?? 600);
const CDN_PREFIX = 'https://cdn.malagaeventgear.com/';
const baseOf = (s: string) => s.replace(/(-\d+x\d+)?\.[a-z0-9]+$/i, '');

interface Manifest {
	media: Record<string, MediaEntry>;
	[k: string]: unknown;
}

const manifest = JSON.parse(readFileSync(MANIFEST, 'utf8')) as Manifest;

// Group ALL variants by base so we can find the largest source + detect existing widths.
const groups = new Map<string, MediaEntry[]>();
for (const e of Object.values(manifest.media)) {
	if (!e.r2Url) continue;
	const base = baseOf(e.r2Url);
	if (!groups.has(base)) groups.set(base, []);
	groups.get(base)!.push(e);
}

// Collect the set of cover bases from blog frontmatter (only CDN-hosted covers).
const coverBases = new Set<string>();
for (const file of readdirSync(BLOG_DIR).filter((f) => f.endsWith('.svx'))) {
	const raw = readFileSync(resolve(BLOG_DIR, file), 'utf8');
	const m = raw.match(/^coverImage:\s*(.+)$/m);
	if (!m) continue;
	const cover = m[1].trim().replace(/^["']|["']$/g, '');
	if (!cover.startsWith(CDN_PREFIX)) continue;
	coverBases.add(baseOf(cover));
}

function writeManifest() {
	writeFileSync(MANIFEST, JSON.stringify(manifest, null, 2) + '\n', 'utf8');
}

async function cwebpResize(input: string, output: string): Promise<void> {
	const proc = Bun.spawn(['cwebp', '-quiet', '-resize', String(TARGET), '0', '-q', '82', input, '-o', output]);
	const code = await proc.exited;
	if (code !== 0) throw new Error(`cwebp failed (${code}) for ${input}`);
}

let made = 0;
let skipped = 0;
let i = 0;
for (const base of coverBases) {
	i++;
	const list = groups.get(base);
	if (!list || list.length === 0) { skipped++; continue; }
	if (list.some((e) => e.width === TARGET)) { skipped++; continue; }
	const full = list.reduce((a, b) => (b.width > a.width ? b : a));
	if (!full.width || full.width <= TARGET) { skipped++; continue; }
	if (/svg|avif/i.test(full.mimeType ?? '')) { skipped++; continue; }

	const h = Math.round(TARGET * (full.height / full.width));
	const key = `${baseOf(full.r2Key)}-${TARGET}x${h}.webp`;
	const url = buildCdnUrl(key);
	const fileName = key.split('/').pop()!;

	try {
		const { tempPath, cleanup } = await downloadImage(full.r2Url);
		const out = `${tempPath}.600.webp`;
		await cwebpResize(tempPath, out);
		await uploadToR2(key, out, false);
		cleanup();

		manifest.media[key] = {
			...full,
			r2Key: key,
			r2Url: url,
			cdnUrl: url,
			fileName,
			mimeType: 'image/webp',
			width: TARGET,
			height: h,
			// Generated variant — unique key/originalUrl so it never clobbers a real attachment entry.
			originalUrl: url
		};
		made++;
		if (made % 10 === 0) {
			writeManifest();
			console.log(`[600] ${i}/${coverBases.size} — ${made} made, ${skipped} skipped (checkpoint)`);
		}
	} catch (err) {
		console.error(`[600] FAILED ${base}:`, err instanceof Error ? err.message : err);
	}
}

writeManifest();
console.log(`[600] DONE — ${made} variants generated, ${skipped} skipped, ${coverBases.size} cover bases total.`);
