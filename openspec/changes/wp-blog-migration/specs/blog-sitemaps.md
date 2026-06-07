# Spec: blog-sitemaps

## Capability

Populate `post-sitemap.xml`, `category-sitemap.xml`, and `author-sitemap.xml` from blog data. Currently all three routes return empty `<urlset>` documents.

---

## Delta: What MUST Be True After This Change

### 1. General Sitemap Rules (all three routes)

- All URLs MUST use HTTPS and the canonical domain `https://malagaeventgear.com`.
- All URLs MUST end with a trailing slash (consistent with site-wide convention and `page-sitemap.xml` pattern).
- `<lastmod>` MUST be derived from blog data, NOT from `new Date()` at runtime.
- `<lastmod>` format MUST be `YYYY-MM-DDT00:00:00+00:00` (matching the pattern already used in `page-sitemap.xml`).
- Each route MUST return response headers:
  - `Content-Type: application/xml; charset=utf-8`
  - `Cache-Control: public, max-age=3600, s-maxage=86400`
  - `X-Content-Type-Options: nosniff`
- Each route MUST be a `GET` handler in `+server.ts` using SvelteKit's `RequestHandler` type.
- Routes MUST use Web APIs only (no Node built-ins — Cloudflare adapter constraint).

### 2. `post-sitemap.xml`

File: `src/routes/(public)/post-sitemap.xml/+server.ts`

- MUST import `getPosts()` from `$lib/data/blog.ts`.
- MUST include one `<url>` block per published, non-draft post (same filter as the index page).
- `<loc>` MUST be `https://malagaeventgear.com/blog/{slug}/` (trailing slash).
- `<lastmod>` MUST be `updated ?? publishDate` for each post.
- MUST include an `<image:image>` sub-element for each post that has a `coverImage`, using the `http://www.google.com/schemas/sitemap-image/1.1` namespace (matching `page-sitemap.xml` pattern).
  - `<image:loc>` MUST be the post's `coverImage` URL.
- Posts where `coverImage` is the site default OG image (no real cover) MAY omit the `<image:image>` block.

### 3. `category-sitemap.xml`

File: `src/routes/(public)/category-sitemap.xml/+server.ts`

> **Updated 2026-06-06**: category landing pages are now in scope (see `blog-taxonomy.md`). This section replaces the previous single-URL stub.

- MUST import `getCategories()` and `getPostsByCategory()` from `$lib/data/blog.ts`.
- MUST emit one `<url>` block per unique category returned by `getCategories()`.
- `<loc>` MUST be `https://malagaeventgear.com/blog/category/{category}/` (trailing slash).
- `<lastmod>` MUST be the most recent `updated ?? publishDate` across all published posts in that category.
- The `{category}` value in `<loc>` MUST be URL-encoded if it contains characters outside `[a-z0-9-]`, but category slugs are expected to be already URL-safe (enforced by the migration script).

### 4. `author-sitemap.xml`

File: `src/routes/(public)/author-sitemap.xml/+server.ts`

> **Updated 2026-06-06**: author landing pages are now in scope (see `blog-taxonomy.md`). This section replaces the previous single-URL stub.

- MUST import `getAuthors()` and `getPostsByAuthor()` from `$lib/data/blog.ts`.
- MUST emit one `<url>` block per unique author returned by `getAuthors()`.
- `<loc>` MUST be `https://malagaeventgear.com/blog/author/{author}/` (trailing slash).
- `<lastmod>` MUST be the most recent `updated ?? publishDate` across all published posts by that author.
- The `{author}` value in `<loc>` MUST be the author slug (URL-safe), consistent with the value used by the `entries()` generator in the author route.

### 5. `excludeFromSitemap` (future image sitemap)

- The `excludeFromSitemap` boolean in `manifest.json` MUST be respected if/when an image sitemap is implemented.
- The current `post-sitemap.xml` MUST NOT include `<image:image>` for any image where `manifest.json` marks `excludeFromSitemap: true`.
- The data loader and manifest lookup function needed for this check MUST be implemented, but if no images are marked `excludeFromSitemap: true` in the initial migration, the visible output is identical to including all images.

---

## Acceptance Scenarios

### SC-SM-01: `post-sitemap.xml` is non-empty after migration

**Given** at least one published, non-draft post exists in `src/content/blog/`  
**When** a GET request is made to `/post-sitemap.xml`  
**Then** the response status is 200  
**And** the response body is valid XML  
**And** at least one `<url>` element is present inside `<urlset>`

