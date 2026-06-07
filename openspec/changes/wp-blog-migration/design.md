# Design: WordPress Blog Migration to Native mdsvex Blog

**Change**: `wp-blog-migration`
**Status**: draft
**Date**: 2026-06-06

---

## 0. Grounding Observations

These facts come from reading the actual codebase — the design mirrors them exactly.

| Observation | Consequence |
|---|---|
| `svelte.config.js` already imports and applies `mdsvex` with extensions `['.mdx', '.svx', '.md']` | No package installation needed. Design adds `layout` option only. |
| `BlogPostFrontmatterSchema` exists in `src/lib/types/seo.ts` with `title, description, date, author, schemaType?, image?, tags?` | New schema extends these existing fields; `date` is renamed to `publishDate` via transform to avoid breaking existing imports. |
| `buildArticleSchema()` in `src/lib/utils/schema.ts` already accepts `{title, description, datePublished, dateModified?, authorName, url, imageUrl?}` and returns a valid `BlogPosting` JSON-LD node | BlogPost layout calls this function directly — no new schema builder needed. |
| `packages/[slug]/+page.ts` uses `prerender = true` + `entries: EntryGenerator` | Blog slug route mirrors this pattern exactly. |
| `page-sitemap.xml/+server.ts` returns `new Response(xml, { headers: {...} })` with `Cache-Control: public, max-age=3600, s-maxage=86400` | All three blog sitemaps mirror this response shape. |
| `workers/review-reminders/`: standalone wrangler.toml, tsconfig with `$lib/*` path alias, single `scheduled()` export default | blog-rebuild mirrors this structure; no D1 binding needed (only an HTTP fetch). |
| `docs/lead-capture-deployment.md` structure: numbered sections, prerequisite warnings, bash snippets, toml diffs | `docs/blog-migration-runbook.md` mirrors this structure. |

---

## 1. Architecture Overview

```
┌─────────────────────────────────────────────────────────────────┐
│  AUTHORING SURFACE                                              │
│  src/content/blog/*.svx  ←  scripts/migrate-wp/ (one-shot)     │
│                          ←  scripts/post-new.ts (ongoing)      │
└──────────────────┬──────────────────────────────────────────────┘
                   │ import.meta.glob (eager, build-time)
                   ▼
┌─────────────────────────────────────────────────────────────────┐
│  DATA LAYER                                                     │
│  src/lib/data/blog.ts                                           │
│    getAllPosts()   getPostBySlug()                               │
│    getCategories()  getPostsByCategory()                        │
│  (Zod-validated, publishDate filter, draft filter, sorted desc) │
└──────────────────┬──────────────────────────────────────────────┘
                   │
        ┌──────────┴──────────┐
        ▼                     ▼
┌───────────────┐   ┌──────────────────────────────┐
│  ROUTES       │   │  SITEMAPS (prerendered)       │
│  /blog/       │   │  post-sitemap.xml             │
│  /blog/[slug] │   │  category-sitemap.xml         │
│  (prerender)  │   │  author-sitemap.xml           │
└───────────────┘   └──────────────────────────────┘
        │
        ▼
┌───────────────────────┐
│  mdsvex layout chain  │
│  BlogPost.svelte      │
│  → buildArticleSchema │
└───────────────────────┘

SCHEDULING TRIGGER:
  git push → CI build (immediate)
  daily cron → workers/blog-rebuild/ → DEPLOY_HOOK_URL → CI build
```

---

## 2. mdsvex Layout Chain

### ADR-001: Use mdsvex `layout` option, not a wrapper `+page.svelte`

**Decision**: Wire the layout via the mdsvex `layout` option in `svelte.config.js`. The `.svx` file itself becomes the routed component; the layout wraps it transparently.

**Rationale**: A wrapper `+page.svelte` that imports and renders the mdsvex component requires passing frontmatter as props manually, creating duplication between the mdsvex frontmatter and the `+page.ts` load function. The `layout` option injects frontmatter as typed props directly into the layout component via mdsvex's own mechanism.

**Rejected alternative**: `+page.svelte` renders `<svelte:component this={post.component} />` with a separate data load. This requires `+page.ts` to re-export all frontmatter fields that the layout already receives natively. More seams, more duplication.

**Rejected alternative**: Named layouts (mdsvex supports `layout: { blog: '...', default: '...' }`). Unnecessary complexity for a single layout type.

### Configuration change

```js
// svelte.config.js — only the preprocess section changes
preprocess: [
  mdsvex({
    extensions: ['.svx'],          // narrowed from ['.mdx', '.svx', '.md']
    layout: {
      _: 'src/lib/layouts/BlogPost.svelte'  // default layout for all .svx
    }
  })
],
extensions: ['.svelte', '.svx']   // narrowed to match
```

### ADR-002: Narrow extensions from `['.mdx', '.svx', '.md']` to `['.svx']`

**Decision**: Use `.svx` exclusively for blog posts. Remove `.mdx` and `.md` from both `extensions` arrays.

