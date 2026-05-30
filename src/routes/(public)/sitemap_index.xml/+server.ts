import type { RequestHandler } from './$types';

export const GET: RequestHandler = async () => {
	const xml = `<?xml version="1.0" encoding="UTF-8"?>
<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
	<sitemap>
		<loc>https://malagaeventgear.com/post-sitemap.xml</loc>
	</sitemap>
	<sitemap>
		<loc>https://malagaeventgear.com/page-sitemap.xml</loc>
	</sitemap>
	<sitemap>
		<loc>https://malagaeventgear.com/category-sitemap.xml</loc>
	</sitemap>
	<sitemap>
		<loc>https://malagaeventgear.com/author-sitemap.xml</loc>
	</sitemap>
</sitemapindex>`;

	return new Response(xml, {
		headers: {
			'Content-Type': 'application/xml; charset=utf-8',
			'Cache-Control': 'public, max-age=3600, s-maxage=86400',
			'X-Content-Type-Options': 'nosniff'
		}
	});
};
