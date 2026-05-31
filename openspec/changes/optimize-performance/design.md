# Technical Design: Performance Optimization

## Architecture & Implementation Decisions

### 1. Inlined SVG Icon System
To avoid downloading the **3.95 MB** Material Symbols WOFF2 font, we will create a centralized `<Icon>` Svelte component.
- **Component Path**: `src/lib/components/navigation/Icon.svelte`
- **Mechanism**: The component will take a `name` prop (matching the previous Material Icons names, e.g., `speaker`, `build`, etc.) and a `className` prop. It will map the `name` to a dictionary of SVG paths, rendering the appropriate SVG inline.
- **Benefits**:
  - Eliminates network requests for icons.
  - Complete style integration using CSS classes (inherits currentColor and responsive sizing).
  - SVG data is loaded strictly at compile-time and bundled, reducing runtime payload to only the SVGs actually used on the page.

### 2. Non-blocking Font Loading Strategy
We will modify `src/routes/(public)/+layout.svelte` to change how Google Fonts are loaded.
We will use the standard asynchronous print stylesheet trick:
```html
<link rel="preconnect" href="https://fonts.googleapis.com" />
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin="anonymous" />
<link rel="preload" as="style" href="https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400..900;1,400..900&family=Plus+Jakarta+Sans:ital,wght@0,200..800;1,200..800&display=swap" />
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400..900;1,400..900&family=Plus+Jakarta+Sans:ital,wght@0,200..800;1,200..800&display=swap" media="print" onload="this.media='all'" />
<noscript>
  <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400..900;1,400..900&family=Plus+Jakarta+Sans:ital,wght@0,200..800;1,200..800&display=swap" />
</noscript>
```
- **Trade-off (FOUT vs. Render-Blocking)**: The FOUT (Flash of Unstyled Text) is handled by SvelteKit's prerendering (SSR), which outputs the structural HTML, and matching tailwind font stacks with standard fallback fonts (`serif` for Playfair Display, `sans-serif` for Plus Jakarta Sans) to prevent layout shifts during font swap.

### 3. Highly Optimized Local WebP Assets
We will convert existing raw assets to WebP using `sharp` or local CLI utilities (or custom offline optimization) to keep them lightweight:
1. **Hero Stage Background**:
   - Source: `static/premium_event_stage.png` (773 KB)
   - Optimization: Convert to `static/premium_event_stage.webp` at 80% quality. In addition, we will create a mobile-specific version `static/premium_event_stage_mobile.webp` cropped at 800px width.
   - Svelte Markup: Use a `<picture>` tag or responsive CSS to serve `premium_event_stage_mobile.webp` on screens `< 768px` and the larger version on desktop.
2. **Services Unsplash Images**:
   - Instead of fetching external URLs from `images.unsplash.com` on every render, we will fetch and compress these images and place them in the project under `static/images/services/`.
   - Compressing to WebP (~60KB each) reduces network payload from ~1.5MB to under 180KB for the entire bento grid!

## Proposed File Actions

### [Component Navigation]
#### [NEW] [Icon.svelte](file:///Users/hlorenzoz/databank/Development/%5BMEG%20-%20Malaga%20Event%20Gear%20%28malagaeventgear.com%29%5D/projects/website/src/lib/components/navigation/Icon.svelte)
Central Svelte component containing SVG pathways for used icons.

### [Main Routes]
#### [MODIFY] [+layout.svelte](file:///Users/hlorenzoz/databank/Development/%5BMEG%20-%20Malaga%20Event%20Gear%20%28malagaeventgear.com%29%5D/projects/website/src/routes/%28public%29/+layout.svelte)
- Update font loading headers to asynchronous preload pattern.
- Remove external Material Symbols stylesheet.
- Replace all `<span class="material-symbols-outlined">...</span>` with our new inline SVG `<Icon>` component.

#### [MODIFY] [+page.svelte](file:///Users/hlorenzoz/databank/Development/%5BMEG%20-%20Malaga%20Event%20Gear%20%28malagaeventgear.com%29%5D/projects/website/src/routes/%28public%29/+page.svelte)
- Convert Hero image to `<picture>` with WebP responsive formats.
- Replace Material Symbols with inline `<Icon>` component.
- Localize Unsplash background URLs into local WebP assets.

#### [MODIFY] [TopNavBar.svelte](file:///Users/hlorenzoz/databank/Development/%5BMEG%20-%20Malaga%20Event%20Gear%20%28malagaeventgear.com%29%5D/projects/website/src/lib/components/navigation/TopNavBar.svelte)
- Replace Material Icons in header and language toggles with the `<Icon>` component.

#### [MODIFY] [Footer.svelte](file:///Users/hlorenzoz/databank/Development/%5BMEG%20-%20Malaga%20Event%20Gear%20%28malagaeventgear.com%29%5D/projects/website/src/lib/components/navigation/Footer.svelte)
- Replace any Material Icons with the `<Icon>` component.

#### [MODIFY] [WhatsAppWidget.svelte](file:///Users/hlorenzoz/databank/Development/%5BMEG%20-%20Malaga%20Event%20Gear%20%28malagaeventgear.com%29%5D/projects/website/src/lib/components/navigation/WhatsAppWidget.svelte)
- Replace Material Icons with the `<Icon>` component.
