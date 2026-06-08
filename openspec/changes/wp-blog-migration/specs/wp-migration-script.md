# Spec: wp-migration-script

## Capability

A one-shot Bun script that fetches all WordPress content (posts, categories, tags, authors, media) via the WP REST API, uploads images to R2, builds `manifest.json`, converts HTML to Markdown, rewrites URLs, and emits `.svx` files. The script is idempotent and kept in the repository but is NOT part of the SvelteKit build pipeline.

---

## Delta: What MUST Be True After This Change

### 1. Script Location

- `scripts/migrate-wp/index.ts` — main entrypoint (run with `bun scripts/migrate-wp/index.ts`).
- `scripts/migrate-wp/manifest.json` — generated output; committed to the repository.
- `scripts/migrate-wp/` MAY contain helper modules (e.g. `fetch-wp.ts`, `upload-r2.ts`, `convert.ts`).
- The script MUST NOT be imported by any SvelteKit route, layout, or data module.

### 2. WordPress API Fetching

- The script MUST fetch from `https://malagaeventgear.com/wp-json/wp/v2/` (the live WP API).
- The script MUST paginate all resource types using the `X-WP-TotalPages` response header with `per_page=100`.
- The following resource types MUST be fetched with `_embed=true`:
  - `posts` — includes embedded authors, categories, tags, featured media.
  - `categories`
  - `tags`
  - `users`
  - `media` (attachments)
- Pagination MUST continue until all pages are exhausted. The script MUST NOT assume a fixed number of posts.
- After fetching, the script MUST log the total count of each resource type for dry-run verification.

### 3. Image Downloading and R2 Upload

- The script MUST upload the FULL media library fetched via `fetchMedia()` (all image attachments), NOT only the per-post featured media embedded in the posts response. This ensures inline body images are covered and the URL rewriter never encounters an unmapped URL.
- For each media attachment, the script MUST download the full-size image and all registered size variants (as returned by `media_details.sizes`).
- Images MUST be uploaded to the R2 bucket `images` using:
  ```
  wrangler r2 object put images/blog/<wpId>/<fileName> --file <localTempPath> --remote
  ```
  with `CLOUDFLARE_ACCOUNT_ID=cc26ab18f887fb1c63c19e17a0bb313f` set in the environment.
- The script MUST use `bun`'s `Bun.spawn` or `execa`-equivalent to invoke `wrangler` — no shell `exec` that would fail in CI environments without a TTY.
- Each R2 upload MUST be retried up to 3 attempts with exponential backoff (delays of 1 s, 2 s, 4 s respectively) before the script treats the upload as a failure and exits with a non-zero status.
- If an object key already exists in R2 (idempotency re-run), the upload MUST be skipped (or overwritten — implementation choice, but MUST NOT fail).
- Local temporary image files MUST be cleaned up after upload (MUST NOT accumulate on disk).

### 3a. Media Category Metadata

- The `category` field on each manifest `MediaEntry` MUST be derived from the owning post's first category slug (best-effort). If no post references the media, or the post has no category, the value MUST default to `'blog'`.
- The `category` value MUST NOT influence the R2 object key. The key is determined solely by `wpId` and `fileName`.

### 4. `manifest.json` Generation

- The manifest MUST be written to `scripts/migrate-wp/manifest.json` incrementally — it MUST be persisted to disk after EACH attachment is fully processed (downloaded, converted if applicable, uploaded). A final write after all attachments complete is also acceptable, but the incremental checkpoint write MUST happen.
- On a re-run (resume after interruption), the script MUST read the existing manifest at startup and skip any attachment whose `wpId` already has entries present in the manifest. Skipped attachments MUST NOT be re-downloaded or re-uploaded.
- The manifest schema is defined in `blog-media-cdn.md` spec. The migration script is the sole producer of this file.
- On a re-run (idempotency), the script MUST merge new entries with the existing manifest — MUST NOT overwrite the entire file and lose previously-mapped entries that are still valid.

### 5. HTML to Markdown Conversion

- The script MUST use the `turndown` library (or Bun-compatible equivalent) to convert WP post `content.rendered` HTML to Markdown.
- WordPress shortcodes that do not convert to valid Markdown MUST be stripped (not left as raw `[shortcode]` syntax in the output).
- HTML `<img>` tags MUST be converted to Markdown image syntax (`![alt](url)`) with the `src` rewritten to the R2 URL from `manifest.json`.
- Internal WP links (pointing to `malagaeventgear.com/wp-*` or similar) MAY be left as-is for manual review (logged as warnings).

### 6. URL Rewriting

