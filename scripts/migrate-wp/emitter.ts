/**
 * SVX file emitter — writes src/content/blog/<slug>.svx from frontmatter + body.
 *
 * Overwrites on re-run (WP is the source of truth during migration).
 * SC-MIG-07: idempotent re-runs.
 */
import { writeFileSync, mkdirSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';
import type { PostFrontmatter } from './frontmatter';
import { buildFrontmatterYaml } from './frontmatter';

const __dirname = dirname(fileURLToPath(import.meta.url));
// Project root: scripts/migrate-wp/ → up 2 levels
const PROJECT_ROOT = resolve(__dirname, '..', '..');
const BLOG_CONTENT_DIR = resolve(PROJECT_ROOT, 'src', 'content', 'blog');

/**
 * Returns the absolute path for a blog post's .svx file.
 */
export function getSvxPath(slug: string): string {
	return resolve(BLOG_CONTENT_DIR, `${slug}.svx`);
}

/**
 * Assembles the full .svx file content from frontmatter + markdown body.
 */
export function assembleSvx(frontmatter: PostFrontmatter, markdownBody: string): string {
	const yaml = buildFrontmatterYaml(frontmatter);
	// yaml already ends with '---\n'; add blank line before body
	return `${yaml}\n${markdownBody.trim()}\n`;
}

/**
 * Writes a .svx file to src/content/blog/<slug>.svx.
 * Creates the directory if it doesn't exist.
 * Overwrites existing files (idempotent re-run behavior).
 *
 * @param slug - URL slug (also the filename base)
 * @param frontmatter - Parsed frontmatter object
 * @param markdownBody - Converted Markdown body content
 * @param dryRun - If true, log but do NOT write
 * @returns Absolute path to the written file
 */
export function emitSvx(
	slug: string,
	frontmatter: PostFrontmatter,
	markdownBody: string,
	dryRun: boolean
): string {
	const svxPath = getSvxPath(slug);
	const content = assembleSvx(frontmatter, markdownBody);

	if (dryRun) {
		console.log(`[emitter] DRY-RUN — would write: ${svxPath}`);
		return svxPath;
	}

	mkdirSync(BLOG_CONTENT_DIR, { recursive: true });
	writeFileSync(svxPath, content, 'utf-8');
	console.log(`[emitter] Written: ${svxPath}`);
	return svxPath;
}
