import { test, expect } from '@playwright/test';

/**
 * Blog E2E Tests — Phase 2 (Routes) + Phase 3 (Sitemaps)
 *
 * These tests run against the dev server (bun run dev) as configured in playwright.config.ts.
 * 75 real migrated posts in src/content/blog/ provide published content.
 * Two fixture files remain for filtering tests only:
 *   - future-post-test-fixture.svx   (publishDate: 2099-12-31 — must be excluded)
 *   - draft-post-test-fixture.svx    (draft: true — must be excluded)
 */

test.describe('Blog Index (/blog/)', () => {
	test('SC-BC-01: returns 200 and shows at least one post card', async ({ page }) => {
		const response = await page.goto('/blog/');
		expect(response?.status()).toBe(200);
		// At least one article/post card should be visible
		const cards = page.locator('[data-testid="post-card"]');
		await expect(cards.first()).toBeVisible();
	});

	test('SC-BC-07: does not contain migration notice text', async ({ page }) => {
		await page.goto('/blog/');
		// "Transitioning" (EN) should not appear — migration notice removed
		const body = await page.content();
		expect(body.toLowerCase()).not.toContain('transitioning');
	});

	test('Core Clusters section: heading, 6 clusters, and both CTAs are present', async ({ page }) => {
		await page.goto('/blog/');

		// Scope to the clusters section (cluster labels overlap with post category badges elsewhere)
		const section = page.locator('[data-testid="blog-clusters"]');
		await expect(section).toBeVisible();

		// Heading
		await expect(section.getByRole('heading', { name: 'Core Clusters We Cover' })).toBeVisible();

		// 6 cluster labels
		for (const label of [
			'Weddings',
			'Corporate AV',
			'Sound Acoustics',
			'Scenic Lights',
			'Laser Projection',
			'Private Parties'
		]) {
			await expect(section.getByText(label, { exact: true })).toBeVisible();
		}

		// CTAs with correct destinations
		await expect(section.locator('a[href="/contact/"]', { hasText: 'Get Technical Advice' })).toBeVisible();
		await expect(section.locator('a[href="/packages/"]', { hasText: 'Explore Packages' })).toBeVisible();
	});

	test('Google reviews carousel is mounted on the blog index', async ({ page }) => {
		await page.goto('/blog/');
		// Reused Testimonials component — at least one review card should render
		await expect(page.locator('[data-testid="testimonial-card"]').first()).toBeVisible();
	});

	test('SC-TAX-15: category badges link to /blog/category/*/', async ({ page }) => {
		await page.goto('/blog/');
		// Category links from post cards should point to /blog/category/<slug>/
		const catLink = page.locator('[data-testid="post-card"] a[href^="/blog/category/"]').first();
		await expect(catLink).toBeVisible();
		const href = await catLink.getAttribute('href');
		expect(href).toMatch(/^\/blog\/category\/[a-z0-9-]+\/$/);
	});

	test('SC-BC-11: EN chrome text is shown (default language)', async ({ page }) => {
		await page.goto('/blog/');
		// The blog heading or section label should be in English
		const content = await page.content();
		// The blog page should have English text (default lang = 'en')
		// We check for the blog section label or heading text
		expect(content).toMatch(/blog|knowledge|inspiration/i);
	});

	test('future-dated post is NOT shown on /blog/', async ({ page }) => {
		await page.goto('/blog/');
		const content = await page.content();
		// future-post-test-fixture should not appear
		expect(content).not.toContain('Future Post Test Fixture');
	});

	test('draft post is NOT shown on /blog/', async ({ page }) => {
		await page.goto('/blog/');
		const content = await page.content();
		expect(content).not.toContain('Draft Post Test Fixture');
	});

	test('published posts are shown on /blog/', async ({ page }) => {
		await page.goto('/blog/');
		const content = await page.content();
		expect(content).toContain('Weather Considerations for Outdoor Rentals');
	});
});

