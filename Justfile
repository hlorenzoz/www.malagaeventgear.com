# Málaga Event Gear (MEG) - comandos del proyecto

# Levanta el servidor de desarrollo de Vite con Bun
dev:
    bun run dev

# Compila el sitio para producción optimizado para Cloudflare Pages
build:
    bun run build

# Previsualiza localmente la compilación de producción simulando Cloudflare Edge
preview:
    bun run preview

# Realiza chequeos estáticos de tipos (TypeScript) y validación de componentes de Svelte
check:
    bun run check

# Genera los tipos automáticos de Cloudflare (D1, R2) a partir de wrangler.toml
gen:
    bun run gen

# Instala las dependencias del proyecto usando Bun
install:
    bun install

# Formatea todo el código fuente utilizando Prettier de forma consistente con bunx
format:
    bunx prettier --write .

# Ejecuta las pruebas de integración E2E con Playwright
playwright:
    bunx playwright test

# Compila y audita el rendimiento de todas las páginas con Lighthouse CI (.lighthouserc.json)
test-lighthouse: build
    bunx @lhci/cli autorun

