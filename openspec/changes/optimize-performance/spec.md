# Specification: Performance Optimization

## Scenarios & Requirements

### Requirement 1: Zero External Render-Blocking Fonts
- **Given** any public page on the site.
- **When** the page is loaded by a browser.
- **Then** there must be no synchronous, render-blocking `<link href="https://fonts.googleapis.com/... rel="stylesheet">` tags in `<head>`.
- **And** the Google Fonts stylesheet must be loaded asynchronously using the `<link rel="preload" as="style" href="..." onload="this.onload=null;this.rel='stylesheet'">` pattern (or equivalent async pattern).
- **And** fallback system fonts must be declared in CSS to prevent layout shift during font swap.

### Requirement 2: SVG Inlined Icons Component
- **Given** the requirement to render icons in the UI.
- **When** rendering any icon.
- **Then** the page must not download `Material Symbols Outlined` font files.
- **And** the icon must be rendered as an inline SVG element via a centralized `<Icon>` Svelte component.
- **And** the `<Icon>` component must support custom CSS classes (e.g. dimensions, color).

### Requirement 3: Highly Compressed Hero LCP Image
- **Given** the Hero section on the homepage.
- **When** mobile users load the page.
- **Then** the primary LCP image (`/premium_event_stage.png`) must be served in WebP or AVIF format.
- **And** the image size must be less than 100 KB for mobile resolutions.
- **And** the image tag must use `fetchpriority="high"`, `loading="eager"`, and proper `srcset` options to serve smaller dimensions to mobile screens.

### Requirement 4: Localized Service Bento Images
- **Given** the Services bento grid.
- **When** the section is rendered.
- **Then** the background images must be loaded from local project paths (e.g. `/images/services/`) in WebP format.
- **And** must not make external requests to `images.unsplash.com`.
- **And** the elements must use a container-relative layout that prevents Cumulative Layout Shift (CLS).
