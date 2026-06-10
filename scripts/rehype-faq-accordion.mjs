/**
 * rehype-faq-accordion — build-time rehype plugin.
 *
 * Transforms the FAQ section of a blog post body from plain heading/paragraph
 * structure into a native <details>/<summary> accordion:
 *
 *   ## FAQs (h2)           →  <section class="faq-section" aria-label="Frequently asked questions">
 *   ### Question (h3)      →    <details class="faq-item">
 *   Answer paragraphs      →      <summary class="faq-q">Question</summary>
 *                          →      <div class="faq-answer">…answer nodes…</div>
 *                          →    </details>
 *                          →  </section>
 *
 * RULES:
 * - rehype-slug runs FIRST — heading ids are already set. We PRESERVE those ids
 *   on the <h2> and <h3> so ToC anchor links keep working.
 * - The first <details> gets the `open` attribute so the first answer is visible
 *   without interaction (good UX + no CLS).
 * - Native <details> = interactive without JS, keyboard-accessible, prerender-safe.
 * - Plugin is LAST in svelte.config.js rehypePlugins (after rehypeSlug, rehypeBlogImages).
 *
 * Semantics intentionally mirror faq-parser.mjs so head JSON-LD and body HTML
 * represent the same data.
 */
import { visit } from 'unist-util-visit';

/**
 * Returns the plain-text content of a hast node.
 * @param {import('hast').Node} node
 * @returns {string}
 */
function textContent(node) {
	if (!node) return '';
	if (node.type === 'text') return node.value ?? '';
	if (node.children) return node.children.map(textContent).join('');
	return '';
}

export function rehypeFaqAccordion() {
	return (tree) => {
		// Collect all top-level children with their indices
		const children = tree.children;
		if (!children || !Array.isArray(children)) return;

		// Find the h2 whose text is "FAQs" or "FAQ"
		let faqH2Index = -1;
		for (let i = 0; i < children.length; i++) {
			const node = children[i];
			if (
				node.type === 'element' &&
				node.tagName === 'h2' &&
				/^FAQs?$/i.test(textContent(node).trim())
			) {
				faqH2Index = i;
				break;
			}
		}
		if (faqH2Index === -1) return;

		// Find the end of the FAQ section (next h2 or end of document)
		let faqEndIndex = children.length;
		for (let i = faqH2Index + 1; i < children.length; i++) {
			const node = children[i];
			if (node.type === 'element' && node.tagName === 'h2') {
				faqEndIndex = i;
				break;
			}
		}

		const faqSectionNodes = children.slice(faqH2Index + 1, faqEndIndex);

		// Build <details> elements by grouping h3 + following siblings
		const detailsElements = [];
		let currentH3 = null;
		let currentAnswerNodes = [];
		let isFirst = true;

		function flushDetails() {
			if (!currentH3) return;
			const detailsProps = isFirst ? { open: true } : {};
			isFirst = false;
			detailsElements.push({
				type: 'element',
				tagName: 'details',
				properties: { ...detailsProps, className: ['faq-item'] },
				children: [
					{
						type: 'element',
						tagName: 'summary',
						properties: {
							className: ['faq-q'],
							id: currentH3.properties?.id
						},
						children: currentH3.children ?? []
					},
					{
						type: 'element',
						tagName: 'div',
						properties: { className: ['faq-answer'] },
						children: currentAnswerNodes
					}
				]
			});
		}

		for (const node of faqSectionNodes) {
			if (node.type === 'element' && node.tagName === 'h3') {
				flushDetails();
				currentH3 = node;
				currentAnswerNodes = [];
			} else if (currentH3) {
				currentAnswerNodes.push(node);
			}
		}
		flushDetails();

		if (detailsElements.length === 0) return;

		// Preserve the h2's id (set by rehype-slug) for ToC links
		const faqH2 = children[faqH2Index];
		const faqSectionEl = {
			type: 'element',
			tagName: 'section',
			properties: {
				className: ['faq-section'],
				'aria-label': 'Frequently asked questions'
			},
			children: [
				{
					type: 'element',
					tagName: 'h2',
					properties: {
						className: ['faq-title'],
						id: faqH2.properties?.id
					},
					children: faqH2.children ?? [{ type: 'text', value: 'FAQs' }]
				},
				...detailsElements
			]
		};

		// Replace the FAQ range with the new section element
		children.splice(faqH2Index, faqEndIndex - faqH2Index, faqSectionEl);
	};
}
