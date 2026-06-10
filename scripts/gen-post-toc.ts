#!/usr/bin/env bun
/**
 * Generates src/lib/data/post-toc.json — a map of
 *   { [slug]: [{ id, text, level }] }
 *
 * For each src/content/blog/*.svx, the h2+h3 headings are parsed from the raw body
 * (markdown after frontmatter) using the shared toc-parser.mjs.
 * The "Table of Contents" section is excluded.
 * FAQ question headings (h3) ARE included.
 *
 * Run after adding or editing posts:
 *   bun scripts/gen-post-toc.ts
 *
 * The output is committed — read at build time by blog.ts (no Node built-ins
 * in the browser/edge bundle).
 */
import { readFileSync, writeFileSync, readdirSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';
import { parseToc } from './toc-parser.mjs';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const BLOG_DIR = resolve(ROOT, 'src/content/blog');
const OUT = resolve(ROOT, 'src/lib/data/post-toc.json');

const files = readdirSync(BLOG_DIR).filter((f) => f.endsWith('.svx'));

const result: Record<string, { id: string; text: string; level: number }[]> = {};

for (const file of files) {
	const slug = file.replace(/\.svx$/, '');
	const raw = readFileSync(resolve(BLOG_DIR, file), 'utf8');

	// Strip frontmatter (between first --- and second ---)
	const body = raw.replace(/^---[\s\S]+?---\n?/, '');

	const toc = parseToc(body);
	if (toc.length > 0) {
		result[slug] = toc;
	}
}

writeFileSync(OUT, JSON.stringify(result, null, 2) + '\n', 'utf8');
console.log(`✓ Wrote ToC for ${Object.keys(result).length} posts to ${OUT}`);
