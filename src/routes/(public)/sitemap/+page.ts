import { getAllPosts, getCategories, getAuthors } from '$lib/data/blog';

export function load() {
	// Provide top 20 most-recent posts, all categories, and all authors for the HTML sitemap.
	// The full listing is available via the XML sitemaps.
	const posts = getAllPosts().slice(0, 20);
	const categories = getCategories();
	const authors = getAuthors();
	return { posts, categories, authors };
}
