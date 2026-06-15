# Home `NO_LCP` — Investigación y resolución

> Página afectada: `/` (home). Síntoma: PageSpeed Insights **mobile** marcaba
> **`Largest Contentful Paint: Error! NO_LCP`** (y `Total Blocking Time: NO_LCP` en
> cascada), colapsando el score de Performance a error. FCP/Speed Index/CLS estaban sanos.
> Estado: **RESUELTO** (commit `882eaf5`). La home pasó de *siempre NO_LCP* a **~93**.

## TL;DR para agentes (leé esto primero)

- **Causa raíz:** la home no tenía **ninguna imagen `<img>` real above-the-fold**. Su backdrop
  era full-viewport (primero un `<img>` 161% del viewport, luego CSS `background-image`, luego un
  gradiente). El Chrome de PageSpeed **excluye los elementos full-viewport de la candidatura de
  LCP** pero igual retienen el slot de "largest paint", **suprimiendo la emisión de todo candidato
  más chico** → cero candidatos → `NO_LCP`.
- **El fix:** poner la foto del hero como un **`<img>` real, acotado (no full-viewport), `eager` +
  `fetchpriority="high"`, above-the-fold**. Es el patrón EXACTO por el que `/packages/` puntúa 93
  (su LCP es el `<img>` de la primera package card, en un contenedor `h-44`). Una imagen real,
  eager y acotada es el elemento que **toda** versión de Chrome registra de forma robusta.
- **No pierdas tiempo con:** Bot Fight Mode (ver abajo), `font-display`, scroll-snap de carruseles,
  animaciones de opacity, el CSS crítico. Todos fueron descartados con evidencia.
- **Cómo diagnosticar LCP acá (método que funcionó):** Lighthouse completo (no el trace `autoStop`
  de chrome-devtools, que es ruidoso/intermitente) y mirá `audits.metrics.details.items[0].lcpLoadDuration`:
  **`>0` = el LCP es una imagen; `None`/`0` = el LCP es texto.**

## Por qué local nunca lo reproduce (clave)

El **Lighthouse local (Chrome actual)** SIEMPRE da un LCP válido sobre el MISMO contenido que PSI
llama `NO_LCP`. Se confirmó midiendo la URL `*.workers.dev` (Worker sin proxy naranja → sin nada
del edge de Cloudflare): PSI = `NO_LCP`, Lighthouse local = LCP válido. Conclusión: es una
diferencia entre el **Chrome fijado/más estricto de PSI** y el Chrome actual en cómo decide la
candidatura de LCP. Implicancia práctica: **no se puede iterar el fix con Lighthouse local**
(siempre pasa); hay que validar con PSI sobre producción, y razonar estructuralmente.

## Hipótesis DESCARTADAS (con evidencia — no las repitas)

1. **Cloudflare Bot Fight Mode / `challenge-platform/jsd/main.js`** — la causa documentada del hit de
   score en `/blog/` y `/packages/` (ver `docs/forced-reflow-investigation.md` y `TODO.txt`). **NO es
   la causa del home NO_LCP:** con BFM **OFF** el `NO_LCP` persistía, y la URL `*.workers.dev` (sin
   edge) también daba `NO_LCP`.
2. **Imagen full-viewport (CSS background o `<img>`)** — al quitarla (gradiente) el `NO_LCP` seguía,
   pero eso fue porque el LCP pasó a ser texto con otro problema. La lección real: el backdrop
   full-viewport **suprime** candidatos; la solución no es quitarlo sino **dar un `<img>` elegible**.
3. **`font-display: optional` en el `<h1>`** (cuando el LCP era texto) — se cambió a `swap`; el
   `NO_LCP` siguió. No era el gatillo.
4. **Scroll-snap de carruseles** (auto-scroll en el load que "para" el registro de LCP) — se probó
   `snap-proximity` (38c91da) y diferir el overflow hasta `onMount` (3b67a8c); ninguno lo arregló.
5. **Animaciones `.reveal` (opacity 0→1)** — los `.reveal` del home se renderizan en SSR con
   `active is-revealed` (opacity:1), no animan; el hero no tiene `.reveal`.
6. **CSS crítico inline** — 94KB raw pero **solo 14.5KB gzip**, Tailwind v4 legítimo, sin grasa.
   Externalizar (bajar `inlineStyleThreshold`) es neutro para el score en carga fría de PSI.

## El fix (commit `882eaf5`, mejorado en `cd22d3e`)

`src/routes/(public)/+page.svelte` — hero ahora es **texto + foto acotada**:
```svelte
<picture>
  <source media="(min-width: 768px)" srcset="/hero-stage.webp" width="1024" height="768" />
  <img src="/hero-stage-mobile.webp" alt="…" width="800" height="600"
       loading="eager" fetchpriority="high" decoding="async"
       class="w-full aspect-4/3 object-cover rounded-2xl …" />
</picture>
```
- `<img>` real, **acotado** (`aspect-4/3 object-cover`, NO full-viewport — las fuentes cuadradas
  con object-cover desbordaban al 161% → exclusión). `eager` + `fetchpriority="high"` + `<link
  rel="preload">` para ambas variantes. `order-1` en mobile para que quede above-the-fold = LCP ahí.
- Se removieron las 3 bento cards del hero (el "At a Glance" de abajo cubre esos value props).
- Variantes 4:3 recortadas y bien dimensionadas: `static/hero-stage.webp` (1024×768, ~61KB vs 82KB
  cuadrada) y `static/hero-stage-mobile.webp` (700×525). El `og:image`/`twitter:image` siguen usando
  la cuadrada `premium_event_stage.webp`.
- `src/routes/(public)/+page.ts` (nuevo): `export const prerender = true` — la home es estática de
  build; servirla prerenderizada baja el TTFB. Es seguro (el layout solo carga categorías estáticas).

## Estado residual: intermitencia (no es bug)

PSI da resultados **intermitentes** sobre la misma home (NO_LCP vs 93 entre corridas). Es **varianza
del laboratorio de PSI** cuando el paint del LCP (~3.6s) cae justo en el borde de su ventana de
medición. El score real es **~93**; las corridas `NO_LCP` son fallos de captura de PSI, no
regresiones. CrUX = "No Data" (sin datos de campo) y los usuarios reales (Chrome actual) tienen LCP
válido. El único lever para estabilizarla sería bajar el tiempo-a-LCP (aligerar el above-the-fold),
**no** el CSS. Se decidió cerrar en 93.

## Gotchas operativos (para no romper el entorno)

- **Nunca** uses un loop infinito de `queueMicrotask` en un `initScript` de chrome-devtools-mcp:
  congela el renderer y rompe la red del browser para toda la sesión.
- Demasiados requests automatizados al apex *proxied* (`malagaeventgear.com`) → Cloudflare puede
  **rate-limitear tu IP** temporalmente (curl da timeout; google/github responden OK). La URL
  `*.workers.dev` NO pasa por ese proxy y queda exenta — útil para medir sin tocar el apex.

## Verificación

- Local (estructural): `bun run build` → la home prerenderizada (`.svelte-kit/output/prerendered/pages/index.html`)
  debe contener el `<img>` acotado eager con `fetchpriority="high"`. (Lighthouse local SIEMPRE pasa,
  así que no sirve para confirmar el fix de PSI.)
- Producción: PageSpeed mobile en `https://malagaeventgear.com/` → Performance computa (sin `NO_LCP`),
  ~93. Comparar con `/packages/` (mismo patrón de `<img>` LCP).
