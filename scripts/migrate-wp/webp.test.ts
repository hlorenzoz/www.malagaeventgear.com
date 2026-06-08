/**
 * Unit tests for webp.ts — pure decision and command-building functions.
 * TDD Phase 8 — written RED before implementation.
 */
import { describe, it, expect } from 'vitest';
import { shouldConvertToWebp, buildCwebpCommand } from './webp';

// ---------------------------------------------------------------------------
// shouldConvertToWebp
// ---------------------------------------------------------------------------

describe('shouldConvertToWebp', () => {
	// Converts: png and jpeg only
	it('returns true for image/png', () => {
		expect(shouldConvertToWebp('image/png')).toBe(true);
	});

	it('returns true for image/jpeg', () => {
		expect(shouldConvertToWebp('image/jpeg')).toBe(true);
	});

	// Does NOT convert: already webp, svg, avif, and anything else
	it('returns false for image/webp (already webp)', () => {
		expect(shouldConvertToWebp('image/webp')).toBe(false);
	});

	it('returns false for image/svg+xml', () => {
		expect(shouldConvertToWebp('image/svg+xml')).toBe(false);
	});

	it('returns false for image/avif', () => {
		expect(shouldConvertToWebp('image/avif')).toBe(false);
	});

	it('returns false for image/gif', () => {
		expect(shouldConvertToWebp('image/gif')).toBe(false);
	});

	it('returns false for image/tiff', () => {
		expect(shouldConvertToWebp('image/tiff')).toBe(false);
	});

	it('returns false for empty string (unknown type)', () => {
		expect(shouldConvertToWebp('')).toBe(false);
	});

	it('returns false for application/octet-stream', () => {
		expect(shouldConvertToWebp('application/octet-stream')).toBe(false);
	});

	it('is case-sensitive (upper-case PNG returns false)', () => {
		// MIME types should always be lowercase in practice — this documents the behavior
		expect(shouldConvertToWebp('IMAGE/PNG')).toBe(false);
	});
});

// ---------------------------------------------------------------------------
// buildCwebpCommand
// ---------------------------------------------------------------------------

describe('buildCwebpCommand', () => {
	it('returns an array starting with cwebp', () => {
		const cmd = buildCwebpCommand('/tmp/in.png', '/tmp/out.webp');
		expect(cmd[0]).toBe('cwebp');
	});

	it('includes -q flag', () => {
		const cmd = buildCwebpCommand('/tmp/in.png', '/tmp/out.webp');
		expect(cmd).toContain('-q');
	});

	it('uses quality 82 as default', () => {
		const cmd = buildCwebpCommand('/tmp/in.png', '/tmp/out.webp');
		const qIdx = cmd.indexOf('-q');
		expect(qIdx).toBeGreaterThan(-1);
		expect(cmd[qIdx + 1]).toBe('82');
	});

	it('accepts a custom quality value', () => {
		const cmd = buildCwebpCommand('/tmp/in.png', '/tmp/out.webp', 70);
		const qIdx = cmd.indexOf('-q');
		expect(cmd[qIdx + 1]).toBe('70');
	});

	it('places input path as an argument', () => {
		const cmd = buildCwebpCommand('/tmp/photo.png', '/tmp/photo.webp');
		expect(cmd).toContain('/tmp/photo.png');
	});

	it('includes -o flag followed by output path', () => {
		const cmd = buildCwebpCommand('/tmp/in.png', '/tmp/out.webp');
		const oIdx = cmd.indexOf('-o');
		expect(oIdx).toBeGreaterThan(-1);
		expect(cmd[oIdx + 1]).toBe('/tmp/out.webp');
	});

	it('builds correct command for a jpeg input', () => {
		const cmd = buildCwebpCommand('/tmp/banner.jpg', '/tmp/banner.webp', 82);
		expect(cmd).toEqual(['cwebp', '-q', '82', '/tmp/banner.jpg', '-o', '/tmp/banner.webp']);
	});

	it('quality value is a string in the array', () => {
		const cmd = buildCwebpCommand('/tmp/in.png', '/tmp/out.webp', 90);
		const qIdx = cmd.indexOf('-q');
		expect(typeof cmd[qIdx + 1]).toBe('string');
	});
});
