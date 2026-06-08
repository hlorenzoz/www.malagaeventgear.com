import { describe, it, expect } from 'vitest';
import { createEmptyManifest, mergeMediaEntry, mergePostEntry } from './manifest';
import type { Manifest, MediaEntry, PostEntry } from './types';

const CDN_BASE = 'https://cdn.malagaeventgear.com';
const SOURCE_URL = 'https://malagaeventgear.com';

function makeEntry(wpId: number, originalUrl: string): MediaEntry {
	return {
		wpId,
		r2Key: `${wpId}/photo.jpg`,
		r2Url: `${CDN_BASE}/${wpId}/photo.jpg`,
		cdnUrl: `${CDN_BASE}/${wpId}/photo.jpg`,
		originalUrl,
		category: 'blog',
		tags: [],
		fileName: 'photo.jpg',
		title: '',
		alt: '',
		caption: '',
		description: '',
		mimeType: 'image/jpeg',
		fileSize: 10000,
		width: 800,
		height: 600,
		uploadedOn: '2024-01-01T00:00:00Z',
		uploadedBy: 'Hector Lorenzo',
		excludeFromSitemap: false,
	};
}

function makePost(wpId: number, slug: string): PostEntry {
	return {
		wpId,
		slug,
		title: `Post ${slug}`,
		svxPath: `src/content/blog/${slug}.svx`,
		mediaRefs: [],
	};
}

describe('createEmptyManifest', () => {
	it('creates manifest with correct default values', () => {
		const m = createEmptyManifest();
		expect(m.version).toBe(1);
		expect(m.r2Bucket).toBe('images');
		expect(m.cdnBase).toBe(CDN_BASE);
		expect(m.sourceUrl).toBe(SOURCE_URL);
		expect(m.media).toEqual({});
		expect(m.posts).toEqual([]);
		expect(m.urlVariantMap).toEqual({});
		expect(typeof m.generatedAt).toBe('string');
	});
});

describe('mergeMediaEntry — idempotency', () => {
	it('returns existing entry unchanged when same wpId + same originalUrl already in manifest', () => {
		const manifest = createEmptyManifest();
		const entry = makeEntry(42, `${SOURCE_URL}/wp-content/uploads/2024/01/photo.jpg`);
		const m1 = mergeMediaEntry(manifest, entry);
		const m2 = mergeMediaEntry(m1, entry);
		// same entry count after re-adding
		expect(Object.keys(m2.media).length).toBe(1);
		expect(m2.media[entry.originalUrl]).toEqual(entry);
	});

	it('adds a new entry without touching existing ones', () => {
		const manifest = createEmptyManifest();
		const e1 = makeEntry(42, `${SOURCE_URL}/wp-content/uploads/2024/01/photo1.jpg`);
		const e2 = makeEntry(99, `${SOURCE_URL}/wp-content/uploads/2024/02/photo2.jpg`);
		const m1 = mergeMediaEntry(manifest, e1);
		const m2 = mergeMediaEntry(m1, e2);
		expect(Object.keys(m2.media).length).toBe(2);
		expect(m2.media[e1.originalUrl]).toEqual(e1);
		expect(m2.media[e2.originalUrl]).toEqual(e2);
	});

	it('does not mutate the original manifest', () => {
		const manifest = createEmptyManifest();
		const entry = makeEntry(42, `${SOURCE_URL}/wp-content/uploads/2024/01/photo.jpg`);
		mergeMediaEntry(manifest, entry);
		expect(Object.keys(manifest.media).length).toBe(0);
	});
});

describe('mergePostEntry', () => {
	it('adds a new post entry', () => {
		const manifest = createEmptyManifest();
		const post = makePost(1, 'my-first-post');
		const m = mergePostEntry(manifest, post);
		expect(m.posts.length).toBe(1);
		expect(m.posts[0]).toEqual(post);
	});

	it('replaces existing post entry with same wpId (idempotent re-run)', () => {
		const manifest = createEmptyManifest();
		const post = makePost(1, 'my-first-post');
		const updated = { ...post, title: 'Updated Title' };
		const m1 = mergePostEntry(manifest, post);
		const m2 = mergePostEntry(m1, updated);
		expect(m2.posts.length).toBe(1);
		expect(m2.posts[0].title).toBe('Updated Title');
	});

	it('does not mutate the original manifest', () => {
		const manifest = createEmptyManifest();
		const post = makePost(1, 'my-post');
		mergePostEntry(manifest, post);
		expect(manifest.posts.length).toBe(0);
	});
});

describe('manifest round-trip serialization', () => {
	it('survives JSON serialize + deserialize', () => {
		const manifest = createEmptyManifest();
		const entry = makeEntry(42, `${SOURCE_URL}/wp-content/uploads/2024/01/photo.jpg`);
		const post = makePost(1, 'hello-world');
		const m = mergePostEntry(mergeMediaEntry(manifest, entry), post);
		const serialized = JSON.stringify(m, null, 2);
		const parsed: Manifest = JSON.parse(serialized);
		expect(parsed.version).toBe(1);
		expect(parsed.media[entry.originalUrl].wpId).toBe(42);
		expect(parsed.posts[0].slug).toBe('hello-world');
	});
});
