import { error } from '@sveltejs/kit';
import { getAuthors, getPostsByAuthor } from '$lib/data/blog';
import type { EntryGenerator, PageLoad } from './$types';

export const prerender = true;

export const entries: EntryGenerator = () =>
	getAuthors().map((a) => ({ author: a.slug }));

export const load: PageLoad = ({ params }) => {
	const posts = getPostsByAuthor(params.author);
	if (posts.length === 0) {
		error(404, 'Author not found');
	}
	// Find the Author object for display name (ADR-011)
	const authorMeta = getAuthors().find((a) => a.slug === params.author);
	return { posts, author: params.author, authorMeta };
};
