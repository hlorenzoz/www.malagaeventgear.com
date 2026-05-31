---
description: Audita el rendimiento de todas las páginas públicas con Lighthouse CI según .lighthouserc.json, usando el skill /lighthouse y chrome-devtools-mcp para el diagnóstico.
---

# /test-lighthouse

Audita el rendimiento (Core Web Vitals + asserts de `.lighthouserc.json`) de todas las páginas
públicas del sitio MEG y diagnostica cualquier regresión.

## Reglas obligatorias (AGENTS.md §10)

Antes de tocar nada, **cargá el skill `/lighthouse`** y tené disponible **`chrome-devtools-mcp`**
(configurado en `.mcp.json`). Prohibido optimizar a ciegas: toda conclusión parte de una medición.

## Pasos

1. **Cargar el skill `/lighthouse`** para tener a mano la referencia del CLI y la interpretación
   de métricas.

2. **Compilar y auditar** con Lighthouse CI (levanta el preview SSR y audita las 18 URLs de
   `.lighthouserc.json` ×3 runs):

   ```sh
   just test-lighthouse
   ```

   (equivale a `bun run build && bunx @lhci/cli autorun`)

3. **Leer el reporte**: revisá el resumen de asserts. El umbral es `performance >= 0.9` y
   `accessibility / best-practices / seo = 1`. Anotá qué URLs fallan y por qué métrica
   (LCP, FCP, CLS, TBT, render-blocking, etc.).

4. **Diagnóstico profundo con `chrome-devtools-mcp`** para cada página que falle:
   - Abrí la URL (localhost:4173 con el preview corriendo, o el deploy en
     `https://nuevo.malagaeventgear.com`).
   - Grabá un performance trace y analizá Core Web Vitals reales (LCP, INP, CLS), forced reflows,
     network dependency chains y recursos render-blocking.
   - Correlacioná el hallazgo del trace con el código fuente para ubicar la causa raíz.

5. **Reportar** al usuario: tabla de páginas × score, las métricas que fallan, la causa raíz
   identificada con el MCP, y la optimización propuesta. No apliques cambios sin aprobación.

6. **Re-medir** tras cualquier fix (pasos 2–4) para confirmar la mejora antes de cerrar la tarea.

## Notas

- Si `chrome-devtools-mcp` no está disponible, instalalo (`npx -y chrome-devtools-mcp@latest`,
  ya declarado en `.mcp.json`).
- Lighthouse CI no es dependencia del repo; se invoca con `bunx @lhci/cli`.
- El preview usa `wrangler pages dev .svelte-kit/cloudflare --port 4173`, así que requiere un build
  fresco (`just build`) — `just test-lighthouse` ya lo encadena.
