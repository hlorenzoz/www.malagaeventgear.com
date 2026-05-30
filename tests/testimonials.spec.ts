import { test, expect } from '@playwright/test';

test.describe('Testimonials Section (Google Reviews) E2E Tests', () => {
	test.beforeEach(async ({ page }) => {
		await page.goto('/');
		await page.waitForLoadState('networkidle');
	});

	test('should render the testimonials section below the fold on the home page', async ({ page }) => {
		const section = page.locator('[data-testid="testimonials"]');
		await expect(section).toBeAttached();
		await section.scrollIntoViewIfNeeded();
		await expect(section).toBeVisible();
	});

	test('should display the aggregate rating block with the total review count', async ({ page }) => {
		const section = page.locator('[data-testid="testimonials"]');
		await section.scrollIntoViewIfNeeded();

		const meta = section.locator('[data-testid="reviews-meta"]');
		await expect(meta).toBeVisible();
		// Aggregate count from reviews.generated.json meta.totalCount = 8
		await expect(meta).toContainText('8');
	});

	test('should render one card per seeded testimonial', async ({ page }) => {
		const section = page.locator('[data-testid="testimonials"]');
		await section.scrollIntoViewIfNeeded();

		const cards = section.locator('[data-testid="testimonial-card"]');
		// 7 text reviews are curated (the 8th Google review has media only, no text)
		await expect(cards).toHaveCount(7);

		// Authors from the curated data must be present
		await expect(section.getByText('Anna Wisser')).toBeVisible();
		await expect(section.getByText('Gines de Biedma')).toBeVisible();
		await expect(section.getByText('Dániel Gombár')).toBeVisible();
	});

	test('should expose the rating as an accessible label on each card', async ({ page }) => {
		const section = page.locator('[data-testid="testimonials"]');
		await section.scrollIntoViewIfNeeded();

		const firstStars = section.locator('[data-testid="rating-stars"]').first();
		await expect(firstStars).toHaveAttribute('aria-label', /5/);
	});

	test('should expand and collapse a long review with the Read more toggle', async ({ page }) => {
		const section = page.locator('[data-testid="testimonials"]');
		await section.scrollIntoViewIfNeeded();

		// The Dániel Gombár review is long enough to be clamped
		const card = section.locator('[data-testid="testimonial-card"]', {
			hasText: 'exceeded my expectations'
		});
		const toggle = card.locator('[data-testid="read-more"]');
		await expect(toggle).toBeVisible();

		await expect(card).toHaveAttribute('data-expanded', 'false');
		await toggle.click();
		await expect(card).toHaveAttribute('data-expanded', 'true');
		await toggle.click();
		await expect(card).toHaveAttribute('data-expanded', 'false');
	});

	test('should link "See all reviews" to the Google My Business profile', async ({ page }) => {
		const section = page.locator('[data-testid="testimonials"]');
		await section.scrollIntoViewIfNeeded();

		const seeAll = section.locator('[data-testid="see-all-reviews"]');
		await expect(seeAll).toBeVisible();
		await expect(seeAll).toHaveAttribute('href', 'https://share.google/xlg0PV3QeGBNKVnA9');
		await expect(seeAll).toHaveAttribute('target', '_blank');
	});

	test('should advance the carousel with the next control', async ({ page }) => {
		// Force a narrow viewport so the track overflows and scrolling is meaningful
		// (on wide desktops the seed cards fit without overflow).
		await page.setViewportSize({ width: 390, height: 800 });

		const section = page.locator('[data-testid="testimonials"]');
		await section.scrollIntoViewIfNeeded();

		const next = section.locator('[data-testid="carousel-next"]');
		const prev = section.locator('[data-testid="carousel-prev"]');
		await expect(next).toBeVisible();
		await expect(prev).toBeVisible();

		const track = section.locator('[data-testid="carousel-track"]');
		// Guard: the track must actually be scrollable for this assertion to be valid.
		const scrollable = await track.evaluate((el) => el.scrollWidth > el.clientWidth);
		expect(scrollable).toBe(true);

		const before = await track.evaluate((el) => el.scrollLeft);
		await next.click();
		// Allow the smooth scroll to settle
		await page.waitForTimeout(600);
		const after = await track.evaluate((el) => el.scrollLeft);
		expect(after).toBeGreaterThan(before);
	});
});
