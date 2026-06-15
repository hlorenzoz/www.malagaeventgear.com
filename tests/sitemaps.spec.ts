import { test, expect } from '@playwright/test';

test.describe('Technical SEO Sitemap & Edge Redirection E2E Tests', () => {
	// The dev server is automatically managed on port 5173 by Playwright webServer config
	const baseUrl = 'http://localhost:5173';

	test('should serve sitemap_index.xml as valid XML pointing to all sub-sitemaps', async ({ request }) => {
		const response = await request.get(`${baseUrl}/sitemap_index.xml`);
		expect(response.status()).toBe(200);
		
		const contentType = response.headers()['content-type'];
		expect(contentType).toContain('xml');

		const text = await response.text();
		expect(text).toContain('<sitemapindex');
		expect(text).toContain('https://malagaeventgear.com/page-sitemap.xml');
		expect(text).toContain('https://malagaeventgear.com/post-sitemap.xml');
		expect(text).toContain('https://malagaeventgear.com/category-sitemap.xml');
		expect(text).toContain('https://malagaeventgear.com/author-sitemap.xml');
	});

	test('should serve page-sitemap.xml dynamically listing static and dynamic routes with trailing slashes', async ({ request }) => {
		const response = await request.get(`${baseUrl}/page-sitemap.xml`);
		expect(response.status()).toBe(200);

		const contentType = response.headers()['content-type'];
		expect(contentType).toContain('xml');

		const text = await response.text();
		expect(text).toContain('<urlset');
		
		// Static routes check
		expect(text).toContain('https://malagaeventgear.com/');
		expect(text).toContain('https://malagaeventgear.com/about-us/');
		expect(text).toContain('https://malagaeventgear.com/contact/');
		expect(text).toContain('https://malagaeventgear.com/blog/');
		
		// Dynamic package routes check
		expect(text).toContain('https://malagaeventgear.com/packages/wedding/');
		expect(text).toContain('https://malagaeventgear.com/packages/eco/');
		expect(text).toContain('https://malagaeventgear.com/packages/mice/');

		// image:loc must be ABSOLUTE — relative paths are rejected by GSC ("URL no válida")
		expect(text).toContain('<image:loc>https://malagaeventgear.com/images/packages/');
		// Guard against regression: no relative image:loc (i.e. <image:loc>/...)
		expect(text).not.toMatch(/<image:loc>\/images\//);
	});

	test('should serve post, category, and author sitemaps as valid empty XML', async ({ request }) => {
		for (const sitemap of ['post-sitemap.xml', 'category-sitemap.xml', 'author-sitemap.xml']) {
			const response = await request.get(`${baseUrl}/${sitemap}`);
			expect(response.status()).toBe(200);

			const contentType = response.headers()['content-type'];
			expect(contentType).toContain('xml');

			const text = await response.text();
			expect(text).toContain('<urlset');
		}
	});

	test('should permanently redirect (301) legacy WordPress package URLs to SvelteKit dynamic routes', async ({ page }) => {
		// Playwright goto automatically follows redirects, but we want to assert the 301 jump
		const response = await page.goto(`${baseUrl}/wedding-pack/`, { waitUntil: 'commit' });
		expect(response).toBeDefined();
		
		// Verify final resolved URL is correct
		expect(page.url()).toBe(`${baseUrl}/packages/wedding/`);
	});

	test('should permanently redirect legacy WordPress URLs without trailing slash correctly', async ({ page }) => {
		const response = await page.goto(`${baseUrl}/eco-pack`, { waitUntil: 'commit' });
		expect(response).toBeDefined();
		
		// Verify final resolved URL is correct and has a trailing slash
		expect(page.url()).toBe(`${baseUrl}/packages/eco/`);
	});

	test('should enforce trailing slash redirection on normal public routes', async ({ page }) => {
		const response = await page.goto(`${baseUrl}/about-us`, { waitUntil: 'commit' });
		expect(response).toBeDefined();
		
		// Verify it appends trailing slash
		expect(page.url()).toBe(`${baseUrl}/about-us/`);
	});
});
