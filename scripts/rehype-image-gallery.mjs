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

/** Recursively extract the trimmed text content of a hast node. */
function toText(node) {
	if (!node) return '';
	if (node.type === 'text') return node.value ?? '';
	return (node.children ?? []).map(toText).join('');
}

/**
 * Returns true if the node is a `<p>` containing exactly one `<img>`.
 * @param {import('hast').Node} node
 * @returns {boolean}
 */
function hasImgChild(node) {
	return (node.children ?? []).some((c) => c.type === 'element' && c.tagName === 'img');
}

function isStandaloneImage(node) {
	if (node.type !== 'element') return false;
	// <figure> produced by rehype-blog-images for captioned images (img + figcaption)
	if (node.tagName === 'figure') return hasImgChild(node);
	// <p> containing exactly one <img> (uncaptioned standalone image)
	if (node.tagName === 'p') {
		const meaningful = (node.children ?? []).filter(
			(c) => !(c.type === 'text' && !c.value?.trim())
		);
		return (
			meaningful.length === 1 &&
			meaningful[0].type === 'element' &&
			meaningful[0].tagName === 'img'
		);
	}
	return false;
}

export function rehypeImageGallery() {
	return (tree) => {
		const children = tree.children;
		if (!children || !Array.isArray(children)) return;

		// Collect ALL standalone body images (top-level), even when scattered between
		// paragraphs/sections — guide posts place one image per section. We consolidate
		// them into a single swipeable carousel so the post reads as text + one gallery.
		const indices = [];
		for (let k = 0; k < children.length; k++) {
			if (isStandaloneImage(children[k])) indices.push(k);
		}

		// Need at least 2 images to make a gallery; a lone image stays inline.
		if (indices.length < 2) return;

		// Build one slide per image block. Captioned images are already
		// <figure><img><figcaption> — keep their children. Bare <p><img></p> unwrap to the <img>.
		const slides = indices.map((idx) => {
			const node = children[idx];
			const slideChildren =
				node.tagName === 'figure'
					? node.children ?? []
					: (node.children ?? []).filter((c) => c.type === 'element' && c.tagName === 'img');
			return {
				type: 'element',
				tagName: 'figure',
				properties: { className: ['img-gallery-item'] },
				children: slideChildren
			};
		});

		const galleryNode = {
			type: 'element',
			tagName: 'figure',
			properties: { className: ['img-gallery'] },
			children: slides
		};

		// Caption texts now shown inside the carousel (figcaption). The migrated WP body
		// often ALSO repeats each caption as a plain paragraph — collect those to dedupe.
		const captionTexts = new Set();
		for (const slide of slides) {
			for (const c of slide.children) {
				if (c.type === 'element' && c.tagName === 'figcaption') {
					captionTexts.add(toText(c).trim());
				}
			}
		}

		// Remove the original image blocks (reverse order to keep indices valid),
		// then insert the consolidated gallery at the position of the first image.
		const firstIdx = indices[0];
		for (let k = indices.length - 1; k >= 0; k--) {
			children.splice(indices[k], 1);
		}
		children.splice(firstIdx, 0, galleryNode);

		// Drop any remaining top-level <p> that merely duplicates a carousel caption.
		if (captionTexts.size > 0) {
			for (let k = children.length - 1; k >= 0; k--) {
				const c = children[k];
				if (c.type === 'element' && c.tagName === 'p' && captionTexts.has(toText(c).trim())) {
					children.splice(k, 1);
				}
			}
		}
	};
}
