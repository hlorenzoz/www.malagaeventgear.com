# Capability Spec: thank-you-page

> Source change: package-lead-capture-cro
> Archived: 2026-05-31
> Status: implemented

## Purpose

Post-lead-submission confirmation page. Noindex, reads `?lead=` param, pushes GA4/Zaraz dataLayer event.

---

## Requirements

**REQ-18** The route `/thank-you/` MUST exist at `src/routes/(public)/thank-you/+page.svelte`.

**REQ-19** The page MUST include `<meta name="robots" content="noindex, nofollow">` and MUST NOT be listed in the sitemap.

**REQ-20** The page MUST read the `?lead=` query parameter from the URL and pass it to the analytics layer.

**REQ-21** The page MUST push a `dataLayer` event (e.g., `{ event: 'lead_submitted', leadId }`) compatible with Zaraz / GA4. The push MUST be a no-op if `window.dataLayer` is undefined (graceful degradation).

**REQ-22** The page MUST render a professional confirmation message in the current locale, including: a thank-you headline, expected response time, and a link back to the packages listing.

**REQ-23** The page MUST include `<SeoHead>` with a `noindex` directive at the component level in addition to the meta tag.

## Scenarios

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

## Implementation Notes

- File: `src/routes/(public)/thank-you/+page.svelte`
- Noindex: dual-layer — `<SeoHead noindex={true} />` + explicit `<meta name="robots" content="noindex, nofollow">`
- dataLayer: `window.dataLayer = window.dataLayer || []; window.dataLayer.push({ event: 'lead_submitted', leadId })`
- All text from `thankYou` i18n namespace
