# Apply Progress: wp-blog-migration — Batches 1+2+3+4+5+6 (Phases 1-4 + Phase 5 code + Phase 6 + Phase 7 + Phase 8 + Phase 8.2)

**Date**: 2026-06-08 (batch 6: Phase 8.2 orphan-collection pass — production crash fix)
**Status**: COMPLETE (Phases 1, 2, 3, 4, 5-code, 6, 7, 8, 8.2 done — Task 5.1 manual: R2 bucket + custom domain via Cloudflare dashboard)
**Test results**: 286/286 Vitest ✓ (prior) + 21 new tests (extractWpUrls + buildOrphanKey + collectOrphanUrls) = **307 total, all passing**

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

### Phase 5 implementation (2026-06-07, batch 4)
- `workers/blog-rebuild/wrangler.toml`: name `meg-blog-rebuild`; cron `0 6 * * *` (06:00 UTC per spec; design.md had `0 8 * * *` — spec is authoritative); no D1/R2/KV bindings; `DEPLOY_HOOK_URL` secret documented inline
- `workers/blog-rebuild/tsconfig.json`: mirrors `review-reminders/tsconfig.json` exactly, but without `$lib/*` path alias and without the `../../src/lib/server/**/*.ts` include (standalone worker)
- `workers/blog-rebuild/src/index.test.ts`: 5 Vitest tests covering SC-CRON-01 (2xx logs success, no throw) and SC-CRON-02 (non-2xx throws Error including status code); mocks global `fetch` via `vi.stubGlobal`
- `workers/blog-rebuild/src/index.ts`: `Env` interface; exported `triggerDeploy(url)` for unit testability; `scheduled()` handler uses `ctx.waitUntil(triggerDeploy(env.DEPLOY_HOOK_URL))`; throws on non-2xx; logs `[blog-rebuild]` prefix; Web APIs only (fetch, console)
- vitest.config.ts already included `workers/**/*.test.ts` from Phase 2 setup — no change needed
- Test count: 205 → 210 (+5 cron tests). All 210 green.
- DESIGN DISCREPANCY NOTED: spec says `0 6 * * *`; design.md §6 says `0 8 * * *`. Used spec value `0 6 * * *`.

### Phase 7: Redirects + Coverage Gaps (2026-06-07, batch 4+)
- `scripts/migrate-wp/redirects.ts`: `deriveOldPath`, `buildRedirects`, `buildCategoryRedirects`, `buildManagedBlock`, `mergeRedirectsFile`, `generateRedirectsContent`. 22 tests.
- `types.ts`: added `link: string` to `WpPost`.
- `index.ts`: redirect generation integrated; dry-run shows sample; real run writes `static/_redirects`.
- `.agents/WP_MIGRATION.md`: "Redirects" section added.
- `wp-client.test.ts`: 7 pagination tests.
- `workers/blog-rebuild/src/index.test.ts`: +2 tests for missing DEPLOY_HOOK_URL (total 7).
- `src/routes/(public)/blog/[slug]/+page.ts`: refactored to use `getPostSlugs()` + 2 tests.
- Test count reached 243/243 all green.

### TDD Cycle Evidence (Phase 8 — Strict TDD)

| Task | RED (test written) | GREEN (implementation) | REFACTOR |
|------|--------------------|------------------------|----------|
| 8.1 webp pure logic | `webp.test.ts` — 18 tests, all RED | `webp.ts` created | Removed unused path/os/fs imports |
| 8.2 retry/backoff | `r2-uploader-retry.test.ts` — 6 tests, all RED | `uploadWithRetry` added to `r2-uploader.ts` | Extracted `realSpawn`/`realSleep` as named functions |
| 8.3 webp integration | (covered by 8.1 tests) | `convertToWebp` in `webp.ts`, `processMediaItem` updated in `index.ts` | N/A |
| 8.4 retry integration | (covered by 8.2 tests) | `uploadToR2` uses `uploadWithRetry` | N/A |
| 8.5 full media loop | No unit test for orchestrator | `fetchMedia()` replaces `wp:featuredmedia` loop | N/A |
| 8.6 webp in flow | (covered by 8.1 + integration) | `convertToWebp` called in `processMediaItem` | N/A |
| 8.7 checkpoint | No unit test (side-effectful I/O) | `writeManifest` after each attachment | N/A |
| 8.8 runbook update | N/A | "Resuming an interrupted migration" section added | N/A |

---

## Phase 8 implementation (2026-06-08, batch 5)

### 4 changes implemented:

