# Design: Dynamic E-commerce Filters for Event Packages

This document outlines the software design, reactive state management, and visual styling architecture for the dynamic package catalog on Malaga Event Gear.

## 1. Data Store Expansion (`src/lib/data/packages.ts`)

We will extend the existing Zod schemas and update the package inventory array (`packagesData`).

### Schema Extensions
```typescript
// Extended Package Schema
export const PackageSchema = z.object({
  id: z.string(),
  slug: z.string(),
  route: z.string(),
  name: z.string(),
  price: z.number(),
  desc: LocalizedTextSchema,
  includes: LocalizedListSchema,
  optional: LocalizedListSchema.optional(),
  maxGuests: z.number().optional(),
  popular: z.boolean().optional(),
  image: z.string().optional(),
  seo: SeoSchema,
  landing: LandingSchema,
  
  // NEW FILTERS METADATA
  category: z.enum(['social', 'corporate']),
  features: z.array(z.enum(['sound', 'lighting', 'projection', 'technician']))
});
```

### Data Inventory Updates
We will add the fields to each item in `packagesData`:
1. **Eco Pack (`eco`)**:
   - `category`: `'social'`
   - `features`: `['sound', 'lighting']`
2. **Wedding Pack (`wedding`)**:
   - `category`: `'social'`
   - `features`: `['sound', 'lighting', 'technician']`
3. **Product Presentation Pack (`presentation`)**:
   - `category`: `'corporate'`
   - `features`: `['sound', 'projection']`
4. **Basic MICE Pack (`mice-basic`)**:
   - `category`: `'corporate'`
   - `features`: `['sound', 'projection']`
5. **MICE Pack (`mice-full`)**:
   - `category`: `'corporate'`
   - `features`: `['sound', 'projection', 'technician']`
   - *Note*: Set `maxGuests: 120` to allow realistic filtering (e.g. large meetings).

---

## 2. UI Component Architecture (`src/routes/(public)/packages/+page.svelte`)

### Reactive State (Svelte 5 Runes)
We will introduce states to track the current active filters:
```typescript
let activeCategory = $state<'all' | 'social' | 'corporate'>('all');
let activeCapacity = $state<'all' | 'small' | 'medium' | 'large'>('all');
let activeFeatures = $state<Set<'sound' | 'lighting' | 'projection' | 'technician'>>(new Set());
let sortBy = $state<'recommended' | 'price-asc' | 'price-desc'>('recommended');
let isMobileDrawerOpen = $state(false);
```

### Reactive Computed Filtering
```typescript
let filteredPlans = $derived.by(() => {
  let list = packages.map((pkg) => ({
    id: pkg.id,
    route: pkg.route,
    name: pkg.name,
    price: pkg.price.toFixed(2),
    rawPrice: pkg.price,
    desc: pkg.desc[i18n.lang],
    includes: pkg.includes[i18n.lang],
    optional: pkg.optional ? pkg.optional[i18n.lang] : undefined,
    popular: pkg.popular,
    image: pkg.image,
    maxGuests: pkg.maxGuests,
    category: pkg.category,
    features: pkg.features,
    ...(packMeta[pkg.id] ?? fallbackMeta)
  }));

  // Apply category filter
  if (activeCategory !== 'all') {
    list = list.filter((pkg) => pkg.category === activeCategory);
  }

  // Apply guest capacity filter
  if (activeCapacity !== 'all') {
    list = list.filter((pkg) => {
      if (!pkg.maxGuests) return false;
      if (activeCapacity === 'small') return pkg.maxGuests <= 50;
      if (activeCapacity === 'medium') return pkg.maxGuests > 50 && pkg.maxGuests <= 80;
      if (activeCapacity === 'large') return pkg.maxGuests > 80;
      return true;
    });
  }

  // Apply features filter
  if (activeFeatures.size > 0) {
    list = list.filter((pkg) => {
      return Array.from(activeFeatures).every((feat) => pkg.features.includes(feat));
    });
  }

  // Apply sorting
  if (sortBy === 'price-asc') {
    list.sort((a, b) => a.rawPrice - b.rawPrice);
  } else if (sortBy === 'price-desc') {
    list.sort((a, b) => b.rawPrice - a.rawPrice);
  } else {
    // 'recommended' sorting: popular items first, then by ID
    list.sort((a, b) => {
      if (a.popular && !b.popular) return -1;
      if (!a.popular && b.popular) return 1;
      return 0;
    });
  }

  return list;
});
```

---

## 3. Visual & Aesthetic Architecture

### Two-Column Responsive Grid Layout
The section container will use a flexible flexbox or grid layout:
- **Desktop (min-width: 1024px)**:
  - Sidebar: Width of `280px` or `300px`, sticky positioning (`sticky top-24`).
  - Catalog Grid: Takes the remaining horizontal space, adjusting to 2 or 3 columns.
- **Mobile/Tablet**:
  - Filter trigger button: A floating glass-panel pill at the bottom-center of the viewport. Clicking it slides in the full-height filter drawer.

### Premium Glassmorphism Styling
We will use the precise styling tokens defined in `DESIGN.md`:
- Backdrop blur: `backdrop-filter: blur(20px)` on frosted white surfaces (`rgba(255, 255, 255, 0.05)`).
- Border: thin highlight `1px solid rgba(255, 255, 255, 0.12)`.
- Active glows: electric blue border glows on selected elements.
- Interaction animations: HSL tailored colors with `transition-all duration-300 ease-[cubic-bezier(0.32,0.72,0,1)]`.

---

## 4. Internationalization & Translation Support

We will extend `$lib/i18n/translations.ts` to include localized strings for the new filtering controls:
```typescript
filters: {
  title: "Filters",
  clearAll: "Clear all",
  category: "Event Type",
  capacity: "Event Scale",
  features: "Equipment & Services",
  sortBy: "Sort By",
  showingResults: "Showing {visible} of {total} packages",
  noResults: "No packages match your search.",
  resetFilters: "Reset Filters",
  
  // Option labels
  all: "All Packages",
  social: "Social / Celebration",
  corporate: "Corporate / MICE",
  small: "Small (up to 50 guests)",
  medium: "Medium (51 - 80 guests)",
  large: "Large (80+ guests)",
  
  // Features
  sound: "Sound Systems",
  lighting: "Ambient Lighting",
  projection: "Screens & Projectors",
  technician: "Live Technical Support",
  
  // Sorters
  recommended: "Recommended",
  priceAsc: "Price: Low to High",
  priceDesc: "Price: High to Low"
}
```
This guarantees that the new filter controls are fully translated and localized.
