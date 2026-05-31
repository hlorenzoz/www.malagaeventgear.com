/**
 * Vitest unit tests for reviews/sequence.ts
 * Pure function — no I/O, no mocks needed.
 *
 * Sequence rules (from design.md + spec REQ-45–47):
 *  - next_send_at > now  → skip (not due yet)
 *  - clicked_at != null  → stop (user already clicked)
 *  - send_count >= max_sends → stop (exhausted)
 *  - otherwise          → send, with next_send_at += 2 days
 */
import { describe, it, expect } from 'vitest';
import { resolveAction } from './sequence';

// Helper: build a ReviewRequest with sensible defaults
function req(overrides: Partial<Parameters<typeof resolveAction>[0]> = {}): Parameters<typeof resolveAction>[0] {
	return {
		next_send_at: new Date(Date.now() - 60_000).toISOString(), // 1 min ago = due
		send_count: 0,
		max_sends: 3,
		clicked_at: null,
		...overrides,
	};
}

const NOW = new Date('2026-06-10T10:00:00Z');

describe('resolveAction', () => {
	it('returns skip when next_send_at is in the future', () => {
		const r = req({ next_send_at: '2026-06-11T10:00:00Z' });
		expect(resolveAction(r, NOW).kind).toBe('skip');
	});

	it('returns skip when next_send_at equals exactly now (not strictly less)', () => {
		const r = req({ next_send_at: NOW.toISOString() });
		// next_send_at === now is NOT past → skip
		expect(resolveAction(r, NOW).kind).toBe('skip');
	});

	it('returns send when next_send_at is in the past and send_count < max_sends', () => {
		const r = req({ next_send_at: '2026-06-09T10:00:00Z', send_count: 0, max_sends: 3 });
		const action = resolveAction(r, NOW);
		expect(action.kind).toBe('send');
	});

	it('send action includes next_send_at exactly 2 days later', () => {
		const r = req({ next_send_at: '2026-06-09T10:00:00Z', send_count: 0 });
		const action = resolveAction(r, NOW);
		if (action.kind !== 'send') throw new Error('expected send');
		const next = new Date(action.next_send_at);
		// Should be 2 days after the CURRENT next_send_at (D+1 → D+3, D+3 → D+5)
		const expected = new Date('2026-06-11T10:00:00Z');
		expect(next.toISOString()).toBe(expected.toISOString());
	});

	it('returns stop when send_count === max_sends', () => {
		const r = req({ send_count: 3, max_sends: 3 });
		expect(resolveAction(r, NOW).kind).toBe('stop');
	});

	it('returns stop when send_count > max_sends (safety guard)', () => {
		const r = req({ send_count: 5, max_sends: 3 });
		expect(resolveAction(r, NOW).kind).toBe('stop');
	});

	it('returns stop when clicked_at is set (regardless of send_count)', () => {
		const r = req({ clicked_at: '2026-06-09T15:00:00Z', send_count: 1 });
		expect(resolveAction(r, NOW).kind).toBe('stop');
	});

	it('returns stop when clicked_at is set even if not yet due', () => {
		const r = req({
			clicked_at: '2026-06-09T15:00:00Z',
			next_send_at: '2026-06-12T10:00:00Z', // future
			send_count: 0,
		});
		expect(resolveAction(r, NOW).kind).toBe('stop');
	});

	it('D+1 scenario: first send fires on scheduled date', () => {
		// Event was 2026-06-09, review_request.next_send_at = 2026-06-10T00:00:00Z
		const r = req({ next_send_at: '2026-06-10T00:00:00Z', send_count: 0 });
		const action = resolveAction(r, NOW); // NOW = 2026-06-10T10:00:00Z
		expect(action.kind).toBe('send');
	});

	it('D+3 scenario: second send scheduled correctly', () => {
		// After D+1 send, next_send_at was set to D+3 = 2026-06-12T00:00:00Z
		const r = req({ next_send_at: '2026-06-12T00:00:00Z', send_count: 1 });
		const now = new Date('2026-06-12T10:00:00Z');
		const action = resolveAction(r, now);
		expect(action.kind).toBe('send');
		if (action.kind !== 'send') throw new Error();
		// D+3 → D+5: next_send_at advances 2 more days
		const next = new Date(action.next_send_at);
		expect(next.toISOString()).toBe('2026-06-14T00:00:00.000Z');
	});

	it('3rd send (send_count=2): fires, returns stop-after (no next_send_at needed, but returns one)', () => {
		const r = req({ next_send_at: '2026-06-14T00:00:00Z', send_count: 2, max_sends: 3 });
		const now = new Date('2026-06-14T10:00:00Z');
		const action = resolveAction(r, now);
		// send_count (2) < max_sends (3) → should send
		expect(action.kind).toBe('send');
	});

	it('after 3rd send: stop (send_count becomes 3 = max_sends, next cron call stops)', () => {
		// Simulate state AFTER the 3rd send was processed: send_count=3
		const r = req({ next_send_at: '2026-06-16T00:00:00Z', send_count: 3, max_sends: 3 });
		const now = new Date('2026-06-16T10:00:00Z');
		expect(resolveAction(r, now).kind).toBe('stop');
	});

	it('gap day: next_send_at not reached → skip (D+2 when first was D+1, before D+3)', () => {
		// D+1 send done. Now it's D+2 (gap day). next_send_at = D+3.
		const r = req({ next_send_at: '2026-06-13T00:00:00Z', send_count: 1 });
		const now = new Date('2026-06-12T10:00:00Z'); // D+2
		expect(resolveAction(r, now).kind).toBe('skip');
	});
});
