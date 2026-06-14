// @ts-nocheck
/**
 * Vite plugin: exposes blog post frontmatter as the virtual module `virtual:blog-meta`.
 *
 * WHY: blog.ts needs every post's frontmatter SYNCHRONOUSLY at module-eval time to
 * build listing pages. The previous approach used an eager `import.meta.glob(..., {
 * import: 'metadata' })`, which statically imports each compiled .svx — defeating the
 * sibling lazy glob meant to code-split post bodies per route. The result was a single
 * ~3.4 MB chunk (all post bodies) loaded even on pages that only need frontmatter.
 *
 * This plugin parses the YAML frontmatter directly from the raw .svx files (build-time,
 * Node context) with gray-matter — the SAME js-yaml mdsvex uses, so the emitted metadata
 * is identical (dates serialize to the same ISO strings). The .svx modules are then ONLY
 * referenced by the lazy component glob, restoring genuine per-post code-splitting.
 *
 * The map is computed fresh on every build/dev start (and invalidated when a .svx changes
 * in dev), so it can never go stale — no committed JSON, no prebuild step.
 */
import { readFileSync, readdirSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import matter from 'gray-matter';

const VIRTUAL_ID = 'virtual:blog-meta';
const RESOLVED_ID = '\0' + VIRTUAL_ID;

const BLOG_DIR = resolve(dirname(fileURLToPath(import.meta.url)), '../src/content/blog');

/**
 * Reads every .svx in the blog content dir and returns the shape buildPostsFromGlob
 * expects: Record<path, { metadata }>. The path only needs to end with `<file>.svx`
 * (the pipeline derives the slug from the last path segment).
 */
function buildMetaMap() {
	const files = readdirSync(BLOG_DIR).filter((f) => f.endsWith('.svx'));
	/** @type {Record<string, { metadata: unknown }>} */
	const map = {};
	for (const file of files) {
		const raw = readFileSync(resolve(BLOG_DIR, file), 'utf-8');
		const { data } = matter(raw);
		map[`../../content/blog/${file}`] = { metadata: data };
	}
	return map;
}

/** @returns {import('vite').Plugin} */
export function blogMeta() {
	return {
		name: 'blog-meta-virtual',
		resolveId(id) {
			if (id === VIRTUAL_ID) return RESOLVED_ID;
		},
		load(id) {
			if (id === RESOLVED_ID) {
				// JSON.stringify serializes YAML Date values to ISO strings — matching
				// mdsvex's own output, which the Zod schema already accepts.
				return `export default ${JSON.stringify(buildMetaMap())};`;
			}
		},
		configureServer(server) {
			// Invalidate the virtual module and reload when posts are added/edited/removed.
			server.watcher.add(BLOG_DIR);
			const onChange = (file) => {
				if (!file.endsWith('.svx')) return;
				const mod = server.moduleGraph.getModuleById(RESOLVED_ID);
				if (mod) server.moduleGraph.invalidateModule(mod);
				server.ws.send({ type: 'full-reload' });
			};
			server.watcher.on('add', onChange);
			server.watcher.on('change', onChange);
			server.watcher.on('unlink', onChange);
		},
	};
}
