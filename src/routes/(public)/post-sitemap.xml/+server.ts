import { getAllPosts } from '$lib/data/blog';
import type { RequestHandler } from './$types';

const BASE_URL = 'https://malagaeventgear.com';

/**
 * Normalises a date string (YYYY-MM-DD or ISO 8601) to YYYY-MM-DDT00:00:00+00:00
 * for consistent <lastmod> formatting (matching page-sitemap.xml pattern).
 */
function toLastmod(dateStr: string): string {
	const d = dateStr.split('T')[0]; // strip time part if present
	return `${d}T00:00:00+00:00`;
}

export const GET: RequestHandler = async () => {
	const posts = getAllPosts();

	const urls = posts
		.map((post) => {
			const lastmod = toLastmod(post.updated ?? post.publishDate);
			const imagePart =
				post.coverImage
					? `\n    <image:image>\n      <image:loc>${post.coverImage}</image:loc>\n    </image:image>`
					: '';

			return `  <url>
    <loc>${BASE_URL}/blog/${post.slug}/</loc>
    <lastmod>${lastmod}</lastmod>${imagePart}
  </url>`;
		})
		.join('\n');

	const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">
${urls}
</urlset>`;

	return new Response(xml, {
		headers: {
			'Content-Type': 'application/xml; charset=utf-8',
			'Cache-Control': 'public, max-age=3600, s-maxage=86400',
			'X-Content-Type-Options': 'nosniff'
		}
	});
};
