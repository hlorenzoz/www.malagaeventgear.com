# Spec: blog-content

## Capability

Build-time mdsvex blog with Zod-validated frontmatter, `/blog/` index, `/blog/[slug]/` post routes, mdsvex layout, scheduled-post filtering, and i18n-aware EN/ES UI.

---

## Delta: What MUST Be True After This Change

### 1. Frontmatter Schema (`src/lib/types/seo.ts`)

**BlogPostFrontmatterSchema** MUST be extended with the following fields (merged into the existing Zod object — no existing field is removed):

| Field | Type | Required | Constraint |
|-------|------|----------|------------|
| `slug` | `string` | MUST | min length 1; matches the `.svx` filename without extension |
| `categories` | `string[]` | MUST | non-empty array |
| `tags` | `string[]` | SHOULD | defaults to `[]` if omitted |
| `publishDate` | ISO 8601 date string | MUST | defaults to `date` if omitted |
| `updated` | ISO 8601 date string | MAY | optional |
| `excerpt` | `string` | MUST | min length 10 |
| `coverImage` | `string` | MUST | valid URL; MUST resolve to `cdn.malagaeventgear.com` for migrated posts |
| `draft` | `boolean` | MAY | defaults to `false` if omitted |

**Date semantics** (MUST be enforced by schema and loader):

- `date`: immutable creation date; drives index sort order (descending).
- `publishDate`: visibility date; defaults to `date` when absent. The loader uses `publishDate` for scheduling decisions.
- `updated`: manual edit date; drives sitemap `<lastmod>`. When absent, `<lastmod>` falls back to `publishDate`.

The `BlogPostFrontmatter` TypeScript type MUST be re-derived via `z.infer<typeof BlogPostFrontmatterSchema>` — no manual interface duplication.

---

### 2. Build-Time Data Loader (`src/lib/data/blog.ts`)

A new module MUST be created. It MUST NOT use any Node.js built-ins (Web APIs only — Cloudflare adapter constraint).

**MUST:**

- Use `import.meta.glob('../content/blog/*.svx', { eager: true })` (or equivalent path) to collect all `.svx` modules at build time.
- Parse each module's frontmatter through `BlogPostFrontmatterSchema.parse(...)`. Any post failing validation MUST throw (not silently skip) so CI catches malformed content.
- Exclude posts where `draft === true` from all public exports.
- Exclude posts where `publishDate > buildDate` from all public exports. `buildDate` is determined at module evaluation time as `new Date()`.
- Export a `getPosts(): BlogPost[]` function returning the filtered, sorted (by `date` descending) array.
- Export a `getPost(slug: string): BlogPost | undefined` function for single-post lookup.
- Export a `getPostSlugs(): string[]` function used by the entries generator.

**MUST NOT** fetch from any external API or runtime network at module evaluation time.

**BlogPost** MUST be a TypeScript type that extends `BlogPostFrontmatter` and adds:
- `content`: the raw Svelte component (for mdsvex rendering).

---

### 3. mdsvex Layout (`src/lib/layouts/BlogPost.svelte`)

A new Svelte 5 component MUST be created. It acts as the mdsvex default layout (configured in `svelte.config.js`).

**MUST:**

- Accept all `BlogPostFrontmatter` fields as props (passed automatically by mdsvex from frontmatter).
- Render a `<SeoHead>` component with:
  - `title` from frontmatter.
  - `description` from frontmatter.
  - `canonicalUrl` = `https://malagaeventgear.com/blog/{slug}/` (trailing slash).
  - `jsonLdSchema` produced by `buildArticleSchema()` from `src/lib/utils/schema.ts`, passing: `title`, `description`, `datePublished` (= `publishDate`), `dateModified` (= `updated ?? publishDate`), `authorName` (= `author`), `url` (= `/blog/{slug}/`), `imageUrl` (= `coverImage`).
- Render a `<slot />` for post body content.
- Use `<script lang="ts">` and Svelte 5 runes. No Options API.
- Display at minimum: post title (`<h1>`), publish date, author, categories as links, and cover image.

---

### 4. Blog Index Route (`src/routes/(public)/blog/+page.svelte`)

The existing placeholder MUST be replaced. The new page MUST:

- Import `getPosts()` from `$lib/data/blog.ts` **at build time** (i.e., called in the `+page.ts` load function or via module-level import; not at request time).
- Display a card list of all published, non-draft posts sorted by `date` descending.
- Each card MUST show: title, excerpt, `publishDate` (formatted), cover image, categories.
- Each card MUST link to `/blog/{slug}/` (trailing slash).
- Support EN/ES i18n: all UI chrome text (headings, labels, CTAs) MUST use `i18n.lang` checks matching the pattern already in the file.
- Emit a `CollectionPage` JSON-LD schema via `<SeoHead>` (can reuse the existing `blogCatalogSchema` shape, extended with `numberOfItems`).
- The `<SeoHead>` canonical URL MUST be `https://malagaeventgear.com/blog/` (trailing slash — already correct in current placeholder).

**MUST NOT** render the "Migration Notice Block" section after this change.

---

### 5. Blog Post Route (`src/routes/(public)/blog/[slug]/`)

