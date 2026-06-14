import { test, expect } from '@playwright/test';

test.describe('Share This Component E2E', () => {
	const postUrl = '/blog/weather-considerations-for-outdoor-rentals/';
	const packageUrl = '/packages/wedding/';

	test.beforeEach(async ({ page }) => {
		// Go to the post page and wait until loaded
		await page.goto(postUrl);
	});

	test('Desktop: Inline Top Share is visible on load, and Sidebar Share fades in on scroll', async ({ page }) => {
		// Set viewport size for desktop
		await page.setViewportSize({ width: 1280, height: 800 });

		// Wait for layout and IntersectionObserver to stabilize
		await page.waitForTimeout(250);

		// 1. Top inline share should be visible initially
		const topShare = page.locator('[data-testid="share-inline"]');
		await expect(topShare).toBeVisible();

		// 2. Sidebar share should start with opacity-0 (hidden)
		const sidebarShare = page.locator('[data-testid="share-sidebar"]');
		await expect(sidebarShare).toHaveClass(/opacity-0/);

		// 3. Scroll down using the testimonials carousel which is always present at the bottom
		const testimonial = page.locator('[data-testid="testimonial-card"]').first();
		await testimonial.scrollIntoViewIfNeeded();
		
		// Wait a small timeout to let the IntersectionObserver run
		await page.waitForTimeout(650);

		// 4. Sidebar share should now have opacity-100 (visible)
		await expect(sidebarShare).toHaveClass(/opacity-100/);

		// 5. Scroll back to top using the header
		const header = page.locator('header h1').first();
		await header.scrollIntoViewIfNeeded();
		await page.waitForTimeout(650);

		// 6. Sidebar share should fade out again (opacity-0)
		await expect(sidebarShare).toHaveClass(/opacity-0/);
	});

	test('Desktop: Copy Link button displays "Copied!" tooltip when clicked', async ({ page, context }) => {
		await page.setViewportSize({ width: 1280, height: 800 });
		
		// Grant clipboard write permissions
		await context.grantPermissions(['clipboard-write']);

		// Mock the navigator.clipboard writeText API inside the window context
		await page.evaluate(() => {
			Object.defineProperty(navigator, 'clipboard', {
				value: {
					writeText: async () => Promise.resolve()
				},
				writable: true,
				configurable: true
			});
		});

		// Wait for page hydration to complete so that events are wired up
		await page.waitForTimeout(1000);

		// Top share copy button
		const copyButton = page.locator('[data-testid="copy-link-button"]');
		await expect(copyButton).toBeVisible();

		// Focus page and button to prevent "Document is not focused" clipboard errors during parallel testing
		await page.bringToFront();
		await copyButton.focus();

		// Click copy button
		await copyButton.click();

		// Tooltip/bubble should appear with "Copied!"
		const tooltip = page.locator('.copy-tooltip');
		await expect(tooltip).toBeVisible();

		// Wait 2.5 seconds for tooltip to disappear
		await page.waitForTimeout(2500);
		await expect(tooltip).not.toBeVisible();
	});

	test('Mobile: FAB is hidden on load, fades in on scroll, and opens drawer on click', async ({ page }) => {
		// Set viewport size for mobile
		await page.setViewportSize({ width: 375, height: 667 });

		// Wait for hydration
		await page.waitForTimeout(800);

		// 1. FAB should be hidden initially (opacity-0)
		const fab = page.locator('[data-testid="share-fab"]');
		await expect(fab).toHaveClass(/opacity-0/);

		// 2. Drawer should not be open
		const drawerOverlay = page.locator('[data-testid="share-drawer-overlay"]');
		await expect(drawerOverlay).not.toBeVisible();

		// 3. Scroll down to trigger FAB visibility
		const testimonial = page.locator('[data-testid="testimonial-card"]').first();
		await testimonial.scrollIntoViewIfNeeded();
		await page.waitForTimeout(850);

		// 4. FAB should now be visible (opacity-100)
		await expect(fab).toHaveClass(/opacity-100/);

		// 5. Click the FAB to open the drawer
		await fab.click();

		// 6. Drawer overlay and sheet should be visible
		await expect(drawerOverlay).toBeVisible();
		await expect(page.locator('text=Share this post')).toBeVisible();

		// 7. Click on the close button to close drawer (use dispatchEvent for fixed overlays to avoid viewport click errors)
		const closeButton = page.locator('.share-drawer-close').first();
		await closeButton.dispatchEvent('click');
		await page.waitForTimeout(300);
		await expect(drawerOverlay).not.toBeVisible();
	});

	test('Packages Page: Share component is visible inline and mobile drawer functions', async ({ page, context }) => {
		// 1. Go to packages page
		await page.goto(packageUrl);
		await page.setViewportSize({ width: 375, height: 667 });

		// Wait for hydration
		await page.waitForTimeout(800);

		// 2. FAB should be present in DOM (its visibility state is dynamic based on observer)
		const fab = page.locator('[data-testid="share-fab"]');
		await expect(fab).toBeVisible();

		// 3. Scroll to testimonials at bottom to ensure observer updates and FAB is visible
		const testimonial = page.locator('[data-testid="testimonial-card"]').first();
		await testimonial.scrollIntoViewIfNeeded();
		await page.waitForTimeout(850);

		// 4. Ensure FAB is fully visible
		await expect(fab).toHaveClass(/opacity-100/);

		// 5. Click the FAB to open drawer
		await fab.click();

		// 6. Drawer should open
		const drawerOverlay = page.locator('[data-testid="share-drawer-overlay"]');
		await expect(drawerOverlay).toBeVisible();
		
		// 7. Close drawer (use dispatchEvent to prevent element out of viewport errors)
		const closeButton = page.locator('.share-drawer-close').first();
		await closeButton.dispatchEvent('click');
		await page.waitForTimeout(300);
		await expect(drawerOverlay).not.toBeVisible();
	});
});
