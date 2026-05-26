# Registro de Habilidades y Estándares del Proyecto (Skill Registry)

Este registro documenta las habilidades (skills) disponibles y las reglas de arquitectura y desarrollo que rigen el proyecto de **Malaga Event Gear**.

## Reglas Compactas del Proyecto

### Desarrollo en SvelteKit (Svelte 5)
- Escribir siempre el código en **inglés** (variables, funciones, componentes) y la documentación/UI pública en **español**.
- Usar `<script lang="ts">` en todos los componentes.
- Utilizar Runes de Svelte 5 (`$props()`, `$state()`, etc.) para reactividad moderna.
- Emplear **Form Actions** nativas de SvelteKit con mejora progresiva (`use:enhance`) para la manipulación de formularios.

### Arquitectura de SEO Técnico y Generativo
- Todo enlace interno debe usar la etiqueta `<a>` con un atributo `href` válido (no usar botones para navegación pública).
- Inyectar esquemas de datos estructurados de Schema.org en formato **JSON-LD** dinámicamente o leyéndolos desde el Frontmatter de archivos `.mdx`.
- Optimizar las imágenes públicas (formatos modernos WebP/AVIF con `width` y `height`). Cargar con `loading="lazy"` excepto las principales del Hero que usarán `loading="eager"` o `fetchpriority="high"`.

### Restricciones de Cloudflare Pages/Workers
- El proyecto compila para `@sveltejs/adapter-cloudflare`.
- Queda estrictamente prohibido el uso de librerías nativas de Node.js (ej. `fs`, `path`, `crypto` tradicional). Usar en su lugar **Web APIs estándar**.

---

## Habilidades de IA Disponibles

| Habilidad | Contexto de Aplicación | Descripción |
|-----------|------------------------|-------------|
| **modern-web-guidance** | Interfaces, scroll, LCP, PWA, SEO | Guías avanzadas de diseño moderno, optimización y estándares web actualizados. |
| **ui-ux-pro-max** | Componentes, UI, diseño | Patrones avanzados de diseño visual y sistemas de diseño para web premium. |
| **chrome-devtools** | Depuración, auditorías de red/performance | Automatización y depuración fina mediante las herramientas de desarrollo de Chrome. |
| **debug-optimize-lcp** | Optimización de Largest Contentful Paint | Identificación y solución de retrasos en la carga del contenido principal. |
| **webapp-testing** | Pruebas y validación E2E con Playwright | Interacción y verificación funcional sobre navegadores reales. |
