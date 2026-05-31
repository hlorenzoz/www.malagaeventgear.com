# Capability Spec: lead-persistence

> Source change: package-lead-capture-cro
> Archived: 2026-05-31
> Status: implemented

## Purpose

Cloudflare D1 database schema, server lib modules, and POST `/api/leads` endpoint for capturing and persisting leads with rate-limiting, honeypot, and Turnstile verification.

---

## Requirements

### D1 Schema

**REQ-24** The D1 database bound as `DB` MUST contain the following tables after migrations are applied.

> NOTE: design.md column names are authoritative (verified W-02). spec.md used advisory labels that differ in 4 columns:

| spec.md label | Actual column name | Table |
|---|---|---|
| `package_id` | `package_slug` | `leads` |
| `locale` | `lang` | `leads` |
| `attempts` | `send_count` | `review_requests` |
| `scheduled_date` | `next_send_at` | `review_requests` |

**`leads`**

| Column | Type | Constraints |
|---|---|---|
| id | TEXT | PRIMARY KEY (UUID) |
| package_slug | TEXT | NOT NULL |
| name | TEXT | NOT NULL |
| email | TEXT | NOT NULL |
| phone | TEXT | |
| event_date | TEXT | (ISO 8601 date) |
| message | TEXT | |
| lang | TEXT | NOT NULL DEFAULT 'es' |
| status | TEXT | NOT NULL DEFAULT 'new' |
| created_at | TEXT | NOT NULL (ISO 8601 datetime) |
| updated_at | TEXT | NOT NULL |

**`lead_events`**

| Column | Type | Constraints |
|---|---|---|
| id | TEXT | PRIMARY KEY |
| lead_id | TEXT | NOT NULL, FK → leads.id |
| step | TEXT | NOT NULL |
| meta | TEXT | (JSON blob) |
| created_at | TEXT | NOT NULL |

**`email_messages`**

| Column | Type | Constraints |
|---|---|---|
| id | TEXT | PRIMARY KEY |
| lead_id | TEXT | NOT NULL, FK → leads.id |
| kind | TEXT | NOT NULL ('confirmation' \| 'notification' \| 'review_reminder') |
| resend_id | TEXT | (Resend message ID) |
| sent_at | TEXT | NOT NULL |
| status | TEXT | NOT NULL DEFAULT 'sent' |

**`review_requests`**

| Column | Type | Constraints |
|---|---|---|
| id | TEXT | PRIMARY KEY |
| lead_id | TEXT | NOT NULL, FK → leads.id |
| token | TEXT | NOT NULL UNIQUE |
| event_date | TEXT | NOT NULL (ISO date) |
| next_send_at | TEXT | NOT NULL (ISO 8601 UTC) |
| send_count | INTEGER | NOT NULL DEFAULT 0 |
| max_sends | INTEGER | NOT NULL DEFAULT 3 |
| clicked_at | TEXT | |
| created_at | TEXT | NOT NULL |

**`recipients`**

| Column | Type | Constraints |
|---|---|---|
| id | TEXT | PRIMARY KEY |
| package_id | TEXT | NULL = global; holds slug values |
| email | TEXT | NOT NULL |
| active | INTEGER | NOT NULL DEFAULT 1 (boolean) |
| created_at | TEXT | NOT NULL |

**REQ-25** All D1 changes MUST be managed via numbered migration files in `migrations/` (`0001_*.sql`, …). No ad-hoc schema changes.

### POST /api/leads Endpoint

**REQ-26** `POST /api/leads` MUST be implemented in `src/routes/api/leads/+server.ts`. `prerender = false`.

**REQ-27** Validate request body with Zod: form fields (REQ-10) + `packageId`, `turnstileToken`, `honeypot`.

**REQ-28** Non-empty `honeypot` → HTTP 200 `{ ok: true }` (silent discard).

**REQ-29** Verify Turnstile token via `fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', ...)` with `TURNSTILE_SECRET_KEY`. Failure → HTTP 422 `{ error: 'turnstile_failed' }`.

> POST-VERIFY FIX: The implementation used `v1/siteverify` (matching design.md). Verify report flagged as S-04. The production-correct path is `v0/siteverify` (Cloudflare stable). This was corrected by the orchestrator after verify completed.

**REQ-30** Rate limit: max 5 requests per IP per 15-minute window → HTTP 429. State stored in D1 (JSON LIKE query on `leads.meta`). See S-01 for production-scale improvement recommendation.

**REQ-31** On pass: INSERT `leads` (UUID) + `lead_events(step='submitted')` → HTTP 201 `{ leadId }`.

**REQ-32** Web APIs only. No Node.js built-ins.

**REQ-33** Server lib under `src/lib/server/`, pure functions where possible.

### Response Contract

| Status | Body |
|--------|------|
| 201 | `{ ok: true, leadId: string }` |
| 400 | `{ ok: false, error: string }` |
| 422 | `{ ok: false, error: string }` |
| 429 | `{ ok: false, error: 'rate_limited' }` |
| 500 | `{ ok: false, error: 'internal' }` |

## Scenarios

```
Given a POST /api/leads with a valid body and valid Turnstile token
When the endpoint processes the request
Then a leads row is inserted in D1
And a lead_events row with step='submitted' is inserted
And the response is HTTP 201 with { leadId }

Given a POST /api/leads where the honeypot field is non-empty
When the endpoint processes the request
Then no D1 write occurs
And the response is HTTP 200 with { ok: true }

Given a POST /api/leads with an invalid Turnstile token
When the endpoint calls siteverify and receives success=false
Then no D1 write occurs
And the response is HTTP 422 with { error: 'turnstile_failed' }

Given the same IP sends 6 POST /api/leads within 15 minutes
When the 6th request arrives
Then the response is HTTP 429
And no D1 write occurs for that request

Given a POST /api/leads with a missing required field (e.g., email)
When Zod validation runs
Then the response is HTTP 422 with { error, field }
And no D1 write occurs

Given a POST /api/leads with event_date set to a past date
When Zod validation runs
Then the response is HTTP 422 indicating the date is invalid
```

## Implementation Notes

- Migration: `migrations/0001_init.sql`
- Rate-limit: `countRecentLeadsByIP` uses meta LIKE query (see S-01 for future improvement)
- Token entropy: `crypto.getRandomValues` ≥ 32 bytes, URL-safe base64 or hex
- `wrangler.toml`: `[[d1_databases]]` binding `DB`; secrets `TURNSTILE_SECRET_KEY`, `RESEND_API_KEY`, `RESEND_FROM`; vars `LEAD_NOTIFY_EMAILS`, `PUBLIC_SITE_URL`
- `src/app.d.ts`: `App.Platform.env` typed with all bindings

## Open Items (carry-forward)

- S-01: Rate-limit via JSON LIKE is functional for MVP; consider dedicated `rate_limits` table for production scale.
- S-03: `workers/review-reminders/wrangler.toml` `database_id` is a placeholder — replace with real ID from `wrangler d1 create meg-leads` before deploying.
- See `docs/lead-capture-deployment.md` for full pre-deploy runbook.
