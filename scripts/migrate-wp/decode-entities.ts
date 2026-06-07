/**
 * HTML entity decoder for WP REST API field values.
 *
 * The WP REST API returns `rendered` fields with HTML entities unescaped only
 * for content.rendered (goes through turndown). Other fields like titles, category
 * names, excerpts, and author names arrive with entities intact.
 *
 * Examples from the live MEG site dry-run:
 *   "Corporate &amp; Enterprise"  → "Corporate & Enterprise"
 *   "it&#8217;s"                  → "it's"
 *   "Audio&nbsp;Visual"           → "Audio Visual"
 *
 * Approach: pure regex table for named entities (no DOM dependency, fully
 * testable, fast). Numeric entities (&#NNNN; and &#xHH;) handled via
 * String.fromCodePoint.
 *
 * Coverage: all entities observed in WP REST API output + common typographic ones.
 */

/** Named HTML entity → character map. */
const NAMED_ENTITIES: Record<string, string> = {
	// Core XML entities
	amp: '&',
	lt: '<',
	gt: '>',
	quot: '"',
	apos: "'",
	// Whitespace
	nbsp: ' ', // non-breaking space → regular space handled in normalisation step
	// Common typographic entities (WP uses these heavily)
	hellip: '…',
	ndash: '–',
	mdash: '—',
	rsquo: '’', // '
	lsquo: '‘', // '
	rdquo: '”', // "
	ldquo: '“', // "
	laquo: '«',
	raquo: '»',
	bull: '•',
	middot: '·',
	copy: '©',
	reg: '®',
	trade: '™',
	euro: '€',
	pound: '£',
	yen: '¥',
	cent: '¢',
	times: '×',
	divide: '÷',
	frac12: '½',
	frac14: '¼',
	frac34: '¾',
	// Accented characters commonly appearing in WP content
	aacute: 'á',
	eacute: 'é',
	iacute: 'í',
	oacute: 'ó',
	uacute: 'ú',
	Aacute: 'Á',
	Eacute: 'É',
	Iacute: 'Í',
	Oacute: 'Ó',
	Uacute: 'Ú',
	ntilde: 'ñ',
	Ntilde: 'Ñ',
	uuml: 'ü',
	Uuml: 'Ü',
	agrave: 'à',
	egrave: 'è',
	igrave: 'ì',
	ograve: 'ò',
	ugrave: 'ù',
	auml: 'ä',
	euml: 'ë',
	iuml: 'ï',
	ouml: 'ö',
	acirc: 'â',
	ecirc: 'ê',
	icirc: 'î',
	ocirc: 'ô',
	ucirc: 'û',
	// Punctuation
	iexcl: '¡',
	iquest: '¿',
	shy: '­', // soft hyphen
};

/**
 * Decodes HTML entities in a plain-text string (NOT full HTML).
 *
 * Handles:
 *   - Named entities:  &amp;  &lt;  &gt;  &quot;  &rsquo;  etc.
 *   - Decimal numeric: &#8217;  &#038;
 *   - Hex numeric:     &#x2019;  &#x26;
 *
 * Also normalises &nbsp; (U+00A0) to a regular space, since non-breaking
 * spaces in WP category names and titles cause slug/comparison issues.
 *
 * Pure function — no DOM, no I/O.
 */
export function decodeEntities(input: string): string {
	if (!input || !input.includes('&')) return input;

	return input
		// Hex numeric entities: &#xHH; or &#xHHHH;
		.replace(/&#x([0-9a-fA-F]+);/g, (_, hex) =>
			String.fromCodePoint(parseInt(hex, 16))
		)
		// Decimal numeric entities: &#NNNN;
		.replace(/&#(\d+);/g, (_, dec) =>
			String.fromCodePoint(parseInt(dec, 10))
		)
		// Named entities: &name;
		.replace(/&([a-zA-Z]+);/g, (match, name) =>
			NAMED_ENTITIES[name] ?? match
		)
		// Normalise non-breaking spaces to regular spaces (cosmetic, safe for slugs)
		.replace(/ /g, ' ');
}
