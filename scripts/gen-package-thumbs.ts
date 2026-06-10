#!/usr/bin/env bun
/**
 * Generates square 160x160 WebP thumbnails for each package image.
 *
 * Why: packages.ts `image` points at the full /images/packages/<slug>.webp (800x800, 70–120 KiB),
 * but PackagesRail (≈48px) and PostCTA (80px) render it tiny — wasting ~225 KiB per blog post.
 * 160px = 80px display × 2 DPR → crisp on retina, ~5–8 KiB each.
 *
 * Idempotent: regenerates the thumb each run (cheap). Source must be a square <slug>.webp.
 * Run: `bun scripts/gen-package-thumbs.ts`  (needs cwebp)
 */
import { readdirSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const DIR = resolve(dirname(fileURLToPath(import.meta.url)), '../static/images/packages');
const SIZE = 160;

// Source images: <slug>.webp, excluding the existing -mobile/-desktop/-thumb variants.
const sources = readdirSync(DIR).filter(
	(f) => f.endsWith('.webp') && !/-(mobile|desktop|thumb)\.webp$/.test(f)
);

async function cwebpResize(input: string, output: string): Promise<void> {
	const proc = Bun.spawn(
		['cwebp', '-quiet', '-resize', String(SIZE), String(SIZE), '-q', '82', input, '-o', output],
		{ stderr: 'inherit' }
	);
	const code = await proc.exited;
	if (code !== 0) throw new Error(`cwebp failed (${code}) for ${input}`);
}

let made = 0;
for (const file of sources) {
	const input = resolve(DIR, file);
	const output = resolve(DIR, file.replace('.webp', '-thumb.webp'));
	await cwebpResize(input, output);
	made++;
	console.log(`[thumb] ${file} → ${file.replace('.webp', '-thumb.webp')} (${SIZE}x${SIZE})`);
}

console.log(`[thumb] DONE — ${made} thumbnails generated in ${DIR}`);
