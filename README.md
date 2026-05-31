# Malaga Event Gear — Website

Sitio de [malagaeventgear.com](https://malagaeventgear.com/) construido con **SvelteKit 5**
(Svelte runes), **TypeScript**, **Tailwind v4** y desplegado sobre **Cloudflare**
(`@sveltejs/adapter-cloudflare`). Contenido del blog vía **MDsveX**.

> Contexto para el asistente de IA, reglas de desarrollo y arquitectura: ver
> [AGENTS.md](AGENTS.md). Conocimiento de negocio: `.agents/BUSINESS.md`. Diseño: `DESIGN.md`. SEO: `SEO.md`.

## Stack

- **Frontend/Fullstack:** SvelteKit (prerender para la web pública, endpoints dinámicos para APIs).
- **Base de datos:** Cloudflare D1 (SQLite) — captura de leads normalizada.
- **Email:** Resend (confirmación al lead + notificación interna + secuencia de reseñas).
- **Anti-spam:** Cloudflare Turnstile (managed/invisible).
- **Cron:** Worker de Cloudflare separado (`workers/review-reminders/`).
- **Gestor de paquetes:** bun.

## Desarrollo

```sh
bun install
bun run dev            # servidor de desarrollo (vite)
bun run check          # type-check (svelte-check + tsc)
bun run test           # Vitest (unit + integración server-lib)
bunx playwright test   # E2E (carpeta tests/)
```

## Build & deploy

```sh
bun run build          # build de producción (SvelteKit → Cloudflare)
bunx wrangler deploy   # deploy de la app principal
```

El Worker de cron de recordatorios de reseña se despliega aparte:

```sh
cd workers/review-reminders && bunx wrangler deploy
```

## Captura de Leads (formularios → CRM)

Las páginas de paquete (`/packages/[slug]/`) tienen un formulario de contacto orientado a
conversión (CRO) que persiste cada lead en **Cloudflare D1** (esquema normalizado, listo para
el CRM propio), dispara correos transaccionales vía **Resend** (confirmación al lead +
notificación a destinatarios internos), y agenda una secuencia de pedido de reseña de Google
post-evento (máx 3 envíos, un día de por medio, con corte automático al hacer clic en el link).

**Pasos de provisioning y deploy** (crear D1, pegar `database_id` en los 2 `wrangler.toml`,
migraciones, verificar dominio en Resend, cargar secrets de Turnstile/Resend, deploy de los
2 targets, y smoke test post-deploy con queries de verificación):

➡️ **[docs/lead-capture-deployment.md](docs/lead-capture-deployment.md)**

### Piezas clave

| Pieza | Ruta |
|-------|------|
| Esquema D1 | `migrations/0001_init.sql` |
| Endpoint del formulario | `src/routes/api/leads/+server.ts` (`prerender = false`) |
| Lógica de servidor | `src/lib/server/` (`db`, `leads`, `email/templates`, `reviews/sequence`) |
| Formulario / phone input | `src/lib/components/forms/{LeadForm,PhoneInput}.svelte` |
| Thank-you (tracking) | `src/routes/(public)/thank-you/+page.svelte` |
| Redirect trackeado de reseña | `src/routes/r/[token]/+server.ts` |
| Worker de cron | `workers/review-reminders/` |
