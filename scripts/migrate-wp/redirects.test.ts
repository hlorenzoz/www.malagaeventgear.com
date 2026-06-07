/**
 * Unit tests for scripts/migrate-wp/redirects.ts
 *
 * SC-BR-04: deriveOldPath strips domain and preserves trailing slash
 * SC-BR-05: deriveOldPath appends missing trailing slash
 * SC-BR-06: deriveOldPath throws on invalid input (non-absolute URL, wrong domain)
 * SC-BR-07: buildRedirects produces correct rule format
 * SC-BR-08: buildRedirects is idempotent (same input → same output)
 * SC-BR-09: buildRedirects never emits wildcard; preserves unrelated rules via merge helper
 * SC-BR-10: rule count warning (taxonomy omitted when over 100 total)
 * SC-BR-11: taxonomy redirects emitted when under 100 total
 */

import { describe, it, expect } from 'vitest';
import {
	deriveOldPath,
	buildRedirects,
	buildManagedBlock,
	mergeRedirectsFile,
	BLOCK_BEGIN,
	BLOCK_END,
} from './redirects';

// ─── deriveOldPath ────────────────────────────────────────────────────────────

describe('deriveOldPath', () => {
	// SC-BR-04: standard case — https with trailing slash
	it('strips https domain and preserves trailing slash', () => {
		expect(deriveOldPath('https://malagaeventgear.com/vintage-chairs/')).toBe('/vintage-chairs/');
	});

	// SC-BR-05: missing trailing slash — must append one
	it('appends trailing slash when missing', () => {
		expect(deriveOldPath('https://malagaeventgear.com/vintage-chairs')).toBe('/vintage-chairs/');
	});

	// Triangulation — http variant
	it('handles http scheme', () => {
		expect(deriveOldPath('http://malagaeventgear.com/birthday-party-decor/')).toBe(
			'/birthday-party-decor/'
		);
	});

	// Triangulation — www variant
	it('handles www subdomain', () => {
		expect(deriveOldPath('https://www.malagaeventgear.com/outdoor-wedding-tips/')).toBe(
			'/outdoor-wedding-tips/'
		);
	});

	// Triangulation — query string stripped
	it('strips query string', () => {
		expect(deriveOldPath('https://malagaeventgear.com/my-post/?utm_source=email')).toBe(
			'/my-post/'
		);
	});

	// Triangulation — hash stripped
	it('strips hash fragment', () => {
		expect(deriveOldPath('https://malagaeventgear.com/my-post/#section-one')).toBe('/my-post/');
	});

	// SC-BR-06: not a valid absolute URL
	it('throws TypeError for non-URL input', () => {
		expect(() => deriveOldPath('not-a-url')).toThrow(TypeError);
	});

	// Triangulation: wrong domain throws
	it('throws TypeError for a different domain', () => {
		expect(() => deriveOldPath('https://example.com/my-post/')).toThrow(TypeError);
	});

	// Spec: empty string throws (not returns empty)
	it('throws TypeError for empty string', () => {
		expect(() => deriveOldPath('')).toThrow(TypeError);
	});
});

// ─── buildRedirects ───────────────────────────────────────────────────────────

/** Minimal post fixture matching what index.ts passes */
function makePost(slug: string, link: string) {
	return { slug, link };
}

describe('buildRedirects', () => {
	// SC-BR-07: correct rule format
	it('produces one rule per post in correct Cloudflare format', () => {
		const posts = [makePost('birthday-party-decor', 'https://malagaeventgear.com/birthday-party-decor/')];
		const rules = buildRedirects(posts);
		expect(rules).toHaveLength(1);
		expect(rules[0]).toBe('/birthday-party-decor/  /blog/birthday-party-decor/  301');
	});

	// Triangulation — multiple posts
	it('produces N rules for N posts', () => {
		const posts = [
			makePost('post-one', 'https://malagaeventgear.com/post-one/'),
			makePost('post-two', 'https://malagaeventgear.com/post-two/'),
			makePost('post-three', 'https://malagaeventgear.com/post-three/'),
		];
		const rules = buildRedirects(posts);
		expect(rules).toHaveLength(3);
		expect(rules[1]).toBe('/post-two/  /blog/post-two/  301');
	});

	// SC-BR-08: idempotent — same input → same output (no duplicates on repeated call)
	it('is deterministic (same input → same output)', () => {
		const posts = [makePost('my-post', 'https://malagaeventgear.com/my-post/')];
		expect(buildRedirects(posts)).toEqual(buildRedirects(posts));
	});

	// Safety: never emits a wildcard rule
	it('never emits a wildcard rule', () => {
		const posts = [makePost('my-post', 'https://malagaeventgear.com/my-post/')];
		const rules = buildRedirects(posts);
		for (const rule of rules) {
			expect(rule).not.toContain('*');
		}
	});

	// Skip self-referential post (old path === new path)
	it('skips a post whose old path already equals /blog/<slug>/', () => {
		// This would be a post whose WP permalink is already at /blog/my-post/
		const posts = [
			{ slug: 'my-post', link: 'https://malagaeventgear.com/blog/my-post/' },
		];
		const rules = buildRedirects(posts);
		expect(rules).toHaveLength(0);
	});

	// Trailing slash consistency
	it('uses trailing slash on both source and destination', () => {
		const posts = [makePost('no-slash', 'https://malagaeventgear.com/no-slash')];
		const rules = buildRedirects(posts);
		expect(rules[0]).toBe('/no-slash/  /blog/no-slash/  301');
	});
});

