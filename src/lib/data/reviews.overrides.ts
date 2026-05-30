/**
 * Manual translation overrides for Google reviews.
 *
 * Google reviews arrive in their ORIGINAL language (Spanish, Chinese, English…).
 * The review body is always rendered as-is. This map is an OPTIONAL escape hatch:
 * if you want a localized (EN/ES) version of a specific review shown when the UI
 * language matches, add an entry keyed by the testimonial `id`.
 *
 * The loader in testimonials.ts merges these overrides onto the curated review data
 * by `id`, so translations live separately from the review content itself.
 */
import type { LocalizedText } from './testimonials';

export const reviewTranslationOverrides: Record<string, LocalizedText> = {
	// Example (commented): translate the Chinese review for EN/ES audiences.
	// 'ting-ting-yu': {
	// 	en: 'A professional team with fast, efficient solutions. Trustworthy among many partners — I recommend them endlessly to clients and friends. Thank you Sergio and team.',
	// 	es: 'Un equipo profesional con soluciones rápidas y eficientes. De confianza entre muchos socios — los recomiendo sin límite a clientes y amigos. Gracias Sergio y equipo.'
	// }
};
