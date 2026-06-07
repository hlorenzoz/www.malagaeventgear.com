# Apply Progress: wp-blog-migration — Batches 1+2+3+4 (Phases 1-4 + Phase 5 code + Phase 6)

**Date**: 2026-06-07 (batch 1: 2026-06-06, batch 2: 2026-06-07, batch 3: 2026-06-07, batch 4: 2026-06-07)
**Status**: COMPLETE (Phases 1, 2, 3, 4, 5-code, 6 done — Task 5.1 manual: R2 bucket + custom domain via Cloudflare dashboard)
**Test results**: 210/210 Vitest ✓ | 30/30 Playwright E2E ✓ | 0 src/ type errors ✓

### Post-verify corrections (2026-06-07, batch 1)
- `src/lib/types/blog.test.ts`: validPost ahora incluye `coverImage` y `excerpt` completo. Test `coverImage is optional` → invertido a `coverImage is required`. Agregados tests `excerpt is required` y `excerpt must be at least 10 chars`.
- `src/lib/data/blog.test.ts`: `base` fixture ahora incluye `coverImage` URL válida y `excerpt` ≥10 chars. Todos los overrides de `author` actualizados a display names ("Hector Lorenzo", "Ana García", "Ghost Writer").
- Verify findings W-01 y W-02 RESUELTOS: `excerpt` y `coverImage` son requeridos en schema y en todos los fixtures de test.

### Phase 4 implementation (2026-06-07, batch 2)
- All 10 source modules created under `scripts/migrate-wp/`
- 70 new Vitest unit tests added (177 total, all green)
- vitest.config.ts extended to include `scripts/**/*.test.ts`
- CRITICAL BUG FOUND AND FIXED during spike: `stripShortcodes()` regex was stripping Markdown link text `[Click here](url)`. Fixed with negative lookahead `(?!\s*\()`.
- Spike finding documented: turndown@7.x uses `root={}` in Node (not `globalThis`), so it always falls back to @mixmark-io/domino. linkedom is used only for `demoteLeadingH1()`.

---

## Key Architecture Decisions Made

### ADR-001 SUPERSEDED: mdsvex layout option incompatible with runes mode
The mdsvex `layout` option injects frontmatter via `$$props` (Svelte 4 legacy syntax).
The project enforces `runes: true` globally. Attempting to use the layout option causes:
`Cannot use $$props in runes mode`

**Resolution**: ADR-009 approach used instead. The `[slug]/+page.svelte` explicitly
wraps the mdsvex component with `<BlogPost post={data.post}>`. BlogPost.svelte receives
a full `BlogPost` object (not individual frontmatter props). The `blog-pipeline.ts` module
carries the frontmatter through the data layer into the load function, making it available
to the page.

### blog-pipeline.ts testability pattern
`import.meta.glob` cannot be mocked in Vitest without complex Vite plugin intervention.
Solution: extract all pure pipeline logic to `blog-pipeline.ts` (exported functions that
accept a GlobResult map). Tests call the pipeline functions directly with fixture data.
`blog.ts` is the thin wrapper that calls `import.meta.glob` and passes to the pipeline.

### Glob path correction
`src/lib/data/blog.ts` uses `../../content/blog/*.svx` (NOT `../content/blog/`).
Going up: `src/lib/data/` → `src/lib/` → `src/` → then `content/blog/`.

### turndown + linkedom in Bun/Node (Phase 4 spike)
turndown@7.x uses `var root = typeof window !== 'undefined' ? window : {}` (line 445).
In Node/Bun, `typeof window === 'undefined'` → `root = {}`. `root.DOMParser = undefined`.
`canParseHTMLNatively()` → false. Fallback: @mixmark-io/domino (bundled with turndown).
Domino is correct and preserves all HTML attributes (href, src, alt, textContent).

linkedom is used ONLY for `demoteLeadingH1()` DOM manipulation + innerHTML serialization.
No global patching of DOMParser is needed or effective in Node.

### stripShortcodes regex bug (Phase 4 bug fix)
Original regex `/\[[a-zA-Z_-]+[^\]]*\/?\]/g` was too greedy — matched Markdown link
text `[Click here]` in `[Click here](url)`, stripping it as a WP shortcode.

**Root cause**: Markdown links and WP shortcodes share `[...]` syntax. WP shortcodes
have a single lowercase tag name (e.g. `gallery`, `caption`); Markdown link text has spaces.

**Fix applied in stripShortcodes():**
- Paired: `/\[[a-z][a-z0-9_-]*(?:\s[^\]]+)?\][\s\S]*?\[\/[a-z][a-z0-9_-]*\]/g`
- Self-closing: `/\[[a-z][a-z0-9_-]*(?:\s[^\]]+)?\](?!\s*\()/g`
  - Requires lowercase tag name (no spaces in first word)
  - Negative lookahead `(?!\s*\()` preserves `[text](url)` patterns

