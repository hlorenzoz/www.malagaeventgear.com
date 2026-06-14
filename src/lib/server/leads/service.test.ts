import { afterEach, describe, expect, it, vi } from 'vitest';

// Mock the db/queries module to avoid needing a real D1 instance
vi.mock('$lib/server/db/queries', () => ({
	insertLead: vi.fn(),
	insertLeadEvent: vi.fn(),
	insertReviewRequest: vi.fn(),
	insertEmailMessage: vi.fn(),
}));

vi.mock('$lib/server/leads/recipients', () => ({
	resolveRecipients: vi.fn(),
}));

vi.mock('$lib/server/email/resend', () => ({
	sendEmail: vi.fn(),
}));

import { insertLead, insertLeadEvent, insertReviewRequest, insertEmailMessage } from '$lib/server/db/queries';
import { resolveRecipients } from '$lib/server/leads/recipients';
import { sendEmail } from '$lib/server/email/resend';
import { submitLead } from './service';
import type { LeadInput } from './schema';

const mockDB = {} as unknown as D1Database;

const mockEnv = {
	RESEND_API_KEY: 're_test_key',
	RESEND_FROM: 'MEG <hola@malagaeventgear.com>',
	LEAD_NOTIFY_EMAILS: 'team@meg.com',
	PUBLIC_SITE_URL: 'https://malagaeventgear.com',
} as unknown as App.Platform['env'];

const tomorrow = (() => {
	const d = new Date();
	d.setDate(d.getDate() + 1);
	return d.toISOString().slice(0, 10);
})();

function validInput(overrides: Partial<LeadInput> = {}): LeadInput {
	return {
		packageId: 'basic-mice',
		name: 'Ana García',
		email: 'ana@example.com',
		phone: '+34600000000',
		eventDate: tomorrow,
		comments: 'Need fog machine',
		'cf-turnstile-response': 'token',
		website: '',
		...overrides,
	};
}

afterEach(() => {
	vi.clearAllMocks();
});

// ─── Phase 2 tests (preserved) ───────────────────────────────────────────────

describe('submitLead — happy path', () => {
	it('inserts lead row and returns leadId', async () => {
		vi.mocked(insertLead).mockResolvedValueOnce('lead-uuid-123');
		vi.mocked(insertLeadEvent).mockResolvedValue('event-uuid');
		vi.mocked(insertReviewRequest).mockResolvedValueOnce('rr-uuid-789');
		vi.mocked(resolveRecipients).mockResolvedValueOnce(['team@meg.com']);
		vi.mocked(sendEmail).mockResolvedValue({ id: 'resend-id' });
		vi.mocked(insertEmailMessage).mockResolvedValue('em-uuid');

		const result = await submitLead(mockDB, validInput(), 'es', '1.2.3.4', mockEnv);

		expect(result.leadId).toBe('lead-uuid-123');
		expect(insertLead).toHaveBeenCalledOnce();
		expect(insertLead).toHaveBeenCalledWith(
			mockDB,
			expect.objectContaining({
				package_slug: 'basic-mice',
				name: 'Ana García',
				email: 'ana@example.com',
				lang: 'es',
				status: 'new',
			}),
		);
	});

	it('inserts submitted lead_event with ip in meta JSON', async () => {
		vi.mocked(insertLead).mockResolvedValueOnce('lead-uuid-123');
		vi.mocked(insertLeadEvent).mockResolvedValue('event-uuid');
		vi.mocked(insertReviewRequest).mockResolvedValueOnce('rr-uuid-789');
		vi.mocked(resolveRecipients).mockResolvedValueOnce(['team@meg.com']);
		vi.mocked(sendEmail).mockResolvedValue({ id: 'resend-id' });
		vi.mocked(insertEmailMessage).mockResolvedValue('em-uuid');

		await submitLead(mockDB, validInput(), 'es', '10.0.0.1', mockEnv);

		expect(insertLeadEvent).toHaveBeenCalledWith(
			mockDB,
			expect.objectContaining({
				lead_id: 'lead-uuid-123',
				step: 'submitted',
				meta: expect.stringContaining('"ip":"10.0.0.1"'),
			}),
		);
	});

	it('creates review_request when event_date is provided', async () => {
		vi.mocked(insertLead).mockResolvedValueOnce('lead-uuid-123');
		vi.mocked(insertLeadEvent).mockResolvedValue('event-uuid');
		vi.mocked(insertReviewRequest).mockResolvedValueOnce('rr-uuid-789');
		vi.mocked(resolveRecipients).mockResolvedValueOnce(['team@meg.com']);
		vi.mocked(sendEmail).mockResolvedValue({ id: 'resend-id' });
		vi.mocked(insertEmailMessage).mockResolvedValue('em-uuid');

		await submitLead(mockDB, validInput(), 'es', '1.2.3.4', mockEnv);

		expect(insertReviewRequest).toHaveBeenCalledOnce();
		expect(insertReviewRequest).toHaveBeenCalledWith(
			mockDB,
			expect.objectContaining({
				lead_id: 'lead-uuid-123',
				event_date: tomorrow,
			}),
		);
	});

	it('skips review_request when no event_date', async () => {
		vi.mocked(insertLead).mockResolvedValueOnce('lead-uuid-noevent');
		vi.mocked(insertLeadEvent).mockResolvedValue('event-uuid');
		vi.mocked(resolveRecipients).mockResolvedValueOnce([]);
		vi.mocked(sendEmail).mockResolvedValue({ id: 'resend-id' });
		vi.mocked(insertEmailMessage).mockResolvedValue('em-uuid');

		const inputNoDate = validInput({ eventDate: '' as unknown as string });
		await submitLead(mockDB, inputNoDate, 'es', '1.2.3.4', mockEnv);

		expect(insertReviewRequest).not.toHaveBeenCalled();
	});
});