A new route directory MUST be created with two files:

#### `+page.ts`

- MUST export `prerender = true`.
- MUST export an `entries()` function that calls `getPostSlugs()` and returns `Array<{ slug: string }>`.
- MUST call `getPost(params.slug)` in the `load` function; if the post is not found, MUST throw `error(404)`.
- MUST return the `BlogPost` object to the page component.

#### `+page.svelte`

- MUST render the post using the mdsvex component from `data.post.content`.
- The mdsvex layout (`BlogPost.svelte`) handles SEO and structure; this file MUST NOT duplicate JSON-LD.
- MUST use `<script lang="ts">` with Svelte 5 runes.

---

### 6. mdsvex Configuration (`svelte.config.js`)

- mdsvex MUST be added as a preprocessor **before** any other preprocessors in the chain.
- Layout MUST be set to `src/lib/layouts/BlogPost.svelte` for all `.svx` files.
- Extensions MUST include `.svx`.

---

### 7. Content Files (`src/content/blog/*.svx`)

- Each migrated post MUST be a valid `.svx` file with a YAML frontmatter block containing all required fields from `BlogPostFrontmatterSchema`.
- The `slug` field MUST match the filename (e.g. file `my-post.svx` → `slug: my-post`).
- All image references in the body MUST use `https://cdn.malagaeventgear.com/...` URLs, not the original WordPress domain.

---

## Acceptance Scenarios

### SC-BC-01: Published post appears in index

**Given** a `.svx` file in `src/content/blog/` with `draft: false` and `publishDate` equal to today's date or earlier  
**When** the blog data loader module is evaluated at build time  
**Then** `getPosts()` includes the post in its return value

---

### SC-BC-02: Draft post is excluded from index

**Given** a `.svx` file with `draft: true`  
**When** `getPosts()` is called  
**Then** the post is absent from the returned array

---

### SC-BC-03: Future-dated post is excluded at build time

**Given** a `.svx` file with `publishDate` set to tomorrow's date (relative to the build date)  
**When** `getPosts()` is called  
**Then** the post is absent from the returned array

---

### SC-BC-04: Future-dated post appears after its publish date

**Given** a post with `publishDate` = yesterday (the build runs after that date)  
**When** `getPosts()` is called  
**Then** the post is present in the returned array

---

### SC-BC-05: Invalid frontmatter causes build failure

**Given** a `.svx` file with a missing required field (e.g. `excerpt` absent)  
**When** the blog data loader evaluates that file  
**Then** a `ZodError` is thrown (not silently ignored), causing the build to fail

---

### SC-BC-06: Index page lists posts sorted by date descending

**Given** three published posts with distinct `date` values  
**When** the `/blog/` route is prerendered  
**Then** the rendered HTML lists the three posts in descending `date` order

---

### SC-BC-07: Index page does not contain migration notice

**Given** the `/blog/` page is rendered after migration  
**When** the page HTML is inspected  
**Then** the text "transitioning" (case-insensitive, EN variant) does not appear  
**And** the "Migration Notice Block" section is absent from the DOM

---

### SC-BC-08: Post route renders with correct title

**Given** a published post with `slug: "my-post"` and `title: "My Post Title"`  
**When** a request is made to `/blog/my-post/`  
**Then** the rendered page contains an `<h1>` with text "My Post Title"  
**And** the HTTP response status is 200

---

### SC-BC-09: Unknown slug returns 404

**Given** no `.svx` file exists for `slug: "does-not-exist"`  
**When** a request is made to `/blog/does-not-exist/`  
**Then** the HTTP response status is 404

---

### SC-BC-10: Post page has correct JSON-LD Article schema

**Given** a post with `title`, `publishDate`, `updated`, `author`, `coverImage`, and `slug`  
**When** the post route is rendered  
**Then** the page `<head>` contains a `<script type="application/ld+json">` block  
**And** that block contains `"@type": "BlogPosting"`  
**And** `datePublished` equals the post's `publishDate`  
**And** `dateModified` equals the post's `updated` value (or `publishDate` if `updated` is absent)  
**And** `mainEntityOfPage` URL equals `https://malagaeventgear.com/blog/{slug}/` (trailing slash)

---

### SC-BC-11: Index i18n — EN labels shown for English language

**Given** the active language is `en`  
**When** the `/blog/` page renders  
**Then** UI chrome text (e.g. section label or CTA) is in English

---

### SC-BC-12: Index i18n — ES labels shown for Spanish language

**Given** the active language is `es`  
**When** the `/blog/` page renders  
**Then** UI chrome text is in Spanish

---

### SC-BC-13: entries() returns all published post slugs

**Given** five published posts and one draft post exist  
**When** `entries()` is called from `+page.ts`  
**Then** exactly five entries are returned (the draft is excluded)

---

### SC-BC-14: `date` field drives index sort, `publishDate` drives visibility

**Given** post A has `date: 2025-01-10`, `publishDate: 2025-06-01` (past)  
**And** post B has `date: 2025-06-01`, `publishDate: 2025-01-10` (past)  
**When** `getPosts()` is called  
**Then** post B appears before post A in the returned array (higher `date`)  
**And** both posts are present (both `publishDate` values are in the past)
