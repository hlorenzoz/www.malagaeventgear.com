import { getAllPosts, getCategories } from '$lib/data/blog';
import type { PageLoad } from './$types';

export const prerender = true;

export const load: PageLoad = () => {
	return { categories: getCategories(), totalPosts: getAllPosts().length };
};