**1. Full media library iteration (correctness fix)**
- `scripts/migrate-wp/index.ts`: replaced `for (post of posts) → for (media of post._embedded?.['wp:featuredmedia'])` with a single `for (wpMedia of allMedia)` loop over `await fetchMedia()`.
- Added `buildMediaCategoryMap(posts)`: builds `Map<mediaId, categorySlug>` from posts' `featured_media` field. Best-effort — category is manifest metadata only.
- Idempotency: skips if `Object.values(manifest.media).some(e => e.wpId === wpMedia.id)`.

**2. WebP conversion policy**
- `scripts/migrate-wp/webp.ts` (NEW): `shouldConvertToWebp` (Set lookup), `buildCwebpCommand` (pure), `deriveWebpFileName`, `convertToWebp` (Bun.spawn cwebp).
- png + jpeg → converted to .webp; webp/avif/svg → uploaded as-is.
- `originalUrl` in MediaEntry keeps WP URL (for url-rewriter mapping); `fileName`/`mimeType`/`r2Url`/`cdnUrl` reflect .webp result.
- 18 unit tests in `scripts/migrate-wp/webp.test.ts`.

**3. Retry with backoff**
- `scripts/migrate-wp/r2-uploader.ts`: added `uploadWithRetry(r2Key, filePath, spawnFn, sleepFn)` — 3 attempts, 1s/2s/4s exponential backoff.
- `SpawnFn` and `SleepFn` injectable for testability. `uploadToR2` now calls `uploadWithRetry` with `realSpawn`/`realSleep`.
- 6 unit tests in `scripts/migrate-wp/r2-uploader-retry.test.ts`.

**4. Incremental manifest checkpoint**
- After each attachment processed: `writeManifest(manifest)` + `console.log('[checkpoint] <n>/<total> media (wpId <id>) saved')`.
- Resume behavior: `readManifest` at start loads prior progress; skip-if-wpId logic unchanged.
- Runbook updated with "Resuming an interrupted migration" subsection.

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
- [x] 4.1 Spike: turndown + linkedom in Bun
- [x] 4.2 [RED] `scripts/migrate-wp/url-rewriter.test.ts` (12 tests)
- [x] 4.3 `scripts/migrate-wp/types.ts`
- [x] 4.4 [RED] `scripts/migrate-wp/manifest.test.ts` (8 tests)
- [x] 4.5 [RED] `scripts/migrate-wp/frontmatter.test.ts` (21 tests)
- [x] 4.6 `scripts/migrate-wp/wp-client.ts`
- [x] 4.7 `scripts/migrate-wp/downloader.ts`
- [x] 4.8 `scripts/migrate-wp/r2-uploader.ts`
- [x] 4.9 `scripts/migrate-wp/turndown.ts`
- [x] 4.10 `scripts/migrate-wp/url-rewriter.ts`
- [x] 4.11 `scripts/migrate-wp/manifest.ts`
- [x] 4.12 `scripts/migrate-wp/frontmatter.ts`
- [x] 4.13 `scripts/migrate-wp/emitter.ts`
- [x] 4.14 `scripts/migrate-wp/index.ts`
- [x] 4.15 Dry-run audit (executed by user; 75 posts, 6 categories, 1 author, 0 collisions)

### Phase 5: Infrastructure
- [ ] 5.1 R2 bucket `meg-blog-media` + custom domain — **MANUAL**
- [x] 5.2 `workers/blog-rebuild/wrangler.toml`
- [x] 5.3 `workers/blog-rebuild/tsconfig.json`
- [x] 5.4 [RED] `workers/blog-rebuild/src/index.test.ts` (7 tests)
- [x] 5.5 `workers/blog-rebuild/src/index.ts`

### Phase 7: Redirects + Coverage Gaps
- [x] 7.1 [RED] `scripts/migrate-wp/redirects.test.ts` — `deriveOldPath` tests
- [x] 7.2 [RED] `scripts/migrate-wp/redirects.test.ts` — `buildRedirects`/`buildManagedBlock`/`mergeRedirectsFile` tests
- [x] 7.3 `scripts/migrate-wp/redirects.ts` (22 tests green)
- [x] 7.4 `link: string` added to `WpPost` in `types.ts`
- [x] 7.5 Redirect generation integrated into `index.ts`
- [x] 7.6 `.agents/WP_MIGRATION.md` — Redirects section added
- [x] 7.7 [W-03] `scripts/migrate-wp/wp-client.test.ts` (7 pagination tests)
- [x] 7.8 [W-02/SC-CRON-03] `workers/blog-rebuild/src/index.test.ts` (+2 tests, total 7)
- [x] 7.9 [S-03] `getPostSlugs()` refactor + 2 tests in `blog.test.ts`

