#!/usr/bin/env bun
/**
 * WP → mdsvex Migration Script
 *
 * Usage:
 *   bun scripts/migrate-wp/index.ts [--dry-run]
 *
 * --dry-run: Fetch WP data, log what would be done. NO file writes, NO R2 uploads.
 *            Makes only READ-ONLY GET requests to the live WP REST API.
 *
 * Env vars:
 *   WP_BASE_URL     - WP REST API base (default: https://malagaeventgear.com/wp-json/wp/v2)
 *   CLOUDFLARE_ACCOUNT_ID - Set automatically in r2-uploader (cc26ab18f887fb1c63c19e17a0bb313f)
 *
 * SC-MIG-01–12, SC-CDN-04–07, W-01, S-01
 */
import { fetchPosts, fetchCategories } from './wp-client';
import { downloadImage } from './downloader';
import { uploadToR2, buildCdnUrl } from './r2-uploader';
import { htmlToMarkdown } from './turndown';
import { rewriteUrls, buildUrlVariantMap } from './url-rewriter';
import { buildFrontmatter } from './frontmatter';
import { emitSvx } from './emitter';
import {
	readManifest,
	writeManifest,
	mergeMediaEntry,
	mergePostEntry,
} from './manifest';
import { generateRedirectsContent } from './redirects';
import type { MediaEntry, PostEntry, WpMedia } from './types';
import { slugify } from '../../src/lib/utils/slugify';
import { decodeEntities } from './decode-entities';
import { readFileSync, writeFileSync, existsSync } from 'fs';
import { resolve } from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __dirname_index = dirname(fileURLToPath(import.meta.url));
const PROJECT_ROOT_INDEX = resolve(__dirname_index, '..', '..');
const REDIRECTS_PATH = resolve(PROJECT_ROOT_INDEX, 'static', '_redirects');

const isDryRun = process.argv.includes('--dry-run');

// ---------------------------------------------------------------------------
// Media processing helpers
// ---------------------------------------------------------------------------

/**
 * Builds the R2 key for a WP attachment size variant.
 * Format: <wpId>/<fileName>
 */
function buildR2Key(wpId: number, fileName: string): string {
	return `${wpId}/${fileName}`;
}

/**
 * Extracts the file name from a URL.
 */
function fileNameFromUrl(url: string): string {
	return new URL(url).pathname.split('/').pop() ?? 'unknown.jpg';
}

/**
 * Infers the category slug for a media item based on the owning post's categories.
 * Falls back to 'blog' when no category is available.
 */
function inferCategory(post: { _embedded?: { 'wp:term'?: { name: string; taxonomy: string }[][] } }): string {
	const terms = post._embedded?.['wp:term'] ?? [];
	const cats = terms[0] ?? [];
	const firstCat = cats.find((t) => t.taxonomy === 'category');
	return firstCat ? slugify(decodeEntities(firstCat.name)) : 'blog';
}

/**
 * Processes one WP media item (attachment), downloading and uploading all size variants.
 * Returns an array of MediaEntry objects (one per size variant).
 */
async function processMediaItem(
	wpMedia: WpMedia,
	category: string,
	dryRun: boolean,
	uploadedByOverride?: string
): Promise<MediaEntry[]> {
	const entries: MediaEntry[] = [];

	// Collect all size URLs: full + all registered sizes
	const sizes = wpMedia.media_details?.sizes ?? {};
	const allVariants: Array<{
		url: string;
		fileName: string;
		width: number;
		height: number;
		fileSize: number;
		mimeType: string;
	}> = [
		{
			url: wpMedia.source_url,
			fileName: fileNameFromUrl(wpMedia.source_url),
			width: wpMedia.media_details?.width ?? 0,
			height: wpMedia.media_details?.height ?? 0,
			fileSize: wpMedia.media_details?.filesize ?? 0,
			mimeType: wpMedia.mime_type,
		},
	];

	for (const [, size] of Object.entries(sizes)) {
		allVariants.push({
			url: size.source_url,
			fileName: size.file,
			width: size.width,
			height: size.height,
			fileSize: size.filesize ?? 0,
			mimeType: size.mime_type,
		});
	}

	for (const variant of allVariants) {
		const r2Key = buildR2Key(wpMedia.id, variant.fileName);
		const cdnUrl = buildCdnUrl(r2Key);

		let fileSize = variant.fileSize;
		let mimeType = variant.mimeType;

		if (!dryRun) {
			// Download the image to a temp file
			const { tempPath, cleanup, fileSize: downloadedSize, mimeType: downloadedMime } =
				await downloadImage(variant.url);
			fileSize = downloadedSize;
			mimeType = downloadedMime;

			// Upload to R2
			await uploadToR2(r2Key, tempPath, false);
			cleanup();
		} else {
			console.log(`[dry-run] Would upload: ${variant.url} → ${cdnUrl}`);
		}

		const entry: MediaEntry = {
			wpId: wpMedia.id,
			r2Key,
			r2Url: cdnUrl,
			cdnUrl,
			category,
			tags: [],
			fileName: variant.fileName,
			title: wpMedia.title?.rendered ?? '',
			alt: wpMedia.alt_text ?? '',
			caption: wpMedia.caption?.rendered ?? '',
			description: wpMedia.description?.rendered ?? '',
			mimeType,
			fileSize,
			width: variant.width,
			height: variant.height,
			uploadedOn: wpMedia.date_gmt ?? '',
			// W-01: derive uploadedBy from post author display_name (already decoded)
			// Falls back to media's own embedded author, then 'Unknown Author'
			uploadedBy: uploadedByOverride
				?? decodeEntities(wpMedia._embedded?.author?.[0]?.name ?? 'Unknown Author'),
			originalUrl: variant.url,
			excludeFromSitemap: false,
		};

		entries.push(entry);
	}

	return entries;
}

