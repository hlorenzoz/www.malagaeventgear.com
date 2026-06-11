# Proposal: Click to Tweet Text Selection

## Target URL
- Blog Post pages: `https://malagaeventgear.com/blog/[slug]/`

## Context & Problem Statement
Users reading blog posts often want to share specific, interesting quotes or sentences directly to Twitter/X. Currently, they have to copy the text manually, open Twitter, paste it, copy the URL of the post, paste it, and format it themselves. This creates friction and reduces social media engagement for Malaga Event Gear's content.

## Objective
Implement a high-end, premium "Click to Tweet" tooltip that appears when a user selects text within any blog post body. The tooltip should have a modern, glassmorphic design that matches Malaga Event Gear's premium aesthetics, and should allow users to share the selected text on Twitter/X with a single click.

## Proposed Changes
- Create `ClickToTweet.svelte` component.
- Integrate it into the `BlogPost.svelte` layout.
- Limit selection monitoring to the `.prose` class wrapper to prevent noise on layout elements.
- Formulate the shared text as: `“SELECTED_TEXT” — URL`.

## Risks & Tradeoffs
- *Mobile Usability*: Text selection on mobile displays native copy/paste tooltips. The floating "Click to Tweet" button must be positioned carefully to avoid blocking native tooltips or conflict with touch handlers. We will ensure the button is small, positioned just above the selection, and disappears immediately if the selection is modified or tapped outside.
- *Over-triggering*: Selecting very short texts (like a single word) or huge paragraphs is annoying. We will restrict triggering to text between 3 and 200 characters.
