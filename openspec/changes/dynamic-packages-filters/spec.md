# Specification: Dynamic E-commerce Filters for Event Packages

This specification outlines the functional requirements, user interaction scenarios, and E2E testing strategies for the dynamic filtering features on the `/packages/` page of Malaga Event Gear.

## 1. Functional Requirements

### 1.1 Filter Sidebar / Drawer
- **Sidebar Container (Desktop)**: A sticky left-hand panel structured inside `<aside>` containing all filter groups.
- **Drawer Container (Mobile/Tablet)**: A full-width bottom drawer triggered by a persistent floating button at the bottom of the screen.
- **Filter Groups**:
  1. **Category (Event Type)**: Checkbox / Radio selectors.
     - "Social" (Weddings & private parties).
     - "Corporate" (Summits, conferences, presentations).
  2. **Guest Capacity (Scale)**: Interactive buttons or checkboxes for scale brackets:
     - "Small (up to 50 guests)"
     - "Medium (51 - 80 guests)"
     - "Large (80+ guests)"
  3. **Technical Features**: Checkboxes for equipment inclusions:
     - "Sound System" (active speakers, mics).
     - "Ambient Lighting" (wash lights, LED bars).
     - "Display/Projection" (projectors, screens, LED displays).
     - "Live Assistant" (dedicated technician included).
  4. **Sort Options**: A dropdown or selector:
     - "Price: Low to High"
     - "Price: High to Low"
     - "Most Popular First"
- **Reset Trigger**: A "Clear Filters" or "Reset" button that instantly reverts all selections to their default empty states.

### 1.2 Packages Grid Reactivity
- **Instant Filtering**: As the user interacts with any filter, the packages grid must instantly recalculate and render the subset of matching packages. No manual "Apply" button is required.
- **Empty State**: If no packages match the selected criteria, show a premium empty state:
  - An illustrative icon (e.g., "search_off").
  - A friendly message: *"No packages match your filters. Try clearing some selections!"*
  - A call-to-action button to Reset Filters.
- **Dynamic Count**: A label displaying *"Showing X of Y packages"* where X is the number of filtered packages and Y is the total package inventory (5).

---

## 2. E-E-A-T and SEO Constraints
- **Canonical URLs & Trailing Slash**: The page URL remains strictly `/packages/`.
- **Search Engine Indexing**: All 5 packages must be available in the initial SSR HTML to ensure search engine crawlers (Googlebot, etc.) can discover and index them. Filtering must happen client-side without layout shifts (CLS).
- **A11y (Accessibility)**:
  - Form elements (checkboxes, select dropdowns) must have explicit `aria-label` or `<label>` associations.
  - Buttons must be navigable via keyboard and have touch targets of at least 44px on mobile.

---

## 3. Playwright E2E Test Scenarios
We will add new tests to verify:
1. **Initial Render**: All 5 packages are displayed by default, and no filters are active.
2. **Category Filtering**: Selecting "Corporate" hides "Eco Pack" and "Wedding Pack", showing only the 3 corporate packages.
3. **Guest Capacity Filtering**: Filtering for "Small (up to 50 guests)" shows only packages supporting up to 50 guests.
4. **Combined Filtering**: Selecting "Social" + "Live Assistant" shows only the "Wedding Pack" (the only social package with a live technician).
5. **Reset Action**: Selecting multiple filters, confirming only a subset is visible, clicking "Clear Filters", and verifying all 5 packages are visible again.
6. **Sorting**: Selecting "Price: High to Low" reorganizes the cards, checking that the first card is the Wedding Pack (650€) and the last is the Eco Pack (290€).