// ─── buildManagedBlock ────────────────────────────────────────────────────────

describe('buildManagedBlock', () => {
	it('wraps rules in BEGIN/END markers', () => {
		const rules = ['/my-post/  /blog/my-post/  301'];
		const block = buildManagedBlock(rules);
		expect(block).toContain(BLOCK_BEGIN);
		expect(block).toContain(BLOCK_END);
		expect(block).toContain('/my-post/  /blog/my-post/  301');
	});

	it('preserves marker placement (BEGIN before rules, END after)', () => {
		const rules = ['/a/  /blog/a/  301', '/b/  /blog/b/  301'];
		const block = buildManagedBlock(rules);
		const lines = block.split('\n');
		const beginIdx = lines.findIndex((l) => l.includes(BLOCK_BEGIN));
		const endIdx = lines.findIndex((l) => l.includes(BLOCK_END));
		const ruleIdx = lines.findIndex((l) => l.includes('/a/'));
		expect(beginIdx).toBeLessThan(ruleIdx);
		expect(ruleIdx).toBeLessThan(endIdx);
	});
});

// ─── mergeRedirectsFile ───────────────────────────────────────────────────────

describe('mergeRedirectsFile', () => {
	// SC-BR-09: unrelated rules preserved
	it('preserves unrelated rules that exist before the managed block', () => {
		const existing = `/old-landing/  /packages/  301\n\n${BLOCK_BEGIN}\n/old-post/  /blog/old-post/  301\n${BLOCK_END}\n`;
		const newRules = ['/new-post/  /blog/new-post/  301'];
		const result = mergeRedirectsFile(existing, newRules);
		expect(result).toContain('/old-landing/  /packages/  301');
		expect(result).toContain('/new-post/  /blog/new-post/  301');
	});

	// Managed block is replaced (not appended)
	it('replaces the managed block without duplicating it', () => {
		const existing = `${BLOCK_BEGIN}\n/old-post/  /blog/old-post/  301\n${BLOCK_END}\n`;
		const newRules = ['/new-post/  /blog/new-post/  301'];
		const result = mergeRedirectsFile(existing, newRules);
		// Old post rule must be gone — replaced by new block
		expect(result).not.toContain('/old-post/  /blog/old-post/  301');
		expect(result).toContain('/new-post/  /blog/new-post/  301');
	});

	// Unrelated rules after the block are also preserved
	it('preserves unrelated rules that exist after the managed block', () => {
		const existing = `${BLOCK_BEGIN}\n/old-post/  /blog/old-post/  301\n${BLOCK_END}\n\n/trailing-rule/  /somewhere/  301\n`;
		const newRules = ['/new-post/  /blog/new-post/  301'];
		const result = mergeRedirectsFile(existing, newRules);
		expect(result).toContain('/trailing-rule/  /somewhere/  301');
	});

	// When no managed block exists, appends it
	it('appends managed block when file has no existing block', () => {
		const existing = `/unrelated/  /somewhere/  301\n`;
		const newRules = ['/my-post/  /blog/my-post/  301'];
		const result = mergeRedirectsFile(existing, newRules);
		expect(result).toContain('/unrelated/  /somewhere/  301');
		expect(result).toContain('/my-post/  /blog/my-post/  301');
		expect(result).toContain(BLOCK_BEGIN);
	});

	// Empty file — create fresh
	it('creates a fresh file with just the managed block when existing is empty', () => {
		const result = mergeRedirectsFile('', ['/a/  /blog/a/  301']);
		expect(result).toContain(BLOCK_BEGIN);
		expect(result).toContain('/a/  /blog/a/  301');
		expect(result).toContain(BLOCK_END);
	});
});
