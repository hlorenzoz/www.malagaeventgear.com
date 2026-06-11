/**
 * Tests para la lógica pura de migrate-inline-cta.ts
 *
 * transformCtaBlocks / ensureInlineCtaImport / migratePostContent son las
 * funciones puras exportadas. El I/O (readdir/readFile/writeFile) no se testea.
 */

import { describe, it, expect } from 'vitest';
import {
	transformCtaBlocks,
	ensureInlineCtaImport,
	migratePostContent
} from './migrate-inline-cta';

// Bloque CTA "real" tal como vienen migrados desde WordPress.
function ctaBlock(
	headline: string,
	url: string,
	link = '**Reserve Your Wedding Pack Now**'
): string {
	return `${headline}\n\nSecure professional sound, stunning lighting, and dedicated technical assistance for your magical celebration in Malaga, Spain!\n\n[${link}](${url})`;
}

describe('transformCtaBlocks', () => {
	it('reemplaza un bloque con titular **..** por <InlineCTA />', () => {
		const body = `Intro paragraph.\n\n${ctaBlock('**Book Your Stress Free Wedding AV Package Today**', 'https://malagaeventgear.com/wedding-pack/')}\n\n## Next`;
		const { body: out, count } = transformCtaBlocks(body);
		expect(count).toBe(1);
		expect(out).toContain('<InlineCTA />');
		expect(out).not.toContain('Book Your Stress Free Wedding AV Package Today');
		expect(out).not.toContain('malagaeventgear.com/wedding-pack');
		// Bloque a nivel de bloque: rodeado de líneas en blanco
		expect(out).toMatch(/Intro paragraph\.\n\n<InlineCTA \/>\n\n## Next/);
	});

	it('matchea el titular quad-bold ****..****', () => {
		const body = ctaBlock(
			'****Elevate Your Corporate Event with Professional AV Rental****',
			'https://malagaeventgear.com/mice-pack/'
		);
		const { count } = transformCtaBlocks(body);
		expect(count).toBe(1);
	});

	it('matchea el link no-bold [texto](url)', () => {
		const body = ctaBlock(
			'**Host an Exquisite Event**',
			'https://malagaeventgear.com/mice-pack/',
			'Request Your Quote Today'
		);
		const { count } = transformCtaBlocks(body);
		expect(count).toBe(1);
	});

	it('matchea las 6 URLs de paquete/precios', () => {
		const urls = [
			'https://malagaeventgear.com/wedding-pack/',
			'https://malagaeventgear.com/mice-pack/',
			'https://malagaeventgear.com/basic-mice-pack/',
			'https://malagaeventgear.com/product-presentation-pack/',
			'https://malagaeventgear.com/eco-pack/',
			'https://malagaeventgear.com/pricing/'
		];
		for (const url of urls) {
			const { count } = transformCtaBlocks(ctaBlock('**Headline Here**', url, 'Book Now'));
			expect(count, `URL: ${url}`).toBe(1);
		}
	});

	it('NO matchea links en prosa (texto después del link)', () => {
		const body = `Some intro text here.\n\n**A bold lead-in line here**\n\nNeed help today? [Contact us today](https://malagaeventgear.com/product-presentation-pack/) to book your next event with us.\n\nMore content.`;
		const { count } = transformCtaBlocks(body);
		expect(count).toBe(0);
	});

	it('NO matchea un link de pricing embebido en prosa', () => {
		const body = `Intro.\n\n**Bold heading alone**\n\nChoose a [package](https://malagaeventgear.com/pricing/) tailored specifically for your event needs.\n\nOutro.`;
		const { count } = transformCtaBlocks(body);
		expect(count).toBe(0);
	});

	it('dedupe: 2 bloques → 1 <InlineCTA /> y el 2º eliminado, count=2', () => {
		const block = ctaBlock(
			'**Book Your Stress Free Wedding AV Package Today**',
			'https://malagaeventgear.com/wedding-pack/'
		);
		const body = `Intro.\n\n${block}\n\n## Mid section\n\nMore text.\n\n${block}\n\n## End`;
		const { body: out, count } = transformCtaBlocks(body);
		expect(count).toBe(2);
		const occurrences = (out.match(/<InlineCTA \/>/g) ?? []).length;
		expect(occurrences).toBe(1);
		expect(out).not.toContain('malagaeventgear.com/wedding-pack');
		// No deja runs de 3+ saltos de línea
		expect(out).not.toMatch(/\n{3,}/);
	});

	it('es idempotente: correr sobre output ya migrado no cambia nada', () => {
		const body = `Intro.\n\n${ctaBlock('**Headline**', 'https://malagaeventgear.com/wedding-pack/')}\n\n## Next`;
		const first = transformCtaBlocks(body).body;
		const second = transformCtaBlocks(first);
		expect(second.count).toBe(0);
		expect(second.body).toBe(first);
	});

	it('preserva runs de líneas en blanco preexistentes ajenos al bloque', () => {
		// Whitespace "sucio" preexistente (3 saltos) en otra parte del doc no debe tocarse.
		const messy = 'Intro section.\n\n\n\n   Indented prose with extra blanks above.';
		const body = `${messy}\n\n${ctaBlock('**Headline**', 'https://malagaeventgear.com/wedding-pack/')}\n\n## Next`;
		const { body: out, count } = transformCtaBlocks(body);
		expect(count).toBe(1);
		// El bloque preexistente sucio queda intacto
		expect(out).toContain(messy);
	});

	it('no toca un body sin bloques CTA', () => {
		const body = `Just normal markdown.\n\n## Heading\n\nA [normal internal link](/packages/wedding/) inline.`;
		const { body: out, count } = transformCtaBlocks(body);
		expect(count).toBe(0);
		expect(out).toBe(body);
	});
});

describe('ensureInlineCtaImport', () => {
	const IMPORT = "import InlineCTA from '$lib/components/blog/InlineCTA.svelte';";

	it('agrega un <script> con el import cuando no existe', () => {
		const body = '\n\nSome content here.\n';
		const out = ensureInlineCtaImport(body);
		expect(out).toContain('<script>');
		expect(out).toContain(IMPORT);
		expect(out).toContain('Some content here.');
	});

	it('no duplica el import al correr dos veces', () => {
		const body = '\n\nSome content.\n';
		const once = ensureInlineCtaImport(body);
		const twice = ensureInlineCtaImport(once);
		const occurrences = (twice.match(/import InlineCTA/g) ?? []).length;
		expect(occurrences).toBe(1);
	});

	it('inyecta el import en un <script> instancia existente sin duplicar', () => {
		const body = "<script>\n\timport Foo from './Foo.svelte';\n</script>\n\nContent.";
		const out = ensureInlineCtaImport(body);
		expect(out).toContain(IMPORT);
		expect(out).toContain("import Foo from './Foo.svelte';");
		const scripts = (out.match(/<script/g) ?? []).length;
		expect(scripts).toBe(1);
	});
});

describe('migratePostContent', () => {
	const frontmatter = `---\ntitle: "Wedding AV"\ndescription: "Desc here long enough."\ncategories: [Audio Visual Rental, Weddings]\ndraft: false\n---`;

	it('inserta el import tras el frontmatter y reemplaza el bloque', () => {
		const content = `${frontmatter}\n\nIntro.\n\n**Book Your Stress Free Wedding AV Package Today**\n\nSecure professional sound and lighting for your celebration in Malaga, Spain!\n\n[**Reserve Your Wedding Pack Now**](https://malagaeventgear.com/wedding-pack/)\n\n## Next\n`;
		const { content: out, count } = migratePostContent(content);
		expect(count).toBe(1);
		// frontmatter intacto
		expect(out).toContain('title: "Wedding AV"');
		expect(out).toContain("import InlineCTA from '$lib/components/blog/InlineCTA.svelte';");
		expect(out).toContain('<InlineCTA />');
		expect(out).not.toContain('malagaeventgear.com/wedding-pack');
	});

	it('no modifica un post sin bloques CTA (count=0)', () => {
		const content = `${frontmatter}\n\nJust content with an inline [link](/packages/wedding/).\n`;
		const { content: out, count } = migratePostContent(content);
		expect(count).toBe(0);
		expect(out).toBe(content);
		expect(out).not.toContain('import InlineCTA');
	});
});
