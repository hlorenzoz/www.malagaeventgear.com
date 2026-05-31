import { describe, expect, it } from 'vitest';
import { normalizeLead } from './normalize';
import type { LeadInput } from './schema';

const tomorrow = (() => {
	const d = new Date();
	d.setDate(d.getDate() + 1);
	return d.toISOString().slice(0, 10);
})();

function base(overrides: Partial<LeadInput> = {}): LeadInput {
	return {
		packageId: 'basic-mice',
		name: 'Juan Pérez',
		email: 'juan@example.com',
		phone: '+34600000000',
		eventDate: tomorrow,
		comments: '',
		'cf-turnstile-response': '',
		website: '',
		...overrides,
	};
}

describe('normalizeLead', () => {
	it('trims whitespace from name', () => {
		const result = normalizeLead(base({ name: '  Ana García  ' }));
		expect(result.name).toBe('Ana García');
	});

	it('lowercases and trims email', () => {
		const result = normalizeLead(base({ email: '  JUAN@EXAMPLE.COM  ' }));
		expect(result.email).toBe('juan@example.com');
	});

	it('trims whitespace from packageId', () => {
		const result = normalizeLead(base({ packageId: '  basic-mice  ' }));
		expect(result.packageId).toBe('basic-mice');
	});

	it('trims comments', () => {
		const result = normalizeLead(base({ comments: '  need extras   ' }));
		expect(result.comments).toBe('need extras');
	});

	it('passes phone through as-is (already E.164 from PhoneInput)', () => {
		const result = normalizeLead(base({ phone: '+34600123456' }));
		expect(result.phone).toBe('+34600123456');
	});
});
