<script lang="ts">
	import TopNavBar from '$lib/components/navigation/TopNavBar.svelte';
	import Footer from '$lib/components/navigation/Footer.svelte';
	import { onMount } from 'svelte';
	import { i18n } from '$lib/i18n.svelte';

	let { children } = $props();

	onMount(() => {
		// Inicializar i18n de forma segura en el cliente (evita desajustes de hidratación)
		i18n.init();

		// Inicialización de la animación de Scroll Reveal
		const observerOptions = {
			root: null,
			rootMargin: '0px',
			threshold: 0.1
		};

		const observer = new IntersectionObserver((entries, observer) => {
			entries.forEach(entry => {
				if (entry.isIntersecting) {
					entry.target.classList.add('active');
					entry.target.classList.add('is-revealed');
					observer.unobserve(entry.target);
				}
			});
		}, observerOptions);

		// Observar elementos con reveal
		const revealElements = document.querySelectorAll('.reveal, .reveal-on-scroll, .reveal-card, .reveal-card-featured');
		revealElements.forEach(el => observer.observe(el));
	});
</script>

<svelte:head>
	<!-- Google Fonts: Playfair Display & Plus Jakarta Sans -->
	<link rel="preconnect" href="https://fonts.googleapis.com" />
	<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin="anonymous" />
	<link href="https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400..900;1,400..900&family=Plus+Jakarta+Sans:ital,wght@0,200..800;1,200..800&display=swap" rel="stylesheet" />
	
	<!-- Material Icons -->
	<link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200" rel="stylesheet" />
</svelte:head>

<div class="bg-background text-on-surface font-body-md min-h-screen flex flex-col antialiased selection:bg-primary-container selection:text-primary transition-colors duration-300">
	<!-- Componente de navegación superior compartido -->
	<TopNavBar />

	<!-- Contenido principal canvas -->
	<main class="flex-grow pt-[73px] md:pt-[73px] overflow-hidden">
		{@render children()}
	</main>

	<!-- Pie de página unificado -->
	<Footer />
</div>
