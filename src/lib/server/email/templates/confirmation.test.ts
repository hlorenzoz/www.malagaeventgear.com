import { describe, expect, it } from 'vitest';
import { renderConfirmation } from './confirmation';

const baseLead = {
	name: 'Ana García',
	email: 'ana@example.com',
	phone: '+34600000000',
	eventDate: '2026-08-15',
	packageId: 'basic-mice',
	comments: 'Need fog machine',
};

describe('renderConfirmation', () => {
	it('returns non-empty subject and html for en locale', () => {
		const result = renderConfirmation(baseLead, 'en');
		expect(result.subject).toBeTruthy();
		expect(result.html).toBeTruthy();
		expect(result.text).toBeTruthy();
	});

	it('html contains lead name', () => {
		const result = renderConfirmation(baseLead, 'en');
		expect(result.html).toContain('Ana García');
	});

	it('html contains lead email', () => {
		const result = renderConfirmation(baseLead, 'en');
		expect(result.html).toContain('ana@example.com');
	});

	it('html contains package name', () => {
		const result = renderConfirmation(baseLead, 'en');
		expect(result.html).toContain('Basic MICE Pack');
	});

	it('returns Spanish copy for es locale', () => {
		const enResult = renderConfirmation(baseLead, 'en');
		const esResult = renderConfirmation(baseLead, 'es');
		// Subjects should differ by locale
		expect(esResult.subject).not.toBe(enResult.subject);
	});

	it('es html contains lead name', () => {
		const result = renderConfirmation(baseLead, 'es');
		expect(result.html).toContain('Ana García');
	});
});
