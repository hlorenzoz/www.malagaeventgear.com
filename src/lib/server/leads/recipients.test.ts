import { afterEach, describe, expect, it, vi } from 'vitest';

// We test resolveRecipients by mocking the db query functions
// since we inject db as a parameter and the module imports named functions.

// Mock the db/queries module
vi.mock('$lib/server/db/queries', () => ({
	getActiveRecipientsByPackage: vi.fn(),
	getGlobalActiveRecipients: vi.fn(),
}));

import { getActiveRecipientsByPackage, getGlobalActiveRecipients } from '$lib/server/db/queries';
import { resolveRecipients } from './recipients';

// Minimal D1Database stub — only .prepare is called in queries (mocked away)
const mockDB = {} as unknown as D1Database;

afterEach(() => {
	vi.clearAllMocks();
});

describe('resolveRecipients — branch 1: package-scoped D1 rows', () => {
	it('returns package-scoped emails when D1 has matching rows', async () => {
		vi.mocked(getActiveRecipientsByPackage).mockResolvedValueOnce(['sales@meg.com']);

		const result = await resolveRecipients(mockDB, 'basic-mice', '');
		expect(result).toEqual(['sales@meg.com']);
		expect(getGlobalActiveRecipients).not.toHaveBeenCalled();
	});
});

describe('resolveRecipients — branch 2: global D1 rows fallback', () => {
	it('returns global emails when no package-scoped rows exist', async () => {
		vi.mocked(getActiveRecipientsByPackage).mockResolvedValueOnce([]);
		vi.mocked(getGlobalActiveRecipients).mockResolvedValueOnce(['global@meg.com']);

		const result = await resolveRecipients(mockDB, 'basic-mice', '');
		expect(result).toEqual(['global@meg.com']);
	});
});

describe('resolveRecipients — branch 3: env fallback', () => {
	it('returns env emails when D1 has no rows', async () => {
		vi.mocked(getActiveRecipientsByPackage).mockResolvedValueOnce([]);
		vi.mocked(getGlobalActiveRecipients).mockResolvedValueOnce([]);

		const result = await resolveRecipients(mockDB, 'basic-mice', 'a@meg.com, b@meg.com ');
		expect(result).toEqual(['a@meg.com', 'b@meg.com']);
	});

	it('trims whitespace from env emails', async () => {
		vi.mocked(getActiveRecipientsByPackage).mockResolvedValueOnce([]);
		vi.mocked(getGlobalActiveRecipients).mockResolvedValueOnce([]);

		const result = await resolveRecipients(mockDB, 'basic-mice', '  c@meg.com  ,  d@meg.com  ');
		expect(result).toEqual(['c@meg.com', 'd@meg.com']);
	});
});

describe('resolveRecipients — branch 4: empty fallback', () => {
	it('returns [] when all sources are empty', async () => {
		vi.mocked(getActiveRecipientsByPackage).mockResolvedValueOnce([]);
		vi.mocked(getGlobalActiveRecipients).mockResolvedValueOnce([]);

		const result = await resolveRecipients(mockDB, 'basic-mice', '');
		expect(result).toEqual([]);
	});
});
