# Tasks: Package Lead Capture CRO

> Spec: REQ-01–REQ-60 | Design: design.md
> Phase 1 is independently shippable. Phases 2–4 build on it sequentially.

---

## Phase 1 — CRO + Thank-you (frontend, ship first)

### 1.1 i18n namespaces
- [x] 1.1 Add `leadForm` and `thankYou` namespaces (EN + ES) to `src/lib/i18n/translations.ts` — all field labels, error messages, CTA copy, thank-you headline, response-time text. (REQ-07, REQ-17, REQ-57)

### 1.2 PhoneInput component
- [x] 1.2 Create `src/lib/components/forms/PhoneInput.svelte` — country-code selector (dial-code list), defaults to `+34`, emits combined `e164` string via `bind:value`. (REQ-11)

### 1.3 LeadForm component
- [x] 1.3 Create `src/lib/components/forms/LeadForm.svelte` with:
  - Props: `packageId: string`
  - Fields: name, email, PhoneInput, event-date (future-date validation), comments textarea
  - Honeypot `name="website"` off-screen via CSS (`position:absolute; left:-9999px`) + `aria-hidden="true"` (REQ-14)
  - Cloudflare Turnstile `<div class="cf-turnstile">` + script tag; token stored in `$state`; reads `PUBLIC_TURNSTILE_SITE_KEY` (REQ-13, REQ-58)
  - Client validation on blur + submit; error messages from `leadForm` i18n (REQ-12)
  - Submit handler: honeypot check → stub `fetch POST /api/leads` (returns mocked 201) → `goto('/thank-you/?lead=stub')` (REQ-15 Phase 1 stub); loading state + disable submit during in-flight (REQ-16) (REQ-09, REQ-10)

### 1.4 Package detail page CRO redesign
- [x] 1.4 Modify `src/routes/(public)/packages/[slug]/+page.svelte`:
  - Value-prop hero: package name, one-line value prop, scroll-to-form CTA button (REQ-02)
  - Price anchor section: `from X€` + ≥ 2 trust signals (response-time badge, items count) (REQ-03)
  - Sticky CTA bar (Svelte `$effect` scroll listener or CSS `position:sticky`): package name + scroll-to-form button; hides when form is in viewport (REQ-04)
  - Includes/optional-extras section from existing package data model — no hardcoded strings (REQ-05)
  - Embed `<LeadForm packageId={pkg.id} />` below hero (REQ-09)
  - `<Testimonials />` before footer — no API change (REQ-06)
  - `<SeoHead>` with JSON-LD `Service` schema, canonical absolute URL (REQ-08)
  - All strings from `translations.ts`; confirm `prerender = true` unchanged (REQ-01, REQ-07)

### 1.5 Thank-you page
- [x] 1.5 Create `src/routes/(public)/thank-you/+page.svelte`:
  - `<SeoHead noindex={true} />` + explicit `<meta name="robots" content="noindex, nofollow">` (REQ-19, REQ-23, REQ-55)
  - Read `?lead=` via `$page.url.searchParams` on mount (REQ-20)
  - `window.dataLayer = window.dataLayer || []; window.dataLayer.push({ event: 'lead_submitted', leadId })` — graceful if undefined (REQ-21)
  - Thank-you headline, expected response time, link to `/packages/` — all from `thankYou` i18n namespace (REQ-22)
  - Ensure route is NOT in sitemap

### 1.6 Phase 1 verification
- [x] 1.6 **[Playwright E2E]** `tests/e2e/lead-form.spec.ts`:
  - Form renders all 5 fields with labels; `+34` default visible (REQ-10, REQ-11)
  - Submit with empty Name → blocked, error message visible (REQ-12; spec scenario)
  - Submit with past event-date → blocked, future-date error (REQ-12)
  - Fill valid data, submit → URL contains `/thank-you/`, thank-you headline visible (REQ-15, REQ-53)
  - Honeypot filled → no network request (mock `fetch`, assert not called) (REQ-14)
  - Double-click submit → single request (REQ-16)
- [x] 1.7 **[Playwright E2E]** `tests/e2e/package-page.spec.ts`:
  - `/packages/basic-mice/` loads hero above fold, price anchor + trust signal visible (REQ-02, REQ-03)
  - Scroll past hero → sticky bar visible and not overlapping form when form in viewport (REQ-04)
  - At least one `<Testimonials>` card visible before footer (REQ-06, REQ-53)
  - `lang=es` URL → all text in ES locale (REQ-07)

---

## Phase 2 — Persistence + endpoint

