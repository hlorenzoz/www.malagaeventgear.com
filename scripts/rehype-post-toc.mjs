/**
 * rehype-post-toc — build-time rehype plugin.
 *
 * Two responsibilities:
 * 1. REMOVE the inline `## Table of Contents` section (the old WP-generated ToC
 *    including its list items).
 * 2. INJECT a mobile ToC (static HTML, class `toc-mobile lg:hidden`) immediately
 *    after the "Key Highlights" h2 section content — so mobile readers get the ToC
 *    in the right place without a sticky sidebar.
 *
 * Must run AFTER rehypeSlug (ids already set) and rehypeBlogImages.
 * Must run BEFORE rehypeFaqAccordion (FAQ h3s need to remain as h3 for detection).
 *
 * The mobile ToC HTML is built from h2+h3 elements found in the document at plugin
 * execution time. The plugin reads heading ids set by rehype-slug so ids are reliable.
 *
 * "Table of Contents" h2 is excluded from the mobile ToC (consistent with toc-parser.mjs).
 */
import { visit } from 'unist-util-visit';

/**
 * Returns plain text content of a hast node.
 * @param {import('hast').Node} node
 * @returns {string}
 */
function textContent(node) {
	if (!node) return '';
	if (node.type === 'text') return node.value ?? '';
	if (node.children) return node.children.map(textContent).join('');
	return '';
}

export function rehypePostToc() {
	return (tree) => {
		const children = tree.children;
		if (!children || !Array.isArray(children)) return;

		// ── Step 1: Remove the old "## Table of Contents" section ────────────────
		// Find the h2 whose text is "Table of Contents" (case-insensitive)
		let tocH2Index = -1;
		for (let i = 0; i < children.length; i++) {
			const node = children[i];
			if (
				node.type === 'element' &&
				node.tagName === 'h2' &&
				/^table of contents$/i.test(textContent(node).trim())
			) {
				tocH2Index = i;
				break;
			}
		}

		if (tocH2Index !== -1) {
			// Find end: next h2 or end of document
			let tocEndIndex = children.length;
			for (let i = tocH2Index + 1; i < children.length; i++) {
				const node = children[i];
				if (node.type === 'element' && node.tagName === 'h2') {
					tocEndIndex = i;
					break;
				}
			}
			// Remove the ToC section (h2 + all content until next h2)
			children.splice(tocH2Index, tocEndIndex - tocH2Index);
		}

		// ── Step 2: Remove the empty "## Testimonials" section ───────────────────
		// This is a reliable marker in guide posts — the actual Testimonials are
		// rendered as a Svelte component at the end of the page layout.
		let testimonialsH2Index = -1;
		for (let i = 0; i < children.length; i++) {
			const node = children[i];
			if (
				node.type === 'element' &&
				node.tagName === 'h2' &&
				/^testimonials?$/i.test(textContent(node).trim())
			) {
				testimonialsH2Index = i;
				break;
			}
		}

		if (testimonialsH2Index !== -1) {
			// Find end: next h2 or end of document
			let testimonialsEndIndex = children.length;
			for (let i = testimonialsH2Index + 1; i < children.length; i++) {
				const node = children[i];
				if (node.type === 'element' && node.tagName === 'h2') {
					testimonialsEndIndex = i;
					break;
				}
			}
			// Only remove if the section is empty (no meaningful content between h2 and next h2)
			const sectionContent = children.slice(testimonialsH2Index + 1, testimonialsEndIndex);
			const hasContent = sectionContent.some(
				(n) =>
					(n.type === 'element' && n.tagName !== 'hr') ||
					(n.type === 'text' && n.value?.trim())
			);
			if (!hasContent) {
				children.splice(testimonialsH2Index, testimonialsEndIndex - testimonialsH2Index);
			}
		}

		// ── Step 3: Collect all h2+h3 headings for the mobile ToC ────────────────
		/** @type {{ id: string; text: string; level: 2 | 3 }[]} */
		const tocEntries = [];
		visit(tree, 'element', (node) => {
			if (node.tagName !== 'h2' && node.tagName !== 'h3') return;
			const text = textContent(node).trim();
			// Exclude "Table of Contents" (already removed but just in case)
			if (/^table of contents$/i.test(text)) return;
			const id = node.properties?.id;
			if (!id || typeof id !== 'string') return;
			tocEntries.push({ id, text, level: node.tagName === 'h2' ? 2 : 3 });
		});

		if (tocEntries.length === 0) return;

		// ── Step 4: Build the mobile ToC as hast nodes ────────────────────────────
		const listItems = tocEntries.map(({ id, text, level }) => ({
			type: 'element',
			tagName: 'li',
			properties: { className: level === 3 ? ['toc-mobile-item', 'toc-mobile-item--h3'] : ['toc-mobile-item'] },
			children: [
				{
					type: 'element',
					tagName: 'a',
					properties: { href: `#${id}`, className: ['toc-mobile-link'] },
					children: [{ type: 'text', value: text }]
				}
			]
		}));

		const mobileTocNode = {
			type: 'element',
			tagName: 'nav',
			properties: {
				className: ['toc-mobile', 'lg:hidden'],
				'aria-label': 'Table of contents'
			},
			children: [
				{
					type: 'element',
					tagName: 'p',
					properties: { className: ['toc-mobile-title'] },
					children: [{ type: 'text', value: 'In this article' }]
				},
				{
					type: 'element',
					tagName: 'ol',
					properties: { className: ['toc-mobile-list'] },
					children: listItems
				}
			]
		};

		// ── Step 5: Find Key Highlights section end and inject mobile ToC after it ─
		let keyHighlightsH2Index = -1;
		for (let i = 0; i < children.length; i++) {
			const node = children[i];
			if (
				node.type === 'element' &&
				node.tagName === 'h2' &&
				/^key highlights?$/i.test(textContent(node).trim())
			) {
				keyHighlightsH2Index = i;
				break;
			}
		}

		if (keyHighlightsH2Index !== -1) {
			// Find the end of the Key Highlights section (next h2)
			let keyHighlightsEndIndex = children.length;
			for (let i = keyHighlightsH2Index + 1; i < children.length; i++) {
				const node = children[i];
				if (node.type === 'element' && node.tagName === 'h2') {
					keyHighlightsEndIndex = i;
					break;
				}
			}
			// Inject mobile ToC after the Key Highlights section (before next h2)
			children.splice(keyHighlightsEndIndex, 0, mobileTocNode);
		} else {
			// Fallback: inject after first h2 if no Key Highlights section exists
			const firstH2Index = children.findIndex(
				(n) => n.type === 'element' && n.tagName === 'h2'
			);
			if (firstH2Index !== -1) {
				// Find end of first h2 section
				let firstSectionEnd = children.length;
				for (let i = firstH2Index + 1; i < children.length; i++) {
					if (children[i].type === 'element' && children[i].tagName === 'h2') {
						firstSectionEnd = i;
						break;
					}
				}
				children.splice(firstSectionEnd, 0, mobileTocNode);
			}
		}
	};
}
