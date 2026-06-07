import { describe, it, expect } from 'vitest';
import {
	buildPostsFromGlob,
	getCategoriesFromPosts,
	getPostsByCategoryFromPosts,
	getAuthorsFromPosts,
	getPostsByAuthorFromPosts
} from './blog-pipeline';

// Helper to build a mock .svx module entry
function mockModule(frontmatter: Record<string, unknown>, component = {}) {
	return { metadata: frontmatter, default: component };
}

// Dates relative to "now" for scheduling tests
const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];
const tomorrow = new Date(Date.now() + 86400000).toISOString().split('T')[0];

// Base valid frontmatter — all required fields present
const base = {
	title: 'Test Post',
	description: 'A description long enough for validation.',
	author: 'Hector Lorenzo',
	publishDate: yesterday,
	categories: ['weddings'],
	tags: [],
	excerpt: 'A short excerpt about the test post.',
	coverImage: 'https://cdn.malagaeventgear.com/blog/test-cover.webp'
};

describe('buildPostsFromGlob (unit — data pipeline)', () => {
	it('SC-BC-02: excludes draft posts', () => {
		const posts = buildPostsFromGlob({
			'/src/content/blog/draft-post.svx': mockModule({ ...base, draft: true })
		});
		expect(posts).toHaveLength(0);
	});

	it('SC-BC-03: excludes future-dated posts', () => {
		const posts = buildPostsFromGlob({
			'/src/content/blog/future-post.svx': mockModule({ ...base, publishDate: tomorrow })
		});
		expect(posts).toHaveLength(0);
	});

	it('SC-BC-04: includes past-dated posts', () => {
		const posts = buildPostsFromGlob({
			'/src/content/blog/past-post.svx': mockModule({ ...base, publishDate: yesterday })
		});
		expect(posts).toHaveLength(1);
	});

	it('SC-BC-05: throws on invalid frontmatter (missing title)', () => {
		const { title: _title, ...noTitle } = base;
		expect(() =>
			buildPostsFromGlob({
				'/src/content/blog/invalid-post.svx': mockModule(noTitle)
			})
		).toThrow();
	});

	it('SC-BC-06/SC-BC-14: sorts by publishDate descending', () => {
		const oldDate = '2024-01-01';
		const newDate = '2025-06-01';
		const posts = buildPostsFromGlob({
			'/src/content/blog/old-post.svx': mockModule({ ...base, publishDate: oldDate }),
			'/src/content/blog/new-post.svx': mockModule({ ...base, publishDate: newDate })
		});
		expect(posts[0].publishDate).toBe(newDate);
		expect(posts[1].publishDate).toBe(oldDate);
	});

	it('derives slug from filename', () => {
		const posts = buildPostsFromGlob({
			'/src/content/blog/my-awesome-post.svx': mockModule(base)
		});
		expect(posts[0].slug).toBe('my-awesome-post');
	});

	it('includes published post without draft field', () => {
		const { ...noStatus } = base;
		const posts = buildPostsFromGlob({
			'/src/content/blog/pub.svx': mockModule(noStatus)
		});
		expect(posts).toHaveLength(1);
	});
});

describe('getCategoriesFromPosts / getPostsByCategoryFromPosts', () => {
	it('SC-TAX-01: excludes categories from draft posts', () => {
		const posts = buildPostsFromGlob({
			'/src/content/blog/pub.svx': mockModule({ ...base, categories: ['weddings'] }),
			'/src/content/blog/draft.svx': mockModule({
				...base,
				categories: ['sound'],
				draft: true
			})
		});
		const cats = getCategoriesFromPosts(posts);
		expect(cats.map((c) => c.slug)).toContain('weddings');
		expect(cats.map((c) => c.slug)).not.toContain('sound');
	});

	it('SC-TAX-02: getPostsByCategory returns only matching posts', () => {
		const posts = buildPostsFromGlob({
			'/src/content/blog/w1.svx': mockModule({ ...base, categories: ['weddings'] }),
			'/src/content/blog/w2.svx': mockModule({ ...base, categories: ['weddings'] }),
			'/src/content/blog/c1.svx': mockModule({ ...base, categories: ['corporate'] })
		});
		const result = getPostsByCategoryFromPosts(posts, 'weddings');
		expect(result).toHaveLength(2);
		expect(result.every((p) => p.categories.includes('weddings'))).toBe(true);
	});

	it('SC-TAX-03: getPostsByCategory returns [] for unknown category', () => {
		const posts = buildPostsFromGlob({
			'/src/content/blog/p1.svx': mockModule({ ...base, categories: ['weddings'] })
		});
		const result = getPostsByCategoryFromPosts(posts, 'does-not-exist');
		expect(result).toHaveLength(0);
	});

	it('Category lastmod is max(updated ?? publishDate) across posts', () => {
		const posts = buildPostsFromGlob({
			'/src/content/blog/old.svx': mockModule({
				...base,
				publishDate: '2024-01-01',
				categories: ['weddings']
			}),
			'/src/content/blog/new.svx': mockModule({
				...base,
				publishDate: '2025-01-01',
				updated: '2025-06-01',
				categories: ['weddings']
			})
		});
		const cats = getCategoriesFromPosts(posts);
		const weddings = cats.find((c) => c.slug === 'weddings');
		expect(weddings?.lastmod).toBe('2025-06-01');
	});

	it('deduplicates categories across posts', () => {
		const posts = buildPostsFromGlob({
			'/src/content/blog/a.svx': mockModule({ ...base, categories: ['weddings', 'corporate'] }),
			'/src/content/blog/b.svx': mockModule({ ...base, categories: ['weddings'] })
		});
		const cats = getCategoriesFromPosts(posts);
		const weddingEntries = cats.filter((c) => c.slug === 'weddings');
		expect(weddingEntries).toHaveLength(1);
		expect(weddingEntries[0].count).toBe(2);
	});
});

