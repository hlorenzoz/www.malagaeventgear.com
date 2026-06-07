# WordPress → mdsvex Blog Migration — Runbook

Guía paso a paso para migrar los posts de WordPress a posts nativos mdsvex en este proyecto.
Esta operación es **one-shot**: los 75 posts del blog de MEG se migran una sola vez y luego
el blog crece con `just post-new`.

Estos pasos NO los puede hacer el código: requieren crear recursos en tu cuenta de
Cloudflare, configurar el bucket R2, y tener la CLI de wrangler autenticada correctamente.
Seguí el orden exactamente.

> Prerrequisito: tener `bun`, `bunx`, y `wrangler` instalados.
> Verificá: `bun --version` y `bunx wrangler --version`.

> ⚠️ **Gotcha entre cuentas (crítico).** El sitio vive bajo la cuenta de Cloudflare
> **`cc26ab18f887fb1c63c19e17a0bb313f`** (visible en el log del build de Pages). Wrangler
> opera con la cuenta del login activo. Si `wrangler whoami` no muestra esa cuenta, los
> uploads a R2 van a fallar con `Authentication error 10000` o `code 7403`.
> Solución: `bunx wrangler logout && bunx wrangler login` con el email dueño de esa cuenta.
> Como fallback, podés crear el bucket manualmente desde el dashboard de esa cuenta y
> exportar `CLOUDFLARE_ACCOUNT_ID=cc26ab18f887fb1c63c19e17a0bb313f` antes de cada
> comando de wrangler — la variable de entorno sobreescribe el account del login.

---

## Prerrequisitos

1. **CLI autenticada en la cuenta correcta**

   ```bash
   bunx wrangler login
   # En el navegador, autenticarte con el email dueño de la cuenta cc26ab18f887fb1c63c19e17a0bb313f
   bunx wrangler whoami
   # Debe mostrar: Account Name (cc26ab18f887fb1c63c19e17a0bb313f)
   ```

   Si `whoami` no muestra la cuenta correcta, exportá la variable antes de continuar:

   ```bash
   export CLOUDFLARE_ACCOUNT_ID=cc26ab18f887fb1c63c19e17a0bb313f
   ```

   El script `scripts/migrate-wp/r2-uploader.ts` ya inyecta esta variable en cada llamada
   a wrangler — pero si usás comandos manuales, tenés que setearla vos.

2. **Acceso al WP REST API**

   Verificá que el API esté accesible antes de empezar:

   ```bash
   curl -s "https://malagaeventgear.com/wp-json/wp/v2/posts?per_page=1" | bunx jq '.[0].id'
   # Debe devolver un número (el ID del post más reciente)
   ```

   Si devuelve un error 401 o 403, el REST API puede estar detrás de autenticación.
   En ese caso, contactá al administrador del WP.

---

## 1. Crear el bucket R2 `meg-blog-media`

El bucket vive en la cuenta `cc26ab18f887fb1c63c19e17a0bb313f`.

```bash
CLOUDFLARE_ACCOUNT_ID=cc26ab18f887fb1c63c19e17a0bb313f \
  bunx wrangler r2 bucket create meg-blog-media
```

Verificación:

```bash
CLOUDFLARE_ACCOUNT_ID=cc26ab18f887fb1c63c19e17a0bb313f \
  bunx wrangler r2 bucket list
# Debe aparecer: meg-blog-media
```

---

## 2. Conectar dominio personalizado `cdn.malagaeventgear.com`

Esto se hace desde el dashboard de Cloudflare (no hay CLI para esto):

1. Ir a **Cloudflare Dashboard** → cuenta `cc26ab18f887fb1c63c19e17a0bb313f`
2. R2 → bucket `meg-blog-media` → **Settings** → **Custom Domains**
3. Click **Connect Domain** → ingresar `cdn.malagaeventgear.com`
4. Cloudflare crea automáticamente el registro CNAME en el DNS del dominio
5. Esperar a que el dominio aparezca como **Active** (puede tomar hasta 5 minutos)

