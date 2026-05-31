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
			const ctaButton = page.locator(`a[href="/contact/?pack=${pkg.id}"]`);
			await expect(ctaButton).toBeVisible();
		}
	});
});

test.describe('Dynamic E-commerce Filters on /packages/', () => {
	// Card visible by its unique detail-route link (avoids name-substring ambiguity)
	const cardByRoute = (page: import('@playwright/test').Page, route: string) =>
		page.locator(`[data-testid="package-card"]:has(a[href="${route}"])`);

	const routes = {
		eco: '/packages/eco/',
		wedding: '/packages/wedding/',
		presentation: '/packages/product-presentation/',
		miceBasic: '/packages/basic-mice/',
		miceFull: '/packages/mice/'
	};

	test.beforeEach(async ({ page }) => {
		// Desktop viewport so the sticky sidebar (lg:block) is rendered
		await page.setViewportSize({ width: 1440, height: 900 });
		await page.goto('/packages/');
		await page.waitForLoadState('networkidle');
	});

	test('1. initial render shows all 5 packages and "5 of 5" counter', async ({ page }) => {
		await expect(page.locator('[data-testid="package-card"]')).toHaveCount(5);
		await expect(page.getByTestId('results-count')).toContainText('5');
	});

	test('2. event type "Weddings" shows only the Wedding Pack', async ({ page }) => {
		await page.getByTestId('filter-purpose-wedding').click();
		await expect(cardByRoute(page, routes.wedding)).toBeVisible();
		await expect(page.locator('[data-testid="package-card"]')).toHaveCount(1);
	});

	test('3. capacity "Small" shows only packages up to 50 guests', async ({ page }) => {
		await page.getByTestId('filter-capacity-small').click();
		// eco (50) and mice-basic (40) qualify; wedding (80), presentation (none), mice-full (120) excluded
		await expect(cardByRoute(page, routes.eco)).toBeVisible();
		await expect(cardByRoute(page, routes.miceBasic)).toBeVisible();
		await expect(cardByRoute(page, routes.wedding)).toHaveCount(0);
		await expect(page.locator('[data-testid="package-card"]')).toHaveCount(2);
	});

	test('4. price "500€ and up" shows only the Wedding Pack', async ({ page }) => {
		await page.getByTestId('filter-price-high').click();
		await expect(cardByRoute(page, routes.wedding)).toBeVisible();
		await expect(page.locator('[data-testid="package-card"]')).toHaveCount(1);
	});

	test('5. equipment "Live Technician" shows Wedding + MICE Pack', async ({ page }) => {
		await page.getByTestId('filter-include-technician').click();
		await expect(cardByRoute(page, routes.wedding)).toBeVisible();
		await expect(cardByRoute(page, routes.miceFull)).toBeVisible();
		await expect(page.locator('[data-testid="package-card"]')).toHaveCount(2);
	});

	test('6. optional "Smoke Machine" shows only the Eco Pack', async ({ page }) => {
		await page.getByTestId('filter-optional-smoke-machine').click();
		await expect(cardByRoute(page, routes.eco)).toBeVisible();
		await expect(page.locator('[data-testid="package-card"]')).toHaveCount(1);
	});

	test('7. combined "Corporate" + "Screen" shows the 3 corporate AV packages', async ({ page }) => {
		await page.getByTestId('filter-purpose-corporate').click();
		await page.getByTestId('filter-include-screen').click();
		await expect(cardByRoute(page, routes.presentation)).toBeVisible();
		await expect(cardByRoute(page, routes.miceBasic)).toBeVisible();
		await expect(cardByRoute(page, routes.miceFull)).toBeVisible();
		await expect(page.locator('[data-testid="package-card"]')).toHaveCount(3);
	});

	test('8. reset restores all 5 packages', async ({ page }) => {
		await page.getByTestId('filter-purpose-wedding').click();
		await expect(page.locator('[data-testid="package-card"]')).toHaveCount(1);
		await page.getByTestId('filter-reset').click();
		await expect(page.locator('[data-testid="package-card"]')).toHaveCount(5);
	});

	test('9. sort "Price: High to Low" puts Wedding first and Eco last', async ({ page }) => {
		await page.getByTestId('filter-sort').selectOption('price-desc');
		const cards = page.locator('[data-testid="package-card"]');
		await expect(cards.first()).toContainText('Wedding Pack');
		await expect(cards.last()).toContainText('Eco Pack');
	});
});
