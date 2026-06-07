/**
 * Manifest builder — creates, merges and persists the migration manifest.
 *
 * Design §4 — Idempotency strategy.
 * ADR-005: Manifest lives at scripts/migrate-wp/manifest.json (not under src/).
 *
 * All functions are PURE (no side-effects on inputs). The I/O helpers
 * (readManifest / writeManifest) are the only functions with disk access.
 */
import { readFileSync, writeFileSync, existsSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';
import type { Manifest, MediaEntry, PostEntry } from './types';
import { buildUrlVariantMap } from './url-rewriter';

const __dirname = dirname(fileURLToPath(import.meta.url));
export const MANIFEST_PATH = resolve(__dirname, 'manifest.json');

const SOURCE_URL = 'https://malagaeventgear.com';
const CDN_BASE = 'https://cdn.malagaeventgear.com';
const R2_BUCKET = 'meg-blog-media';

// ---------------------------------------------------------------------------
// Pure factory / merge functions (testable without disk)
// ---------------------------------------------------------------------------

/** Creates a fresh, empty manifest with correct defaults. */
export function createEmptyManifest(): Manifest {
	return {
		version: 1,
		generatedAt: new Date().toISOString(),
		sourceUrl: SOURCE_URL,
		r2Bucket: R2_BUCKET,
		cdnBase: CDN_BASE,
		urlVariantMap: {},
		media: {},
		posts: [],
	};
}

/**
 * Returns a new manifest with the given MediaEntry merged in.
 * Keyed by originalUrl — idempotent if same entry is merged twice.
 * Does NOT mutate the input manifest.
 */
export function mergeMediaEntry(manifest: Manifest, entry: MediaEntry): Manifest {
	const media = { ...manifest.media, [entry.originalUrl]: entry };
	// Rebuild variant map from all current entries
	const urlVariantMap = buildUrlVariantMap(Object.values(media));
	return { ...manifest, media, urlVariantMap, generatedAt: new Date().toISOString() };
}

/**
 * Returns a new manifest with the given PostEntry merged in.
 * Replaces existing entry with same wpId (idempotent re-run).
 * Does NOT mutate the input manifest.
 */
export function mergePostEntry(manifest: Manifest, post: PostEntry): Manifest {
	const existing = manifest.posts.filter((p) => p.wpId !== post.wpId);
	return { ...manifest, posts: [...existing, post], generatedAt: new Date().toISOString() };
}

// ---------------------------------------------------------------------------
// I/O helpers
// ---------------------------------------------------------------------------

/** Reads manifest.json from disk, or returns an empty manifest if it does not exist. */
export function readManifest(): Manifest {
	if (!existsSync(MANIFEST_PATH)) {
		return createEmptyManifest();
	}
	const raw = readFileSync(MANIFEST_PATH, 'utf-8');
	return JSON.parse(raw) as Manifest;
}

/** Writes manifest to disk (pretty-printed JSON). */
export function writeManifest(manifest: Manifest): void {
	writeFileSync(MANIFEST_PATH, JSON.stringify(manifest, null, 2) + '\n', 'utf-8');
}
