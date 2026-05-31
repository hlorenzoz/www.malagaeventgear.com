# Tasks: Dynamic E-commerce Filters for Event Packages

Task breakdown for implementing dynamic e-commerce-style filters on the packages page.

- [ ] **1. Extend Data Model & Add Metadata**
  - [ ] Modify `src/lib/data/packages.ts` to extend `PackageSchema` with `category` and `features` fields.
  - [ ] Update each of the 5 packages in `packagesData` with their correct metadata.
  - [ ] Set `maxGuests` for the `mice-full` package to `120` to allow for complete guest capacity filtering.

- [ ] **2. Add Localized Translations**
  - [ ] Update English translations in `src/lib/i18n/translations.ts` with the `filters` block.
  - [ ] Update Spanish translations in `src/lib/i18n/translations.ts` with the matching `filters` block.

- [ ] **3. Implement Filter Logic and Responsive UI**
  - [ ] Add reactive state variables for category, capacity, features, sort order, and mobile drawer in `src/routes/(public)/packages/+page.svelte`.
  - [ ] Define reactive `$derived` computed plans for filtered and sorted packages.
  - [ ] Refactor the template structure to use a two-column desktop layout (`lg:grid lg:grid-cols-[280px_1fr] lg:gap-10`).
  - [ ] Create the sticky glassmorphic filter sidebar for desktop.
  - [ ] Create the sliding bottom-drawer filter menu for mobile and the floating filter trigger button.
  - [ ] Implement the dynamic results counter and reset filters action.
  - [ ] Implement the dynamic empty state with a reset CTA.

- [ ] **4. E2E Testing with Playwright**
  - [ ] Extend E2E tests in `tests/packages.spec.ts` to cover:
    - [ ] Default state verification (all 5 visible).
    - [ ] Category-only filtering (Social vs Corporate).
    - [ ] Guest capacity filtering.
    - [ ] Feature inclusions filtering.
    - [ ] Combined multi-filters.
    - [ ] Sorting functionality (price asc/desc).
    - [ ] Clearing all filters.
  - [ ] Run the E2E tests using `bun test` or Playwright runner to verify zero regressions.

- [ ] **5. Verification & Cleanup**
  - [ ] Run the local dev build and visually check the layout transitions on both mobile viewport and desktop.
  - [ ] Run the Lighthouse/LHCI audits via standard verification commands to ensure performance, SEO, accessibility, and best practices remain >= 0.9.
  - [ ] Add the change log details to `.agents/CHANGELOG.md`.
