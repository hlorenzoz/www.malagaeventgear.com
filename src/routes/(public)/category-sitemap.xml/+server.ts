import { getCategories } from '$lib/data/blog';
import type { RequestHandler } from './$types';

const BASE_URL = 'https://malagaeventgear.com';

function toLastmod(dateStr: string): string {
	const d = dateStr.split('T')[0];
	return `${d}T00:00:00+00:00`;
}

export const GET: RequestHandler = async () => {
	const categories = getCategories();

	const urls = categories
		.map((cat) => {
			return `  <url>
    <loc>${BASE_URL}/blog/category/${cat.slug}/</loc>
    <lastmod>${toLastmod(cat.lastmod)}</lastmod>
  </url>`;
		})
		.join('\n');

	const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
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
