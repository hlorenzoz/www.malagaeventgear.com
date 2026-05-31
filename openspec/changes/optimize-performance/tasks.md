# Tasks Checklist: Performance Optimization

- [ ] **Step 1: Create Inline SVG Icon Svelte Component**
  - Create `src/lib/components/navigation/Icon.svelte`.
  - Gather all SVG vectors for: `speaker`, `lightbulb`, `videocam`, `arrow_forward`, `build`, `inventory_2`, `memory`, `chevron_left`, `chevron_right`, `check`, `add`, `remove`, `eco`, `favorite`, `co_present`, `groups`, `business_center`, `package_2`, `request_quote`, `task_alt`, `celebration`, `language`, `menu`, `close`, `call`, `mail`, `location_on`, `schedule`, `chat`.

- [ ] **Step 2: Optimize Global Font Loading in layout**
  - Modify `src/routes/(public)/+layout.svelte`.
  - Change fonts `<link>` tags to non-blocking preload style.
  - Remove synchronous Material Symbols stylesheet.
  - Replace WhatsAppWidget, Footer, TopNavBar icon references.

- [ ] **Step 3: Convert raw images to WebP**
  - Download external Unsplash images to `static/images/services/`.
    - `sound.webp` (from Unsplash speaker photo)
    - `lighting.webp` (from Unsplash lighting photo)
    - `visuals.webp` (from Unsplash projector photo)
  - Compress `static/premium_event_stage.png` to optimized `static/premium_event_stage.webp`.
  - Create cropped mobile image `static/premium_event_stage_mobile.webp`.

- [ ] **Step 4: Update main page markup**
  - Modify `src/routes/(public)/+page.svelte`.
  - Replace Hero raw image with responsive `<picture>` containing `premium_event_stage_mobile.webp` and `premium_event_stage.webp`.
  - Localize Bento card background images to use local WebP.
  - Replace all remaining `<span class="material-symbols-outlined">...</span>` with our new `<Icon name="..." />` component.

- [ ] **Step 5: Replace icons in sub-components**
  - Modify `TopNavBar.svelte`, `Footer.svelte`, `WhatsAppWidget.svelte`, `Testimonials.svelte` (if any), and other layout pages.
  - Test compiling (prerendering validation) and check metrics using local Lighthouse CLI.
