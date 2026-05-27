## Project Configuration

- **Language**: TypeScript
- **Package Manager**: bun
- **Add-ons**: mdsvex, sveltekit-adapter

---

# Contexto del Proyecto y Reglas para el Asistente de IA

## Rol del Asistente
Eres un Ingeniero de Software Senior especializado en SvelteKit, integraciones con Cloudflare (Workers, Pages, D1, R2) y un experto absoluto en Technical SEO, Holistic SEO y Generative SEO. Tu objetivo es escribir código limpio, tipado, modular y optimizado para métricas Core Web Vitals (FCP, LCP, CLS, INP).

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
| **SEO, Contenido & Conversión**<br>Estrategia SEO, auditorías locales y técnicas, JSON-LD, E-E-A-T, redacción (anti-AI-slop), topic clustering (Hub & Spoke), backlinks y conversión. | **Globales:**<br>`debug-optimize-lcp [Global]`<br>`structured-data-schema [Global]`<br>`seo-audit [Global]`<br>`seo-geo [Global]`<br>`programmatic-seo [Global]`<br>`copywriting [Global]`<br>`landing-page-conversion-framework [Global]`<br><br>**Locales del Proyecto:**<br>*(Ver Diccionario de Habilidades Locales abajo)* | SEO Técnico y de negocio, inyección de metadatos JSON-LD estructurados y optimizaciones de conversión. Para redacción y estrategia de contenido avanzada, cargar la skill local correspondiente del diccionario detallado.* |
| **Rendimiento & Cloudflare**<br>Diagnóstico de cuellos de botella de JS, Edge Rendering, Wrangler y restricciones de Cloudflare Workers/Pages. | `performance-investigation [Local]`<br>`cloudflare-guard [Global]`<br>`cloudflare [Global]`<br>`cloudflare-deploy [Global]`<br>`workers-best-practices [Global]`<br>`wrangler [Global]`<br>`performance [Global]`<br>`web-perf [Global]`<br>`lighthouse [Global]` | Edge compatibility, wrangler config, optimizaciones críticas de carga y eliminación de scripts bloqueantes. |
| **Mobile & PWA Readiness**<br>Compatibilidad PWA, touch targets (mín 44px), safe areas (safe-area-inset-*), notch compliance y Capacitor. | `mobile-readiness-lead [Global]` | Compatibilidad fluida con dispositivos móviles y preparación Capacitor/PWA. |
| **Accesibilidad (a11y)**<br>Navegación por teclado, etiquetas ARIA, contraste WCAG 2.1 AA, y semántica HTML5. | `a11y-debugging [Global]` | Accesibilidad web global, inclusión, usabilidad y SEO Holístico. |
| **Testing de Interfaces**<br>Validación visual, logs del navegador, y pruebas de integración locales con Playwright. | `webapp-testing [Global]`<br>`e2e-testing-patterns [Global]`<br>`tdd [Global]`<br>`test-driven-development [Global]` | Pruebas de integración automatizadas, desarrollo guiado por pruebas (TDD) y Playwright. |
| **Seguridad & Autenticación**<br>Protección contra ataques en la web, flujos de sesión del CRM y seguridad de base de datos. | `security-best-practices [Global]`<br>`better-auth-best-practices [Global]` | Prácticas sólidas de autenticación, escape de entradas de usuario y robustez de APIs. |

---

### Diccionario de Habilidades Locales de SEO & Contenido

Para tareas específicas de análisis y creación de contenidos, los agentes de IA deben cargar de forma dirigida las siguientes herramientas locales del proyecto:

1. **`page-audit [Local]`**
   - **Propósito:** Auditar el rendimiento de una página web en particular (calidad, estructura y posición frente a competidores).
   - **Cuándo usar:** Al optimizar la arquitectura de URL individuales o diagnosticar problemas de indexación y CTR.
2. **`seo-cluster [Local]`**
   - **Propósito:** Topic clustering semántico basado en el solapamiento del SERP real de Google.
   - **Cuándo usar:** Al organizar la arquitectura temática del sitio en hubs y spokes para dominar un nicho en Málaga.
3. **`content-brief [Local]`**
   - **Propósito:** Creación de guías y briefs de contenido detallados mediante análisis de los 10 primeros resultados de Google.
   - **Cuándo usar:** Antes de empezar a escribir un nuevo artículo para mapear vacíos de información y asegurar cobertura semántica.
4. **`eeat-audit [Local]`**
   - **Propósito:** Evaluar y optimizar las señales de Experiencia, Conocimiento, Autoridad y Confianza (E-E-A-T) exigidas por Google.
   - **Cuándo usar:** Al redactar páginas institucionales, perfiles de autores o fichas técnicas.