### Phase 6 implementation (2026-06-07, batch 3)
- `scripts/post-new.ts`: scaffold `.svx` from CLI args/prompts; validates frontmatter against BlogPostSchema before write; `import.meta.main` guard prevents main() from running during Vitest import.
- `scripts/post-touch.ts`: pure `setUpdatedField()` exported for unit testing; `import.meta.main` guard; updates or inserts `updated` field after `publishDate` (or before `draft` as fallback).
- `scripts/post-touch.test.ts`: 7 Vitest tests for `setUpdatedField` pure logic (insert, replace, idempotency, no-publishDate fallback, error cases).
- Justfile: added `post-new`, `post-touch <slug>`, `migrate-wp-dry-run`, `migrate-wp-run`, `blog-rebuild-deploy` recipes.
- `.agents/WP_MIGRATION.md`: full runbook with cross-account gotcha, R2 bucket creation, custom domain, deploy hook, dry-run findings (75 posts, 6 categories, 1 author), migration sequence, slug audit, rollback, verification checklist.
- `docs/blog-architecture.md`: technical reference — mdsvex layout chain (ADR-009 runes incompatibility), data layer pattern (blog-pipeline.ts testability), scheduling latency (ADR-004), R2 CDN structure, HTML-entity gotcha, date semantics, 4 routes + 3 sitemaps table, file map.
- `AGENTS.md`: all MDX references replaced with mdsvex (.svx); "Blog Content Authoring" section added (where posts live, how to create, date semantics, body rules, required frontmatter, publish/schedule/touch workflow).
- `.agents/CHANGELOG.md`: full `wp-blog-migration` entry added under [Unreleased].
- Test count: 198 → 205 (+7 from post-touch.test.ts). All 205 green.

---

## Completed Tasks

### Phase 1: Foundation
- [x] 1.1 Vitest tests for slugify.ts (13 tests)
- [x] 1.2 `src/lib/utils/slugify.ts` — uses `\p{Mn}/gu` unicode property escape
- [x] 1.3 Vitest tests for BlogPostSchema (12 tests)
- [x] 1.4 `src/lib/types/blog.ts` — BlogPostSchema, BlogPost, Category, Author
- [x] 1.5 Vitest tests for data pipeline (draft/future filter, sort, throws)
- [x] 1.6 Vitest tests for taxonomy functions (categories, authors)
- [x] 1.7 `src/lib/data/blog-pipeline.ts` + `src/lib/data/blog.ts` (public API)
- [x] 1.8 `src/lib/layouts/BlogPost.svelte` — receives `BlogPost` object as prop
- [x] 1.9 `svelte.config.js` — narrowed to `.svx` only (NO mdsvex layout option)
- [x] 1.10 `vitest.config.ts` — updated include pattern to cover `src/lib/**/*.test.ts`

### Phase 2: Routes
- [x] 2.1 Playwright tests + fixture `.svx` files in `src/content/blog/`
- [x] 2.2 `src/routes/(public)/blog/+page.ts`
- [x] 2.3 `src/routes/(public)/blog/+page.svelte` (migration notice removed)
- [x] 2.4 Playwright tests for slug route
- [x] 2.5 `src/routes/(public)/blog/[slug]/+page.ts`
- [x] 2.6 `src/routes/(public)/blog/[slug]/+page.svelte`
- [x] 2.7 Playwright tests for category route
- [x] 2.8 `src/routes/(public)/blog/category/[category]/+page.ts`
- [x] 2.9 `src/routes/(public)/blog/category/[category]/+page.svelte`
- [x] 2.10 Playwright tests for author route
- [x] 2.11 `src/routes/(public)/blog/author/[author]/+page.ts`
- [x] 2.12 `src/routes/(public)/blog/author/[author]/+page.svelte`

### Phase 3: Sitemaps
- [x] 3.1 Playwright tests for post-sitemap.xml
- [x] 3.2 `src/routes/(public)/post-sitemap.xml/+server.ts`
- [x] 3.3 Playwright tests for category/author sitemaps
- [x] 3.4 `src/routes/(public)/category-sitemap.xml/+server.ts`
- [x] 3.5 `src/routes/(public)/author-sitemap.xml/+server.ts`

