# Spec: Package Lead Capture CRO

> Status: draft  
> Change: package-lead-capture-cro  
> Date: 2026-05-31

---

## Conventions

- **MUST** / **SHALL** — mandatory, verifiable requirement
- **SHOULD** — strong preference; deviation requires justification
- **MAY** — optional

---

## Phase 1 — package-cro-layout + lead-form (UI)

### 1.1 Package Detail Page Layout

**REQ-01** The route `/packages/[slug]/` MUST remain prerendered (`prerender = true`). No server-side load using D1 is permitted in the page's `+page.server.ts`.

**REQ-02** The page MUST render a value-prop hero section above the fold containing: package name, a one-line value proposition, and a primary CTA button that scrolls to the embedded form.

**REQ-03** A price anchor display MUST appear on the page showing the package price (or a "from X€" label) alongside at least two trust signals (e.g., response-time badge, included items count, or star rating).

**REQ-04** A sticky CTA bar MUST be visible on scroll on both mobile and desktop. It MUST contain the package name and a button that scrolls to the embedded form. The sticky bar MUST NOT obscure the embedded form when it is in the viewport.

**REQ-05** An includes/optional-extras section MUST list what is covered by the package and what is available as add-ons. This section MUST source data from the existing package data model — no hardcoded strings.

**REQ-06** A `<Testimonials />` carousel MUST appear before the page footer, reusing the existing component without modification to its public API.

**REQ-07** The page MUST render correctly in both `en` and `es` locales. All user-facing strings MUST be sourced from `src/lib/i18n/translations.ts`; no inline Spanish or English literals outside i18n.

**REQ-08** The page MUST include `<SeoHead>` with valid JSON-LD (`Product` or `Service` schema). The canonical URL MUST be the absolute package slug URL.

#### Scenarios — package-cro-layout

```
Given a visitor opens /packages/basic-mice/ in a desktop browser
When the page finishes loading
Then the hero section is visible above the fold
And a price anchor with at least one trust signal is visible
And an embedded LeadForm is present on the page
And a Testimonials carousel exists before the footer

Given a visitor scrolls past the hero
When the sticky CTA bar activates
Then the sticky bar remains visible at all scroll positions
And clicking the CTA button scrolls focus to the LeadForm input
And the sticky bar is not overlapping the LeadForm while it is in view

Given a visitor opens /packages/basic-mice/ with lang=es
When the page renders
Then all visible text uses the es locale
And no hardcoded Spanish strings exist outside translations.ts
```

---

### 1.2 LeadForm Component

**REQ-09** `LeadForm.svelte` MUST be located at `src/lib/components/forms/LeadForm.svelte` and accept a `packageId: string` prop that is included in the submitted payload.

**REQ-10** The form MUST include the following fields:

| Field | Type | Required | Notes |
|---|---|---|---|
| Name | text | Yes | min 2 chars |
| Email | email | Yes | valid email format |
| Phone / WhatsApp | tel | Yes | with country-code selector |
| Event Date | date | Yes | must be a future date |
| Questions / Comments | textarea | No | max 1000 chars |

**REQ-11** `PhoneInput.svelte` MUST be located at `src/lib/components/forms/PhoneInput.svelte`. It MUST render a country-code selector defaulting to `+34` (Spain) and combine the country code with the local number before validation.

**REQ-12** Client-side validation MUST run on submit and on blur for each required field. The form MUST NOT submit if any required field is invalid. Error messages MUST be sourced from the `leadForm` i18n namespace.

**REQ-13** The form MUST include a Cloudflare Turnstile invisible widget. The site key MUST be read from `PUBLIC_TURNSTILE_SITE_KEY`. During Phase 1 the widget response token MAY be sent as a stub; it MUST be a real token sent to the server from Phase 2 onward.

**REQ-14** The form MUST include a honeypot field (e.g., `name="website"`) that is visually hidden via CSS (NOT `display:none` or `visibility:hidden` alone — MUST use off-screen positioning or `aria-hidden`). A non-empty honeypot value MUST silently prevent submission.

**REQ-15** On successful server response (HTTP 201), the form MUST navigate to `/thank-you/?lead={leadId}` using SvelteKit's `goto`. On server error (4xx/5xx), an inline error message MUST be shown without redirecting.

