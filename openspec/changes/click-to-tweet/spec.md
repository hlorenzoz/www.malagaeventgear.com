# Specification: Click to Tweet Text Selection

## Scenarios & Requirements

### Requirement 1: Tooltip Visibility on Text Selection
- **Given** a blog post page.
- **When** the user selects a string of text inside the `.prose` container.
- **And** the selected text length is between 3 and 200 characters (inclusive).
- **Then** the Click to Tweet tooltip MUST become visible in the document.

### Requirement 2: Tooltip Invisibility
- **Given** the Click to Tweet tooltip is visible.
- **When** the text selection is cleared.
- **Or** the selected text length is less than 3 or greater than 200 characters.
- **Or** the selection is outside the `.prose` container.
- **Then** the tooltip MUST be hidden.

### Requirement 3: Tooltip Positioning
- **Given** a valid text selection.
- **When** the tooltip is shown.
- **Then** it MUST be positioned absolutely, centered horizontally above the selected text bounding rect.
- **And** it MUST have a high z-index to sit on top of other content layers.

### Requirement 4: Share Action
- **Given** the visible tooltip.
- **When** the user clicks the sharing button.
- **Then** it MUST open a browser window/tab to:
  `https://twitter.com/intent/tweet?text=“SELECTED_TEXT”&url=CANONICAL_URL`
  where `SELECTED_TEXT` and `CANONICAL_URL` are properly URL-encoded.
