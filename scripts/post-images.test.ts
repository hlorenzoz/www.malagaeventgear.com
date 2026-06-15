/**
 * Tests para la lógica pura de post-images.ts
 *
 * Solo se testean las funciones puras (sin I/O: sin sharp, sin fs, sin upload a R2).
 * El orquestador (main) está guardado tras `import.meta.main`, así que importar este
 * módulo no dispara ninguna conversión ni subida.
 */
import { describe, it, expect } from 'vitest';
import {
	sanitizeBaseName,
	ladderFor,
	heightFor,
	buildVariantKey,
	buildFullKey,
	idFromKey,
	maxMediaId,
	findBySourceHash,
	buildMediaEntry,
	buildPictureMarkup,
	VARIANT_SIZES,
	type VariantRef
} from './post-images';
import type { Manifest, MediaEntry } from './migrate-wp/types';

// ── sanitizeBaseName ──────────────────────────────────────────────────────────
describe('sanitizeBaseName', () => {
	it('lowercases and replaces spaces with hyphens', () => {
		expect(sanitizeBaseName('Hero Photo')).toBe('hero-photo');
	});

	it('strips accents (NFD)', () => {
		expect(sanitizeBaseName('Málaga Cámara')).toBe('malaga-camara');
	});

	it('preserves underscores and dots (WordPress-style names)', () => {
		expect(sanitizeBaseName('wedding_rings_heart_book')).toBe('wedding_rings_heart_book');
		expect(sanitizeBaseName('2026.05.22-23-Bmotion')).toBe('2026.05.22-23-bmotion');
	});

	it('collapses runs of unsafe chars into a single hyphen and trims', () => {
		expect(sanitizeBaseName('  A & B!!  ')).toBe('a-b');
	});

	it('drops a file extension if one is passed in', () => {
		expect(sanitizeBaseName('Sample Photo.JPG')).toBe('sample-photo');
	});
});

// ── ladderFor ─────────────────────────────────────────────────────────────────
describe('ladderFor', () => {
	const widths = [150, 300, 400, 600, 768, 1024, 1536];

	it('keeps only widths strictly smaller than the original (no upscaling)', () => {
		expect(ladderFor(1000, widths)).toEqual([150, 300, 400, 600, 768]);
	});

	it('returns all widths when original is larger than every rung', () => {
		expect(ladderFor(4000, widths)).toEqual(widths);
	});

	it('returns empty when original is smaller than the smallest rung', () => {
		expect(ladderFor(120, widths)).toEqual([]);
	});

	it('excludes a width equal to the original', () => {
		expect(ladderFor(768, widths)).toEqual([150, 300, 400, 600]);
	});
});

// ── heightFor ───────────────────────────────────────────────────────────────--
describe('heightFor', () => {
	it('preserves aspect ratio (rounded)', () => {
		expect(heightFor(400, 1200, 800)).toBe(267); // 400 * 800/1200 = 266.67
		expect(heightFor(768, 1024, 683)).toBe(512); // 768 * 683/1024 = 512.25
	});
});

// ── key builders ────────────────────────────────────────────────────────────--
describe('key builders', () => {
	it('buildVariantKey follows blog/<id>/<base>-<w>x<h>.<ext>', () => {
		expect(buildVariantKey(4001, 'hero', 400, 267, 'webp')).toBe('blog/4001/hero-400x267.webp');
		expect(buildVariantKey(4001, 'hero', 400, 267, 'avif')).toBe('blog/4001/hero-400x267.avif');
	});

	it('buildFullKey follows blog/<id>/<base>.<ext> (no suffix)', () => {
		expect(buildFullKey(4001, 'hero', 'webp')).toBe('blog/4001/hero.webp');
		expect(buildFullKey(4001, 'hero', 'avif')).toBe('blog/4001/hero.avif');
	});

	it('idFromKey extracts the numeric id from an R2 key', () => {
		expect(idFromKey('blog/4001/hero-400x267.webp')).toBe(4001);
		expect(idFromKey('blog/3093/x.webp')).toBe(3093);
		expect(idFromKey('not-a-blog-key')).toBeUndefined();
	});
});

// ── id allocation + idempotency ───────────────────────────────────────────────
function makeManifest(entries: Partial<MediaEntry>[]): Manifest {
	const media: Record<string, MediaEntry> = {};
	for (const e of entries) {
		const full = { wpId: 0, r2Key: '', r2Url: '', originalUrl: '', ...e } as MediaEntry;
		media[full.originalUrl || full.r2Url || String(full.wpId)] = full;
	}
	return {
		version: 1,
		generatedAt: '',
		sourceUrl: '',
		r2Bucket: 'images',
		cdnBase: 'https://cdn.malagaeventgear.com',
		urlVariantMap: {},
		media,
		posts: []
	};
}

describe('maxMediaId', () => {
	it('returns the highest wpId across media entries', () => {
		const m = makeManifest([{ wpId: 100 }, { wpId: 3093 }, { wpId: 42 }]);
		expect(maxMediaId(m)).toBe(3093);
	});

	it('returns 0 for an empty manifest', () => {
		expect(maxMediaId(makeManifest([]))).toBe(0);
	});
});