// ─── Phase 3 tests ───────────────────────────────────────────────────────────

describe('submitLead — email lifecycle', () => {
	it('sends 2 emails (confirmation + notification) on happy path', async () => {
		vi.mocked(insertLead).mockResolvedValueOnce('lead-uuid-123');
		vi.mocked(insertLeadEvent).mockResolvedValue('event-uuid');
		vi.mocked(insertReviewRequest).mockResolvedValue('rr-uuid');
		vi.mocked(resolveRecipients).mockResolvedValueOnce(['team@meg.com']);
		vi.mocked(sendEmail).mockResolvedValue({ id: 'resend-id' });
		vi.mocked(insertEmailMessage).mockResolvedValue('em-uuid');

		await submitLead(mockDB, validInput(), 'es', '1.2.3.4', mockEnv);

		expect(sendEmail).toHaveBeenCalledTimes(2);
	});

	it('writes email_messages rows for each send', async () => {
		vi.mocked(insertLead).mockResolvedValueOnce('lead-uuid-123');
		vi.mocked(insertLeadEvent).mockResolvedValue('event-uuid');
		vi.mocked(insertReviewRequest).mockResolvedValue('rr-uuid');
		vi.mocked(resolveRecipients).mockResolvedValueOnce(['team@meg.com']);
		vi.mocked(sendEmail).mockResolvedValue({ id: 'resend-abc' });
		vi.mocked(insertEmailMessage).mockResolvedValue('em-uuid');

		await submitLead(mockDB, validInput(), 'es', '1.2.3.4', mockEnv);

		expect(insertEmailMessage).toHaveBeenCalledTimes(2);
		expect(insertEmailMessage).toHaveBeenCalledWith(
			mockDB,
			expect.objectContaining({ lead_id: 'lead-uuid-123', status: 'sent' }),
		);
	});

	it('does NOT roll back lead when sendEmail throws', async () => {
		vi.mocked(insertLead).mockResolvedValueOnce('lead-uuid-err');
		vi.mocked(insertLeadEvent).mockResolvedValue('event-uuid');
		vi.mocked(insertReviewRequest).mockResolvedValue('rr-uuid');
		vi.mocked(resolveRecipients).mockResolvedValueOnce(['team@meg.com']);
		vi.mocked(sendEmail).mockRejectedValue(new Error('Resend error 500: Internal'));
		vi.mocked(insertEmailMessage).mockResolvedValue('em-uuid');

		const result = await submitLead(mockDB, validInput(), 'es', '1.2.3.4', mockEnv);

		// Lead still returned despite email failure
		expect(result.leadId).toBe('lead-uuid-err');
		// email_messages row written with status='failed'
		expect(insertEmailMessage).toHaveBeenCalledWith(
			mockDB,
			expect.objectContaining({ status: 'failed' }),
		);
	});

	it('writes email_sent lead_events for each sent email', async () => {
		vi.mocked(insertLead).mockResolvedValueOnce('lead-uuid-123');
		vi.mocked(insertLeadEvent).mockResolvedValue('event-uuid');
		vi.mocked(insertReviewRequest).mockResolvedValue('rr-uuid');
		vi.mocked(resolveRecipients).mockResolvedValueOnce(['team@meg.com']);
		vi.mocked(sendEmail).mockResolvedValue({ id: 'resend-id' });
		vi.mocked(insertEmailMessage).mockResolvedValue('em-uuid');

		await submitLead(mockDB, validInput(), 'es', '1.2.3.4', mockEnv);

		// submitted (1) + email_sent (2) = at least 3 lead_events
		const emailSentCalls = vi.mocked(insertLeadEvent).mock.calls.filter(
			([, params]) => params.step === 'email_sent',
		);
		expect(emailSentCalls).toHaveLength(2);
	});

	it('skips notification send when no recipients', async () => {
		vi.mocked(insertLead).mockResolvedValueOnce('lead-uuid-123');
		vi.mocked(insertLeadEvent).mockResolvedValue('event-uuid');
		vi.mocked(insertReviewRequest).mockResolvedValue('rr-uuid');
		vi.mocked(resolveRecipients).mockResolvedValueOnce([]); // no recipients
		vi.mocked(sendEmail).mockResolvedValue({ id: 'resend-id' });
		vi.mocked(insertEmailMessage).mockResolvedValue('em-uuid');

		await submitLead(mockDB, validInput(), 'es', '1.2.3.4', mockEnv);

		// Only confirmation sent, not notification
		expect(sendEmail).toHaveBeenCalledTimes(1);
	});
});

