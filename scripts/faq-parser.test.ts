/**
 * Unit tests for the FAQ parser (faq-parser.mjs).
 * Strict TDD — tests written first, run RED, then implementation makes them GREEN.
 */
import { describe, it, expect } from 'vitest';
import { parseFaqs } from './faq-parser.mjs';

describe('parseFaqs', () => {
	it('extracts Q&A pairs from a standard ## FAQs / ### Q section', () => {
		const body = `
## Introduction

Some intro text.

## FAQs

### What is an AV company?

An AV company provides audio visual equipment and services.

### How much does rental cost?

Rental costs vary by equipment type and duration.
`;
		const result = parseFaqs(body);
		expect(result).toHaveLength(2);
		expect(result[0].question).toBe('What is an AV company?');
		expect(result[0].answer).toContain('audio visual equipment');
		expect(result[1].question).toBe('How much does rental cost?');
		expect(result[1].answer).toContain('Rental costs vary');
	});

	it('handles ## FAQ (singular) as the section marker', () => {
		const body = `
## FAQ

### Is it safe?

Yes, absolutely safe.
`;
		const result = parseFaqs(body);
		expect(result).toHaveLength(1);
		expect(result[0].question).toBe('Is it safe?');
	});

	it('stops collecting at the next h2 after FAQs', () => {
		const body = `
## FAQs

### First question?

First answer.

## Other Section

### Not a FAQ question

This should not be collected.
`;
		const result = parseFaqs(body);
		expect(result).toHaveLength(1);
		expect(result[0].question).toBe('First question?');
	});

	it('strips markdown links from answers', () => {
		const body = `
## FAQs

### How do I contact you?

[Reach out to us](https://example.com) for more info.
`;
		const result = parseFaqs(body);
		expect(result[0].answer).toContain('Reach out to us');
		expect(result[0].answer).not.toContain('https://example.com');
		expect(result[0].answer).not.toContain('[');
	});

	it('strips inline formatting (bold, italic) from answers', () => {
		const body = `
## FAQs

### What gear do you offer?

We offer **professional sound systems** and *lighting*.
`;
		const result = parseFaqs(body);
		expect(result[0].answer).toContain('professional sound systems');
		expect(result[0].answer).toContain('lighting');
		expect(result[0].answer).not.toContain('**');
		expect(result[0].answer).not.toContain('*');
	});

	it('collapses extra whitespace in answers', () => {
		const body = `
## FAQs

### Spacing test?

Line one.

Line two.

Line three.
`;
		const result = parseFaqs(body);
		const answer = result[0].answer;
		// Multiple blank lines/newlines should be collapsed
		expect(answer).not.toMatch(/\n{3,}/);
		expect(answer.trim()).toBeTruthy();
	});

	it('returns empty array when no FAQs section exists', () => {
		const body = `
## Introduction

Some text.

## Another Section

More text.
`;
		const result = parseFaqs(body);
		expect(result).toHaveLength(0);
	});

	it('returns empty array for empty body', () => {
		expect(parseFaqs('')).toHaveLength(0);
	});

	it('handles multi-paragraph answers', () => {
		const body = `
## FAQs

### Complex question?

First paragraph of answer.

Second paragraph continues here.
`;
		const result = parseFaqs(body);
		expect(result).toHaveLength(1);
		expect(result[0].answer).toContain('First paragraph');
		expect(result[0].answer).toContain('Second paragraph');
	});

	it('handles numbered list items in answers (strips list markers)', () => {
		const body = `
## FAQs

### Steps to book?

1. First step
2. Second step
3. Third step
`;
		const result = parseFaqs(body);
		expect(result[0].answer).toContain('First step');
		expect(result[0].answer).toContain('Second step');
	});
});
