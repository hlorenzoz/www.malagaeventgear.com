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
		// Inlina el CSS de ruta (< 50KiB) en el <head>, eliminando los <link> render-blocking
		// y acelerando FCP/LCP — crítico para las páginas de paquete (conversión).
		inlineStyleThreshold: 51200
	},
	preprocess: [mdsvex({ extensions: ['.mdx', '.svx', '.md'] })],
	extensions: ['.svelte', '.mdx', '.svx', '.md']
};

export default config;
