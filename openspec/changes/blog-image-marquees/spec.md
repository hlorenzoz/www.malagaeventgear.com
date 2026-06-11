# Specification: Blog Image Marquees

## Scenarios & Requirements

### Requirement 1: Content-Relevant Image Categories
- **Given** a blog post page.
- **When** the page renders.
- **Then** it MUST display an `ImageMarquee` component populated with images relevant to the post's primary category.
- **And** the category mapping MUST be:
  - `Weddings` -> Wedding images (`getImagesForPackage('wedding')`).
  - `Corporate & Enterprise` / `MICE` -> Corporate images (`getImagesForPackage('mice')`).
  - Other/General -> General/Eco images (`getImagesForPackage('eco')`).

### Requirement 2: Middle-Section Layout Breathing Room
- **Given** the blog post content.
- **When** the post is parsed and rendered.
- **Then** the `ImageMarquee` MUST be inserted in the middle-lower section of the content, specifically right before the heading closest to 60% of the valid H2 headings in the body.
- **And** it MUST NOT be placed directly adjacent to another image or `<InlineCTA />` or the end-of-post `PostCTA`.

### Requirement 3: DOM Placement and Styling
- **Given** the rendered `ImageMarquee` inside the post body.
- **When** the user scrolls through the post.
- **Then** the marquee MUST have standard vertical margin/padding (e.g. `my-10` or `py-6`) to create a clear separation between paragraphs.
- **And** it MUST scroll continuously and smoothly without interrupting document readability.
