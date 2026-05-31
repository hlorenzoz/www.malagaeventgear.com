# Capability Spec: lead-email-lifecycle

> Source change: package-lead-capture-cro
> Archived: 2026-05-31
> Status: implemented

## Purpose

Resend-powered email dispatch on lead submission: bilingual confirmation to the lead, internal notification to recipients, and review_request row creation for the post-event reminder sequence.

---

## Requirements

**REQ-34** On a successful lead insert (HTTP 201 path), the server MUST send two emails via Resend:
  1. A confirmation email to the lead's email address.
  2. An internal notification email to all active recipients.

**REQ-35** Recipients MUST be resolved in this order:
  1. Query `recipients WHERE package_id = ? AND active = 1` (slug-scoped).
  2. If empty: `recipients WHERE package_id IS NULL AND active = 1` (global).
  3. If still empty: parse `LEAD_NOTIFY_EMAILS` (comma-separated) from env.
  4. If all empty: log warning, skip notification (do not fail the request).

> NOTE: `recipients.package_id` holds slug strings (W-03), not opaque IDs. Consistent with `leads.package_slug`.

**REQ-36** Confirmation email locale MUST match the lead's `lang` field. Internal notification MAY be fixed to `en`.

**REQ-37** Email templates MUST be TypeScript functions returning an HTML string. No runtime template engine incompatible with Cloudflare Workers. Templates MUST be unit-testable without sending real emails.

**REQ-38** Each email attempt MUST produce an `email_messages` row: `status='sent'` on success, `status='failed'` on Resend error. Email failure MUST NOT roll back the lead insert. HTTP 201 is still returned.

**REQ-39** A `review_requests` row MUST be created on successful lead insert with:
  - `next_send_at` = event_date + 1 day (D+1 UTC)
  - `token` = cryptographically random URL-safe token (≥ 32 bytes entropy, `crypto.getRandomValues`)
  - GMB URL from `src/lib/data/site.ts`
  - `send_count = 0`, `max_sends = 3`

**REQ-40** A `lead_events` row with `step='email_sent'` MUST be inserted for each successfully dispatched email.

## Scenarios

```
Given a valid lead is persisted in D1
When the email lifecycle runs
Then a confirmation email is sent to the lead's email address via Resend
And an internal notification email is sent to all active recipients
And two email_messages rows are written with status='sent'
And two lead_events rows with step='email_sent' are written
And a review_requests row is created with next_send_at = event_date + 1

Given the recipients D1 table is empty and LEAD_NOTIFY_EMAILS='a@b.com,c@d.com'
When the recipients resolver runs
Then both a@b.com and c@d.com are used as notification recipients

Given the recipients D1 table is empty and LEAD_NOTIFY_EMAILS is also empty
When the recipients resolver runs
Then no notification email is sent
And the lead insert and confirmation email proceed without error

Given Resend returns an API error for the confirmation email
When the email dispatch runs
Then the email_messages row is written with status='failed'
And the lead row in D1 is NOT rolled back
And HTTP 201 is still returned to the client

Given the lead locale is 'es'
When the confirmation email template is rendered
Then the subject and body text are in Spanish
```

## Implementation Notes

- Files:
  - `src/lib/server/email/resend.ts` — fetch-based Resend REST wrapper (no SDK)
  - `src/lib/server/email/templates/confirmation.ts` — `renderConfirmation(lead, lang) → { subject, html }`
  - `src/lib/server/email/templates/notification.ts` — `renderNotification(lead, packageName) → { subject, html }`
  - `src/lib/server/email/templates/review.ts` — `renderReview(token, lang, siteUrl) → { subject, html }`
  - `src/lib/server/leads/recipients.ts` — resolution cascade
  - `src/lib/server/leads/service.ts` — orchestration
- Resend endpoint: `https://api.resend.com/emails` (POST, Bearer auth)
- All Resend calls mocked in Vitest (`vi.mock` / `vi.fn()`); no real API calls in tests
