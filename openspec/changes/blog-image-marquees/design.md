# Technical Design: Blog Image Marquees

## Architecture & Implementation Decisions

### 1. Reusable Image Marquee Integration
We will inject Svelte's `<ImageMarquee />` component directly into the body of our `.svx` markdown files, utilizing `getImagesForPackage(category)` to resolve the categorized images.

The imports to add inside the `<script>` block of each `.svx` file:
```html
import ImageMarquee from '$lib/components/home/ImageMarquee.svelte';
import { getImagesForPackage } from '$lib/data/gallery';
```

### 2. Category Classification Rules
The script will analyze each post's frontmatter to determine the category key passed to `getImagesForPackage`:
- `wedding`: If `categories` contains `Weddings` or the file slug contains `wedding`.
- `mice`: If `categories` contains `Corporate & Enterprise` or `MICE` or the slug contains `conference`, `seminar`, `meeting`, or `product-launch`.
- `eco`: All other general sound, lighting, or party posts.

### 3. Automatic Spacing and Positioning Algorithm
To make sure the posts "breathe" and the marquee is placed away from other elements:
1. Parse the markdown body and identify all H2 headings (`## `).
2. Filter out structural headings:
   - `## Brief Overview`
   - `## Key Highlights`
   - `## Table of Contents`
   - `## Testimonials`
   - `## Conclusions`
   - `## FAQs`
   - `## FAQ`
3. From the remaining list of valid headings, pick the heading at **60% depth** (index = `Math.floor(headings.length * 0.6)`).
4. Insert the following HTML wrap right before this heading:
   ```html
   <div class="my-12 overflow-hidden w-full">
       <ImageMarquee images={getImagesForPackage('category')} speed="normal" direction="left" />
   </div>
   ```
   If no valid H2 headings are found (very short posts), place the marquee right before the `## Conclusions` or at the end of the post body.

## Proposed File Actions

### [Scripts]
#### [NEW] [inject-blog-marquees.ts](file:///Users/hlorenzoz/databank/Development/%5BMEG%20-%20Malaga%20Event%20Gear%20%28malagaeventgear.com%29%5D/projects/website/scripts/inject-blog-marquees.ts)
A automation script that executes the parsing, category matching, script-import injection, and HTML insertion across all 75+ `.svx` files.

### [Content Blog]
#### [MODIFY] [*.svx](file:///Users/hlorenzoz/databank/Development/%5BMEG%20-%20Malaga%20Event%20Gear%20%28malagaeventgear.com%29%5D/projects/website/src/content/blog/)
All blog posts will be modified to import and include the `<ImageMarquee />` component at the target position.
