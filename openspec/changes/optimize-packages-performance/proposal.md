# Proposal: Optimize Packages & Services Image Delivery and Performance

## Change Details
- **Name**: `optimize-packages-performance`
- **Scope**: Optimize packages and services images by center-cropping and creating responsive resolution variants based on device viewport.
- **Related Files**: 
  - `src/routes/(public)/packages/+page.svelte`
  - `src/routes/(public)/packages/[slug]/+page.svelte`
  - `src/routes/(public)/equipment/+page.svelte`
  - `src/routes/(public)/+page.svelte`
  - `static/images/packages/` (generated WebP crop variants)
  - `static/images/services/` (generated WebP crop variants)

## Objective
Reduce the payload of the Packages catalog page from ~361 KiB to ~85 KiB and the Services pages significantly on mobile viewports by center-cropping and generating responsive image variants (`*-desktop.webp` and `*-mobile.webp`), perfectly matching display aspect ratios without visual degradation.

## Tradeoffs & Benefits
- **Pros**:
  - Eliminates the wasted vertical resolution on square 800x800 images displayed in `h-44` containers.
  - Slashes the bandwidth requirements for mobile users.
  - Drastically improves LCP and perceived page speed score.
- **Cons**:
  - Requires maintaining two variants per image (though fully automated).