// ---------------------------------------------------------------------------
// Audit helpers (dry-run mode)
// ---------------------------------------------------------------------------

/**
 * Performs the slug/unicode/author-collision audit.
 * Logs findings to stdout. No writes.
 */
function runAudit(posts: Awaited<ReturnType<typeof fetchPosts>>): void {
	console.log('\n========== DRY-RUN AUDIT ==========');

	// Collect all category names
	const categoryNames = new Set<string>();
	const authorNames = new Set<string>();
	const slugs = new Set<string>();
	const slugCollisions: string[] = [];

	// Author collision detection: display_names that produce the same slug
	const authorSlugMap = new Map<string, string[]>(); // slug → [display_names]

	for (const post of posts) {
		// Slug audit
		if (slugs.has(post.slug)) {
			slugCollisions.push(post.slug);
		}
		slugs.add(post.slug);

		// Category audit
		const terms = post._embedded?.['wp:term'] ?? [];
		const cats = terms[0] ?? [];
		for (const cat of cats) {
			if (cat.taxonomy === 'category') {
				categoryNames.add(decodeEntities(cat.name));
			}
		}

		// Author audit (W-01) — decode before slugifying
		const author = post._embedded?.author?.[0];
		if (author) {
			const displayName = decodeEntities(author.name);
			const slug = slugify(displayName);
			authorNames.add(displayName);
			const existing = authorSlugMap.get(slug) ?? [];
			if (!existing.includes(displayName)) {
				existing.push(displayName);
				authorSlugMap.set(slug, existing);
			}
		}
	}

	// Report slugs
	console.log(`\n--- Posts: ${posts.length} total ---`);
	if (slugCollisions.length > 0) {
		console.warn(`⚠ SLUG COLLISIONS: ${slugCollisions.join(', ')}`);
	} else {
		console.log('✓ No slug collisions');
	}

	// Report categories (unicode audit)
	console.log('\n--- Categories ---');
	for (const name of Array.from(categoryNames).sort()) {
		const slug = slugify(name);
		const hasUnicode = /[^\x00-\x7F]/.test(name);
		console.log(`  ${name} → ${slug}${hasUnicode ? ' [UNICODE]' : ''}`);
	}

	// Report authors (collision audit)
	console.log('\n--- Authors ---');
	for (const [slug, names] of authorSlugMap) {
		const collision = names.length > 1;
		console.log(
			`  ${slug}: ${names.join(', ')}${collision ? ' ⚠ COLLISION — same slug for different names!' : ''}`
		);
	}

	// Report unicode in post slugs
	const unicodeSlugs = Array.from(slugs).filter((s) => /[^\x00-\x7F]/.test(s));
	if (unicodeSlugs.length > 0) {
		console.warn('\n⚠ WP post slugs with unicode (may cause issues):');
		for (const s of unicodeSlugs) {
			console.warn(`  ${s}`);
		}
	} else {
		console.log('\n✓ No unicode in post slugs');
	}

	console.log('\n====================================\n');
}

// ---------------------------------------------------------------------------
// Main orchestrator
// ---------------------------------------------------------------------------