**REQ-16** The form MUST disable the submit button and show a loading indicator while a submission is in flight. Double-submission MUST be prevented.

**REQ-17** All form labels and error messages MUST be bilingual via the `leadForm` i18n namespace added to `src/lib/i18n/translations.ts`.

#### Scenarios — lead-form

```
Given a visitor views a package detail page
When the LeadForm is rendered
Then all five fields are present and labelled in the current locale
And the phone input shows +34 as the default country code
And a Turnstile widget is mounted (invisible)
And a honeypot field exists off-screen and is not announced to screen readers

Given a visitor submits the form with the Name field empty
When client validation runs
Then the submit is blocked
And an error message from the leadForm i18n namespace is displayed under Name

Given a visitor fills Event Date with yesterday's date
When client validation runs on that field
Then an error message indicates the date must be in the future
And the form cannot be submitted

Given a visitor fills all required fields correctly and submits
When the server returns HTTP 201 with { leadId }
Then the browser navigates to /thank-you/?lead={leadId}

Given a visitor fills all required fields correctly and submits
When the server returns HTTP 422
Then an inline error is shown
And the form remains on the page with field values preserved

Given a bot fills the honeypot field and submits
When the form submit handler runs
Then no network request is made to /api/leads
And the page shows no error (silent discard)

Given the form is in a loading state after submit
When the user clicks the submit button again
Then the duplicate click is ignored and only one request is sent
```

---

### 1.3 Thank-You Page

**REQ-18** The route `/thank-you/` MUST exist at `src/routes/(public)/thank-you/+page.svelte`.

**REQ-19** The page MUST include `<meta name="robots" content="noindex, nofollow">` and MUST NOT be listed in the sitemap.

**REQ-20** The page MUST read the `?lead=` query parameter from the URL and pass it to the analytics layer.

**REQ-21** The page MUST push a `dataLayer` event (e.g., `{ event: 'lead_submitted', leadId }`) compatible with Zaraz / GA4. The push MUST be a no-op if `window.dataLayer` is undefined (graceful degradation).

**REQ-22** The page MUST render a professional confirmation message in the current locale, including: a thank-you headline, expected response time, and a link back to the packages listing.

**REQ-23** The page MUST include `<SeoHead>` with a `noindex` directive at the component level in addition to the meta tag.

#### Scenarios — thank-you-page

```
Given a visitor is redirected to /thank-you/?lead=abc123
When the page loads
Then a thank-you headline is visible
And the lead ID "abc123" is included in a dataLayer push
And the page contains noindex in robots meta
And a link to /packages/ is present

Given window.dataLayer is not defined
When the thank-you page loads
Then no JavaScript error is thrown
And the page renders normally
```

---

## Phase 2 — lead-persistence

### 2.1 D1 Schema

**REQ-24** The D1 database bound as `DB` MUST contain the following tables after migrations are applied:

**`leads`**

| Column | Type | Constraints |
|---|---|---|
| id | TEXT | PRIMARY KEY (ULID) |
| package_id | TEXT | NOT NULL |
| name | TEXT | NOT NULL |
| email | TEXT | NOT NULL |
| phone | TEXT | NOT NULL |
| event_date | TEXT | NOT NULL (ISO 8601 date) |
| comments | TEXT | |
| locale | TEXT | NOT NULL DEFAULT 'es' |
| created_at | TEXT | NOT NULL (ISO 8601 datetime) |

**`lead_events`**

| Column | Type | Constraints |
|---|---|---|
| id | INTEGER | PRIMARY KEY AUTOINCREMENT |
| lead_id | TEXT | NOT NULL, FK → leads.id |
| step | TEXT | NOT NULL (e.g. 'submitted', 'email_sent', 'review_requested') |
| meta | TEXT | (JSON blob) |
| created_at | TEXT | NOT NULL |

**`email_messages`**