> **TDD rule**: write failing test (RED) before each implementation task (GREEN). Vitest config MUST exist before any server lib code.

### 2.1 Vitest setup (FIRST — nothing else in Phase 2 starts without this)
- [x] 2.1 **[RED]** Write a placeholder failing test `src/lib/server/leads/normalize.test.ts` with a single `expect(true).toBe(false)` to confirm Vitest is not yet configured.
- [x] 2.2 Install Vitest + `@vitest/coverage-v8`; create `vitest.config.ts` at root (node env, glob `src/lib/server/**/*.test.ts, workers/**/*.test.ts`); add `test` script to `package.json`. (REQ-50)
- [x] 2.3 **[GREEN]** Replace placeholder test with real `normalizeLead` skeleton — confirm Vitest runs and green.

### 2.2 D1 schema + wrangler config
- [x] 2.4 Create `migrations/0001_init.sql` — 5 tables (`leads`, `lead_events`, `email_messages`, `review_requests`, `recipients`) + indexes. Use design.md schema. (REQ-24, REQ-25)
- [x] 2.5 Modify root `wrangler.toml`: add `[[d1_databases]]` binding `DB`, `TURNSTILE_SECRET_KEY` + `RESEND_API_KEY` + `RESEND_FROM` as secret refs, `LEAD_NOTIFY_EMAILS` + `PUBLIC_SITE_URL` as `[vars]`. (REQ-56)
- [x] 2.6 Modify `src/app.d.ts`: extend `App.Platform.env` with `DB: D1Database`, `TURNSTILE_SECRET_KEY: string`, `RESEND_API_KEY: string`, `RESEND_FROM: string`, `LEAD_NOTIFY_EMAILS: string`, `PUBLIC_SITE_URL: string`.

### 2.3 Server lib — pure modules (TDD each)
- [x] 2.7 **[RED→GREEN]** `src/lib/server/leads/schema.ts` — Zod `LeadInput` schema (all fields from REQ-10 + `packageId`, `turnstileToken`, `honeypot`; future-date refine). Test in `schema.test.ts`. (REQ-27)
- [x] 2.8 **[RED→GREEN]** `src/lib/server/leads/normalize.ts` — `normalizeLead(raw) → LeadInput`: trim all strings, lowercase email, format phone. Tests: happy-path whitespace trim, lowercase email. (REQ-51)
- [x] 2.9 Create `src/lib/server/db/client.ts` — `getDB(platform) → D1Database` accessor.
- [x] 2.10 Create `src/lib/server/db/queries.ts` — `insertLead`, `insertLeadEvent`, `insertEmailMessage`, `insertReviewRequest`, `upsertRateLimit` helpers (raw SQL, Web API `crypto.randomUUID()`). (REQ-31, REQ-32)

### 2.4 Server lib — I/O modules
- [x] 2.11 **[RED→GREEN]** `src/lib/server/leads/recipients.ts` — `resolveRecipients(db, packageId, env)`: D1 package-scoped → D1 global → env fallback → []. Tests mock D1 result sets for each branch. (REQ-35, REQ-51)
- [x] 2.12 Create `src/lib/server/leads/service.ts` — `submitLead(db, input, env)`: insert lead → insert `submitted` event → create `review_requests` row (token via `crypto.getRandomValues`, entropy ≥ 32 bytes) → return `leadId`. (REQ-31, REQ-39, REQ-59)

### 2.5 POST endpoint
- [x] 2.13 Create `src/routes/api/leads/+server.ts` (`prerender = false`): validation pipeline in order — Zod parse (422) → honeypot (200 silent) → Turnstile `siteverify` fetch (422) → D1 rate-limit by `CF-Connecting-IP` max 5/15 min (429) → `submitLead` → 201 `{ leadId }`. (REQ-26–REQ-33)

### 2.6 Wire LeadForm to real endpoint
- [x] 2.14 Replace Phase 1 stub submit in `LeadForm.svelte` with real `fetch('POST /api/leads', body)` → on 201 `goto('/thank-you/?lead={leadId}')` → on 4xx/5xx show inline error. (REQ-15)

### 2.7 Phase 2 verification
- [x] 2.15 **[Vitest integration]** `src/lib/server/leads/service.test.ts` — mock D1 via Miniflare local D1 or manual `vi.fn()` stubs: happy-path inserts lead + event rows, returns leadId. (REQ-51)
- [x] 2.16 **[Vitest unit]** Confirm all Phase 2 unit tests pass: `schema`, `normalize`, `recipients` (all 3 branches — REQ-51).

---

## Phase 3 — Email lifecycle (Resend)

