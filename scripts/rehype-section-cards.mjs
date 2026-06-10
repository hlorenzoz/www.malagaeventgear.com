/**
 * rehype-section-cards — build-time rehype plugin.
 *
 * Wraps the content of "Brief Overview" and "Key Highlights" h2 sections in
 * styled card elements (glassmorphism, electric-blue accent).
 *
 * The h2 heading is preserved inside the card for semantic correctness and ToC links.
 * "Key Highlights" gets an additional `section-card--highlights` modifier class.
 *
 * Must run AFTER rehypePostToc (which removes the old ToC and injects mobile ToC)
 * and BEFORE rehypeFaqAccordion (which restructures FAQ h3 nodes).
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

/** Sections to wrap in a card, with their card modifier classes */
const SECTION_CARDS = [
	{ pattern: /^brief overview$/i, modifiers: ['section-card'] },
	{
		pattern: /^key highlights?$/i,
		modifiers: ['section-card', 'section-card--highlights']
	}
];

export function rehypeSectionCards() {
	return (tree) => {
		const children = tree.children;
		if (!children || !Array.isArray(children)) return;

		for (const { pattern, modifiers } of SECTION_CARDS) {
			// Re-scan after each transformation (indices shift after splicing)
			let h2Index = -1;
			for (let i = 0; i < children.length; i++) {
				const node = children[i];
				if (
					node.type === 'element' &&
					node.tagName === 'h2' &&
					pattern.test(textContent(node).trim())
				) {
					h2Index = i;
					break;
				}
			}
			if (h2Index === -1) continue;

			// Find section end: next h2, nav.toc-mobile, or end of document
			let sectionEnd = children.length;
			for (let i = h2Index + 1; i < children.length; i++) {
				const node = children[i];
				if (node.type === 'element') {
					if (node.tagName === 'h2') {
						sectionEnd = i;
						break;
					}
					// Also stop at the injected mobile ToC (it follows Key Highlights)
					if (
						node.tagName === 'nav' &&
						Array.isArray(node.properties?.className) &&
						node.properties.className.includes('toc-mobile')
					) {
						sectionEnd = i;
						break;
					}
				}
			}

			// Collect section nodes (h2 + content, excluding the mobile ToC marker)
			const sectionNodes = children.slice(h2Index, sectionEnd);

			// Build the section card wrapper
			const cardNode = {
				type: 'element',
				tagName: 'div',
				properties: { className: modifiers },
				children: sectionNodes
			};

			// Replace the section nodes with the wrapped card
			children.splice(h2Index, sectionEnd - h2Index, cardNode);
		}
	};
}
