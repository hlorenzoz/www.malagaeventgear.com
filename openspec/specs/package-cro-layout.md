# Capability Spec: package-cro-layout

> Source change: package-lead-capture-cro
> Archived: 2026-05-31
> Status: implemented

## Purpose

Conversion-optimised layout for `/packages/[slug]/` — value-prop hero, price anchor, trust signals, sticky CTA bar, embedded lead form, and Testimonials carousel.

---

## Requirements

**REQ-01** The route `/packages/[slug]/` MUST remain prerendered (`prerender = true`). No server-side load using D1 is permitted in the page's `+page.server.ts`.

**REQ-02** The page MUST render a value-prop hero section above the fold containing: package name, a one-line value proposition, and a primary CTA button that scrolls to the embedded form.

**REQ-03** A price anchor display MUST appear on the page showing the package price (or a "from X€" label) alongside at least two trust signals (e.g., response-time badge, included items count, or star rating).

**REQ-04** A sticky CTA bar MUST be visible on scroll on both mobile and desktop. It MUST contain the package name and a button that scrolls to the embedded form. The sticky bar MUST NOT obscure the embedded form when it is in the viewport.

**REQ-05** An includes/optional-extras section MUST list what is covered by the package and what is available as add-ons. This section MUST source data from the existing package data model — no hardcoded strings.

**REQ-06** A `<Testimonials />` carousel MUST appear before the page footer, reusing the existing component without modification to its public API.

**REQ-07** The page MUST render correctly in both `en` and `es` locales. All user-facing strings MUST be sourced from `src/lib/i18n/translations.ts`; no inline Spanish or English literals outside i18n.

**REQ-08** The page MUST include `<SeoHead>` with valid JSON-LD (`Product` or `Service` schema). The canonical URL MUST be the absolute package slug URL.

## Scenarios

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

## Implementation Notes

- File: `src/routes/(public)/packages/[slug]/+page.svelte` (modified)
- Sticky bar uses Svelte `$effect` scroll listener or CSS `position:sticky`; hides when form intersects viewport
- All strings from `translations.ts` namespaces `leadForm` and `thankYou`
