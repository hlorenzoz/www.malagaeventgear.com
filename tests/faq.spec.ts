import { test, expect } from '@playwright/test';

test.describe('FAQ Filter Verification', () => {
	test.beforeEach(async ({ page }) => {
		// Navigate to the FAQ page
		await page.goto('/faq');
		// Wait for the page content to render and reveal animations to trigger
		await page.waitForLoadState('networkidle');
	});

	test('should display all 6 FAQs initially and keep them visible', async ({ page }) => {
		const faqs = page.locator('.glass-panel.reveal');
		// Check that we have exactly 6 FAQ accordion items
		await expect(faqs).toHaveCount(6);

		// Assert that all initial FAQ items are fully visible (opacity: 1)
		for (let i = 0; i < 6; i++) {
			await expect(faqs.nth(i)).toBeVisible();
			const opacity = await faqs.nth(i).evaluate((el) => window.getComputedStyle(el).opacity);
			expect(opacity).toBe('1');
		}
	});

	test('should correctly filter FAQs when selecting categories and maintain visibility', async ({ page }) => {
		// Click on "Services & Gear" / "Servicios y Equipos" filter
		const servicesFilter = page.locator('button:has-text("Services & Gear"), button:has-text("Servicios y Equipos")');
		await expect(servicesFilter).toBeVisible();
		await servicesFilter.click();

		// Svelte transition slide is 250ms, let's wait a moment
		await page.waitForTimeout(300);

		// Services category should filter down to exactly 2 FAQ items
		const faqs = page.locator('.glass-panel.reveal');
		await expect(faqs).toHaveCount(2);

		// Verify these filtered items are visible and have opacity: 1 (not blocked by MutationObserver reveal bug)
		for (let i = 0; i < 2; i++) {
			await expect(faqs.nth(i)).toBeVisible();
			const opacity = await faqs.nth(i).evaluate((el) => window.getComputedStyle(el).opacity);
			expect(opacity).toBe('1');
		}
	});

	test('should restore all 6 visible FAQs when clicking back to "All Questions" / "Todas"', async ({ page }) => {
		// First select a category to trigger DOM re-rendering/reconciliation
		const servicesFilter = page.locator('button:has-text("Services & Gear"), button:has-text("Servicios y Equipos")');
		await servicesFilter.click();
		await page.waitForTimeout(300);

		// Verify count is 2
		const faqsFiltered = page.locator('.glass-panel.reveal');
		await expect(faqsFiltered).toHaveCount(2);

		// Click back to "All Questions" / "Todas"
		const allFilter = page.locator('button:has-text("All Questions"), button:has-text("Todas")');
		await expect(allFilter).toBeVisible();
		await allFilter.click();
		await page.waitForTimeout(300);

		// Verify that all 6 FAQs are restored in the DOM
		const faqsRestored = page.locator('.glass-panel.reveal');
		await expect(faqsRestored).toHaveCount(6);

		// CRITICAL CHECK: Verify Svelte re-created items are NOT invisible (opacity: 1)
		for (let i = 0; i < 6; i++) {
			await expect(faqsRestored.nth(i)).toBeVisible();
			const opacity = await faqsRestored.nth(i).evaluate((el) => window.getComputedStyle(el).opacity);
			expect(opacity).toBe('1');
		}
	});
});
