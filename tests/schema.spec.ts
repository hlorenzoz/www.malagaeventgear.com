import { test, expect } from '@playwright/test';

test.describe('Structured Data (Schema.org) E2E Validation Tests', () => {
	
	// Helper para extraer y parsear todos los JSON-LD de la página activa
	async function getJsonLdSchemas(page: any): Promise<any[]> {
		const scripts = await page.locator('script[type="application/ld+json"]').all();
		const schemas = [];
		for (const script of scripts) {
			const text = await script.textContent();
			if (text) {
				try {
					schemas.push(JSON.parse(text));
				} catch (e) {
					console.error('Error parseando JSON-LD:', e);
				}
			}
		}
		return schemas;
	}

	test('should inject global LocalBusiness and BreadcrumbList schemas on Home page', async ({ page }) => {
		await page.goto('/');
		await page.waitForLoadState('networkidle');

		const schemas = await getJsonLdSchemas(page);
		expect(schemas.length).toBeGreaterThanOrEqual(2);

		// Buscar esquema ProfessionalService
		const localBusiness = schemas.find(s => s['@type'] === 'ProfessionalService');
		expect(localBusiness).toBeDefined();
		expect(localBusiness.name).toBe('Malaga Event Gear');
		expect(localBusiness.url).toBe('https://malagaeventgear.com');
		expect(localBusiness.telephone).toBe('+34 600 42 87 50');
		expect(localBusiness.address.postalCode).toBe('29009');
		expect(localBusiness.geo.latitude).toBe(36.7243);

		// Buscar esquema BreadcrumbList
		const breadcrumbs = schemas.find(s => s['@type'] === 'BreadcrumbList');
		expect(breadcrumbs).toBeDefined();
		expect(breadcrumbs.itemListElement.length).toBe(1); // Solo la Home
		expect(breadcrumbs.itemListElement[0].name).toBe('Home');
		expect(breadcrumbs.itemListElement[0].item).toBe('https://malagaeventgear.com/');
	});

	test('should inject dynamic BreadcrumbList and specific Service schema on individual package pages', async ({ page }) => {
		await page.goto('/packages/wedding/');
		await page.waitForLoadState('networkidle');

		const schemas = await getJsonLdSchemas(page);
		
		// Deben estar los 2 globales (layout) + el local (Service de la página)
		expect(schemas.length).toBeGreaterThanOrEqual(3);

		// Verificar BreadcrumbList dinámico
		const breadcrumbs = schemas.find(s => s['@type'] === 'BreadcrumbList');
		expect(breadcrumbs).toBeDefined();
		expect(breadcrumbs.itemListElement.length).toBe(3); // Home -> Packages -> Wedding
		expect(breadcrumbs.itemListElement[1].name).toBe('Packages');
		expect(breadcrumbs.itemListElement[1].item).toBe('https://malagaeventgear.com/packages/');
		expect(breadcrumbs.itemListElement[2].name).toBe('Wedding');
		expect(breadcrumbs.itemListElement[2].item).toBe('https://malagaeventgear.com/packages/wedding/');

		// Verificar esquema Service local
		const service = schemas.find(s => s['@type'] === 'Service');
		expect(service).toBeDefined();
		expect(service.name).toBe('Wedding Pack');
		expect(service.provider.name).toBe('Malaga Event Gear');
		expect(service.offers.price).toBe('650.00');
		expect(service.offers.priceCurrency).toBe('EUR');
	});

	test('should inject ItemList schema on packages catalog page', async ({ page }) => {
		await page.goto('/packages/');
		await page.waitForLoadState('networkidle');

		const schemas = await getJsonLdSchemas(page);
		expect(schemas.length).toBeGreaterThanOrEqual(3);

		// Buscar ItemList
		const itemList = schemas.find(s => s['@type'] === 'ItemList');
		expect(itemList).toBeDefined();
		expect(itemList.name).toBe('Audiovisual Rental Packages - Malaga Event Gear');
		expect(itemList.itemListElement.length).toBe(5); // 5 paquetes
		expect(itemList.itemListElement[0].name).toBe('Eco Pack');
		expect(itemList.itemListElement[0].url).toBe('https://malagaeventgear.com/packages/eco/');
	});

	test('should inject ItemList schema on services catalog page', async ({ page }) => {
		await page.goto('/services/');
		await page.waitForLoadState('networkidle');

		const schemas = await getJsonLdSchemas(page);
		expect(schemas.length).toBeGreaterThanOrEqual(3);

		// Buscar ItemList
		const itemList = schemas.find(s => s['@type'] === 'ItemList');
		expect(itemList).toBeDefined();
		expect(itemList.name).toContain('Audiovisual Equipment Rental Catalog');
		expect(itemList.itemListElement.length).toBe(4); // 4 categorías
	});

	test('should inject FAQPage schema on faq page', async ({ page }) => {
		await page.goto('/faq/');
		await page.waitForLoadState('networkidle');

		const schemas = await getJsonLdSchemas(page);
		expect(schemas.length).toBeGreaterThanOrEqual(3);

		// Buscar FAQPage
		const faqPage = schemas.find(s => s['@type'] === 'FAQPage');
		expect(faqPage).toBeDefined();
		expect(faqPage.mainEntity.length).toBeGreaterThan(0);
	});
});