// ─── Regression: missing email configuration (the prod incident) ─────────────
//
// When RESEND_API_KEY (a Worker secret) is not set, the whole email lifecycle
// is skipped. The lead must still be created (REQ-38), but the skip must be
// LOUD — otherwise the failure is invisible, exactly what happened in prod
// when the secret was missing on the deployed Worker.

describe('submitLead — missing email configuration', () => {
	const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

	afterEach(() => {
		errorSpy.mockClear();
	});

	function envWithout(key: 'RESEND_API_KEY' | 'RESEND_FROM') {
		const e = { ...(mockEnv as Record<string, unknown>) };
		delete e[key];
		return e as unknown as App.Platform['env'];
	}

	it('still creates the lead when RESEND_API_KEY is missing', async () => {
		vi.mocked(insertLead).mockResolvedValueOnce('lead-uuid-nokey');
		vi.mocked(insertLeadEvent).mockResolvedValue('event-uuid');
		vi.mocked(insertReviewRequest).mockResolvedValue('rr-uuid');

		const result = await submitLead(mockDB, validInput(), 'es', '1.2.3.4', envWithout('RESEND_API_KEY'));

		expect(result.leadId).toBe('lead-uuid-nokey');
	});

	it('does NOT attempt any email send when RESEND_API_KEY is missing', async () => {
		vi.mocked(insertLead).mockResolvedValueOnce('lead-uuid-nokey');
		vi.mocked(insertLeadEvent).mockResolvedValue('event-uuid');
		vi.mocked(insertReviewRequest).mockResolvedValue('rr-uuid');

		await submitLead(mockDB, validInput(), 'es', '1.2.3.4', envWithout('RESEND_API_KEY'));

		expect(sendEmail).not.toHaveBeenCalled();
		expect(insertEmailMessage).not.toHaveBeenCalled();
	});

	it('logs a loud error naming RESEND_API_KEY when the secret is missing', async () => {
		vi.mocked(insertLead).mockResolvedValueOnce('lead-uuid-nokey');
		vi.mocked(insertLeadEvent).mockResolvedValue('event-uuid');
		vi.mocked(insertReviewRequest).mockResolvedValue('rr-uuid');

		await submitLead(mockDB, validInput(), 'es', '1.2.3.4', envWithout('RESEND_API_KEY'));

		expect(errorSpy).toHaveBeenCalled();
		const logged = errorSpy.mock.calls.flat().join(' ');
		expect(logged).toContain('RESEND_API_KEY');
	});

	it('logs a loud error naming RESEND_FROM when it is missing', async () => {
		vi.mocked(insertLead).mockResolvedValueOnce('lead-uuid-nofrom');
		vi.mocked(insertLeadEvent).mockResolvedValue('event-uuid');
		vi.mocked(insertReviewRequest).mockResolvedValue('rr-uuid');

		await submitLead(mockDB, validInput(), 'es', '1.2.3.4', envWithout('RESEND_FROM'));

		expect(sendEmail).not.toHaveBeenCalled();
		const logged = errorSpy.mock.calls.flat().join(' ');
		expect(logged).toContain('RESEND_FROM');
	});
});