Verificación:

```bash
curl -I "https://cdn.malagaeventgear.com/"
# Debe devolver HTTP 200 o 404 — cualquiera indica que el CDN responde
# (404 es normal si el bucket está vacío)
```

---

## 3. Generar el Deploy Hook de Cloudflare Pages

El deploy hook permite disparar rebuilds del sitio sin un git push.
Lo usa el cron worker `workers/blog-rebuild/` para publicar posts programados.

1. Ir a **Cloudflare Dashboard** → Pages → proyecto del sitio MEG
2. **Settings** → **Builds & deployments** → **Deploy hooks**
3. Click **Add deploy hook**:
   - Nombre: `blog-rebuild-cron`
   - Branch: `main`
4. Copiar la URL generada (formato: `https://api.cloudflare.com/client/v4/pages/webhooks/deploy_hooks/...`)

---

## 4. Cargar el secret `DEPLOY_HOOK_URL` en el worker

```bash
bunx wrangler secret put DEPLOY_HOOK_URL --name meg-blog-rebuild
# Pegá la URL copiada en el paso anterior cuando el CLI la pida
```

Verificación:

```bash
bunx wrangler secret list --name meg-blog-rebuild
# Debe mostrar: DEPLOY_HOOK_URL
```

---

## 5. Dry-run: auditar antes de migrar

**SIEMPRE hacé el dry-run primero.** Solo hace GET requests de lectura al WP REST API.
No escribe archivos ni sube nada a R2.

```bash
just migrate-wp-dry-run
# o directamente:
bun scripts/migrate-wp/index.ts --dry-run
```

### Resultados conocidos del dry-run (datos al 2026-06-06)

El dry-run ejecutado contra el WP de producción encontró:

- **75 posts** en total
- **6 categorías**:
  - Audio Visual Rental → `audio-visual-rental`
  - Corporate &amp; Enterprise → `corporate-enterprise` *(HTML entity decodificado automáticamente)*
  - Events → `events`
  - Gadgets → `gadgets`
  - News → `news`
  - Weddings → `weddings`
- **1 autor**: "Hector Luis Lorenzo" → `hector-luis-lorenzo`
- **Sin colisiones de slugs**
- **Sin slugs con caracteres unicode** (todos son ASCII)

El bug de HTML entities (WP REST API devuelve `&amp;`, `&#038;`, etc. en campos no
renderizados como títulos, nombres de categorías, nombres de autores) está corregido
en el script via `decode-entities.ts`.

---

## 6. Migración real

Una vez que el dry-run se ve bien, ejecutá la migración completa:

```bash
just migrate-wp-run
# o directamente:
bun scripts/migrate-wp/index.ts
```

El script:
1. Lee el manifest existente (`scripts/migrate-wp/manifest.json`) para idempotencia
2. Hace fetch de todos los posts del WP REST API (con paginación)
3. Descarga cada imagen a un archivo temporal
4. La sube a R2 bajo la cuenta `cc26ab18f887fb1c63c19e17a0bb313f`
5. Convierte cada post: HTML → Markdown (con h1-demote, stripping de shortcodes)
6. Reescribe todas las URLs de imágenes WP a CDN (`cdn.malagaeventgear.com`)
7. Emite `src/content/blog/<slug>.svx` para cada post
8. Actualiza `scripts/migrate-wp/manifest.json`

**Idempotencia**: si el script falla a mitad, volvé a ejecutarlo — retoma desde donde quedó
sin re-subir media ni re-emitir posts que ya están en el manifest.

---

## 7. Redirects (`static/_redirects`)

### Cómo se generan

La migración genera automáticamente el archivo `static/_redirects` durante el paso de
la migración real (no en dry-run). El archivo mapea cada URL vieja de WordPress al
nuevo path del blog de SvelteKit.

**Formato de regla** (Cloudflare Pages):
```
/old-post-slug/  /blog/old-post-slug/  301
```

