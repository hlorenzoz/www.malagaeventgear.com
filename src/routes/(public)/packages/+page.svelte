<script lang="ts">
	import SeoHead from '$lib/components/seo/SeoHead.svelte';
	import { i18n } from '$lib/i18n.svelte';
	import { packages } from '$lib/data/packages';

	import { buildItemListSchema } from '$lib/utils/schema';

	// Esquema estructurado ItemList de paquetes de servicios (SEO Generativo)
	let pricingSchema = $derived(
		buildItemListSchema(
			packages.map((pkg) => ({
				name: pkg.name,
				url: pkg.route
			})),
			'Audiovisual Rental Packages - Malaga Event Gear'
		)
	);

	// Per-package visual identity (icon + accent) for the carousel cards
	const packMeta: Record<string, { icon: string; iconBg: string }> = {
		eco: { icon: 'eco', iconBg: 'bg-electric-blue/20 text-electric-blue' },
		wedding: { icon: 'favorite', iconBg: 'bg-secondary/20 text-secondary' },
		presentation: { icon: 'co_present', iconBg: 'bg-primary/20 text-primary' },
		'mice-basic': { icon: 'groups', iconBg: 'bg-electric-blue/20 text-electric-blue' },
		'mice-full': { icon: 'business_center', iconBg: 'bg-primary/20 text-primary' }
	};
	const fallbackMeta = { icon: 'inventory_2', iconBg: 'bg-primary/20 text-primary' };

	// Localized plan specifications computed from the centralized packages data store
	let plans = $derived(
		packages.map((pkg) => ({
			id: pkg.id,
			route: pkg.route,
			name: pkg.name,
			price: pkg.price.toFixed(2),
			desc: pkg.desc[i18n.lang],
			includes: pkg.includes[i18n.lang],
			optional: pkg.optional ? pkg.optional[i18n.lang] : undefined,
			popular: pkg.popular,
			...(packMeta[pkg.id] ?? fallbackMeta)
		}))
	);

	// Carousel state — mirrors the homepage/Testimonials pattern: native CSS scroll-snap
	// with arrows that reflect overflow and disable at the edges.
	let track = $state<HTMLDivElement | null>(null);
	let scrollable = $state(false);
	let atStart = $state(true);
	let atEnd = $state(false);

	function updateScrollState() {
		if (!track) return;
		const max = track.scrollWidth - track.clientWidth;
		scrollable = max > 1;
		atStart = track.scrollLeft <= 1;
		atEnd = track.scrollLeft >= max - 1;
	}

	function scrollByCard(direction: 1 | -1) {
		if (!track) return;
		const card = track.querySelector<HTMLElement>('[data-testid="package-card"]');
		const amount = card ? card.offsetWidth + 24 : track.clientWidth * 0.8;
		track.scrollBy({ left: amount * direction, behavior: 'smooth' });
	}

	$effect(() => {
		if (!track) return;
		updateScrollState();
		const el = track;
		el.addEventListener('scroll', updateScrollState, { passive: true });
		const ro = new ResizeObserver(updateScrollState);
		ro.observe(el);
		return () => {
			el.removeEventListener('scroll', updateScrollState);
			ro.disconnect();
		};
	});
</script>

<!-- SEO Head & JSON-LD Injection -->
<SeoHead
	title="Rates & Tailored Rental Packages | MEG"
	description="Discover our transparent rates and tailored sound, lighting, and screen rental packages in Malaga. Perfect options for weddings, corporate events, and parties."
	canonicalUrl="https://www.malagaeventgear.com/packages"
	jsonLdSchema={pricingSchema}
/>

<!-- Header Section -->
<header class="text-center mb-16 relative max-w-container-max mx-auto px-margin-mobile pt-16">
	<!-- Ambient glow -->
	<div class="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-electric-blue/10 rounded-full blur-[100px] opacity-20 pointer-events-none"></div>

	<span class="font-label-lg text-electric-blue uppercase tracking-[0.2em] mb-4 block">
		{i18n.t.pricing.badge}
	</span>
	<h1 class="font-headline-lg-mobile md:font-headline-lg text-headline-lg-mobile md:text-headline-lg text-primary mb-6 leading-tight">
		{i18n.t.pricing.title}
	</h1>
	<p class="font-body-lg text-body-lg text-on-surface-variant max-w-2xl mx-auto">
		{i18n.t.pricing.subtitle}
	</p>
</header>

