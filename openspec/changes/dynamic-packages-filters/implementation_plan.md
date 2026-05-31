# Dynamic E-commerce Filters for Event Packages

Add interactive filtering and sorting features to the Malaga Event Gear event packages catalog (`/packages/`), shifting from a static grid to a highly-usable e-commerce experience.

## User Review Required

> [!IMPORTANT]
> **Single Source of Truth (SSOT) Enforcement**
> In compliance with project rules, we are NOT creating a new database. We are extending the existing Zod-validated store at [packages.ts](file:///Users/hlorenzoz/databank/Development/%5BMEG%20-%20Malaga%20Event%20Gear%20%28malagaeventgear.com%29%5D/projects/website/src/lib/data/packages.ts). This ensures type safety and performance, running perfectly on Cloudflare Edge rendering.

## Open Questions

> [!WARNING]
> Please review these architectural and design decisions:
>
> 1. **Filter Sidebar Location (Left vs. Right)**:
>    The prompt mentions filters on the *right* initially (*"filtros que van a estar en la parte derecha"*), but then asks to place them on the *left* in point 2 (*"Crear los filtros correspondientes a la izquierda"*). 
>    *   **Proposed Default**: We will place the filter sidebar on the **LEFT** for desktop view, which is the premium standard for e-commerce. On mobile, filters will occupy a sliding bottom drawer to provide a flawless, PWA-compliant touch target (min 44px).
>    *   Please let us know if you explicitly prefer the sidebar on the **right** for desktop.
> 
> 2. **Default "MICE Pack" Guest Limit**:
>    The current `MICE Pack` in [packages.ts](file:///Users/hlorenzoz/databank/Development/%5BMEG%20-%20Malaga%20Event%20Gear%20%28malagaeventgear.com%29%5D/projects/website/src/lib/data/packages.ts) has no `maxGuests` set, as it is a large corporate offering.
>    *   **Proposed Default**: We will set `maxGuests: 120` for the MICE Pack so it realistically triggers the "Large (80+ guests)" filter, preventing it from being incorrectly filtered out of scale queries.

## Proposed Changes

We will execute the change across four coordinated components:

---

### Data & Translation Layer

#### [MODIFY] [packages.ts](file:///Users/hlorenzoz/databank/Development/%5BMEG%20-%20Malaga%20Event%20Gear%20%28malagaeventgear.com%29%5D/projects/website/src/lib/data/packages.ts)
- Extend `PackageSchema` Zod model with `category: z.enum(['social', 'corporate'])` and `features: z.array(z.enum(['sound', 'lighting', 'projection', 'technician']))`.
- Update all 5 packages in `packagesData` with their corresponding metadata (e.g. `eco` is `'social'` and features `['sound', 'lighting']`).
- Add `maxGuests: 120` to `MICE Pack`.

#### [MODIFY] [translations.ts](file:///Users/hlorenzoz/databank/Development/%5BMEG%20-%20Malaga%20Event%20Gear%20%28malagaeventgear.com%29%5D/projects/website/src/lib/i18n/translations.ts)
- Add a new nested translations object `filters` in English (`en`) and Spanish (`es`) to translate filter labels, options, button actions, and empty states.

---

### Presentation Layer

#### [MODIFY] [packages/+page.svelte](file:///Users/hlorenzoz/databank/Development/%5BMEG%20-%20Malaga%20Event%20Gear%20%28malagaeventgear.com%29%5D/projects/website/src/routes/%28public%29/packages/+page.svelte)
- Implement reactive states using Svelte 5 Runes:
  - `activeCategory` (filter by category)
  - `activeCapacity` (filter by scale)
  - `activeFeatures` (filter by key inclusions)
  - `sortBy` (recommended vs price asc/desc)
  - `isMobileDrawerOpen` (controls mobile menu)
- Define a reactive `$derived` computed plans list that processes filtering and sorting client-side instantly.
- Refactor the page container to support a two-column desktop grid layout (`lg:grid lg:grid-cols-[280px_1fr] lg:gap-10`).
- Code a sticky Glassmorphic sidebar on desktop and a bottom drawer on mobile.
- Insert a dynamic counter ("Showing X of 5 packages"), a quick reset button, and an elegant empty state with search fallback guidance.

---

### E2E Testing Layer

#### [MODIFY] [packages.spec.ts](file:///Users/hlorenzoz/databank/Development/%5BMEG%20-%20Malaga%20Event%20Gear%20%28malagaeventgear.com%29%5D/projects/website/tests/packages.spec.ts)
- Add 6 comprehensive Playwright integration tests checking default states, category filtering, scale filtering, feature intersections, combined multi-filtering, sorting, and complete filters clearing.

## Verification Plan

### Automated Tests
- Run Playwright E2E tests:
  ```bash
  bun test tests/packages.spec.ts
  ```
- Run Lighthouse CI audit to ensure Performance, SEO, and A11y metrics remain >= 0.9 and CLS is perfect:
  ```bash
  bunx @lhci/cli autorun
  ```

### Manual Verification
- Launch local development server using `just dev`.
- Inspect `/packages/` in Chrome DevTools to verify:
  - Mobile bottom-drawer sliding motion.
  - Hover / active state tap targets (min 44px).
  - High-fidelity reactive transitions of package cards with zero layouts shifts.