async function main(): Promise<void> {
	console.log(
		`[migrate-wp] Starting${isDryRun ? ' (DRY-RUN — no files will be written)' : ''}...`
	);

	// 1. Read existing manifest (for idempotency)
	let manifest = readManifest();
	console.log(
		`[migrate-wp] Manifest loaded: ${Object.keys(manifest.media).length} media, ${manifest.posts.length} posts`
	);

	// 2. Fetch all WP data (read-only GET requests)
	console.log('[migrate-wp] Fetching WordPress data...');
	const posts = await fetchPosts();
	const categories = await fetchCategories();

	// 2b. Generate redirect rules (pure — no I/O yet)
	const categorySlugs = categories.map((c) => c.slug);
	const existingRedirects = existsSync(REDIRECTS_PATH)
		? readFileSync(REDIRECTS_PATH, 'utf-8')
		: '';
	const redirectsContent = generateRedirectsContent(posts, categorySlugs, existingRedirects);
	const redirectLineCount = redirectsContent
		.split('\n')
		.filter((l) => l.trim() && !l.startsWith('#'))
		.length;

	// 3. Dry-run audit
	if (isDryRun) {
		runAudit(posts);

		// Show redirect generation sample
		console.log('\n========== REDIRECT PREVIEW ==========');
		console.log(`Would write ${redirectLineCount} redirect rules to static/_redirects`);
		const sample = redirectsContent.split('\n').slice(0, 10).join('\n');
		console.log('Sample (first 10 lines):\n' + sample);
		console.log('======================================\n');

		console.log('[migrate-wp] Dry-run complete. No files were written.');
		return;
	}

	// 4. Process media — download + upload + manifest
	console.log('[migrate-wp] Processing media...');
	let totalMediaUploaded = 0;

	for (const post of posts) {
		const category = inferCategory(post);
		const featuredMediaArr = post._embedded?.['wp:featuredmedia'] ?? [];
		// W-01: derive uploadedBy from the POST author's display_name (decoded)
		const postAuthorName = decodeEntities(
			post._embedded?.author?.[0]?.name ?? 'Unknown Author'
		);

		for (const media of featuredMediaArr as WpMedia[]) {
			// Skip if already in manifest (idempotency)
			const existingKey = Object.keys(manifest.media).find(
				(k) => manifest.media[k].wpId === media.id
			);
			if (existingKey) {
				console.log(`[migrate-wp] Skipping media ${media.id} (already in manifest)`);
				continue;
			}

			const entries = await processMediaItem(media, category, isDryRun, postAuthorName);
			for (const entry of entries) {
				manifest = mergeMediaEntry(manifest, entry);
				totalMediaUploaded++;
			}
		}
	}

	// 5. Rebuild URL variant map from all media entries
	const urlVariantMap = buildUrlVariantMap(Object.values(manifest.media));

	// 6. Process posts — convert + emit .svx
	console.log('[migrate-wp] Converting and emitting .svx files...');
	let totalPostsEmitted = 0;

	for (const post of posts) {
		const frontmatter = buildFrontmatter(post);
		const rawHtml = post.content.rendered;

		// Convert HTML → Markdown (with h1 demote, shortcode strip)
		let markdownBody = htmlToMarkdown(rawHtml, frontmatter.title);

		// Rewrite WP image URLs to CDN URLs
		try {
			markdownBody = rewriteUrls(markdownBody, urlVariantMap);
		} catch (err) {
			console.error(`[migrate-wp] ERROR in post "${post.slug}":`, err);
			process.exit(1);
		}

		// Write .svx file
		const svxPath = emitSvx(post.slug, frontmatter, markdownBody, isDryRun);

		// Record in manifest
		const postEntry: PostEntry = {
			wpId: post.id,
			slug: post.slug,
			title: frontmatter.title,
			svxPath: svxPath.replace(process.cwd() + '/', ''),
			mediaRefs: [],
		};
		manifest = mergePostEntry(manifest, postEntry);
		totalPostsEmitted++;
	}

	// 7. Write final manifest
	if (!isDryRun) {
		writeManifest(manifest);
		console.log('[migrate-wp] Manifest written.');
	}

	// 7b. Write static/_redirects (non-dry-run only — already generated above)
	writeFileSync(REDIRECTS_PATH, redirectsContent, 'utf-8');
	console.log(`[migrate-wp] static/_redirects written (${redirectLineCount} redirect rules).`);

	// 8. Final summary
	console.log('\n========== MIGRATION SUMMARY ==========');
	console.log(`Posts processed:  ${posts.length}`);
	console.log(`Posts emitted:    ${totalPostsEmitted}`);
	console.log(`Media uploaded:   ${totalMediaUploaded}`);
	console.log(`Redirect rules:   ${redirectLineCount}`);
	console.log(`Manifest entries: ${Object.keys(manifest.media).length} media, ${manifest.posts.length} posts`);
	console.log('=======================================\n');
}

main().catch((err) => {
	console.error('[migrate-wp] Fatal error:', err);
	process.exit(1);
});
