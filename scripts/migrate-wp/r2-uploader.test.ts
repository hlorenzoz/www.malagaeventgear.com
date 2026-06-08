/**
 * Unit tests for r2-uploader pure functions.
 * Tests command construction — NOT the actual Bun.spawn upload.
 */
import { describe, it, expect } from 'vitest';
import { buildWranglerCommand, buildCdnUrl } from './r2-uploader';

const CDN_BASE = 'https://cdn.malagaeventgear.com';
const R2_BUCKET = 'images';

describe('buildWranglerCommand', () => {
	it('includes bunx wrangler r2 object put', () => {
		const cmd = buildWranglerCommand('42/photo.jpg', '/tmp/photo.jpg');
		expect(cmd[0]).toBe('bunx');
		expect(cmd[1]).toBe('wrangler');
		expect(cmd.slice(2, 5)).toEqual(['r2', 'object', 'put']);
	});

	it('includes the r2 key with bucket prefix', () => {
		const cmd = buildWranglerCommand('42/photo.jpg', '/tmp/photo.jpg');
		expect(cmd).toContain(`${R2_BUCKET}/42/photo.jpg`);
	});

	it('includes --file and the temp file path', () => {
		const cmd = buildWranglerCommand('42/photo.jpg', '/tmp/test.jpg');
		const fileIdx = cmd.indexOf('--file');
		expect(fileIdx).toBeGreaterThan(-1);
		expect(cmd[fileIdx + 1]).toBe('/tmp/test.jpg');
	});

	it('includes --remote flag', () => {
		const cmd = buildWranglerCommand('42/photo.jpg', '/tmp/photo.jpg');
		expect(cmd).toContain('--remote');
	});

	it('builds correct command for nested r2 key', () => {
		const cmd = buildWranglerCommand('99/banner-300x200.jpg', '/tmp/img.jpg');
		expect(cmd).toContain(`${R2_BUCKET}/99/banner-300x200.jpg`);
	});
});

describe('buildCdnUrl', () => {
	it('returns CDN URL for an r2 key', () => {
		const url = buildCdnUrl('42/photo.jpg');
		expect(url).toBe(`${CDN_BASE}/42/photo.jpg`);
	});

	it('handles nested paths', () => {
		const url = buildCdnUrl('99/sub/banner.webp');
		expect(url).toBe(`${CDN_BASE}/99/sub/banner.webp`);
	});
});
