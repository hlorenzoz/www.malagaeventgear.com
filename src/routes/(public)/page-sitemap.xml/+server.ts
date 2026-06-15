import type { RequestHandler } from './$types';
import { packages } from '$lib/data/packages';

export const GET: RequestHandler = async () => {
	const staticPages = [
		'',
		'about-us',
		'contact',
		'faq',
		'privacy-policy',
		'terms-of-service',
		'gdpr',
		'cookie-policy',
		'meet-the-team',
		'sitemap',
		'equipment',
		'packages',
		'blog',
		'blog/categories'
	];

	// Base URL of the website
	const baseUrl = 'https://malagaeventgear.com';

	const pagesXml = staticPages
		.map((page) => {
			const loc = `${baseUrl}/${page}${page ? '/' : ''}`;
			return `	<url>
		<loc>${loc}</loc>
		<lastmod>${new Date().toISOString().split('T')[0]}T00:00:00+00:00</lastmod>
	</url>`;
		})
		.join('\n');

	const packagesXml = packages
		.map((pkg) => {
			const loc = `${baseUrl}${pkg.route}`;
			// image:loc MUST be an absolute URL (sitemap protocol). pkg.image is a
			// site-relative path (e.g. /images/packages/eco.webp), so prefix baseUrl —
			// otherwise GSC reports "URL no válida" on every package image.
			const imageBlock = pkg.image
				? `\n		<image:image>
			<image:loc>${baseUrl}${pkg.image}</image:loc>
		</image:image>`
				: '';

			return `	<url>
		<loc>${loc}</loc>
		<lastmod>${new Date().toISOString().split('T')[0]}T00:00:00+00:00</lastmod>${imageBlock}
	</url>`;
		})
		.join('\n');

	const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:image="http://www.google.com/schemas/sitemap-image/1.1"
        xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
        xsi:schemaLocation="http://www.sitemaps.org/schemas/sitemap/0.9 http://www.sitemaps.org/schemas/sitemap/0.9/sitemap.xsd http://www.google.com/schemas/sitemap-image/1.1 http://www.google.com/schemas/sitemap-image/1.1/sitemap-image.xsd">
${pagesXml}
${packagesXml}
</urlset>`;

	return new Response(xml, {
		headers: {
			'Content-Type': 'application/xml; charset=utf-8',
			'Cache-Control': 'public, max-age=3600, s-maxage=86400',
			'X-Content-Type-Options': 'nosniff'
		}
	});
};
