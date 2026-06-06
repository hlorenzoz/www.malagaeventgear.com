<script lang="ts">
	import { onMount } from 'svelte';
	import SeoHead from '$lib/components/seo/SeoHead.svelte';
	import Icon from '$lib/components/navigation/Icon.svelte';
	import LeadForm from '$lib/components/forms/LeadForm.svelte';
	import Testimonials from '$lib/components/testimonials/Testimonials.svelte';
	import { i18n } from '$lib/i18n.svelte';
	import { siteConfig } from '$lib/data/site';
	import type { PageData } from './$types';
	import { buildServiceSchema } from '$lib/utils/schema';

	let { data }: { data: PageData } = $props();
	let pkg = $derived(data.pkg);
	let landing = $derived(pkg.landing);

	let seoSchema = $derived(
		buildServiceSchema(
			{
				name: pkg.name,
				description: pkg.desc[i18n.lang],
				price: pkg.price,
				url: pkg.route,
				category: pkg.seo.serviceType
			},
			i18n.lang
		)
	);

	// Sticky CTA: hide when lead-form is in viewport
	let stickyVisible = $state(false);
	let formInView = $state(false);

	function scrollToForm() {
		const el = document.getElementById('lead-form');
		if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
	}

	onMount(() => {
		// Show sticky bar after scrolling past ~200px; hide it when the form is visible
		const formEl = document.getElementById('lead-form');

		const scrollHandler = () => {
			stickyVisible = window.scrollY > 200;
		};

		let observer: IntersectionObserver | null = null;
		if (formEl) {
			observer = new IntersectionObserver(
				(entries) => {
					formInView = entries[0].isIntersecting;
				},
				{ threshold: 0.15 }
			);
			observer.observe(formEl);
		}

		window.addEventListener('scroll', scrollHandler, { passive: true });
		scrollHandler();

		return () => {
			window.removeEventListener('scroll', scrollHandler);
			observer?.disconnect();
		};
	});
</script>

<SeoHead
	title={pkg.seo.title[i18n.lang]}
	description={pkg.desc[i18n.lang]}
	canonicalUrl={`${siteConfig.url}${pkg.route}`}
	image={pkg.image}
	jsonLdSchema={seoSchema}
/>

