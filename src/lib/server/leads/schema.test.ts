import { describe, expect, it } from 'vitest';
import { LeadInputSchema } from './schema';

const tomorrow = (() => {
	const d = new Date();
	d.setDate(d.getDate() + 1);
	return d.toISOString().slice(0, 10);
})();

const yesterday = (() => {
	const d = new Date();
	d.setDate(d.getDate() - 1);
	return d.toISOString().slice(0, 10);
})();

const validPayload = {
	packageId: 'basic-mice',
	name: 'Ana García',
	email: 'ana@example.com',
	phone: '+34600000000',
	eventDate: tomorrow,
	comments: 'Need sound system',
	'cf-turnstile-response': 'token123',
	website: '',
};

describe('LeadInputSchema — happy path', () => {
	it('accepts valid payload', () => {
		const result = LeadInputSchema.safeParse(validPayload);
		expect(result.success).toBe(true);
	});

	it('comments, turnstile, and website are optional (default to empty string)', () => {
		const { comments, 'cf-turnstile-response': _ts, website: _w, ...rest } = validPayload;
		const result = LeadInputSchema.safeParse(rest);
		expect(result.success).toBe(true);
		if (result.success) {
			expect(result.data.comments).toBe('');
			expect(result.data['cf-turnstile-response']).toBe('');
			expect(result.data.website).toBe('');
		}
	});
});

describe('LeadInputSchema — sad paths', () => {
	it('rejects missing name', () => {
		const result = LeadInputSchema.safeParse({ ...validPayload, name: '' });
		expect(result.success).toBe(false);
	});

	it('rejects invalid email', () => {
		const result = LeadInputSchema.safeParse({ ...validPayload, email: 'not-an-email' });
		expect(result.success).toBe(false);
	});

	it('rejects missing packageId', () => {
		const result = LeadInputSchema.safeParse({ ...validPayload, packageId: '' });
		expect(result.success).toBe(false);
	});

	it('rejects past event date', () => {
		const result = LeadInputSchema.safeParse({ ...validPayload, eventDate: yesterday });
		expect(result.success).toBe(false);
	});

	it('rejects today as event date (must be strictly future)', () => {
		const today = new Date().toISOString().slice(0, 10);
		const result = LeadInputSchema.safeParse({ ...validPayload, eventDate: today });
		expect(result.success).toBe(false);
	});

	it('rejects comments longer than 1000 chars', () => {
		const result = LeadInputSchema.safeParse({ ...validPayload, comments: 'a'.repeat(1001) });
		expect(result.success).toBe(false);
	});
});
