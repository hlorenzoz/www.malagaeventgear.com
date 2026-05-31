<script lang="ts">
	import { page } from '$app/stores';
	import { onMount } from 'svelte';
	import { i18n } from '$lib/i18n.svelte';
	import Icon from '$lib/components/navigation/Icon.svelte';

	// Estado reactivo con runes de Svelte 5
	let mobileMenuOpen = $state(false);
	let currentTheme = $state('dark');

	onMount(() => {
		const updateTheme = () => {
			let saved = null;
			try {
				saved = localStorage.getItem('theme');
			} catch (_) {}
			const theme = saved || (window.matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark');
			document.documentElement.setAttribute('data-theme', theme);
			currentTheme = theme;
		};

		updateTheme();

		// Escuchar cambios de tema del sistema en tiempo real
		const mediaQuery = window.matchMedia('(prefers-color-scheme: light)');
		const handler = () => {
			let hasSaved = false;
			try {
				hasSaved = !!localStorage.getItem('theme');
			} catch (_) {}
			if (!hasSaved) {
				updateTheme();
			}
		};

		mediaQuery.addEventListener('change', handler);
		return () => mediaQuery.removeEventListener('change', handler);
	});

	function toggleTheme() {
		const nextTheme = currentTheme === 'dark' ? 'light' : 'dark';
		document.documentElement.setAttribute('data-theme', nextTheme);
		try {
			localStorage.setItem('theme', nextTheme);
		} catch (_) {}
		currentTheme = nextTheme;
	}

	function toggleLang() {
		i18n.lang = i18n.lang === 'en' ? 'es' : 'en';
	}

	function toggleMobileMenu() {
		mobileMenuOpen = !mobileMenuOpen;
	}

	function closeMobileMenu() {
		mobileMenuOpen = false;
	}

	// Enlaces de navegación reactivos
	let navLinks = $derived([
		{ href: '/equipment/', label: i18n.t.nav.equipment },
		{ href: '/packages/', label: i18n.t.nav.packages },
		{ href: '/blog/', label: i18n.t.nav.blog },
		{ href: '/contact/', label: i18n.t.nav.contact }
	]);
</script>

<!-- TopNavBar Shared Component -->
<header class="fixed top-0 w-full z-50 bg-surface-glass backdrop-blur-xl border-b border-border-glass shadow-md shadow-primary/10 transition-colors duration-300">
	<div class="flex justify-between items-center px-margin-mobile md:px-margin-desktop py-4 max-w-container-max mx-auto">
		<!-- Brand Logo (theme-aware: light logo on dark theme, dark logo on light theme) -->
		<a class="transition-transform active:scale-95 duration-200" href="/" onclick={closeMobileMenu} aria-label={i18n.t.nav.brand}>
			<img
				src={currentTheme === 'dark' ? '/logo-light.svg' : '/logo-dark.svg'}
				alt={i18n.t.nav.brand}
				width="250"
				height="75"
				class="h-8 md:h-9 w-auto"
			/>
		</a>

		<!-- Navigation Links (Desktop) -->
		<nav class="hidden md:flex items-center gap-8 font-body-lg text-body-lg">
			{#each navLinks as link}
				{@const isActive = $page.url.pathname === link.href}
				<a
					href={link.href}
					class="transition-all duration-300 pb-1 active:scale-95 hover:text-electric-blue {isActive ? 'text-electric-blue font-bold border-b-2 border-electric-blue' : 'text-on-surface hover:bg-white/5 px-2 py-0.5 rounded'}"
				>
					{link.label}
				</a>
			{/each}
		</nav>

		<!-- Actions -->
		<div class="flex items-center gap-2 md:gap-4">
			<!-- Language Toggle Button -->
			<button
				onclick={toggleLang}
				class="flex items-center justify-center px-3 py-1.5 h-10 rounded-full glass-panel hover:bg-white/10 text-on-surface font-label-sm text-sm hover:text-electric-blue transition-colors duration-300"
				aria-label="{i18n.lang === 'en' ? 'ES - Change language to Spanish' : 'EN - Change language to English'}"
			>
				{i18n.lang === 'en' ? 'ES' : 'EN'}
			</button>

			<!-- Theme Toggle Button -->
			<button
				onclick={toggleTheme}
				class="flex items-center justify-center w-10 h-10 rounded-full glass-panel hover:bg-white/10 text-primary hover:text-electric-blue transition-colors duration-300"
				aria-label="Toggle color theme"
			>
				{#if currentTheme === 'dark'}
					<Icon name="light_mode" size="22" />
				{:else}
					<Icon name="dark_mode" size="22" />
				{/if}
			</button>

			<!-- Phone Call Button (Direct dial for quick contact) -->
			<a
				class="flex items-center justify-center w-10 h-10 rounded-full glass-panel hover:bg-white/10 text-primary hover:text-electric-blue transition-colors duration-300"
				href="tel:+34600428750"
				aria-label="Call Malaga Event Gear"
			>
				<Icon name="call" size="22" />
			</a>

			<!-- Action Button -->
			<a
				class="hidden md:inline-flex items-center justify-center px-6 py-2 rounded-full bg-gradient-to-r from-electric-blue to-primary-container text-white font-label-lg uppercase tracking-wider hover:shadow-lg hover:shadow-electric-blue/20 active:scale-95 transition-all duration-300"
				href="/packages/"
			>
				{i18n.t.nav.bookNow}
			</a>

			<!-- Mobile Menu Button -->
			<button
				onclick={toggleMobileMenu}
				class="md:hidden flex items-center justify-center w-10 h-10 rounded-full glass-panel text-primary hover:text-electric-blue transition-colors duration-300"
				aria-label="Open navigation menu"
			>
				{#if mobileMenuOpen}
					<Icon name="close" size="28" />
				{:else}
					<Icon name="menu" size="28" />
				{/if}
			</button>
		</div>
	</div>

	<!-- Mobile Dropdown Navigation Menu -->
	{#if mobileMenuOpen}
		<div class="md:hidden w-full bg-background/95 backdrop-blur-2xl border-b border-border-glass py-6 px-margin-mobile flex flex-col gap-6 animate-fade-in absolute left-0 top-[73px] shadow-2xl">
			<nav class="flex flex-col gap-4">
				{#each navLinks as link}
					{@const isActive = $page.url.pathname === link.href}
					<a
						href={link.href}
						onclick={closeMobileMenu}
						class="font-body-lg text-lg py-2 px-4 rounded-lg transition-colors {isActive ? 'bg-primary-container/20 text-electric-blue font-bold' : 'text-on-surface hover:bg-white/5'}"
					>
						{link.label}
					</a>
				{/each}
			</nav>
			<a
				onclick={closeMobileMenu}
				class="w-full text-center py-3 rounded-full bg-gradient-to-r from-electric-blue to-primary-container text-white font-label-lg uppercase tracking-wider hover:shadow-lg active:scale-98 transition-all"
				href="/packages/"
			>
				{i18n.t.nav.bookNow}
			</a>
		</div>
	{/if}
</header>
