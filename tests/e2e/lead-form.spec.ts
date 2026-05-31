import { test, expect } from '@playwright/test';

const PACKAGE_URL = '/packages/basic-mice/';

// Helper: intercept /api/leads and mock a 201 success response
async function mockApiLeadsSuccess(page: import('@playwright/test').Page) {
	await page.route('**/api/leads', (route) => {
		if (route.request().method() === 'POST') {
			route.fulfill({
				status: 201,
				contentType: 'application/json',
				body: JSON.stringify({ ok: true, leadId: 'test-lead-id' }),
			});
		} else {
			route.continue();
		}
	});
}

test.describe('LeadForm — Phase 2 E2E', () => {
	test.beforeEach(async ({ page }) => {
		await page.goto(PACKAGE_URL);
		await page.waitForLoadState('networkidle');
	});

	// REQ-10, REQ-11: Form renders all 5 fields; +34 default visible
	test('renders all 5 fields and shows +34 as default country code', async ({ page }) => {
		// Name
		await expect(page.locator('#lead-name')).toBeVisible();
		// Email
		await expect(page.locator('#lead-email')).toBeVisible();
		// Phone (tel input inside PhoneInput)
		await expect(page.locator('#phone')).toBeVisible();
		// Country code default
		await expect(page.locator('select[aria-label]')).toHaveValue('+34');
		// Event date
		await expect(page.locator('#lead-event-date')).toBeVisible();
		// Comments textarea
		await expect(page.locator('#lead-comments')).toBeVisible();
	});

	// REQ-12: Submit with empty Name → blocked, error visible
	test('blocks submit with empty Name and shows error', async ({ page }) => {
		const form = page.locator('#lead-form form');
		await form.locator('button[type="submit"]').click();

		// Error message under Name field should appear
		const nameError = page.locator('#lead-name-error');
		await expect(nameError).toBeVisible();
		await expect(nameError).not.toBeEmpty();

		// URL must NOT have navigated away
		expect(page.url()).not.toContain('/thank-you/');
	});

	// REQ-12: Submit with past event-date → blocked, future-date error
	test('blocks submit with past event date and shows date error', async ({ page }) => {
		// Fill valid name + email + phone first to isolate date error
		await page.fill('#lead-name', 'Test User');
		await page.fill('#lead-email', 'test@example.com');
		await page.fill('#phone', '600123456');

		// Set a past date
		const pastDate = '2020-01-01';
		await page.fill('#lead-event-date', pastDate);
		await page.locator('#lead-event-date').blur();

		// Try to submit
		await page.locator('#lead-form form button[type="submit"]').click();

		const dateError = page.locator('#lead-date-error');
		await expect(dateError).toBeVisible();
		await expect(dateError).not.toBeEmpty();

		expect(page.url()).not.toContain('/thank-you/');
	});

	// REQ-15: Valid submit → navigates to /thank-you/
	test('valid form submission navigates to /thank-you/', async ({ page }) => {
		// Mock the API so D1 is not required in E2E
		await mockApiLeadsSuccess(page);

		const tomorrow = new Date();
		tomorrow.setDate(tomorrow.getDate() + 2);
		const dateStr = tomorrow.toISOString().split('T')[0];

		await page.fill('#lead-name', 'María García');
		await page.fill('#lead-email', 'maria@example.com');
		await page.fill('#phone', '600123456');
		await page.fill('#lead-event-date', dateStr);

		await page.locator('#lead-form form button[type="submit"]').click();

		await page.waitForURL('**/thank-you/**', { timeout: 5000 });
		expect(page.url()).toContain('/thank-you/');
		expect(page.url()).toContain('lead=test-lead-id');
	});

	// REQ-15: Thank-you headline visible after redirect
	test('thank-you page shows headline after redirect', async ({ page }) => {
		await page.goto('/thank-you/?lead=stub');
		await page.waitForLoadState('networkidle');

		// h1 should be visible and not empty
		const h1 = page.locator('h1');
		await expect(h1).toBeVisible();
		await expect(h1).not.toBeEmpty();
	});

	// REQ-14: Honeypot filled → no network request to /api/leads (silent discard in client)
	test('honeypot filled triggers silent discard — no api/leads request', async ({ page }) => {
		// Intercept any POST to /api/leads
		const requests: string[] = [];
		page.on('request', (req) => {
			if (req.url().includes('/api/leads') && req.method() === 'POST') {
				requests.push(req.url());
			}
		});

		// Fill honeypot directly via evaluate (it's visually off-screen)
		await page.evaluate(() => {
			const input = document.querySelector('input[name="website"]') as HTMLInputElement | null;
			if (input) {
				input.value = 'spambot';
				input.dispatchEvent(new Event('input', { bubbles: true }));
			}
		});

		const tomorrow = new Date();
		tomorrow.setDate(tomorrow.getDate() + 2);
		const dateStr = tomorrow.toISOString().split('T')[0];

		await page.fill('#lead-name', 'Bot Name');
		await page.fill('#lead-email', 'bot@spam.com');
		await page.fill('#phone', '600000000');
		await page.fill('#lead-event-date', dateStr);

		await page.locator('#lead-form form button[type="submit"]').click();
		// Give it a moment
		await page.waitForTimeout(500);

		// No request to /api/leads must have been made (honeypot check is client-side)
		// Note: in Phase 2, honeypot is also checked server-side. Client sends no request at all
		// because the client-side check (websiteHoneypot check before fetch) runs first.
		// The server also silently returns 200 if it somehow slips through.
		expect(requests.length).toBe(0);
	});

	// REQ-16: Double-click submit → single request (loading state disables button)
	test('double-click on submit sends only one request', async ({ page }) => {
		// Mock API to avoid D1 dependency
		await mockApiLeadsSuccess(page);

		const apiRequests: string[] = [];
		page.on('request', (req) => {
			if (req.url().includes('/api/leads') && req.method() === 'POST') {
				apiRequests.push(req.url());
			}
		});

		const tomorrow = new Date();
		tomorrow.setDate(tomorrow.getDate() + 2);
		const dateStr = tomorrow.toISOString().split('T')[0];

		await page.fill('#lead-name', 'Single Request Test');
		await page.fill('#lead-email', 'single@example.com');
		await page.fill('#phone', '600123456');
		await page.fill('#lead-event-date', dateStr);

		const submitBtn = page.locator('#lead-form form button[type="submit"]');
		// Double-click
		await submitBtn.dblclick();
		await page.waitForTimeout(300);

		// Button gets disabled after first click (isLoading = true), so only 1 request max
		expect(apiRequests.length).toBeLessThanOrEqual(1);
	});
});
