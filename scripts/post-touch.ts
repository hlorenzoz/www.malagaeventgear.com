#!/usr/bin/env bun
/**
 * post-touch.ts — Update the `updated` field in an existing .svx frontmatter
 *
 * Usage:
 *   bun scripts/post-touch.ts <slug>
 *   bun scripts/post-touch.ts mi-post-slug
 *
 * Sets (or inserts) the `updated: "YYYY-MM-DD"` field in the YAML frontmatter
 * of src/content/blog/<slug>.svx, reflecting today's date.
 *
 * Safe: only modifies the frontmatter block — body content is preserved exactly.
 */

import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

// ---------------------------------------------------------------------------
// Date helpers
// ---------------------------------------------------------------------------

function todayISO(): string {
	return new Date().toISOString().split('T')[0]; // YYYY-MM-DD
}

// ---------------------------------------------------------------------------
// Frontmatter manipulation
// ---------------------------------------------------------------------------

/**
 * Parses a .svx file and updates (or inserts) the `updated` YAML field.
 * Returns the modified file content.
 */
export function setUpdatedField(content: string, date: string): string {
	// .svx frontmatter is delimited by `---` at the start of the file
	const fmStart = content.indexOf('---');
	if (fmStart === -1) {
		throw new Error('No se encontró el bloque de frontmatter (falta el primer "---").');
	}

	const fmEnd = content.indexOf('---', fmStart + 3);
	if (fmEnd === -1) {
		throw new Error('Frontmatter mal formado: falta el cierre "---".');
	}

	const frontmatter = content.slice(fmStart + 3, fmEnd);
	const afterFrontmatter = content.slice(fmEnd + 3);

	// Replace existing `updated: "..."` line, or insert before closing `---`
	const updatedLine = `updated: "${date}"`;
	const updatedRegex = /^updated:.*$/m;

	let newFrontmatter: string;
	if (updatedRegex.test(frontmatter)) {
		// Replace existing updated field
		newFrontmatter = frontmatter.replace(updatedRegex, updatedLine);
	} else {
		// Insert `updated` after `publishDate` if present, otherwise before `draft`
		const publishDateRegex = /^(publishDate:.*)$/m;
		const draftRegex = /^(draft:.*)$/m;

		if (publishDateRegex.test(frontmatter)) {
			newFrontmatter = frontmatter.replace(
				publishDateRegex,
				`$1\n${updatedLine}`
			);
		} else if (draftRegex.test(frontmatter)) {
			newFrontmatter = frontmatter.replace(
				draftRegex,
				`${updatedLine}\n$1`
			);
		} else {
			// Append before end of frontmatter block
			newFrontmatter = frontmatter.trimEnd() + '\n' + updatedLine + '\n';
		}
	}

	return `---${newFrontmatter}---${afterFrontmatter}`;
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

function main(): void {
	const slug = process.argv[2];

	if (!slug) {
		console.error('[post-touch] ERROR: Slug requerido.');
		console.error('  Uso: bun scripts/post-touch.ts <slug>');
		console.error('  Ej:  bun scripts/post-touch.ts mi-primer-post');
		process.exit(1);
	}

	// Strip .svx extension if provided accidentally
	const cleanSlug = slug.replace(/\.svx$/, '');
	const filePath = join(process.cwd(), 'src', 'content', 'blog', `${cleanSlug}.svx`);

	if (!existsSync(filePath)) {
		console.error(`[post-touch] ERROR: No se encontró el archivo: ${filePath}`);
		process.exit(1);
	}

	const today = todayISO();
	const originalContent = readFileSync(filePath, 'utf8');

	let newContent: string;
	try {
		newContent = setUpdatedField(originalContent, today);
	} catch (err) {
		console.error(`[post-touch] ERROR al parsear frontmatter: ${(err as Error).message}`);
		process.exit(1);
	}

	if (newContent === originalContent) {
		console.log(`[post-touch] Sin cambios — updated ya era "${today}": ${filePath}`);
		return;
	}

	writeFileSync(filePath, newContent, 'utf8');
	console.log(`[post-touch] updated: "${today}" → ${filePath}`);
}

// Guard: only run main() when executed directly (not when imported by tests)
if (import.meta.main) {
	main();
}
