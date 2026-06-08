import { describe, it, expect } from 'vitest';
import { buildMediaCategoryMap } from './index';
import type { WpPost } from './types';

/**
 * Tests for buildMediaCategoryMap (S-03).
 * Pure function: maps a post's featured_media id → its first category slug
 * (entity-decoded + slugified), fallback 'blog'. First post wins per media id.
 * Category is best-effort manifest metadata; it does NOT affect the R2 key.
 */

// Minimal WpPost factory — only the fields the function reads.
function post(featured_media: number, terms: { name: string; taxonomy: string }[]): WpPost {
	return {
		featured_media,
		_embedded: { 'wp:term': [terms] }
	} as unknown as WpPost;
}

describe('buildMediaCategoryMap', () => {
	it('maps featured_media id to the slugified first category', () => {
		const map = buildMediaCategoryMap([
			post(42, [{ name: 'Weddings', taxonomy: 'category' }])
		]);
		expect(map.get(42)).toBe('weddings');
	});

	it('decodes HTML entities before slugifying the category', () => {
		const map = buildMediaCategoryMap([
			post(7, [{ name: 'Corporate &amp; Enterprise', taxonomy: 'category' }])
		]);
		expect(map.get(7)).toBe('corporate-enterprise');
	});

	it("falls back to 'blog' when the post has no category term", () => {
		const map = buildMediaCategoryMap([
			post(9, [{ name: 'sometag', taxonomy: 'post_tag' }])
		]);
		expect(map.get(9)).toBe('blog');
	});

	it('skips posts without a featured_media (id 0)', () => {
		const map = buildMediaCategoryMap([
			post(0, [{ name: 'Weddings', taxonomy: 'category' }])
		]);
		expect(map.size).toBe(0);
	});

	it('is deterministic — first post wins for a shared featured_media id', () => {
		const map = buildMediaCategoryMap([
			post(42, [{ name: 'Weddings', taxonomy: 'category' }]),
			post(42, [{ name: 'Events', taxonomy: 'category' }])
		]);
		expect(map.get(42)).toBe('weddings');
	});
});