| Column | Type | Constraints |
|---|---|---|
| id | TEXT | PRIMARY KEY (ULID) |
| lead_id | TEXT | NOT NULL, FK → leads.id |
| type | TEXT | NOT NULL ('confirmation' \| 'notification' \| 'review_request') |
| to_address | TEXT | NOT NULL |
| status | TEXT | NOT NULL DEFAULT 'pending' |
| provider_id | TEXT | (Resend message ID) |
| sent_at | TEXT | |
| created_at | TEXT | NOT NULL |

**`review_requests`**

| Column | Type | Constraints |
|---|---|---|
| id | TEXT | PRIMARY KEY (ULID) |
| lead_id | TEXT | NOT NULL, FK → leads.id |
| token | TEXT | NOT NULL UNIQUE (crypto-random, URL-safe) |
| gmb_url | TEXT | NOT NULL |
| scheduled_date | TEXT | NOT NULL (event_date + 1 day) |
| attempts | INTEGER | NOT NULL DEFAULT 0 |
| max_attempts | INTEGER | NOT NULL DEFAULT 3 |
| clicked_at | TEXT | |
| created_at | TEXT | NOT NULL |

**`recipients`**

| Column | Type | Constraints |
|---|---|---|
| id | INTEGER | PRIMARY KEY AUTOINCREMENT |
| email | TEXT | NOT NULL UNIQUE |
| active | INTEGER | NOT NULL DEFAULT 1 (boolean) |

**REQ-25** All D1 changes MUST be managed via numbered migration files in `migrations/` directory (`0001_*.sql`, `0002_*.sql`, …). No ad-hoc schema changes.

### 2.2 POST /api/leads Endpoint

**REQ-26** `POST /api/leads` MUST be implemented in `src/routes/api/leads/+server.ts` as a SvelteKit server endpoint. It MUST NOT be prerendered.

**REQ-27** The endpoint MUST validate the request body with a Zod schema that matches the form fields in REQ-10 plus `packageId`, `turnstileToken`, and `honeypot`.

**REQ-28** If the `honeypot` field is non-empty the endpoint MUST return HTTP 200 with `{ ok: true }` (silent discard — do not return 422 to bots).

**REQ-29** The endpoint MUST verify the Turnstile token by calling `https://challenges.cloudflare.com/turnstile/v0/siteverify` with `TURNSTILE_SECRET_KEY`. If verification fails it MUST return HTTP 422 with `{ error: 'turnstile_failed' }`.

**REQ-30** The endpoint MUST apply a rate limit of maximum 5 requests per IP per 15-minute window. Exceeding the limit MUST return HTTP 429. Rate-limit state MAY be stored in D1 or in a KV binding if available; a simple in-memory counter is NOT acceptable in production.

**REQ-31** On passing all validations the endpoint MUST insert a row into `leads` (ULID as id) and insert a `lead_events` row with `step = 'submitted'`. It MUST return HTTP 201 with `{ leadId }`.

**REQ-32** The endpoint MUST use only Web APIs (Fetch, crypto, URL). No Node.js built-ins (`fs`, `path`, `crypto` module, etc.) are permitted.

**REQ-33** Server lib modules MUST be located under `src/lib/server/` and MUST be pure functions where possible to enable unit testing without Miniflare.

#### Scenarios — lead-persistence

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

---

## Phase 3 — lead-email-lifecycle

**REQ-34** On a successful lead insert (HTTP 201 path), the server MUST enqueue two emails via Resend:
  1. A confirmation email to the lead's email address.
  2. An internal notification email to all active recipients.

**REQ-35** Recipients MUST be resolved in this order:
  1. Query the `recipients` table in D1 for rows where `active = 1`.
  2. If the result is empty, parse `LEAD_NOTIFY_EMAILS` (comma-separated) as fallback.
  3. If both are empty, log a warning and skip the notification email (do not fail the request).

**REQ-36** Both emails MUST be bilingual: the confirmation email locale MUST match the lead's `locale` field; the internal notification MAY be fixed to `en`.

**REQ-37** Email templates MUST be implemented as TypeScript functions that return an HTML string. They MUST NOT use a runtime template engine that is incompatible with the Cloudflare Workers runtime. Templates MUST be unit-testable without sending real emails.

**REQ-38** Each sent email MUST result in an `email_messages` row with the Resend provider ID stored in `provider_id` and `status = 'sent'`. If Resend returns an error the row MUST be written with `status = 'failed'`; the lead insert MUST NOT be rolled back.

