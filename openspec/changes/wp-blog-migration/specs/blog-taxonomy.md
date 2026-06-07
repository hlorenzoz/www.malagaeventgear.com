# Spec: blog-taxonomy

## Capability

Minimal landing pages for blog categories (`/blog/category/[category]/`) and authors (`/blog/author/[author]/`), plus the corresponding data-layer exports from `src/lib/data/blog.ts`. Taxonomy pages are prerendered at build time, list only published non-draft posts, and emit `CollectionPage` JSON-LD.

> **Scope decision (2026-06-06)**: category and author landing pages were previously out of scope; added by explicit user decision. `blog-sitemaps.md` is updated in tandem.

---

## Delta: What MUST Be True After This Change

### 1. Data Layer Additions (`src/lib/data/blog.ts`)

The following four functions MUST be added to the existing blog data module. All four MUST apply the same published+non-draft filter already used by `getPosts()`.

| Export | Signature | Returns |
|--------|-----------|---------|
| `getCategories` | `(): string[]` | Deduplicated, sorted alphabetically, category slugs present in at least one published post |
| `getPostsByCategory` | `(category: string): BlogPost[]` | Published posts whose `categories` array contains `category`; sorted by `date` descending |
| `getAuthors` | `(): string[]` | Deduplicated, sorted alphabetically, author display names present in at least one published post |
| `getPostsByAuthor` | `(author: string): BlogPost[]` | Published posts whose `author` field equals `author`; sorted by `date` descending |

- `getCategories()` and `getAuthors()` MUST NOT include values from draft or future-dated posts.
- If `getPostsByCategory(category)` receives a category string that does not appear in any published post, it MUST return an empty array (not throw).
- Same for `getPostsByAuthor(author)`.

### 2. Category Route (`src/routes/(public)/blog/category/[category]/`)

Two new files MUST be created:

#### `+page.ts`

- MUST export `prerender = true`.
- MUST export an `entries()` function that calls `getCategories()` and returns `Array<{ category: string }>`.
- MUST call `getPostsByCategory(params.category)` in the `load` function.
- If `getPostsByCategory` returns an empty array (category not found or no posts), MUST throw `error(404)`.
- MUST return `{ category: params.category, posts }` to the page component.

#### `+page.svelte`

- MUST render a post card list (same card component/pattern used by `/blog/` index).
- MUST display the category name as the page heading.
- MUST include `<SeoHead>` with:
  - `title`: `"{Category} | Blog | Malaga Event Gear"` (EN) / `"{Category} | Blog | Malaga Event Gear"` (ES — category names are slugs shared across both languages; localise surrounding chrome only).
  - `description`: localised string mentioning the category.
  - `canonicalUrl`: `https://malagaeventgear.com/blog/category/{category}/` (trailing slash).
  - `jsonLdSchema`: `CollectionPage` with `name`, `url`, `isPartOf` pointing to `/#website`, and `numberOfItems` equal to the post count.
- MUST support EN/ES i18n for all UI chrome (headings, labels, CTAs) via `i18n.lang`.
- MUST use `<script lang="ts">` with Svelte 5 runes.
- MUST NOT render the "Migration Notice Block".

### 3. Author Route (`src/routes/(public)/blog/author/[author]/`)

Two new files MUST be created, mirroring the category route:

#### `+page.ts`

- MUST export `prerender = true`.
- MUST export an `entries()` function that calls `getAuthors()` and returns `Array<{ author: string }>`.
- MUST call `getPostsByAuthor(params.author)` in the `load` function.
- If `getPostsByAuthor` returns an empty array, MUST throw `error(404)`.
- MUST return `{ author: params.author, posts }` to the page component.

#### `+page.svelte`

- MUST render a post card list.
- MUST display the author name as the page heading.
- MUST include `<SeoHead>` with:
  - `title`: `"Posts by {Author} | Blog | Malaga Event Gear"` (EN) / `"Artículos de {Author} | Blog | Malaga Event Gear"` (ES).
  - `description`: localised string mentioning the author.
  - `canonicalUrl`: `https://malagaeventgear.com/blog/author/{author}/` (trailing slash).
  - `jsonLdSchema`: `CollectionPage` with `name`, `url`, `isPartOf`, and `numberOfItems`.
- MUST support EN/ES i18n for UI chrome.
- MUST use `<script lang="ts">` with Svelte 5 runes.

### 4. URL Encoding Constraint

- Category and author values used as route parameters MUST be URL-safe slugs (lowercase, hyphen-separated, no spaces).
- The migration script MUST produce category slugs (from WP category slugs) and author slugs (from WP user `slug` field) that satisfy this constraint.
- The `entries()` generators produce the exact values that `getCategories()` / `getAuthors()` return — no additional transformation is applied.
- The data layer MUST store and return category and author values in their slug form consistently (no mixing of display names and slugs for the same taxonomy identifier).

> **Clarification on `author` field**: The `BlogPostFrontmatterSchema` `author` field stores the display name (e.g. `"Hector Lorenzo"`). The author route parameter uses the WP user slug (e.g. `"hector-lorenzo"`). The data layer MUST store both as separate fields or perform a consistent slug derivation. Design MUST specify which approach is used.

