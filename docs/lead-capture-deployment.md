# Lead Capture — Guía de provisioning y deploy

Pasos manuales para poner en producción el sistema de captura de leads
(`package-lead-capture-cro`): formulario en páginas de paquete → D1 → emails Resend
→ secuencia de reseñas vía Worker de cron.

Estos pasos NO los puede hacer el código: requieren crear recursos en tu cuenta de
Cloudflare y Resend, y cargar secrets. Hacelos en orden.

> Prerrequisito: estar logueado en Cloudflare → `bunx wrangler login`.

---

## 1. Crear la base de datos D1

```bash
bunx wrangler d1 create meg-leads
```

El comando imprime un bloque con el `database_id`. Copialo y pegalo en **DOS** archivos
(ambos apuntan a la misma base `meg-leads`):

1. `wrangler.toml` (app principal):
   ```toml
   [[d1_databases]]
   binding = "DB"
   database_name = "meg-leads"
   database_id = "PEGAR_AQUI_EL_ID_REAL"   # ← reemplaza YOUR_D1_DATABASE_ID_HERE
   ```

2. `workers/review-reminders/wrangler.toml` (Worker de cron):
   ```toml
   [[d1_databases]]
   binding = "DB"
   database_name = "meg-leads"
   database_id = "PEGAR_AQUI_EL_ID_REAL"   # ← reemplaza <placeholder-replace-with-real-database-id>
   ```

---

## 2. Aplicar las migraciones (esquema de tablas)

Crea las 5 tablas normalizadas (`leads`, `lead_events`, `email_messages`,
`review_requests`, `recipients`) definidas en [`migrations/0001_init.sql`](../migrations/0001_init.sql).

```bash
# Local (SQLite en .wrangler/state — para desarrollo/tests)
bunx wrangler d1 migrations apply meg-leads --local

# Producción (la D1 remota)
bunx wrangler d1 migrations apply meg-leads --remote
```

Verificación rápida:

```bash
bunx wrangler d1 execute meg-leads --remote --command "SELECT name FROM sqlite_master WHERE type='table';"
```

---

## 3. Resend (envío de correos)

1. Crear cuenta en https://resend.com y **verificar el dominio** `malagaeventgear.com`
   (Resend → Domains → Add Domain → cargar los registros DNS SPF/DKIM en Cloudflare DNS).
   Hasta que el dominio esté `verified`, los envíos desde `@malagaeventgear.com` fallan.
2. Crear una **API key** (Resend → API Keys) → la usás como `RESEND_API_KEY`.
3. Definir el remitente (`RESEND_FROM`), p. ej. `MEG <noreply@malagaeventgear.com>`.
   - App principal: el valor de `RESEND_FROM` se carga como secret (ver §4).
   - Worker: ya está como var en `workers/review-reminders/wrangler.toml`
     (`MEG <noreply@malagaeventgear.com>`) — ajustalo si querés otro.

---

## 4. Cargar variables y secrets

### Variables públicas (NO sensibles) — ya en `wrangler.toml`, editá los valores
- `LEAD_NOTIFY_EMAILS` — fallback de destinatarios internos, separados por coma
  (p. ej. `"hola@malagaeventgear.com,ventas@malagaeventgear.com"`).
  Se usa SOLO si no hay filas activas en la tabla `recipients` (D1 tiene prioridad).
- `PUBLIC_SITE_URL` — ya `https://malagaeventgear.com`.
- `PUBLIC_TURNSTILE_SITE_KEY` — site key del widget Turnstile (ver §5).

### Secrets (sensibles) — cargados por CLI, NUNCA commiteados

App principal:
```bash
bunx wrangler secret put RESEND_API_KEY
bunx wrangler secret put RESEND_FROM
bunx wrangler secret put TURNSTILE_SECRET_KEY
```

Worker de cron (mismo `RESEND_API_KEY`, nombre del worker explícito):
```bash
bunx wrangler secret put RESEND_API_KEY --name meg-review-reminders
```

