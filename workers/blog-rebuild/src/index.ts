/**
 * Cloudflare Worker — Blog Rebuild Cron
 *
 * Trigger: daily cron at 06:00 UTC (see wrangler.toml)
 *   06:00 UTC = 07:00 CET / 08:00 CEST — before business hours in Spain
 *
 * Flow:
 *   1. POST to DEPLOY_HOOK_URL (Cloudflare Pages deploy hook)
 *   2. If 2xx: log success — build is triggered, scheduled posts will appear
 *   3. If non-2xx: throw Error so the Worker platform records an invocation failure
 *
 * Deploy:
 *   cd workers/blog-rebuild && bunx wrangler deploy
 *
 * Secret setup (one-time):
 *   bunx wrangler secret put DEPLOY_HOOK_URL --name meg-blog-rebuild
 */

export interface Env {
	DEPLOY_HOOK_URL: string;
}

/**
 * Core logic — exported for unit testing without requiring the Workers runtime.
 *
 * Posts to the given URL and either logs success (2xx) or throws (non-2xx).
 * Uses only Web APIs (fetch, console) — no Node built-ins.
 */
export async function triggerDeploy(url: string): Promise<void> {
	const response = await fetch(url, { method: 'POST' });

	if (!response.ok) {
		const body = await response.text();
		console.error(`[blog-rebuild] deploy hook failed: ${response.status} ${response.statusText}`, body);
		throw new Error(`Deploy hook failed: ${response.status} ${response.statusText}`);
	}

	console.log('[blog-rebuild] deploy hook triggered:', response.status);
}

export default {
	async scheduled(_event: ScheduledEvent, env: Env, ctx: ExecutionContext): Promise<void> {
		ctx.waitUntil(triggerDeploy(env.DEPLOY_HOOK_URL));
	},
};
