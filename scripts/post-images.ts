#!/usr/bin/env bun
/**
 * post-images.ts — Pipeline de imágenes para posts (WebP + AVIF → Cloudflare R2/CDN)
 *
 * Toma las imágenes fuente de `assets/` (cualquier formato), genera variantes responsive
 * en WebP y AVIF para todos los viewports, las sube a R2 siguiendo el MISMO estándar de las
 * imágenes migradas de WordPress (`blog/<id>/<base>[-WxH].<ext>`), persiste referencias +
 * metadatos en el mismo `scripts/migrate-wp/manifest.json`, e imprime/escribe en
 * `assets/_urls.txt` el markup `<picture>` listo para pegar en el post.
 *
 * Uso:
 *   bun scripts/post-images.ts                 # procesa todo assets/
 *   bun scripts/post-images.ts test            # solo assets/test/
 *   bun scripts/post-images.ts --dry-run       # no encodea ni sube; muestra qué haría
 *
 * Requisitos para subir (no en dry-run): wrangler logueado en la cuenta cc26ab18…
 *   export CLOUDFLARE_ACCOUNT_ID=cc26ab18f887fb1c63c19e17a0bb313f
 *
 * Env knobs:
 *   WIDTHS="150,300,400,600,768,1024,1536"   ladder de anchos (default)
 *   WEBP_QUALITY=82                          calidad cwebp/sharp WebP (default 82)
 *   AVIF_QUALITY=50                          calidad AVIF (default 50)
 *   FORCE=1                                  re-encodea/sube aunque el sourceHash ya exista
 *
 * Metadata semántica (opcional): `assets/<carpeta>/meta.yaml` mapeando
 *   <filename> → { alt, caption, title, description, tags: [...], usage: [...] }
 * Se combina con la metadata técnica auto-derivada (sharp) y se persiste en el manifest.
 *
 * Solo las funciones puras de abajo se testean (post-images.test.ts). La orquestación (I/O,
 * sharp, upload) corre únicamente cuando el script se invoca directo (import.meta.main).
 */
import { createHash } from 'node:crypto';
import {
	readdirSync,
	readFileSync,
	existsSync,
	statSync,
	mkdtempSync,
	rmSync,
	appendFileSync,
	writeFileSync
} from 'node:fs';
import { join, resolve, dirname, basename, relative } from 'node:path';
import { tmpdir } from 'node:os';
import { fileURLToPath } from 'node:url';
import { load as loadYaml } from 'js-yaml';
import type { Manifest, MediaEntry } from './migrate-wp/types';

// ───────────────────────────────────────────────────────────────────────────────
// Constants (mirror the migration standard)
// ───────────────────────────────────────────────────────────────────────────────

const CDN_BASE = 'https://cdn.malagaeventgear.com';

/** Prose column is max-w-3xl (768px); below that full-bleed. Same value as rehype-blog-images. */
export const VARIANT_SIZES = '(min-width: 768px) 768px, calc(100vw - 2rem)';

/** Width below which the <img> fallback prefers the smallest variant ≥ this rung. */
const FALLBACK_TARGET = 1024;

/** Default responsive ladder — matches the widths present in the WP-migrated corpus. */
const DEFAULT_WIDTHS = [150, 300, 400, 600, 768, 1024, 1536];

/** Source formats sharp can read that we accept as input. */
const INPUT_EXT = /\.(jpe?g|png|webp|avif|gif|tiff?|bmp)$/i;

// ───────────────────────────────────────────────────────────────────────────────
// Pure functions (unit-tested)
// ───────────────────────────────────────────────────────────────────────────────

/** Semantic, author-supplied metadata for one image (from the sidecar meta.yaml). */
export interface ImageMeta {
	alt: string;
	caption: string;
	title: string;
	description: string;
	tags: string[];
	/** When/where to use the image: cover | hero | gallery | body | og … */
	usage: string[];
}

