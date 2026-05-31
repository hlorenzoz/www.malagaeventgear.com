/**
 * Vitest unit tests for email/templates/review.ts (Phase 3 template, Phase 4 tests).
 * Pure function — no I/O.
 */
import { describe, it, expect } from 'vitest';
import { renderReview } from './review';

describe('renderReview', () => {
	const TOKEN = 'abc123xyz';
	const SITE_URL = 'https://malagaeventgear.com';
	const LEAD_NAME = 'María García';

	it('returns subject, html, and text', () => {
		const result = renderReview(TOKEN, 'es', SITE_URL, LEAD_NAME);
		expect(result).toHaveProperty('subject');
		expect(result).toHaveProperty('html');
		expect(result).toHaveProperty('text');
	});

	it('contains tracked link placeholder /r/{token} in html', () => {
		const { html } = renderReview(TOKEN, 'en', SITE_URL, LEAD_NAME);
		expect(html).toContain(`${SITE_URL}/r/${TOKEN}`);
	});

	it('contains tracked link in plain text', () => {
		const { text } = renderReview(TOKEN, 'en', SITE_URL, LEAD_NAME);
		expect(text).toContain(`${SITE_URL}/r/${TOKEN}`);
	});

	it('EN locale: subject and body in English', () => {
		const { subject, html } = renderReview(TOKEN, 'en', SITE_URL, LEAD_NAME);
		expect(subject).toMatch(/experience/i);
		expect(html).toContain('Hi');
	});

	it('ES locale: subject and body in Spanish', () => {
		const { subject, html } = renderReview(TOKEN, 'es', SITE_URL, LEAD_NAME);
		expect(subject).toMatch(/experiencia/i);
		expect(html).toContain('Hola');
	});

	it('ES locale: CTA text in Spanish', () => {
		const { html } = renderReview(TOKEN, 'es', SITE_URL, LEAD_NAME);
		expect(html).toContain('Dejar una reseña');
	});

	it('includes lead name in greeting', () => {
		const { html } = renderReview(TOKEN, 'en', SITE_URL, 'Carlos');
		expect(html).toContain('Carlos');
	});

	it('defaults to es locale when lang param is omitted', () => {
		// signature: renderReview(token, lang='es', siteUrl, leadName='')
		const { subject } = renderReview(TOKEN, undefined as unknown as 'es', SITE_URL);
		expect(subject).toMatch(/experiencia/i);
	});
});
