# Verify Report — package-lead-capture-cro

> Date: 2026-05-31
> Verdict: **PASS-WITH-WARNINGS**

## Summary

- Tasks complete: **41 / 41** (all 4 phases)
- Spec REQs evaluated: **60 / 60**
- Vitest: **62 / 62** green
- Playwright E2E: **14 / 14** green
- Type errors (src/): **0**
- Type errors (worker): **0**
- CRITICAL: **0** | WARNING: **3** | SUGGESTION: **4**

---

## CRITICAL (0)

None. Implementation is deployable.

---

## WARNING (3)

### W-01 — REQ-42: Tracked redirect always 302, never 404

- **Spec says**: unknown token or already-clicked → HTTP 404.
- **Implementation**: always `302 → GMB URL`, regardless of token validity or clicked state.
- **Intentional**: documented in code comment and apply-progress. UX-driven override — user path to leaving a review is never broken.
- **Data integrity**: unaffected. `clicked_at` update only fires when row found AND `clicked_at IS NULL`. The deviation is purely in the HTTP response status.
- **Decision**: ACCEPT.

### W-02 — REQ-24 schema column naming (design.md authoritative over spec.md)

- **spec.md names**: `package_id`, `locale`, `attempts`, `scheduled_date`
- **design.md + migration names**: `package_slug`, `lang`, `send_count`, `next_send_at`
- **Implementation**: migration, queries.ts, service.ts, and the worker are 100% internally consistent with design.md.
- **No runtime mismatch**: all SQL, all TypeScript types, all INSERT/SELECT use the same column names.
- **Decision**: ACCEPT. design.md was the authoritative DDL. spec.md column names were advisory labels.

### W-03 — REQ-35 recipients.package_id stores slug values

- `recipients.package_id` column holds slug strings (matching `leads.package_slug`), not opaque IDs.
- Internally consistent — recipient lookup uses the same slug string. No runtime bug.
- Cosmetically confusing when seeding the table manually.
- **Decision**: ACCEPT with documentation note.

---

## SUGGESTION (4)

### S-01 — REQ-30: Rate-limit IP matching via JSON LIKE

`countRecentLeadsByIP` uses `meta LIKE '%"ip":"x.x.x.x"%'`. Functional for MVP. A dedicated `ip` column or a `rate_limits` table would be more robust for production scale.

### S-02 — REQ-39: review_requests silently skipped when eventDate absent

`service.ts` guards `if (input.eventDate)` before `insertReviewRequest`. Since the Zod schema enforces a future date as required, this guard is unreachable in practice — but if schema is ever relaxed it silently skips the review sequence. Consider an explicit error or assertion.

### S-03 — REQ-44: wrangler.toml database_id is placeholder

`database_id = "<placeholder-replace-with-real-database-id>"`. Pre-deploy action required: replace with the real D1 database ID from `wrangler d1 create meg-leads`.

### S-04 — REQ-29: Turnstile siteverify URL version

- spec.md: `v0/siteverify`
- Implementation: `v1/siteverify` (matches design.md)
- Both Cloudflare paths resolve, but v0 is the documented stable path. Confirm before production.

---

## Flagged Deviation Analysis

| # | Deviation | Verdict |
|---|-----------|---------|
| REQ-42 always-302 | UX override, data integrity intact | ACCEPT |
| Schema column naming | design.md authoritative, internally consistent | ACCEPT |
| Cron 0 10 vs 0 9 | Cosmetic, documented | ACCEPT |
| Notification `to:[]` | Recipients see each other — internal-only use case | ACCEPT |
| Turnstile skip when no secret | Confirmed: only skipped when `TURNSTILE_SECRET_KEY` absent; enforced on line 61–67 of `/api/leads/+server.ts` | ACCEPT |
| Email failure isolation | Confirmed: try/catch + `status='failed'` write; lead row NOT rolled back; covered by Vitest | ACCEPT |

---

## File Inventory (all present)

| File | Status |
|------|--------|
| `migrations/0001_init.sql` | Present, correct (5 tables + indexes) |
| `src/lib/server/db/client.ts` | Present |
| `src/lib/server/db/queries.ts` | Present |
| `src/lib/server/email/resend.ts` | Present |
| `src/lib/server/email/templates/confirmation.ts` | Present |
| `src/lib/server/email/templates/notification.ts` | Present |
| `src/lib/server/email/templates/review.ts` | Present |
| `src/lib/server/leads/schema.ts` | Present |
| `src/lib/server/leads/normalize.ts` | Present |
| `src/lib/server/leads/recipients.ts` | Present |
| `src/lib/server/leads/service.ts` | Present |
| `src/lib/server/reviews/sequence.ts` | Present |
| `src/routes/api/leads/+server.ts` | Present, `prerender = false` confirmed |
| `src/routes/r/[token]/+server.ts` | Present, `prerender = false` confirmed |
| `src/routes/(public)/thank-you/+page.svelte` | Present, noindex dual-layer confirmed |
| `workers/review-reminders/wrangler.toml` | Present |
| `workers/review-reminders/tsconfig.json` | Present |
| `workers/review-reminders/src/index.ts` | Present |

---

## Next Recommended

`sdd-archive` — no CRITICAL issues block archive. Resolve S-03 (database_id) before production deploy.
