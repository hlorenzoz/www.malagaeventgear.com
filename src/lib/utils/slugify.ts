/**
 * Converts a display name (or any string) to a URL-safe slug.
 *
 * Rules (applied in order):
 * 1. Lowercase
 * 2. Normalize unicode (NFD decomposition → strip combining marks → ASCII)
 * 3. Replace any sequence of non-alphanumeric chars with a single '-'
 * 4. Trim leading/trailing '-'
 *
 * Examples:
 *   "Event Planning" → "event-planning"
 *   "María López"   → "maria-lopez"
 *   "A&B"           → "a-b"
 */
export function slugify(name: string): string {
	return name
		.toLowerCase()
		// NFD decomposition splits base chars from their diacritical marks (accents, tildes, etc.)
		.normalize('NFD')
		// Strip Unicode combining marks — Mn = Mark, Nonspacing (includes all accent/diacritic chars)
		.replace(/\p{Mn}/gu, '')
		// Replace any sequence of non-alphanumeric characters with a single hyphen
		.replace(/[^a-z0-9]+/g, '-')
		// Trim leading/trailing hyphens
		.replace(/^-+|-+$/g, '');
}
