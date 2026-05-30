# Changelog - Malaga Event Gear (MEG) Website

All notable changes to this project will be documented in this file.
This project adheres to [Semantic Versioning](https://semver.org/) and follows [Conventional Commits](https://www.conventionalcommits.org/).

---

## [Unreleased]

### Added
- **Global Routing Trailing Slash**: Created global routing configuration file (`src/routes/+layout.ts`) enforcing trailing slashes across all public SvelteKit routes for Technical SEO.
- **AGENTS Rule Enforcement**: Documented mandatory rule in `AGENTS.md` requiring all internal relative URLs to terminate with trailing slashes.
- **Centralized FAQ Data Store**:
  - Implemented `src/lib/data/faq.ts` validating all FAQ items with Zod schemas.
  - Implemented standard localized values (English/Spanish) for every FAQ item.
  - Embedded logic to dynamically build the Schema.org `FAQPage` JSON-LD schema (`buildFaqSchema()`), ensuring perfectly aligned metadata.
- **Multilingual Google Reviews Slider**:
  - Implemented a premium glassmorphic testimonial slider consuming real client review data.
  - Handled seamless inline language switching and rating stars rendering.
- **Bilingual Static Sitemap**:
  - Extended sitemap generation to support static multilingual localization routes.
- **Playwright E2E Test Suite**:
  - Developed and expanded test coverage (`tests/faq.spec.ts` and others) verifying category filtering, animation visibility, JSON-LD schema generation, and responsive layouts.

### Changed
- **Codebase Link Harmonization**: Rewrote all static relative navigation links, footer URLs, dynamic packages data routes, and internal references across pages (homepage, services, about, packages, sitemap) to terminate with a trailing slash.
- **E2E Test Compliance**: Updated Playwright E2E tests (`packages.spec.ts` and `faq.spec.ts`) to conform with trailing slash URL routing standards.
- **Page Refactoring**:
  - Rewrote `+page.svelte` (Homepage) and `faq/+page.svelte` to dynamically consume the centralized FAQ store, eliminating all duplicated inline questions and text assets.
  - Refactored pricing structures to consume the centralized Zod-validated packages store in `src/lib/data/packages.ts`.
- **UI Enhancements**:
  - Integrated dynamic navigation CTAs linking the homepage FAQ teaser section to the comprehensive `/faq` route.
  - Updated footer and language toggles to utilize the target translation language dynamically.
