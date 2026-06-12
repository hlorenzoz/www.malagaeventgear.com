import { test, expect } from '@playwright/test';

test.describe('Equipment Page Enhancements E2E Tests', () => {
	test.beforeEach(async ({ page }) => {
		await page.goto('/equipment/');
		await page.waitForLoadState('networkidle');
	});

	test('should render the image marquee strip on the equipment page', async ({ page }) => {
		const marquees = page.locator('.marquee-container');
		await expect(marquees.first()).toBeVisible();
		await expect(marquees).toHaveCount(2);

		// Verify they contain images
		const images = marquees.first().locator('img');
		const count = await images.count();
		expect(count).toBeGreaterThan(0);
	});

	test('should render the testimonials (Google My Business reviews) on the equipment page', async ({ page }) => {
		const section = page.locator('[data-testid="testimonials"]');
		await expect(section).toBeAttached();
		await section.scrollIntoViewIfNeeded();
		await expect(section).toBeVisible();

		const meta = section.locator('[data-testid="reviews-meta"]');
		await expect(meta).toBeVisible();
	});

	test('should link the arrow button in the "Special Effects & Fog Machines" section to /packages/', async ({ page }) => {
		// Get the Special Effects banner
		const heading = page.locator('h2:has-text("Special Effects & Fog Machines"), h2:has-text("Efectos Especiales y Máquinas de Humo")');
		await expect(heading).toBeVisible();

		const section = heading.locator('xpath=./ancestor::section');
		const arrowButton = section.locator('a[href="/packages/"]');
		await expect(arrowButton).toBeVisible();
	});
});
