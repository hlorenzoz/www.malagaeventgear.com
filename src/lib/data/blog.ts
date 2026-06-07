/**
 * Blog data layer — public API.
 *
 * All data is read at build time via import.meta.glob (eager).
 * No Node built-ins are used (Cloudflare adapter compatible).
 *
 * Pure pipeline logic lives in blog-pipeline.ts (testable independently).
 */
import type { BlogPost, Category, Author } from '$lib/types/blog';
import {
	buildPostsFromGlob,
	getCategoriesFromPosts,
	getPostsByCategoryFromPosts,
	getAuthorsFromPosts,
	getPostsByAuthorFromPosts
} from '$lib/data/blog-pipeline';

// ─── Build-time data load ─────────────────────────────────────────────────────

// Glob is evaluated eagerly at module evaluation time (build time).
// Path is relative to THIS FILE (src/lib/data/blog.ts → ../content/blog/).
const modules = import.meta.glob('../../content/blog/*.svx', { eager: true }) as Record<
	string,
	{ metadata: unknown; default: unknown }
>;

// Posts cache — computed once at module evaluation time (ADR-003, ADR-004).
// The date filter uses the current date at build time (ADR-004).
const _allPosts: BlogPost[] = buildPostsFromGlob(modules);

// Taxonomy caches
const _categories: Category[] = getCategoriesFromPosts(_allPosts);
const _authors: Author[] = getAuthorsFromPosts(_allPosts);

// ─── Public API ───────────────────────────────────────────────────────────────

/**
 * Returns all published, non-draft posts sorted by publishDate descending.
 */
export function getAllPosts(): BlogPost[] {
	return _allPosts;
}

/**
 * @deprecated Use getAllPosts() — kept for spec compatibility (SC-BC spec references getPosts()).
 */
export function getPosts(): BlogPost[] {
	return _allPosts;
}

/**
 * Returns a single post by slug, or undefined if not found.
 */
export function getPostBySlug(slug: string): BlogPost | undefined {
	return _allPosts.find((p) => p.slug === slug);
}

/**
 * @deprecated Use getPostBySlug() — kept for spec compatibility.
 */
export function getPost(slug: string): BlogPost | undefined {
	return getPostBySlug(slug);
}

/**
 * Returns all slugs of published posts (used by entries generators).
 */
export function getPostSlugs(): string[] {
	return _allPosts.map((p) => p.slug);
}

/**
 * Returns deduplicated categories derived from published posts, sorted alphabetically.
 */
export function getCategories(): Category[] {
	return _categories;
}

/**
 * Returns published posts in the given category slug.
 * Returns an empty array if the category does not exist or has no posts.
 */
export function getPostsByCategory(categorySlug: string): BlogPost[] {
	return getPostsByCategoryFromPosts(_allPosts, categorySlug);
}

/**
 * Returns deduplicated authors derived from published posts, sorted alphabetically.
 */
export function getAuthors(): Author[] {
	return _authors;
}

/**
 * Returns published posts by the given author slug.
 * Returns an empty array if the author does not exist or has no posts.
 */
export function getPostsByAuthor(authorSlug: string): BlogPost[] {
	return getPostsByAuthorFromPosts(_allPosts, authorSlug);
}