**Rationale**: `.md` extension conflicts with any future markdown documentation files that should NOT be routed as Svelte components. `.mdx` is a React ecosystem convention. `.svx` is the canonical mdsvex extension and signals "this file is a Svelte component". Narrowing removes ambiguity about which files become routes.

**Risk**: If any existing files use `.mdx` or `.md` extensions as components, narrowing breaks them. Audit first — currently no such files exist in `src/routes/`.

### Frontmatter flow

```
src/content/blog/my-post.svx
  ---
  title: "..."
  publishDate: "2026-01-15"
  author: "Hector"
  ...
  ---

        │  mdsvex parses frontmatter
        ▼
BlogPost.svelte receives props: { title, publishDate, author, ... }
        │
        ▼
blog.ts getAllPosts() reads the same module via import.meta.glob
  module.metadata  → frontmatter object (raw, unvalidated)
  module.default   → Svelte component constructor
        │
        ▼
Zod parse(metadata) → validated BlogPost type
```

The layout and the data layer read from the SAME module object. There is no second source of truth.

### BlogPost.svelte layout interface

The layout receives mdsvex-injected frontmatter as Svelte props plus the implicit `<slot />` for the body. In Svelte 5 runes style:

```svelte
<script lang="ts">
  import type { BlogPost } from '$lib/types/blog';
  import { buildArticleSchema } from '$lib/utils/schema';
  import SeoHead from '$lib/components/SeoHead.svelte';

  let { title, description, publishDate, updated, author, coverImage,
        categories, tags, excerpt }: BlogPost = $props();

  const articleSchema = buildArticleSchema({
    title,
    description,
    datePublished: publishDate,
    dateModified: updated,
    authorName: author,
    url: `/blog/${slug}/`,
    imageUrl: coverImage
  });
</script>
```

