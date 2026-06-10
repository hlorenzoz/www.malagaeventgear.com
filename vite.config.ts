import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';
import { SvelteKitPWA } from '@vite-pwa/sveltekit';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
	server: {
		port: 5173,
		strictPort: true
	},
	plugins: [
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
				// El chunk principal de la app ronda los ~3.2 MB (≈535 KB gzip) y supera el
				// default de workbox (2 MiB), lo que rompía el build del SW. Subimos el límite
				// para precachearlo como antes. NOTA: ese bundle grande es un tema de CWV
				// pre-existente (no del blog) que conviene revisar/code-split por separado.
				maximumFileSizeToCacheInBytes: 4 * 1024 * 1024
			}
		})
	]
});
