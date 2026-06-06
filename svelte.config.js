import { mdsvex } from 'mdsvex';
import adapter from '@sveltejs/adapter-cloudflare';

/** @type {import('@sveltejs/kit').Config} */
const config = {
	compilerOptions: {
		// Fuerza el modo runes en todo el proyecto excepto en librerías. Puede eliminarse en Svelte 6.
		runes: ({ filename }) => filename.split(/[/\\]/).includes('node_modules') ? undefined : true
	},
	kit: {
		adapter: adapter(),
		// Inlina el CSS en el <head> eliminando el <link> render-blocking que retrasaba FCP/LCP.
		// El umbral se compara contra el tamaño SIN comprimir: el CSS global (Tailwind) pesa ~83KB
		// sin comprimir (~12KB gzip), así que el umbral debe superarlo. Crítico para las páginas de
		// paquete (primera visita desde ads, sin caché → conversión).
		inlineStyleThreshold: 102400
	},
	preprocess: [mdsvex({ extensions: ['.mdx', '.svx', '.md'] })],
	extensions: ['.svelte', '.mdx', '.svx', '.md']
};

export default config;
