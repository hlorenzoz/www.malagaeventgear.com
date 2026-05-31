/**
 * Returns the D1Database from the Cloudflare platform binding.
 * Throws if not available (e.g. missing in local dev without wrangler).
 */
export function getDB(platform: App.Platform | undefined): D1Database {
	const db = platform?.env?.DB;
	if (!db) {
		throw new Error(
			'D1 database binding "DB" is not available. ' +
				'Run via `wrangler pages dev` or ensure [[d1_databases]] is configured in wrangler.toml.',
		);
	}
	return db;
}
