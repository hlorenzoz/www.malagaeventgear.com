import { describe, expect, it } from 'vitest';
import { ContactInputSchema, LeadInputSchema } from './schema';

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

// ─── ContactInputSchema — lenient schema for the general contact form ─────────
//
// The contact form has no package and leaves phone/date optional, so it can't
// use LeadInputSchema. Only name, email, and message are required here.

const validContact = {
	name: 'Ana García',
	email: 'ana@example.com',
	message: 'I would like a quote for a wedding in August.',
};

describe('ContactInputSchema — happy path', () => {
	it('accepts the minimal payload (name + email + message)', () => {
		const result = ContactInputSchema.safeParse(validContact);
		expect(result.success).toBe(true);
	});

	it('phone, eventDate, eventType, turnstile and website are optional', () => {
		const result = ContactInputSchema.safeParse(validContact);
		expect(result.success).toBe(true);
		if (result.success) {
			expect(result.data.phone).toBe('');
			expect(result.data.eventDate).toBe('');
			expect(result.data.eventType).toBe('');
			expect(result.data['cf-turnstile-response']).toBe('');
			expect(result.data.website).toBe('');
		}
	});

	it('accepts a future eventDate when provided', () => {
		const result = ContactInputSchema.safeParse({ ...validContact, eventDate: tomorrow });
		expect(result.success).toBe(true);
	});
});

describe('ContactInputSchema — sad paths', () => {
	it('rejects missing name', () => {
		const result = ContactInputSchema.safeParse({ ...validContact, name: '' });
		expect(result.success).toBe(false);
	});

	it('rejects invalid email', () => {
		const result = ContactInputSchema.safeParse({ ...validContact, email: 'nope' });
		expect(result.success).toBe(false);
	});

	it('rejects missing message', () => {
		const result = ContactInputSchema.safeParse({ ...validContact, message: '' });
		expect(result.success).toBe(false);
	});

	it('rejects a past eventDate when one is provided', () => {
		const result = ContactInputSchema.safeParse({ ...validContact, eventDate: yesterday });
		expect(result.success).toBe(false);
	});

	it('rejects message longer than 2000 chars', () => {
		const result = ContactInputSchema.safeParse({ ...validContact, message: 'a'.repeat(2001) });
		expect(result.success).toBe(false);
	});
});
