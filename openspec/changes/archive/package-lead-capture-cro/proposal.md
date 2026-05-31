# Proposal: Package Lead Capture CRO

## Intent

Package detail pages (`/packages/[slug]/`) generate interest but convert zero leads — they only link out to a generic `/contact/` page with no context. Every visitor who leaves without enquiring is a lost sale. We need a conversion-optimised layout with an embedded lead form that captures intent at peak interest, persists leads to a database, triggers confirmation and notification emails, and follows up post-event with a review request sequence.

## Scope

### In Scope

- CRO redesign of `/packages/[slug]/+page.svelte` (value-prop hero, price anchor, trust signals, sticky CTA, embedded form, reused `<Testimonials/>`)
- `LeadForm.svelte` + `PhoneInput.svelte` (country selector, default +34) + Cloudflare Turnstile widget
- `/thank-you/+page.svelte` (noindex, ?lead= query param, GA/Zaraz dataLayer stubs)
- Cloudflare D1 database (binding `DB`) with tables: `leads`, `lead_events`, `email_messages`, `review_requests`, `recipients`
- Server lib under `src/lib/server/`: db client, Resend email, bilingual templates, lead normalize/service/recipients, review sequence logic
- POST `/api/leads/+server.ts` (Zod + honeypot + Turnstile siteverify + rate-limit)
- Bilingual i18n namespaces: `leadForm`, `thankYou`
- Resend email lifecycle: lead confirmation + internal notification on submit; review_request created for day-after-event
- Tracked redirect `/r/[token]/+server.ts` (records click, stops reminders, 302 to GMB review link)
- Separate Cloudflare Worker `workers/review-reminders/` (own `wrangler.toml`, cron trigger, bound to same D1 + RESEND_SECRET)
- Vitest setup for server-lib unit tests; miniflare local D1 for integration; Playwright E2E for form→thank-you and tracked redirect

### Out of Scope

- Admin dashboard or CRM UI
- SMS / WhatsApp notifications
- A/B testing framework
- Lead scoring or tagging beyond package slug
- Payment or booking flow

## Capabilities

### New Capabilities

- `package-cro-layout`: Conversion-optimised package detail page with sticky CTA and embedded lead form
- `lead-form`: Client-side form component with Turnstile, phone input, honeypot, i18n, and thank-you redirect
- `lead-persistence`: D1 schema, server lib, and POST endpoint for capturing and storing leads
- `lead-email-lifecycle`: Resend-powered bilingual confirmation, internal notification, and review-request creation
- `review-reminder-worker`: Standalone Cloudflare Worker with cron trigger for post-event review sequence and tracked redirect

### Modified Capabilities

- None

## Approach

Four sequential phases, each shippable independently:

**Phase 1 — CRO UI (no backend):** Redesign package page layout; build `LeadForm.svelte` + `PhoneInput.svelte`; add Turnstile widget (stub validation); form submit navigates to `/thank-you/`; i18n keys added.

**Phase 2 — Persistence + endpoint:** Add D1 binding + migrations; build `src/lib/server/` modules; implement POST `/api/leads/+server.ts` with full validation; wire form to real endpoint; Phase 1 stub replaced.

**Phase 3 — Email lifecycle (Resend):** Integrate Resend SDK; bilingual HTML templates; send confirmation to lead and notification to recipients on successful persist; create `review_request` row scheduled for `event_date + 1 day`.

**Phase 4 — Review sequence:** Build tracked redirect endpoint `/r/[token]`; create `workers/review-reminders/` with cron logic (send D+1, D+3, D+5, max 3, stop on click); deploy as separate Worker sharing same D1 + secret binding.

## Affected Areas

| Area | Impact | Description |
|------|--------|-------------|
| `src/routes/(public)/packages/[slug]/+page.svelte` | Modified | CRO layout redesign |
| `src/lib/components/forms/LeadForm.svelte` | New | Lead capture form |
| `src/lib/components/forms/PhoneInput.svelte` | New | Country-code phone selector |
| `src/routes/(public)/thank-you/+page.svelte` | New | Post-submit confirmation page (noindex) |
| `src/routes/api/leads/+server.ts` | New | Lead capture POST endpoint |
| `src/routes/r/[token]/+server.ts` | New | Tracked GMB review redirect |
| `src/lib/server/` | New | db, email, leads, reviews server modules |
| `src/lib/i18n/translations.ts` | Modified | `leadForm` + `thankYou` namespaces |
| `workers/review-reminders/` | New | Standalone Cloudflare Worker (cron) |
| `wrangler.toml` | Modified | D1 binding, Turnstile secrets, D1 migrations |
| `src/lib/data/site.ts` | Read | GMB review link reuse |

## Risks

| Risk | Likelihood | Mitigation |
|------|------------|------------|
| `adapter-cloudflare` has no `scheduled` handler — cron impossible in main worker | High (known) | Separate `workers/review-reminders/` with own `wrangler.toml` and D1 binding |
| Prerendered routes cannot use server-side load functions with D1 | Med | `/packages/[slug]/` stays prerendered; only the API route and redirect are server-rendered |
| Vitest not yet installed — Strict TDD requires it from Phase 2 | High | Add Vitest + miniflare setup as first task in Phase 2 before writing any server lib |
| Turnstile siteverify requires `TURNSTILE_SECRET_KEY` secret — missing in dev | Med | Use Turnstile test keys (`1x0000000000000000000000000000000AA`) in dev; real key in CF dashboard |
| Resend `From` address requires verified domain | Med | Verify `malagaeventgear.com` in Resend before Phase 3 deploy |
| D1 in production requires explicit migration apply via `wrangler d1 migrations apply` | Low | Document in tasks; gate Phase 2 deploy on migration confirmation |

## Rollback Plan

- **Phase 1:** Git revert the package page and new component files. No backend changes.
- **Phase 2:** Disable D1 binding in `wrangler.toml`; delete API route. Page reverts to Phase 1 stub (navigate to thank-you without persisting).
- **Phase 3:** Remove Resend integration from the service layer; leads continue to persist without emails.
- **Phase 4:** Undeploy `workers/review-reminders/` via `wrangler delete`. Tracked redirect stays as a dead endpoint with no harm.

## Dependencies

- Cloudflare D1 database created and bound as `DB` in `wrangler.toml`
- Resend account + verified sending domain (`malagaeventgear.com`)
- Cloudflare Turnstile site key + secret key configured
- `RESEND_API_KEY`, `RESEND_FROM`, `LEAD_NOTIFY_EMAILS`, `PUBLIC_SITE_URL`, `TURNSTILE_SECRET_KEY`, `PUBLIC_TURNSTILE_SITE_KEY` secrets/vars in CF dashboard and `.dev.vars`
- GMB review link confirmed in `src/lib/data/site.ts`

## Success Criteria

- [x] Package detail pages render conversion layout with embedded form on mobile and desktop
- [x] Form submission persists a lead row in D1 and navigates to `/thank-you/`
- [x] Lead receives bilingual confirmation email; internal recipients receive notification
- [x] Review request is created in D1; Worker sends up to 3 reminders; click stops the sequence
- [x] Tracked redirect `/r/[token]` resolves to GMB and records the click
- [x] Vitest unit tests cover: normalize, recipients, review sequence edge cases, template render
- [x] Playwright E2E covers: form→thank-you happy path, tracked redirect, Testimonials on package page
- [x] `/thank-you/` is noindex; all new public routes have SeoHead + JSON-LD
- [x] No Node.js built-in APIs used anywhere in the main SvelteKit app