/** One responsive rendition of an image, with both format URLs. */
export interface VariantRef {
	width: number;
	height: number;
	webpUrl: string;
	avifUrl: string;
}

/** Input to buildMediaEntry — everything needed to persist one WebP variant. */
export interface BuildEntryInput {
	id: number;
	base: string;
	width: number;
	height: number;
	fileSize: number;
	/** CDN URL of this WebP variant (its own canonical key). */
	cdnUrl: string;
	/** CDN URL of the sibling AVIF rendition. */
	avifUrl: string;
	sourceHash: string;
	author: string;
	uploadedOn: string;
	meta: ImageMeta;
}

/**
 * Sanitizes a file name into a safe R2 base name.
 * Drops a known image extension, lowercases, strips accents, and replaces unsafe runs with
 * a single hyphen. Preserves underscores and dots (WordPress-style names like
 * "2026.05.22-23-Bmotion" or "wedding_rings_heart_book").
 */
export function sanitizeBaseName(name: string): string {
	return name
		.replace(INPUT_EXT, '')
		.toLowerCase()
		.normalize('NFD')
		.replace(/\p{Mn}/gu, '')
		.replace(/[^a-z0-9._-]+/g, '-')
		.replace(/-+/g, '-')
		.replace(/^[-._]+|[-._]+$/g, '');
}

/** Returns the ladder widths strictly smaller than the original (no upscaling), ascending. */
export function ladderFor(originalWidth: number, widths: number[]): number[] {
	return [...widths].filter((w) => w < originalWidth).sort((a, b) => a - b);
}

/** Height that preserves aspect ratio for a target width (rounded). */
export function heightFor(targetWidth: number, origWidth: number, origHeight: number): number {
	return Math.round(targetWidth * (origHeight / origWidth));
}

/** R2 key for a sized variant: blog/<id>/<base>-<w>x<h>.<ext>. */
export function buildVariantKey(
	id: number,
	base: string,
	w: number,
	h: number,
	ext: 'webp' | 'avif'
): string {
	return `blog/${id}/${base}-${w}x${h}.${ext}`;
}

/** R2 key for the full-size (unsuffixed) image: blog/<id>/<base>.<ext>. */
export function buildFullKey(id: number, base: string, ext: 'webp' | 'avif'): string {
	return `blog/${id}/${base}.${ext}`;
}

