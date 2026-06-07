# Proposal: WordPress Blog Migration to Native mdsvex Blog

## Intent

The current blog lives on WordPress and is entirely decoupled from the SvelteKit site. This creates two maintenance surfaces, no shared design system, no SEO integration with the site's JSON-LD/sitemap pipeline, and no scheduled-publishing capability without a CMS dashboard. The change migrates all existing WordPress content into a native mdsvex blog inside the SvelteKit monorepo, with images served from Cloudflare R2, and establishes a build-time scheduling mechanism with an automated daily rebuild cron worker.

## Scope

### In Scope

- **One-shot migration script** (`scripts/migrate-wp/`, Bun): fetches posts, categories, tags, authors, media from WordPress REST API (`/wp-json/wp/v2/*` with `_embed`); downloads and uploads images to R2 bucket `meg-blog-media` via `wrangler r2 object put --remote`; builds enriched `manifest.json`; converts HTML→Markdown via turndown; rewrites image URLs; emits `src/content/blog/<slug>.svx`.
- **R2 infrastructure**: bucket `meg-blog-media` (account `cc26ab18f887fb1c63c19e17a0bb313f`) + custom domain `cdn.malagaeventgear.com`.
- **Native blog data layer**: `src/lib/data/blog.ts` — build-time `import.meta.glob`, Zod-validated, excludes `draft:true` and `publishDate > now`.
- **Schema extension**: `BlogPostFrontmatterSchema` in `src/lib/types/seo.ts` gains `slug, categories[], tags[], publishDate, updated?, excerpt, coverImage, draft?`.
- **mdsvex layout**: `src/lib/layouts/BlogPost.svelte`, reuses `buildArticleSchema()` from `src/lib/utils/schema.ts`.
- **Routes**: `/blog/` (index, replaces placeholder `src/routes/(public)/blog/+page.svelte`) and `/blog/[slug]/` (new, prerender=true + entries generator, pattern from `packages/[slug]/+page.ts`).
- **Sitemaps**: populate currently-empty `post-sitemap.xml`, `category-sitemap.xml`, `author-sitemap.xml`; `<lastmod>` = `updated ?? publishDate`.
- **Cron rebuild worker**: `workers/blog-rebuild/` (pattern from `workers/review-reminders/`), POSTs `DEPLOY_HOOK_URL` daily to trigger Cloudflare CI build for scheduled posts.
- **Authoring helpers**: `scripts/post-new.ts`, `scripts/post-touch.ts`, Justfile recipes.
- **Docs**: `.agents/WP_MIGRATION.md` runbook, `docs/blog-architecture.md`, update `AGENTS.md` (MDX→mdsvex/.svx), entry in `.agents/CHANGELOG.md`.

### Out of Scope

- Per-category landing pages (deferred — taxonomy MVP only: categories/authors in frontmatter + sitemaps).
- Tag listing pages.
- Comment system.
- Search / full-text index.
- CMS UI for non-technical authors.
- Incremental sync from WordPress post-migration.

## Capabilities

### New Capabilities

- `blog-content`: Build-time mdsvex blog — loader, schema, routes, scheduled publishing, i18n-aware index.
- `blog-media-cdn`: R2-backed image CDN with enriched manifest linking old WP URLs to R2 URLs.
- `blog-sitemaps`: Populated post / category / author XML sitemaps derived from blog data.
- `blog-rebuild-cron`: Cron worker that triggers a daily Cloudflare Pages deploy hook for scheduled post publishing.
- `wp-migration-script`: One-shot Bun script to migrate WordPress content + media to mdsvex + R2.

### Modified Capabilities

- `blog-content` partially overlaps `src/routes/(public)/blog/+page.svelte` (placeholder replaced) — no existing openspec spec to delta.
- `src/lib/types/seo.ts` `BlogPostFrontmatterSchema` is extended — no existing capability spec.

## Approach

1. **Infra first**: create R2 bucket + custom domain; verify `wrangler r2 object put --remote` works with the cross-account `CLOUDFLARE_ACCOUNT_ID` env var.
2. **Migration script**: run once against the live WP API; outputs are `.svx` files + `manifest.json`. Script is kept in the repo but is not part of the build pipeline.
3. **Data layer + schema**: extend Zod schema, write `src/lib/data/blog.ts` with `import.meta.glob`, unit-test with Vitest.
4. **Routes + layout**: add `/blog/[slug]/` following the prerender+entries pattern; update `/blog/` index; wire `buildArticleSchema()` into the mdsvex layout.
5. **Sitemaps**: implement the three server routes following the `page-sitemap.xml` pattern.
6. **Cron worker**: clone `workers/review-reminders/` structure; single handler POSTs to `DEPLOY_HOOK_URL`.
7. **Docs + helpers**: write runbook, authoring scripts, Justfile recipes.

