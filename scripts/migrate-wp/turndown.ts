/**
 * HTML → Markdown converter for WP post content.
 *
 * Approach:
 *   - Uses `turndown` (battle-tested HTML→MD library)
 *   - In Bun/Node, turndown uses @mixmark-io/domino as its HTML parser fallback
 *     (it checks `typeof window` — no window in Node, so domino is always used)
 *   - Strips WordPress shortcodes (SC-MIG-12)
 *   - Demotes/removes a leading <h1> that duplicates the post title (S-01)
 *   - Uses `linkedom` ONLY for the h1 demote step (DOM manipulation),
 *     then passes the resulting HTML string to turndown (which uses domino).
 *
 * Spike findings (task 4.1):
 *   - turndown@7.x in Node/Bun: `root = typeof window !== 'undefined' ? window : {}`
 *     (line 445 in turndown.cjs.js), so root.DOMParser is always undefined in Node.
 *   - Fallback is @mixmark-io/domino which IS correct and preserves all attributes.
 *   - linkedom is used for DOM manipulation (h1 demote), domino is used by turndown.
 *   - Both are lightweight and Bun-compatible.
 *   - DO NOT use createRequire to load turndown — it breaks module cache sharing.
 *   - DO NOT try to patch globalThis.DOMParser — turndown ignores it in Node.
 */
import { parseHTML } from 'linkedom';
import TurndownService from 'turndown';

// ---------------------------------------------------------------------------
// Turndown service (singleton, uses domino internally in Node/Bun)
// ---------------------------------------------------------------------------

const td = new TurndownService({
	headingStyle: 'atx',
	bulletListMarker: '-',
	codeBlockStyle: 'fenced',
	hr: '---',
});

// Rule: clean wrapper for WP caption / block divs
td.addRule('wpCaption', {
	filter: (node) =>
		node.nodeName === 'DIV' &&
		typeof (node as Element).className === 'string' &&
		((node as Element).className.includes('wp-caption') ||
			(node as Element).className.includes('wp-block')),
	replacement: (content) => `\n\n${content.trim()}\n\n`,
});

// ---------------------------------------------------------------------------
// WP shortcode stripper
// ---------------------------------------------------------------------------

/**
 * Strips WordPress shortcode syntax that survives HTML rendering.
 * SC-MIG-12: output .svx body MUST NOT contain [shortcode] syntax.
 *
 * IMPORTANT: Markdown link/image syntax must NOT be stripped:
 *   [link text](url) and ![alt text](url) are NOT shortcodes.
 * Detection strategy: WP shortcodes start with a lowercase word with no
 * spaces at the start (e.g. [gallery ...], [caption ...]).
 * Markdown link text typically starts with arbitrary text.
 *
 * Safe heuristic: only strip [word ...] where word is a single contiguous
 * lowercase word (letters/hyphens/underscores only, no spaces), and the
 * bracket is NOT immediately followed by `(` (which would be a Markdown link).
 */
function stripShortcodes(text: string): string {
	// Paired shortcodes: [word attrs]...[/word] — never followed by (url)
	let result = text.replace(/\[[a-z][a-z0-9_-]*(?:\s[^\]]+)?\][\s\S]*?\[\/[a-z][a-z0-9_-]*\]/g, '');
	// Self-closing shortcodes: [word attrs] — NOT followed by (
	// The negative lookahead (?!\s*\() ensures we don't strip Markdown links
	result = result.replace(/\[[a-z][a-z0-9_-]*(?:\s[^\]]+)?\](?!\s*\()/g, '');
	// Clean up resulting blank lines
	result = result.replace(/^\s*\n/gm, '\n').replace(/\n{3,}/g, '\n\n');
	return result.trim();
}

// ---------------------------------------------------------------------------
// H1 demote (S-01)
// ---------------------------------------------------------------------------

/**
 * Parses the HTML with linkedom and removes a leading <h1> whose text content
 * matches the post title (case-insensitive, trimmed).
 *
 * Returns the modified HTML string (via linkedom's innerHTML serialization),
 * or the original string if no matching leading h1 is found.
 *
 * S-01: BlogPost.svelte renders the title as the canonical <h1>.
 * The migrated body must not duplicate it.
 */
export function demoteLeadingH1(html: string, postTitle: string): string {
	const { document } = parseHTML(`<html><body>${html}</body></html>`);
	const body = document.body as unknown as Element;
	if (!body) return html;

	const children = Array.from(body.childNodes as unknown as ArrayLike<ChildNode>);

	let firstElement: Element | null = null;
	let firstElementNode: ChildNode | null = null;
	for (const child of children) {
		if ((child as unknown as { nodeType: number }).nodeType === 1) {
			firstElement = child as unknown as Element;
			firstElementNode = child;
			break;
		}
	}

	if (!firstElement || firstElement.nodeName !== 'H1') {
		return html;
	}

	const h1Text = (firstElement.textContent ?? '').trim().toLowerCase();
	const titleText = postTitle.trim().toLowerCase();

	if (h1Text === titleText) {
		body.removeChild(firstElementNode!);
		return (body.innerHTML as string).trim();
	}

	return html;
}

// ---------------------------------------------------------------------------
// Main converter
// ---------------------------------------------------------------------------

/**
 * Converts WP HTML post content to Markdown.
 *
 * @param html - The `content.rendered` from the WP REST API response
 * @param postTitle - Used to detect and remove a duplicate leading h1 (S-01)
 * @returns Clean Markdown string, ready for .svx body
 */
export function htmlToMarkdown(html: string, postTitle: string): string {
	// 1. Remove leading h1 that duplicates the post title (S-01)
	const htmlNoDupH1 = demoteLeadingH1(html, postTitle);

	// 2. Convert HTML → Markdown via turndown (uses domino in Node/Bun)
	let markdown = td.turndown(htmlNoDupH1);

	// 3. Strip any remaining WP shortcodes (SC-MIG-12)
	markdown = stripShortcodes(markdown);

	// 4. Normalize excessive blank lines
	markdown = markdown.replace(/\n{3,}/g, '\n\n').trim();

	return markdown;
}
