<script lang="ts">
	import TopNavBar from '$lib/components/navigation/TopNavBar.svelte';
	import Footer from '$lib/components/navigation/Footer.svelte';
	import Breadcrumbs from '$lib/components/navigation/Breadcrumbs.svelte';
	import WhatsAppWidget from '$lib/components/navigation/WhatsAppWidget.svelte';
	import { onMount, setContext } from 'svelte';
	import { afterNavigate } from '$app/navigation';
	import { i18n } from '$lib/i18n.svelte';
	import { page } from '$app/stores';
	import { buildLocalBusinessSchema, buildBreadcrumbsSchema, buildWebSiteSchema } from '$lib/utils/schema';

	let { data, children } = $props();

	// Esquemas de datos estructurados globales
	const localBusinessSchema = buildLocalBusinessSchema();
	const webSiteSchema = buildWebSiteSchema();
	// Última miga = título real de la página cuando está en los datos de la ruta
	// (post de blog → data.post.title; paquete → data.pkg.name). Si no, cae al slug capitalizado.
	const breadcrumbLeaf = $derived(
		($page.data as any)?.post?.title ?? ($page.data as any)?.pkg?.name ?? undefined
	);
	const breadcrumbSchema = $derived(buildBreadcrumbsSchema($page.url.pathname, breadcrumbLeaf));

	const REVEAL_SELECTOR = '.reveal, .reveal-on-scroll, .reveal-card, .reveal-card-featured';
	let revealObserver: IntersectionObserver | null = null;

	// Observa los elementos reveal aún sin observar. Se invoca SIEMPRE dentro de requestAnimationFrame
	// (tras el primer paint) para que el cálculo de layout que dispara observe() no caiga en el camino
	// crítico de la hidratación → evita forced reflow.
	function scanRevealElements() {
		if (!revealObserver) return;
		document.querySelectorAll(REVEAL_SELECTOR).forEach((el) => revealObserver!.observe(el));
	}

	setContext('reveal', {
		scan: () => {
			if (revealObserver) {
				requestAnimationFrame(scanRevealElements);
			}
		}
	});

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
	<!-- Fuentes self-hosted (woff2, latin). El @font-face vive en tailwind.css (inline en el <head>),
	     con font-display: optional → sin período de swap, por lo que la llegada tardía de una fuente
	     NO re-hace layout (elimina el forced reflow [unattributed]). Preload de ambas (h1 + body) para
	     maximizar la chance de que estén listas dentro de la ventana de bloqueo de `optional`. -->
	<link rel="preload" as="font" type="font/woff2" href="/fonts/playfair-display-latin-wght-normal.woff2" crossorigin="anonymous" />
	<link rel="preload" as="font" type="font/woff2" href="/fonts/plus-jakarta-sans-latin-wght-normal.woff2" crossorigin="anonymous" />

	<!-- Datos Estructurados Globales (SEO Técnico) -->
	{@html `<script type="application/ld+json">${JSON.stringify(localBusinessSchema)}<\/script>`}
	{@html `<script type="application/ld+json">${JSON.stringify(webSiteSchema)}<\/script>`}
	{@html `<script type="application/ld+json">${JSON.stringify(breadcrumbSchema)}<\/script>`}
</svelte:head>

<div class="bg-background text-on-surface font-body-md min-h-screen flex flex-col antialiased selection:bg-primary-container selection:text-primary transition-colors duration-300">
	<!-- Componente de navegación superior compartido -->
	<TopNavBar />

	<!-- Contenido principal canvas -->
	<main class="flex-grow pt-[73px] md:pt-[73px] overflow-x-clip">
		<Breadcrumbs />
		{@render children()}
	</main>

	<!-- Pie de página unificado -->
	<Footer categories={data.categories} />

	<!-- WhatsApp Floating Action Widget -->
	<WhatsAppWidget />
</div>