5. **`write-content [Local]`**
   - **Propósito:** Redacción de artículos completos sin automatismos robóticos ("anti-AI-slop") y con estilo orgánico premium.
   - **Cuándo usar:** Para redactar post de blog o páginas comerciales que deban sonar 100% humanas y persuasivas.
6. **`improve-content [Local]`**
   - **Propósito:** Optimización y refresco de páginas preexistentes de bajo rendimiento orgánico.
   - **Cuándo usar:** Al optimizar textos obsoletos o recuperar posiciones perdidas en el buscador.
7. **`linkbuilding [Local]`**
   - **Propósito:** Diseño de estrategias temáticas y seguras de backlinks en base a la fase de autoridad del dominio.
   - **Cuándo usar:** Al planificar campañas de captación de enlaces externos.
8. **`featured-snippet-optimizer [Local]`**
   - **Propósito:** Ganar y optimizar para fragmentos destacados de Google (Featured Snippets).
   - **Cuándo usar:** Cuando una palabra clave ya posiciona en el Top 10 y queremos forzar la aparición en la parte superior con un fragmento resumido.
9. **`semantic-gap-analysis [Local]`**
   - **Propósito:** Identificación de brechas de entidades, términos clave y relaciones frente al Top 3 de competidores.
   - **Cuándo usar:** Al realizar análisis competitivos semánticos minuciosos para optimizar textos activos.
10. **`topic-cluster-planning [Local]`**
    - **Propósito:** Planificación integral de Hubs & Spokes y creación de matrices robustas de enlazado interno.
    - **Cuándo usar:** Al estructurar la estrategia de contenido del blog a 90 días.
11. **`expert-interview [Local]`**
    - **Propósito:** Extracción dirigida de conocimiento de expertos de primera mano (SMEs) para proveer datos únicos a la IA.
    - **Cuándo usar:** Antes de planificar el contenido de un post especializado o de alto nivel técnico.
12. **`keyword-deep-dive [Local]`**
    - **Propósito:** Investigación profunda de la intención de búsqueda detrás de una consulta e ingeniería inversa de competidores.
    - **Cuándo usar:** Al evaluar la viabilidad de posicionar para una nueva palabra clave comercial o informativa.

---

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
- **Cero errores de rastreo:** Todo enlace interno debe ser una etiqueta `<a>` válida con un atributo `href`. No uses botones con eventos `on:click` para la navegación a menos que sea una interacción dentro del Dashboard.
- **Generative SEO (JSON-LD):** Cada ruta pública debe tener la capacidad de inyectar datos estructurados (Schema.org) en formato JSON-LD. Esto se gestionará dinámicamente desde los archivos `+page.server.ts` o extraídos del *Frontmatter* de los archivos `.mdx`.
- **Rendimiento:** Las imágenes en las rutas públicas deben usar formatos modernos (WebP/AVIF), incluir explícitamente atributos `width` y `height`, e implementar `loading="lazy"` y `decoding="async"` (excepto la imagen principal *Hero*, que debe tener `loading="eager"` o `fetchpriority="high"`).

### 3. Restricciones de Cloudflare
- El proyecto utiliza `@sveltejs/adapter-cloudflare`.
- **No uses APIs específicas de Node.js** (como `fs`, `path`, `crypto` nativo de node) en los archivos `+page.server.ts` que se ejecutarán en SSR, ya que fallarán en el entorno Edge de Cloudflare Workers. Usa las Web APIs estándar (Fetch, Crypto, URL, etc.).
- Las lecturas de archivos MDX se harán estrictamente en tiempo de compilación (Prerendering) utilizando las importaciones de Vite (`import.meta.glob`).

### 4. Flujo de Trabajo y Estilo
- **Idiomas:** El código fuente (variables, funciones, componentes) y la interfaz de usuario (UI) de la parte pública deben escribirse **únicamente en idioma inglés** por el momento. Los comentarios, la documentación y los commits pueden seguir escribiéndose en español.
- **Código conciso:** Evita reescribir funciones enteras si solo cambian dos líneas. Proporciona el fragmento modificado e indica dónde insertarlo.
- No inventes dependencias ni generes contenido de relleno ("Lorem Ipsum") a menos que se te solicite explícitamente para una maqueta.

### 5. Creación y Actualización de Contenido (Blog / SEO)
Al crear o actualizar contenido para posts del blog o páginas comerciales, se deben seguir estrictamente estas directrices para garantizar la máxima calidad y rendimiento en buscadores:

