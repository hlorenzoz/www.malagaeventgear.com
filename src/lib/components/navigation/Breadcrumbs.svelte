<script lang="ts">
	import { page } from '$app/stores';
	import { i18n } from '$lib/i18n.svelte';

	// Translation dictionary for public routes
	const routeTranslations: Record<string, { en: string; es: string }> = {
		'packages': { en: 'Packages', es: 'Paquetes' },
		'wedding': { en: 'Wedding', es: 'Bodas' },
		'eco': { en: 'Eco Pack', es: 'Pack Eco' },
		'mice': { en: 'MICE Pack', es: 'Pack MICE' },
		'blog': { en: 'Blog', es: 'Blog' },
		'contact': { en: 'Contact', es: 'Contacto' },
		'about-us': { en: 'About Us', es: 'Sobre Nosotros' },
		'faq': { en: 'FAQ', es: 'FAQ' },
		'privacy-policy': { en: 'Privacy Policy', es: 'Política de Privacidad' },
		'terms-of-service': { en: 'Terms of Service', es: 'Términos de Servicio' },
		'cookie-policy': { en: 'Cookie Policy', es: 'Política de Cookies' },
		'gdpr': { en: 'GDPR', es: 'RGPD' },
		'services': { en: 'Services', es: 'Servicios' },
		'meet-the-team': { en: 'Meet the Team', es: 'El Equipo' }
	};

	// Helper to translate route segments with dynamic capitalize fallback
	function getSegmentName(segment: string, lang: 'en' | 'es'): string {
		const translation = routeTranslations[segment.toLowerCase()];
		if (translation) {
			return translation[lang];
		}
		// Fallback for custom names or dynamic blog post titles (replaces hyphens with spaces and capitalizes)
		return segment
			.split('-')
			.map(word => word.charAt(0).toUpperCase() + word.slice(1))
			.join(' ');
	}

	// Reactively compute breadcrumbs based on active URL and language
	const items = $derived.by(() => {
		const pathname = $page.url.pathname;
		const lang = i18n.lang;

		// Filter out Home page to protect its premium layout
		if (pathname === '/') return [];

		// Normalize pathname and split into segments
		const cleanPath = pathname.endsWith('/') ? pathname.slice(0, -1) : pathname;
		const segments = cleanPath.split('/').filter(Boolean);

		const result = [
			{
				name: lang === 'en' ? 'Home' : 'Inicio',
				href: '/'
			}
		];

		let accumulatedPath = '';
		segments.forEach((segment) => {
			accumulatedPath += `/${segment}`;
			result.push({
				name: getSegmentName(segment, lang),
				href: `${accumulatedPath}/` // Strictly enforce trailing slash
			});
		});

		return result;
	});
</script>

{#if items.length > 0}
	<nav aria-label="Breadcrumbs" class="w-full max-w-container-max mx-auto px-margin-mobile md:px-margin-desktop pt-6 pb-2 relative z-20">
		<div class="inline-flex flex-wrap items-center gap-2 px-4 py-2 rounded-full border border-border-glass bg-surface-glass backdrop-blur-md shadow-[0_4px_30px_rgba(0,0,0,0.1)] text-on-surface-variant font-body-md text-xs sm:text-sm">
			{#each items as item, index}
				{#if index > 0}
					<span class="material-symbols-outlined text-[16px] text-outline opacity-40 select-none" aria-hidden="true">chevron_right</span>
				{/if}
				{#if index === items.length - 1}
					<span class="font-semibold text-electric-blue truncate max-w-[150px] sm:max-w-none" aria-current="page">
						{item.name}
					</span>
				{:else}
					<a
						href={item.href}
						class="hover:text-electric-blue hover:underline transition-colors duration-200"
					>
						{item.name}
					</a>
				{/if}
			{/each}
		</div>
	</nav>
{/if}
