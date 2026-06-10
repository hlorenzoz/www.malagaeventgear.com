/**
 * Unit tests for blog-pipeline.ts — covering isNews derivation and
 * getNewsPosts / getArticlePosts filter functions.
 */
import { describe, it, expect } from 'vitest';
import {
	buildPostsFromGlob,
	getNewsPosts,
	getArticlePosts,
} from './blog-pipeline';
import type { GlobResult } from './blog-pipeline';

// Minimal valid glob module factory
function makeModule(overrides: Record<string, unknown> = {}) {
	return {
		metadata: {
			title: 'Test Post',
			description: 'A sufficiently long test description here.',
			author: 'Test Author',
			publishDate: '2025-01-01',
			excerpt: 'A sufficiently long excerpt for testing.',
			coverImage: 'https://cdn.example.com/image.webp',
			categories: [],
			tags: [],
			draft: false,
			...overrides,
		},
	};
}

describe('isNews derivation', () => {
	it('marks post as isNews=true when categories contains "News"', () => {
		const glob: GlobResult = {
			'../../content/blog/news-post.svx': makeModule({ categories: ['News'] }),
		};
		const posts = buildPostsFromGlob(glob, new Date('2026-12-31'));
		expect(posts[0].isNews).toBe(true);
	});

	it('marks post as isNews=false when categories does not contain "News"', () => {
		const glob: GlobResult = {
			'../../content/blog/regular-post.svx': makeModule({ categories: ['Weddings'] }),
		};
		const posts = buildPostsFromGlob(glob, new Date('2026-12-31'));
		expect(posts[0].isNews).toBe(false);
	});

	it('marks post as isNews=false when categories is empty', () => {
		const glob: GlobResult = {
			'../../content/blog/empty-cat-post.svx': makeModule({ categories: [] }),
		};
		const posts = buildPostsFromGlob(glob, new Date('2026-12-31'));
		expect(posts[0].isNews).toBe(false);
	});

	it('is case-insensitive / slug-based: "news" category slug matches', () => {
		// "News Industry" has slug "news-industry" not "news" — should be false
		// "News" has slug "news" — should be true
		const glob: GlobResult = {
			'../../content/blog/news-upper.svx': makeModule({ categories: ['News'] }),
			'../../content/blog/news-industry.svx': makeModule({
				categories: ['News Industry'],
				title: 'News Industry Post',
				description: 'A sufficiently long test description here.',
				excerpt: 'A sufficiently long excerpt for testing.',
			}),
		};
		const posts = buildPostsFromGlob(glob, new Date('2026-12-31'));
		const newsPost = posts.find((p) => p.slug === 'news-upper');
		const industryPost = posts.find((p) => p.slug === 'news-industry');
		expect(newsPost?.isNews).toBe(true);
		expect(industryPost?.isNews).toBe(false);
	});
});

describe('getNewsPosts', () => {
	const glob: GlobResult = {
		'../../content/blog/news-1.svx': makeModule({ categories: ['News'], title: 'News One', description: 'A sufficiently long test description here.', excerpt: 'A sufficiently long excerpt for testing.' }),
		'../../content/blog/regular-1.svx': makeModule({ categories: ['Weddings'], title: 'Regular One', description: 'A sufficiently long test description here.', excerpt: 'A sufficiently long excerpt for testing.' }),
		'../../content/blog/news-2.svx': makeModule({ categories: ['News', 'Events'], title: 'News Two', description: 'A sufficiently long test description here.', excerpt: 'A sufficiently long excerpt for testing.' }),
	};
	const posts = buildPostsFromGlob(glob, new Date('2026-12-31'));

	it('returns only posts with isNews=true', () => {
		const news = getNewsPosts(posts);
		expect(news.every((p) => p.isNews)).toBe(true);
		expect(news).toHaveLength(2);
	});

	it('getArticlePosts returns only non-news posts', () => {
		const articles = getArticlePosts(posts);
		expect(articles.every((p) => !p.isNews)).toBe(true);
		expect(articles).toHaveLength(1);
	});

	it('getNewsPosts + getArticlePosts covers all posts', () => {
		const news = getNewsPosts(posts);
		const articles = getArticlePosts(posts);
		expect(news.length + articles.length).toBe(posts.length);
	});
});
