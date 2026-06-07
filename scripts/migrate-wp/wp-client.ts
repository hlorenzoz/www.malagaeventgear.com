/**
 * WordPress REST API client — paginated fetching with _embed=true.
 *
 * Supports: posts, categories, tags, users, media
 * Pagination: X-WP-TotalPages header, per_page=100
 * SC-MIG-11: must exhaust all pages; log total counts.
 */
import type { WpPost, WpCategory, WpTag, WpUser, WpMedia } from './types';

const DEFAULT_WP_BASE =
	process.env.WP_BASE_URL ?? 'https://malagaeventgear.com/wp-json/wp/v2';

/**
 * Fetches all pages of a WP REST API endpoint and returns the flat array.
 * Uses X-WP-TotalPages to determine when to stop.
 */
async function fetchAllPages<T>(
	endpoint: string,
	params: Record<string, string> = {}
): Promise<T[]> {
	const results: T[] = [];
	let page = 1;
	let totalPages = 1;

	do {
		const url = new URL(`${DEFAULT_WP_BASE}/${endpoint}`);
		url.searchParams.set('per_page', '100');
		url.searchParams.set('page', String(page));
		for (const [k, v] of Object.entries(params)) {
			url.searchParams.set(k, v);
		}

		const response = await fetch(url.toString());
		if (!response.ok) {
			throw new Error(
				`[wp-client] Failed to fetch ${url}: ${response.status} ${response.statusText}`
			);
		}

		const data: T[] = await response.json() as T[];
		results.push(...data);

		if (page === 1) {
			const total = response.headers.get('X-WP-TotalPages');
			totalPages = total ? parseInt(total, 10) : 1;
		}

		page++;
	} while (page <= totalPages);

	return results;
}

/** Fetches all published posts with _embed=true. */
export async function fetchPosts(): Promise<WpPost[]> {
	const posts = await fetchAllPages<WpPost>('posts', {
		_embed: 'true',
		status: 'publish',
	});
	console.log(`[wp-client] Posts fetched: ${posts.length}`);
	return posts;
}

/** Fetches all categories. */
export async function fetchCategories(): Promise<WpCategory[]> {
	const categories = await fetchAllPages<WpCategory>('categories');
	console.log(`[wp-client] Categories fetched: ${categories.length}`);
	return categories;
}

/** Fetches all tags. */
export async function fetchTags(): Promise<WpTag[]> {
	const tags = await fetchAllPages<WpTag>('tags');
	console.log(`[wp-client] Tags fetched: ${tags.length}`);
	return tags;
}

/** Fetches all users. */
export async function fetchUsers(): Promise<WpUser[]> {
	const users = await fetchAllPages<WpUser>('users');
	console.log(`[wp-client] Users fetched: ${users.length}`);
	return users;
}

/** Fetches all media (attachments) with _embed=true. */
export async function fetchMedia(): Promise<WpMedia[]> {
	const media = await fetchAllPages<WpMedia>('media', {
		_embed: 'true',
		media_type: 'image',
	});
	console.log(`[wp-client] Media fetched: ${media.length}`);
	return media;
}
