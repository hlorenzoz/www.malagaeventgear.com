# Archive Report — package-lead-capture-cro

> Archived: 2026-05-31
> Final status: CLOSED — PASS (0 CRITICAL, 3 WARNING, 4 SUGGESTION)

---

## Change Summary

Full-stack CRO conversion funnel on `/packages/[slug]/`. Introduced lead capture form, D1 persistence, bilingual email lifecycle via Resend, post-event review reminder Worker with cron trigger, and tracked GMB redirect. All 60 spec requirements evaluated, 41/41 tasks complete across 4 phases.

## Final Verify Verdict

- Tasks: **41 / 41** (all phases)
- Spec REQs: **60 / 60** evaluated
- Vitest: **62 / 62** green
- Playwright E2E: **14 / 14** green
- Type errors (src/): **0**
- Type errors (worker): **0**
- CRITICAL: **0** | WARNING: **3** | SUGGESTION: **4**

## Post-Verify Fix (Applied by Orchestrator)

**Turnstile siteverify endpoint corrected v1 → v0.**

The implementation used `https://challenges.cloudflare.com/turnstile/v1/siteverify` (matching design.md). Verify report flagged this as S-04 noting `v0/siteverify` is the documented stable path. This was corrected in `src/routes/api/leads/+server.ts` by the orchestrator after verify completed. Final state: endpoint uses `v0/siteverify`. This was a production-breaking difference — `v1` is not a guaranteed alias.

## Accepted Warnings (Carry Forward)

### W-01 — Tracked redirect always 302 (REQ-42 deviation)
Unknown token or already-clicked token returns 302 (not 404). UX-driven override — no user is ever blocked from leaving a review. Data integrity is unaffected: `clicked_at` only updates when row is found and null. ACCEPTED.

### W-02 — Schema column naming: design.md authoritative over spec.md
Four column names differ between spec.md (advisory labels) and the actual migration + implementation (design.md names). The implementation is 100% internally consistent.

| spec.md label | Actual column | Table |
|---|---|---|
| `package_id` | `package_slug` | `leads` |
| `locale` | `lang` | `leads` |
| `attempts` | `send_count` | `review_requests` |
| `scheduled_date` | `next_send_at` | `review_requests` |

Archived capability specs (`openspec/specs/`) use the actual column names as source of truth. ACCEPTED.

### W-03 — recipients.package_id stores slug values
`recipients.package_id` holds slug strings consistent with `leads.package_slug`. Cosmetically confusing when seeding manually, but no runtime bug. ACCEPTED with documentation note.

## Suggestions Carried Forward

| # | Description | Action |
|---|---|---|
| S-01 | Rate-limit uses JSON LIKE on `leads.meta` — functional for MVP, brittle at scale | Consider dedicated `rate_limits` table in a future change |
| S-02 | `service.ts` silently skips `review_requests` when `eventDate` absent — guard is unreachable given Zod schema but fragile | Add explicit assertion if schema is ever relaxed |
| S-03 | `workers/review-reminders/wrangler.toml` `database_id` is a placeholder | Replace with real ID from `wrangler d1 create meg-leads` BEFORE deploying |
| S-04 | Turnstile siteverify URL — RESOLVED (v1 → v0 corrected post-verify) | None |

## Pre-Deploy Checklist

Full runbook at `docs/lead-capture-deployment.md`. Key steps:

1. `wrangler d1 create meg-leads` → copy `database_id` into root `wrangler.toml` AND `workers/review-reminders/wrangler.toml`
2. Verify `malagaeventgear.com` domain in Resend dashboard
3. Set secrets in CF dashboard: `RESEND_API_KEY`, `RESEND_FROM`, `TURNSTILE_SECRET_KEY`
4. Set vars: `LEAD_NOTIFY_EMAILS`, `PUBLIC_SITE_URL`
5. Set `PUBLIC_TURNSTILE_SITE_KEY` in `wrangler.toml [vars]`
6. `wrangler d1 migrations apply meg-leads --remote`
7. `bun run deploy` (main SvelteKit Worker)
8. `cd workers/review-reminders && bun run deploy` (cron Worker)

## Artifact References

| Artifact | Location |
|---|---|
| Proposal | `openspec/changes/archive/package-lead-capture-cro/proposal.md` |
| Spec | `openspec/changes/archive/package-lead-capture-cro/spec.md` |
| Design | `openspec/changes/archive/package-lead-capture-cro/design.md` |
| Tasks | `openspec/changes/archive/package-lead-capture-cro/tasks.md` |
| Verify report | `openspec/changes/archive/package-lead-capture-cro/verify-report.md` |
| Capability specs (new SOT) | `openspec/specs/package-cro-layout.md` |
| | `openspec/specs/lead-form.md` |
| | `openspec/specs/thank-you-page.md` |
| | `openspec/specs/lead-persistence.md` |
| | `openspec/specs/lead-email-lifecycle.md` |
| | `openspec/specs/review-reminder-sequence.md` |
| Deployment runbook | `docs/lead-capture-deployment.md` |
| Engram apply-progress | obs #1627 |
| Engram verify-report | obs #1633 |