/** Extracts the numeric id from an R2 key (blog/<id>/…), or undefined. */
export function idFromKey(key: string): number | undefined {
	const m = key.match(/^blog\/(\d+)\//);
	return m ? Number(m[1]) : undefined;
}

/** Highest wpId across all media entries (0 if none). */
export function maxMediaId(manifest: Manifest): number {
	let max = 0;
	for (const e of Object.values(manifest.media)) {
		if (typeof e.wpId === 'number' && e.wpId > max) max = e.wpId;
	}
	return max;
}

/** Finds a media entry by its sourceHash (idempotency lookup), or undefined. */
export function findBySourceHash(manifest: Manifest, hash: string): MediaEntry | undefined {
	return Object.values(manifest.media).find((e) => e.sourceHash === hash);
}

/** Builds a WebP MediaEntry keyed by its own CDN url (mirrors gen-cover-variants). */
export function buildMediaEntry(i: BuildEntryInput): MediaEntry {
	const r2Key = i.cdnUrl.startsWith(CDN_BASE + '/')
		? i.cdnUrl.slice(CDN_BASE.length + 1)
		: i.cdnUrl;
	return {
		wpId: i.id,
		r2Key,
		r2Url: i.cdnUrl,
		cdnUrl: i.cdnUrl,
		category: 'blog',
		tags: i.meta.tags,
		fileName: r2Key.split('/').pop() ?? '',
		title: i.meta.title,
		alt: i.meta.alt,
		caption: i.meta.caption,
		description: i.meta.description,
		mimeType: 'image/webp',
		fileSize: i.fileSize,
		width: i.width,
		height: i.height,
		uploadedOn: i.uploadedOn,
		uploadedBy: i.author,
		originalUrl: i.cdnUrl,
		excludeFromSitemap: false,
		usage: i.meta.usage,
		avifUrl: i.avifUrl,
		sourceHash: i.sourceHash
	};
}

/** Minimal HTML attribute escaping for the alt text. */
function escapeHtml(s: string): string {
	return s
		.replace(/&/g, '&amp;')
		.replace(/</g, '&lt;')
		.replace(/>/g, '&gt;')
		.replace(/"/g, '&quot;');
}

/**
 * Builds a <picture> with an AVIF source (first), a WebP source, and a WebP <img> fallback.
 * The browser negotiates AVIF → WebP → <img>. Variants need not be pre-sorted.
 */
export function buildPictureMarkup(variants: VariantRef[], alt: string): string {
	const sorted = [...variants].sort((a, b) => a.width - b.width);
	const avifSrcset = sorted.map((v) => `${v.avifUrl} ${v.width}w`).join(', ');
	const webpSrcset = sorted.map((v) => `${v.webpUrl} ${v.width}w`).join(', ');
	const fallback = sorted.find((v) => v.width >= FALLBACK_TARGET) ?? sorted[sorted.length - 1];
	const a = escapeHtml(alt);
	return [
		'<picture>',
		`  <source type="image/avif" sizes="${VARIANT_SIZES}" srcset="${avifSrcset}">`,
		`  <source type="image/webp" sizes="${VARIANT_SIZES}" srcset="${webpSrcset}">`,
		`  <img src="${fallback.webpUrl}" width="${fallback.width}" height="${fallback.height}" alt="${a}" loading="lazy" decoding="async">`,
		'</picture>'
	].join('\n');
}

// ───────────────────────────────────────────────────────────────────────────────
// I/O + orchestration (runs only when invoked directly — not on import)
// ───────────────────────────────────────────────────────────────────────────────

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const ASSETS_DIR = resolve(ROOT, 'assets');
const URLS_FILE = resolve(ASSETS_DIR, '_urls.txt');
const AUTHOR = 'Hector Luis Lorenzo';

const EMPTY_META: ImageMeta = {
	alt: '',
	caption: '',
	title: '',
	description: '',
	tags: [],
	usage: []
};

/** Recursively collects input image files under `dir`, skipping dotfiles and sidecars. */
function collectImages(dir: string): string[] {
	const out: string[] = [];
	for (const ent of readdirSync(dir, { withFileTypes: true })) {
		if (ent.name.startsWith('.') || ent.name.startsWith('_')) continue;
		const full = join(dir, ent.name);
		if (ent.isDirectory()) {
			out.push(...collectImages(full));
		} else if (INPUT_EXT.test(ent.name)) {
			out.push(full);
		}
	}
	return out;
}

/** Loads the optional meta sidecar (meta.yaml | meta.json) from an image's directory. */
function loadDirMeta(dir: string): Record<string, Partial<ImageMeta>> {
	for (const name of ['meta.yaml', 'meta.yml', 'meta.json']) {
		const p = join(dir, name);
		if (!existsSync(p)) continue;
		const raw = readFileSync(p, 'utf8');
		const parsed = name.endsWith('.json') ? JSON.parse(raw) : loadYaml(raw);
		return (parsed ?? {}) as Record<string, Partial<ImageMeta>>;
	}
	return {};
}

/** Normalizes a partial sidecar entry into a full ImageMeta. */
function resolveMeta(partial: Partial<ImageMeta> | undefined): ImageMeta {
	if (!partial) return { ...EMPTY_META };
	const toArr = (v: unknown): string[] =>
		Array.isArray(v) ? v.map(String) : typeof v === 'string' && v ? [v] : [];
	return {
		alt: partial.alt ?? '',
		caption: partial.caption ?? '',
		title: partial.title ?? '',
		description: partial.description ?? '',
		tags: toArr(partial.tags),
		usage: toArr(partial.usage)
	};
}

function sha256File(path: string): string {
	return createHash('sha256').update(readFileSync(path)).digest('hex');
}

async function main(): Promise<void> {
	const args = process.argv.slice(2);
	const dryRun = args.includes('--dry-run');
	const force = process.env.FORCE === '1';
	const widths = (process.env.WIDTHS ?? DEFAULT_WIDTHS.join(','))
		.split(',')
		.map((s) => Number(s.trim()))
		.filter((n) => Number.isFinite(n) && n > 0);
	const webpQuality = Number(process.env.WEBP_QUALITY ?? 82);
	const avifQuality = Number(process.env.AVIF_QUALITY ?? 50);
	const subpath = args.find((a) => !a.startsWith('-'));

	if (!existsSync(ASSETS_DIR)) {
		console.error(`[post-images] No existe ${ASSETS_DIR}. Creá la carpeta y poné imágenes adentro.`);
		process.exit(1);
	}

	const scanRoot = subpath ? resolve(ASSETS_DIR, subpath) : ASSETS_DIR;
	const images = collectImages(scanRoot);
	if (images.length === 0) {
		console.log(`[post-images] No se encontraron imágenes en ${relative(ROOT, scanRoot)}/`);
		return;
	}

	// Lazy import sharp + manifest helpers so test imports never load native bindings.
	const sharp = (await import('sharp')).default;
	const { readManifest, writeManifest, mergeMediaEntry } = await import('./migrate-wp/manifest');

	let manifest = readManifest();
	const uploadMod = await import('./migrate-wp/r2-uploader');
	const { uploadToR2, buildCdnUrl } = uploadMod;

	const uploadedOn = new Date().toISOString();
	const tmp = mkdtempSync(join(tmpdir(), 'post-images-'));
	const blocks: string[] = [];
	let processed = 0;
	let skipped = 0;
	// Track ids allocated in THIS run so multiple images don't collide before the manifest is rewritten.
	let nextId = maxMediaId(manifest) + 1;

	const metaCache = new Map<string, Record<string, Partial<ImageMeta>>>();

	try {
		for (const srcPath of images) {
			const dir = dirname(srcPath);
			const fileName = basename(srcPath);
			if (!metaCache.has(dir)) metaCache.set(dir, loadDirMeta(dir));
			const meta = resolveMeta(metaCache.get(dir)![fileName]);
			const base = sanitizeBaseName(fileName);
			const hash = sha256File(srcPath);

			// Idempotency: same source bytes already published → reuse id, skip (unless FORCE).
			const existing = findBySourceHash(manifest, hash);
			let id: number;
			if (existing) {
				id = idFromKey(existing.r2Key) ?? nextId++;
				if (!force) {
					console.log(`[post-images] skip (ya publicada, sourceHash) → ${relative(ROOT, srcPath)} (blog/${id}/)`);
					skipped++;
					continue;
				}
			} else {
				id = nextId++;
			}

			const sharpMeta = await sharp(srcPath).metadata();
			const origW = sharpMeta.width ?? 0;
			const origH = sharpMeta.height ?? 0;
			if (!origW || !origH) {
				console.warn(`[post-images] no pude leer dimensiones de ${fileName} — salteando.`);
				continue;
			}

			// Rungs: every ladder width < original, plus the full-size (null = no resize).
			const rungs: (number | null)[] = [...ladderFor(origW, widths), null];
			const variants: VariantRef[] = [];

			console.log(`\n[post-images] ${relative(ROOT, srcPath)} → blog/${id}/${base} (${origW}×${origH})`);

			for (const rung of rungs) {
				if (dryRun) {
					const w = rung ?? origW;
					const h = rung ? heightFor(rung, origW, origH) : origH;
					const webpKey = rung ? buildVariantKey(id, base, w, h, 'webp') : buildFullKey(id, base, 'webp');
					const avifKey = rung ? buildVariantKey(id, base, w, h, 'avif') : buildFullKey(id, base, 'avif');
					console.log(`  DRY-RUN → ${webpKey}  |  ${avifKey}`);
					variants.push({ width: w, height: h, webpUrl: buildCdnUrl(webpKey), avifUrl: buildCdnUrl(avifKey) });
					continue;
				}

				// Encode WebP (resize if rung set), read ACTUAL output dims for exact key naming.
				const webpTmp = join(tmp, `${base}-${rung ?? 'full'}.webp`);
				let w = sharp(srcPath, { failOn: 'none' });
				if (rung) w = w.resize({ width: rung, withoutEnlargement: true });
				const webpInfo = await w.webp({ quality: webpQuality }).toFile(webpTmp);

				const avifTmp = join(tmp, `${base}-${rung ?? 'full'}.avif`);
				let a = sharp(srcPath, { failOn: 'none' });
				if (rung) a = a.resize({ width: rung, withoutEnlargement: true });
				const avifInfo = await a.avif({ quality: avifQuality }).toFile(avifTmp);

				const ow = webpInfo.width;
				const oh = webpInfo.height;
				const webpKey = rung ? buildVariantKey(id, base, ow, oh, 'webp') : buildFullKey(id, base, 'webp');
				const avifKey = rung ? buildVariantKey(id, base, ow, oh, 'avif') : buildFullKey(id, base, 'avif');

				await uploadToR2(webpKey, webpTmp, false);
				await uploadToR2(avifKey, avifTmp, false);

				const webpUrl = buildCdnUrl(webpKey);
				const avifUrl = buildCdnUrl(avifKey);
				variants.push({ width: ow, height: oh, webpUrl, avifUrl });

				// Persist the WebP variant (refs + metadata) into the shared manifest.
				manifest = mergeMediaEntry(
					manifest,
					buildMediaEntry({
						id,
						base,
						width: ow,
						height: oh,
						fileSize: webpInfo.size,
						cdnUrl: webpUrl,
						avifUrl,
						sourceHash: hash,
						author: AUTHOR,
						uploadedOn,
						meta
					})
				);
			}

			if (!dryRun) writeManifest(manifest);

			// Build the ready-to-paste block for this image.
			const picture = buildPictureMarkup(variants, meta.alt);
			const usageStr = meta.usage.length ? meta.usage.join(', ') : '—';
			const tagsStr = meta.tags.length ? meta.tags.join(', ') : '—';
			const urlList = variants
				.flatMap((v) => [v.webpUrl, v.avifUrl])
				.map((u) => `  ${u}`)
				.join('\n');
			blocks.push(
				[
					`# ${base} — id blog/${id} — ${origW}×${origH}`,
					`# usage: ${usageStr} | tags: ${tagsStr} | alt: ${meta.alt || '—'}`,
					picture,
					'# URLs:',
					urlList,
					''
				].join('\n')
			);
			processed++;
		}
	} finally {
		rmSync(tmp, { recursive: true, force: true });
	}

	// Emit to console + assets/_urls.txt.
	const output = blocks.join('\n');
	if (output) {
		console.log('\n' + '═'.repeat(72) + '\n' + output);
		if (!dryRun) {
			const header = `# Generado por post-images.ts — ${uploadedOn}\n# Pegá el bloque <picture> correspondiente en tu .svx.\n\n`;
			if (existsSync(URLS_FILE)) {
				appendFileSync(URLS_FILE, '\n' + output);
			} else {
				writeFileSync(URLS_FILE, header + output);
			}
			console.log(`\n[post-images] Referencias escritas en ${relative(ROOT, URLS_FILE)}`);
		}
	}

	console.log(
		`\n[post-images] ${dryRun ? 'DRY-RUN — ' : ''}${processed} imágenes procesadas, ${skipped} salteadas.`
	);
}

if (import.meta.main) {
	main().catch((err) => {
		console.error('[post-images] ERROR:', err instanceof Error ? err.message : err);
		process.exit(1);
	});
}
