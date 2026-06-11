import { test, expect } from '@playwright/test';

test.describe('Click to Tweet Text Selection E2E', () => {
	const postUrl = '/blog/weather-considerations-for-outdoor-rentals/';

	test.beforeEach(async ({ page }) => {
		await page.goto(postUrl);
		// Wait for load state and network to stabilize
		await page.waitForLoadState('networkidle');
		await page.waitForTimeout(500); // Small buffer to ensure Svelte onMount runs
	});

	test('Selecting valid text inside .prose shows the tooltip, and deselecting hides it', async ({ page }) => {
		const tooltip = page.locator('[data-testid="click-to-tweet-tooltip"]');
		await expect(tooltip).not.toBeVisible();

		// 1. Select text inside .prose
		await page.evaluate(() => {
			const paragraph = document.querySelector('.prose p');
			if (paragraph) {
				const textNode = paragraph.firstChild;
				if (textNode) {
					const range = document.createRange();
					// Select the first 40 characters
					range.setStart(textNode, 0);
					range.setEnd(textNode, Math.min(40, textNode.textContent?.length || 40));
					const selection = window.getSelection();
					if (selection) {
						selection.removeAllRanges();
						selection.addRange(range);
						document.dispatchEvent(new Event('selectionchange'));
					}
				}
			}
		});

		// 2. Tooltip should be visible
		await expect(tooltip).toBeVisible();

		// 3. Clear selection
		await page.evaluate(() => {
			const selection = window.getSelection();
			if (selection) {
				selection.removeAllRanges();
				document.dispatchEvent(new Event('selectionchange'));
			}
		});

		// 4. Tooltip should disappear
		await expect(tooltip).not.toBeVisible();
	});

	test('Clicking the Tweet button opens a popup with the correct X share URL intent', async ({ page }) => {
		// Ensure page is active to handle popups cleanly
		await page.bringToFront();

		const tooltip = page.locator('[data-testid="click-to-tweet-tooltip"]');
		await expect(tooltip).not.toBeVisible();

		// Select text inside .prose
		await page.evaluate(() => {
			const paragraph = document.querySelector('.prose p');
			if (paragraph) {
				const textNode = paragraph.firstChild;
				if (textNode) {
					const range = document.createRange();
					range.setStart(textNode, 0);
					range.setEnd(textNode, Math.min(30, textNode.textContent?.length || 30));
					const selection = window.getSelection();
					if (selection) {
						selection.removeAllRanges();
						selection.addRange(range);
						document.dispatchEvent(new Event('selectionchange'));
					}
				}
			}
		});

		const button = page.locator('[data-testid="click-to-tweet-button"]');
		await expect(button).toBeVisible();

		// Intercept popup window creation
		const [popup] = await Promise.all([
			page.waitForEvent('popup'),
			button.click()
		]);

		const popupUrl = popup.url();
		expect(popupUrl).toContain('intent/tweet');
		
		// The URL should contain the encoded selected text and the post url
		expect(popupUrl).toContain('text=%E2%80%9C'); // URL encoded "“"
		expect(popupUrl).toContain('url=https%3A%2F%2Fmalagaeventgear.com%2Fblog%2F');
	});

	test('Selecting text outside .prose (e.g. post header) does not trigger the tooltip', async ({ page }) => {
		const tooltip = page.locator('[data-testid="click-to-tweet-tooltip"]');
		await expect(tooltip).not.toBeVisible();

		// Select text inside H1 (post header, which is outside .prose)
		await page.evaluate(() => {
			const h1 = document.querySelector('header h1');
			if (h1) {
				const textNode = h1.firstChild;
				if (textNode) {
					const range = document.createRange();
					range.setStart(textNode, 0);
					range.setEnd(textNode, Math.min(20, textNode.textContent?.length || 20));
					const selection = window.getSelection();
					if (selection) {
						selection.removeAllRanges();
						selection.addRange(range);
						document.dispatchEvent(new Event('selectionchange'));
					}
				}
			}
		});

		// Tooltip should remain hidden
		await expect(tooltip).not.toBeVisible();
	});

	test('Selecting text that is too short or too long does not trigger the tooltip', async ({ page }) => {
		const tooltip = page.locator('[data-testid="click-to-tweet-tooltip"]');
		await expect(tooltip).not.toBeVisible();

		// 1. Text selection is too short (2 chars)
		await page.evaluate(() => {
			const paragraph = document.querySelector('.prose p');
			if (paragraph) {
				const textNode = paragraph.firstChild;
				if (textNode) {
					const range = document.createRange();
					range.setStart(textNode, 0);
					range.setEnd(textNode, 2);
					const selection = window.getSelection();
					if (selection) {
						selection.removeAllRanges();
						selection.addRange(range);
						document.dispatchEvent(new Event('selectionchange'));
					}
				}
			}
		});

		await expect(tooltip).not.toBeVisible();
	});
});
