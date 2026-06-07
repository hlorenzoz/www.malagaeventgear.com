import { describe, it, expect } from 'vitest';
import { buildUrlVariantMap, rewriteUrls } from './url-rewriter';

const CDN_BASE = 'https://cdn.malagaeventgear.com';
const WP_BASE = 'https://malagaeventgear.com';

// A canonical media entry for testing
const sampleEntry = {
	wpId: 42,
	r2Key: '42/venue-main.jpg',
	r2Url: `${CDN_BASE}/42/venue-main.jpg`,
	cdnUrl: `${CDN_BASE}/42/venue-main.jpg`,
	originalUrl: `${WP_BASE}/wp-content/uploads/2024/01/venue-main.jpg`,
	category: 'blog',
	tags: [],
	fileName: 'venue-main.jpg',
	title: '',
	alt: '',
	caption: '',
	description: '',
	mimeType: 'image/jpeg',
	fileSize: 50000,
	width: 1200,
	height: 800,
	uploadedOn: '2024-01-15T10:00:00Z',
	uploadedBy: 'Hector Lorenzo',
	excludeFromSitemap: false,
};

describe('buildUrlVariantMap', () => {
	it('maps https no-www original URL', () => {
		const map = buildUrlVariantMap([sampleEntry]);
		expect(map[`${WP_BASE}/wp-content/uploads/2024/01/venue-main.jpg`]).toBe(sampleEntry.r2Url);
	});

	it('maps http no-www variant', () => {
		const map = buildUrlVariantMap([sampleEntry]);
		expect(map[`http://malagaeventgear.com/wp-content/uploads/2024/01/venue-main.jpg`]).toBe(
			sampleEntry.r2Url
		);
	});

	it('maps https www variant', () => {
		const map = buildUrlVariantMap([sampleEntry]);
		expect(map[`https://www.malagaeventgear.com/wp-content/uploads/2024/01/venue-main.jpg`]).toBe(
			sampleEntry.r2Url
		);
	});

	it('maps http www variant', () => {
		const map = buildUrlVariantMap([sampleEntry]);
		expect(map[`http://www.malagaeventgear.com/wp-content/uploads/2024/01/venue-main.jpg`]).toBe(
			sampleEntry.r2Url
		);
	});

	it('maps size-suffixed variants (WP thumbnail naming)', () => {
		const map = buildUrlVariantMap([sampleEntry]);
		expect(map[`${WP_BASE}/wp-content/uploads/2024/01/venue-main-300x200.jpg`]).toBe(
			sampleEntry.r2Url
		);
		expect(map[`${WP_BASE}/wp-content/uploads/2024/01/venue-main-768x512.jpg`]).toBe(
			sampleEntry.r2Url
		);
		expect(map[`${WP_BASE}/wp-content/uploads/2024/01/venue-main-1024x683.jpg`]).toBe(
			sampleEntry.r2Url
		);
	});

	it('builds entries for multiple media items', () => {
		const second = {
			...sampleEntry,
			wpId: 99,
			r2Key: '99/banner.jpg',
			r2Url: `${CDN_BASE}/99/banner.jpg`,
			cdnUrl: `${CDN_BASE}/99/banner.jpg`,
			originalUrl: `${WP_BASE}/wp-content/uploads/2024/02/banner.jpg`,
			fileName: 'banner.jpg',
		};
		const map = buildUrlVariantMap([sampleEntry, second]);
		expect(map[sampleEntry.originalUrl]).toBe(sampleEntry.r2Url);
		expect(map[second.originalUrl]).toBe(second.r2Url);
	});
});

describe('rewriteUrls', () => {
	it('rewrites WP image URL in markdown body', () => {
		const map = buildUrlVariantMap([sampleEntry]);
		const body = `Some text ![alt](${sampleEntry.originalUrl}) more text`;
		const result = rewriteUrls(body, map);
		expect(result).toBe(`Some text ![alt](${sampleEntry.r2Url}) more text`);
	});

	it('rewrites http variant', () => {
		const map = buildUrlVariantMap([sampleEntry]);
		const httpUrl = `http://malagaeventgear.com/wp-content/uploads/2024/01/venue-main.jpg`;
		const body = `![img](${httpUrl})`;
		const result = rewriteUrls(body, map);
		expect(result).toBe(`![img](${sampleEntry.r2Url})`);
	});

	it('rewrites size-suffixed URL', () => {
		const map = buildUrlVariantMap([sampleEntry]);
		const sized = `${WP_BASE}/wp-content/uploads/2024/01/venue-main-300x200.jpg`;
		const result = rewriteUrls(`![img](${sized})`, map);
		expect(result).toBe(`![img](${sampleEntry.r2Url})`);
	});

	it('leaves non-WP URLs unchanged', () => {
		const map = buildUrlVariantMap([sampleEntry]);
		const external = 'https://example.com/some-image.jpg';
		const body = `![img](${external})`;
		const result = rewriteUrls(body, map);
		expect(result).toBe(body);
	});

	it('leaves already-CDN URLs unchanged', () => {
		const map = buildUrlVariantMap([sampleEntry]);
		const cdnUrl = `${CDN_BASE}/42/venue-main.jpg`;
		const body = `![img](${cdnUrl})`;
		const result = rewriteUrls(body, map);
		expect(result).toBe(body);
	});

	it('throws on unmapped WP image URL', () => {
		const map = buildUrlVariantMap([sampleEntry]);
		const unmapped = `${WP_BASE}/wp-content/uploads/2024/01/unknown-photo.jpg`;
		const body = `![img](${unmapped})`;
		expect(() => rewriteUrls(body, map)).toThrow(/unmapped/i);
	});

	it('rewrites multiple WP URLs in the same body', () => {
		const second = {
			...sampleEntry,
			wpId: 99,
			r2Key: '99/banner.jpg',
			r2Url: `${CDN_BASE}/99/banner.jpg`,
			cdnUrl: `${CDN_BASE}/99/banner.jpg`,
			originalUrl: `${WP_BASE}/wp-content/uploads/2024/02/banner.jpg`,
			fileName: 'banner.jpg',
		};
		const map = buildUrlVariantMap([sampleEntry, second]);
		const body = `![a](${sampleEntry.originalUrl}) and ![b](${second.originalUrl})`;
		const result = rewriteUrls(body, map);
		expect(result).toBe(`![a](${sampleEntry.r2Url}) and ![b](${second.r2Url})`);
	});
});