- After conversion, the script MUST replace every remaining occurrence of the original WordPress image domain in the Markdown body with the corresponding R2 URL from `manifest.json`.
- If an image URL in the content is not found in `manifest.json`, the script MUST log the unmapped URL as an error and exit with non-zero status (per `blog-media-cdn.md` SC-CDN-05).

### 7. `.svx` File Emission

Each WordPress post MUST produce exactly one `.svx` file at `src/content/blog/<slug>.svx`.

The file MUST have the following structure:

```svx
---
title: "<wp post title>"
description: "<wp post excerpt, stripped of HTML>"
date: "<wp post date_gmt as YYYY-MM-DD>"
publishDate: "<wp post date_gmt as YYYY-MM-DD>"
updated: "<wp post modified_gmt as YYYY-MM-DD, only if different from date>"
author: "<display name of post author>"
slug: "<wp post slug>"
categories: [<array of category slugs>]
tags: [<array of tag slugs>]
excerpt: "<wp post excerpt, stripped of HTML, min 10 chars>"
coverImage: "<r2Url of featured image full size, or site default>"
draft: false
---

<converted Markdown body>
```

- `date` and `publishDate` MUST be the same for migrated posts (the WP publication date — no future scheduling is applied retroactively).
- `updated` MUST be omitted if `modified_gmt === date_gmt`.
- `description` MUST be the excerpt with HTML stripped, truncated to 160 characters if needed.
- `excerpt` MUST be the excerpt with HTML stripped (min 10 characters; if WP excerpt is empty, the script MUST derive it from the first 160 characters of the post body).
- `slug` MUST match the filename (e.g. `src/content/blog/my-post.svx` → `slug: my-post`).
- `draft: false` MUST be explicitly set for all migrated posts.

### 8. Idempotency

- Re-running the script MUST NOT duplicate `.svx` files or manifest entries.
- If a `.svx` file already exists for a slug, the script MUST overwrite it (WP is the source of truth during migration).
- If an R2 object already exists, the script MUST skip or overwrite (no failure).

### 9. Dry-Run Mode

- The script MUST support a `--dry-run` flag.
- In dry-run mode, the script MUST fetch WP data and log what it would do (counts, file names, R2 keys) but MUST NOT write any files, upload to R2, or modify `manifest.json`.

### 10. Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `CLOUDFLARE_ACCOUNT_ID` | MUST | R2 cross-account ID: `cc26ab18f887fb1c63c19e17a0bb313f` |
| `WP_BASE_URL` | SHOULD | WordPress API base, defaults to `https://malagaeventgear.com/wp-json/wp/v2` |

These MUST be documented in `.agents/WP_MIGRATION.md` runbook.

### 11. Logging

- The script MUST log progress at each major step: fetching, downloading, uploading, converting, writing.
- The script MUST log a final summary: total posts processed, total images uploaded, total `.svx` files written, total manifest entries.

---

## Acceptance Scenarios

### SC-MIG-01: All WP posts produce a `.svx` file

**Given** the migration script runs against the live WP API in non-dry-run mode  
**When** the script completes with exit code 0  
**Then** the count of `.svx` files in `src/content/blog/` equals the total post count logged from the WP API

---

### SC-MIG-02: Dry-run produces no file changes

**Given** the script is run with `--dry-run`  
**When** the script completes  
**Then** no `.svx` files are created or modified  
**And** `manifest.json` is not modified  
**And** no `wrangler r2 object put` commands are executed  
**And** the exit code is 0

---

### SC-MIG-03: All WP image variants are in the manifest

**Given** the migration script has completed  
**When** `manifest.json` is parsed  
**Then** every image URL from `_embed` data in the WP posts response has a corresponding entry  
**And** every `r2Url` value begins with `https://cdn.malagaeventgear.com/`

---

### SC-MIG-04: `.svx` frontmatter passes Zod validation

**Given** any `.svx` file produced by the migration script  
**When** its frontmatter is parsed with `BlogPostFrontmatterSchema.parse()`  
**Then** no `ZodError` is thrown

---

### SC-MIG-05: `.svx` body contains no WP image domain URLs

**Given** the migration script has completed  
**When** all `.svx` file bodies are scanned for the original WP image domain  
**Then** zero occurrences are found

---

### SC-MIG-06: Unmapped image causes non-zero exit

**Given** a WP post references an image URL that is not downloadable / not uploadable to R2  
**When** the migration script runs  
**Then** the script exits with a non-zero status code  
**And** the problematic URL is logged to stderr

---

### SC-MIG-07: Re-run is idempotent

**Given** the migration script has already run once successfully  
**When** the script is run again without clearing output  
**Then** the exit code is 0  
**And** the count of `.svx` files is the same as after the first run  
**And** no duplicate manifest entries exist  
**And** no duplicate R2 uploads error out

---

