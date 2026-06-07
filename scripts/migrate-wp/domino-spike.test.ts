/**
 * Spike validation tests — task 4.1: linkedom + turndown in Bun/Node.
 *
 * Findings documented here:
 *
 * 1. turndown@7.x in Node/Bun sets root={} (since window is undefined),
 *    so root.DOMParser is always undefined. canParseHTMLNatively() → false.
 *    Fallback: @mixmark-io/domino (bundled with turndown). Domino is correct.
 *
 * 2. linkedom is used ONLY for demoteLeadingH1() (DOM manipulation + innerHTML).
 *    turndown uses domino internally — this is invisible to callers.
 *
 * 3. CRITICAL BUG FOUND AND FIXED: stripShortcodes() was stripping Markdown link
 *    text `[Click here](url)` because `[Click here]` matched the shortcode regex.
 *    Fix: require shortcode tag name to be a single word with no spaces, and add
 *    negative lookahead `(?!\s*\()` to preserve Markdown link/image syntax.
 *
 * 4. linkedom@0.18.12 innerHTML correctly preserves href, src, alt attributes.
 *
 * These tests verify the final correct behavior.
 */
import { describe, it, expect } from 'vitest';
import { htmlToMarkdown } from './turndown';

describe('Spike 4.1 — linkedom + turndown integration validation', () => {
	it('anchor links are NOT stripped by shortcode remover', () => {
		const html = '<p><a href="https://example.com">Click here</a></p>';
		const result = htmlToMarkdown(html, 'Title');
		expect(result).toContain('[Click here](https://example.com)');
	});

	it('image alt text is preserved (NOT stripped as shortcode)', () => {
		const html =
			'<img src="https://cdn.malagaeventgear.com/42/photo.jpg" alt="Photo" />';
		const result = htmlToMarkdown(html, 'Title');
		expect(result).toContain('![Photo](https://cdn.malagaeventgear.com/42/photo.jpg)');
	});

	it('WP shortcodes are stripped but Markdown links preserved together', () => {
		const html =
			'<p>See <a href="https://example.com">this page</a>.</p>[gallery ids="1,2,3"]';
		const result = htmlToMarkdown(html, 'Title');
		expect(result).toContain('[this page](https://example.com)');
		expect(result).not.toContain('[gallery');
	});
});
