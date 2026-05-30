import { test, expect } from '@playwright/test';

test.describe('Service Packages & Footer Navigation E2E Tests', () => {
	const packageIds = ['eco', 'wedding', 'presentation', 'mice-basic', 'mice-full'];
	
	const packageDetails = [
		{ id: 'eco', route: '/packages/eco/', name: 'Eco Pack', price: '290' },
		{ id: 'wedding', route: '/packages/wedding/', name: 'Wedding Pack', price: '650' },
		{ id: 'presentation', route: '/packages/product-presentation/', name: 'Product Presentation Pack', price: '310' },
		{ id: 'mice-basic', route: '/packages/basic-mice/', name: 'Basic MICE Pack', price: '295' },
		{ id: 'mice-full', route: '/packages/mice/', name: 'MICE Pack', price: '490' }
	];

	test.beforeEach(async ({ page }) => {
		// Start from the home page
		await page.goto('/');
		await page.waitForLoadState('networkidle');
	});

	test('should display dynamic "SERVICE PACKAGES" links in the footer and navigate correctly', async ({ page }) => {
		const footer = page.locator('footer');
		await expect(footer).toBeVisible();

		// Check the "Service Packages" section exists
		const sectionHeader = footer.locator('span:has-text("Service Packages"), span:has-text("Paquetes de Servicios")');
		await expect(sectionHeader).toBeVisible();

		// Verify each package link exists and maps to the correct route
		for (const pkg of packageDetails) {
			const link = footer.locator(`a[href="${pkg.route}"]`);
			await expect(link).toBeVisible();
			await expect(link).toContainText(pkg.name);
		}
	});

	test('should verify packages carousel display and direct navigation links', async ({ page }) => {
		await page.goto('/packages/');
		await page.waitForLoadState('networkidle');

		// Packages carousel should contain all 5 packages
		for (const pkg of packageDetails) {
			// Scope to the card by its unique detail route link (avoids "MICE Pack" vs
			// "Basic MICE Pack" substring ambiguity)
			const card = page.locator(`[data-testid="package-card"]:has(a[href="${pkg.route}"])`);
			await expect(card).toBeVisible();

			// Verify correct price displays on card
			const priceText = card.locator(`.text-electric-blue:has-text("${pkg.price}")`);
			await expect(priceText).toBeVisible();
		}
	});

	test('should verify each package landing page content and booking CTA URL pre-selection', async ({ page }) => {
		for (const pkg of packageDetails) {
			await page.goto(pkg.route);
			await page.waitForLoadState('networkidle');

			// Verify header displays the correct package name
			const header = page.locator('h1');
			await expect(header).toContainText(pkg.name);

			// Verify price is visible on the package page
			const priceText = page.locator(`.text-electric-blue:has-text("${pkg.price}")`);
			await expect(priceText).toBeVisible();

			// Verify the Book/CTA button maps to the correct contact pre-selection URL
			const ctaButton = page.locator(`a[href="/contact-us/?pack=${pkg.id}"]`);
			await expect(ctaButton).toBeVisible();
		}
	});
});