describe('getAuthorsFromPosts / getPostsByAuthorFromPosts', () => {
	it('SC-TAX-09: excludes authors from draft posts', () => {
		const posts = buildPostsFromGlob({
			'/src/content/blog/pub.svx': mockModule({ ...base, author: 'Hector Lorenzo' }),
			'/src/content/blog/draft.svx': mockModule({
				...base,
				author: 'Ghost Writer',
				draft: true
			})
		});
		const authors = getAuthorsFromPosts(posts);
		expect(authors.map((a) => a.slug)).toContain('hector-lorenzo');
		expect(authors.map((a) => a.slug)).not.toContain('ghost-writer');
	});

	it('SC-TAX-10: getPostsByAuthor returns only matching posts', () => {
		const posts = buildPostsFromGlob({
			'/src/content/blog/h1.svx': mockModule({ ...base, author: 'Hector Lorenzo' }),
			'/src/content/blog/h2.svx': mockModule({ ...base, author: 'Hector Lorenzo' }),
			'/src/content/blog/h3.svx': mockModule({ ...base, author: 'Hector Lorenzo' }),
			'/src/content/blog/a1.svx': mockModule({ ...base, author: 'Ana García' })
		});
		const result = getPostsByAuthorFromPosts(posts, 'hector-lorenzo');
		expect(result).toHaveLength(3);
	});

	it('Author lastmod is max(updated ?? publishDate) across posts', () => {
		const posts = buildPostsFromGlob({
			'/src/content/blog/p1.svx': mockModule({
				...base,
				author: 'Hector Lorenzo',
				publishDate: '2024-01-01'
			}),
			'/src/content/blog/p2.svx': mockModule({
				...base,
				author: 'Hector Lorenzo',
				publishDate: '2025-01-01',
				updated: '2025-06-01'
			})
		});
		const authors = getAuthorsFromPosts(posts);
		const hector = authors.find((a) => a.slug === 'hector-lorenzo');
		expect(hector?.lastmod).toBe('2025-06-01');
	});

	it('getPostsByAuthor returns [] for unknown author', () => {
		const posts = buildPostsFromGlob({
			'/src/content/blog/p1.svx': mockModule({ ...base, author: 'Hector Lorenzo' })
		});
		const result = getPostsByAuthorFromPosts(posts, 'nobody');
		expect(result).toHaveLength(0);
	});

	it('deduplicates authors across posts', () => {
		const posts = buildPostsFromGlob({
			'/src/content/blog/a.svx': mockModule({ ...base, author: 'Hector Lorenzo' }),
			'/src/content/blog/b.svx': mockModule({ ...base, author: 'Hector Lorenzo' })
		});
		const authors = getAuthorsFromPosts(posts);
		const entries = authors.filter((a) => a.slug === 'hector-lorenzo');
		expect(entries).toHaveLength(1);
		expect(entries[0].count).toBe(2);
	});
});

// S-03 consistency: slug enumeration for entries() generators
// The pipeline exposes post.slug on each BlogPost — entries generators must use
// the same slug field that getPostSlugs() (blog.ts) maps over, not a separate source.
describe('S-03: slug consistency — buildPostsFromGlob slug matches filename', () => {
	it('post.slug matches the .svx filename without extension', () => {
		const posts = buildPostsFromGlob({
			'/src/content/blog/vintage-chairs-for-rent.svx': mockModule(base)
		});
		expect(posts).toHaveLength(1);
		// The slug used in entries() (via getPostSlugs()) must equal the filename base
		expect(posts[0].slug).toBe('vintage-chairs-for-rent');
	});

	it('slug from buildPostsFromGlob matches what getPostSlugs would return', () => {
		const glob = {
			'/src/content/blog/post-a.svx': mockModule({ ...base }),
			'/src/content/blog/post-b.svx': mockModule({ ...base }),
		};
		const posts = buildPostsFromGlob(glob);
		// Simulate what getPostSlugs() does: map posts to slug
		const slugs = posts.map((p) => p.slug);
		// Must produce exactly the filenames (sorted by date — both share same date here)
		expect(slugs).toContain('post-a');
		expect(slugs).toContain('post-b');
		expect(slugs).toHaveLength(2);
	});
});
