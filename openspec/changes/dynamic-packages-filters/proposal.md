# Proposal: Dynamic E-commerce Filters for Event Packages

## 1. Problem Statement
The Packages page (`/packages/`) currently displays a static grid of the 5 pre-configured service packages (`Eco Pack`, `Wedding Pack`, `Product Presentation`, `Basic MICE`, and `MICE Pack`). While beautifully styled, users have no way to filter or sort packages based on their budget, event scale (number of guests), type of event (social vs. corporate), or specific technical requirements (sound, lighting, projection, or live assistant support). Adding dynamic e-commerce style filters will significantly boost conversion rates (CRO) and user experience by helping event planners quickly find the exact setup that fits their needs.

## 2. Proposed Solution
Transform the static `/packages/` view into a dynamic, interactive catalog:
- **Centralized Data Expansion**: Extend the existing Zod-validated data store in [packages.ts](file:///Users/hlorenzoz/databank/Development/%5BMEG%20-%20Malaga%20Event%20Gear%20%28malagaeventgear.com%29%5D/projects/website/src/lib/data/packages.ts) to include structural metadata fields (`category` and `features`).
- **Two-Column Responsive Layout**:
  - **Desktop (Large screens)**: A left-hand sidebar for filters alongside a 2 or 3-column package grid.
  - **Mobile/Tablet**: A sleek floating filter trigger button that slides up a modern bottom-drawer filter menu, fully compliant with mobile touch targets (min 44px) and safe areas.
- **Dynamic Filters & Sorting**:
  - **Filter by Category**: Social (Weddings & Parties) vs. Corporate (Conferences & Meetings).
  - **Filter by Capacity**: Guest slider or range options matching standard limits (e.g., up to 50 guests, up to 80 guests, 80+ guests).
  - **Filter by Features**: Sound, Lighting, Projection/Display, Live Technical Support.
  - **Sort by Price**: Low to High, High to Low, or Recommended.
- **Reactive State (Svelte 5)**: Leverage Svelte 5 runes (`$state` and `$derived`) to update the package grid instantly as filters change, showing smooth micro-animations.
- **Result Indicators & Reset**: Display a dynamic count of active results (e.g., *"Showing 3 of 5 packages"*) and a quick "Clear all filters" button.

## 3. Technical Boundaries & Risks
- **Edge Run-time Compliance**: All data structures and logic must use standard Web APIs and remain fully compatible with `@sveltejs/adapter-cloudflare`. No Node.js globals.
- **Structured Data (SEO)**: Ensure the dynamic list continues to correctly feed into the structured JSON-LD `ItemList` schema dynamically, matching only the *currently visible* packages or the entire set, depending on SEO best practices. (Best practice: feed the static full list for indexing completeness, while filtering the client UI interactively).
- **Core Web Vitals & CLS**: Filter transitions must not cause layout shifts (CLS). The layout skeleton must be stable, and images should maintain structural aspect ratios.

## 4. Alternative Approaches Considered
- **Option A (Interactive & Multi-select)**: Checkboxes for categories and features, range selector for guests, and price sorter. This is the gold standard for e-commerce and offers the best UX.
- **Option B (Tabbed Filtering)**: Simple tabs for "Social" and "Corporate". While easier to build, it lacks the premium "e-commerce catalog" feel requested by the user and doesn't allow cross-filtering (e.g., corporate package with projection + sound under 400€).
- **Decision**: Propose **Option A** to deliver the absolute best UX.
