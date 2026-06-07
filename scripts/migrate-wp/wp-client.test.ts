/**
 * Unit tests for scripts/migrate-wp/wp-client.ts
 *
 * W-03: pagination via X-WP-TotalPages header
 *
 * Tests:
 *  - Single-page response: exactly one fetch call, returns array with all items
 *  - Multi-page response: fetches all pages and concatenates results
 *  - fetchPosts: uses correct endpoint + params, returns WpPost[]
 *  - fetchCategories: uses correct endpoint, returns WpCategory[]
 *  - Non-2xx throws
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { fetchPosts, fetchCategories } from './wp-client';

// Helper — build a mock fetch Response
function mockResponse(data: unknown, totalPages: number, ok = true, status = 200) {
	return {
		ok,
		status,
		statusText: ok ? 'OK' : 'Error',
		json: () => Promise.resolve(data),
		headers: {
			get: (name: string) => {
				if (name === 'X-WP-TotalPages') return String(totalPages);
				return null;
			},
		},
	};
}

describe('wp-client pagination (W-03)', () => {
	beforeEach(() => {
		vi.spyOn(console, 'log').mockImplementation(() => {});
	});

	afterEach(() => {
		vi.restoreAllMocks();
	});

	// ─── Single page ────────────────────────────────────────────────────────

	it('fetches exactly one page when X-WP-TotalPages is 1', async () => {
		const posts = [
			{ id: 1, slug: 'post-one', link: 'https://malagaeventgear.com/post-one/' },
			{ id: 2, slug: 'post-two', link: 'https://malagaeventgear.com/post-two/' },
		];

		const mockFetch = vi.fn().mockResolvedValue(mockResponse(posts, 1));
		vi.stubGlobal('fetch', mockFetch);

		const result = await fetchPosts();

		// Only one page fetch
		expect(mockFetch).toHaveBeenCalledTimes(1);
		// Returns all items from that page
		expect(result).toHaveLength(2);
		expect(result[0].slug).toBe('post-one');
		expect(result[1].slug).toBe('post-two');
	});

	it('includes page=1 and per_page=100 in the request URL', async () => {
		const mockFetch = vi.fn().mockResolvedValue(mockResponse([], 1));
		vi.stubGlobal('fetch', mockFetch);

		await fetchPosts();

		const calledUrl = mockFetch.mock.calls[0][0] as string;
		expect(calledUrl).toContain('page=1');
		expect(calledUrl).toContain('per_page=100');
	});

	// ─── Multi-page ─────────────────────────────────────────────────────────

	it('fetches all pages when X-WP-TotalPages > 1 and concatenates results', async () => {
		const page1 = [{ id: 1, slug: 'post-one', link: 'https://malagaeventgear.com/post-one/' }];
		const page2 = [{ id: 2, slug: 'post-two', link: 'https://malagaeventgear.com/post-two/' }];
		const page3 = [{ id: 3, slug: 'post-three', link: 'https://malagaeventgear.com/post-three/' }];

		const mockFetch = vi
			.fn()
			.mockResolvedValueOnce(mockResponse(page1, 3))  // page 1 — sets totalPages=3
			.mockResolvedValueOnce(mockResponse(page2, 3))  // page 2
			.mockResolvedValueOnce(mockResponse(page3, 3)); // page 3

		vi.stubGlobal('fetch', mockFetch);

		const result = await fetchPosts();

		// Three pages fetched
		expect(mockFetch).toHaveBeenCalledTimes(3);
		// All items concatenated
		expect(result).toHaveLength(3);
		expect(result[0].slug).toBe('post-one');
		expect(result[1].slug).toBe('post-two');
		expect(result[2].slug).toBe('post-three');
	});

	it('requests page=2 and page=3 in a 3-page scenario', async () => {
		const mockFetch = vi
			.fn()
			.mockResolvedValueOnce(mockResponse([{ id: 1 }], 3))
			.mockResolvedValueOnce(mockResponse([{ id: 2 }], 3))
			.mockResolvedValueOnce(mockResponse([{ id: 3 }], 3));

		vi.stubGlobal('fetch', mockFetch);

		await fetchPosts();

		const urls = mockFetch.mock.calls.map((c) => c[0] as string);
		expect(urls[0]).toContain('page=1');
		expect(urls[1]).toContain('page=2');
		expect(urls[2]).toContain('page=3');
	});

	// ─── fetchCategories ─────────────────────────────────────────────────────

	it('fetchCategories: uses categories endpoint and returns items', async () => {
		const cats = [
			{ id: 1, name: 'Event Planning', slug: 'event-planning', count: 5 },
			{ id: 2, name: 'Weddings', slug: 'weddings', count: 3 },
		];

		const mockFetch = vi.fn().mockResolvedValue(mockResponse(cats, 1));
		vi.stubGlobal('fetch', mockFetch);

		const result = await fetchCategories();

		expect(mockFetch).toHaveBeenCalledTimes(1);
		const calledUrl = mockFetch.mock.calls[0][0] as string;
		expect(calledUrl).toContain('categories');
		expect(result).toHaveLength(2);
		expect(result[0].slug).toBe('event-planning');
	});

	// ─── Error handling ──────────────────────────────────────────────────────

	it('throws when WP REST API returns non-2xx', async () => {
		const mockFetch = vi.fn().mockResolvedValue(mockResponse(null, 0, false, 500));
		vi.stubGlobal('fetch', mockFetch);

		await expect(fetchPosts()).rejects.toThrow('500');
	});

	// ─── Missing header fallback ─────────────────────────────────────────────

	it('treats missing X-WP-TotalPages header as 1 page', async () => {
		const noHeaderResponse = {
			ok: true,
			status: 200,
			json: () => Promise.resolve([{ id: 1, slug: 'only-post' }]),
			headers: { get: () => null },
		};

		const mockFetch = vi.fn().mockResolvedValue(noHeaderResponse);
		vi.stubGlobal('fetch', mockFetch);

		const result = await fetchPosts();

		expect(mockFetch).toHaveBeenCalledTimes(1);
		expect(result).toHaveLength(1);
	});
});