### SC-MIG-08: Post with empty WP excerpt gets derived excerpt

**Given** a WP post with an empty `excerpt.rendered` field  
**When** the script generates the `.svx` file  
**Then** the `excerpt` frontmatter field contains the first 160 characters of the post body (HTML stripped)  
**And** the `excerpt` length is >= 10 characters

---

### SC-MIG-09: `updated` frontmatter is omitted when equal to `date`

**Given** a WP post where `modified_gmt === date_gmt`  
**When** the `.svx` file is generated  
**Then** the frontmatter does NOT contain an `updated` key

---

### SC-MIG-10: `updated` frontmatter is set when post was modified

**Given** a WP post where `modified_gmt` is later than `date_gmt`  
**When** the `.svx` file is generated  
**Then** the frontmatter contains `updated: "<modified_gmt as YYYY-MM-DD>"`

---

### SC-MIG-11: Pagination exhausts all pages

**Given** the WP API returns `X-WP-TotalPages: 3` for posts  
**When** the script fetches posts  
**Then** exactly 3 pages are fetched  
**And** the total post count matches `X-WP-Total` header value

---

### SC-MIG-12: WP shortcodes are stripped from Markdown output

**Given** a WP post body containing a shortcode (e.g. `[gallery ids="1,2,3"]`)  
**When** the HTML is converted to Markdown  
**Then** the output `.svx` body does NOT contain `[gallery` or any other `[...]` shortcode syntax

---

### SC-MIG-13: Full media library is uploaded (not just featured images)

**Given** the WP media library contains attachments that are used only as inline body images (not as any post's featured media)  
**When** the migration script completes  
**Then** those attachments are present in `manifest.json`  
**And** their R2 objects exist at `blog/<wpId>/<fileName>`

---

### SC-MIG-14: Upload retries on transient failure

**Given** a wrangler upload command fails on the first two attempts (exit code non-zero)  
**When** the third attempt succeeds (exit code 0)  
**Then** the upload is considered successful and no error is thrown  
**And** exactly 3 spawn calls were made

---

### SC-MIG-15: Upload fails after all 3 attempts exhausted

**Given** a wrangler upload command fails on all 3 attempts  
**When** `uploadWithRetry` is called  
**Then** an error is thrown containing the R2 key in its message  
**And** the script exits with a non-zero status code

---

### SC-MIG-16: Manifest is persisted after each attachment (checkpoint)

**Given** the migration is processing 5 attachments and crashes after the 3rd  
**When** the script is re-run  
**Then** attachments 1–3 are skipped (already in manifest)  
**And** only attachments 4–5 are downloaded and uploaded  
**And** the final manifest contains all 5 attachments' entries

---

### SC-MIG-17: Category metadata is best-effort and does not affect R2 key

**Given** a media attachment is not referenced by any post (orphaned attachment)  
**When** the manifest entry for that attachment is inspected  
**Then** the `category` field is `'blog'`  
**And** the `r2Key` follows the `blog/<wpId>/<fileName>` format regardless of the category value

---

### SC-MIG-18: Orphan images referenced in post bodies are uploaded before rewriting

**Given** a WP post body references an image URL (e.g. `https://malagaeventgear.com/wp-content/uploads/2024/09/Methacrylate-lectern.jpeg`) that returns HTTP 200 directly  
**And** that URL is NOT present in the `/wp-json/wp/v2/media` REST endpoint (it is absent from `fetchMedia()`)  
**When** the migration script runs the orphan-collection pass (after `fetchMedia()` upload, before post emission)  
**Then** the script scans EVERY post body for WP upload URLs not in `urlVariantMap`  
**And** downloads, converts (if jpeg/png → webp), and uploads each unique orphan URL to R2 under the key `blog/orphan/<year>/<month>/<filename>.webp`  
**And** records each orphan as a `MediaEntry` with `wpId: 0` and `orphan: true` in the manifest  
**And** merges orphan entries into `urlVariantMap` so `rewriteUrls()` resolves all body URLs  
**And** writes the manifest checkpoint after EACH orphan upload (idempotent resume keyed by `originalUrl`)  
**And** on a re-run, skips orphan URLs already present in `manifest.media` by `originalUrl`  
**And** the script completes with exit code 0 (no unmapped-URL error thrown)

**Pure helper contracts** (unit-tested in `url-rewriter.test.ts`):
- `extractWpUrls(body)` — returns deduplicated array of all WP upload URLs in a body
- `buildOrphanKey(wpUrl, converted)` — derives `blog/orphan/<path>` R2 key, swapping ext to `.webp` when `converted=true`
- `collectOrphanUrls(bodies, urlVariantMap)` — returns Set of WP URLs present in bodies but absent from the map
