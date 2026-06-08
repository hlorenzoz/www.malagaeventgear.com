import { describe, it, expect } from 'vitest';
import { buildUrlVariantMap, rewriteUrls, extractWpUrls, buildOrphanKey, collectOrphanUrls } from './url-rewriter';

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

// ---------------------------------------------------------------------------
// Phase 8.2: extractWpUrls
// ---------------------------------------------------------------------------

describe('extractWpUrls', () => {
	it('extracts a single WP URL from a markdown image', () => {
		const body = `![alt](${WP_BASE}/wp-content/uploads/2024/09/photo.jpeg)`;
		expect(extractWpUrls(body)).toEqual([
			`${WP_BASE}/wp-content/uploads/2024/09/photo.jpeg`,
		]);
	});

	it('extracts a URL from a raw <img src="..."> tag', () => {
		const body = `<img src="${WP_BASE}/wp-content/uploads/2024/01/banner.png" alt="">`;
		expect(extractWpUrls(body)).toEqual([
			`${WP_BASE}/wp-content/uploads/2024/01/banner.png`,
		]);
	});

	it('extracts multiple WP URLs from the same body', () => {
		const url1 = `${WP_BASE}/wp-content/uploads/2024/01/a.jpg`;
		const url2 = `${WP_BASE}/wp-content/uploads/2024/02/b.png`;
		const body = `![a](${url1}) some text ![b](${url2})`;
		const result = extractWpUrls(body);
		expect(result).toHaveLength(2);
		expect(result).toContain(url1);
		expect(result).toContain(url2);
	});

	it('deduplicates repeated occurrences of the same URL', () => {
		const url = `${WP_BASE}/wp-content/uploads/2024/01/venue.jpg`;
		const body = `![a](${url}) and again ![b](${url})`;
		expect(extractWpUrls(body)).toEqual([url]);
	});

	it('ignores non-WP URLs', () => {
		const body = `![a](https://example.com/image.jpg) and ![b](https://cdn.malagaeventgear.com/blog/42/photo.webp)`;
		expect(extractWpUrls(body)).toEqual([]);
	});

	it('extracts https URL', () => {
		const url = `https://malagaeventgear.com/wp-content/uploads/2024/09/Methacrylate-lectern.jpeg`;
		expect(extractWpUrls(`![x](${url})`)).toEqual([url]);
	});

	it('extracts http and www variants', () => {
		const httpUrl = `http://malagaeventgear.com/wp-content/uploads/2024/01/a.jpg`;
		const wwwUrl = `https://www.malagaeventgear.com/wp-content/uploads/2024/01/b.jpg`;
		const body = `${httpUrl} ${wwwUrl}`;
		const result = extractWpUrls(body);
		expect(result).toContain(httpUrl);
		expect(result).toContain(wwwUrl);
	});

	it('returns empty array when body has no WP URLs', () => {
		expect(extractWpUrls('No images here, just plain text.')).toEqual([]);
	});
});

// ---------------------------------------------------------------------------
// Phase 8.2: buildOrphanKey
// ---------------------------------------------------------------------------