- **Evitar introducciones genéricas de IA**: No arranques con introducciones cliché o predecibles. Empezá siempre con un dato concreto, un error común del sector o un caso de estudio real.
- **Alineación con la intención de búsqueda (Search Intent)**: Estructurá el contenido respondiendo directamente a lo que busca el usuario (guías paso a paso, soluciones directas a problemas o comparativas).
- **Incorporar experiencia real (E-E-A-T)**: Incluí datos empíricos, capturas de pantalla o aprendizajes prácticos de proyectos reales.
- **Ángulo y enfoque único**: Diferenciá el contenido aportando metodologías propias, frameworks prácticos o ideas originales que no estén repetidas en otros sitios.
- **Control de densidad de palabras clave (Keyword Stuffing)**: Usá la palabra clave principal de forma orgánica solo unas pocas veces y priorizá variaciones naturales y sinónimos semánticos.
- **Optimización de enlaces internos (Internal Linking)**: Añadí entre 3 y 5 enlaces contextuales hacia otros contenidos relevantes y estructurá la web usando topic clusters (Hub & Spoke).
- **Formateo para legibilidad y retención**: Utilizá párrafos cortos, listas con viñetas y elementos visuales potentes para enganchar al usuario y mejorar la experiencia de lectura.

#### Los 5 Errores Críticos que Matan el Tráfico (y cómo resolverlos)
Para auditorías o actualizaciones, resolvé siempre estos problemas que frenan el posicionamiento:

1. **Estructuras de sitio rotas o planas (Broken/Flat Structures)**:
   - Reconstruí la navegación principal agrupando páginas lógicamente.
   - Añadí subcategorías basadas en búsquedas reales y tags.
   - Creá páginas de aterrizaje (landing pages) individuales para cada servicio o producto principal.
   - Implementá hilos de Ariadna (breadcrumbs) para guiar a usuarios y crawlers.
   - Mantené los enlaces del footer súper limpios y enfocados para evitar la dilución del rastreo (crawl dilution).

2. **Enlaces internos débiles y páginas huérfanas (Orphan Pages)**:
   - Mapeá todas las URLs para encontrar páginas con cero enlaces entrantes.
   - Enlazá desde posts de alto tráfico hacia las páginas comerciales que necesitás posicionar.
   - Colocá enlaces contextuales dentro de los párrafos, no solo en menús o footers.
   - Fusioná (merge) páginas duplicadas o muy similares para concentrar la autoridad del enlace (link equity).
   - Usá textos de anclaje (anchor texts) descriptivos e incorporá palabras clave de forma 100% natural.

3. **Páginas delgadas o de baja calidad (Thin/Spammy Content)**:
   - Añadí tablas, especificaciones de producto, guías paso a paso o comparativas usando campos personalizados.
   - Reemplazá resúmenes cortos por explicaciones detalladas que respondan a dudas reales del comprador.
   - Incorporá preguntas frecuentes (FAQs), llamadas a la acción (CTAs) claras y elementos visuales (iconos, tablas).
   - Eliminá (prune) o actualizá textos viejos o generados por IA que no aporten valor real.
   - Programá auditorías trimestrales para repasar y mantener al día las publicaciones antiguas.

4. **Metadatos y Sitemap Imprecisos**:
   - Reescribí las meta etiquetas title para que coincidan con la intención de búsqueda y aumenten el CTR.
   - Agrupá los posts en categorías claras y reflejalas con precisión en el sitemap.
   - Usá un sitemap dinámico que se actualice automáticamente con cada nueva página.
   - Enviá el sitemap a Google Search Console (GSC) y validalo en el archivo `robots.txt`.
   - Eliminá URLs rotas (404) o inútiles que malgastan el presupuesto de rastreo (crawl budget).

5. **Páginas y señales de E-E-A-T que generan confianza real**:
   - Diseñá una sección "Sobre Nosotros" (About) detallada que cuente la historia real de la marca.
   - Creá una página dedicada a opiniones de clientes con testimonios reales y contenido generado por usuarios (UGC).
   - Enlazá de manera externa a fuentes autorizadas y de alta confianza en el sector.
   - Incluí siempre la autoría (autor calificado) y fechas de publicación o última actualización en los artículos.
   - Asegurá perfiles de marca activos en redes sociales y vinculalos desde el sitio web.

*Nota: Pequeñas mejoras aplicadas a contenidos generados previamente por IA pueden disparar drásticamente el posicionamiento y el tráfico orgánico.*