describe('findBySourceHash', () => {
	it('finds an existing entry by sourceHash', () => {
		const m = makeManifest([
			{ wpId: 4001, r2Key: 'blog/4001/a.webp', sourceHash: 'abc' },
			{ wpId: 4002, r2Key: 'blog/4002/b.webp', sourceHash: 'def' }
		]);
		expect(findBySourceHash(m, 'def')?.wpId).toBe(4002);
	});

	it('returns undefined when no entry matches', () => {
		const m = makeManifest([{ wpId: 4001, sourceHash: 'abc' }]);
		expect(findBySourceHash(m, 'zzz')).toBeUndefined();
	});
});

// ── buildMediaEntry ─────────────────────────────────────────────────────────--
describe('buildMediaEntry', () => {
	const base = {
		id: 4001,
		base: 'hero',
		width: 768,
		height: 512,
		fileSize: 12345,
		cdnUrl: 'https://cdn.malagaeventgear.com/blog/4001/hero-768x512.webp',
		avifUrl: 'https://cdn.malagaeventgear.com/blog/4001/hero-768x512.avif',
		sourceHash: 'abc123',
		author: 'Hector Luis Lorenzo',
		uploadedOn: '2026-06-15T00:00:00.000Z',
		meta: {
			alt: 'Equipo de sonido en yate',
			caption: '',
			title: 'Hero',
			description: '',
			tags: ['audio', 'yate'],
			usage: ['hero', 'cover']
		}
	};

	it('builds a WebP MediaEntry keyed by its own CDN url', () => {
		const e = buildMediaEntry(base);
		expect(e.r2Key).toBe('blog/4001/hero-768x512.webp');
		expect(e.r2Url).toBe(base.cdnUrl);
		expect(e.originalUrl).toBe(base.cdnUrl);
		expect(e.mimeType).toBe('image/webp');
		expect(e.wpId).toBe(4001);
		expect(e.width).toBe(768);
		expect(e.height).toBe(512);
		expect(e.category).toBe('blog');
	});

	it('carries semantic metadata, usage, avifUrl and sourceHash', () => {
		const e = buildMediaEntry(base);
		expect(e.alt).toBe('Equipo de sonido en yate');
		expect(e.tags).toEqual(['audio', 'yate']);
		expect(e.usage).toEqual(['hero', 'cover']);
		expect(e.avifUrl).toBe(base.avifUrl);
		expect(e.sourceHash).toBe('abc123');
		expect(e.uploadedBy).toBe('Hector Luis Lorenzo');
	});
});

// ── buildPictureMarkup ──────────────────────────────────────────────────────--
describe('buildPictureMarkup', () => {
	const variants: VariantRef[] = [
		{
			width: 400,
			height: 267,
			webpUrl: 'https://cdn.malagaeventgear.com/blog/4001/hero-400x267.webp',
			avifUrl: 'https://cdn.malagaeventgear.com/blog/4001/hero-400x267.avif'
		},
		{
			width: 1024,
			height: 683,
			webpUrl: 'https://cdn.malagaeventgear.com/blog/4001/hero-1024x683.webp',
			avifUrl: 'https://cdn.malagaeventgear.com/blog/4001/hero-1024x683.avif'
		},
		{
			width: 1536,
			height: 1024,
			webpUrl: 'https://cdn.malagaeventgear.com/blog/4001/hero-1536x1024.webp',
			avifUrl: 'https://cdn.malagaeventgear.com/blog/4001/hero-1536x1024.avif'
		}
	];

	it('emits avif source first, then webp source, then img fallback', () => {
		const html = buildPictureMarkup(variants, 'Foto de prueba');
		const avifIdx = html.indexOf('type="image/avif"');
		const webpIdx = html.indexOf('type="image/webp"');
		const imgIdx = html.indexOf('<img');
		expect(avifIdx).toBeGreaterThan(-1);
		expect(avifIdx).toBeLessThan(webpIdx);
		expect(webpIdx).toBeLessThan(imgIdx);
	});

	it('builds width-descriptor srcsets per format', () => {
		const html = buildPictureMarkup(variants, 'x');
		expect(html).toContain('hero-400x267.avif 400w');
		expect(html).toContain('hero-1536x1024.avif 1536w');
		expect(html).toContain('hero-400x267.webp 400w');
		expect(html).toContain(`sizes="${VARIANT_SIZES}"`);
	});

	it('uses the smallest variant >= 1024 as the <img> fallback src + dimensions', () => {
		const html = buildPictureMarkup(variants, 'x');
		expect(html).toContain('src="https://cdn.malagaeventgear.com/blog/4001/hero-1024x683.webp"');
		expect(html).toContain('width="1024"');
		expect(html).toContain('height="683"');
	});

	it('falls back to the largest variant when none reaches 1024', () => {
		const small = variants.slice(0, 1); // only 400w
		const html = buildPictureMarkup(small, 'x');
		expect(html).toContain('src="https://cdn.malagaeventgear.com/blog/4001/hero-400x267.webp"');
		expect(html).toContain('width="400"');
	});

	it('escapes the alt text', () => {
		const html = buildPictureMarkup(variants, 'Comillas "dobles" & ampersand');
		expect(html).toContain('alt="Comillas &quot;dobles&quot; &amp; ampersand"');
	});

	it('sets loading=lazy and decoding=async on the fallback img', () => {
		const html = buildPictureMarkup(variants, 'x');
		expect(html).toContain('loading="lazy"');
		expect(html).toContain('decoding="async"');
	});
});
