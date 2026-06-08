# Tasks: WordPress Blog Migration to Native mdsvex Blog

> Strict TDD: every implementation task is preceded by a RED (failing test) task.
> Phases 1-3 are sequential. Phase 4 (migration script) and Phase 5 (infra) can run in parallel after Phase 1 completes. Phase 6 requires Phases 1-5.

---

## Phase 1: Foundation — Types, Slugify, Data Layer, mdsvex Config

- [x] 1.1 **[RED]** Write Vitest tests for `src/lib/utils/slugify.ts`: ASCII, unicode NFD (`"María"→"maria"`), special chars, no leading/trailing `-`, idempotency. (Design §9)
- [x] 1.2 Create `src/lib/utils/slugify.ts` — `slugify(name: string): string`. Make 1.1 green. (ADR-010)
- [x] 1.3 **[RED]** Write Vitest tests for `BlogPostSchema` in `src/lib/types/blog.ts`: valid data passes; missing `title` throws; invalid `publishDate` throws; `draft` defaults `false`; `categories` defaults `[]`. (spec SC-BC-05)
- [x] 1.4 Create `src/lib/types/blog.ts` — `BlogPostSchema`, `BlogPost`, `Category`, `Author` types. Make 1.3 green. (Design §3)
- [x] 1.5 **[RED]** Write Vitest tests for `src/lib/data/blog.ts` mocking `import.meta.glob`: draft excluded (SC-BC-02); future `publishDate` excluded (SC-BC-03); past `publishDate` included (SC-BC-04); invalid frontmatter throws (SC-BC-05); sorts by `date` descending (SC-BC-06/SC-BC-14). [Implemented via blog-pipeline.ts testable harness]
- [x] 1.6 **[RED]** Write Vitest tests for `getCategories()`, `getPostsByCategory()`, `getAuthors()`, `getPostsByAuthor()`: SC-TAX-01 through SC-TAX-03, SC-TAX-09, SC-TAX-10.
- [x] 1.7 Create `src/lib/data/blog.ts` — `getAllPosts`, `getPostBySlug`, `getCategories`, `getPostsByCategory`, `getAuthors`, `getPostsByAuthor`. Make 1.5 and 1.6 green. (Design §3) [+ blog-pipeline.ts for testability]
- [x] 1.8 Create `src/lib/layouts/BlogPost.svelte` — Svelte 5 runes; `$props()` for all `BlogPost` fields; `buildArticleSchema()`; `<SeoHead>`; `<h1>` title; publish date, author link, category links, cover image, slot. (spec SC-BC-08, SC-BC-10, SC-TAX-15-17) [Receives BlogPost object — not mdsvex layout props due to runes mode incompatibility]
- [x] 1.9 Update `svelte.config.js` — narrow extensions to `['.svx']` only; add `.svx` to SvelteKit `extensions`. (ADR-002) [layout option NOT added — mdsvex $$props breaks runes mode; ADR-009 approach used instead]
- [x] 1.10 Vitest already present — updated vitest.config.ts to include `src/lib/**/*.test.ts` pattern.

---

## Phase 2: Routes