### 3.1 Resend integration + templates (TDD)
- [x] 3.1 Add `resend` npm dependency (or use fetch-only — per design, no SDK; add only if used). Create `src/lib/server/email/resend.ts` — `sendEmail({ to, subject, html }, apiKey, from)` via `fetch` to Resend REST. (REQ-34, REQ-37)
- [x] 3.2 **[RED→GREEN]** `src/lib/server/email/templates/confirmation.ts` — `renderConfirmation(lead, lang) → { subject, html }`. Tests: HTML contains lead name; lang switch returns ES copy. (REQ-36, REQ-51)
- [x] 3.3 **[RED→GREEN]** `src/lib/server/email/templates/notification.ts` — `renderNotification(lead, packageName) → { subject, html }`. Tests: HTML contains package name. (REQ-51)
- [x] 3.4 Create `src/lib/server/email/templates/review.ts` — `renderReview(token, lang, siteUrl) → { subject, html }` with tracked link `/r/{token}`. Bilingual. (REQ-49)

### 3.2 Wire emails into service
- [x] 3.5 Extend `src/lib/server/leads/service.ts`: after lead insert, call `sendEmail` for confirmation + notification; write `email_messages` rows (`status='sent'` or `'failed'`); write `lead_events(step='email_sent')` per sent email. Lead insert NOT rolled back on email failure. (REQ-34, REQ-38, REQ-40)
- [x] 3.6 Update `src/lib/server/leads/recipients.ts` if needed to accept `env.LEAD_NOTIFY_EMAILS` fallback fully (REQ-35).

### 3.3 Phase 3 verification
- [x] 3.7 **[Vitest]** `resend.test.ts` — mock `fetch`; assert correct `to`, `subject`, `html` sent to Resend endpoint for both confirmation and notification paths. (REQ-52)
- [x] 3.8 **[Vitest]** `service.test.ts` (extend) — Resend error path: `email_messages` row written with `status='failed'`; lead row not rolled back. (REQ-38)

---

## Phase 4 — Review sequence + cron Worker

### 4.1 Pure sequence logic (TDD first)
- [x] 4.1 **[RED→GREEN]** `src/lib/server/reviews/sequence.ts` — `resolveAction(req: ReviewRequest, now: Date): SequenceAction`. (REQ-47)
- [x] 4.2 **[Vitest unit]** `sequence.test.ts`: D+1 fires on scheduled date; D+3/D+5 correct `next_send_at`; `send_count >= max_sends` → `stop`; `clicked_at != null` → `stop`; `next_send_at > now` → `skip`. (REQ-45, REQ-46, REQ-51)

### 4.2 Tracked redirect route
- [x] 4.3 Create `src/routes/r/[token]/+server.ts` (GET, `prerender = false`): query `review_requests WHERE token=?` → 404 if missing or `clicked_at` already set → UPDATE `clicked_at=now` → INSERT `lead_events(step='review_clicked')` → 302 to `gmb_url` from `site.ts`. (REQ-41–REQ-43)

### 4.3 Review reminder Worker
- [x] 4.4 Create `workers/review-reminders/wrangler.toml` — name `meg-review-reminders`, cron `0 10 * * *`, D1 binding `DB`, secret refs `RESEND_API_KEY` + `RESEND_FROM`, var `PUBLIC_SITE_URL`. (REQ-44)
- [x] 4.5 Create `workers/review-reminders/tsconfig.json` — standalone tsconfig, path alias `$lib/*` → `../../src/lib/*`, includes worker-configuration.d.ts + app.d.ts.
- [x] 4.6 Create `workers/review-reminders/src/index.ts` — `scheduled()` handler: SELECT due rows → `resolveAction` → send review email via `resend.ts` → UPDATE `send_count++` + `next_send_at` → INSERT `email_messages(kind='review_reminder')` + `lead_events(step='review_email_sent')`. (REQ-44–REQ-49)

### 4.4 Phase 4 verification
- [x] 4.7 **[Playwright E2E]** `tests/e2e/tracked-redirect.spec.ts` — asserts 302/3xx redirect toward GMB URL for any token; 2 tests green. (REQ-53)
- [x] 4.8 Smoke-build Worker: `bunx tsc --noEmit --project workers/review-reminders/tsconfig.json` — PASS, 0 errors. (REQ-44, REQ-48)
- [x] 4.9 Run full Vitest suite (`bun run test`) — 62/62 green. (REQ-50–REQ-52)
- [x] 4.10 Run full Playwright suite (`bunx playwright test tests/e2e/`) — 14/14 green. (REQ-53)
