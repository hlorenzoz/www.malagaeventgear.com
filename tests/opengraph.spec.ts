import { test, expect } from '@playwright/test';

test.describe('OpenGraph & Twitter Card Meta E2E Validation Tests', () => {

	test('1. should inject default OpenGraph and Twitter tags on Home page', async ({ page }) => {
		await page.goto('/');
		await page.waitForLoadState('networkidle');

		// Basic SEO
		await expect(page).toHaveTitle('Premium Audiovisual Equipment Rental in Malaga | MEG');
		
		// OpenGraph Core
		await expect(page.locator('meta[property="og:title"]')).toHaveAttribute('content', 'Premium Audiovisual Equipment Rental in Malaga | MEG');
		await expect(page.locator('meta[property="og:description"]')).toHaveAttribute('content', /Malaga Event Gear/);
		await expect(page.locator('meta[property="og:url"]')).toHaveAttribute('content', 'https://malagaeventgear.com/');
		await expect(page.locator('meta[property="og:type"]')).toHaveAttribute('content', 'website');
		await expect(page.locator('meta[property="og:site_name"]')).toHaveAttribute('content', 'Malaga Event Gear');
		
		// Locale Defaults
		await expect(page.locator('meta[property="og:locale"]')).toHaveAttribute('content', 'en_US');
		await expect(page.locator('meta[property="og:locale:alternate"]')).toHaveAttribute('content', 'es_ES');

		// Dynamic Absolute Image Default
		const defaultImg = 'https://malagaeventgear.com/premium_event_stage.webp';
		await expect(page.locator('meta[property="og:image"]')).toHaveAttribute('content', defaultImg);
		await expect(page.locator('meta[property="og:image:width"]')).toHaveAttribute('content', '1024');
		await expect(page.locator('meta[property="og:image:height"]')).toHaveAttribute('content', '1024');

		// Twitter Cards
		await expect(page.locator('meta[name="twitter:card"]')).toHaveAttribute('content', 'summary_large_image');
		await expect(page.locator('meta[name="twitter:image"]')).toHaveAttribute('content', defaultImg);
	});

	test('2. should dynamic toggle locales between ES and EN', async ({ page }) => {
		await page.goto('/');
		await page.waitForLoadState('networkidle');

		// Initial is EN
		await expect(page.locator('meta[property="og:locale"]')).toHaveAttribute('content', 'en_US');

		// Click the Language Toggle button (TopNavBar)
		const langToggle = page.locator('button[aria-label^="ES -"]');
		await langToggle.click();
		await page.waitForTimeout(200);

		// Now locale should shift to ES
		await expect(page.locator('meta[property="og:locale"]')).toHaveAttribute('content', 'es_ES');
		await expect(page.locator('meta[property="og:locale:alternate"]')).toHaveAttribute('content', 'en_US');
	});

	test('3. should inject specific package image on wedding package page', async ({ page }) => {
		await page.goto('/packages/wedding/');
		await page.waitForLoadState('networkidle');

		// Core package details in OpenGraph
		await expect(page.locator('meta[property="og:url"]')).toHaveAttribute('content', 'https://malagaeventgear.com/packages/wedding/');
		
		// Image overrides with absolute path
		const expectedImg = 'https://malagaeventgear.com/images/packages/wedding.webp';
		await expect(page.locator('meta[property="og:image"]')).toHaveAttribute('content', expectedImg);
		await expect(page.locator('meta[name="twitter:image"]')).toHaveAttribute('content', expectedImg);
	});

	test('4. should inject featured mice image on equipment page', async ({ page }) => {
		await page.goto('/equipment/');
		await page.waitForLoadState('networkidle');

		// Equipment catalog image override
		const expectedImg = 'https://malagaeventgear.com/images/packages/mice.webp';
		await expect(page.locator('meta[property="og:image"]')).toHaveAttribute('content', expectedImg);
		await expect(page.locator('meta[name="twitter:image"]')).toHaveAttribute('content', expectedImg);
	});
});