---

### SC-SM-02: Post URL in sitemap uses trailing slash

**Given** a published post with `slug: "my-post"`  
**When** `post-sitemap.xml` is fetched  
**Then** the XML contains `<loc>https://malagaeventgear.com/blog/my-post/</loc>`

---

### SC-SM-03: `<lastmod>` uses `updated` when present

**Given** a post with `publishDate: "2025-03-01"` and `updated: "2025-06-01"`  
**When** `post-sitemap.xml` is fetched  
**Then** the `<lastmod>` for that post's `<url>` is `2025-06-01T00:00:00+00:00`

---

### SC-SM-04: `<lastmod>` falls back to `publishDate` when `updated` is absent

**Given** a post with `publishDate: "2025-03-01"` and no `updated` field  
**When** `post-sitemap.xml` is fetched  
**Then** the `<lastmod>` for that post's `<url>` is `2025-03-01T00:00:00+00:00`

---

### SC-SM-05: Draft posts are excluded from post-sitemap

**Given** a post with `draft: true`  
**When** `post-sitemap.xml` is fetched  
**Then** the XML does NOT contain a `<url>` with that post's slug

---

### SC-SM-06: Future-dated posts are excluded from post-sitemap

**Given** a post with `publishDate` set to tomorrow's date  
**When** `post-sitemap.xml` is fetched at build time  
**Then** the XML does NOT contain a `<url>` for that post

---

### SC-SM-07: Post with coverImage includes image block

**Given** a published post with a `coverImage` URL pointing to `cdn.malagaeventgear.com`  
**When** `post-sitemap.xml` is fetched  
**Then** the `<url>` block for that post contains `<image:image><image:loc>https://cdn.malagaeventgear.com/...</image:loc></image:image>`

---

### SC-SM-08: `category-sitemap.xml` emits one URL per category with correct loc

**Given** published posts exist in categories `"weddings"` and `"corporate"`  
**When** a GET request is made to `/category-sitemap.xml`  
**Then** the response status is 200  
**And** the XML contains exactly two `<url>` elements  
**And** one `<loc>` is `https://malagaeventgear.com/blog/category/weddings/`  
**And** one `<loc>` is `https://malagaeventgear.com/blog/category/corporate/`

---

### SC-SM-08b: `category-sitemap.xml` `<lastmod>` reflects most recent post in category

**Given** category `"weddings"` has two posts: one with `updated: "2025-04-01"` and one with `publishDate: "2025-01-01"` (no `updated`)  
**When** `category-sitemap.xml` is fetched  
**Then** the `<lastmod>` for `<loc>.../weddings/</loc>` is `2025-04-01T00:00:00+00:00`

---

### SC-SM-09: `author-sitemap.xml` emits one URL per author with correct loc

**Given** published posts exist by authors with slugs `"hector-lorenzo"` and `"ana-garcia"`  
**When** a GET request is made to `/author-sitemap.xml`  
**Then** the response status is 200  
**And** the XML contains exactly two `<url>` elements  
**And** one `<loc>` is `https://malagaeventgear.com/blog/author/hector-lorenzo/`  
**And** one `<loc>` is `https://malagaeventgear.com/blog/author/ana-garcia/`

---

### SC-SM-09b: `author-sitemap.xml` `<lastmod>` reflects most recent post by author

**Given** author `"hector-lorenzo"` has two posts: one with `publishDate: "2025-02-01"` (no `updated`) and one with `updated: "2025-06-01"`  
**When** `author-sitemap.xml` is fetched  
**Then** the `<lastmod>` for `<loc>.../hector-lorenzo/</loc>` is `2025-06-01T00:00:00+00:00`

---

### SC-SM-10: All sitemaps return correct Content-Type

**Given** any of the three sitemap routes  
**When** a GET request is made  
**Then** the `Content-Type` response header is `application/xml; charset=utf-8`

---

### SC-SM-11: Sitemap XML validates against sitemap XSD

**Given** `post-sitemap.xml` is fetched  
**When** the XML is validated against `http://www.sitemaps.org/schemas/sitemap/0.9/sitemap.xsd`  
**Then** no validation errors are reported

---

### SC-SM-12: Image with `excludeFromSitemap: true` is omitted from post-sitemap image block

**Given** an image in `manifest.json` with `excludeFromSitemap: true`  
**And** that image is the `coverImage` of a published post  
**When** `post-sitemap.xml` is fetched  
**Then** the `<url>` block for that post does NOT contain an `<image:image>` element
