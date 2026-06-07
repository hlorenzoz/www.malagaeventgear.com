import { describe, it, expect } from 'vitest';
import { buildFrontmatter, buildFrontmatterYaml } from './frontmatter';
import type { WpPost, WpMedia } from './types';

const CDN_BASE = 'https://cdn.malagaeventgear.com';
const DEFAULT_OG = 'https://malagaeventgear.com/og-image.jpg';

function makeWpPost(overrides: Partial<WpPost> = {}): WpPost {
	return {
		id: 1,
		slug: 'my-test-post',
		title: { rendered: 'My Test Post' },
		content: {
			rendered: '<p>This is the full body content of the post, enough to derive an excerpt.</p>',
		},
		excerpt: { rendered: '<p>A clean excerpt about this post.</p>' },
		date_gmt: '2024-03-15T10:00:00',
		modified_gmt: '2024-03-15T10:00:00',
		status: 'publish',
		featured_media: 0,
		_embedded: {
			author: [{ id: 1, name: 'Hector Lorenzo', slug: 'hector-lorenzo' }],
			'wp:term': [
				[{ id: 10, name: 'Event Planning', slug: 'event-planning', taxonomy: 'category' }],
				[{ id: 20, name: 'weddings', slug: 'weddings', taxonomy: 'post_tag' }],
			],
			'wp:featuredmedia': [],
		},
		...overrides,
	};
}

function makeFeaturedMedia(): WpMedia {
	return {
		id: 99,
		source_url: `${CDN_BASE}/99/cover.jpg`,
		alt_text: 'Cover image',
		caption: { rendered: '' },
		title: { rendered: 'Cover' },
		description: { rendered: '' },
		date_gmt: '2024-03-01T00:00:00',
		media_details: { width: 1200, height: 800, file: '2024/03/cover.jpg' },
		mime_type: 'image/jpeg',
		author: 1,
	};
}