**REQ-39** A `review_requests` row MUST be created on successful lead insert with:
  - `scheduled_date = event_date + 1 day`
  - `token` = a cryptographically random URL-safe token (≥ 32 bytes of entropy)
  - `gmb_url` sourced from `src/lib/data/site.ts`
  - `attempts = 0`, `max_attempts = 3`

**REQ-40** A `lead_events` row with `step = 'email_sent'` MUST be inserted for each email successfully dispatched.

#### Scenarios — lead-email-lifecycle

```
Given a valid lead is persisted in D1
When the email lifecycle runs
Then a confirmation email is sent to the lead's email address via Resend
And an internal notification email is sent to all active recipients
And two email_messages rows are written with status='sent'
And two lead_events rows with step='email_sent' are written
And a review_requests row is created with scheduled_date = event_date + 1

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

---

## Phase 4a — review-reminder-sequence (tracked redirect)

**REQ-41** The route `/r/[token]/` MUST be implemented in `src/routes/r/[token]/+server.ts` as a server-only GET handler (no prerendering).

**REQ-42** Given a valid token, the handler MUST:
  1. Look up the `review_requests` row by token.
  2. If not found or if `clicked_at` is already set, return HTTP 404.
  3. Set `clicked_at = now()` on the row.
  4. Insert a `lead_events` row with `step = 'review_clicked'`.
  5. Return HTTP 302 to the `gmb_url` stored in the row.

**REQ-43** The tracked redirect MUST NOT expose the GMB URL in the initial HTTP response headers before the redirect occurs (i.e., no client-side redirect; server-side 302 only).

#### Scenarios — tracked redirect

```
Given a GET /r/{validToken} where the token exists and clicked_at is null
When the handler processes the request
Then clicked_at is set on the review_requests row
And a lead_events row with step='review_clicked' is inserted
And the response is HTTP 302 to the GMB URL

Given a GET /r/{validToken} where clicked_at is already set
When the handler processes the request
Then the response is HTTP 404
And no additional lead_events row is written

Given a GET /r/unknown-token
When the handler processes the request
Then the response is HTTP 404
```

---

## Phase 4b — review-reminder-sequence (Worker)

**REQ-44** A standalone Cloudflare Worker MUST exist at `workers/review-reminders/` with its own `wrangler.toml` that declares:
  - A cron trigger (schedule TBD in tasks, e.g., daily at 08:00 UTC).
  - D1 binding `DB` pointing to the same database as the main app.
  - `RESEND_API_KEY` and `RESEND_FROM` secret bindings.

**REQ-45** On each cron invocation the Worker MUST:
  1. Query `review_requests` where `scheduled_date <= today` AND `attempts < max_attempts` AND `clicked_at IS NULL`.
  2. For each matching row, send a review-request email to the lead's email address.
  3. Increment `attempts` on the row.
  4. Insert a `lead_events` row with `step = 'review_email_sent'`.
  5. Insert an `email_messages` row with `type = 'review_request'`.

**REQ-46** The Worker MUST stop sending reminders for a given lead if any of these conditions is true: `attempts >= max_attempts` OR `clicked_at IS NOT NULL`.

**REQ-47** The Worker MUST send review emails on days D+1, D+3, D+5 relative to the event date (i.e., `scheduled_date` increments by 2 days after each attempt, up to `max_attempts = 3`).

**REQ-48** The Worker MUST use only Web APIs. No Node.js built-ins.

**REQ-49** The review-request email template MUST be bilingual. The locale MUST be read from the associated `leads.locale` field.

#### Scenarios — review-reminder Worker

```
Given a review_requests row with scheduled_date = today, attempts=0, clicked_at=null
When the cron Worker runs
Then a review-request email is sent to the lead's email
And attempts is incremented to 1
And a lead_events row with step='review_email_sent' is inserted
And an email_messages row with type='review_request' is inserted

Given a review_requests row with attempts=3 (max_attempts=3)
When the cron Worker runs
Then no email is sent for that row
And attempts remains 3

Given a review_requests row where clicked_at is not null
When the cron Worker runs
Then no email is sent for that row