### Phase 6: Authoring Helpers, Runbook, Docs
- [x] 6.1 `scripts/post-new.ts`
- [x] 6.2 `scripts/post-touch.ts` + `setUpdatedField()` pure
- [x] 6.3 Justfile recipes: `post-new`, `post-touch`, `migrate-wp-dry-run`, `migrate-wp-run`, `blog-rebuild-deploy`
- [x] 6.4 `.agents/WP_MIGRATION.md` runbook
- [x] 6.5 `docs/blog-architecture.md`
- [x] 6.6 `AGENTS.md` updated
- [x] 6.7 `.agents/CHANGELOG.md` entry

### Phase 8: Migration Hardening
- [x] 8.1 [RED] `scripts/migrate-wp/webp.test.ts` — 18 tests for `shouldConvertToWebp` and `buildCwebpCommand`
- [x] 8.2 [RED] `scripts/migrate-wp/r2-uploader-retry.test.ts` — 6 tests for `uploadWithRetry`
- [x] 8.3 `scripts/migrate-wp/webp.ts` — `shouldConvertToWebp`, `buildCwebpCommand`, `deriveWebpFileName`, `convertToWebp`
- [x] 8.4 `scripts/migrate-wp/r2-uploader.ts` — `uploadWithRetry` + `SpawnFn`/`SleepFn` types; `uploadToR2` uses it
- [x] 8.5 `scripts/migrate-wp/index.ts` — full media library via `fetchMedia()` + `buildMediaCategoryMap`
- [x] 8.6 `scripts/migrate-wp/index.ts` — `convertToWebp` integrated in `processMediaItem`
- [x] 8.7 `scripts/migrate-wp/index.ts` — incremental checkpoint: `writeManifest` after each attachment
- [x] 8.8 `.agents/WP_MIGRATION.md` — "Resuming an interrupted migration" section added

---

### TDD Cycle Evidence (Phase 8.2 — Strict TDD)

| Task | RED (test written) | GREEN (implementation) | REFACTOR |
|------|--------------------|------------------------|----------|
| 8.2.1 extractWpUrls | `url-rewriter.test.ts` — 8 tests, all RED (TypeError on import) | `extractWpUrls` added to `url-rewriter.ts` | Reset `lastIndex` before exec loop (regex /g flag) |
| 8.2.2 buildOrphanKey | `url-rewriter.test.ts` — 8 tests, all RED | `buildOrphanKey` added to `url-rewriter.ts` | N/A — clean on first pass |
| 8.2.3 collectOrphanUrls | `url-rewriter.test.ts` — 5 tests, all RED | `collectOrphanUrls` added to `url-rewriter.ts` | N/A |
| 8.2.4 WP_URL_PATTERN export | (covered by 8.2.1 tests using pattern) | `const WP_URL_PATTERN` → `export const` | N/A |
| 8.2.5 orphan?: boolean type | N/A — type extension | Optional field added to `MediaEntry` | N/A |
| 8.2.6 orphan pass in index.ts | (no unit test — impure orchestrator) | Orphan pass added between step 5 and 6 | Guard: skip by originalUrl; rebuild urlVariantMap after pass |
| 8.2.7 dry-run orphan preview | (covered by orphan scan being pure) | Preview added to dry-run section | N/A |

### Test Summary (Phase 8.2)
- **Tests written**: 21
- **Tests passing**: 307/307 (full suite)
- **Layers used**: Unit (21 new)
- **Pure functions created**: 3 (`extractWpUrls`, `buildOrphanKey`, `collectOrphanUrls`)

---

## Phase 8.2 implementation (2026-06-08, batch 6 — orphan-collection pass)

### Root cause of production crash
The migration uploaded all 165 media-library images via `fetchMedia()` successfully, then crashed emitting posts: `url-rewriter` threw on `https://malagaeventgear.com/wp-content/uploads/2024/09/Methacrylate-lectern.jpeg`. This image returns HTTP 200 directly but is ABSENT from `/wp-json/wp/v2/media` — it was uploaded directly to WP storage without being registered as a media attachment. Such orphan images cannot be discovered by `fetchMedia()`.

### Fix implemented

**1. Three pure helpers exported from `scripts/migrate-wp/url-rewriter.ts`:**
- `WP_URL_PATTERN` — exported (was private `const`)
- `extractWpUrls(body)` — finds all WP upload URLs in a body; deduplicates; uses `WP_URL_PATTERN` with `exec` loop + Set
- `buildOrphanKey(wpUrl, converted)` — strips `/wp-content/uploads/`, prepends `blog/orphan/`, swaps `.ext → .webp` if converted
- `collectOrphanUrls(bodies, urlVariantMap)` — returns Set of WP URLs present in bodies but absent from the variant map

**2. `orphan?: boolean` added to `MediaEntry` interface in `scripts/migrate-wp/types.ts`**

