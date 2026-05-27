import { translations } from './translations';

class I18nManager {
	// Active language state managed by Svelte 5 Runes
	lang = $state<'en' | 'es'>('en');

	constructor() {
		if (typeof window !== 'undefined') {
			try {
				const saved = localStorage.getItem('lang');
				if (saved === 'en' || saved === 'es') {
					this.lang = saved;
				} else {
					// Default to English as per project rules
					this.lang = 'en';
				}
			} catch (_) {}
		}
	}

	/**
	 * Set active language and persist in localStorage safely
	 */
	setLanguage(newLang: 'en' | 'es') {
		this.lang = newLang;
		if (typeof window !== 'undefined') {
			try {
				localStorage.setItem('lang', newLang);
			} catch (_) {}
		}
	}

	t(path: string): string {
		const keys = path.split('.');
		let current: unknown = translations[this.lang];
		
		for (const key of keys) {
			if (current && typeof current === 'object' && key in current) {
				current = (current as Record<string, unknown>)[key];
			} else {
				// Fallback to English dictionary on resolution failure
				let fallback: unknown = translations['en'];
				for (const fallbackKey of keys) {
					if (fallback && typeof fallback === 'object' && fallbackKey in fallback) {
						fallback = (fallback as Record<string, unknown>)[fallbackKey];
					} else {
						return path;
					}
				}
				return typeof fallback === 'string' ? fallback : path;
			}
		}
		return typeof current === 'string' ? current : path;
	}
}

export const i18n = new I18nManager();