Given a lead with locale='es'
When the review-request email is rendered
Then the subject and body text are in Spanish
```

---

## Phase 5 — testing

**REQ-50** Vitest MUST be configured for the project (`vitest.config.ts`) before any server-lib module is written. The test environment MUST support Web APIs (e.g., `@cloudflare/vitest-pool-workers` or `happy-dom` with manual fetch mock).

**REQ-51** The following pure server-lib functions MUST have Vitest unit tests with ≥ 1 happy-path and ≥ 1 edge-case scenario each:
  - `normalizeLead` — trims whitespace, lowercases email, formats phone.
  - `resolveRecipients` — D1-first, env fallback, empty fallback.
  - `buildReviewSequence` — correct D+1/D+3/D+5 date calculation, max_attempts enforcement.
  - `renderConfirmationEmail` — returns valid HTML containing the lead's name, locale switch.
  - `renderNotificationEmail` — returns valid HTML containing the package name.

**REQ-52** Resend integration tests MUST mock the Fetch API (no real HTTP calls) and assert that the correct `to`, `subject`, and `html` are passed to the Resend endpoint.

**REQ-53** Playwright E2E tests MUST cover:
  - **Form → Thank-you happy path**: fill all fields with valid data, submit, assert navigation to `/thank-you/` and presence of thank-you headline.
  - **Form validation**: submit with empty Name, assert error message is visible and navigation does not occur.
  - **Tracked redirect**: GET `/r/{token}` with a seeded valid token asserts 302 to GMB URL (can use Playwright `request` API).
  - **Testimonials visibility**: `/packages/[slug]/` shows at least one testimonial card before the footer.

**REQ-54** Tests MUST NOT use real Resend API keys or real Turnstile secret keys. Test secrets MUST use Cloudflare's public test keys and Resend mock.

#### Scenarios — testing

```
Given the normalizeLead function receives '  JOHN DOE  ' for name and ' TEST@EMAIL.COM ' for email
When normalizeLead runs
Then name is 'John Doe' (trimmed, title-cased or trimmed at minimum)
And email is 'test@email.com' (trimmed, lowercased)

Given resolveRecipients is called with an empty D1 result and LEAD_NOTIFY_EMAILS='a@b.com'
When resolveRecipients runs
Then it returns ['a@b.com']

Given resolveRecipients is called with an empty D1 result and no env var
When resolveRecipients runs
Then it returns []

Given buildReviewSequence is called with event_date='2026-06-10'
When buildReviewSequence runs
Then scheduled_date is '2026-06-11' (D+1)

Given a Playwright test fills the LeadForm with valid data and submits
When the mock server returns HTTP 201
Then the browser URL contains /thank-you/
And a thank-you headline is visible
```

---

## Cross-Cutting Requirements

**REQ-55** All new public routes MUST include `<SeoHead>` with at minimum `title`, `description`, and canonical URL. `/thank-you/` is exempt from canonical but MUST have noindex.

**REQ-56** No Node.js built-in APIs (`fs`, `path`, `os`, `crypto` module, `Buffer`, `process.env`) MUST be used in any file under `src/`. Environment variables MUST be accessed via the SvelteKit platform env pattern (`platform.env`) or `$env/static/public` / `$env/dynamic/private`.

**REQ-57** All new i18n keys MUST be added to both `en` and `es` objects in `src/lib/i18n/translations.ts` under namespaces `leadForm` and `thankYou`. Missing keys in either locale are a spec violation.

**REQ-58** The Turnstile site key (`PUBLIC_TURNSTILE_SITE_KEY`) MUST be a `PUBLIC_` prefixed env var accessible on the client. The secret key (`TURNSTILE_SECRET_KEY`) MUST NOT be exposed to the client bundle.

**REQ-59** All tokens (review request tokens) MUST be generated using the Web Crypto API (`crypto.getRandomValues`) and encoded as URL-safe base64 or hex. Token entropy MUST be ≥ 32 bytes.

**REQ-60** Theme awareness (dark/light) MUST be respected by all new UI components. Glassmorphism utilities from `src/tailwind.css` SHOULD be used where consistent with the existing design system.
