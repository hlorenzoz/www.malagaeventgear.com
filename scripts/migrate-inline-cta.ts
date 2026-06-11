#!/usr/bin/env bun
/**
 * migrate-inline-cta.ts — Reemplaza los bloques CTA inline heredados de WordPress
 * por el componente <InlineCTA />, que renderiza el mismo CTA estilado que aparece
 * al final de cada post (resuelto al paquete del post vía Svelte context).
 *
 * Uso:
 *   bun scripts/migrate-inline-cta.ts            # aplica los cambios
 *   bun scripts/migrate-inline-cta.ts --dry      # solo reporta, no escribe
 *
 * Firma del bloque CTA (3 párrafos en markdown crudo):
 *   1. Titular en negrita SOLO:  **texto**  o  ****texto****
 *   2. Párrafo de descripción (una línea)
 *   3. Párrafo que es ÚNICAMENTE un link a una página de paquete/precios
 *
 * La precisión la da el ancla de fin de línea ($) tras el link: el párrafo-link
 * debe ser SOLO el link, lo que excluye los links en prosa.
 *
 * Idempotente: re-correr detecta 0 bloques (ya quedó <InlineCTA />) y no duplica
 * el import. Dedupe: si un post tiene varios bloques, deja 1 solo <InlineCTA />.
 */