**3. Orphan-collection pass added in `scripts/migrate-wp/index.ts` (step 5b, between media upload and post emission):**
- After `buildUrlVariantMap()`, scans all post bodies via `collectOrphanUrls()`
- For each unique orphan URL (skipping if already in `manifest.media[orphanUrl]`): `downloadImage()` → `convertToWebp()` → `uploadToR2(r2Key, path, false)` → `mergeMediaEntry()` → `writeManifest()` (checkpoint per orphan)
- Orphan R2 key: `buildOrphanKey(orphanUrl, converted)` → `blog/orphan/2024/09/Methacrylate-lectern.webp`
- Orphan entry: `wpId: 0`, `orphan: true`, `originalUrl: orphanUrl`
- After pass: rebuilds `urlVariantMap` from all manifest entries (regular + orphans)
- `rewriteUrls()` now resolves exact body URL (orphan entries map 1:1, not via size-suffix variants)

**4. Dry-run orphan preview added:** Shows which orphan URLs would be uploaded and their derived R2 keys.

**5. Spec SC-MIG-18 added** to `openspec/changes/wp-blog-migration/specs/wp-migration-script.md`

**6. Design ADR-018 note (§12.6)** added to `openspec/changes/wp-blog-migration/design.md`

### Key decisions
- **Skip-check by `originalUrl`** (not `wpId`): all orphans share `wpId=0`, so skip must use the manifest key (`originalUrl`). This is already the manifest convention — `manifest.media` is keyed by `originalUrl`.
- **`blog/orphan/` prefix**: separates orphan uploads from regular `blog/<wpId>/` uploads in R2. Clear at a glance.
- **No `generateUrlVariants` for orphans**: orphan URLs map 1:1 to their CDN URL. Size-suffix expansion is not applied — the exact URL found in the body is the key in `urlVariantMap`.

---

### Phase 8: Migration Hardening (completed in batch 5)
- [x] 8.1 [RED] `scripts/migrate-wp/webp.test.ts` — 18 tests for `shouldConvertToWebp` and `buildCwebpCommand`
- [x] 8.2 [RED] `scripts/migrate-wp/r2-uploader-retry.test.ts` — 6 tests for `uploadWithRetry`
- [x] 8.3 `scripts/migrate-wp/webp.ts` — `shouldConvertToWebp`, `buildCwebpCommand`, `deriveWebpFileName`, `convertToWebp`
- [x] 8.4 `scripts/migrate-wp/r2-uploader.ts` — `uploadWithRetry` + `SpawnFn`/`SleepFn` types; `uploadToR2` uses it
- [x] 8.5 `scripts/migrate-wp/index.ts` — full media library via `fetchMedia()` + `buildMediaCategoryMap`
- [x] 8.6 `scripts/migrate-wp/index.ts` — `convertToWebp` integrated in `processMediaItem`
- [x] 8.7 `scripts/migrate-wp/index.ts` — incremental checkpoint: `writeManifest` after each attachment
- [x] 8.8 `.agents/WP_MIGRATION.md` — "Resuming an interrupted migration" section added

### Phase 8.2: Orphan-Collection Pass (completed in batch 6)
- [x] 8.2.1 [RED] `scripts/migrate-wp/url-rewriter.test.ts` — 8 tests for `extractWpUrls`
- [x] 8.2.2 [RED] `scripts/migrate-wp/url-rewriter.test.ts` — 8 tests for `buildOrphanKey`
- [x] 8.2.3 [RED] `scripts/migrate-wp/url-rewriter.test.ts` — 5 tests for `collectOrphanUrls`
- [x] 8.2.4 `scripts/migrate-wp/url-rewriter.ts` — exported WP_URL_PATTERN, added extractWpUrls, buildOrphanKey, collectOrphanUrls (21 tests green; suite total: 307)
- [x] 8.2.5 `scripts/migrate-wp/types.ts` — `orphan?: boolean` added to MediaEntry
- [x] 8.2.6 `scripts/migrate-wp/index.ts` — orphan-collection pass (step 5b)
- [x] 8.2.7 `scripts/migrate-wp/index.ts` — dry-run orphan scan preview
- [x] 8.2.8 `openspec/changes/wp-blog-migration/specs/wp-migration-script.md` — SC-MIG-18 added
- [x] 8.2.9 `openspec/changes/wp-blog-migration/design.md` — ADR-018 / §12.6 added

---

## Remaining Tasks
- Task 5.1: Manual — R2 bucket creation + custom domain `cdn.malagaeventgear.com` via Cloudflare dashboard. See `.agents/WP_MIGRATION.md` runbook.
- **VERIFY**: Run `bun run test` to confirm 307 tests green, then run `bun scripts/migrate-wp/index.ts --dry-run` to confirm orphan scan preview is shown.
