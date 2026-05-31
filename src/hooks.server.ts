import type { Handle } from '@sveltejs/kit';

export const handle: Handle = async ({ event, resolve }) => {
	const { pathname } = event.url;

	// 1. WordPress legacy URL mapping to the new SvelteKit dynamic routes (301 Permanent Redirect)
	const legacyRedirects: Record<string, string> = {
		'/wedding-pack': '/packages/wedding/',
		'/wedding-pack/': '/packages/wedding/',
		'/product-presentation-pack': '/packages/product-presentation/',
		'/product-presentation-pack/': '/packages/product-presentation/',
		'/eco-pack': '/packages/eco/',
		'/eco-pack/': '/packages/eco/',
		'/mice-pack': '/packages/mice/',
		'/mice-pack/': '/packages/mice/',
		'/basic-mice-pack': '/packages/basic-mice/',
		'/basic-mice-pack/': '/packages/basic-mice/',
		'/pricing': '/packages/',
		'/pricing/': '/packages/',
		'/contact-us': '/contact/',
		'/contact-us/': '/contact/'
	};

	if (legacyRedirects[pathname]) {
		return new Response(null, {
			status: 301,
			headers: {
				'Location': legacyRedirects[pathname],
				'Cache-Control': 'public, max-age=31536000, immutable'
			}
		});
	}

	// 2. Trailing slash enforcement for HTML/public pages (as per SEO and project guidelines)
	// We exclude static asset assets, sitemaps, API routes, or paths already having slashes
	const isFile = pathname.includes('.') || pathname.endsWith('.xml');
	const isApi = pathname.startsWith('/api') || pathname.startsWith('/_');
	const hasTrailingSlash = pathname.endsWith('/');

	if (!isFile && !isApi && !hasTrailingSlash && pathname !== '/') {
		return new Response(null, {
			status: 301,
			headers: {
				'Location': `${pathname}/`,
				'Cache-Control': 'public, max-age=31536000, immutable'
			}
		});
	}

	// Normal request handling
	return resolve(event);
};
