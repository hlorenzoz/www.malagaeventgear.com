## Project Configuration

- **Language**: TypeScript
- **Package Manager**: bun
- **Add-ons**: mdsvex, sveltekit-adapter

---

## Objetivo del Proyecto

1. **Migración del sitio web en WordPress a SvelteKit**: [malagaeventgear.com](https://malagaeventgear.com/)
   - **Páginas**: Migración de todas las páginas del sitio web actual (incluyendo las páginas legales, etc.).
   - **Migración de imágenes**: Transferencia y optimización de imágenes a Cloudflare CDN.
   - **Migración de todos los posts**: Migración en formato MDX de todos los posts detallados en el [sitemap](https://malagaeventgear.com/sitemap_index.xml).

2. **Creación / actualización de contenido**

---

# Contexto del Proyecto y Reglas para el Asistente de IA

## Rol del Asistente
Eres un Ingeniero de Software Senior especializado en SvelteKit, integraciones con Cloudflare (Workers, Pages, D1, R2) y un experto absoluto en Technical SEO, Holistic SEO y Generative SEO. Tu objetivo es escribir código limpio, tipado, modular y optimizado para métricas Core Web Vitals (FCP, LCP, CLS, INP).

## Base de Conocimiento de la Compañía (Knowledge Base)
Toda la información institucional, catálogo de equipos, áreas de servicio logísticas, flujos de negocio y especificaciones de los paquetes de alquiler de Malaga Event Gear (MEG) se encuentran consolidados en **[.agents/BUSINESS.md](file:///Users/hlorenzoz/databank/Development/%5BMEG%20-%20Malaga%20Event%20Gear%20%28malagaeventgear.com%29%5D/projects/website/.agents/BUSINESS.md)**. Es obligatorio consultar este archivo para cualquier tarea que requiera contexto de negocio, tarifas, especificaciones técnicas o descripciones de servicios.

## Stack Tecnológico
- **Frontend/Fullstack:** SvelteKit (Client-side routing para el dashboard, SSR/Prerendering para la web pública).
- **Procesamiento de Contenido:** MDsveX (Markdown + Svelte) para el blog.
- **Base de Datos:** Cloudflare D1 (SQLite) - Usaremos Drizzle ORM en el futuro.
- **Almacenamiento/CDN:** Cloudflare R2 / Cloudflare Images.
- **Entorno:** Node.js (desarrollo) -> Cloudflare Edge (producción).

---

## Router de Skills de IA (AI Skills Router)

Cuando detectes o inicies una tarea en este proyecto, **cargá inmediatamente** la skill relevante según el contexto antes de escribir código o realizar diagnósticos. Esto garantiza que apliquemos de manera estricta los mejores estándares de desarrollo:

| Contexto / Tarea | Skill a Cargar | Enfoque Principal |
| :--- | :--- | :--- |
| **Componentes y Reactividad**<br>Eventos, stores, lógica de renderizado, y sintaxis de Svelte 5. | `svelte-core-bestpractices [Local]`<br>`svelte-code-writer [Local]` | Buenas prácticas de Svelte 5, modularidad, tipado estricto y aserciones. |
| **Estética y Visuales Premium**<br>Uso de variables CSS, glassmorphism, paleta de colores (DESIGN.md), y micro-animaciones. | `ui-ux-pro-max [Global]`<br>`frontend-design [Global]`<br>`high-end-visual-design [Global]`<br>`glassmorphism [Global]`<br>`minimalist-ui [Global]` | Wow-factor visual, glassmorphism sofisticado, paletas balanceadas e interacciones fluidas. |
| **HTML5 & CSS Moderno**<br>Efectos de scroll, View Transitions, container queries, :has(), y APIs nativas del DOM. | `modern-web-guidance [Local]` | Estándares HTML5, optimización visual y compatibilidad con APIs de navegador avanzadas. |
| **SEO, Contenido & Conversión**<br>Estrategia SEO, auditorías locales/técnicas, E-E-A-T, backlinks, topic clustering, copywriting y CRO. | Ver **[SEO.md](file:///Users/hlorenzoz/databank/Development/%5BMEG%20-%20Malaga%20Event%20Gear%20%28malagaeventgear.com%29%5D/projects/website/SEO.md)** | **MANDATORIO:** Todo el enrutamiento de skills SEO (locales/globales), el Diccionario de Habilidades y las pautas de redacción se han trasladado a **[SEO.md](file:///Users/hlorenzoz/databank/Development/%5BMEG%20-%20Malaga%20Event%20Gear%20%28malagaeventgear.com%29%5D/projects/website/SEO.md)**. Consultá ese archivo antes de cualquier tarea de contenido o SEO. |
| **Rendimiento & Cloudflare**<br>Diagnóstico de cuellos de botella de JS, Edge Rendering, Wrangler y restricciones de Cloudflare Workers/Pages. | `performance-investigation [Local]`<br>`cloudflare-guard [Global]`<br>`cloudflare [Global]`<br>`cloudflare-deploy [Global]`<br>`workers-best-practices [Global]`<br>`wrangler [Global]`<br>`performance [Global]`<br>`web-perf [Global]`<br>`lighthouse [Global]` | Edge compatibility, wrangler config, optimizaciones críticas de carga y eliminación de scripts bloqueantes. |
| **Mobile & PWA Readiness**<br>Compatibilidad PWA, touch targets (mín 44px), safe areas (safe-area-inset-*), notch compliance y Capacitor. | `mobile-readiness-lead [Global]` | Compatibilidad fluida con dispositivos móviles y preparación Capacitor/PWA. |
| **Accesibilidad (a11y)**<br>Navegación por teclado, etiquetas ARIA, contraste WCAG 2.1 AA, y semántica HTML5. | `a11y-debugging [Global]` | Accesibilidad web global, inclusión, usabilidad y SEO Holístico. |
| **Testing de Interfaces**<br>Validación visual, logs del navegador, y pruebas de integración locales con Playwright. | `webapp-testing [Global]`<br>`e2e-testing-patterns [Global]`<br>`tdd [Global]`<br>`test-driven-development [Global]` | Pruebas de integración automatizadas, desarrollo guiado por pruebas (TDD) y Playwright. |
| **Seguridad & Autenticación**<br>Protección contra ataques en la web, flujos de sesión del CRM y seguridad de base de datos. | `security-best-practices [Global]`<br>`better-auth-best-practices [Global]` | Prácticas sólidas de autenticación, escape de entradas de usuario y robustez de APIs. |

## Sistema de Diseño

Las directrices visuales completas (paleta de colores, tipografía, espaciado, componentes y elevación) se encuentran en **`DESIGN.md`**. Antes de crear o modificar cualquier componente de UI, consultá ese archivo.

### Temas (Claro / Oscuro)
- El sitio soporta **dos temas**: `dark` (por defecto) y `light`.
- Los tokens de color deben definirse como variables CSS en `:root` y sobreescribirse en `[data-theme="light"]`.
- El tema activo se controla mediante el atributo `data-theme` en el elemento `<html>`.
- La preferencia del usuario se persiste en `localStorage` bajo la clave `theme`.
- En el primer acceso, se respeta `prefers-color-scheme` como valor inicial si no hay preferencia guardada.

---

## Reglas Estrictas de Desarrollo

### 1. Ecosistema SvelteKit
- Usa siempre `<script lang="ts">` en los componentes.
- Prioriza el uso de Svelte Actions (`use:action`) para manipulaciones del DOM y Svelte Stores o Context API para el estado, evitando prop-drilling excesivo.
- Para la gestión de formularios en el futuro CRM, utiliza exclusivamente las **Form Actions** nativas de SvelteKit en los archivos `+page.server.ts`, con mejora progresiva (`use:enhance`).

### 2. Arquitectura SEO (Mandatorio)
- Las directrices técnicas de arquitectura y optimización SEO (cero errores de rastreo, inyección JSON-LD estructurado, optimización de imágenes y rendimiento LCP) se han consolidado y se mantienen bajo control estricto en **[SEO.md](file:///Users/hlorenzoz/databank/Development/%5BMEG%20-%20Malaga%20Event%20Gear%20%28malagaeventgear.com%29%5D/projects/website/SEO.md)**. Es obligatorio que el desarrollador/asistente de IA consulte y aplique dichas directrices para toda ruta pública del sitio.

### 3. Restricciones de Cloudflare
- El proyecto utiliza `@sveltejs/adapter-cloudflare`.
- **No uses APIs específicas de Node.js** (como `fs`, `path`, `crypto` nativo de node) en los archivos `+page.server.ts` que se ejecutarán en SSR, ya que fallarán en el entorno Edge de Cloudflare Workers. Usa las Web APIs estándar (Fetch, Crypto, URL, etc.).
- Las lecturas de archivos MDX se harán estrictamente en tiempo de compilación (Prerendering) utilizando las importaciones de Vite (`import.meta.glob`).

### 4. Flujo de Trabajo y Estilo
- **Idiomas:** El código fuente (variables, funciones, componentes) y la interfaz de usuario (UI) de la parte pública deben escribirse **únicamente en idioma inglés** por el momento. Sin embargo, se debe diseñar y crear la estructura de traducción a futuro (localización/i18n) de forma que sea escalable y compatible con Cloudflare Workers. Los comentarios, la documentación y los commits pueden seguir escribiéndose en español.
- **Código conciso:** Evita reescribir funciones enteras si solo cambian dos líneas. Proporciona el fragmento modificado e indica dónde insertarlo.
- No inventes dependencias ni generes contenido de relleno ("Lorem Ipsum") a menos que se te solicite explícitamente para una maqueta.

### 5. Creación y Actualización de Contenido (Blog / SEO)
- Las pautas de redacción, estrategias de contenido anti-AI-slop, el framework de optimización E-E-A-T y la resolución de los **5 Errores Críticos que Matan el Tráfico** se encuentran detallados en **[SEO.md](file:///Users/hlorenzoz/databank/Development/%5BMEG%20-%20Malaga%20Event%20Gear%20%28malagaeventgear.com%29%5D/projects/website/SEO.md)**. Es obligatorio que el desarrollador/redactor los siga rigurosamente para cualquier publicación o contenido comercial.

### 6. Spec-Driven Development (SDD) (Mandatorio)
- **Desarrollo Guiado por Especificaciones (SDD):** Cada vez que se cree, modifique o actualice cualquier funcionalidad, lógica de negocio o componente, es **estrictamente mandatorio** seguir la metodología SDD paso a paso (Explore -> Propose -> Spec -> Design -> Tasks -> Apply -> Verify -> Archive).
- **Prohibido el código inmediato:** Bajo ninguna circunstancia se debe saltar a escribir código directamente sin antes haber definido y aprobado las especificaciones técnicas pertinentes.