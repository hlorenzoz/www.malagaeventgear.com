import { error } from '@sveltejs/kit';
import { getCategories, getPostsByCategory } from '$lib/data/blog';
import type { EntryGenerator, PageLoad } from './$types';

export const prerender = true;

export const entries: EntryGenerator = () =>
	getCategories().map((c) => ({ category: c.slug }));

export const load: PageLoad = ({ params }) => {
	const posts = getPostsByCategory(params.category);
	if (posts.length === 0) {
		error(404, 'Category not found');
	}
	// Find the Category object for display name and meta
	const category = getCategories().find((c) => c.slug === params.category);
	return { posts, category: params.category, categoryMeta: category };
};