- [x] 2.1 **[RED — E2E]** Write Playwright tests: `/blog/` returns 200 and shows at least one post card; no migration notice text (SC-BC-07); category badges link to `/blog/category/*/`; i18n EN chrome (SC-BC-11). Add fixture `.svx` files to `src/content/blog/` for test use.
- [x] 2.2 Create `src/routes/(public)/blog/+page.ts` — `prerender = true`; `load` returns `getAllPosts()`. (ADR-008)
- [x] 2.3 Replace `src/routes/(public)/blog/+page.svelte` — post card list sorted by `date` desc; each card shows title, excerpt, publishDate, coverImage, category links; `CollectionPage` JSON-LD via `<SeoHead>`; EN/ES i18n; remove migration notice. (SC-BC-06, SC-BC-07, SC-BC-11, SC-BC-12)
- [x] 2.4 **[RED — E2E]** Write Playwright tests: `/blog/[slug]/` returns 200; `<h1>` = post title; JSON-LD `"@type":"BlogPosting"`; unknown slug returns 404. (SC-BC-08, SC-BC-09, SC-BC-10)
- [x] 2.5 Create `src/routes/(public)/blog/[slug]/+page.ts` — `prerender = true`; `entries()` from `getAllPosts()`; `load` calls `getPostBySlug`; throws `error(404)` if not found. (SC-BC-09, SC-BC-13)
- [x] 2.6 Create `src/routes/(public)/blog/[slug]/+page.svelte` — wraps `<BlogPost post={data.post}>` with mdsvex body component; no duplicate JSON-LD. (ADR-009)
- [x] 2.7 **[RED — E2E]** Write Playwright tests: `/blog/category/[category]/` returns 200; lists only posts from that category; unknown category returns 404; canonical URL correct; CollectionPage JSON-LD present. (SC-TAX-04, SC-TAX-05, SC-TAX-06, SC-TAX-07, SC-TAX-08)
- [x] 2.8 Create `src/routes/(public)/blog/category/[category]/+page.ts` — `prerender = true`; `entries()` from `getCategories()`; `load` calls `getPostsByCategory`; `error(404)` if empty. (SC-TAX-04, SC-TAX-05)
- [x] 2.9 Create `src/routes/(public)/blog/category/[category]/+page.svelte` — category heading; PostCard list; `<SeoHead>` with canonical, CollectionPage JSON-LD; EN/ES i18n. (SC-TAX-06, SC-TAX-07)
- [x] 2.10 **[RED — E2E]** Write Playwright tests: `/blog/author/[author]/` returns 200; author display name in heading; lists only that author's posts; unknown author returns 404; CollectionPage JSON-LD. (SC-TAX-11, SC-TAX-12, SC-TAX-13, SC-TAX-14)
- [x] 2.11 Create `src/routes/(public)/blog/author/[author]/+page.ts` — `prerender = true`; `entries()` from `getAuthors()`; `load` returns `{ posts, authorMeta: Author }`; `error(404)` if empty. (ADR-011)
- [x] 2.12 Create `src/routes/(public)/blog/author/[author]/+page.svelte` — `data.authorMeta.name` as heading; PostCard list; `<SeoHead>` with canonical, CollectionPage JSON-LD; EN/ES i18n.

---

## Phase 3: Sitemaps

- [x] 3.1 **[RED — E2E]** Write Playwright tests for `post-sitemap.xml`: status 200; `Content-Type: application/xml`; at least one `<url>`; trailing slash on `<loc>`; `<lastmod>` uses `updated` when present, falls back to `publishDate`; draft posts excluded; `<image:image>` block present for posts with coverImage. (SC-SM-01 through SC-SM-07)
- [x] 3.2 Update `src/routes/(public)/post-sitemap.xml/+server.ts` — import `getAllPosts()`; emit `<url>` per post; `<loc>` with trailing slash; `<lastmod> = updated ?? publishDate`; `<image:image>` block for posts with `coverImage`. (SC-SM-01–07, SC-SM-12)
- [x] 3.3 **[RED — E2E]** Write Playwright tests for `category-sitemap.xml` and `author-sitemap.xml`: one `<url>` per category/author; trailing slash; `<lastmod>` = max `updated ?? publishDate` across posts; correct `Content-Type`. (SC-SM-08, SC-SM-08b, SC-SM-09, SC-SM-09b, SC-SM-10)
- [x] 3.4 Update `src/routes/(public)/category-sitemap.xml/+server.ts` — import `getCategories()`; one `<url>` per Category; `<loc>` = `/blog/category/{slug}/`; `<lastmod>` from `Category.lastmod`. (SC-SM-08, SC-SM-08b)
- [x] 3.5 Update `src/routes/(public)/author-sitemap.xml/+server.ts` — import `getAuthors()`; one `<url>` per Author; `<loc>` = `/blog/author/{slug}/`; `<lastmod>` from `Author.lastmod`. (SC-SM-09, SC-SM-09b)

---

## Phase 4: Migration Script (parallel with Phase 5 after Phase 1)

