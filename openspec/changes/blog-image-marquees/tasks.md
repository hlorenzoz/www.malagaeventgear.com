# Tasks Checklist: Blog Image Marquees

- [ ] **Step 1: Write the injection script**
  - Create `scripts/inject-blog-marquees.ts`.
  - Implement frontmatter parser for `categories` and `slug`.
  - Implement classification logic mapping posts to package categories.
  - Implement `<script>` Svelte imports injection.
  - Implement 60% depth H2 search and HTML injection.
  - Test the script on a single mock file first, then run it on all `.svx` posts.

- [ ] **Step 2: Run the script on the blog posts**
  - Execute the script using Bun: `bun scripts/inject-blog-marquees.ts`.
  - Check `git diff` to verify the code modifications.

- [ ] **Step 3: Create E2E tests**
  - Create `tests/blog-marquees.spec.ts`.
  - Validate that marquees render with the correct category of images on `/blog/all-in-one-wedding-rental-packages/`, `/blog/audio-visual-rental-for-conferences/`, and `/blog/do-you-offer-delivery-and-setup-for-sound-equipment-in-malaga-spain/`.

- [ ] **Step 4: Verify and lint**
  - Run type checking: `bun run check`.
  - Run Playwright tests: `bunx playwright test tests/blog-marquees.spec.ts`.
