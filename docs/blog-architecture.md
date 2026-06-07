# Blog Architecture — Referencia Técnica

Documentación del sistema de blog nativo mdsvex implementado en `wp-blog-migration`.

---

## 1. Visión General

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
│    getAuthors()     getPostsByAuthor()                          │
│  (Zod-validated, publishDate filter, draft filter, sorted desc) │
└──────────────────┬──────────────────────────────────────────────┘
                   │
        ┌──────────┴──────────┐
        ▼                     ▼
┌───────────────┐   ┌──────────────────────────────┐
│  ROUTES       │   │  SITEMAPS (prerendered)       │
│  /blog/       │   │  post-sitemap.xml             │
│  /blog/[slug] │   │  category-sitemap.xml         │
│  /blog/       │   │  author-sitemap.xml           │
│   category/   │   └──────────────────────────────┘
│  /blog/       │
│   author/     │
└───────────────┘
        │
        ▼
┌───────────────────────┐
│  mdsvex layout chain  │
│  BlogPost.svelte      │
│  → buildArticleSchema │
└───────────────────────┘

SCHEDULING TRIGGERS:
  git push → CI build (immediate)
  daily cron → workers/blog-rebuild/ → DEPLOY_HOOK_URL → CI build
```

---

## 2. mdsvex Layout Chain

### ADR-009: Layout recibido como prop (no via opción `layout` de mdsvex)

La opción `layout` de mdsvex inyecta el frontmatter via `$$props` (sintaxis legacy de Svelte 4).
El proyecto usa `runes: true` globalmente, lo que hace que `$$props` sea inválido.
Usar la opción `layout` en `svelte.config.js` causa el error de compilación:

```
Cannot use $$props in runes mode
```

**Solución**: `[slug]/+page.svelte` envuelve explícitamente el componente mdsvex:

```svelte
<!-- src/routes/(public)/blog/[slug]/+page.svelte -->
<BlogPost post={data.post}>
  <svelte:component this={data.post.component} />
</BlogPost>
```

`BlogPost.svelte` recibe un objeto `BlogPost` completo como prop (NO props individuales del
frontmatter). El frontmatter viaja por el data layer (`blog.ts`) hasta el load function,
y desde ahí como `data.post` al page component.

### Configuración de svelte.config.js

```js
preprocess: [
  mdsvex({
    extensions: ['.svx'],  // solo .svx — no .mdx ni .md (ADR-002)
    // NO hay opción `layout` — incompatible con runes mode (ADR-009)
  })
],
extensions: ['.svelte', '.svx']
```

### Flujo del frontmatter

```
src/content/blog/my-post.svx (frontmatter YAML)
        │
        │  import.meta.glob (build-time, eager)
        ▼
blog-pipeline.ts
  module.metadata  → Zod parse → BlogPost (validated)
  module.default   → Svelte component constructor
        │
        ▼
blog.ts (buildPostsFromGlob)
  → filters (draft=false, publishDate ≤ now)
  → sort by publishDate desc
  → _allPosts cache
        │
        ▼
+page.ts load({ params })
  → getPostBySlug(params.slug) → BlogPost | undefined
  → error(404) si no encontrado
        │
        ▼
+page.svelte
  → <BlogPost post={data.post}> (layout)
  → <svelte:component this={data.post.component} /> (body)
```

---

## 3. Data Layer

### Archivo: `src/lib/data/blog.ts` (API pública) + `src/lib/data/blog-pipeline.ts` (lógica pura)

La separación existe para testabilidad: `import.meta.glob` no se puede mockear fácilmente
en Vitest. `blog-pipeline.ts` exporta funciones puras que aceptan el resultado del glob como
argumento — los tests las llaman directamente con fixtures.

#### API pública

```typescript
getAllPosts(): BlogPost[]
getPostBySlug(slug: string): BlogPost | undefined
getCategories(): Category[]
getPostsByCategory(categorySlug: string): BlogPost[]
getAuthors(): Author[]
getPostsByAuthor(authorSlug: string): BlogPost[]
```

Todas las funciones son sincrónicas. El glob con `{ eager: true }` se evalúa al cargar el
módulo (build-time). El resultado es un objeto estático en el bundle.

#### Patrón del glob

```typescript
// src/lib/data/blog.ts — ruta relativa desde src/lib/data/
const modules = import.meta.glob('../../content/blog/*.svx', { eager: true })
```

El path `../../content/blog/` sube dos niveles desde `src/lib/data/`:
`src/lib/data/` → `src/lib/` → `src/` → luego entra en `content/blog/`.

#### Derivación de categorías y autores

Las categorías y autores se derivan en tiempo de build a partir de los posts publicados:

```
getCategories():
  posts = getAllPosts()          // ya filtrados y ordenados
  agrupar por slugify(categoryName)
  → Category{ name, slug, count, lastmod }
  lastmod = max(updated ?? publishDate) en posts del grupo
  ordenar alfabéticamente por name

