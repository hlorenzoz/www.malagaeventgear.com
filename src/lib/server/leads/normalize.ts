import type { LeadInput } from './schema';

/**
 * Normalizes a validated LeadInput:
 * - Trims all string fields
 * - Lowercases email
 * - Leaves phone as-is (already formatted by PhoneInput as E.164)
 *
 * PURE: no I/O, no side effects. Unit-testable without mocks.
 */
export function normalizeLead(raw: LeadInput): LeadInput {
	return {
		...raw,
		name: raw.name.trim(),
		email: raw.email.trim().toLowerCase(),
		phone: raw.phone.trim(),
		eventDate: raw.eventDate.trim(),
		comments: (raw.comments ?? '').trim(),
		packageId: raw.packageId.trim(),
	};
}
