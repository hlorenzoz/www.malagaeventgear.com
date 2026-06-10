/**
 * Unit tests for the ToC parser (toc-parser.mjs).
 * Strict TDD — tests written first, run RED, then implementation makes them GREEN.
 */
import { describe, it, expect } from 'vitest';
import { parseToc } from './toc-parser.mjs';

describe('parseToc', () => {
	it('extracts h2 headings with correct ids', () => {
		const body = `
## Brief Overview

Some content.

## Key Highlights

More content.
`;
		const result = parseToc(body);
		expect(result).toHaveLength(2);
		expect(result[0]).toEqual({ id: 'brief-overview', text: 'Brief Overview', level: 2 });
		expect(result[1]).toEqual({ id: 'key-highlights', text: 'Key Highlights', level: 2 });
	});

	it('extracts h3 headings with correct ids', () => {
		const body = `
## Section One

### Why Choose Us?

Content.

### How It Works

More content.
`;
		const result = parseToc(body);
		expect(result).toHaveLength(3);
		expect(result[0]).toEqual({ id: 'section-one', text: 'Section One', level: 2 });
		expect(result[1]).toEqual({ id: 'why-choose-us', text: 'Why Choose Us?', level: 3 });
		expect(result[2]).toEqual({ id: 'how-it-works', text: 'How It Works', level: 3 });
	});

	it('excludes "Table of Contents" h2 (case-insensitive)', () => {
		const body = `
## Brief Overview

Content.

## Table of Contents

- [Brief Overview](#brief-overview)

## Key Highlights

More content.
`;
		const result = parseToc(body);
		const texts = result.map((e) => e.text);
		expect(texts).not.toContain('Table of Contents');
		expect(texts).toContain('Brief Overview');
		expect(texts).toContain('Key Highlights');
	});

	it('includes FAQ question h3 headings', () => {
		const body = `
## FAQs

### What equipment do you offer?

We offer sound systems.

### How do I book?

Contact us.
`;
		const result = parseToc(body);
		// FAQs h2 + 2 question h3s
		expect(result.find((e) => e.text === 'FAQs')).toBeDefined();
		expect(result.find((e) => e.text === 'What equipment do you offer?')).toBeDefined();
		expect(result.find((e) => e.text === 'How do I book?')).toBeDefined();
	});

	it('generates slugified ids matching rehype-slug (github-slugger)', () => {
		const body = `
## Enhance Your Ceremony with Premium Audiovisual Equipment

Content.

### Why Choose an Experienced Rental Company for Your Event?

More.
`;
		const result = parseToc(body);
		expect(result[0].id).toBe('enhance-your-ceremony-with-premium-audiovisual-equipment');
		expect(result[1].id).toBe('why-choose-an-experienced-rental-company-for-your-event');
	});

	it('handles duplicate heading texts with unique ids (slugger counter)', () => {
		const body = `
## Introduction

Content.

## Introduction

More content.
`;
		const result = parseToc(body);
		expect(result).toHaveLength(2);
		expect(result[0].id).toBe('introduction');
		expect(result[1].id).toBe('introduction-1');
	});

	it('returns empty array for empty body', () => {
		expect(parseToc('')).toHaveLength(0);
	});

	it('returns empty array when no headings exist', () => {
		const body = `
Some paragraph text.

Another paragraph.
`;
		expect(parseToc(body)).toHaveLength(0);
	});

	it('preserves heading level 2 and 3 only (ignores h4+)', () => {
		const body = `
## Section

### Subsection

#### Ignored heading
`;
		const result = parseToc(body);
		expect(result).toHaveLength(2);
		expect(result.map((e) => e.level)).toEqual([2, 3]);
	});

	it('trims heading text', () => {
		const body = `
##   Spaced Heading

Content.
`;
		const result = parseToc(body);
		expect(result[0].text).toBe('Spaced Heading');
	});
});
