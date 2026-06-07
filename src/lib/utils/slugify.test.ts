import { describe, it, expect } from 'vitest';
import { slugify } from './slugify';

describe('slugify', () => {
	it('lowercases ASCII strings', () => {
		expect(slugify('Event Planning')).toBe('event-planning');
	});

	it('replaces spaces with hyphens', () => {
		expect(slugify('hello world')).toBe('hello-world');
	});

	it('handles unicode NFD — María → maria', () => {
		expect(slugify('María')).toBe('maria');
	});

	it('handles unicode NFD — María López → maria-lopez', () => {
		expect(slugify('María López')).toBe('maria-lopez');
	});

	it('handles unicode — Ambientación → ambientacion', () => {
		expect(slugify('Ambientación')).toBe('ambientacion');
	});

	it('replaces special chars with hyphens', () => {
		expect(slugify('A&B')).toBe('a-b');
	});

	it('collapses consecutive special chars into one hyphen', () => {
		expect(slugify('A & B')).toBe('a-b');
	});

	it('removes leading hyphens', () => {
		expect(slugify('-hello')).toBe('hello');
	});

	it('removes trailing hyphens', () => {
		expect(slugify('hello-')).toBe('hello');
	});

	it('is idempotent — slugify(slugify(x)) === slugify(x)', () => {
		const cases = ['Event Planning', 'María López', 'A&B', 'hello-world'];
		for (const c of cases) {
			expect(slugify(slugify(c))).toBe(slugify(c));
		}
	});

	it('handles already-slugified input unchanged', () => {
		expect(slugify('event-planning')).toBe('event-planning');
	});

	it('handles numbers in input', () => {
		expect(slugify('Top 10 Tips')).toBe('top-10-tips');
	});

	it('handles empty string', () => {
		expect(slugify('')).toBe('');
	});
});
