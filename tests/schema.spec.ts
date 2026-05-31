import { test, expect } from '@playwright/test';

test.describe('Structured Data (Schema.org) E2E Validation Tests', () => {
	
	// Helper para extraer y parsear todos los JSON-LD de la página activa
	async function getJsonLdSchemas(page: any): Promise<any[]> {
		// Esperar de forma selectiva a que al menos un script JSON-LD esté inyectado en el DOM
		await page.locator('script[type="application/ld+json"]').first().waitFor({ state: 'attached', timeout: 5000 }).catch(() => {});
		
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

	// Iterar de forma dinámica sobre todos los paquetes individuales del catálogo para asegurar cero regresiones de precios
	const packageSlugs = ['eco', 'wedding', 'product-presentation', 'basic-mice', 'mice'];
	for (const slug of packageSlugs) {
		test(`should inject dynamic BreadcrumbList and specific Service schema on package page: ${slug}`, async ({ page }) => {
			await page.goto(`/packages/${slug}/`);

			const schemas = await getJsonLdSchemas(page);
			
			// Deben estar los 2 globales (layout) + el local (Service de la página)
			expect(schemas.length).toBeGreaterThanOrEqual(3);

			// Verificar BreadcrumbList dinámico
			const breadcrumbs = schemas.find(s => s['@type'] === 'BreadcrumbList');
			expect(breadcrumbs).toBeDefined();
			expect(breadcrumbs.itemListElement.length).toBe(3); // Home -> Packages -> [Slug]
			expect(breadcrumbs.itemListElement[1].name).toBe('Packages');
			expect(breadcrumbs.itemListElement[1].item).toBe('https://malagaeventgear.com/packages/');
			expect(breadcrumbs.itemListElement[2].item).toContain(`/packages/${slug}/`);

			// Verificar esquema Service local
			const service = schemas.find(s => s['@type'] === 'Service');
			expect(service).toBeDefined();
			expect(service.provider.name).toBe('Malaga Event Gear');
			expect(service.offers).toBeDefined();
			expect(parseFloat(service.offers.price)).toBeGreaterThan(0);
			expect(service.offers.priceCurrency).toBe('EUR');
		});
	}

	test('should inject ItemList and FAQPage schemas on packages catalog page', async ({ page }) => {
		await page.goto('/packages/');

		const schemas = await getJsonLdSchemas(page);
		expect(schemas.length).toBeGreaterThanOrEqual(4); // ProfessionalService, Breadcrumbs, ItemList, FAQPage

		// 1. Buscar y verificar ItemList de catálogo
		const itemList = schemas.find(s => s['@type'] === 'ItemList');
		expect(itemList).toBeDefined();
		expect(itemList.name).toBe('Audiovisual Rental Packages - Malaga Event Gear');
		expect(itemList.itemListElement.length).toBe(5); // Los 5 paquetes principales
		expect(itemList.itemListElement[0].name).toBe('Eco Pack');
		expect(itemList.itemListElement[0].url).toBe('https://malagaeventgear.com/packages/eco/');

		// 2. Buscar y verificar FAQPage de IVA
		const faqPage = schemas.find(s => s['@type'] === 'FAQPage');
		expect(faqPage).toBeDefined();
		expect(faqPage.mainEntity.length).toBe(1);
		
		// Validar que contiene la duda sobre el IVA en inglés (idioma por defecto de la ruta canónica)
		const vatQuestion = faqPage.mainEntity[0];
		expect(vatQuestion.name).toBe('Are your package prices inclusive of VAT?');
		expect(vatQuestion.acceptedAnswer.text).toContain('No, the listed prices do not include VAT');
	});

	test('should inject ItemList schema on equipment catalog page', async ({ page }) => {
		await page.goto('/equipment/');

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

		const schemas = await getJsonLdSchemas(page);
		expect(schemas.length).toBeGreaterThanOrEqual(3);

		// Buscar FAQPage
		const faqPage = schemas.find(s => s['@type'] === 'FAQPage');
		expect(faqPage).toBeDefined();
		expect(faqPage.mainEntity.length).toBeGreaterThan(0);
	});

	test('should inject ContactPage and FAQPage schemas on contact page', async ({ page }) => {
		await page.goto('/contact/');

		const schemas = await getJsonLdSchemas(page);
		expect(schemas.length).toBeGreaterThanOrEqual(4); // ProfessionalService, Breadcrumbs, ContactPage, FAQPage

		// 1. ContactPage schema (page-level)
		const contactPage = schemas.find(s => s['@type'] === 'ContactPage');
		expect(contactPage).toBeDefined();
		expect(contactPage.url).toBe('https://www.malagaeventgear.com/contact');

		// 2. FAQPage schema, sourced from the centralized FAQ store (inquiry-oriented set)
		const faqPage = schemas.find(s => s['@type'] === 'FAQPage');
		expect(faqPage).toBeDefined();
		expect(faqPage.mainEntity.length).toBe(6); // service-areas, booking-process, language-hours, contact-info, notice-time, minimum-order-granada

		// Validar que las preguntas y respuestas se inyectan en inglés (idioma canónico de la ruta)
		const questions = faqPage.mainEntity.map((q: any) => q.name);
		expect(questions).toContain('How can customers contact Malaga Event Gear (MEG), and what information should they provide?');
		expect(questions).toContain('How does the booking process work with Malaga Event Gear?');
		faqPage.mainEntity.forEach((q: any) => {
			expect(q['@type']).toBe('Question');
			expect(q.acceptedAnswer.text.length).toBeGreaterThan(0);
		});
	});

	test('should 301 redirect legacy /contact-us/ to /contact/', async ({ page }) => {
		await page.goto('/contact-us/');

		// Playwright follows the 301; the final URL must be the canonical /contact/
		expect(page.url()).toMatch(/\/contact\/$/);

		// The destination must still expose its page-level structured data
		const schemas = await getJsonLdSchemas(page);
		expect(schemas.find(s => s['@type'] === 'ContactPage')).toBeDefined();
		expect(schemas.find(s => s['@type'] === 'FAQPage')).toBeDefined();
	});

	test('should inject BreadcrumbList on corporate and team pages', async ({ page }) => {
		const corporateRoutes = ['/about-us/', '/meet-the-team/', '/contact/'];
		for (const route of corporateRoutes) {
			await page.goto(route);

			const schemas = await getJsonLdSchemas(page);
			const breadcrumbs = schemas.find(s => s['@type'] === 'BreadcrumbList');
			expect(breadcrumbs, `Missing BreadcrumbList schema on route: ${route}`).toBeDefined();
			expect(breadcrumbs.itemListElement.length).toBeGreaterThanOrEqual(2);
			expect(breadcrumbs.itemListElement[0].name).toBe('Home');
		}
	});

	test('should inject BreadcrumbList on legal policy pages', async ({ page }) => {
		const legalRoutes = [
			'/privacy-policy/',
			'/terms-of-service/',
			'/cookie-policy/',
			'/gdpr/',
			'/sitemap/'
		];
		for (const route of legalRoutes) {
			await page.goto(route);

			const schemas = await getJsonLdSchemas(page);
			const breadcrumbs = schemas.find(s => s['@type'] === 'BreadcrumbList');
			expect(breadcrumbs, `Missing BreadcrumbList schema on route: ${route}`).toBeDefined();
			expect(breadcrumbs.itemListElement.length).toBeGreaterThanOrEqual(2);
			expect(breadcrumbs.itemListElement[0].name).toBe('Home');
		}
	});

	test('should inject BreadcrumbList on blog page', async ({ page }) => {
		await page.goto('/blog/');

		const schemas = await getJsonLdSchemas(page);
		const breadcrumbs = schemas.find(s => s['@type'] === 'BreadcrumbList');
		expect(breadcrumbs).toBeDefined();
		expect(breadcrumbs.itemListElement.length).toBe(2);
		expect(breadcrumbs.itemListElement[1].name).toBe('Blog');
		expect(breadcrumbs.itemListElement[1].item).toBe('https://malagaeventgear.com/blog/');
	});
});
