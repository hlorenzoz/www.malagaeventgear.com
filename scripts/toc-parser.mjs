/**
 * Shared ToC parser — pure function, no Node.js dependencies.
 *
 * Given a post's raw .svx body (markdown after frontmatter), finds all h2 and h3
 * headings and returns them as a flat array suitable for building a Table of Contents.
 *
 * The ids returned match what rehype-slug generates (github-slugger algorithm).
 * Headings with text "Table of Contents" (case-insensitive) are excluded because
 * that section is removed by rehype-post-toc.mjs at build time.
 *
 * FAQ question headings (h3 inside the ## FAQs section) ARE included so the ToC
 * can link to them — rehype-faq-accordion preserves the ids on <summary> elements.
 *
 * @param {string} body - Raw markdown body (after frontmatter, before mdsvex rendering).
 * @returns {{ id: string; text: string; level: 2 | 3 }[]}
 */

import GithubSlugger from 'github-slugger';

/**
 * @param {string} body
 * @returns {{ id: string; text: string; level: 2 | 3 }[]}
 */
export function parseToc(body) {
	if (!body || typeof body !== 'string') return [];

	const slugger = new GithubSlugger();
	const lines = body.split('\n');
	/** @type {{ id: string; text: string; level: 2 | 3 }[]} */
	const entries = [];

	for (const line of lines) {
		// h2: ## Heading text
		const h2Match = line.match(/^##\s+(.+)$/);
		if (h2Match) {
			const text = h2Match[1].trim();
			// Skip the old inline "Table of Contents" section
			if (/^table of contents$/i.test(text)) continue;
			const id = slugger.slug(text);
			entries.push({ id, text, level: 2 });
			continue;
		}

		// h3: ### Heading text
		const h3Match = line.match(/^###\s+(.+)$/);
		if (h3Match) {
			const text = h3Match[1].trim();
			const id = slugger.slug(text);
			entries.push({ id, text, level: 3 });
		}
	}

	return entries;
}