<!-- ─── Sticky CTA bar ─────────────────────────────────────────────────── -->
{#if stickyVisible && !formInView}
	<div
		class="fixed top-0 left-0 right-0 z-50 flex items-center justify-between gap-4 px-margin-mobile md:px-margin-desktop py-3 glass-panel border-b border-border-glass shadow-lg"
		role="banner"
		aria-label="Sticky call to action"
	>
		<span class="font-label-lg text-on-surface truncate">{pkg.name}</span>
		<button
			onclick={scrollToForm}
			class="shrink-0 rounded-full bg-electric-blue-strong px-6 py-2 font-label-md uppercase tracking-wider text-white hover:shadow-[0_0_16px_rgba(77,140,255,0.4)] active:scale-95 transition-all duration-200"
		>
			{landing.ctaButton[i18n.lang]}
		</button>
	</div>
{/if}

<div class="relative w-full z-10">
	<!-- ─── Hero ──────────────────────────────────────────────────────────── -->
	<section class="py-20 px-margin-mobile md:px-margin-desktop max-w-container-max mx-auto text-center reveal active is-revealed">
		<span class="inline-block px-4 py-2 rounded-full glass-panel font-label-sm text-electric-blue uppercase tracking-widest mb-4">
			{landing.badge[i18n.lang]}
		</span>
		<h1 class="font-headline-lg-mobile md:font-headline-lg text-[40px] md:text-display-lg leading-tight mb-6 text-on-background">
			{pkg.name}
		</h1>
		<p class="font-body-lg text-body-lg text-on-surface-variant max-w-3xl mx-auto leading-relaxed mb-10">
			{pkg.desc[i18n.lang]}
		</p>
		<!-- Primary CTA: scroll to form -->
		<button
			onclick={scrollToForm}
			class="px-10 py-4 rounded-full bg-electric-blue-strong text-white font-label-lg uppercase tracking-wider hover:shadow-[0_0_24px_rgba(77,140,255,0.45)] active:scale-95 transition-all duration-300"
		>
			{landing.ctaButton[i18n.lang]}
		</button>
	</section>

	<!-- ─── Price anchor + Trust signals ─────────────────────────────────── -->
	<section class="px-margin-mobile md:px-margin-desktop max-w-container-max mx-auto mb-16">
		<div class="glass-panel rounded-2xl p-8 flex flex-col md:flex-row items-center justify-between gap-6">
			<!-- Price -->
			<div class="flex flex-wrap items-center gap-x-3 gap-y-2">
				<span class="font-label-md text-on-surface-variant uppercase tracking-wider">
					{landing.rateLabel[i18n.lang]}
				</span>
				<span class="text-display-lg font-bold text-electric-blue">{pkg.price} €</span>
				<span class="text-sm text-on-surface-variant">{landing.vatNote[i18n.lang]}</span>
				{#if pkg.popular}
					<span class="inline-block bg-electric-blue-strong text-white px-3 py-1 rounded-full font-label-sm tracking-wider uppercase ml-2">
						{i18n.lang === 'en' ? 'Most Popular' : 'Más Popular'}
					</span>
				{/if}
			</div>
			<!-- Trust signals -->
			<div class="flex flex-wrap gap-4">
				<!-- Trust 1: response time -->
				<div class="flex items-center gap-2 px-4 py-2 rounded-full glass-card">
					<Icon name="schedule" size="18" className="text-electric-blue" />
					<span class="font-label-sm text-on-surface">
						{i18n.t.leadForm.responseTime}
					</span>
				</div>
				<!-- Trust 2: items count -->
				<div class="flex items-center gap-2 px-4 py-2 rounded-full glass-card">
					<Icon name="inventory_2" size="18" className="text-electric-blue" />
					<span class="font-label-sm text-on-surface">
						{pkg.includes[i18n.lang].length}
						{i18n.lang === 'en' ? 'items included' : 'elementos incluidos'}
					</span>
				</div>
				<!-- Trust 3: rating -->
				<div class="flex items-center gap-2 px-4 py-2 rounded-full glass-card">
					<span class="text-electric-blue text-sm">★★★★★</span>
					<span class="font-label-sm text-on-surface">5.0 Google</span>
				</div>
			</div>
		</div>
	</section>

	<!-- ─── Main content grid ─────────────────────────────────────────────── -->
	<div class="px-margin-mobile md:px-margin-desktop max-w-container-max mx-auto grid grid-cols-1 lg:grid-cols-12 gap-gutter mb-20">

		<!-- Left col: Includes + Optional -->
		<div class="lg:col-span-7 flex flex-col gap-6">
			<!-- Package image -->
			{#if pkg.image}
				{@const mobileImage = pkg.image.replace('.webp', '-mobile.webp')}
				{@const desktopImage = pkg.image.replace('.webp', '-desktop.webp')}
				<div class="w-full h-56 rounded-xl overflow-hidden relative">
					<picture class="absolute inset-0 w-full h-full">
						<source media="(max-width: 767px)" srcset={mobileImage} type="image/webp" />
						<source media="(min-width: 768px)" srcset={desktopImage} type="image/webp" />
						<img
							alt={pkg.name}
							class="w-full h-full object-cover opacity-90"
							src={desktopImage}
							loading="lazy"
							decoding="async"
							width="800"
							height="380"
						/>
					</picture>
					<div class="absolute inset-0 bg-gradient-to-t from-background/60 to-transparent pointer-events-none"></div>
				</div>
			{/if}

			<!-- Includes -->
			<div class="glass-panel rounded-xl p-8 relative overflow-hidden">
				<div class="absolute -bottom-20 -right-20 w-48 h-48 bg-electric-blue/5 rounded-full blur-3xl pointer-events-none"></div>
				<h2 class="font-headline-md text-headline-md text-on-surface mb-6 border-b border-border-glass pb-4">
					{landing.includesLabel[i18n.lang]}
				</h2>
				<ul class="space-y-4">
					{#each pkg.includes[i18n.lang] as item}
						<li class="flex items-start gap-3">
							<Icon name="check_circle" size="20" className="text-electric-blue mt-0.5 shrink-0" />
							<span class="font-body-md text-body-md text-on-surface-variant leading-relaxed">{item}</span>
						</li>
					{/each}
				</ul>

				{#if pkg.optional && landing.optionalLabel}
					<h3 class="font-label-lg text-label-lg text-on-surface uppercase tracking-wider mt-8 mb-4">
						{landing.optionalLabel[i18n.lang]}
					</h3>
					<ul class="space-y-3">
						{#each pkg.optional[i18n.lang] as extra}
							<li class="flex items-center gap-3 p-3 rounded bg-on-surface/5">
								<Icon name="add_circle" size="18" className="text-on-surface-variant" />
								<span class="font-body-md text-body-md text-on-surface">{extra}</span>
							</li>
						{/each}
					</ul>
				{/if}

				{#if landing.note}
					<div class="mt-8 p-4 rounded bg-on-surface/5 border border-border-glass">
						<span class="font-label-md text-on-surface uppercase tracking-wider block mb-1">
							{landing.note.title[i18n.lang]}
						</span>
						<p class="text-sm text-on-surface-variant leading-relaxed">
							{landing.note.body[i18n.lang]}
						</p>
					</div>
				{/if}
			</div>

			<!-- Spec highlight card -->
			<div class="glass-panel rounded-xl p-8">
				<div class="flex items-center gap-3 mb-3">
					{#if landing.highlightIcon}
						<Icon name={landing.highlightIcon} size="28" className="text-electric-blue" />
					{/if}
					<h2 class="font-headline-sm text-headline-sm text-on-surface">
						{landing.highlightTitle[i18n.lang]}
					</h2>
				</div>
				<p class="font-body-md text-body-md text-on-surface-variant leading-relaxed">
					{landing.highlightBody[i18n.lang]}
				</p>
			</div>
		</div>

		<!-- Right col: Lead Form (sticky-ish via top offset) -->
		<div class="lg:col-span-5">
			<div class="sticky top-24">
				<LeadForm packageId={pkg.id} />
			</div>
		</div>
	</div>

	<!-- ─── Testimonials ─────────────────────────────────────────────────── -->
	<div class="w-full mb-16">
		<Testimonials variant="carousel" heading={true} />
	</div>
</div>
