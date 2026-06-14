/**
 * Ambient type for the `virtual:blog-meta` module provided by scripts/vite-blog-meta.mjs.
 * Maps each post's content path to its parsed frontmatter, in the shape
 * buildPostsFromGlob() expects.
 */
declare module 'virtual:blog-meta' {
	const blogMeta: Record<string, { metadata: unknown }>;
	export default blogMeta;
}
