#!/usr/bin/env bun
/**
 * Generates src/lib/data/post-faqs.json — a map of
 *   { [slug]: [{ question, answer }] }
 *
 * For each src/content/blog/*.svx, the FAQ section is parsed from the raw body
 * (markdown after frontmatter) using the shared faq-parser.mjs.
 * Posts with no FAQ section are omitted from the output.
 *
 * Run after adding or editing posts:
 *   bun scripts/gen-post-faqs.ts
 *
 * The output is committed — it is read at build time by blog.ts (no Node built-ins
 * in the browser/edge bundle).
 */
import { readFileSync, writeFileSync, readdirSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';
import { parseFaqs } from './faq-parser.mjs';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const BLOG_DIR = resolve(ROOT, 'src/content/blog');
const OUT = resolve(ROOT, 'src/lib/data/post-faqs.json');

const files = readdirSync(BLOG_DIR).filter((f) => f.endsWith('.svx'));

const result: Record<string, { question: string; answer: string }[]> = {};

for (const file of files) {
	const slug = file.replace(/\.svx$/, '');
	const raw = readFileSync(resolve(BLOG_DIR, file), 'utf8');

	// Strip frontmatter (between first --- and second ---)
	const body = raw.replace(/^---[\s\S]+?---\n?/, '');

	const faqs = parseFaqs(body);
	if (faqs.length > 0) {
		result[slug] = faqs;
	}
}

writeFileSync(OUT, JSON.stringify(result, null, 2) + '\n', 'utf8');
console.log(`✓ Wrote ${Object.keys(result).length} posts with FAQs to ${OUT}`);
