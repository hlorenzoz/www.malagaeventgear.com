import { test, expect } from '@playwright/test';

test.describe('Breadcrumbs Visual & Navigation E2E Tests', () => {
	test.beforeEach(async ({ page }) => {
		// Start from the home page
		await page.goto('/');
		await page.waitForLoadState('networkidle');
	});

	test('should NOT render visible breadcrumbs on the Home page', async ({ page }) => {
		const breadcrumbs = page.locator('nav[aria-label="Breadcrumbs"]');
		await expect(breadcrumbs).not.toBeAttached();
	});

	test('should render breadcrumbs on inner pages with correct nesting and trailing-slash URLs', async ({ page }) => {
		// Go to Packages index
		await page.goto('/packages/');
		await page.waitForLoadState('networkidle');

		const breadcrumbs = page.locator('nav[aria-label="Breadcrumbs"]');
		await expect(breadcrumbs).toBeVisible();

		// Check Home link
		const homeLink = breadcrumbs.locator('a[href="/"]');
		await expect(homeLink).toBeVisible();
		await expect(homeLink).toContainText(/Home|Inicio/);

		// Check current page active label
		const activeLabel = breadcrumbs.locator('span[aria-current="page"]');
		await expect(activeLabel).toBeVisible();
		await expect(activeLabel).toContainText(/Packages|Paquetes/);

		// Go to a specific package page
		await page.goto('/packages/wedding/');
		await page.waitForLoadState('networkidle');

		await expect(breadcrumbs).toBeVisible();

		// Verify parent link is clickable and ends strictly with trailing slash
		const parentLink = breadcrumbs.locator('a[href="/packages/"]');
		await expect(parentLink).toBeVisible();
		await expect(parentLink).toContainText(/Packages|Paquetes/);

		// Verify leaf node is highlighted correctly
		const currentLabel = breadcrumbs.locator('span[aria-current="page"]');
		await expect(currentLabel).toBeVisible();
		await expect(currentLabel).toContainText(/Wedding|Bodas/);
	});

	test('should translate breadcrumbs dynamically when switching languages', async ({ page }) => {
		// Go to /packages/
		await page.goto('/packages/');
		await page.waitForLoadState('networkidle');

		const breadcrumbs = page.locator('nav[aria-label="Breadcrumbs"]');
		await expect(breadcrumbs).toBeVisible();

		// By default language should be English, checking Home -> Packages
		let homeLink = breadcrumbs.locator('a[href="/"]');
		let activeLabel = breadcrumbs.locator('span[aria-current="page"]');

		// If current language is Spanish, we want to toggle to English, or vice versa.
		// Let's assert based on whatever language is active.
		const isSpanishDefault = (await homeLink.innerText()) === 'Inicio';

		if (isSpanishDefault) {
			await expect(homeLink).toHaveText('Inicio');
			await expect(activeLabel).toHaveText('Paquetes');

			// Toggle language to English (click button containing EN)
			const langBtn = page.locator('button:has-text("EN")').first();
			await expect(langBtn).toBeVisible();
			await langBtn.click();

			// Assert translated English values
			await expect(homeLink).toHaveText('Home');
			await expect(activeLabel).toHaveText('Packages');
		} else {
			await expect(homeLink).toHaveText('Home');
			await expect(activeLabel).toHaveText('Packages');

			// Toggle language to Spanish (click button containing ES)
			const langBtn = page.locator('button:has-text("ES")').first();
			await expect(langBtn).toBeVisible();
			await langBtn.click();

			// Assert translated Spanish values
			await expect(homeLink).toHaveText('Inicio');
			await expect(activeLabel).toHaveText('Paquetes');
		}
	});
});
