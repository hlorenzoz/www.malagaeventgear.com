/**
 * Tests for turndown.ts — HTML→Markdown conversion + h1 demote (S-01).
 *
 * These tests also serve as the task 4.1 spike validation:
 * linkedom as DOM adapter works in the Vitest/Bun environment.
 */
import { describe, it, expect } from 'vitest';
import { htmlToMarkdown, demoteLeadingH1 } from './turndown';

describe('linkedom + turndown integration (spike 4.1)', () => {
	it('converts basic HTML to Markdown', () => {
		const html = '<p>Hello <strong>world</strong>.</p>';
		const result = htmlToMarkdown(html, 'Ignored Title');
		expect(result).toContain('**world**');
		expect(result).not.toContain('<strong>');
	});

	it('converts h2/h3 to ATX heading style', () => {
		const html = '<h2>Section</h2><p>Body.</p>';
		const result = htmlToMarkdown(html, 'Different Title');
		expect(result).toContain('## Section');
	});

	it('converts anchor tags to Markdown links', () => {
		const html = '<p><a href="https://example.com">Click here</a></p>';
		const result = htmlToMarkdown(html, 'Title');
		expect(result).toContain('[Click here](https://example.com)');
	});

	it('converts img tags to Markdown image syntax', () => {
		const html = '<img src="https://cdn.malagaeventgear.com/42/photo.jpg" alt="Photo" />';
		const result = htmlToMarkdown(html, 'Title');
		expect(result).toContain('![Photo](https://cdn.malagaeventgear.com/42/photo.jpg)');
	});

	it('converts unordered lists', () => {
		const html = '<ul><li>Item one</li><li>Item two</li></ul>';
		const result = htmlToMarkdown(html, 'Title');
		// turndown outputs "- " or "-   " (ATX style adds spaces) — match both
		expect(result).toMatch(/^-\s+Item one/m);
		expect(result).toMatch(/^-\s+Item two/m);
	});
});

describe('demoteLeadingH1 (S-01)', () => {
	it('removes a leading h1 that matches the post title exactly', () => {
		const html = '<h1>My Post Title</h1><p>Body text.</p>';
		const result = demoteLeadingH1(html, 'My Post Title');
		expect(result).not.toContain('<h1>');
		expect(result).toContain('Body text');
	});

	it('removes h1 case-insensitively', () => {
		const html = '<h1>MY POST TITLE</h1><p>Body.</p>';
		const result = demoteLeadingH1(html, 'My Post Title');
		expect(result).not.toContain('<h1>');
	});

	it('does NOT remove h1 when text differs from title', () => {
		const html = '<h1>Different Section Heading</h1><p>Body.</p>';
		const result = demoteLeadingH1(html, 'My Post Title');
		expect(result).toContain('<h1>Different Section Heading</h1>');
	});

	it('does nothing when there is no leading h1', () => {
		const html = '<p>Just a paragraph.</p><h2>Section</h2>';
		const result = demoteLeadingH1(html, 'My Post Title');
		expect(result).toContain('<p>');
		expect(result).toContain('<h2>');
	});

	it('does nothing when h1 is not the first element', () => {
		const html = '<p>Intro paragraph.</p><h1>My Post Title</h1><p>Body.</p>';
		const result = demoteLeadingH1(html, 'My Post Title');
		// h1 is not the first element child, so it's left alone
		expect(result).toContain('<h1>');
	});
});

describe('WP shortcode stripping (SC-MIG-12)', () => {
	it('strips self-closing shortcodes', () => {
		const html = '<p>Before</p>[gallery ids="1,2,3"]<p>After</p>';
		const result = htmlToMarkdown(html, 'Title');
		expect(result).not.toContain('[gallery');
	});

	it('strips paired shortcodes', () => {
		const html = '<p>Before</p>[caption align="aligncenter"]Image caption[/caption]<p>After</p>';
		const result = htmlToMarkdown(html, 'Title');
		expect(result).not.toContain('[caption');
		expect(result).not.toContain('[/caption]');
	});

	it('preserves regular Markdown content after stripping shortcodes', () => {
		const html = '<p>Regular <strong>content</strong>.</p>[gallery ids="1"]';
		const result = htmlToMarkdown(html, 'Title');
		expect(result).toContain('**content**');
	});
});

describe('h1 demote integrated into htmlToMarkdown', () => {
	it('strips leading h1 title from Markdown output', () => {
		const postTitle = 'Event Planning Guide';
		const html =
			'<h1>Event Planning Guide</h1><h2>Introduction</h2><p>Start here.</p>';
		const result = htmlToMarkdown(html, postTitle);
		// The result should NOT start with an h1
		expect(result).not.toMatch(/^# Event Planning Guide/);
		expect(result).toContain('## Introduction');
	});

	it('preserves h1 content in body when it does not match the title', () => {
		const postTitle = 'My Venue Guide';
		const html = '<h1>A Sub-Section Title</h1><p>Content here.</p>';
		const result = htmlToMarkdown(html, postTitle);
		expect(result).toContain('# A Sub-Section Title');
	});
});