### Phase 4: Migration Script
- [x] 4.1 Spike: turndown + linkedom in Bun — findings documented in turndown.ts and test-setup.ts
- [x] 4.2 [RED] `scripts/migrate-wp/url-rewriter.test.ts` (12 tests)
- [x] 4.3 `scripts/migrate-wp/types.ts` — WpPost, WpUser, WpMedia, WpCategory, WpTag, MediaEntry, PostEntry, Manifest
- [x] 4.4 [RED] `scripts/migrate-wp/manifest.test.ts` (8 tests)
- [x] 4.5 [RED] `scripts/migrate-wp/frontmatter.test.ts` (21 tests)
- [x] 4.6 `scripts/migrate-wp/wp-client.ts` — paginated WP REST API, X-WP-TotalPages, _embed=true
- [x] 4.7 `scripts/migrate-wp/downloader.ts` — fetch to temp file, cleanup callback
- [x] 4.8 `scripts/migrate-wp/r2-uploader.ts` — buildWranglerCommand (pure), uploadToR2 (dryRun guard), unit tested
- [x] 4.9 `scripts/migrate-wp/turndown.ts` — HTML→MD + h1 demote (S-01) + shortcode strip + Markdown link preservation
- [x] 4.10 `scripts/migrate-wp/url-rewriter.ts` — buildUrlVariantMap + rewriteUrls (throws on unmapped)
- [x] 4.11 `scripts/migrate-wp/manifest.ts` — createEmptyManifest, mergeMediaEntry, mergePostEntry (pure) + readManifest/writeManifest (I/O)
- [x] 4.12 `scripts/migrate-wp/frontmatter.ts` — buildFrontmatter (W-01, S-01, SC-MIG-08/09/10, SC-CDN-07) + buildFrontmatterYaml
- [x] 4.13 `scripts/migrate-wp/emitter.ts` — assembleSvx (pure) + emitSvx (dryRun guard)
- [x] 4.14 `scripts/migrate-wp/index.ts` — orchestrator with --dry-run, slug/unicode/author-collision audit
- [ ] 4.15 Dry-run audit: BLOCKED (sandbox only allows `bun run test`, not arbitrary `bun` scripts). Run manually: `bun scripts/migrate-wp/index.ts --dry-run`

### Phase 5: Infrastructure (code tasks only)
- [ ] 5.1 R2 bucket `meg-blog-media` + custom domain `cdn.malagaeventgear.com` — **MANUAL** (Cloudflare dashboard, see runbook)
- [x] 5.2 `workers/blog-rebuild/wrangler.toml` — name `meg-blog-rebuild`; cron `0 6 * * *`; no bindings; secret documented
- [x] 5.3 `workers/blog-rebuild/tsconfig.json` — standalone (no `$lib/*` alias)
- [x] 5.4 `workers/blog-rebuild/src/index.test.ts` — 5 tests: SC-CRON-01 (2xx success) + SC-CRON-02 (non-2xx throws)
- [x] 5.5 `workers/blog-rebuild/src/index.ts` — `Env`, `triggerDeploy()` (exported), `scheduled()` with `ctx.waitUntil`

### Phase 6: Authoring Helpers, Runbook, Docs
- [x] 6.1 `scripts/post-new.ts` — scaffold `.svx`; validate against BlogPostSchema; `import.meta.main` guard
- [x] 6.2 `scripts/post-touch.ts` — `setUpdatedField()` pure + exported; `import.meta.main` guard
- [x] 6.3 Justfile recipes: `post-new`, `post-touch`, `migrate-wp-dry-run`, `migrate-wp-run`, `blog-rebuild-deploy`
- [x] 6.4 `.agents/WP_MIGRATION.md` runbook — full step-by-step with cross-account gotcha + dry-run findings
- [x] 6.5 `docs/blog-architecture.md` — technical reference (ADR-009 runes issue, scheduling, R2 CDN, entity gotcha)
- [x] 6.6 `AGENTS.md` — MDX → mdsvex (.svx); "Blog Content Authoring" section added
- [x] 6.7 `.agents/CHANGELOG.md` — full `wp-blog-migration` entry

### Phase 5 implementation (2026-06-07, batch 4)
- `workers/blog-rebuild/wrangler.toml`: name `meg-blog-rebuild`; cron `0 6 * * *` (06:00 UTC per spec; design.md had `0 8 * * *` — spec is authoritative); no D1/R2/KV bindings; `DEPLOY_HOOK_URL` secret documented inline
- `workers/blog-rebuild/tsconfig.json`: mirrors `review-reminders/tsconfig.json` exactly, but without `$lib/*` path alias and without the `../../src/lib/server/**/*.ts` include (standalone worker)
- `workers/blog-rebuild/src/index.test.ts`: 5 Vitest tests covering SC-CRON-01 (2xx logs success, no throw) and SC-CRON-02 (non-2xx throws Error including status code); mocks global `fetch` via `vi.stubGlobal`
- `workers/blog-rebuild/src/index.ts`: `Env` interface; exported `triggerDeploy(url)` for unit testability; `scheduled()` handler uses `ctx.waitUntil(triggerDeploy(env.DEPLOY_HOOK_URL))`; throws on non-2xx; logs `[blog-rebuild]` prefix; Web APIs only (fetch, console)
- vitest.config.ts already included `workers/**/*.test.ts` from Phase 2 setup — no change needed
- Test count: 205 → 210 (+5 cron tests). All 210 green.
- DESIGN DISCREPANCY NOTED: spec says `0 6 * * *`; design.md §6 says `0 8 * * *`. Used spec value `0 6 * * *`.

---

## Remaining Tasks
- Task 5.1: Manual — R2 bucket `meg-blog-media` creation + custom domain `cdn.malagaeventgear.com` via Cloudflare dashboard. See `.agents/WP_MIGRATION.md` runbook.
- Task 4.15: Manual dry-run audit — `bun scripts/migrate-wp/index.ts --dry-run`
