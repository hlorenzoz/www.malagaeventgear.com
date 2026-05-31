# Tasks: Packages & Services Performance Optimization

- [x] **Phase 1: Image Crop Assets Generation**
  - [x] Define exact dimensions and center-crop coordinates (800x380 for desktop, 400x190 for mobile).
  - [x] Run `cwebp` to generate `*-desktop.webp` and `*-mobile.webp` for all 5 packages.
  - [x] Generate desktop and mobile crop variants for all 5 technical services (`sound`, `lighting`, `projectors-screens`, `fx`, `visuals`) in `static/images/services/`.
  - [x] Verify dimensions and compression savings using `sips` and `ls`.

- [x] **Phase 2: Frontend Integration**
  - [x] Implement `<picture>` tag in `/packages/` list cards (`src/routes/(public)/packages/+page.svelte`).
  - [x] Implement `<picture>` tag in `/packages/[slug]/` detail page (`src/routes/(public)/packages/[slug]/+page.svelte`).
  - [x] Refactor background-image CSS divs to responsive `<picture>` elements for all technical services on the `/equipment/` route (`src/routes/(public)/equipment/+page.svelte`).
  - [x] Refactor background-image CSS divs to responsive `<picture>` elements for all services and packages preview sliders on the Homepage (`src/routes/(public)/+page.svelte`).
  - [x] Ensure correct loading strategies (`loading="eager"` / `fetchpriority="high"` for the above-the-fold first package).

- [/] **Phase 3: Verification & Auditing**
  - [x] Run Playwright tests using `bunx playwright test` to check for regressions.
  - [/] Run Lighthouse CI audits using `just test-lighthouse` to measure performance scores and savings.
  - [ ] Verify image payloads loaded on mobile and desktop viewports.
