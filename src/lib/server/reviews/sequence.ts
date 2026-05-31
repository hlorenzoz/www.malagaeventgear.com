/**
 * reviews/sequence.ts — PURE sequence decision function.
 * No I/O, no D1, no fetch. Unit-testable with Vitest.
 *
 * Contract (design.md):
 *   resolveAction(req, now) → SequenceAction
 *
 * Rules (REQ-45, REQ-46, REQ-47):
 *  - clicked_at != null            → stop (user clicked the review link)
 *  - send_count >= max_sends       → stop (max reminders exhausted)
 *  - next_send_at > now            → skip (not due yet; strictly greater)
 *  - otherwise                     → send; next_send_at advances +2 days
 *
 * The D+1 / D+3 / D+5 cadence comes naturally from:
 *  - review_request row created with next_send_at = event_date + 1 day
 *  - each send action bumps next_send_at by +2 days
 */

export interface ReviewRequest {
	next_send_at: string; // ISO 8601 UTC
	send_count: number;
	max_sends: number;
	clicked_at: string | null;
}

export type SequenceAction =
	| { kind: 'stop' }
	| { kind: 'skip' }
	| { kind: 'send'; next_send_at: string };

export function resolveAction(req: ReviewRequest, now: Date): SequenceAction {
	// Priority 1: user already clicked → stop the sequence entirely
	if (req.clicked_at !== null) {
		return { kind: 'stop' };
	}

	// Priority 2: max sends exhausted → stop
	if (req.send_count >= req.max_sends) {
		return { kind: 'stop' };
	}

	// Priority 3: not yet due — next_send_at must be STRICTLY before now
	const due = new Date(req.next_send_at);
	if (due >= now) {
		return { kind: 'skip' };
	}

	// Due and under limit → send. Advance next_send_at by +2 days.
	const nextDate = new Date(due.getTime());
	nextDate.setDate(nextDate.getDate() + 2);

	return { kind: 'send', next_send_at: nextDate.toISOString() };
}
