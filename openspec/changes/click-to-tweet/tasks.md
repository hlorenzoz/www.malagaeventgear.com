# Tasks Checklist: Click to Tweet Text Selection

- [ ] **Step 1: Create ClickToTweet component**
  - Create `src/lib/components/blog/ClickToTweet.svelte`.
  - Implement selection monitoring using runes.
  - Implement coordinates math for floating tooltip.
  - Add premium glassmorphism styling and custom X logo SVG.
  - Implement language localization for "Tweet selection" (e.g. "Tweet" / "Twittear").

- [ ] **Step 2: Mount component in BlogPost layout**
  - Modify `src/lib/layouts/BlogPost.svelte`.
  - Import `ClickToTweet` and render it passing `url` and `title`.

- [ ] **Step 3: Create E2E test suite**
  - Create `tests/click-to-tweet.spec.ts`.
  - Test showing tooltip when text in `.prose` is selected.
  - Test hiding tooltip when text is deselected.
  - Test sharing intent structure when clicked.
  - Test selecting text outside `.prose` does not trigger tooltip.

- [ ] **Step 4: Verification and compilation validation**
  - Run type checker: `bun run check`.
  - Run Playwright test suite: `bunx playwright test tests/click-to-tweet.spec.ts`.
  - Verify overall app builds and works without regressions.