test.describe('Blog Post Route (/blog/[slug]/)', () => {
	test('SC-BC-08: post route returns 200 with correct h1', async ({ page }) => {
		const response = await page.goto('/blog/weather-considerations-for-outdoor-rentals/');
		expect(response?.status()).toBe(200);
		// BlogPost.svelte renders the title as the first h1 in the post header
		const h1 = page.locator('header h1').first();
		await expect(h1).toContainText('Weather Considerations for Outdoor Rentals');
	});

	test('SC-BC-10: post page has BlogPosting JSON-LD schema', async ({ page }) => {
		await page.goto('/blog/weather-considerations-for-outdoor-rentals/');
		const scripts = await page.locator('script[type="application/ld+json"]').allTextContents();
		const hasArticle = scripts.some((s) => {
			try {
				const obj = JSON.parse(s);
				return obj['@type'] === 'BlogPosting';
			} catch {
				return false;
			}
		});
		expect(hasArticle).toBe(true);
	});

	test('SC-BC-09: unknown slug returns 404', async ({ page }) => {
		const response = await page.goto('/blog/this-slug-does-not-exist/');
		expect(response?.status()).toBe(404);
	});

	test('SC-TAX-16: author name links to /blog/author/<slug>/', async ({ page }) => {
		await page.goto('/blog/weather-considerations-for-outdoor-rentals/');
		const authorLink = page.locator('a[href^="/blog/author/"]').first();
		await expect(authorLink).toBeVisible();
		const href = await authorLink.getAttribute('href');
		expect(href).toMatch(/^\/blog\/author\/[a-z0-9-]+\/$/);
	});

	test('SC-TAX-17: category tags link to /blog/category/<slug>/', async ({ page }) => {
		await page.goto('/blog/weather-considerations-for-outdoor-rentals/');
		const catLink = page.locator('a[href^="/blog/category/"]').first();
		await expect(catLink).toBeVisible();
		const href = await catLink.getAttribute('href');
		expect(href).toMatch(/^\/blog\/category\/[a-z0-9-]+\/$/);
	});
});

test.describe('Category Landing (/blog/category/[category]/)', () => {
	test('SC-TAX-04: category page returns 200 and lists posts', async ({ page }) => {
		const response = await page.goto('/blog/category/weddings/');
		expect(response?.status()).toBe(200);
		const cards = page.locator('[data-testid="post-card"]');
		await expect(cards.first()).toBeVisible();
	});

	test('SC-TAX-06: canonical URL has trailing slash', async ({ page }) => {
		await page.goto('/blog/category/weddings/');
		const canonical = await page.locator('link[rel="canonical"]').getAttribute('href');
		expect(canonical).toMatch(/\/blog\/category\/weddings\/$/);
	});

	test('SC-TAX-07: CollectionPage JSON-LD is present', async ({ page }) => {
		await page.goto('/blog/category/weddings/');
		const scripts = await page.locator('script[type="application/ld+json"]').allTextContents();
		const hasCollection = scripts.some((s) => {
			try {
				const obj = JSON.parse(s);
				return obj['@type'] === 'CollectionPage';
			} catch {
				return false;
			}
		});
		expect(hasCollection).toBe(true);
	});

	test('SC-TAX-05: unknown category returns 404', async ({ page }) => {
		const response = await page.goto('/blog/category/nonexistent-category-xyz/');
		expect(response?.status()).toBe(404);
	});
});

test.describe('Author Landing (/blog/author/[author]/)', () => {
	test('SC-TAX-11: author page returns 200 and shows posts', async ({ page }) => {
		const response = await page.goto('/blog/author/hector-luis-lorenzo/');
		expect(response?.status()).toBe(200);
		const cards = page.locator('[data-testid="post-card"]');
		await expect(cards.first()).toBeVisible();
	});

	test('SC-TAX-13: canonical URL has trailing slash', async ({ page }) => {
		await page.goto('/blog/author/hector-luis-lorenzo/');
		const canonical = await page.locator('link[rel="canonical"]').getAttribute('href');
		expect(canonical).toMatch(/\/blog\/author\/hector-luis-lorenzo\/$/);
	});

	test('SC-TAX-14: CollectionPage JSON-LD present', async ({ page }) => {
		await page.goto('/blog/author/hector-luis-lorenzo/');
		const scripts = await page.locator('script[type="application/ld+json"]').allTextContents();
		const hasCollection = scripts.some((s) => {
			try {
				const obj = JSON.parse(s);
				return obj['@type'] === 'CollectionPage';
			} catch {
				return false;
			}
		});
		expect(hasCollection).toBe(true);
	});

	test('SC-TAX-12: unknown author returns 404', async ({ page }) => {
		const response = await page.goto('/blog/author/nobody-xyz-does-not-exist/');
		expect(response?.status()).toBe(404);
	});
});