import { existsSync, readdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

// ---------------------------------------------------------------------------
// Detección
// ---------------------------------------------------------------------------

/**
 * Matchea el bloque CTA de 3 párrafos. Flags: `g` (todas) + `m` (^/$ por línea).
 * Se recrea por uso para no arrastrar `lastIndex` entre llamadas.
 */
function ctaBlockRegex(): RegExp {
	return new RegExp(
		// 1) titular bold-only (** o ****), línea completa
		'^[ \\t]*\\*\\*+[^\\n]+?\\*\\*+[ \\t]*\\n' +
			'\\n' +
			// 2) descripción: una línea que NO es a su vez un link suelto
			'(?!\\[[^\\]]+\\]\\([^)]+\\)[ \\t]*\\n)[^\\n]+\\n' +
			'\\n' +
			// 3) párrafo-link: la línea ENTERA es el link a un pack/pricing
			'\\[[^\\]]+\\]\\(https:\\/\\/(?:www\\.)?malagaeventgear\\.com\\/' +
			'(?:wedding-pack|mice-pack|basic-mice-pack|product-presentation-pack|eco-pack|pricing)\\/\\)[ \\t]*$',
		'gm'
	);
}

const INLINE_CTA_TAG = '<InlineCTA />';
const IMPORT_LINE = "import InlineCTA from '$lib/components/blog/InlineCTA.svelte';";

// ---------------------------------------------------------------------------
// Transformaciones puras
// ---------------------------------------------------------------------------

/**
 * Reemplaza el PRIMER bloque CTA por <InlineCTA /> y elimina los restantes
 * (dedupe: máximo 1 inline por post). Devuelve el body resultante y la cantidad
 * de bloques detectados.
 */
export function transformCtaBlocks(body: string): { body: string; count: number } {
	const matches = body.match(ctaBlockRegex());
	const count = matches ? matches.length : 0;
	if (count === 0) return { body, count: 0 };

	// El primer bloque se convierte en <InlineCTA />; los restantes se marcan para
	// borrar. Usamos un marcador (\x00) en vez de '' para poder consumir DESPUÉS la
	// línea en blanco adyacente, sin tocar espacios en blanco preexistentes del resto
	// del documento (un colapso global de \n{3,} alteraría contenido no relacionado).
	let seen = 0;
	const MARK = '\x00';
	let result = body.replace(ctaBlockRegex(), () => {
		seen += 1;
		return seen === 1 ? INLINE_CTA_TAG : MARK;
	});

	// Quita el marcador junto a UNA línea en blanco adyacente (preferentemente la
	// previa) para no dejar runs de 3+ saltos donde se eliminó un bloque duplicado.
	result = result
		.replace(/\n\n\x00/g, '')
		.replace(/\x00\n\n/g, '')
		.replace(/\x00/g, '');

	return { body: result, count };
}

/**
 * Garantiza que el body tenga el import de InlineCTA en un <script> instancia.
 * - Si ya está el import → no toca nada.
 * - Si hay un <script> instancia (no `module`) → inyecta el import dentro.
 * - Si no hay <script> → antepone uno (respetando los saltos iniciales del body).
 */
export function ensureInlineCtaImport(body: string): string {
	if (/^\s*import\s+InlineCTA\b/m.test(body)) return body;

	const instanceScript = body.match(/<script(?![^>]*\bmodule\b)[^>]*>/);
	if (instanceScript && instanceScript.index !== undefined) {
		const insertAt = instanceScript.index + instanceScript[0].length;
		return `${body.slice(0, insertAt)}\n\t${IMPORT_LINE}${body.slice(insertAt)}`;
	}

	const scriptBlock = `<script>\n\t${IMPORT_LINE}\n</script>\n\n`;
	const leadingWs = body.match(/^\s*/)?.[0] ?? '';
	return `${leadingWs}${scriptBlock}${body.slice(leadingWs.length)}`;
}

/**
 * Migra el contenido completo de un .svx: separa frontmatter, transforma el body
 * y (si hubo bloques) inserta el import. Devuelve el contenido nuevo y el conteo.
 */
export function migratePostContent(content: string): { content: string; count: number } {
	const fmStart = content.indexOf('---');
	if (fmStart === -1) return { content, count: 0 };
	const fmEnd = content.indexOf('---', fmStart + 3);
	if (fmEnd === -1) return { content, count: 0 };

	const head = content.slice(0, fmEnd + 3); // incluye el `---` de cierre
	const body = content.slice(fmEnd + 3);

	const { body: newBody, count } = transformCtaBlocks(body);
	if (count === 0) return { content, count: 0 };

	const withImport = ensureInlineCtaImport(newBody);
	return { content: head + withImport, count };
}

// ---------------------------------------------------------------------------
// Main (I/O)
// ---------------------------------------------------------------------------

const BLOG_DIR = join(process.cwd(), 'src', 'content', 'blog');

/** Posts que NO se tocan: news (links en prosa) y fixtures de test. */
function isExcluded(filename: string): boolean {
	return (
		filename.startsWith('news-') ||
		filename === 'draft-post-test-fixture.svx' ||
		filename === 'future-post-test-fixture.svx'
	);
}

function main(): void {
	const dryRun = process.argv.includes('--dry');

	if (!existsSync(BLOG_DIR)) {
		console.error(`[migrate-inline-cta] ERROR: no existe ${BLOG_DIR}`);
		process.exit(1);
	}

	const files = readdirSync(BLOG_DIR)
		.filter((f) => f.endsWith('.svx'))
		.filter((f) => !isExcluded(f))
		.sort();

	let totalBlocks = 0;
	let changedFiles = 0;

	for (const file of files) {
		const path = join(BLOG_DIR, file);
		const original = readFileSync(path, 'utf8');
		const { content: migrated, count } = migratePostContent(original);

		if (count === 0 || migrated === original) continue;

		totalBlocks += count;
		changedFiles += 1;
		const note = count > 1 ? ` (dedupe: ${count} → 1)` : '';
		console.log(`  ${file}: ${count} bloque(s)${note}`);

		if (!dryRun) writeFileSync(path, migrated, 'utf8');
	}

	console.log('');
	console.log(
		`[migrate-inline-cta] ${dryRun ? '[DRY] ' : ''}${changedFiles} archivo(s) modificados, ${totalBlocks} bloque(s) detectados.`
	);
}

// Guard: solo corre main() en ejecución directa (no al importar en tests).
if (import.meta.main) {
	main();
}