### Desarrollo local — `.dev.vars` (gitignored, en la raíz)
```
RESEND_API_KEY=re_...
RESEND_FROM=Malaga Event Gear <hola@malagaeventgear.com>
TURNSTILE_SECRET_KEY=1x0000000000000000000000000000000AA
PUBLIC_TURNSTILE_SITE_KEY=1x00000000000000000000AA
```
> Las claves `1x...` son las de **test always-pass** de Cloudflare Turnstile (dev).
> Si `TURNSTILE_SECRET_KEY` no está seteada, el endpoint OMITE la verificación (modo dev).
> En producción, con el secret presente, la verificación se ENFUERZA (fail-closed).

---

## 5. Cloudflare Turnstile (anti-spam, invisible/managed)

1. Cloudflare Dashboard → Turnstile → Add Site → dominio `malagaeventgear.com`,
   modo **Managed** (invisible salvo sospecha).
2. Copiar:
   - **Site Key** → `PUBLIC_TURNSTILE_SITE_KEY` (var pública en `wrangler.toml` + `.dev.vars`).
   - **Secret Key** → `TURNSTILE_SECRET_KEY` (secret, §4).
3. El widget se monta solo si `PUBLIC_TURNSTILE_SITE_KEY` está presente; el servidor
   valida contra `https://challenges.cloudflare.com/turnstile/v0/siteverify`.

---

## 6. Destinatarios internos (opcional, recomendado)

Sistema híbrido: **D1 tiene prioridad**, con fallback a `LEAD_NOTIFY_EMAILS`.
Para definir destinatarios por D1 (incluso por paquete):

```bash
# Destinatario global (aplica a todos los paquetes: package_id = NULL)
bunx wrangler d1 execute meg-leads --remote --command \
  "INSERT INTO recipients (id, email, label, package_id, active) VALUES (lower(hex(randomblob(16))), 'ventas@malagaeventgear.com', 'Ventas', NULL, 1);"
```

> Nota: la columna `recipients.package_id` almacena el **slug** del paquete
> (p. ej. `wedding`), no un ID numérico. Dejala en `NULL` para destinatarios globales.

---

## 7. Deploy

```bash
# App principal (SvelteKit → Cloudflare)
bun run build
bunx wrangler deploy

# Worker de cron (deploy independiente, segundo target)
cd workers/review-reminders
bunx wrangler deploy
```

> El cron es un Worker SEPARADO porque `adapter-cloudflare` no expone handler
> `scheduled` en el `_worker.js` generado. Comparte código (`src/lib/server/**`) y
> la misma base D1, pero se despliega aparte. Corre diariamente a las 10:00 UTC.

---

## 8. Verificación post-deploy (smoke test)

1. Abrir una página de paquete (p. ej. `/packages/wedding/`), completar el formulario, enviar.
2. Confirmar redirección a `/thank-you/?lead=...`.
3. Verificar la fila en D1:
   ```bash
   bunx wrangler d1 execute meg-leads --remote --command "SELECT id, name, email, package_slug, created_at FROM leads ORDER BY created_at DESC LIMIT 1;"
   ```
4. Confirmar 2 correos: confirmación al lead + notificación interna.
5. Revisar `email_messages` y `lead_events` para el `lead_id`.
6. Secuencia de reseñas: se agenda automáticamente para el día siguiente al `event_date`.
   El clic en `/r/[token]` marca `clicked` y detiene los recordatorios (máx 3, un día de por medio).

---

## Referencia de archivos

| Pieza | Ruta |
|-------|------|
| Esquema D1 | [`migrations/0001_init.sql`](../migrations/0001_init.sql) |
| Endpoint del formulario | [`src/routes/api/leads/+server.ts`](../src/routes/api/leads/+server.ts) |
| Lógica de servidor | [`src/lib/server/`](../src/lib/server/) |
| Formulario | [`src/lib/components/forms/LeadForm.svelte`](../src/lib/components/forms/LeadForm.svelte) |
| Thank-you | [`src/routes/(public)/thank-you/+page.svelte`](../src/routes/(public)/thank-you/+page.svelte) |
| Redirect trackeado | [`src/routes/r/[token]/+server.ts`](../src/routes/r/[token]/+server.ts) |
| Worker de cron | [`workers/review-reminders/`](../workers/review-reminders/) |
| Config principal | [`wrangler.toml`](../wrangler.toml) |

## Comandos de test

```bash
bun run test                  # Vitest (unit + integración server-lib) — 62 tests
bunx playwright test tests/e2e/   # E2E — 14 tests
bun run check                 # type-check (ignorar errores de .svelte-kit/output generado)
```
