/**
 * rehype-table-wrap — build-time rehype plugin.
 *
 * Wraps every `<table>` in `<div class="table-wrap">` so wide tables scroll
 * horizontally on narrow viewports instead of overflowing the layout.
 * The `.table-wrap` styles live in BlogPost.svelte (overflow-x: auto).
 *
 * Idempotent: a table already inside a `.table-wrap` is left untouched.
 */
import { visit } from 'unist-util-visit';

function isTableWrap(node) {
	if (node?.type !== 'element' || node.tagName !== 'div') return false;
	const cn = node.properties?.className;
	const classes = Array.isArray(cn) ? cn : typeof cn === 'string' ? cn.split(/\s+/) : [];
	return classes.includes('table-wrap');
}

export function rehypeTableWrap() {
	return (tree) => {
		visit(tree, 'element', (node, index, parent) => {
			if (node.tagName !== 'table') return;
			if (!parent || index == null) return;
			if (isTableWrap(parent)) return;

			parent.children[index] = {
				type: 'element',
				tagName: 'div',
				properties: { className: ['table-wrap'] },
				children: [node]
			};
		});
	};
}
