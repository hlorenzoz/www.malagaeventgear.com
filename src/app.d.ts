// See https://svelte.dev/docs/kit/types#app.d.ts
// for information about these interfaces
declare global {
	namespace App {
		interface Platform {
			env: Env & {
				DB: D1Database;
				TURNSTILE_SECRET_KEY: string;
				RESEND_API_KEY: string;
				RESEND_FROM: string;
				LEAD_NOTIFY_EMAILS: string;
				PUBLIC_SITE_URL: string;
			};
			ctx: ExecutionContext;
			caches: CacheStorage;
			cf?: IncomingRequestCfProperties;
		}

		// interface Error {}
		// interface Locals {}
		// interface PageData {}
		// interface PageState {}
	}
}

export {};
