/**
 * Unit tests for schema.ts utility functions.
 * Covers: buildArticleSchema extensions + buildFAQSchema.
 */
import { describe, it, expect } from 'vitest';
import { buildArticleSchema, buildFAQSchema } from './schema';

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
