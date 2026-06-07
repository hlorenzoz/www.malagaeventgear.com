/**
 * Pure blog data pipeline — testable without import.meta.glob.
 *
 * blog.ts calls these functions with the actual glob result.
 * Tests call them directly with fixture data.
 */
import { BlogPostSchema } from '$lib/types/blog';
import type { BlogPost, Category, Author } from '$lib/types/blog';
import { slugify } from '$lib/utils/slugify';

// The shape of each module entry returned by import.meta.glob
export interface GlobModule {
	metadata: unknown;
	default: unknown;
}

export type GlobResult = Record<string, GlobModule>;

/**
 * Transforms a raw import.meta.glob result into a validated, filtered, sorted BlogPost[].
 *
 * - Validates each entry against BlogPostSchema (throws on invalid frontmatter — CI gate)
 * - Excludes draft posts
 * - Excludes posts with publishDate > buildDate (evaluated at call time)
 * - Sorts by publishDate descending
 * - Derives slug from filename key
 */
export function buildPostsFromGlob(glob: GlobResult, buildDate: Date = new Date()): BlogPost[] {
	const posts: BlogPost[] = [];

	for (const [path, module] of Object.entries(glob)) {
		// Derive slug from file path: /src/content/blog/my-post.svx → my-post
		const slug = path.split('/').pop()?.replace(/\.svx$/, '') ?? '';

		// Validate frontmatter — throws ZodError on invalid data (CI gate)
		const frontmatter = BlogPostSchema.parse(module.metadata);

		// Draft filter
		if (frontmatter.draft === true) continue;

		// Future-date filter
		const pubDate = new Date(frontmatter.publishDate);
		if (pubDate > buildDate) continue;

		posts.push({
			...frontmatter,
			slug,
			component: module.default
		});
	}

	// Sort by publishDate descending
	posts.sort((a, b) => new Date(b.publishDate).getTime() - new Date(a.publishDate).getTime());

	return posts;
}

/**
 * Derives Category[] from a published posts list.
 * Categories are sorted alphabetically by name.
 */
export function getCategoriesFromPosts(posts: BlogPost[]): Category[] {
	const map = new Map<string, { name: string; posts: BlogPost[] }>();

	for (const post of posts) {
		for (const categoryName of post.categories) {
			const slug = slugify(categoryName);
			if (!map.has(slug)) {
				map.set(slug, { name: categoryName, posts: [] });
			}
			map.get(slug)!.posts.push(post);
		}
	}

	const categories: Category[] = [];
	for (const [slug, { name, posts: catPosts }] of map.entries()) {
		categories.push({
			name,
			slug,
			count: catPosts.length,
			lastmod: maxLastmod(catPosts)
		});
	}

	// Sort alphabetically by name
	categories.sort((a, b) => a.name.localeCompare(b.name));
	return categories;
}

/**
 * Returns published posts whose categories[] contains the given slug.
 * The category names in frontmatter are raw display names; we slugify before comparing.
 */
export function getPostsByCategoryFromPosts(posts: BlogPost[], categorySlug: string): BlogPost[] {
	return posts.filter((p) => p.categories.some((c) => slugify(c) === categorySlug));
}

/**
 * Derives Author[] from a published posts list.
 * Authors are sorted alphabetically by name.
 * The author field in frontmatter stores the display name slug (e.g. "hector-lorenzo").
 * For display purposes, the name is stored as-is; slugify is applied for URL derivation.
 */
export function getAuthorsFromPosts(posts: BlogPost[]): Author[] {
	const map = new Map<string, { name: string; posts: BlogPost[] }>();

	for (const post of posts) {
		const slug = slugify(post.author);
		if (!map.has(slug)) {
			map.set(slug, { name: post.author, posts: [] });
		}
		map.get(slug)!.posts.push(post);
	}

	const authors: Author[] = [];
	for (const [slug, { name, posts: authorPosts }] of map.entries()) {
		authors.push({
			name,
			slug,
			count: authorPosts.length,
			lastmod: maxLastmod(authorPosts)
		});
	}

	// Sort alphabetically by name
	authors.sort((a, b) => a.name.localeCompare(b.name));
	return authors;
}

/**
 * Returns published posts by the given author slug.
 */
export function getPostsByAuthorFromPosts(posts: BlogPost[], authorSlug: string): BlogPost[] {
	return posts.filter((p) => slugify(p.author) === authorSlug);
}

/**
 * Returns the most recent date (updated ?? publishDate) across a list of posts,
 * formatted as YYYY-MM-DD.
 */
function maxLastmod(posts: BlogPost[]): string {
	let max = '';
	for (const post of posts) {
		const date = (post.updated ?? post.publishDate).split('T')[0]; // strip time part if any
		if (!max || date > max) max = date;
	}
	return max;
}
