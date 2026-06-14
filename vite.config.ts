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
				// Precache only the app shell + main marketing pages. The blog (post pages,
				// listing, categories, authors) is intentionally EXCLUDED from precache — it's
				// large (~140 prerendered pages) and served from the network instead. This keeps
				// the SW install small instead of shipping the whole blog up front.
				globPatterns: ['**/*.{js,css,png,svg,ico,webmanifest}'],
				globIgnores: ['**/blog/**'],
				maximumFileSizeToCacheInBytes: 4 * 1024 * 1024,
				// Cache blog pages/assets at runtime as the user visits them (not up front).
				runtimeCaching: [
					{
						urlPattern: ({ url }) => url.pathname.startsWith('/blog'),
						handler: 'StaleWhileRevalidate',
						options: { cacheName: 'blog-runtime', expiration: { maxEntries: 60 } }
					}
				]
			}
		})
	]
});
