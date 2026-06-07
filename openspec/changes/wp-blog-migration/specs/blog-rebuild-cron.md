# Spec: blog-rebuild-cron

## Capability

A Cloudflare Worker cron job that triggers a daily Cloudflare Pages deploy hook, causing a fresh build of the site. This is the mechanism by which posts with `publishDate` set in the future become visible once their date passes — no CMS dashboard required.

---

## Delta: What MUST Be True After This Change

### 1. Worker Location and Structure

- The worker MUST live at `workers/blog-rebuild/` following the exact structure of `workers/review-reminders/`:
  - `workers/blog-rebuild/src/index.ts` — worker entrypoint.
  - `workers/blog-rebuild/wrangler.toml` — worker config.
  - `workers/blog-rebuild/tsconfig.json` — TypeScript config (same path aliases as `review-reminders`).

### 2. Worker Behavior

The worker MUST implement a single `scheduled` handler. It MUST NOT implement `fetch`.

On invocation, the handler MUST:

1. Read `DEPLOY_HOOK_URL` from the worker environment (secret).
2. Send an HTTP `POST` request to `DEPLOY_HOOK_URL` with an empty body.
3. Check the response status:
   - If `2xx`: log a success message including the response status code.
   - If non-`2xx`: log an error message including the response status code and body text, then throw an `Error` so the Worker platform records a failure.
4. MUST NOT suppress errors silently — a failed POST MUST propagate as a Worker invocation failure (visible in Cloudflare dashboard).

The handler MUST use only Web APIs (`fetch`, `console`) — no Node.js built-ins.

### 3. `Env` Interface

The worker MUST define a TypeScript `Env` interface with:

```ts
interface Env {
  DEPLOY_HOOK_URL: string;
}
```

No other bindings (D1, KV, R2) are required.

### 4. Cron Schedule

- The cron MUST be configured to run **daily at 06:00 UTC** (`0 6 * * *`).
- The rationale: 06:00 UTC = 07:00 CET / 08:00 CEST — before typical business hours in Spain; scheduled posts with `publishDate = today` become visible at first build of the day.
- The cron expression MUST appear in `workers/blog-rebuild/wrangler.toml` under `[triggers] crons`.

### 5. `wrangler.toml` Configuration

```toml
name = "meg-blog-rebuild"
main = "src/index.ts"
compatibility_date = "2024-05-02"

[triggers]
crons = ["0 6 * * *"]

[vars]
# DEPLOY_HOOK_URL is a secret — set via: wrangler secret put DEPLOY_HOOK_URL --name meg-blog-rebuild
```

- `DEPLOY_HOOK_URL` MUST NOT be committed in plain text. The comment above documents the `wrangler secret put` command.
- No database bindings (D1) or storage bindings (R2, KV) are required.

### 6. `wrangler.toml` in Site Root

- The site root `wrangler.toml` MUST be updated to reference `workers/blog-rebuild/` (pattern: add an entry or check that the worker is deployable independently via its own `wrangler.toml`).
- The worker deploys independently of the main site — it is NOT bundled into the SvelteKit Cloudflare adapter output.

### 7. Idempotency

- Calling the deploy hook multiple times on the same day is harmless — each call triggers a build, which is stateless. The worker does not track whether a build was already triggered today.

---

## Acceptance Scenarios

### SC-CRON-01: Successful POST logs success

**Given** `DEPLOY_HOOK_URL` is set to a URL that returns HTTP 200  
**When** the `scheduled` handler is invoked  
**Then** a success message is logged to the console including the response status code  
**And** no error is thrown

---

### SC-CRON-02: Non-2xx response propagates as failure

**Given** `DEPLOY_HOOK_URL` is set to a URL that returns HTTP 500  
**When** the `scheduled` handler is invoked  
**Then** an `Error` is thrown  
**And** the error message includes the response status code

---

### SC-CRON-03: Missing `DEPLOY_HOOK_URL` causes failure at invocation

**Given** the `DEPLOY_HOOK_URL` secret has not been set  
**When** the `scheduled` handler is invoked  
**Then** a runtime error is thrown (fetch to `undefined` or empty string fails)  
**And** the Worker invocation is recorded as failed in the Cloudflare dashboard

---

### SC-CRON-04: Worker deploys without errors

**Given** `wrangler.toml` is correctly configured  
**When** `wrangler deploy --name meg-blog-rebuild` is run  
**Then** the command exits with status 0  
**And** the worker is registered with the cron trigger `0 6 * * *`

---

### SC-CRON-05: Worker does not respond to HTTP fetch requests

**Given** the worker is deployed  
**When** an HTTP GET request is made to the worker's URL  
**Then** the worker returns a 405 or falls through to the platform default (no `fetch` handler defined)

---

### SC-CRON-06: Daily build triggers scheduled post visibility

**Given** a post with `publishDate` = yesterday exists in `src/content/blog/`  
**And** the previous build was before `publishDate`  
**When** the cron fires at 06:00 UTC and triggers a Pages build  
**Then** after the build completes, the post appears on `/blog/` (Playwright E2E validates post count increased)

> Note: This is an integration scenario. In CI it is approximated by asserting that a post with `publishDate` equal to the current date appears after a fresh build.
