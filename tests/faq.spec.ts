import { test, expect, type Page, type Locator } from '@playwright/test';

const TOTAL_FAQS = 19;
const SERVICES_FAQS = 9;
const CONTACT_FAQS = 1;
const HOMEPAGE_FAQS = 5;

// Exact-name filter buttons (avoid colliding with accordion questions that
// happen to contain the same words, e.g. "...customers contact MEG").
const filterButton = (page: Page, en: string, es: string): Locator =>
	page.getByRole('button', { name: en, exact: true }).or(page.getByRole('button', { name: es, exact: true }));

// Scroll each reveal item into view so the IntersectionObserver triggers, then
// assert it animates to full opacity (regression guard for the reveal bug where
// re-rendered items stayed stuck invisible).
async function expectAllRevealed(faqs: Locator) {
	const count = await faqs.count();
	for (let i = 0; i < count; i++) {
		const item = faqs.nth(i);
		await item.scrollIntoViewIfNeeded();
		await expect(item).toBeVisible();
		await expect(item).toHaveCSS('opacity', '1');
	}
}

// Read every JSON-LD block and return the parsed FAQPage schema (or null).
async function getFaqPageSchema(page: Page): Promise<{ mainEntity: unknown[] } | null> {
	const blocks = await page.locator('script[type="application/ld+json"]').allTextContents();
	for (const raw of blocks) {
		try {
			const parsed = JSON.parse(raw);
			const candidates = Array.isArray(parsed) ? parsed : [parsed];
			const faqPage = candidates.find((c) => c?.['@type'] === 'FAQPage');
			if (faqPage) return faqPage;
		} catch {
			// ignore non-JSON blocks
		}
	}
	return null;
}

test.describe('FAQ Filter Verification', () => {
	test.beforeEach(async ({ page }) => {
		await page.goto('/faq/');
		await page.waitForLoadState('networkidle');
	});

	test(`should display all ${TOTAL_FAQS} FAQs initially and keep them visible`, async ({ page }) => {
		const faqs = page.locator('.glass-panel.reveal');
		await expect(faqs).toHaveCount(TOTAL_FAQS);
		await expectAllRevealed(faqs);
	});

	test('should correctly filter FAQs when selecting categories and maintain visibility', async ({ page }) => {
		await filterButton(page, 'Services & Gear', 'Servicios y Equipos').click();
		// Svelte transition slide is 250ms
		await page.waitForTimeout(300);

		const faqs = page.locator('.glass-panel.reveal');
		await expect(faqs).toHaveCount(SERVICES_FAQS);
		await expectAllRevealed(faqs);
	});

	test('should filter to the new Contact category', async ({ page }) => {
		await filterButton(page, 'Contact', 'Contacto').click();
		await page.waitForTimeout(300);

		const faqs = page.locator('.glass-panel.reveal');
		await expect(faqs).toHaveCount(CONTACT_FAQS);
		await expectAllRevealed(faqs);
	});

	test(`should restore all ${TOTAL_FAQS} visible FAQs when clicking back to "All Questions" / "Todas"`, async ({ page }) => {
		await filterButton(page, 'Services & Gear', 'Servicios y Equipos').click();
		await page.waitForTimeout(300);
		await expect(page.locator('.glass-panel.reveal')).toHaveCount(SERVICES_FAQS);

		await filterButton(page, 'All Questions', 'Todas').click();
		await page.waitForTimeout(300);

		const faqsRestored = page.locator('.glass-panel.reveal');
		await expect(faqsRestored).toHaveCount(TOTAL_FAQS);
		// CRITICAL: Svelte re-created items must reveal to opacity 1, not stay stuck invisible.
		await expectAllRevealed(faqsRestored);
	});
});

test.describe('FAQ structured data (JSON-LD FAQPage)', () => {
	test(`/faq schema mainEntity must cover all ${TOTAL_FAQS} questions`, async ({ page }) => {
		await page.goto('/faq/');
		await page.waitForLoadState('networkidle');

		const schema = await getFaqPageSchema(page);
		expect(schema, 'FAQPage schema must be present on /faq').not.toBeNull();
		expect(schema!.mainEntity).toHaveLength(TOTAL_FAQS);
	});

	test(`homepage schema mainEntity must cover the ${HOMEPAGE_FAQS} teaser questions`, async ({ page }) => {
		await page.goto('/');
		await page.waitForLoadState('networkidle');

		const schema = await getFaqPageSchema(page);
		expect(schema, 'FAQPage schema must be present on the homepage').not.toBeNull();
		expect(schema!.mainEntity).toHaveLength(HOMEPAGE_FAQS);
	});

	test('homepage FAQ section links to the full /faq page', async ({ page }) => {
		await page.goto('/');
		await page.waitForLoadState('networkidle');

		const faqLink = page.locator('a[href="/faq/"]', {
			hasText: /See all FAQs|Ver todas las preguntas frecuentes/
		});
		await faqLink.scrollIntoViewIfNeeded();
		await expect(faqLink).toBeVisible();
		await faqLink.click();
		await expect(page).toHaveURL(/\/faq\/?$/);
	});
});
