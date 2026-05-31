# Proposal: Optimize Website Performance

## Target URL
- Production URL: `https://nuevo.malagaeventgear.com/`

## Context & Problem Statement
The current mobile performance score is **55/100** (previously **40/100** in PageSpeed Insights), with extremely high metrics for key rendering indicators:
- **First Contentful Paint (FCP)**: 22.8 seconds
- **Largest Contentful Paint (LCP)**: 30.3 seconds
- **Time to Interactive (TTI)**: 30.6 seconds

However, the CPU blocking time (TBT) is **0 ms**, indicating that JavaScript execution is not the issue. Instead, the performance is severely bottlenecked by **critical render-blocking resources** and a massive payload weight:
1. **Material Symbols Outlined Font**: Loaded via an external Google Fonts stylesheet (`https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined`), it attempts to download a single WOFF2 font file containing the entire Google icon set, which weighs **3.95 MB**. This blocks the browser's render pipeline for over 20 seconds on simulated mobile connections.
2. **External Google Fonts Render-Blocking**: Google Fonts for `Playfair Display` and `Plus Jakarta Sans` are loaded synchronously, adding connection overhead (DNS, TCP, TLS) that blocks initial rendering.
3. **Hero Image Weight**: The primary LCP image (`/premium_event_stage.png`) is a raw PNG file weighing **773 KB**, which is excessively heavy for mobile devices.
4. **External Images without Optimizations**: Service bento cards load raw images directly from Unsplash URLs, causing additional network negotiation and suboptimal loading states.

## Objective
Boost Mobile Performance Score to **90+** by implementing modern, high-end performance practices:
- **Eliminate Material Symbols Outlined stylesheet and WOFF2 font entirely** (save 4MB payload and 20s render-blocking time). Inline all icons as optimized SVG components.
- **Implement non-blocking asynchronous loading for Google Fonts** using preload and print stylesheets, reducing render blocking to zero.
- **Optimize the Hero LCP Image**: Convert `/premium_event_stage.png` to highly compressed WebP format, implement a mobile-optimized responsive crop, and use native responsive attributes (`srcset`).
- **Optimize Service Images**: Downscale and host Unsplash images locally in WebP format, serving them with custom aspect ratios to improve CLS and load times.

## Risks & Tradeoffs
- *Icon Maintenance*: Developers will need to copy SVGs for new icons instead of writing `<span class="material-symbols-outlined">icon_name</span>`. This is addressed by providing a centralized `<Icon>` component.
- *Font Swap Flash*: Making Google Fonts asynchronous causes a brief Flash of Unstyled Text (FOUT). This is mitigated by configuring matching fallback system fonts in CSS.
