/**
 * rehype-image-gallery — build-time rehype plugin.
 *
 * Groups 2 or more consecutive standalone images (`<p><img …></p>` siblings at the
 * document root) into a `<figure class="img-gallery">` CSS scroll-snap carousel.
 * No JavaScript required — swipe on mobile, overflow-x scroll on desktop.
 *
 * - Preserves srcset/sizes/alt/width/height set by rehype-blog-images.
 * - Single images (`<p><img></p>`) that are not part of a group are left untouched.
 * - Must run AFTER rehype-blog-images (so srcset is already set).
 *
 * "Standalone image" definition:
 *   A <p> element that has exactly one child which is an <img> element.
 *   (Markdown paragraphs that only contain an image render as `<p><img></p>` in rehype.)
 */
import { visit } from 'unist-util-visit';

/**
 * Returns true if the node is a `<p>` containing exactly one `<img>`.
 * @param {import('hast').Node} node
 * @returns {boolean}
 */
function isStandaloneImage(node) {
	if (node.type !== 'element' || node.tagName !== 'p') return false;
	// Filter out whitespace text nodes
	const meaningful = (node.children ?? []).filter(
		(c) => !(c.type === 'text' && !c.value?.trim())
	);
	return meaningful.length === 1 && meaningful[0].type === 'element' && meaningful[0].tagName === 'img';
}

export function rehypeImageGallery() {
	return (tree) => {
		const children = tree.children;
		if (!children || !Array.isArray(children)) return;

		let i = 0;
		while (i < children.length) {
			// Find start of a run of standalone images
			if (!isStandaloneImage(children[i])) {
				i++;
				continue;
			}

			// Count the run
			let j = i;
			while (j < children.length && isStandaloneImage(children[j])) {
				j++;
			}
			const runLength = j - i;

			// Only wrap groups of 2+
			if (runLength < 2) {
				i++;
				continue;
			}

			// Extract the img nodes from each <p><img></p>
			const imgNodes = children.slice(i, j).map((pNode) => {
				// Unwrap: take the <img> from inside <p>
				const img = (pNode.children ?? []).find(
					(c) => c.type === 'element' && c.tagName === 'img'
				);
				// Wrap in <figure> for semantics (figcaption may be added by rehype-blog-images later)
				return {
					type: 'element',
					tagName: 'figure',
					properties: { className: ['img-gallery-item'] },
					children: img ? [img] : []
				};
			});

			// Build the gallery wrapper
			const galleryNode = {
				type: 'element',
				tagName: 'figure',
				properties: { className: ['img-gallery'] },
				children: imgNodes
			};

			// Replace the run with the gallery
			children.splice(i, runLength, galleryNode);
			// Advance past the inserted gallery node
			i++;
		}
	};
}
