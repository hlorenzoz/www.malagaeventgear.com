/**
 * Unit tests for schema.ts utility functions.
 * Covers: buildArticleSchema extensions + buildFAQSchema.
 */
import { describe, it, expect } from 'vitest';
import { buildArticleSchema, buildFAQSchema, buildServiceSchema, buildServiceListSchema } from './schema';
import { siteConfig } from '../data/site';

const basePost = {
	title: 'Test Article',
	description: 'A test description for the article.',
	datePublished: '2026-01-15',
	authorName: 'Hector Luis Lorenzo',
	url: '/blog/test-article/',
};

describe('buildArticleSchema', () => {
	it('defaults to BlogPosting when no type given', () => {
		const schema = buildArticleSchema(basePost);
		expect(schema['@type']).toBe('BlogPosting');
	});

	it('emits NewsArticle when type=NewsArticle', () => {
		const schema = buildArticleSchema({ ...basePost, type: 'NewsArticle' });
		expect(schema['@type']).toBe('NewsArticle');
	});

	it('emits BlogPosting when type=BlogPosting explicitly', () => {
		const schema = buildArticleSchema({ ...basePost, type: 'BlogPosting' });
		expect(schema['@type']).toBe('BlogPosting');
	});

	it('includes inLanguage = en', () => {
		const schema = buildArticleSchema(basePost);
		expect(schema['inLanguage']).toBe('en');
	});

	it('includes articleSection when provided', () => {
		const schema = buildArticleSchema({ ...basePost, articleSection: 'Corporate & Enterprise' });
		expect(schema['articleSection']).toBe('Corporate & Enterprise');
	});

	it('does not include articleSection when omitted', () => {
		const schema = buildArticleSchema(basePost);
		expect(schema).not.toHaveProperty('articleSection');
	});

	it('includes keywords as joined string when provided', () => {
		const schema = buildArticleSchema({ ...basePost, keywords: ['AV', 'Malaga', 'rental'] });
		expect(schema['keywords']).toBe('AV, Malaga, rental');
	});

	it('does not include keywords when array is empty', () => {
		const schema = buildArticleSchema({ ...basePost, keywords: [] });
		expect(schema).not.toHaveProperty('keywords');
	});

	it('emits image as ImageObject with url, width, height when dims provided', () => {
		const schema = buildArticleSchema({
			...basePost,
			imageUrl: 'https://cdn.example.com/image.webp',
			imageWidth: 1200,
			imageHeight: 630,
		});
		expect(schema['image']).toMatchObject({
			'@type': 'ImageObject',
			url: 'https://cdn.example.com/image.webp',
			width: 1200,
			height: 630,
		});
	});

	it('emits image as ImageObject without dims when dims not provided', () => {
		const schema = buildArticleSchema({
			...basePost,
			imageUrl: 'https://cdn.example.com/image.webp',
		});
		expect(schema['image']).toMatchObject({
			'@type': 'ImageObject',
			url: 'https://cdn.example.com/image.webp',
		});
		expect(schema['image']).not.toHaveProperty('width');
		expect(schema['image']).not.toHaveProperty('height');
	});

	it('keeps existing required fields: headline, description, datePublished, dateModified, author, publisher, mainEntityOfPage', () => {
		const schema = buildArticleSchema({
			...basePost,
			dateModified: '2026-01-20',
		});
		expect(schema['headline']).toBe('Test Article');
		expect(schema['description']).toBe('A test description for the article.');
		expect(schema['datePublished']).toBe('2026-01-15');
		expect(schema['dateModified']).toBe('2026-01-20');
		expect(schema['author']).toMatchObject({ '@type': 'Person', name: 'Hector Luis Lorenzo' });
		expect(schema['publisher']).toMatchObject({ '@type': 'Organization' });
		expect(schema['mainEntityOfPage']).toMatchObject({ '@type': 'WebPage' });
	});
});

