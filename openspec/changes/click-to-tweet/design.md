# Technical Design: Click to Tweet Text Selection

## Architecture & Implementation Decisions

### 1. Selection Tracking Svelte Component
We will create a reusable Svelte 5 component `<ClickToTweet />` to encapsulate all DOM selection listeners and layout rendering.
- **Path**: `src/lib/components/blog/ClickToTweet.svelte`
- **Props**:
  - `url`: string (the canonical URL of the blog post).
  - `title`: string (the title of the post, to potentially append or log).
- **Runes State**:
  - `show`: boolean (controls visibility of the floating tooltip).
  - `x`: number (horizontal scroll-absolute center coordinate of selection).
  - `y`: number (vertical scroll-absolute top coordinate of selection).
  - `selectedText`: string (stores the currently highlighted text to be tweeted).
- **Listeners**:
  - We will listen to `selectionchange` on the `document` level when mounted, and clean up the listener on destroy.
  - To prevent over-triggering and visual noise, the listener will verify:
    1. The selection is not collapsed (`selection.isCollapsed === false`).
    2. The selected text is between 3 and 200 characters long.
    3. The selection is entirely nested within a `.prose` container. We verify this by ensuring the selection's range common ancestor container is within `.prose`.

### 2. Premium Refined Glassmorphic Tooltip Styling
We will align the tooltip styling with Malaga Event Gear's design guidelines (`DESIGN.md`):
- **Layout**: Floating absolute position on `document.body` or parent, styled with `transform: translate(-50%, -100%) translateY(-12px)`. This perfectly offsets the bubble above the selection's top-center.
- **Glassmorphism**:
  - `background: rgba(18, 20, 20, 0.9)`
  - `backdrop-filter: blur(12px)`
  - `border: 1px solid var(--color-border-glass, rgba(255, 255, 255, 0.12))`
  - `box-shadow: 0 10px 30px -12px rgba(0, 0, 0, 0.5)`
  - `border-radius: 9999px` (fully pill-shaped)
- **Interactive States**:
  - A hover state that adds a subtle glow or electric blue background transition: `hover:bg-electric-blue hover:border-electric-blue/40`.
  - Icon: A custom SVG for Twitter/X inline inside the button.
  - Sizing: Comfortable tap target with 40px height, 12px horizontal padding.
- **Micro-animations**:
  - Smooth scale and opacity transitions when showing/hiding.

### 3. Integration in Blog Posts Layout
We will modify `src/lib/layouts/BlogPost.svelte`:
- Import `ClickToTweet.svelte`.
- Place `<ClickToTweet url={canonicalUrl} title={post.title} />` near the main `<article>`.

## Proposed File Actions

### [Component Blog]
#### [NEW] [ClickToTweet.svelte](file:///Users/hlorenzoz/databank/Development/%5BMEG%20-%20Malaga%20Event%20Gear%20%28malagaeventgear.com%29%5D/projects/website/src/lib/components/blog/ClickToTweet.svelte)
Encapsulates selection listeners, absolute positioning math, Twitter sharing intents, and glassmorphic styles.

### [Layouts]
#### [MODIFY] [BlogPost.svelte](file:///Users/hlorenzoz/databank/Development/%5BMEG%20-%20Malaga%20Event%20Gear%20%28malagaeventgear.com%29%5D/projects/website/src/lib/layouts/BlogPost.svelte)
Mount the `<ClickToTweet />` component in the blog post layout.