- [x] 4.1 **Spike**: resolve Bun DOM dependency for `turndown` — linkedom used for DOM manipulation (h1 demote); turndown uses bundled @mixmark-io/domino in Node/Bun (no DOMParser on root={}).
- [x] 4.2 **[RED]** Write Vitest tests for `scripts/migrate-wp/url-rewriter.ts`: http/https variants; www/no-www; size-suffixed filenames; non-WP URLs unchanged; unmapped URL throws.
- [x] 4.3 Create `scripts/migrate-wp/types.ts` — `Manifest`, `MediaEntry`, `PostEntry`, `WpPost`, `WpUser`, `WpMedia`, `WpCategory`, `WpTag` interfaces. (Design §4)
- [x] 4.4 **[RED]** Write Vitest tests for `scripts/migrate-wp/manifest.ts`: idempotency (same `wpId` → existing entry returned); merge (new entry added without overwriting existing); round-trip serialization.
- [x] 4.5 **[RED]** Write Vitest tests for `scripts/migrate-wp/frontmatter.ts`: valid YAML from WP post object; `updated` omitted when equal to `date` (SC-MIG-09); `excerpt` derived from body when WP excerpt empty (SC-MIG-08); `coverImage` defaults to site OG image when no featured image (SC-CDN-07).
- [x] 4.6 Create `scripts/migrate-wp/wp-client.ts` — paginated WP REST API fetch; `X-WP-TotalPages` pagination; supports `posts`, `categories`, `tags`, `users`, `media` with `_embed=true`; logs total counts. (spec SC-MIG-11)
- [x] 4.7 Create `scripts/migrate-wp/downloader.ts` — fetch image buffer from WP URL to temp file; clean up after upload.
- [x] 4.8 Create `scripts/migrate-wp/r2-uploader.ts` — `Bun.spawn` wrangler CLI with `CLOUDFLARE_ACCOUNT_ID=cc26ab18f887fb1c63c19e17a0bb313f`; guarded by dryRun flag; no failure on existing key. (spec §3)
- [x] 4.9 Create `scripts/migrate-wp/turndown.ts` — HTML→Markdown via turndown (domino fallback) + linkedom for h1 demote; strip WP shortcodes; `<img>` → `![alt](url)`. (SC-MIG-12, S-01)
- [x] 4.10 Create `scripts/migrate-wp/url-rewriter.ts` — make 4.2 green; build `urlVariantMap`; regex replace all WP image domain occurrences; exit non-zero on unmapped URL. (SC-CDN-04, SC-CDN-05)
- [x] 4.11 Create `scripts/migrate-wp/manifest.ts` — make 4.4 green; read/write `manifest.json`; merge strategy for idempotency.
- [x] 4.12 Create `scripts/migrate-wp/frontmatter.ts` — make 4.5 green; emit YAML frontmatter block from WP post. (SC-MIG-09, SC-MIG-10)
- [x] 4.13 Create `scripts/migrate-wp/emitter.ts` — write `src/content/blog/<slug>.svx`; overwrite on re-run. (SC-MIG-07)
- [x] 4.14 Create `scripts/migrate-wp/index.ts` — orchestrator; `--dry-run` flag; calls modules in order; logs final summary with slug/unicode/author-collision audit. (SC-MIG-02, SC-MIG-11)
- [x] 4.15 **Dry-run audit**: Executed by user against 75 live MEG posts. Findings: 6 categories (incl. "Corporate &amp; Enterprise"), 1 author ("Hector Luis Lorenzo"), no slug collisions, no unicode post slugs. BUG FOUND AND FIXED: WP REST API returns HTML entities unescaped in non-rendered fields (titles, category names, tags, excerpts, author names). Fix: `decode-entities.ts` helper added; applied to all WP string fields in frontmatter.ts, index.ts. Risk #5 (uploadedBy hardcoded) also fixed — now derived from post author display_name. 198/198 tests green.

---

## Phase 5: Infrastructure (parallel with Phase 4 after Phase 1)

