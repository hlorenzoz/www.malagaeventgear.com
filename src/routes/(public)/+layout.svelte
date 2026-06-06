<script lang="ts">
	import TopNavBar from '$lib/components/navigation/TopNavBar.svelte';
	import Footer from '$lib/components/navigation/Footer.svelte';
	import Breadcrumbs from '$lib/components/navigation/Breadcrumbs.svelte';
	import WhatsAppWidget from '$lib/components/navigation/WhatsAppWidget.svelte';
	import { onMount } from 'svelte';
	import { afterNavigate } from '$app/navigation';
	import { i18n } from '$lib/i18n.svelte';
	import { page } from '$app/stores';
	import { buildLocalBusinessSchema, buildBreadcrumbsSchema, buildWebSiteSchema } from '$lib/utils/schema';

	let { children } = $props();

	// Esquemas de datos estructurados globales
	const localBusinessSchema = buildLocalBusinessSchema();
	const webSiteSchema = buildWebSiteSchema();
	const breadcrumbSchema = $derived(buildBreadcrumbsSchema($page.url.pathname));

	const REVEAL_SELECTOR = '.reveal, .reveal-on-scroll, .reveal-card, .reveal-card-featured';
	let revealObserver: IntersectionObserver | null = null;

	// Observa los elementos reveal aún sin observar. Se invoca SIEMPRE dentro de requestAnimationFrame
	// (tras el primer paint) para que el cálculo de layout que dispara observe() no caiga en el camino
	// crítico de la hidratación → evita forced reflow.
	function scanRevealElements() {
		if (!revealObserver) return;
		document.querySelectorAll(REVEAL_SELECTOR).forEach((el) => revealObserver!.observe(el));
	}

	onMount(() => {
		// Inicializar i18n de forma segura en el cliente (evita desajustes de hidratación)
		i18n.init();

		revealObserver = new IntersectionObserver(
			(entries, observer) => {
				entries.forEach((entry) => {
					if (entry.isIntersecting) {
						entry.target.classList.add('active', 'is-revealed');
						observer.unobserve(entry.target);
					}
				});
			},
			{ root: null, rootMargin: '0px', threshold: 0.1 }
		);

		// Escaneo inicial diferido al siguiente frame (fuera del critical path).
		requestAnimationFrame(scanRevealElements);

		return () => revealObserver?.disconnect();
	});

	// Re-escanear tras cada navegación SPA (contenido nuevo), también diferido. Reemplaza al
	// MutationObserver global permanente, que provocaba layout thrashing durante la hidratación.
	afterNavigate((nav) => {
		if (nav.type === 'enter') return; // la carga inicial ya la cubre onMount
		requestAnimationFrame(scanRevealElements);
	});
</script>

<svelte:head>
	<!-- Google Fonts (text only) — Asynchronous Non-blocking Preload Strategy.
	     Material Symbols icon font removed: icons are now inline SVG via Icon.svelte. -->
	<link rel="preconnect" href="https://fonts.googleapis.com" />
	<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin="anonymous" />
	<link rel="preload" as="style" href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400..900&family=Plus+Jakarta+Sans:wght@200..800&display=swap" />
	<link id="gfonts-css" rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400..900&family=Plus+Jakarta+Sans:wght@200..800&display=swap" media="print" />
	<script>
		// Activa la hoja de fuentes (print → all) tras el primer paint vía requestAnimationFrame,
		// para que el recálculo de estilos que provoca no caiga en el render crítico (forced reflow).
		try {
			const activate = () => {
				const linkFonts = document.getElementById('gfonts-css');
				if (linkFonts) linkFonts.media = 'all';
			};
			if ('requestAnimationFrame' in window) {
				requestAnimationFrame(activate);
			} else {
				activate();
			}
		} catch (_) {}
	</script>
	<noscript>
		<link href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400..900&family=Plus+Jakarta+Sans:wght@200..800&display=swap" rel="stylesheet" />
	</noscript>

	<!-- Datos Estructurados Globales (SEO Técnico) -->
	{@html `<script type="application/ld+json">${JSON.stringify(localBusinessSchema)}<\/script>`}
	{@html `<script type="application/ld+json">${JSON.stringify(webSiteSchema)}<\/script>`}
	{@html `<script type="application/ld+json">${JSON.stringify(breadcrumbSchema)}<\/script>`}
</svelte:head>

<div class="bg-background text-on-surface font-body-md min-h-screen flex flex-col antialiased selection:bg-primary-container selection:text-primary transition-colors duration-300">
	<!-- Componente de navegación superior compartido -->
	<TopNavBar />

	<!-- Contenido principal canvas -->
	<main class="flex-grow pt-[73px] md:pt-[73px] overflow-hidden">
		<Breadcrumbs />
		{@render children()}
	</main>

	<!-- Pie de página unificado -->
	<Footer />

	<!-- WhatsApp Floating Action Widget -->
	<WhatsAppWidget />
</div>