describe('buildOrphanKey', () => {
	it('derives key from WP path with converted=true (swaps ext to .webp)', () => {
		const wpUrl = `${WP_BASE}/wp-content/uploads/2024/09/Methacrylate-lectern.jpeg`;
		expect(buildOrphanKey(wpUrl, true)).toBe('blog/orphan/2024/09/Methacrylate-lectern.webp');
	});

	it('derives key from WP path with converted=false (keeps original ext)', () => {
		const wpUrl = `${WP_BASE}/wp-content/uploads/2024/09/Methacrylate-lectern.jpeg`;
		expect(buildOrphanKey(wpUrl, false)).toBe('blog/orphan/2024/09/Methacrylate-lectern.jpeg');
	});

	it('strips /wp-content/uploads/ prefix', () => {
		const wpUrl = `${WP_BASE}/wp-content/uploads/2023/05/some-image.png`;
		expect(buildOrphanKey(wpUrl, false)).toBe('blog/orphan/2023/05/some-image.png');
	});

	it('converts .png to .webp when converted=true', () => {
		const wpUrl = `${WP_BASE}/wp-content/uploads/2024/01/flyer.png`;
		expect(buildOrphanKey(wpUrl, true)).toBe('blog/orphan/2024/01/flyer.webp');
	});

	it('keeps .webp extension unchanged when converted=false', () => {
		const wpUrl = `${WP_BASE}/wp-content/uploads/2024/03/icon.svg`;
		expect(buildOrphanKey(wpUrl, false)).toBe('blog/orphan/2024/03/icon.svg');
	});

	it('works with http scheme', () => {
		const wpUrl = `http://malagaeventgear.com/wp-content/uploads/2024/09/photo.jpg`;
		expect(buildOrphanKey(wpUrl, true)).toBe('blog/orphan/2024/09/photo.webp');
	});

	it('works with www. prefix', () => {
		const wpUrl = `https://www.malagaeventgear.com/wp-content/uploads/2024/11/event.jpg`;
		expect(buildOrphanKey(wpUrl, true)).toBe('blog/orphan/2024/11/event.webp');
	});

	it('handles filenames with dots before the extension', () => {
		const wpUrl = `${WP_BASE}/wp-content/uploads/2024/01/my.photo.v2.jpg`;
		expect(buildOrphanKey(wpUrl, true)).toBe('blog/orphan/2024/01/my.photo.v2.webp');
	});
});

// ---------------------------------------------------------------------------
// Phase 8.2: collectOrphanUrls
// ---------------------------------------------------------------------------

describe('collectOrphanUrls', () => {
	it('returns empty set when all body URLs are mapped', () => {
		const map = buildUrlVariantMap([sampleEntry]);
		const bodies = [`![a](${sampleEntry.originalUrl})`];
		expect(collectOrphanUrls(bodies, map).size).toBe(0);
	});

	it('returns a URL that is present in the body but absent from the map', () => {
		const map = buildUrlVariantMap([sampleEntry]);
		const orphanUrl = `${WP_BASE}/wp-content/uploads/2024/09/Methacrylate-lectern.jpeg`;
		const bodies = [`![x](${orphanUrl})`];
		const result = collectOrphanUrls(bodies, map);
		expect(result.size).toBe(1);
		expect(result.has(orphanUrl)).toBe(true);
	});

	it('deduplicates the same orphan URL appearing in multiple posts', () => {
		const map = buildUrlVariantMap([]);
		const orphanUrl = `${WP_BASE}/wp-content/uploads/2024/09/Methacrylate-lectern.jpeg`;
		const bodies = [`![a](${orphanUrl})`, `![b](${orphanUrl})`];
		const result = collectOrphanUrls(bodies, map);
		expect(result.size).toBe(1);
	});

	it('collects multiple distinct orphan URLs from multiple bodies', () => {
		const map = buildUrlVariantMap([sampleEntry]);
		const orphan1 = `${WP_BASE}/wp-content/uploads/2024/09/orphan-a.jpg`;
		const orphan2 = `${WP_BASE}/wp-content/uploads/2024/10/orphan-b.png`;
		const bodies = [
			`![a](${sampleEntry.originalUrl}) ![x](${orphan1})`,
			`![y](${orphan2})`,
		];
		const result = collectOrphanUrls(bodies, map);
		expect(result.size).toBe(2);
		expect(result.has(orphan1)).toBe(true);
		expect(result.has(orphan2)).toBe(true);
	});

	it('returns empty set when bodies contain no WP URLs at all', () => {
		const map = buildUrlVariantMap([sampleEntry]);
		const bodies = ['Just text, no images.', '## Another post'];
		expect(collectOrphanUrls(bodies, map).size).toBe(0);
	});
});
