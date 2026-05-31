# Capability Spec: review-reminder-sequence

> Source change: package-lead-capture-cro
> Archived: 2026-05-31
> Status: implemented

## Purpose

Post-event review request sequence: tracked redirect endpoint that records GMB link clicks, and a standalone Cloudflare Worker with cron trigger that sends up to 3 bilingual reminder emails at D+1, D+3, D+5.

---

## Requirements

### Tracked Redirect (/r/[token]/)

**REQ-41** The route `/r/[token]/` MUST be implemented in `src/routes/r/[token]/+server.ts` as a server-only GET handler (`prerender = false`).

**REQ-42** Given a valid token, the handler MUST:
  1. Look up the `review_requests` row by token.
  2. Set `clicked_at = now()` on the row (if found and not already clicked).
  3. Insert a `lead_events` row with `step='review_clicked'`.
  4. Return HTTP 302 to the `gmb_url` from `src/lib/data/site.ts`.

> ACCEPTED DEVIATION (W-01): The implementation always returns 302 regardless of token validity or prior click. This is a UX-driven override — no user is ever blocked from leaving a review. Data integrity is maintained: `clicked_at` only updates when the row is found and `clicked_at IS NULL`.

**REQ-43** The tracked redirect MUST use a server-side 302 (no client-side redirect).

### Review Reminder Worker

**REQ-44** A standalone Cloudflare Worker MUST exist at `workers/review-reminders/` with:
  - Cron trigger: `0 10 * * *` (10:00 UTC daily)
  - D1 binding `DB` (same database as main app)
  - Secrets: `RESEND_API_KEY`, `RESEND_FROM`
  - Var: `PUBLIC_SITE_URL`

**REQ-45** On each cron invocation the Worker MUST:
  1. Query `review_requests WHERE next_send_at <= now AND send_count < max_sends AND clicked_at IS NULL`.
  2. For each row: `resolveAction(req, now)` → if `send`, send email, increment `send_count`, update `next_send_at`.
  3. Insert `lead_events(step='review_email_sent')`.
  4. Insert `email_messages(kind='review_reminder')`.

**REQ-46** Stop conditions: `send_count >= max_sends` OR `clicked_at IS NOT NULL`.

**REQ-47** Schedule: D+1, D+3, D+5 relative to event date (`next_send_at` advances by 2 days after each send; `max_sends = 3`).

**REQ-48** Worker MUST use Web APIs only. No Node.js built-ins.

**REQ-49** Review email template MUST be bilingual. Locale read from `leads.lang`.

### Sequence Logic Contract

```ts
export type ReviewRequest = {
  next_send_at: string; // ISO UTC
  send_count: number;
  max_sends: number;
  clicked_at: string | null;
};
export type SequenceAction =
  | { kind: 'stop' }
  | { kind: 'skip' }
  | { kind: 'send'; next_send_at: string };

export function resolveAction(req: ReviewRequest, now: Date): SequenceAction
```

Pure function. Unit-testable without D1 or fetch.

## Scenarios

```
Given a review_requests row with next_send_at = today, send_count=0, clicked_at=null
When the cron Worker runs
Then a review-request email is sent to the lead's email
And send_count is incremented to 1
And next_send_at advances by 2 days
And a lead_events row with step='review_email_sent' is inserted
And an email_messages row with kind='review_reminder' is inserted

Given a review_requests row with send_count=3 (max_sends=3)
When the cron Worker runs
Then no email is sent for that row

Given a review_requests row where clicked_at is not null
When the cron Worker runs
Then no email is sent for that row

Given a lead with lang='es'
When the review-request email is rendered
Then the subject and body text are in Spanish

Given a GET /r/{validToken}
When the handler processes the request
Then clicked_at is set on the review_requests row (if null)
And a lead_events row with step='review_clicked' is inserted
And the response is HTTP 302 to the GMB URL
```

## Implementation Notes

- Files:
  - `src/routes/r/[token]/+server.ts` — tracked redirect
  - `src/lib/server/reviews/sequence.ts` — pure `resolveAction`
  - `workers/review-reminders/src/index.ts` — `scheduled()` handler
  - `workers/review-reminders/wrangler.toml` — own config, cron, D1 binding
  - `workers/review-reminders/tsconfig.json` — path alias `$lib/*` → `../../src/lib/*`
- Two deploy targets: root `wrangler.toml` (main app) + `workers/review-reminders/wrangler.toml` (cron Worker)
- `database_id` in `workers/review-reminders/wrangler.toml` is a placeholder — replace with output of `wrangler d1 create meg-leads`
- Pre-deploy checklist: see `docs/lead-capture-deployment.md`
