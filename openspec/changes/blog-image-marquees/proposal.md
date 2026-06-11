# Proposal: Blog Image Marquees Integration

## Target URL
- All blog posts: `https://malagaeventgear.com/blog/[slug]/`

## Context & Problem Statement
Currently, Malaga Event Gear's blog posts contain dense textual content, a few inline static images, and CTA components. To improve user engagement and visually break up the long text chunks (allowing the posts to "breathe"), we want to incorporate the reusable scrolling `ImageMarquee` component into all blog posts, customized to display images relevant to the post's topic.

## Objective
Automatically classify all 77 blog posts into categories (Weddings, Corporate/MICE, or General/Eco) and inject a relevant image marquee row inside the content of each post. The marquee should be positioned in the lower-middle section (around 60% depth) of each post, providing visual breathing room between the inline top CTAs/images and the final footer CTAs.

## Proposed Changes
- Build a migration script `scripts/inject-blog-marquees.ts` that will read, parse, and modify each `.svx` file to import and render `ImageMarquee` with the appropriate category.
- Formulate an placement algorithm that finds the H2 heading closest to 60% of the content length and inserts the marquee right before it.

## Risks & Tradeoffs
- *Performance*: Adding a marquee component adds DOM elements and CSS animation. The scrolling is CSS-accelerated (via `translate3d` in `ImageMarquee.svelte`), which minimizes main-thread blocking.
- *Layout Shift*: Since the images are loaded inside the marquee, we will ensure that the marquee container has a fixed height set in CSS to avoid Cumulative Layout Shift (CLS).