describe('buildFAQSchema', () => {
	it('returns a valid FAQPage schema shape', () => {
		const faqs = [
			{ question: 'What is AV?', answer: 'Audio Visual technology.' },
			{ question: 'How much?', answer: 'Prices vary.' },
		];
		const schema = buildFAQSchema(faqs);
		expect(schema['@context']).toBe('https://schema.org');
		expect(schema['@type']).toBe('FAQPage');
		expect(schema['mainEntity']).toHaveLength(2);
	});

	it('each mainEntity item has correct shape', () => {
		const faqs = [{ question: 'Test Q?', answer: 'Test A.' }];
		const schema = buildFAQSchema(faqs);
		const item = schema['mainEntity'][0];
		expect(item['@type']).toBe('Question');
		expect(item['name']).toBe('Test Q?');
		expect(item['acceptedAnswer']).toMatchObject({
			'@type': 'Answer',
			text: 'Test A.',
		});
	});

	it('handles empty FAQ array', () => {
		const schema = buildFAQSchema([]);
		expect(schema['mainEntity']).toHaveLength(0);
	});
});

describe('buildServiceSchema', () => {
	const baseService = {
		name: 'Wedding Audiovisual Pack',
		description: 'Sound, lighting and screen rental for weddings in Malaga.',
		price: 499,
		url: '/packages/wedding/',
	};

	it('references the canonical organization node by @id instead of redefining it', () => {
		const schema = buildServiceSchema(baseService);
		// The provider must be a pure @id reference — NOT a partial ProfessionalService.
		// A partial node makes Google detect a second, incomplete "Local Business".
		expect(schema['provider']).toEqual({ '@id': `${siteConfig.url}/#organization` });
	});

	it('does not redeclare provider @type or duplicate business fields', () => {
		const schema = buildServiceSchema(baseService);
		expect(schema['provider']).not.toHaveProperty('@type');
		expect(schema['provider']).not.toHaveProperty('name');
		expect(schema['provider']).not.toHaveProperty('url');
	});

	it('keeps the Service core: name, offers with price/currency', () => {
		const schema = buildServiceSchema(baseService);
		expect(schema['@type']).toBe('Service');
		expect(schema['name']).toBe(baseService.name);
		expect(schema['offers']['price']).toBe('499.00');
		expect(schema['offers']['priceCurrency']).toBe('EUR');
	});
});

describe('buildServiceListSchema', () => {
	const services = [
		{ name: 'Eco Pack', description: 'Basic.', price: 290, url: '/packages/eco/', serviceType: 'Party Rental', image: '/images/packages/eco.webp' },
		{ name: 'Wedding Pack', description: 'Premium.', price: 499, url: '/packages/wedding/' },
	];

	it('returns an ItemList with one ListItem per service', () => {
		const schema = buildServiceListSchema(services, 'Packages');
		expect(schema['@type']).toBe('ItemList');
		expect(schema['itemListElement']).toHaveLength(2);
	});

	it('wraps each service as a positioned ListItem with a Service item', () => {
		const schema = buildServiceListSchema(services, 'Packages');
		const first = schema['itemListElement'][0];
		expect(first['@type']).toBe('ListItem');
		expect(first['position']).toBe(1);
		expect(first['item']['@type']).toBe('Service');
	});

	it('reuses the same @id as the per-package page (.../#service)', () => {
		const schema = buildServiceListSchema(services, 'Packages');
		expect(schema['itemListElement'][0]['item']['@id']).toBe(`${siteConfig.url}/packages/eco/#service`);
	});

	it('references the canonical organization as provider by @id', () => {
		const schema = buildServiceListSchema(services, 'Packages');
		expect(schema['itemListElement'][0]['item']['provider']).toEqual({ '@id': `${siteConfig.url}/#organization` });
	});

	it('emits an Offer with formatted price and EUR currency', () => {
		const schema = buildServiceListSchema(services, 'Packages');
		const offer = schema['itemListElement'][0]['item']['offers'];
		expect(offer['@type']).toBe('Offer');
		expect(offer['price']).toBe('290.00');
		expect(offer['priceCurrency']).toBe('EUR');
	});

	it('includes an absolute image URL when image is provided, omits it otherwise', () => {
		const schema = buildServiceListSchema(services, 'Packages');
		expect(schema['itemListElement'][0]['item']['image']).toBe(`${siteConfig.url}/images/packages/eco.webp`);
		expect(schema['itemListElement'][1]['item']).not.toHaveProperty('image');
	});
});