<!-- Packages Carousel -->
<div class="relative max-w-container-max mx-auto px-margin-mobile pb-24">
	<div
		bind:this={track}
		data-testid="packages-carousel-track"
		class="flex gap-6 overflow-x-auto snap-x snap-mandatory scroll-smooth pb-4 -mx-2 px-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden {scrollable ? '' : 'justify-center'}"
	>
		{#each plans as plan (plan.id)}
			<div
				data-testid="package-card"
				class="snap-start shrink-0 w-[320px] sm:w-[380px] glass-card rounded-2xl p-8 flex flex-col ambient-shadow reveal active is-revealed relative overflow-hidden {plan.popular
					? 'border-2 border-electric-blue shadow-2xl shadow-electric-blue/10'
					: ''}"
			>
				{#if plan.popular}
					<div class="absolute top-0 right-0 bg-electric-blue text-white px-4 py-1 rounded-bl-lg font-label-sm tracking-wider uppercase">
						{i18n.t.pricing.mostPopular}
					</div>
				{/if}
				<div class="w-12 h-12 rounded-full flex items-center justify-center mb-6 {plan.iconBg}">
					<span class="material-symbols-outlined">{plan.icon}</span>
				</div>
				<h2 class="font-headline-md text-headline-md text-on-background mb-2 hover:text-electric-blue transition-colors">
					<a href={plan.route}>{plan.name}</a>
				</h2>
				<p class="font-body-md text-body-md text-on-surface-variant mb-6 min-h-[48px]">
					{plan.desc}
				</p>
				<div class="mb-8">
					<span class="font-display-lg text-[48px] font-bold text-electric-blue">{plan.price} €</span>
					<span class="text-on-surface-variant text-sm block mt-1">{i18n.t.pricing.plusVat}</span>
				</div>
				<div class="flex-grow">
					<h3 class="font-label-lg text-label-lg text-primary mb-4 border-b border-border-glass pb-2">
						{i18n.t.pricing.includes}
					</h3>
					<ul class="space-y-3 mb-6">
						{#each plan.includes as inc}
							<li class="flex items-start">
								<span class="material-symbols-outlined text-electric-blue mr-2 text-sm mt-1">check_circle</span>
								<span class="text-on-surface text-sm">{inc}</span>
							</li>
						{/each}
					</ul>

					{#if plan.optional}
						<h3 class="font-label-lg text-label-lg text-on-surface mb-4 border-b border-border-glass pb-2">
							{i18n.t.pricing.optional}
						</h3>
						<ul class="space-y-3">
							{#each plan.optional as opt}
								<li class="flex items-start">
									<span class="material-symbols-outlined text-on-surface-variant mr-2 text-sm mt-1">add</span>
									<span class="text-on-surface-variant text-sm">{opt}</span>
								</li>
							{/each}
						</ul>
					{/if}
				</div>
				<a
					class="mt-8 w-full block text-center py-3 rounded-full bg-gradient-to-r from-electric-blue to-primary-container text-white font-label-lg hover:shadow-lg active:scale-95 transition-all duration-300"
					href="/contact-us/?pack={plan.id}"
				>
					{i18n.t.pricing.bookPack} {plan.name}
				</a>
			</div>
		{/each}
	</div>

	<!-- Nav arrows only appear when the track actually overflows -->
	{#if scrollable}
		<div class="flex justify-center gap-3 mt-6">
			<button
				data-testid="packages-carousel-prev"
				type="button"
				aria-label={i18n.t.testimonials.prevAria}
				disabled={atStart}
				onclick={() => scrollByCard(-1)}
				class="w-11 h-11 rounded-full glass-panel border border-border-glass flex items-center justify-center text-on-surface hover:bg-on-surface/10 active:scale-90 transition-all duration-200 focus-visible:outline-2 focus-visible:outline-electric-blue disabled:opacity-30 disabled:pointer-events-none"
			>
				<span class="material-symbols-outlined">chevron_left</span>
			</button>
			<button
				data-testid="packages-carousel-next"
				type="button"
				aria-label={i18n.t.testimonials.nextAria}
				disabled={atEnd}
				onclick={() => scrollByCard(1)}
				class="w-11 h-11 rounded-full glass-panel border border-border-glass flex items-center justify-center text-on-surface hover:bg-on-surface/10 active:scale-90 transition-all duration-200 focus-visible:outline-2 focus-visible:outline-electric-blue disabled:opacity-30 disabled:pointer-events-none"
			>
				<span class="material-symbols-outlined">chevron_right</span>
			</button>
		</div>
	{/if}
</div>