Note: `slug` is not injected by mdsvex automatically. `BlogPost.svelte` derives it from `$page.params.slug` (SvelteKit's page store). This is the one exception — all other data comes from frontmatter props.

---

## 3. Blog Data Layer

### File: `src/lib/data/blog.ts`

#### Public API surface

```typescript
export function getAllPosts(): BlogPost[]
export function getPostBySlug(slug: string): BlogPost | undefined

export function getCategories(): Category[]
export function getPostsByCategory(slug: string): BlogPost[]

export function getAuthors(): Author[]
export function getPostsByAuthor(slug: string): BlogPost[]

// Internal utility — exported for unit testing
export function slugify(name: string): string
```

All functions are synchronous. `import.meta.glob` with `eager: true` runs at build time; the result is a static object in the bundle.

#### Internal loading pipeline

```
import.meta.glob('../content/blog/*.svx', { eager: true })
  → Record<string, { metadata: unknown; default: SvelteComponent }>

forEach(entry):
  1. Extract slug from file path key (strip prefix + '.svx')
  2. Zod parse metadata → BlogPost (throws on invalid)
  3. Filter: publishDate <= buildDate AND draft !== true
  4. Attach: { slug, component: module.default }

Sort: publishDate descending
Cache: module-level const (computed once at bundle evaluation)

// Derived from the posts cache — computed once at module level
categories: Category[]  ← aggregated from all posts' categories[]
authors:    Author[]    ← aggregated from all posts' author field
```

#### Taxonomy types: `Category` and `Author`

```typescript
// src/lib/types/blog.ts — extend alongside BlogPostSchema

export interface Category {
  name: string;          // display name (e.g. "Event Planning")
  slug: string;          // URL-safe (e.g. "event-planning")
  count: number;         // number of published posts in this category
  lastmod: string;       // max(updated ?? publishDate) across posts in category
}

export interface Author {
  name: string;          // display name (e.g. "Hector Lorenzo")
  slug: string;          // URL-safe (e.g. "hector-lorenzo")
  count: number;         // number of published posts by this author
  lastmod: string;       // max(updated ?? publishDate) across posts by author
}
```

#### Slugification rules

`slugify(name: string): string` is the single implementation used everywhere — in the data layer for derivation, in the migration script for WP category/tag names, and in the route entries generators.

Rules (applied in order):
1. Lowercase
2. Normalize unicode (NFD decomposition → strip combining marks → recompose)
3. Replace any sequence of non-alphanumeric characters with `-`
4. Trim leading/trailing `-`

Examples: `"Event Planning"` → `"event-planning"`, `"María López"` → `"maria-lopez"`, `"A&B"` → `"a-b"`.

Export from `src/lib/utils/slugify.ts` (not from `blog.ts`) so it can be imported by the migration script and tests independently.

#### `getCategories()` derivation

```
posts = getAllPosts()         // already filtered and sorted
map: slug → { name, posts[] }  // built by iterating posts[].categories[]
  key = slugify(categoryName)
  if key not in map → create { name: categoryName, slug: key, posts: [] }
  push post into map[key].posts
sort by name ascending
return Category[] with count = posts.length, lastmod = max(updated ?? publishDate) in posts
```

#### `getPostsByCategory(slug)` 

```
getAllPosts().filter(p => p.categories.some(c => slugify(c) === slug))
```

Returns empty array (not error) if slug does not exist — the route layer calls `error(404)` when the array is empty and the slug is not in `getCategories()`.

#### `getAuthors()` derivation

Same pattern as `getCategories()` but keyed on `slugify(post.author)`. The `author` frontmatter field is a display name string; `slugify` produces the URL slug.

#### `getPostsByAuthor(slug)`

```
getAllPosts().filter(p => slugify(p.author) === slug)
```

#### ADR-003: Eager glob at module level, not lazy per-request

**Decision**: Use `{ eager: true }` and compute the posts array once at module evaluation time.

**Rationale**: The site is prerendered. There is no per-request runtime. All routes using blog data run during `vite build`. Lazy glob would require `await`ing inside load functions and adds complexity with no benefit. Module-level eager glob is the same pattern used by `src/lib/data/packages.ts`.

**Rejected alternative**: Server-side `+page.server.ts` with `fs.readdir` — incompatible with Cloudflare adapter (no Node built-ins at runtime), and unnecessary since content is static.

#### ADR-004: Build-time `publishDate` filter, not runtime

**Decision**: The `publishDate > now` filter uses `new Date()` at build time (inside the module-level initializer). Posts with future dates are excluded from the bundle output for that build.

**Rationale**: The site is a static export. There is no server to filter per-request. The cron rebuild worker triggers a new build daily, which re-evaluates the filter with the current date, making scheduled posts appear automatically.

**Consequence**: A post scheduled for 09:00 may appear up to 24h late depending on cron timing. This is acceptable for a blog (vs. a news site). Document this in `docs/blog-architecture.md`.

#### Type: `BlogPost`

```typescript
// src/lib/types/blog.ts  (new file — keeps seo.ts focused on SEO types)
import { z } from 'zod';

export const BlogPostSchema = z.object({
  // Fields matching existing BlogPostFrontmatterSchema where semantics align
  title: z.string().min(1),
  description: z.string().min(10),
  author: z.string().min(1),
  // New fields from migration
  slug: z.string().min(1),                           // derived from filename
  publishDate: z.string().datetime({ offset: true }) // ISO 8601 with offset
    .or(z.string().date()),                          // or plain YYYY-MM-DD
  updated: z.string().optional(),
  excerpt: z.string().optional(),
  coverImage: z.string().url().optional(),
  categories: z.array(z.string()).default([]),
  tags: z.array(z.string()).default([]),
  draft: z.boolean().optional().default(false)
});

export type BlogPost = z.infer<typeof BlogPostSchema> & {
  component: SvelteComponent;                        // attached after Zod parse
};
```

**Why a new file instead of extending `seo.ts`**: `seo.ts` holds SEO-specific interfaces (`OpenGraphMeta`, `TwitterCardMeta`, `JsonLdSchema`). Blog domain types belong in their own module. The existing `BlogPostFrontmatterSchema` in `seo.ts` is kept as-is (backward compat); `BlogPostSchema` in `blog.ts` is the authoritative schema for the data layer.

---

## 4. R2 Manifest Schema and Migration Script Architecture

### R2 Manifest schema

```typescript
// scripts/migrate-wp/types.ts
export interface MediaEntry {
  wpId: number;
  originalUrl: string;           // https://malagaeventgear.com/wp-content/uploads/...
  r2Key: string;                 // blog-media/2024/01/photo.webp
  cdnUrl: string;                // https://cdn.malagaeventgear.com/blog-media/2024/01/photo.webp
  mimeType: string;
  sizeBytes: number;
  uploadedAt: string;            // ISO 8601
}

export interface PostEntry {
  wpId: number;
  slug: string;
  title: string;
  svxPath: string;               // src/content/blog/<slug>.svx
  mediaRefs: string[];           // r2Keys referenced from this post's body
}

export interface Manifest {
  version: 1;
  generatedAt: string;
  sourceUrl: string;             // https://malagaeventgear.com
  r2Bucket: string;              // meg-blog-media
  cdnBase: string;               // https://cdn.malagaeventgear.com
  urlVariantMap: Record<string, string>;  // old URL variant → cdnUrl (includes http/https, with/without www, size-suffixed variants)
  media: MediaEntry[];
  posts: PostEntry[];
}
```

#### ADR-005: Store manifest at `scripts/migrate-wp/manifest.json`, not in `src/`

**Decision**: Manifest lives in the scripts directory, not under `src/content/`. It is committed to the repo for audit and idempotency checking but is not imported by any SvelteKit route.

**Rationale**: The manifest is a migration artifact, not runtime data. Placing it under `src/` risks accidental import. The blog data layer reads `.svx` files directly; it does not consult the manifest at build time.

### Migration script module breakdown

```
scripts/migrate-wp/
  index.ts          — orchestrator: calls modules in order, writes manifest
  types.ts          — shared TS interfaces (Manifest, MediaEntry, PostEntry)
  wp-client.ts      — WP REST API pagination (per_page=100, X-WP-TotalPages)
  downloader.ts     — fetch image buffer from WP URL → temp file
  r2-uploader.ts    — wrangler r2 object put --remote via Bun.spawn subprocess
  turndown.ts       — HTML → Markdown conversion (turndown + plugins)
  url-rewriter.ts   — replaces all URL variants in Markdown body with CDN URLs
  frontmatter.ts    — builds YAML frontmatter block from WP post metadata
  emitter.ts        — writes .svx file from frontmatter + body
  manifest.ts       — builds and persists manifest.json, idempotency check
```

#### Idempotency strategy

Before uploading a media item, `r2-uploader.ts` checks `manifest.json` for an existing `MediaEntry` with the same `wpId`. If found and `cdnUrl` resolves (HTTP 200 HEAD check optional), the upload is skipped. Before emitting a `.svx`, the emitter checks if the file already exists and the post's `wpId` is in the manifest — if so, skip.

Running the script twice is safe. Running it after partial failure resumes from where it left off.

#### URL-variant rewrite algorithm

WordPress generates multiple URL variants for a single image:
- `http://` and `https://` prefixes
- With and without `www.`
- Size-suffixed filenames: `photo-300x200.jpg`, `photo-768x432.jpg`, `photo.jpg`

The rewrite algorithm:

```
1. For each MediaEntry in manifest:
   a. Compute canonical key from originalUrl (strip scheme, www, query params)
   b. Generate variants:
      - http + no-www, http + www, https + no-www, https + www
      - For each: original filename + all known WP size suffixes ('-NNNxNNN')
   c. Build urlVariantMap[variant] = cdnUrl for all variants

2. In Markdown body, regex-replace all matches of any urlVariantMap key → cdnUrl
   Pattern: /https?:\/\/(www\.)?malagaeventgear\.com\/wp-content\/uploads\/[^\s"')]+/g
   Lookup result in urlVariantMap; fallback to cdnUrl of canonical match.
```

#### Cross-account auth gotcha (from existing runbook)

The site builds under account `cc26ab18f887fb1c63c19e17a0bb313f`. Wrangler CLI operates on the account of the logged-in user. Before running the migration script:

```bash
# Verify you are authenticated to the correct account
bunx wrangler whoami
# Must show account cc26ab18f887fb1c63c19e17a0bb313f

# R2 upload command used by r2-uploader.ts:
CLOUDFLARE_ACCOUNT_ID=cc26ab18f887fb1c63c19e17a0bb313f \
  bunx wrangler r2 object put meg-blog-media/<r2Key> \
  --file <tempFilePath> \
  --remote
```

The `CLOUDFLARE_ACCOUNT_ID` env var overrides the account Wrangler uses, bypassing the default login account. This must be set for every `wrangler r2` call in the script. Document in `.agents/WP_MIGRATION.md`.

---

## 5. Scheduled-Publish Flow (Sequence Diagram)

```
Author          git/GitHub       CI (CF Pages)     cron worker       CDN / readers
  │                │                  │                  │                 │
  │  push .svx     │                  │                  │                 │
  │  (publishDate  │                  │                  │                 │
  │   = tomorrow)  │                  │                  │                 │
  │──────────────►│                  │                  │                 │
  │               │  CI trigger       │                  │                 │
  │               │─────────────────►│                  │                 │
  │               │                  │  bun run build   │                 │
  │               │                  │  getAllPosts()    │                 │
  │               │                  │  filter: pub ≤ now (today)         │
  │               │                  │  post EXCLUDED   │                 │
  │               │                  │  deploy static   │                 │
  │               │                  │─────────────────────────────────►  │
  │               │                  │  /blog/ has no future post         │
  │               │                  │                  │                 │
  │  [next day — 08:00 UTC]          │                  │                 │
  │               │                  │                  │  scheduled()    │
  │               │                  │                  │◄────────────────│
  │               │                  │                  │                 │
  │               │                  │  POST DEPLOY_HOOK_URL              │
  │               │                  │◄─────────────────│                 │
  │               │                  │  (no code change — hook-only CI)   │
  │               │                  │  bun run build   │                 │
  │               │                  │  getAllPosts()    │                 │
  │               │                  │  filter: pub ≤ now (today)         │
  │               │                  │  post INCLUDED   │                 │
  │               │                  │  deploy static   │                 │
  │               │                  │─────────────────────────────────►  │
  │               │                  │  /blog/ now shows the post         │
```

**Key insight**: The cron worker does not need to know about posts. It fires a deploy hook unconditionally at 08:00 UTC daily. The build itself is the gate — `getAllPosts()` applies the date filter at build time. Simplicity is the design goal.

---

## 6. Cron Worker: `workers/blog-rebuild/`

Mirrors `workers/review-reminders/` exactly, except: no D1 binding, single HTTP call.

### File structure

```
workers/blog-rebuild/
  wrangler.toml
  tsconfig.json
  src/
    index.ts
```

### `wrangler.toml`

```toml
name = "meg-blog-rebuild"
main = "src/index.ts"
compatibility_date = "2025-01-01"

[triggers]
crons = ["0 8 * * *"]   # 08:00 UTC daily (09:00 CET / 10:00 CEST)

# Secrets (set via: wrangler secret put DEPLOY_HOOK_URL --name meg-blog-rebuild)
# DEPLOY_HOOK_URL = "https://api.cloudflare.com/client/v4/pages/webhooks/deploy_hooks/..."
```

No `[vars]` section needed. No D1 binding. Single secret: `DEPLOY_HOOK_URL`.

### `tsconfig.json`

Mirrors `workers/review-reminders/tsconfig.json` but removes `$lib/*` path alias (this worker imports nothing from `src/lib/`):

```json
{
  "compilerOptions": {
    "target": "esnext",
    "module": "esnext",
    "moduleResolution": "bundler",
    "lib": ["esnext"],
    "strict": true,
    "skipLibCheck": true,
    "noEmit": true,
    "verbatimModuleSyntax": true,
    "isolatedModules": true
  },
  "include": ["src/**/*.ts"]
}
```

### `src/index.ts`

```typescript
interface Env {
  DEPLOY_HOOK_URL: string;
}

export default {
  async scheduled(_event: ScheduledEvent, env: Env, _ctx: ExecutionContext): Promise<void> {
    const response = await fetch(env.DEPLOY_HOOK_URL, { method: 'POST' });
    if (!response.ok) {
      throw new Error(`Deploy hook failed: ${response.status} ${response.statusText}`);
    }
    console.log('[blog-rebuild] deploy hook triggered:', response.status);
  }
};
```

### ADR-006: Throw on hook failure (vs. silent swallow)

**Decision**: Throw if the deploy hook returns a non-2xx status.

**Rationale**: A silently failing cron would mean scheduled posts never publish without any alert. Throwing causes the Worker to log an error visible in Cloudflare's Worker logs and allows future alerting. Rate limit risk is negligible (one POST/day, far below Pages limits).

---

## 7. Sitemaps

All three sitemaps follow the pattern of `page-sitemap.xml/+server.ts`:
- `GET: RequestHandler` function
- Import from `$lib/data/blog`
- Build XML string
- Return `new Response(xml, { headers: { 'Content-Type': 'application/xml; charset=utf-8', 'Cache-Control': 'public, max-age=3600, s-maxage=86400', 'X-Content-Type-Options': 'nosniff' } })`

### `post-sitemap.xml/+server.ts`

```typescript
import { getAllPosts } from '$lib/data/blog';

// For each post:
// <loc>https://malagaeventgear.com/blog/{post.slug}/</loc>
// <lastmod>{post.updated ?? post.publishDate}</lastmod>
// <image:image><image:loc>{post.coverImage}</image:loc></image:image>  (if present)
```

### `category-sitemap.xml/+server.ts`

```typescript
import { getCategories } from '$lib/data/blog';

// One <url> per Category from getCategories().
// <loc>https://malagaeventgear.com/blog/category/{category.slug}/</loc>
// <lastmod>{category.lastmod}</lastmod>   ← max(updated ?? publishDate) across posts
```

Category landing pages now exist (§8.3), so every URL in this sitemap resolves correctly. No 404 gap.

### `author-sitemap.xml/+server.ts`

```typescript
import { getAuthors } from '$lib/data/blog';

// One <url> per Author from getAuthors().
// <loc>https://malagaeventgear.com/blog/author/{author.slug}/</loc>
// <lastmod>{author.lastmod}</lastmod>   ← max(updated ?? publishDate) across posts
```

### ADR-007 (superseded): Populate category/author sitemaps — now points to real routes

**Original decision**: Emit sitemap entries ahead of category routes, accepting a 404 gap.

**Superseded by scope expansion**: Category and author landing pages are now in scope (user decision 2026-06-06). The sitemap entries point to real routes from day one. ADR-007 is closed.

---

## 8. Route Architecture

### `/blog/` — `src/routes/(public)/blog/+page.svelte`

Replace current placeholder. No `+page.ts` needed — `getAllPosts()` can be called directly in the Svelte component's `<script>` since data is static (not async). However, to stay consistent with the SvelteKit pattern:

**ADR-008: Use `+page.ts` (not server-only) for blog routes**

**Decision**: `+page.ts` with `export const prerender = true` for both the index and slug routes. Use `PageLoad` type.

**Rationale**: Blog content is entirely static. `+page.server.ts` would imply server-side logic; using `+page.ts` signals prerender intent. Consistent with `packages/[slug]/+page.ts`.

Index page load function:

```typescript
// src/routes/(public)/blog/+page.ts
export const prerender = true;
import { getAllPosts } from '$lib/data/blog';
export const load: PageLoad = () => ({ posts: getAllPosts() });
```

### `/blog/[slug]/` — `src/routes/(public)/blog/[slug]/`

Files:
- `+page.ts` — prerender + entries + load (mirrors packages/[slug]/+page.ts exactly)
- No `+page.svelte` needed — the `.svx` file IS the page component when mdsvex layout is configured

Wait — this requires clarification on how mdsvex routes work with SvelteKit:

**ADR-009: .svx files as standalone routes vs. dynamically loaded components**

**Decision**: `.svx` files under `src/content/blog/` are NOT routed directly by SvelteKit (they are not under `src/routes/`). The route is `src/routes/(public)/blog/[slug]/+page.svelte`, which dynamically imports the post component from `src/content/blog/`.

The mdsvex `layout` option wraps each `.svx` module when it is compiled. The layout renders when the component is mounted, regardless of whether it is a direct route or an imported component.

**Flow**:
```
src/routes/(public)/blog/[slug]/+page.ts
  load({ params }) → { post: getPostBySlug(params.slug) }
  // post = { component: SvelteComponent, title, publishDate, ... }

src/routes/(public)/blog/[slug]/+page.svelte
  let { data } = $props();
  // <svelte:component this={data.post.component} />
  // mdsvex layout (BlogPost.svelte) is invoked automatically
  //   because it was compiled into the .svx module
```

This means the layout IS wired at compile time but renders at component instantiation time inside the dynamic route.

**entries generator**:
```typescript
export const entries: EntryGenerator = () =>
  getAllPosts().map((p) => ({ slug: p.slug }));
```

### `/blog/category/[category]/` — `src/routes/(public)/blog/category/[category]/`

Mirrors `packages/[slug]/+page.ts` exactly. `[category]` is a slugified category name.

```typescript
// +page.ts
import { error } from '@sveltejs/kit';
import { getCategories, getPostsByCategory } from '$lib/data/blog';
import type { EntryGenerator, PageLoad } from './$types';

export const prerender = true;

export const entries: EntryGenerator = () =>
  getCategories().map((c) => ({ category: c.slug }));

export const load: PageLoad = ({ params }) => {
  const posts = getPostsByCategory(params.category);
  if (posts.length === 0) error(404, 'Category not found');
  return { posts, category: params.category };
};
```

```svelte
<!-- +page.svelte — minimal listing; mirrors blog/+page.svelte structure -->
<script lang="ts">
  import type { PageData } from './$types';
  let { data }: { data: PageData } = $props();
</script>

<!-- heading + PostCard list for data.posts -->
```

**404 contract**: `error(404)` is thrown when `getPostsByCategory()` returns an empty array AND the slug is not in `getCategories()`. Because entries are generated from `getCategories()`, a request for a non-existent slug can only arrive during development or via a manually typed URL — prerender does not emit those pages. The 404 guard is defense-in-depth.

### `/blog/author/[author]/` — `src/routes/(public)/blog/author/[author]/`

Identical structure to the category route, using `getAuthors()` / `getPostsByAuthor()`.

```typescript
// +page.ts
import { error } from '@sveltejs/kit';
import { getAuthors, getPostsByAuthor } from '$lib/data/blog';
import type { EntryGenerator, PageLoad } from './$types';

export const prerender = true;

export const entries: EntryGenerator = () =>
  getAuthors().map((a) => ({ author: a.slug }));

export const load: PageLoad = ({ params }) => {
  const posts = getPostsByAuthor(params.author);
  if (posts.length === 0) error(404, 'Author not found');
  return { posts, author: params.author };
};
```

```svelte
<!-- +page.svelte — heading with author display name + PostCard list -->
```

**Author display name**: `data.author` is the slug. The page title needs the human-readable name. Two options:
- Pass `getAuthors().find(a => a.slug === params.author)` from the load function (preferred — avoids client-side lookup)
- Derive from slug (lossy — case information is lost after slugification)

**Decision**: load function returns `{ posts, authorMeta: Author }` where `authorMeta` includes `name`, `slug`, `count`. The svelte component uses `data.authorMeta.name` for the heading.

### Architecture overview update

```
DATA LAYER (src/lib/data/blog.ts)
  getAllPosts()         → BlogPost[]
  getPostBySlug()      → BlogPost | undefined
  getCategories()      → Category[]           ← new
  getPostsByCategory() → BlogPost[]           ← new
  getAuthors()         → Author[]             ← new
  getPostsByAuthor()   → BlogPost[]           ← new

ROUTES
  /blog/                          ← index
  /blog/[slug]/                   ← post detail
  /blog/category/[category]/      ← new: taxonomy landing
  /blog/author/[author]/          ← new: author landing

SITEMAPS
  post-sitemap.xml                ← from getAllPosts()
  category-sitemap.xml            ← from getCategories(), real URLs
  author-sitemap.xml              ← from getAuthors(), real URLs
```

---

## 9. Testing Strategy (Strict TDD)

### Vitest unit tests

These modules have pure logic testable without a browser:

| Module | What to test |
|---|---|
| `src/lib/data/blog.ts` | `getAllPosts()` filters draft posts; filters future publishDate; sorts descending; valid frontmatter passes; invalid frontmatter throws or is excluded |
| `src/lib/data/blog.ts` | `getCategories()` returns deduplicated Category list; `count` matches post count; `lastmod` is max of `updated ?? publishDate` across posts in category |
| `src/lib/data/blog.ts` | `getPostsByCategory(slug)` returns only posts whose categories[] slugify to the given slug; returns empty array for unknown slug |
| `src/lib/data/blog.ts` | `getAuthors()` returns deduplicated Author list; `count` and `lastmod` correct |
| `src/lib/data/blog.ts` | `getPostsByAuthor(slug)` returns only posts by the matching author slug; returns empty array for unknown slug |
| `src/lib/utils/slugify.ts` | ASCII lowercase; unicode normalization (`"María"` → `"maria"`); special chars become `-`; no leading/trailing `-`; idempotent (slugify(slugify(x)) === slugify(x)) |
| `src/lib/types/blog.ts` | `BlogPostSchema` accepts valid data; rejects missing title; rejects invalid publishDate; defaults draft=false and categories=[] |
| `scripts/migrate-wp/url-rewriter.ts` | Rewrites http/https variants; rewrites www/no-www variants; rewrites size-suffixed filenames; leaves non-WP URLs unchanged |
| `scripts/migrate-wp/manifest.ts` | Idempotency: re-processing same wpId returns existing entry; manifest serialization round-trip |
| `scripts/migrate-wp/frontmatter.ts` | Builds valid YAML from WP post object; escapes special chars in title |

**Vitest setup**: blog.ts tests will mock `import.meta.glob` — this is the main Vitest challenge. Use `vi.mock` to return a fixture object matching the glob shape.

**slugify.ts is the highest-priority unit to write first**: it is a pure function with zero dependencies, is used by three other modules (`blog.ts`, `frontmatter.ts`, the route entries generators), and its edge cases (unicode, consecutive special chars, empty string) are easy to enumerate. Write tests + implementation before touching any other module.

### Playwright E2E tests

| Scenario | Assert |
|---|---|
| `/blog/` loads | Status 200; at least one post card visible |
| Future post hidden | A fixture post with `publishDate = tomorrow` is absent from `/blog/` |
| Past post visible | A fixture post with `publishDate = yesterday` appears in `/blog/` |
| Slug navigation | Click a post card; URL matches `/blog/<slug>/`; `<h1>` contains post title |
| JSON-LD present | `<script type="application/ld+json">` contains `"@type":"BlogPosting"` |
| Sitemaps non-empty | `GET /post-sitemap.xml` returns 200 with at least one `<url>` element after migration |
| Future post excluded from sitemap | post-sitemap.xml does not contain the future-dated post's slug |
| Category landing renders | `GET /blog/category/<slug>/` returns 200; lists only posts from that category |
| Category landing 404 | `GET /blog/category/nonexistent-slug/` returns 404 |
| Author landing renders | `GET /blog/author/<slug>/` returns 200; author name visible in heading; lists only that author's posts |
| Author landing 404 | `GET /blog/author/nonexistent-slug/` returns 404 |
| Category sitemap real URLs | `GET /category-sitemap.xml` contains `<loc>` entries matching `/blog/category/*/`; each URL resolves 200 |
| Author sitemap real URLs | `GET /author-sitemap.xml` contains `<loc>` entries matching `/blog/author/*/`; each URL resolves 200 |

**E2E fixture strategy**: E2E tests run against the actual built site. The "future post hidden" scenario requires either (a) a real `.svx` with a future date committed to the repo for test purposes, or (b) a test build override. Given the build-time filter, option (a) is the correct approach — commit a `tests/fixtures/future-post.svx` and copy it to `src/content/blog/` during test setup, then remove it after. Playwright's `globalSetup`/`globalTeardown` handles this.

For category/author 404 tests: since `prerender = true` with a fixed `entries` generator, SvelteKit will not emit a page for an unknown slug. The 404 is served by the static host's default 404 page. The Playwright test navigates to the slug directly and asserts on the response status, not on the route's own 404 component.

**Strict TDD order**: Vitest unit tests MUST be written before the implementation of each module. Playwright E2E tests for routes are written before the route implementation. Priority order: `slugify.ts` → `blog.ts` (data layer) → routes → sitemaps.

---

## 10. File Map Summary

| Path | Status | Notes |
|---|---|---|
| `svelte.config.js` | Modified | Add `layout` option; narrow extensions to `.svx` |
| `src/lib/types/blog.ts` | New | `BlogPostSchema`, `BlogPost`, `Category`, `Author` types |
| `src/lib/types/seo.ts` | Unchanged | `BlogPostFrontmatterSchema` kept as-is |
| `src/lib/utils/slugify.ts` | New | `slugify(name)` — unicode-safe, used by data layer + migration script |
| `src/lib/data/blog.ts` | New | Full API: posts, slug lookup, categories, authors |
| `src/lib/layouts/BlogPost.svelte` | New | mdsvex layout; calls `buildArticleSchema` |
| `src/content/blog/*.svx` | New | Migrated posts from WP |
| `src/routes/(public)/blog/+page.ts` | New | `prerender=true`; load returns `getAllPosts()` |
| `src/routes/(public)/blog/+page.svelte` | Modified | Replace placeholder with real index |
| `src/routes/(public)/blog/[slug]/+page.ts` | New | `prerender=true`; entries + load |
| `src/routes/(public)/blog/[slug]/+page.svelte` | New | `<svelte:component this={data.post.component} />` |
| `src/routes/(public)/blog/category/[category]/+page.ts` | New | `prerender=true`; entries from `getCategories()`; load via `getPostsByCategory()` |
| `src/routes/(public)/blog/category/[category]/+page.svelte` | New | Category landing: heading + PostCard list |
| `src/routes/(public)/blog/author/[author]/+page.ts` | New | `prerender=true`; entries from `getAuthors()`; load via `getPostsByAuthor()` |
| `src/routes/(public)/blog/author/[author]/+page.svelte` | New | Author landing: heading with display name + PostCard list |
| `src/routes/(public)/post-sitemap.xml/+server.ts` | Modified | Populate from `getAllPosts()`; lastmod = `updated ?? publishDate` |
| `src/routes/(public)/category-sitemap.xml/+server.ts` | Modified | Populate from `getCategories()`; real `/blog/category/<slug>/` URLs; lastmod from Category.lastmod |
| `src/routes/(public)/author-sitemap.xml/+server.ts` | Modified | Populate from `getAuthors()`; real `/blog/author/<slug>/` URLs; lastmod from Author.lastmod |
| `scripts/migrate-wp/` | New | Full module breakdown in §4 |
| `workers/blog-rebuild/` | New | Cron worker structure in §6 |
| `docs/blog-migration-runbook.md` | New | Mirrors lead-capture-deployment.md structure |
| `docs/blog-architecture.md` | New | Technical reference |

---

## 11. Architecture Decisions Summary

| ADR | Decision | Status |
|---|---|---|
| ADR-001 | Use mdsvex `layout` option, not wrapper `+page.svelte` | Accepted |
| ADR-002 | Narrow mdsvex extensions to `.svx` only | Accepted |
| ADR-003 | Eager glob at module level, not lazy per-request | Accepted |
| ADR-004 | Build-time `publishDate` filter (accept up-to-24h latency) | Accepted |
| ADR-005 | Manifest in `scripts/migrate-wp/`, not `src/` | Accepted |
| ADR-006 | Throw on deploy hook failure | Accepted |
| ADR-007 | Populate category sitemap ahead of category routes | **Superseded** — category/author routes now in scope; no 404 gap |
| ADR-008 | Use `+page.ts` (prerender) for blog routes | Accepted |
| ADR-009 | `.svx` files under `src/content/`, dynamically imported by route | Accepted |
| ADR-010 | `slugify()` extracted to `src/lib/utils/slugify.ts`, shared by data layer and migration script | Accepted |
| ADR-011 | Author display name passed from load function as `authorMeta: Author`, not derived from slug | Accepted |

---

## 12. Open Questions / Risks

| # | Risk | Severity | Notes |
|---|---|---|---|
| 1 | `import.meta.glob` mock in Vitest requires `vi.mock` of Vite internals — may need `vitest-mock-svelte` or a custom resolver | Medium | Investigate before writing blog.ts tests |
| 2 | mdsvex `layout` with `_` default key behavior — verify with `bun run check` that the compiled .svx output correctly injects frontmatter as props | Medium | Easy to verify early; block on this before writing BlogPost.svelte |
| 3 | Slug-derivation in `BlogPost.svelte` via `$page.params.slug` requires the layout to import from `$app/stores` — verify this works when the component is loaded as a dynamic import (not a direct route) | Medium | May need to pass `slug` as a frontmatter field instead of deriving from URL |
| 4 | WordPress REST API accessibility during migration — if WP is behind auth or has REST API disabled | Low | Verify `curl https://malagaeventgear.com/wp-json/wp/v2/posts` returns 200 before starting |
| 5 | Narrowing extensions from `['.mdx', '.svx', '.md']` to `['.svx']` — any .md or .mdx files currently treated as components would break | Low | Quick audit: `fd -e mdx -e md src/routes/` before applying |
| 6 | WP category names with unicode/accents (e.g. "Ambientación") — `slugify()` must normalize before slug comparison, and the frontmatter in .svx files must store the raw display name (not the slug) so `getCategories()` can reconstruct it | Medium | Test slugify with full WP category list from migration dry-run before emitting .svx files |
| 7 | Author name collisions after slugification — two distinct display names that produce the same slug (e.g. "José" and "Jose") would be merged into one Author entry | Low | Audit author list from WP before migration; if collision detected, append a numeric suffix |
