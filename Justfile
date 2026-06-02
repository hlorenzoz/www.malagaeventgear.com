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

# Ejecuta las pruebas unitarias / de integración con Vitest (lógica de servidor: leads, email, reviews)
test:
    bun run test

# Compila y audita el rendimiento de todas las páginas con Lighthouse CI (.lighthouserc.json)
test-lighthouse: build
	rm -rf .lighthouseci
	bunx @lhci/cli autorun

# ─── Captura de Leads: D1, secrets y deploy ───────────────────────────────────
# Requiere CLI autenticada en la cuenta dueña del sitio (cc26ab18…): `wrangler login`.
# Detalle completo del provisioning en docs/lead-capture-deployment.md

# Aplica las migraciones D1 a la base LOCAL (SQLite/miniflare, para desarrollo)
migrate-local:
    bunx wrangler d1 migrations apply meg-leads --local

# Aplica las migraciones D1 a la base REMOTA (producción) — usar tras cambiar el esquema
migrate:
    bunx wrangler d1 migrations apply meg-leads --remote

# Lista las tablas de la D1 remota (verificación rápida del esquema)
db-tables:
    bunx wrangler d1 execute meg-leads --remote --command "SELECT name FROM sqlite_master WHERE type='table' ORDER BY name;"

# Resuelve la ruta del archivo SQLite de la D1 LOCAL y la copia al portapapeles (para abrir en DB Browser / TablePlus)
db-open:
    @path=$(fd -HI -e sqlite . .wrangler/state/v3/d1/miniflare-D1DatabaseObject --exclude metadata.sqlite -a | head -1); \
    if [ -z "$path" ]; then echo "No se encontró la D1 local. Corré 'just migrate-local' y enviá un lead primero."; exit 1; fi; \
    printf '%s' "$path" | pbcopy; \
    echo "📋 Ruta copiada al portapapeles:"; echo "$path"

# Carga los secrets de la app principal (Resend + Turnstile) — pide cada valor de forma interactiva
secrets:
    bunx wrangler secret put RESEND_API_KEY
    bunx wrangler secret put RESEND_FROM
    bunx wrangler secret put TURNSTILE_SECRET_KEY

# Carga el secret del worker de recordatorios de reseña (mismo RESEND_API_KEY)
secrets-worker:
    bunx wrangler secret put RESEND_API_KEY --name meg-review-reminders

# Despliega la app principal a Cloudflare (normalmente lo hace la CI por git push)
deploy:
    bun run build
    bunx wrangler deploy

# Despliega el worker de cron de recordatorios de reseña (segundo target de deploy)
deploy-worker:
    cd workers/review-reminders && bunx wrangler deploy