### 5. Category Links from Blog Index and Post Pages

- The `/blog/` index card for each post MUST link each category badge to `/blog/category/{category}/` (trailing slash).
- The `BlogPost.svelte` layout MUST link each category tag to `/blog/category/{category}/` (trailing slash).
- The `BlogPost.svelte` layout MUST link the author name to `/blog/author/{author}/` (trailing slash).

---

## Acceptance Scenarios

### SC-TAX-01: Category entries generator returns all published categories

**Given** published posts exist with categories `["weddings", "corporate"]` and one draft post with category `["sound"]`  
**When** `getCategories()` is called  
**Then** the result is `["corporate", "weddings"]` (alphabetical, draft excluded)  
**And** `"sound"` is NOT in the result

---

### SC-TAX-02: `getPostsByCategory` returns only matching posts

**Given** two published posts in category `"weddings"` and one in `"corporate"`  
**When** `getPostsByCategory("weddings")` is called  
**Then** exactly two posts are returned  
**And** both have `"weddings"` in their `categories` array

---

### SC-TAX-03: `getPostsByCategory` returns empty for unknown category

**Given** no published post has category `"does-not-exist"`  
**When** `getPostsByCategory("does-not-exist")` is called  
**Then** an empty array is returned (no error thrown)

---

### SC-TAX-04: Category landing page renders published posts

**Given** two published posts in category `"weddings"` exist  
**When** a request is made to `/blog/category/weddings/`  
**Then** the response status is 200  
**And** the rendered page contains two post cards

---

### SC-TAX-05: Category landing page returns 404 for unknown category

**Given** no published post has category `"nonexistent"`  
**When** a request is made to `/blog/category/nonexistent/`  
**Then** the response status is 404

---

### SC-TAX-06: Category landing page has correct canonical URL

**Given** the category `"corporate"` has at least one published post  
**When** `/blog/category/corporate/` is rendered  
**Then** the `<link rel="canonical">` href is `https://malagaeventgear.com/blog/category/corporate/` (trailing slash)

---

### SC-TAX-07: Category landing page emits CollectionPage JSON-LD

**Given** three published posts in category `"sound-acoustics"`  
**When** `/blog/category/sound-acoustics/` is rendered  
**Then** the page `<head>` contains `"@type": "CollectionPage"`  
**And** `numberOfItems` is `3`  
**And** `url` is `https://malagaeventgear.com/blog/category/sound-acoustics/`

---

### SC-TAX-08: Category landing page excludes draft and future posts

**Given** category `"weddings"` has two published posts and one draft post  
**When** `/blog/category/weddings/` is rendered  
**Then** exactly two post cards are visible  
**And** the draft post is absent

---

### SC-TAX-09: Author entries generator returns all published authors

**Given** published posts exist with authors `"Ana García"` and `"Hector Lorenzo"`, and a draft post with author `"Ghost Writer"`  
**When** `getAuthors()` is called  
**Then** `"Ghost Writer"` is NOT in the result  
**And** two author identifiers are returned

---

### SC-TAX-10: `getPostsByAuthor` returns only matching posts

**Given** three published posts with `author: "hector-lorenzo"` and one with `author: "ana-garcia"`  
**When** `getPostsByAuthor("hector-lorenzo")` is called  
**Then** exactly three posts are returned

---

### SC-TAX-11: Author landing page renders published posts

**Given** two published posts with author slug `"hector-lorenzo"` exist  
**When** a request is made to `/blog/author/hector-lorenzo/`  
**Then** the response status is 200  
**And** the rendered page contains two post cards

---

### SC-TAX-12: Author landing page returns 404 for unknown author

**Given** no published post has author `"nobody"`  
**When** a request is made to `/blog/author/nobody/`  
**Then** the response status is 404

---

### SC-TAX-13: Author landing page has correct canonical URL

**Given** author `"hector-lorenzo"` has at least one published post  
**When** `/blog/author/hector-lorenzo/` is rendered  
**Then** the `<link rel="canonical">` href is `https://malagaeventgear.com/blog/author/hector-lorenzo/` (trailing slash)

---

### SC-TAX-14: Author landing page emits CollectionPage JSON-LD

**Given** two published posts by author `"ana-garcia"`  
**When** `/blog/author/ana-garcia/` is rendered  
**Then** the page `<head>` contains `"@type": "CollectionPage"`  
**And** `numberOfItems` is `2`

---

### SC-TAX-15: Blog index category badges link to category landing page

**Given** a post card on `/blog/` with category `"weddings"`  
**When** the page is rendered  
**Then** the category badge is an `<a>` with `href="/blog/category/weddings/"` (trailing slash)

---

### SC-TAX-16: Post page author name links to author landing page

**Given** a post with author slug `"hector-lorenzo"` is rendered at `/blog/my-post/`  
**When** the page is inspected  
**Then** the author link has `href="/blog/author/hector-lorenzo/"` (trailing slash)

---

### SC-TAX-17: Post page category tags link to category landing pages

**Given** a post with categories `["weddings", "sound-acoustics"]` is rendered  
**When** the page is inspected  
**Then** each category tag is an `<a>` pointing to its respective `/blog/category/{category}/` URL