test.describe('Blog SEO — Article schema enrichment', () => {
	test('audio-visual-rental-company has BlogPosting JSON-LD with FAQPage JSON-LD', async ({ page }) => {
		await page.goto('/blog/audio-visual-rental-company/');
		const scripts = await page.locator('script[type="application/ld+json"]').allTextContents();
		const schemas = scripts.map((s) => { try { return JSON.parse(s); } catch { return null; } }).filter(Boolean);

		const article = schemas.find((s: any) => s['@type'] === 'BlogPosting');
		expect(article).toBeTruthy();
		// inLanguage must be 'en'
		expect(article?.inLanguage).toBe('en');
		// author.url and publisher.url should be present
		expect(article?.author?.url).toBe('https://malagaeventgear.com/blog/author/hector-luis-lorenzo/');
		expect(article?.publisher?.url).toBe('https://malagaeventgear.com');

		const faqPage = schemas.find((s: any) => s['@type'] === 'FAQPage');
		expect(faqPage).toBeTruthy();
		expect(Array.isArray(faqPage?.mainEntity)).toBe(true);
		expect(faqPage?.mainEntity.length).toBeGreaterThan(0);
	});

	test('audio-visual-rental-company has og:type=article meta tags', async ({ page }) => {
		await page.goto('/blog/audio-visual-rental-company/');
		const ogType = await page.locator('meta[property="og:type"]').getAttribute('content');
		expect(ogType).toBe('article');

		// article:published_time should be present
		const publishedTime = await page.locator('meta[property="article:published_time"]').getAttribute('content');
		expect(publishedTime).toBeTruthy();

		// article:author should point to the author bio URL
		const authorMeta = await page.locator('meta[property="article:author"]').getAttribute('content');
		expect(authorMeta).toBe('https://malagaeventgear.com/blog/author/hector-luis-lorenzo/');
	});

	test('audio-visual-rental-company has <details> FAQ accordion in body', async ({ page }) => {
		await page.goto('/blog/audio-visual-rental-company/');
		const details = page.locator('details.faq-item');
		await expect(details.first()).toBeVisible();
		const count = await details.count();
		expect(count).toBeGreaterThan(0);
	});

	test('news post has NewsArticle JSON-LD', async ({ page }) => {
		await page.goto('/blog/news-malaga-event-gear-delivers-flawless-audiovisual-production-at-progold-summit-2026-in-torremolinos/');
		const scripts = await page.locator('script[type="application/ld+json"]').allTextContents();
		const schemas = scripts.map((s: string) => { try { return JSON.parse(s); } catch { return null; } }).filter(Boolean);

		const article = schemas.find((s: any) => s['@type'] === 'NewsArticle');
		expect(article).toBeTruthy();
		expect(article?.inLanguage).toBe('en');
		expect(article?.author?.url).toBe('https://malagaeventgear.com/blog/author/hector-luis-lorenzo/');
		expect(article?.publisher?.url).toBe('https://malagaeventgear.com');
	});

	test('non-news post has BlogPosting (not NewsArticle)', async ({ page }) => {
		await page.goto('/blog/weather-considerations-for-outdoor-rentals/');
		const scripts = await page.locator('script[type="application/ld+json"]').allTextContents();
		const schemas = scripts.map((s: string) => { try { return JSON.parse(s); } catch { return null; } }).filter(Boolean);

		const blogPosting = schemas.find((s: any) => s['@type'] === 'BlogPosting');
		const newsArticle = schemas.find((s: any) => s['@type'] === 'NewsArticle');
		expect(blogPosting).toBeTruthy();
		expect(newsArticle).toBeFalsy();
	});
});

