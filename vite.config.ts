import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';
import { SvelteKitPWA } from '@vite-pwa/sveltekit';
import tailwindcss from '@tailwindcss/vite';
import { blogMeta } from './scripts/vite-blog-meta.mjs';

export default defineConfig({
	server: {
		port: 5173,
		strictPort: true
	},
	plugins: [
		blogMeta(),
		tailwindcss(),
		sveltekit(),
		SvelteKitPWA({
			registerType: 'autoUpdate',
			manifest: {
				name: 'Malaga Event Gear',
				short_name: 'MEG',
				description: 'Malaga Event Gear - Blog & CRM Dashboard',
				theme_color: '#0f172a',
				background_color: '#0f172a',
				display: 'standalone',
				start_url: '/',
				icons: [
					{
						src: 'icon-192.png',
						sizes: '192x192',
						type: 'image/png'
					},
					{
						src: 'icon-512.png',
						sizes: '512x512',
						type: 'image/png'
					},
					{
						src: 'icon-512.png',
						sizes: '512x512',
						type: 'image/png',
						purpose: 'any maskable'
					}
				]
			},
			workbox: {
				globPatterns: ['**/*.{js,css,png,svg,ico,webmanifest}'],
				// El chunk gigante (~3.4 MB) ERA el blog: el glob eager de metadata
				// importaba estáticamente cada .svx y anulaba el code-split por post, así que
				// todos los cuerpos terminaban en un solo chunk. Resuelto con el módulo virtual
				// `virtual:blog-meta` (scripts/vite-blog-meta.mjs): ahora cada post se divide en
				// su propio chunk. Mantenemos el límite holgado por seguridad para el SW.
				maximumFileSizeToCacheInBytes: 4 * 1024 * 1024
			}
		})
	]
});