getAuthors():
  misma lógica, keyed en slugify(post.author)
```

---

## 4. Schema del Frontmatter (BlogPostSchema)

Definido en `src/lib/types/blog.ts`:

```typescript
const BlogPostSchema = z.object({
  title:       z.string().min(1),
  description: z.string().min(10),
  author:      z.string().min(1),         // display name ("Hector Luis Lorenzo")
  publishDate: z.string().date()          // YYYY-MM-DD
               .or(z.string().datetime({ offset: true })),
  updated:     z.string().optional(),     // YYYY-MM-DD — drives sitemap lastmod
  excerpt:     z.string().min(10),        // requerido, ≥10 chars
  coverImage:  z.string().url(),          // requerido — URL completa
  categories:  z.array(z.string()).default([]),
  tags:        z.array(z.string()).default([]),
  draft:       z.boolean().optional().default(false),
})
```

`slug` NO está en el frontmatter — se deriva del nombre del archivo `.svx`.

### Semántica de fechas

| Campo | Semántica | Mutabilidad |
|-------|-----------|-------------|
| `publishDate` | Cuándo el post se vuelve visible (filtro de build) | Inmutable después del primer publish |
| `updated` | Última modificación significativa del contenido | Mutable — actualizar con `just post-touch <slug>` |
| `date` | N/A — no existe en este schema | — |

**`updated` maneja el `lastmod` del sitemap**. Si `updated` no está presente, el sitemap
usa `publishDate` como lastmod.

**`publishDate` en el futuro**: el post existe en el repo pero es excluido del build hasta
que `publishDate ≤ fecha_del_build`. El cron worker dispara un rebuild diario para publicar
posts programados.

---

## 5. Scheduling (Publicación Programada)

### Mecanismo

El filtro `publishDate ≤ new Date()` se evalúa en `blog-pipeline.ts` **en tiempo de build**,
no en runtime. El sitio es estático — no hay servidor que filtre por request.

Para que un post con `publishDate` futuro aparezca, se necesita un rebuild. Hay dos triggers:

1. **git push** → CI de Cloudflare Pages → build inmediato
2. **cron diario** → `workers/blog-rebuild/` → POST al deploy hook → CI build

### Latencia máxima (ADR-004)

Un post schedulado para las 09:00 puede aparecer hasta 24 horas tarde dependiendo del
timing del cron (08:00 UTC = 09:00 CET / 10:00 CEST). Para el blog de MEG esto es aceptable.
Si se necesita precisión, la alternativa sería un deploy manual o un cron más frecuente.

### Cron Worker (`workers/blog-rebuild/`)

```toml
# workers/blog-rebuild/wrangler.toml
name = "meg-blog-rebuild"
[triggers]
crons = ["0 8 * * *"]   # 08:00 UTC diario
```

El worker es minimalista — solo hace POST al deploy hook. No necesita D1, R2 ni KV.
Secret: `DEPLOY_HOOK_URL` (URL del webhook de Cloudflare Pages).

```typescript
// workers/blog-rebuild/src/index.ts
export default {
  async scheduled(_event, env, _ctx) {
    const response = await fetch(env.DEPLOY_HOOK_URL, { method: 'POST' });
    if (!response.ok) throw new Error(`Deploy hook failed: ${response.status}`);
  }
};
```

Lanza error en status no-2xx (ADR-006) para que aparezca en los logs del Worker y
permita alertas futuras.

---

## 6. R2 CDN para Media

### Estructura

- **Bucket**: `meg-blog-media` (cuenta `cc26ab18f887fb1c63c19e17a0bb313f`)
- **CDN base**: `https://cdn.malagaeventgear.com`
- **Dominio custom**: conectado via Cloudflare R2 Custom Domains

