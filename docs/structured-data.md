# Structured Data (JSON-LD) — Architecture, Procedure & Decisions

How structured data is modeled across the site, how to verify it, and why we made
the calls we made. Read this before touching anything in `src/lib/utils/schema.ts`.

---

## 1. Architecture: one canonical entity graph

The site uses a **single canonical entity graph**. There is exactly **one** node per
real-world entity, and everything else references it by `@id` — it is **never**
redefined.

| Entity | Canonical node | `@id` |
| ------ | -------------- | ----- |
| The business | `ProfessionalService` (LocalBusiness) emitted globally in the `(public)` layout | `https://malagaeventgear.com/#organization` |
| The website | `WebSite` emitted globally in the layout | `https://malagaeventgear.com/#website` |
| Each package | `Service` (one per `/packages/[slug]/`) | `https://malagaeventgear.com/packages/<slug>/#service` |

**The golden rule:** if you need to point at the business (e.g. a `provider`, a
`publisher`), emit `{ "@id": "https://malagaeventgear.com/#organization" }` — a bare
`@id` reference. Do **not** re-declare a partial `ProfessionalService`/`Organization`
node. A partial node makes Google detect a **second, incomplete entity**.

Builders live in `src/lib/utils/schema.ts`. Page-level injection happens via the
`jsonLdSchema` prop on `SeoHead`.

### What each public page emits

- **Global (every public page, from the layout):** `ProfessionalService` + `WebSite` + `BreadcrumbList`.
- **`/packages/`:** adds `ItemList` (of `Service`+`Offer`, via `buildServiceListSchema`) + `FAQPage` (VAT question).
- **`/packages/[slug]/`:** adds `Service`+`Offer` (via `buildServiceSchema`) + `FAQPage`.

---

## 2. Verification procedure

### Local (dev server)

1. Run the dev server and fetch the rendered HTML:
   ```bash
   curl -s http://localhost:5173/packages/ -o /tmp/pkg.html
   ```
2. Extract and inspect every `application/ld+json` block (parse each, list `@type`,
   count duplicate entity types). A quick Node one-liner over the regex
   `/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g` does the job.
3. **Invariant checks:**
   - There must be **exactly one** `ProfessionalService` node per page.
   - Any `provider` / `publisher` must be a pure `{ "@id": "...#organization" }` — no
     `@type`, `name`, or `url` alongside it.
   - Each package `Service` in the `/packages/` `ItemList` must reuse the **same**
     `@id` as its `/packages/[slug]/` page.

### Google (after deploy)

- **Rich Results Test** (`https://search.google.com/test/rich-results`): run it on a
  representative `/packages/<slug>/` URL.
- **Search Console → URL Inspection → Enhancements.**

### Reading the reports correctly (IMPORTANT)

GSC's "Enhancements" / "Datos estructurados detectados" sections **only list types
that have a dedicated rich-result report** — `Breadcrumb`, `FAQ`, `Product`, `Local
Business`, etc. `WebSite`, `ItemList`, and generic `Service` are **valid and read by
Google but do not get an enhancement report**. Seeing only "Breadcrumbs" and "FAQ"
does **not** mean the other schemas are missing — it means those are the only
rich-result-eligible types on the page. Don't "fix" a missing report that was never
supposed to exist.

---

## 3. Resolved issues (history)

### Duplicate, incomplete `LocalBusiness` on package pages — FIXED (commit `865df66`)

**Symptom:** Rich Results Test on `/packages/wedding/` showed **two** "Empresas
locales", the second with 4 non-critical warnings (missing `telephone`,
`priceRange`, `address`, `image`).

**Root cause:** `buildServiceSchema` declared a partial `provider`
(`{ '@type': 'ProfessionalService', name, url }`). Google read that as a second,
incomplete business entity.

**Fix:** `provider` now references the canonical node by `@id`
(`{ '@id': '.../#organization' }`), matching `buildWebSiteSchema`. The fix is in the
builder, so it covers every package at once (single data-driven `[slug]` route.)

### Flat `ItemList` on `/packages/` — UPGRADED (commit `f1eb723`)

**Before:** `/packages/` emitted a flat `ItemList` (`name` + `url` only),
semantically empty.

**After:** `buildServiceListSchema` makes each item the **same** `Service` entity
(shared `.../#service` `@id`) as its `[slug]` page, with an `Offer` (price) and the
org referenced as `provider` by `@id`. Strengthens the graph.

---

## 4. Decision: do NOT model packages as `Product`

Evaluated and **rejected** (revisit only if the trigger below is met).

**Why it's tempting:** `Product` is the *only* type that unlocks a visible price/star
snippet in organic search.

**Why we rejected it:**

1. **Semantic mismatch + likely won't render.** `Product` is for things you buy. We're
   a quote-based local AV rental, not transactional e-commerce. Google decides whether
   to render the snippet based on whether it sees real commerce — most likely it
   **won't render**, leaving all the risk and none of the reward.
2. **The real prize (stars) is policy-blocked.** Our testimonials are **business-level**
   ("Malaga Event Gear is great"), not **package-level** ("the Wedding Pack was…").
   - Attaching them as per-`Product` `aggregateRating` = misattribution → **manual
     action risk**.
   - Attaching them to `LocalBusiness` is also disallowed (self-serving reviews banned
     since 2019).
   - **Both doors to stars are closed with current data.**
3. **VAT price mismatch.** Our schema price is net (`290.00`) but we display "+21% VAT".
   Google wants the schema price to match what the customer pays — gray area.
4. **Breaks the clean graph.** Adding `Product` alongside `Service` = two entities for
   one thing (the exact duplication we just removed in `865df66`). Replacing `Service`
   with `Product` loses the correct semantics.
5. **More maintenance surface** — more recommended fields, more warnings.

**Where our rating signal actually lives:** the **Google Business Profile** (local pack
/ Maps), fed by real Google reviews — not by our structured data. That lever already
works.

**Revisit trigger:** only model a package as `Product` + `aggregateRating` once we
collect **package-specific reviews** (e.g. "I hired the Wedding Pack and…"). Without
that data, `Product` is effort + risk with no payoff.
