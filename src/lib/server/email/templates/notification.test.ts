import { describe, expect, it } from 'vitest';
import { renderNotification } from './notification';

const baseLead = {
	name: 'Ana García',
	email: 'ana@example.com',
	phone: '+34600000000',
	eventDate: '2026-08-15',
	packageId: 'basic-mice',
	comments: 'Need fog machine',
};

describe('renderNotification', () => {
	it('returns non-empty subject and html', () => {
		const result = renderNotification(baseLead);
		expect(result.subject).toBeTruthy();
		expect(result.html).toBeTruthy();
		expect(result.text).toBeTruthy();
	});

	it('html contains package id', () => {
		const result = renderNotification(baseLead);
		expect(result.html).toContain('basic-mice');
	});

	it('html contains lead name', () => {
		const result = renderNotification(baseLead);
		expect(result.html).toContain('Ana García');
	});

	it('html contains lead email', () => {
		const result = renderNotification(baseLead);
		expect(result.html).toContain('ana@example.com');
	});

	it('html contains event date', () => {
		const result = renderNotification(baseLead);
		expect(result.html).toContain('2026-08-15');
	});

	it('html contains phone', () => {
		const result = renderNotification(baseLead);
		expect(result.html).toContain('+34600000000');
	});
});