Las imágenes de los posts migrados se suben a R2 con keys del formato `<wpId>/<fileName>`.
Las URLs en el contenido mdsvex apuntan a `https://cdn.malagaeventgear.com/<wpId>/<fileName>`.

### Manifest de migración

`scripts/migrate-wp/manifest.json` registra cada media item y post procesado.
Permite idempotencia: re-ejecutar el script no re-sube imágenes ni re-emite posts ya procesados.

### Enriquecimiento del manifest en sitemaps

El `post-sitemap.xml` incluye bloques `<image:image>` para los posts con `coverImage`:

```xml
<image:image>
  <image:loc>https://cdn.malagaeventgear.com/...</image:loc>
</image:image>
```

---

## 7. Gotcha: HTML Entities en WP REST API

El WP REST API devuelve HTML entities sin decodificar en campos "no renderizados"
(títulos, nombres de categorías, tags, autores, excerpts). Por ejemplo:

```json
{ "name": "Corporate &amp; Enterprise" }
```

El script de migración incluye `scripts/migrate-wp/decode-entities.ts` que decodifica
estas entidades antes de usar cualquier string del WP API. El frontmatter de los `.svx`
emitidos contiene el texto limpio: `"Corporate & Enterprise"`.

---

## 8. Las 4 Rutas del Blog

| Ruta | Archivo | Datos |
|------|---------|-------|
| `/blog/` | `blog/+page.ts` + `blog/+page.svelte` | `getAllPosts()` |
| `/blog/[slug]/` | `blog/[slug]/+page.ts` + `+page.svelte` | `getPostBySlug(slug)` |
| `/blog/category/[category]/` | `blog/category/[category]/+page.ts` + `+page.svelte` | `getPostsByCategory(slug)` |
| `/blog/author/[author]/` | `blog/author/[author]/+page.ts` + `+page.svelte` | `getPostsByAuthor(slug)` |

Todas usan `prerender = true` con `entries()` generator derivado de `getCategories()` /
`getAuthors()`. SvelteKit no emite páginas para slugs que no están en `entries()`, por lo
que no hay riesgo de 404s en producción.

---

## 9. Los 3 Sitemaps del Blog

| Sitemap | Fuente | `<lastmod>` |
|---------|--------|-------------|
| `/post-sitemap.xml` | `getAllPosts()` | `updated ?? publishDate` |
| `/category-sitemap.xml` | `getCategories()` | `category.lastmod` (max de posts) |
| `/author-sitemap.xml` | `getAuthors()` | `author.lastmod` (max de posts) |

---

## 10. Referencia de Archivos

| Archivo | Rol |
|---------|-----|
| `src/content/blog/*.svx` | Contenido de posts (frontmatter YAML + Markdown) |
| `src/lib/types/blog.ts` | `BlogPostSchema`, `BlogPost`, `Category`, `Author` |
| `src/lib/utils/slugify.ts` | `slugify()` — usado por data layer y migration script |
| `src/lib/data/blog-pipeline.ts` | Lógica pura testable (filtros, sort, taxonomy) |
| `src/lib/data/blog.ts` | API pública (`getAllPosts`, etc.) — thin wrapper sobre pipeline |
| `src/lib/layouts/BlogPost.svelte` | Layout del post — `buildArticleSchema`, `SeoHead` |
| `scripts/post-new.ts` | Scaffold de nuevo post con frontmatter válido |
| `scripts/post-touch.ts` | Actualiza campo `updated` en frontmatter existente |
| `scripts/migrate-wp/` | Script one-shot de migración desde WordPress |
| `workers/blog-rebuild/` | Cron worker para rebuilds diarios |
| `.agents/WP_MIGRATION.md` | Runbook de migración paso a paso |
