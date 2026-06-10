/**
 * Unit tests for resolvePackageForPost — maps blog post context to relevant package.
 * Strict TDD — tests written first.
 */
import { describe, it, expect } from 'vitest';
import { resolvePackageForPost } from './packages';

// Minimal BlogPost stub for testing
function makePost(overrides: {
	slug?: string;
	title?: string;
	categories?: string[];
	tags?: string[];
} = {}) {
	return {
		slug: overrides.slug ?? 'test-post',
		title: overrides.title ?? 'Test Post',
		categories: overrides.categories ?? [],
		tags: overrides.tags ?? [],
		description: 'Test description with enough length for validation.',
		author: 'Test Author',
		publishDate: '2025-01-01',
		excerpt: 'Test excerpt that has enough characters for validation.',
		coverImage: 'https://cdn.example.com/image.webp',
		draft: false,
		isNews: false
	};
}

describe('resolvePackageForPost', () => {
	it('returns wedding package for posts in Weddings category', () => {
		const post = makePost({ categories: ['Weddings'] });
		const pkg = resolvePackageForPost(post);
		expect(pkg.slug).toBe('wedding');
	});

	it('returns wedding package for posts in Wedding category (singular)', () => {
		const post = makePost({ categories: ['Wedding'] });
		const pkg = resolvePackageForPost(post);
		expect(pkg.slug).toBe('wedding');
	});

	it('returns basic-mice package for posts in Corporate category', () => {
		const post = makePost({ categories: ['Corporate Events'] });
		const pkg = resolvePackageForPost(post);
		expect(pkg.slug).toBe('basic-mice');
	});

	it('returns basic-mice package for posts in MICE category', () => {
		const post = makePost({ categories: ['MICE'] });
		const pkg = resolvePackageForPost(post);
		expect(pkg.slug).toBe('basic-mice');
	});

	it('returns basic-mice package for posts in Events category', () => {
		const post = makePost({ categories: ['Events'] });
		const pkg = resolvePackageForPost(post);
		expect(pkg.slug).toBe('basic-mice');
	});

	it('returns product-presentation package for posts with presentation keyword in title', () => {
		const post = makePost({ title: 'How to run a great product presentation', categories: [] });
		const pkg = resolvePackageForPost(post);
		expect(pkg.slug).toBe('product-presentation');
	});

	it('returns product-presentation package for posts with product launch in title', () => {
		const post = makePost({ title: 'Best product launch ideas in Malaga', categories: [] });
		const pkg = resolvePackageForPost(post);
		expect(pkg.slug).toBe('product-presentation');
	});

	it('returns eco package as default fallback', () => {
		const post = makePost({ categories: [], tags: [], title: 'General audio visual tips' });
		const pkg = resolvePackageForPost(post);
		expect(pkg.slug).toBe('eco');
	});

	it('returns eco for news posts', () => {
		const post = { ...makePost({ categories: ['News'] }), isNews: true };
		const pkg = resolvePackageForPost(post);
		// News posts have no specific mapping → fall to eco default
		expect(pkg.slug).toBe('eco');
	});

	it('returns wedding package when wedding keyword appears in tags', () => {
		const post = makePost({ categories: [], tags: ['wedding audio', 'outdoor ceremony'] });
		const pkg = resolvePackageForPost(post);
		expect(pkg.slug).toBe('wedding');
	});

	it('returns basic-mice for posts with Conferences in categories', () => {
		// Conferences are corporate/MICE events, not product presentations
		const post = makePost({ categories: ['Conferences'] });
		const pkg = resolvePackageForPost(post);
		expect(pkg.slug).toBe('basic-mice');
	});

	it('category matching is case-insensitive', () => {
		const post = makePost({ categories: ['weddings'] });
		const pkg = resolvePackageForPost(post);
		expect(pkg.slug).toBe('wedding');
	});
});
