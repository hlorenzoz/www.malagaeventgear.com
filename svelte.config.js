import { mdsvex } from 'mdsvex';
import adapter from '@sveltejs/adapter-cloudflare';
import rehypeSlug from 'rehype-slug';
import { rehypeBlogImages } from './scripts/rehype-blog-images.mjs';
import { rehypeFaqAccordion } from './scripts/rehype-faq-accordion.mjs';
import { rehypePostToc } from './scripts/rehype-post-toc.mjs';
import { rehypeSectionCards } from './scripts/rehype-section-cards.mjs';
import { rehypeImageGallery } from './scripts/rehype-image-gallery.mjs';
import { rehypeInternalLinks } from './scripts/rehype-internal-links.mjs';

/**
 * mdsvex 0.12.7 inyecta el frontmatter como `<script context="module">`, sintaxis
 * deprecada en Svelte 5 (script_context_deprecated). Este preprocesador corre DESPUÉS
 * de mdsvex y reescribe su salida al atributo `module` moderno. Acotado a `.svx` para
 * no alterar los `.svelte` escritos a mano (que sí deberían migrarse explícitamente).
 */
const fixMdsvexModuleScript = {
	name: 'fix-mdsvex-module-script',
	markup: ({ content, filename }) => {
		if (!filename?.endsWith('.svx')) return;
		const code = content.replace(/<script\s+context="module"(\s*>|\s)/g, '<script module$1');
		return code === content ? undefined : { code };
	}
};

/** @type {import('@sveltejs/kit').Config} */
const config = {
	compilerOptions: {
		// Fuerza el modo runes en todo el proyecto excepto en librerías. Puede eliminarse en Svelte 6.
		runes: ({ filename }) => filename.split(/[/\\]/).includes('node_modules') ? undefined : true
	},
	kit: {
		adapter: adapter(),
		prerender: {
			// Los posts migrados traen un "Table of Contents" de WP cuyo slugger no
			// siempre coincide con rehype-slug (p. ej. "FAQs" → #fa-qs vs #faqs). Esas
			// anclas no saltan, pero NO deben romper el build. handleHttpError queda por
			// defecto (falla) para seguir detectando links 404 reales.
			handleMissingId: 'warn'
		},
		// Inlina el CSS en el <head> eliminando el <link> render-blocking que retrasaba FCP/LCP.
		// El umbral se compara contra el tamaño SIN comprimir: el CSS global (Tailwind) pesa ~83KB
		// sin comprimir (~12KB gzip), así que el umbral debe superarlo. Crítico para las páginas de
		// paquete (primera visita desde ads, sin caché → conversión).
		inlineStyleThreshold: 102400
	},
	preprocess: [
		mdsvex({
			extensions: ['.svx'],
			// Plugin execution order matters:
			// 1. rehypeSlug    — assigns ids to all headings (must be first)
			// 2. rehypeBlogImages — enriches <img> with srcset/alt/dimensions
			// 3. rehypeImageGallery — groups consecutive images into scroll-snap galleries
			//    (must run after rehypeBlogImages so srcset is already set)
			// 4. rehypePostToc — removes old inline ToC, removes empty Testimonials h2,
			//    injects mobile ToC after Key Highlights (needs ids from rehypeSlug;
			//    must run before rehypeFaqAccordion which restructures h3 nodes)
			// 5. rehypeSectionCards — wraps Brief Overview / Key Highlights in styled cards
			//    (must run after rehypePostToc removes the old ToC)
			// 6. rehypeFaqAccordion — MUST be last (restructures h3 nodes into <details>)
			rehypePlugins: [rehypeSlug, rehypeInternalLinks, rehypeBlogImages, rehypeImageGallery, rehypePostToc, rehypeSectionCards, rehypeFaqAccordion]
			// No layout option — mdsvex layout injection uses $$props which is
			// incompatible with runes mode. The [slug]/+page.svelte wraps post
			// components explicitly via BlogPost.svelte instead (ADR-009 approach).
		}),
		// Corre DESPUÉS de mdsvex: migra su `context="module"` deprecado a `module`.
		fixMdsvexModuleScript
	],
	extensions: ['.svelte', '.svx']
};

export default config;
