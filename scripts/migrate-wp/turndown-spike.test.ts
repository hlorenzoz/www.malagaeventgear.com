/**
 * Additional turndown integration tests — task 4.1 continuation.
 * Verifies edge cases found during spike investigation.
 */
import { describe, it, expect } from 'vitest';
import { htmlToMarkdown } from './turndown';

describe('turndown edge cases (spike findings)', () => {
	it('strong/em inline formatting preserved', () => {
		const html = '<p>Bold <strong>word</strong> and <em>italic</em>.</p>';
		const result = htmlToMarkdown(html, 'Title');
		expect(result).toContain('**word**');
		// turndown uses _italic_ for <em> (not *italic*)
		expect(result).toContain('_italic_');
	});

	it('ordered list converts correctly', () => {
		const html = '<ol><li>First</li><li>Second</li></ol>';
		const result = htmlToMarkdown(html, 'Title');
		expect(result).toContain('1.');
	});

	it('code block preserved', () => {
		const html = '<pre><code>const x = 1;</code></pre>';
		const result = htmlToMarkdown(html, 'Title');
		expect(result).toContain('const x = 1;');
	});

	it('nested h1 NOT at root level is preserved', () => {
		const html =
			'<div><h1>Nested H1 Title</h1><p>Body.</p></div>';
		const result = htmlToMarkdown(html, 'My Post Title');
		// The h1 is inside a div — NOT the first direct child of body
		// So demoteLeadingH1 should NOT remove it
		// (it only removes a leading h1 that matches the post title AND is the first body child)
		expect(result).toContain('# Nested H1 Title');
	});
});