## Affected Areas

| Area | Impact | Description |
|------|--------|-------------|
| `src/routes/(public)/blog/+page.svelte` | Modified | Replace placeholder with real index page |
| `src/routes/(public)/blog/[slug]/` | New | Post detail route (prerender) |
| `src/lib/data/blog.ts` | New | Build-time blog data loader |
| `src/lib/types/seo.ts` | Modified | Extend `BlogPostFrontmatterSchema` |
| `src/lib/layouts/BlogPost.svelte` | New | mdsvex layout |
| `src/lib/utils/schema.ts` | Read-only | Reused `buildArticleSchema()` |
| `src/routes/(public)/post-sitemap.xml/+server.ts` | Modified | Populate from blog data |
| `src/routes/(public)/category-sitemap.xml/+server.ts` | Modified | Populate from blog data |
| `src/routes/(public)/author-sitemap.xml/+server.ts` | Modified | Populate from blog data |
| `src/content/blog/*.svx` | New | Migrated post content |
| `scripts/migrate-wp/` | New | One-shot WP→mdsvex+R2 migration script |
| `workers/blog-rebuild/` | New | Daily deploy-hook cron worker |
| `svelte.config.js` | Modified | Add mdsvex preprocessor |
| `wrangler.toml` | Modified | Add blog-rebuild worker config |
| `.agents/WP_MIGRATION.md` | New | Migration runbook |
| `docs/blog-architecture.md` | New | Technical architecture doc |

## Risks

| Risk | Likelihood | Mitigation |
|------|------------|------------|
| R2 cross-account auth failure (`CLOUDFLARE_ACCOUNT_ID` mismatch) | Med | Test `wrangler r2 object put --remote` in isolation before running full migration; document exact env var setup in runbook |
| WordPress REST API pagination missing posts | Low | Script paginates with `per_page=100` and follows `X-WP-TotalPages`; dry-run count vs. WP admin count |
| `publishDate > now` leaks future posts at build time | Low | Zod `transform` filters at load time; Playwright E2E asserts future-dated posts are absent from index |
| mdsvex breaks existing `svelte.config.js` preprocessor chain | Low | Add mdsvex as first preprocessor; verify with `bun run check` |
| Large `.svx` image embeds bloat git repo | Low | Images go to R2 only; `.svx` files contain CDN URLs, not base64 |
| Cron worker deploy-hook rate limit | Low | Daily frequency is far below Cloudflare Pages hook limits |

## Rollback Plan

- **Blog routes**: remove `src/routes/(public)/blog/[slug]/`; revert `src/routes/(public)/blog/+page.svelte` to the placeholder (recoverable from git).
- **Schema changes**: revert `BlogPostFrontmatterSchema` additions; no downstream specs depend on the new fields yet.
- **Sitemaps**: revert to empty server routes (already the current state — trivial).
- **Cron worker**: delete via `wrangler delete workers/blog-rebuild`; no site dependency.
- **R2 / migrated content**: `src/content/blog/` can be deleted; R2 bucket is append-only during migration and safe to ignore. Manifest stays in repo for audit.
- **mdsvex preprocessor**: remove from `svelte.config.js`; no effect if no `.svx` files are present.

## Dependencies

- Cloudflare R2 bucket `meg-blog-media` provisioned (account `cc26ab18f887fb1c63c19e17a0bb313f`).
- Custom domain `cdn.malagaeventgear.com` pointed at R2 bucket.
- `DEPLOY_HOOK_URL` Cloudflare Pages webhook secret available for blog-rebuild worker.
- WordPress site (`malagaeventgear.com`) accessible during migration script run.
- mdsvex installed (`@sveltejs/mdsvex` or `mdsvex`).

## Success Criteria

- [ ] All migrated posts render at `/blog/[slug]/` with correct JSON-LD (`Article` schema).
- [ ] `/blog/` index lists only posts with `publishDate <= now` and `draft !== true`.
- [ ] A post with `publishDate` set to tomorrow is absent from the index on the day of build; present the day after.
- [ ] `post-sitemap.xml`, `category-sitemap.xml`, `author-sitemap.xml` are non-empty and validate against the sitemap XSD.
- [ ] All image URLs in migrated posts resolve to `cdn.malagaeventgear.com` (R2 CDN), not the original WP domain.
- [ ] `manifest.json` maps 100% of original WP image URL variants to R2 URLs.
- [ ] `bun run check` passes with no type errors after schema extension.
- [ ] Blog-rebuild cron worker deploys without errors and triggers a Pages build on invocation.
- [ ] Playwright E2E: `/blog/` loads, at least one post is listed, navigating to a post renders title + body.
