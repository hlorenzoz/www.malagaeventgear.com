# Changelog - Malaga Event Gear (MEG) Website

All notable changes to this project will be documented in this file.
This project adheres to [Semantic Versioning](https://semver.org/) and follows [Conventional Commits](https://www.conventionalcommits.org/).

---

## [Unreleased]

### Added
- **Premium Multilingual Blog Page**: Created the `/blog/` page (`src/routes/(public)/blog/+page.svelte`) with a localized responsive layout, glassmorphic styling details, and high-fidelity presentation explaining the technical SEO transition, fully integrated with navigation menus (Footer and TopNavBar).
- **Dynamic XML Sitemaps Endpoints**: Developed a dynamic 5-sitemap network resolving directly at the root: `sitemap_index.xml` (main index), `page-sitemap.xml` (dynamic pages sitemap featuring active static routes and catalog packages with strict trailing slashes and Google Image extensions), `post-sitemap.xml` (safe empty post catalog preventing crawl budget drops), `category-sitemap.xml` (dynamic categories), and `author-sitemap.xml` (dynamic authors).
- **Edge-Compatible 301 Redirects and Trailing Slash Middleware**: Created SvelteKit server hooks (`src/hooks.server.ts`) running on the Cloudflare network edge to instantly handle permanent 301 redirections from legacy WordPress URL packages (e.g. `/wedding-pack/` -> `/packages/wedding/`) and enforce trailing slashes across all public HTML navigation paths.
- **AGENTS Sitemap Update Rule**: Added the mandatory rule in `AGENTS.md` forcing the manual review and update of sitemap xml endpoints whenever public pages or blog posts are created or changed.
- **Decoupled Structured Data Architecture**: Implemented a highly structured two-level Schema.org integration. Added site metadata configuration source (`src/lib/data/site.ts`) and unified schema builders (`src/lib/utils/schema.ts`).
- **Global Dynamic Metadata Injection**: Configured public layout (`src/routes/(public)/+layout.svelte`) to automatically inject reactive `LocalBusiness` and dynamic `BreadcrumbList` schemas across all pages.
- **Specific Content Schema Refactoring**: Refactored page routes (`packages`, `packages/[slug]`, `services`) to consume the centralized metadata source and dynamic builders via `SeoHead.svelte`, avoiding data duplication and resolving a sutil visual schema bug in the catalog.
- **AGENTS Structured Data Enforcements**: Documented strict Schema.org integration policies in `AGENTS.md` requiring unified metadata consumptions.
- **E2E Structured Data Validation**: Built specialized Playwright E2E tests (`tests/schema.spec.ts`) validating precise schema injections and JSON-LD structural formats, and integrated automated `webServer` (using `bun run dev` on port 5173) in `playwright.config.ts` to prevent `ERR_CONNECTION_REFUSED` errors during local and CI test runs.
- **Structured Data Architecture Documentation**: Added `.agents/STRUCTURED_DATA.md` documenting core Schema.org structures and recommended Google mappings (LocalBusiness, Service, ItemList, FAQPage, Article, BreadcrumbList) for local service business optimization.
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