El archivo usa un bloque delimitado para que las re-ejecuciones solo reemplacen las
reglas del blog sin tocar reglas no relacionadas:

```
# BEGIN wp-blog-redirects (managed — do not edit manually)
/weather-considerations-for-outdoor-rentals/  /blog/weather-considerations-for-outdoor-rentals/  301
...
# END wp-blog-redirects
```

**Función clave**: `deriveOldPath(link)` en `scripts/migrate-wp/redirects.ts` — extrae
el pathname de la URL de WP, asegura trailing slash, descarta query strings y hash.

**Límite de reglas**: Cloudflare Pages tiene un límite de 100 reglas en el plan gratuito.
Con 75 posts + 6 categorías = 81 reglas (bajo el límite). Si el total supera 100, el
script omite automáticamente las reglas de taxonomía y emite un WARNING en stdout.

### Verificar las redirects después del deploy

Después de hacer deploy del sitio con el `_redirects` generado, verificá que cada URL
vieja devuelve 301 hacia el path correcto:

```bash
# Verificar una URL puntual
curl -s -o /dev/null -w "%{http_code} %{redirect_url}" \
  "https://malagaeventgear.com/weather-considerations-for-outdoor-rentals/"
# Debe devolver: 301 https://malagaeventgear.com/blog/weather-considerations-for-outdoor-rentals/

# Verificar que el destino devuelve 200
curl -s -o /dev/null -w "%{http_code}" \
  "https://malagaeventgear.com/blog/weather-considerations-for-outdoor-rentals/"
# Debe devolver: 200
```

Para verificar todos los posts de una sola vez, extraé las reglas del `_redirects` y
probá cada una:

```bash
# Extraer todos los old paths del bloque gestionado
awk '/BEGIN wp-blog-redirects/,/END wp-blog-redirects/' static/_redirects \
  | grep '^/' \
  | awk '{print $1}' \
  | while read path; do
      code=$(curl -s -o /dev/null -w "%{http_code}" "https://malagaeventgear.com${path}")
      echo "$code $path"
    done
# Todos deben devolver 301
```

### Checklist post-deploy

- [ ] `static/_redirects` fue commiteado y está en el deploy
- [ ] `https://malagaeventgear.com/weather-considerations-for-outdoor-rentals/` devuelve 301
- [ ] El Location header apunta a `/blog/...` (no un redirect doble)
- [ ] Las páginas raíz (`/packages/`, `/about-us/`) siguen devolviendo 200 (NO redirigidas)
- [ ] Verificar en Cloudflare Dashboard → Pages → Redirects que las reglas aparecen

---

## 8. Auditoría de slugs post-migración

Después de emitir los `.svx`:

```bash
# Listar todos los slugs emitidos
fd -e svx . src/content/blog/ | sort

# Verificar que no haya duplicados
fd -e svx . src/content/blog/ | xargs -I{} basename {} .svx | sort | uniq -d
# Debe devolver vacío (sin duplicados)
```

Si hay colisiones (no debería haberlas según el dry-run), renombrá manualmente el archivo
menos importante y actualizá su frontmatter slug manualmente.

---

## 8. Verificación post-migración

```bash
# 1. Correr los tests (deben seguir en verde)
bun run test

# 2. Levantar dev y verificar el blog manualmente
bun run dev
# Navegar a http://localhost:5173/blog/
# Verificar que aparecen posts, que las imágenes cargan desde cdn.malagaeventgear.com
# Verificar una ruta de categoría: http://localhost:5173/blog/category/events/
# Verificar una ruta de autor: http://localhost:5173/blog/author/hector-luis-lorenzo/

# 3. E2E (opcional, tarda más)
bunx playwright test
```

Lista de verificación:

