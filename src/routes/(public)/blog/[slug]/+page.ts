import { error } from '@sveltejs/kit';
import { getPostSlugs, getPostBySlug } from '$lib/data/blog';
import type { EntryGenerator, PageLoad } from './$types';

export const prerender = true;

// Uses getPostSlugs() — the dedicated slug-list accessor (S-03 consistency).
// All slug-enumeration callers use this single source of truth from blog.ts.
export const entries: EntryGenerator = () =>
	getPostSlugs().map((slug) => ({ slug }));

export const load: PageLoad = ({ params }) => {
	const post = getPostBySlug(params.slug);
	if (!post) {
		error(404, 'Post not found');
	}
	return { post };
};
