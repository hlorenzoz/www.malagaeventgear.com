# Spec: Packages & Services Performance Optimization

## Requirements
1. **Responsive Image Assets**:
   - Each package image (`eco`, `wedding`, `basic-mice`, `product-presentation`, `mice`) and service image (`sound`, `lighting`, `projectors-screens`, `fx`, `visuals`) must have a desktop (`*-desktop.webp`) and mobile (`*-mobile.webp`) variant.
   - Desktop dimensions: 800x380 for packages, 600x400 for services (center-cropped from original source).
   - Mobile dimensions: 400x190 for packages, 400x266 for services.
   - Quality factor set to `75` using `cwebp` to strike the perfect quality/size balance.

2. **Responsive Image Rendering (HTML/Svelte)**:
   - On the packages listing page (`/packages/`), the package cards must render images using `<picture>`.
   - On the dynamic package detail page (`/packages/[slug]/`), the bento package image must render using `<picture>`.
   - On the equipment listing page (`/equipment/`), the service card backgrounds must render using responsive `<picture>` tags instead of CSS background-image properties to leverage HTML loading attributes, native viewport swapping, and SEO indexing.
   - On the Home page (`/`), both the services cards and package preview carousel cards must render using responsive `<picture>` elements.
   - On mobile viewports (`max-width: 767px`), load the `*-mobile.webp` variant.
   - On tablet/desktop viewports (`min-width: 768px`), load the `*-desktop.webp` variant.
   - Set eager loading and high fetchpriority for the first above-the-fold card, and lazy loading for other cards.
   - Ensure the aspect ratio is perfectly stable to prevent layout shifts.

## Testing Scenarios
1. **Visual Consistency**:
   - Check that all package and service cards render perfectly.
   - Verify that there are no layout shifts or broken image links.
2. **Bandwidth Savings**:
   - Confirm that mobile browsers load the `*-mobile.webp` crop (typically ~9-22 KiB).
   - Confirm that desktop browsers load the `*-desktop.webp` crop (typically ~24-65 KiB).
3. **E2E Stability**:
   - Ensure all Playwright E2E tests pass without any regressions on filters, sorting, or routes.