test.describe('Post Sitemap (/post-sitemap.xml)', () => {
	test('SC-SM-01: returns 200 with XML content-type and at least one <url>', async ({ page }) => {
		const response = await page.goto('/post-sitemap.xml');
		expect(response?.status()).toBe(200);
		const contentType = response?.headers()['content-type'];
		expect(contentType).toContain('application/xml');
		const body = await page.content();
		expect(body).toContain('<url>');
	});

	test('SC-SM-02: post URL uses trailing slash', async ({ page }) => {
		await page.goto('/post-sitemap.xml');
		const body = await page.content();
		expect(body).toContain('<loc>https://malagaeventgear.com/blog/weather-considerations-for-outdoor-rentals/</loc>');
	});

	test('SC-SM-03/04: <lastmod> uses updated when present (overrides publishDate)', async ({ page }) => {
		await page.goto('/post-sitemap.xml');
		const body = await page.content();
		// weather-considerations-for-outdoor-rentals: publishDate 2026-03-02, updated 2026-02-17.
		// The <url> block for this post MUST have lastmod derived from `updated`, not `publishDate`.
		const urlBlockMatch = body.match(
			/<url>[\s\S]*?<loc>[^<]*weather-considerations-for-outdoor-rentals[^<]*<\/loc>[\s\S]*?<\/url>/
		);
		expect(urlBlockMatch).not.toBeNull();
		const urlBlock = urlBlockMatch![0];
		expect(urlBlock).toContain('<lastmod>2026-02-17T00:00:00+00:00</lastmod>');
		expect(urlBlock).not.toContain('2026-03-02');
	});

	test('SC-SM-05: draft posts are excluded', async ({ page }) => {
		await page.goto('/post-sitemap.xml');
		const body = await page.content();
		expect(body).not.toContain('draft-post-test-fixture');
	});

	test('SC-SM-06: future-dated posts are excluded', async ({ page }) => {
		await page.goto('/post-sitemap.xml');
		const body = await page.content();
		expect(body).not.toContain('future-post-test-fixture');
	});

	test('SC-SM-07: posts with coverImage include <image:image> block', async ({ page }) => {
		await page.goto('/post-sitemap.xml');
		const body = await page.content();
		expect(body).toContain('<image:image>');
		expect(body).toContain('<image:loc>');
	});

	test('SC-SM-10: Content-Type header is application/xml', async ({ page }) => {
		const response = await page.goto('/post-sitemap.xml');
		const ct = response?.headers()['content-type'];
		expect(ct).toContain('application/xml');
	});
});

test.describe('Category Sitemap (/category-sitemap.xml)', () => {
	test('SC-SM-08: returns 200 with category URLs', async ({ page }) => {
		const response = await page.goto('/category-sitemap.xml');
		expect(response?.status()).toBe(200);
		const body = await page.content();
		expect(body).toContain('/blog/category/');
	});

	test('SC-SM-08: category URL uses trailing slash', async ({ page }) => {
		await page.goto('/category-sitemap.xml');
		const body = await page.content();
		// Each loc should end with /
		const matches = body.match(/<loc>([^<]+)<\/loc>/g) ?? [];
		const catLocs = matches.filter((m) => m.includes('/blog/category/'));
		expect(catLocs.length).toBeGreaterThan(0);
		catLocs.forEach((loc) => {
			expect(loc).toMatch(/\/blog\/category\/[a-z0-9-]+\/<\/loc>$/);
		});
	});
});

test.describe('Author Sitemap (/author-sitemap.xml)', () => {
	test('SC-SM-09: returns 200 with author URLs', async ({ page }) => {
		const response = await page.goto('/author-sitemap.xml');
		expect(response?.status()).toBe(200);
		const body = await page.content();
		expect(body).toContain('/blog/author/');
	});

	test('SC-SM-09: author URL uses trailing slash', async ({ page }) => {
		await page.goto('/author-sitemap.xml');
		const body = await page.content();
		const matches = body.match(/<loc>([^<]+)<\/loc>/g) ?? [];
		const authorLocs = matches.filter((m) => m.includes('/blog/author/'));
		expect(authorLocs.length).toBeGreaterThan(0);
		authorLocs.forEach((loc) => {
			expect(loc).toMatch(/\/blog\/author\/[a-z0-9-]+\/<\/loc>$/);
		});
	});
});
