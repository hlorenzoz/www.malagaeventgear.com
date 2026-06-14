/**
 * Client-side loader for the Cloudflare Turnstile widget script.
 *
 * Registers a named global callback (Turnstile invokes it by name via the
 * widget's `data-callback` attribute) and injects the api.js script once.
 * The script tag is shared across widgets, so it is only added the first time.
 */
export function loadTurnstile(callbackName: string, onToken: (token: string) => void): void {
	(window as unknown as Record<string, unknown>)[callbackName] = (token: string) => onToken(token);

	if (!document.querySelector('script[data-turnstile]')) {
		const script = document.createElement('script');
		script.src = 'https://challenges.cloudflare.com/turnstile/v0/api.js';
		script.async = true;
		script.defer = true;
		script.setAttribute('data-turnstile', '1');
		document.head.appendChild(script);
	}
}