- [ ] 5.1 Create R2 bucket `images` via Cloudflare dashboard under account `cc26ab18f887fb1c63c19e17a0bb313f`; connect custom domain `cdn.malagaeventgear.com`. (spec SC-CDN-01) — **MANUAL STEP: see `.agents/WP_MIGRATION.md` runbook**
- [x] 5.2 Create `workers/blog-rebuild/wrangler.toml` — name `meg-blog-rebuild`; cron `0 6 * * *` (spec); no D1/R2/KV bindings; document `wrangler secret put DEPLOY_HOOK_URL`. (Design §6)
- [x] 5.3 Create `workers/blog-rebuild/tsconfig.json` — mirrors `review-reminders/tsconfig.json` without `$lib/*` alias. (Design §6)
- [x] 5.4 **[RED]** Write Vitest tests for `workers/blog-rebuild/src/index.ts`: 2xx response logs success and does not throw (SC-CRON-01); non-2xx throws Error with status code (SC-CRON-02).
- [x] 5.5 Create `workers/blog-rebuild/src/index.ts` — `Env` interface; `scheduled()` handler; POST to `DEPLOY_HOOK_URL`; throw on non-2xx. Make 5.4 green. (SC-CRON-01, SC-CRON-02)

---

## Phase 7: Redirects + Coverage Gaps (2026-06-07)

- [x] 7.1 **[RED]** Write Vitest tests for `deriveOldPath` in `scripts/migrate-wp/redirects.ts`: strips https domain (SC-BR-04); appends missing trailing slash (SC-BR-05); handles http/www/query/hash; throws TypeError for non-URL/wrong domain (SC-BR-06).
- [x] 7.2 **[RED]** Write Vitest tests for `buildRedirects`, `buildManagedBlock`, `mergeRedirectsFile`: correct rule format (SC-BR-07); idempotency (SC-BR-08); no wildcard; unrelated rules preserved (SC-BR-09); merge replaces block not appends.
- [x] 7.3 Create `scripts/migrate-wp/redirects.ts` — `deriveOldPath`, `buildRedirects`, `buildCategoryRedirects`, `buildManagedBlock`, `mergeRedirectsFile`, `generateRedirectsContent`. Make 7.1+7.2 green (22 tests).
- [x] 7.4 Add `link: string` field to `WpPost` interface in `scripts/migrate-wp/types.ts`.
- [x] 7.5 Integrate redirect generation into `scripts/migrate-wp/index.ts`: fetch categories; call `generateRedirectsContent`; dry-run prints sample; real run writes `static/_redirects`.
- [x] 7.6 Update `.agents/WP_MIGRATION.md` runbook — add "Redirects" section (how `_redirects` is generated, verification commands, post-deploy checklist).
- [x] 7.7 **[W-03]** Add Vitest tests for `wp-client.ts` pagination: single-page (1 fetch), multi-page (3 fetches, all concatenated), correct URL params, missing header defaults to 1 page, non-2xx throws (7 tests).
- [x] 7.8 **[W-02/SC-CRON-03]** Add Vitest tests to `workers/blog-rebuild/src/index.test.ts` for `DEPLOY_HOOK_URL` missing/undefined → handler throws, errors not swallowed (2 new tests; total 7).
- [x] 7.9 **[S-03]** Refactor `src/routes/(public)/blog/[slug]/+page.ts` entries generator to use `getPostSlugs()` instead of `getAllPosts().map(...)`. Add 2 Vitest tests in `blog.test.ts` documenting slug consistency.

---

## Phase 8: Migration Hardening (2026-06-08)

- [x] 8.1 **[RED]** Write Vitest tests for `shouldConvertToWebp` and `buildCwebpCommand` in `scripts/migrate-wp/webp.ts` (18 tests — pure logic).
- [x] 8.2 **[RED]** Write Vitest tests for `uploadWithRetry` in `scripts/migrate-wp/r2-uploader.ts` (6 tests — injectable spawn/sleep).
- [x] 8.3 Create `scripts/migrate-wp/webp.ts` — `shouldConvertToWebp`, `buildCwebpCommand`, `deriveWebpFileName`, `convertToWebp` (impure Bun.spawn wrapper). Make 8.1 green.
- [x] 8.4 Add `uploadWithRetry` (3 attempts, exponential backoff 1s/2s/4s) to `scripts/migrate-wp/r2-uploader.ts`. Integrate into `uploadToR2`. Make 8.2 green.
- [x] 8.5 Replace per-post `wp:featuredmedia` media loop in `scripts/migrate-wp/index.ts` with single pass over `fetchMedia()` (all 173 attachments). Build `mediaId → categorySlug` lookup from posts for best-effort category metadata.
- [x] 8.6 Integrate WebP conversion into `processMediaItem` in `index.ts`: download → `convertToWebp` → upload (possibly converted file). `originalUrl` keeps WP URL; `fileName`/`mimeType`/`r2Url`/`cdnUrl` reflect `.webp` result when converted.
- [x] 8.7 Add incremental manifest checkpoint in `index.ts`: call `writeManifest` after EACH media attachment is fully processed. Log `[checkpoint] <n>/<total> media (wpId <id>) saved`.
- [x] 8.8 Update `.agents/WP_MIGRATION.md` runbook — add "Resuming an interrupted migration" subsection.

