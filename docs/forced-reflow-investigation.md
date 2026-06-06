# Forced Reflow — Investigación y optimización de performance (páginas de paquete)

> Páginas afectadas: `/packages/[slug]/` (críticas para conversión).
> Estado: **todo lo controlable desde el repo está resuelto y verificado.** El forced reflow
> residual (`[unattributed]`, Unscored) proviene del **edge de Cloudflare**, no del código.

## Contexto

Partimos de un score de performance **71** (mobile) en las páginas de paquete (FCP 3.0s, LCP 6.4s).
Tras las optimizaciones de abajo subió de forma sustancial. En paralelo, PageSpeed marcaba un insight
**Forced reflow** (Unscored) que fuimos persiguiendo hasta aislar su origen real.

Un *forced reflow* ocurre cuando JS consulta propiedades geométricas (offsetWidth, scrollWidth,
getBoundingClientRect…) después de invalidar estilos/DOM, forzando un cálculo de layout sincrónico.

## Optimizaciones de performance aplicadas (commits)

| Commit | Cambio | Efecto |
|--------|--------|--------|
| `355645b` | `inlineStyleThreshold`, defer de Turnstile, fuentes sin itálicas | Quita CSS render-blocking parcial + JS de terceros temprano |
| `de263ad` | `inlineStyleThreshold: 102400` | Inlina el CSS global (83 KB sin comprimir) → **cero CSS render-blocking** |
| `010b714` | Defer de IntersectionObservers a rAF; eliminado el `MutationObserver` global; defer del swap de fuentes | Saca el trabajo de layout del critical path de hidratación |
| `5e2d17f` | **Self-host de fuentes** (woff2 latin) + preload de Playfair; fuera Google Fonts | Elimina round-trip a `fonts.gstatic.com` y el insight ThirdParties |
| `08aefd3` | Preload de ambas fuentes + `font-display: optional` | Saca el body font de la cadena crítica; sin swap-relayout |

Detalle clave: `inlineStyleThreshold` compara contra el tamaño **sin comprimir** del CSS. El CSS de
Tailwind pesa **83 KB** sin comprimir (12 KB gzip), por eso el umbral debe superar 83 KB (usamos 102400).

## Hipótesis descartadas para el forced reflow (con evidencia)

Cada una se descartó porque, tras corregirla, el reflow **persistía** y/o porque un **trace local
bajo idénticas condiciones a PSI** (4× CPU + Slow 4G + viewport mobile, incluso con **caché en frío**
en contexto aislado) **nunca** reproduce el insight `ForcedReflow`.

1. **Nuestros IntersectionObservers / MutationObserver** — diferidos a `requestAnimationFrame` y el
   MutationObserver global eliminado (`010b714`). Auditoría: **0 patrones write→read** de geometría en
   el código (todas las lecturas son read-only o read-antes-de-write). Trace local: limpio.
2. **Cloudflare Rocket Loader** — ya estaba desactivado; el reflow seguía.
3. **Cloudflare Zaraz** — al desactivarlo (Configuration Rule "Zaraz: Off" por hostname) desapareció la
   atribución a su script inline (`:41/:42`), confirmando que **era una de las fuentes**. Pero quedó un
   resto.
4. **Email Address Obfuscation** (Scrape Shield) — desactivado; sin cambio.
5. **Swap de web-fonts** — self-host + `font-display: optional` (sin período de swap = sin relayout).
   El reflow **persistió**, descartando las fuentes como causa del resto.

## Causa raíz del residual: Cloudflare Edge Challenge Platform

La evidencia final está en la consola del navegador en producción:

```
…/cdn-cgi/challenge-platform/h/g/cmg/1  (preloaded)
"Request for the Private Access Token challenge"
```

- `/cdn-cgi/challenge-platform/` es la **detección de bots de Cloudflare en el edge**
  (**Bot Fight Mode** / **JavaScript Detections**), inyectada en hostnames *proxied*.
- Es un script **cross-origin** que recorre el DOM y mide geometría → forced reflow. Por ser
  cross-origin aparece como **`[unattributed]`** (sin stack de JS).
- **No es nuestro Turnstile** (`/turnstile/v0/api.js`), que además está diferido por viewport.
- Es **prod-only** (solo en el dominio proxied) → por eso **nunca** aparece en el preview local.

## Cómo eliminarlo (Cloudflare dashboard — fuera del repo)

1. **Security → Bots → Bot Fight Mode → Off** (es lo que inyecta el `challenge-platform` JS).
2. Y/o **Security → Settings → JavaScript Detections → Off**.

### Confirmación (1 min)
- Apagar Bot Fight Mode y volver a correr PageSpeed → si `[unattributed]` cae a 0, queda probado.
- Alternativa: medir el **mismo build** en la URL `*.workers.dev` (sin proxy naranja) → sin edge
  challenge, sin reflow.

## Recomendación

El forced reflow residual (~44–51 ms) es **Unscored** (no afecta el score, que ya mejoró mucho) y es un
script de **seguridad anti-bot del edge**. Trade-off sano: si no se necesita Bot Fight Mode, apagarlo;
si se necesita, **dejarlo** — son ~44 ms de protección anti-bot que no impactan la puntuación.

## Verificación local (reproducible)

```
just build && bun run preview         # sirve el build de producción en :4173
# chrome-devtools MCP: emulate CPU 4x + Slow 4G + viewport mobile, navegar a
# http://localhost:4173/packages/wedding/, performance_start_trace (reload)
# → el insight ForcedReflow NO aparece (ni en caché tibia ni en frío/aislado)
```

Nota: los errores de consola `content_script_bin.js` / `tag_assistant_api_bin.js` y las violaciones de
*Trusted Types* son **extensiones del navegador** (Google Tag Assistant), no del sitio. Medir en
Incognito sin extensiones para descartarlos.
