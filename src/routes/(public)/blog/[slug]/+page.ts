import { error } from '@sveltejs/kit';
import { getPostSlugs, getPostBySlug, getPostComponentLoader } from '$lib/data/blog';
import type { EntryGenerator, PageLoad } from './$types';
import type { Component } from 'svelte';

export const prerender = true;

// Uses getPostSlugs() — the dedicated slug-list accessor (S-03 consistency).
// All slug-enumeration callers use this single source of truth from blog.ts.
export const entries: EntryGenerator = () =>
	getPostSlugs().map((slug) => ({ slug }));

export const load: PageLoad = async ({ params }) => {
	const post = getPostBySlug(params.slug);
	const loader = getPostComponentLoader(params.slug);
	if (!post || !loader) {
		error(404, 'Post not found');
	}
	// Lazily load ONLY this post's compiled body (code-split chunk).
	const component = (await loader()) as Component;
	return { post, component };
};