### Phase 8.2: Orphan-Collection Pass (2026-06-08)

> Bug fix for production crash: `url-rewriter` threw on orphan WP image URL not in `/wp/v2/media`.

- [x] 8.2.1 **[RED]** Write Vitest tests for `extractWpUrls(body)` in `url-rewriter.test.ts`: markdown image, img tag, multiple URLs, dedup, ignores non-WP URLs, http/www variants, empty body. (8 tests)
- [x] 8.2.2 **[RED]** Write Vitest tests for `buildOrphanKey(wpUrl, converted)`: converted=true swaps ext to .webp, converted=false keeps ext, strips /wp-content/uploads/, http/www variants, dotted filenames. (8 tests)
- [x] 8.2.3 **[RED]** Write Vitest tests for `collectOrphanUrls(bodies, map)`: all mapped → empty set; unmapped URL → in result; dedup across posts; multiple orphans; no WP URLs → empty. (5 tests)
- [x] 8.2.4 Export `WP_URL_PATTERN` from `url-rewriter.ts`. Add `extractWpUrls`, `buildOrphanKey`, `collectOrphanUrls`. Make 8.2.1–8.2.3 green. (21 new tests; total 307)
- [x] 8.2.5 Add `orphan?: boolean` optional field to `MediaEntry` interface in `types.ts`.
- [x] 8.2.6 Add orphan-collection pass in `scripts/migrate-wp/index.ts` (between step 5 and step 6): scan bodies → collect orphans → download/convert/upload → mergeMediaEntry + checkpoint → rebuild urlVariantMap. Guard: skip orphan URLs already in manifest (by originalUrl). Import `collectOrphanUrls`, `buildOrphanKey`, `extractWpUrls` from `url-rewriter`.
- [x] 8.2.7 Add orphan scan preview to dry-run output in `index.ts`.
- [x] 8.2.8 Add SC-MIG-18 scenario to `openspec/changes/wp-blog-migration/specs/wp-migration-script.md`.
- [x] 8.2.9 Add ADR-018 design note (§12.6) to `openspec/changes/wp-blog-migration/design.md`.

---

## Phase 6: Authoring Helpers, Runbook, Docs

- [x] 6.1 Create `scripts/post-new.ts` — Bun script; prompts for title, category, author; emits skeleton `.svx` with `publishDate = today`, `draft: true`, `slug` derived from title via `slugify`.
- [x] 6.2 Create `scripts/post-touch.ts` — Bun script; updates `updated` field in existing `.svx` frontmatter to today's date.
- [x] 6.3 Add `Justfile` recipes: `post-new`, `post-touch`, `migrate-wp-dry-run`, `migrate-wp-run`, `blog-rebuild-deploy`.
- [x] 6.4 Create `.agents/WP_MIGRATION.md` runbook — env vars, pre-flight checks, step-by-step migration command sequence, rollback procedure, slug audit steps. (spec §10)
- [x] 6.5 Create `docs/blog-architecture.md` — data layer, scheduling latency note (ADR-004), mdsvex layout chain, R2 CDN setup, cron trigger.
- [x] 6.6 Update `AGENTS.md` — replace MDX references with `.svx`; add blog content authoring section.
- [x] 6.7 Add `.agents/CHANGELOG.md` entry for `wp-blog-migration`.