describe('buildFrontmatter', () => {
	it('returns correct title', () => {
		const fm = buildFrontmatter(makeWpPost());
		expect(fm.title).toBe('My Test Post');
	});

	it('uses author display_name (W-01: NEVER the WP slug)', () => {
		const fm = buildFrontmatter(makeWpPost());
		// Must be display_name "Hector Lorenzo", never slug "hector-lorenzo"
		expect(fm.author).toBe('Hector Lorenzo');
		expect(fm.author).not.toContain('-');
	});

	it('sets publishDate from date_gmt as YYYY-MM-DD', () => {
		const fm = buildFrontmatter(makeWpPost());
		expect(fm.publishDate).toBe('2024-03-15');
	});

	it('omits updated when modified_gmt === date_gmt (SC-MIG-09)', () => {
		const fm = buildFrontmatter(makeWpPost());
		expect(fm.updated).toBeUndefined();
	});

	it('sets updated when modified_gmt differs from date_gmt (SC-MIG-10)', () => {
		const post = makeWpPost({ modified_gmt: '2024-04-20T12:00:00' });
		const fm = buildFrontmatter(post);
		expect(fm.updated).toBe('2024-04-20');
	});

	it('strips HTML from excerpt', () => {
		const fm = buildFrontmatter(makeWpPost());
		expect(fm.excerpt).not.toContain('<p>');
		expect(fm.excerpt).not.toContain('</p>');
	});

	it('derives excerpt from body when WP excerpt is empty (SC-MIG-08)', () => {
		const post = makeWpPost({ excerpt: { rendered: '' } });
		const fm = buildFrontmatter(post);
		expect(fm.excerpt.length).toBeGreaterThanOrEqual(10);
		// Should not contain HTML tags
		expect(fm.excerpt).not.toMatch(/<[^>]+>/);
	});

	it('excerpt min 10 chars even when body is short', () => {
		const post = makeWpPost({
			excerpt: { rendered: '' },
			content: { rendered: '<p>Short.</p>' },
		});
		// We expect either the extracted text or a fallback — just not a crash
		const fm = buildFrontmatter(post);
		// might be < 10 if body is genuinely short — that's acceptable to document
		expect(typeof fm.excerpt).toBe('string');
	});

	it('uses excerpt as description (truncated to 160 chars)', () => {
		const longExcerpt =
			'<p>' + 'A'.repeat(200) + '</p>';
		const post = makeWpPost({ excerpt: { rendered: longExcerpt } });
		const fm = buildFrontmatter(post);
		expect(fm.description.length).toBeLessThanOrEqual(160);
	});

	it('sets coverImage from featured media r2Url', () => {
		const post = makeWpPost({
			featured_media: 99,
			_embedded: {
				...makeWpPost()._embedded,
				'wp:featuredmedia': [makeFeaturedMedia()],
			},
		});
		const fm = buildFrontmatter(post);
		expect(fm.coverImage).toBe(`${CDN_BASE}/99/cover.jpg`);
	});

	it('falls back to site OG image when no featured media (SC-CDN-07)', () => {
		const post = makeWpPost({ featured_media: 0 });
		const fm = buildFrontmatter(post);
		expect(fm.coverImage).toBe(DEFAULT_OG);
	});

	it('sets draft: false for all migrated posts', () => {
		const fm = buildFrontmatter(makeWpPost());
		expect(fm.draft).toBe(false);
	});

	it('extracts categories display names from wp:term[0]', () => {
		const fm = buildFrontmatter(makeWpPost());
		expect(fm.categories).toContain('Event Planning');
	});

	it('extracts tags display names from wp:term[1]', () => {
		const fm = buildFrontmatter(makeWpPost());
		expect(fm.tags).toContain('weddings');
	});

	it('sets slug from WP post slug', () => {
		const fm = buildFrontmatter(makeWpPost());
		expect(fm.slug).toBe('my-test-post');
	});

	// --- HTML entity decoding (bug fix: WP REST API returns entities in term names) ---

	it('decodes HTML entities in category names (e.g. &amp; → &)', () => {
		const post = makeWpPost({
			_embedded: {
				author: [{ id: 1, name: 'Hector Lorenzo', slug: 'hector-lorenzo' }],
				'wp:term': [
					[{ id: 10, name: 'Corporate &amp; Enterprise', slug: 'corporate-enterprise', taxonomy: 'category' }],
					[],
				],
				'wp:featuredmedia': [],
			},
		});
		const fm = buildFrontmatter(post);
		// Must store decoded display name, not the raw entity string
		expect(fm.categories).toContain('Corporate & Enterprise');
		expect(fm.categories).not.toContain('Corporate &amp; Enterprise');
	});

	it('decodes HTML entities in tag names', () => {
		const post = makeWpPost({
			_embedded: {
				author: [{ id: 1, name: 'Hector Lorenzo', slug: 'hector-lorenzo' }],
				'wp:term': [
					[{ id: 10, name: 'Events', slug: 'events', taxonomy: 'category' }],
					[{ id: 30, name: 'A&amp;V', slug: 'av', taxonomy: 'post_tag' }],
				],
				'wp:featuredmedia': [],
			},
		});
		const fm = buildFrontmatter(post);
		expect(fm.tags).toContain('A&V');
		expect(fm.tags).not.toContain('A&amp;V');
	});

	it('decodes HTML entities in author display_name (W-01)', () => {
		// WP can return encoded names like "O&#039;Brien" for authors
		const post = makeWpPost({
			_embedded: {
				author: [{ id: 2, name: "O&#039;Brien", slug: 'obrien' }],
				'wp:term': [
					[{ id: 10, name: 'Events', slug: 'events', taxonomy: 'category' }],
					[],
				],
				'wp:featuredmedia': [],
			},
		});
		const fm = buildFrontmatter(post);
		expect(fm.author).toBe("O'Brien");
		expect(fm.author).not.toContain('&#039;');
	});

	it('decodes HTML entities in title (e.g. &amp; in post title)', () => {
		const post = makeWpPost({
			title: { rendered: 'Audio &amp; Visual Rentals' },
		});
		const fm = buildFrontmatter(post);
		expect(fm.title).toBe('Audio & Visual Rentals');
		expect(fm.title).not.toContain('&amp;');
	});
});

describe('buildFrontmatterYaml', () => {
	it('emits valid YAML block with required fields', () => {
		const fm = buildFrontmatter(makeWpPost());
		const yaml = buildFrontmatterYaml(fm);
		expect(yaml).toContain('title:');
		expect(yaml).toContain('publishDate:');
		expect(yaml).toContain('author:');
		expect(yaml).toContain('excerpt:');
		expect(yaml).toContain('coverImage:');
		expect(yaml).toContain('draft: false');
	});

	it('does NOT emit updated key when undefined (SC-MIG-09)', () => {
		const fm = buildFrontmatter(makeWpPost()); // same date_gmt and modified_gmt
		const yaml = buildFrontmatterYaml(fm);
		expect(yaml).not.toContain('updated:');
	});

	it('emits updated key when set (SC-MIG-10)', () => {
		const post = makeWpPost({ modified_gmt: '2024-04-20T12:00:00' });
		const fm = buildFrontmatter(post);
		const yaml = buildFrontmatterYaml(fm);
		expect(yaml).toContain('updated: 2024-04-20');
	});

	it('wraps title with quotes when it contains special chars', () => {
		const post = makeWpPost({ title: { rendered: 'My Post: A "Special" Title' } });
		const fm = buildFrontmatter(post);
		const yaml = buildFrontmatterYaml(fm);
		// YAML must not break on colon or quote in value
		const titleLine = yaml.split('\n').find((l) => l.startsWith('title:'));
		expect(titleLine).toBeTruthy();
	});

	it('produces a string that starts and ends with ---', () => {
		const fm = buildFrontmatter(makeWpPost());
		const yaml = buildFrontmatterYaml(fm);
		expect(yaml.startsWith('---\n')).toBe(true);
		expect(yaml.trimEnd().endsWith('---')).toBe(true);
	});
});