- [ ] `bun run test` — todos los tests en verde (240+)
- [ ] `/blog/` muestra posts con título, excerpt e imagen
- [ ] `/blog/[slug]/` renderiza el contenido del post con layout correcto
- [ ] `/blog/category/events/` lista posts de la categoría
- [ ] `/blog/author/hector-luis-lorenzo/` muestra el autor y sus posts
- [ ] Las imágenes cargan desde `cdn.malagaeventgear.com` (no desde `malagaeventgear.com/wp-content/`)
- [ ] `GET /post-sitemap.xml` devuelve 75+ entradas
- [ ] `GET /category-sitemap.xml` devuelve 6 entradas
- [ ] `GET /author-sitemap.xml` devuelve 1 entrada
- [ ] No hay posts con `draft: true` visibles (solo hay posts de fixture de test)

---

## 9. Deploy del cron worker

El worker `workers/blog-rebuild/` dispara un rebuild diario a las 08:00 UTC para
publicar posts programados (con `publishDate` en el futuro).

```bash
just blog-rebuild-deploy
# o directamente:
cd workers/blog-rebuild && bunx wrangler deploy
```

Verificar que el cron está activo:

```bash
bunx wrangler triggers list --name meg-blog-rebuild
# Debe mostrar: crons: ["0 8 * * *"]
```

---

## 10. Rollback

Si la migración produce resultados inesperados:

### Opción A: Rollback completo (borrar todos los .svx emitidos)

```bash
# CUIDADO: elimina todos los posts migrados (no los de fixture de tests)
fd -e svx . src/content/blog/ | grep -v 'test-post\|future-post' | xargs rm
# Revisar manualmente lo que va a borrar antes de ejecutar con xargs rm
```

### Opción B: Rollback selectivo

```bash
# Eliminar un post específico por slug
rm src/content/blog/mi-post-problematico.svx
```

### Opción C: Rollback de media en R2

Las imágenes en R2 son idempotentes (subir de nuevo sobreescribe). Para borrar todo:

```bash
# Listar objetos en el bucket
CLOUDFLARE_ACCOUNT_ID=cc26ab18f887fb1c63c19e17a0bb313f \
  bunx wrangler r2 object list meg-blog-media

# Borrar un objeto específico
CLOUDFLARE_ACCOUNT_ID=cc26ab18f887fb1c63c19e17a0bb313f \
  bunx wrangler r2 object delete meg-blog-media/<r2Key>
```

El manifest (`scripts/migrate-wp/manifest.json`) también puede editarse manualmente o
borrarse para forzar una re-migración completa desde cero.

---

## Referencia de archivos

| Pieza | Ruta |
|-------|------|
| Orchestrator del script | `scripts/migrate-wp/index.ts` |
| Tipos WP + Manifest | `scripts/migrate-wp/types.ts` |
| WP REST API client | `scripts/migrate-wp/wp-client.ts` |
| Downloader de imágenes | `scripts/migrate-wp/downloader.ts` |
| Uploader a R2 | `scripts/migrate-wp/r2-uploader.ts` |
| HTML → Markdown | `scripts/migrate-wp/turndown.ts` |
| Reescritura de URLs | `scripts/migrate-wp/url-rewriter.ts` |
| Frontmatter builder | `scripts/migrate-wp/frontmatter.ts` |
| Emitter .svx | `scripts/migrate-wp/emitter.ts` |
| Manifest I/O | `scripts/migrate-wp/manifest.ts` |
| Redirect generator | `scripts/migrate-wp/redirects.ts` |
| Manifest JSON | `scripts/migrate-wp/manifest.json` |
| Redirects generados | `static/_redirects` |
| Posts emitidos | `src/content/blog/*.svx` |
| Cron worker | `workers/blog-rebuild/` |
| Runbook de lead capture | `docs/lead-capture-deployment.md` |

## Comandos rápidos

```bash
just migrate-wp-dry-run   # Auditar sin escribir nada
just migrate-wp-run       # Migración real (dry-run primero)
just post-new             # Crear un nuevo post de blog
just post-touch <slug>    # Marcar un post como modificado hoy
just blog-rebuild-deploy  # Desplegar el cron worker de rebuild
bun run test              # Verificar que todos los tests siguen en verde
```
