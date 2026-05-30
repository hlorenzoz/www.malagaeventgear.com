<script lang="ts">
	import SeoHead from '$lib/components/seo/SeoHead.svelte';
	import Testimonials from '$lib/components/testimonials/Testimonials.svelte';
	import { i18n } from '$lib/i18n.svelte';
	import { packages } from '$lib/data/packages';
	import { getHomepageFaqs, buildFaqSchema } from '$lib/data/faq';

	// Structured JSON-LD schema for Generative SEO
	const homeSchema = {
		'@context': 'https://schema.org',
		'@type': 'LocalBusiness',
		'name': 'Malaga Event Gear',
		'image': 'https://www.malagaeventgear.com/screen.png',
		'@id': 'https://www.malagaeventgear.com/#organization',
		'url': 'https://www.malagaeventgear.com/',
		'telephone': '+34600428750',
		'priceRange': '$$',
		'address': {
			'@type': 'PostalAddress',
			'streetAddress': 'Av. de Barcelona, 34',
			'addressLocality': 'Malaga',
			'postalCode': '29009',
			'addressCountry': 'ES'
		},
		'geo': {
			'@type': 'GeoCoordinates',
			'latitude': 36.7212,
			'longitude': -4.4217
		},
		'openingHoursSpecification': {
			'@type': 'OpeningHoursSpecification',
			'dayOfWeek': [
				'Monday',
				'Tuesday',
				'Wednesday',
				'Thursday',
				'Friday',
				'Saturday',
				'Sunday'
			],
			'opens': '00:00',
			'closes': '23:59'
		}
	};

	let openFaqIndex = $state<number | null>(null);

	// Top 5 conversion-oriented FAQs, sourced from the centralized FAQ store
	let faqs = $derived(
		getHomepageFaqs().map((item) => ({
			q: item.question[i18n.lang],
			a: item.answer[i18n.lang]
		}))
	);

	let steps = $derived([
		{ num: '01', title: i18n.t.process.s1Title, desc: i18n.t.process.s1Desc, icon: 'package_2' },
		{ num: '02', title: i18n.t.process.s2Title, desc: i18n.t.process.s2Desc, icon: 'request_quote' },
		{ num: '03', title: i18n.t.process.s3Title, desc: i18n.t.process.s3Desc, icon: 'task_alt' },
		{ num: '04', title: i18n.t.process.s4Title, desc: i18n.t.process.s4Desc, icon: 'celebration' }
	]);

	// Per-package visual identity (icon + accent colors) for the showcase cards
	const packMeta: Record<string, { icon: string; iconBg: string; checkIconClass: string }> = {
		eco: { icon: 'eco', iconBg: 'bg-electric-blue/20 text-electric-blue', checkIconClass: 'text-electric-blue' },
		wedding: { icon: 'favorite', iconBg: 'bg-secondary/20 text-secondary', checkIconClass: 'text-secondary' },
		presentation: { icon: 'co_present', iconBg: 'bg-primary/20 text-primary', checkIconClass: 'text-primary' },
		'mice-basic': { icon: 'groups', iconBg: 'bg-electric-blue/20 text-electric-blue', checkIconClass: 'text-electric-blue' },
		'mice-full': { icon: 'business_center', iconBg: 'bg-primary/20 text-primary', checkIconClass: 'text-primary' }
	};

	const fallbackMeta = { icon: 'inventory_2', iconBg: 'bg-primary/20 text-primary', checkIconClass: 'text-primary' };

	// Localized featured packages (full catalog) for the unified pricing carousel
	let homepagePacks = $derived(
		packages.map((pkg) => {
			const meta = packMeta[pkg.id] ?? fallbackMeta;
			return {
				id: pkg.id,
				route: pkg.route,
				name: pkg.name,
				price: pkg.price.toString(),
				desc: pkg.desc[i18n.lang],
				features: pkg.includes[i18n.lang].slice(0, 3), // select first 3 key specs
				icon: meta.icon,
				iconBg: meta.iconBg,
				checkIconClass: meta.checkIconClass,
				popular: pkg.popular,
				borderClass: pkg.popular ? 'border border-primary/30' : ''
			};
		})
	);

	// Carousel state for the pricing showcase — mirrors the Testimonials pattern:
	// native CSS scroll-snap with arrows that reflect overflow and disable at edges.
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
	title="Premium Audiovisual Equipment Rental in Malaga | MEG"
	description="Malaga Event Gear (MEG) offers premium sound system, spectacular lighting, projector, and screen rentals for weddings, corporate events, and parties in Malaga."
	canonicalUrl="https://www.malagaeventgear.com/"
	jsonLdSchema={[homeSchema, buildFaqSchema(getHomepageFaqs())]}
/>

<!-- Hero Section -->
<section class="relative min-h-[90vh] flex items-center justify-center px-margin-mobile md:px-margin-desktop py-24 overflow-hidden">
	<div class="absolute inset-0 z-0">
		<img
			alt="Stage Background with Professional Event Lights"
			class="w-full h-full object-cover opacity-30 dark:opacity-40 transition-opacity duration-300"
			src="/premium_event_stage.png"
			loading="eager"
			fetchpriority="high"
			width="1920"
			height="1080"
		/>
		<div class="absolute inset-0 bg-gradient-to-b from-background/90 via-background/60 to-background transition-colors duration-300"></div>
	</div>
	
	<div class="relative z-10 max-w-container-max mx-auto w-full grid grid-cols-1 lg:grid-cols-2 gap-gutter items-center">
		<div class="space-y-8">
			<span class="inline-block px-4 py-2 rounded-full glass-panel font-label-sm text-primary uppercase tracking-widest">
				{i18n.t.hero.span}
			</span>
			<h1 class="font-display-lg text-[40px] md:text-display-lg text-on-background leading-tight">
				{i18n.t.hero.titlePart1} <br />
				<span class="text-gradient font-bold">{i18n.t.hero.titleGradient}</span> {i18n.t.hero.titlePart2}
			</h1>
			<p class="font-body-lg text-body-lg text-on-surface-variant max-w-xl">
				{i18n.t.hero.subtitle}
			</p>
			<div class="flex flex-wrap gap-4 pt-4">
				<a class="bg-gradient-to-r from-secondary-container to-secondary text-on-secondary px-8 py-4 rounded-full font-label-lg hover:shadow-[0_0_30px_rgba(255,180,164,0.3)] hover:-translate-y-0.5 transition-all active:scale-95 duration-200" href="/packages/">
					{i18n.t.hero.viewPricing}
				</a>
				<a class="glass-panel text-on-surface px-8 py-4 rounded-full font-label-lg hover:bg-on-surface/10 hover:-translate-y-0.5 transition-all flex items-center gap-2 active:scale-95 duration-200" href="/contact/">
					{i18n.t.hero.contactUs} <span class="material-symbols-outlined text-[20px]">arrow_forward</span>
				</a>
			</div>
		</div>

		<!-- Bento Info Cards -->
		<div class="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-12 lg:mt-0">
			<div class="glass-card p-6 rounded-xl ambient-shadow hover:-translate-y-2 transition-transform duration-300 reveal active is-revealed">
				<div class="w-12 h-12 rounded-full bg-electric-blue/20 flex items-center justify-center mb-4">
					<span class="material-symbols-outlined text-electric-blue">build</span>
				</div>
				<h3 class="font-headline-md text-[20px] mb-2 text-on-surface">{i18n.t.bento.card1Title}</h3>
				<p class="font-body-md text-on-surface-variant text-sm">
					{i18n.t.bento.card1Text}
				</p>
			</div>
			
			<div class="glass-card p-6 rounded-xl ambient-shadow sm:translate-y-8 hover:translate-y-6 transition-transform duration-300 reveal active is-revealed">
				<div class="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center mb-4">
					<span class="material-symbols-outlined text-primary">inventory_2</span>
				</div>
				<h3 class="font-headline-md text-[20px] mb-2 text-on-surface">{i18n.t.bento.card2Title}</h3>
				<p class="font-body-md text-on-surface-variant text-sm">
					{i18n.t.bento.card2Text}
				</p>
			</div>
			
			<div class="glass-card p-6 rounded-xl ambient-shadow hover:-translate-y-2 transition-transform duration-300 sm:col-span-2 sm:w-[80%] mx-auto sm:mt-8 reveal active is-revealed">
				<div class="w-12 h-12 rounded-full bg-secondary/20 flex items-center justify-center mb-4">
					<span class="material-symbols-outlined text-secondary">memory</span>
				</div>
				<h3 class="font-headline-md text-[20px] mb-2 text-on-surface">{i18n.t.bento.card3Title}</h3>
				<p class="font-body-md text-on-surface-variant text-sm">
					{i18n.t.bento.card3Text}
				</p>
			</div>
		</div>
	</div>
</section>

<!-- Impact in Numbers Section -->
<section class="py-24 px-margin-mobile md:px-margin-desktop relative border-y border-border-glass bg-surface-container-low transition-colors duration-300">
	<div class="max-w-container-max mx-auto text-center">
		<h2 class="font-headline-lg text-[32px] md:text-headline-lg mb-16 text-on-background">{i18n.t.impact.title}</h2>
		<div class="grid grid-cols-1 md:grid-cols-3 gap-8">
			<div class="glass-card p-8 rounded-xl relative overflow-hidden group reveal active is-revealed">
				<div class="absolute inset-0 bg-gradient-to-br from-electric-blue/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
				<div class="font-display-lg text-display-lg text-gradient mb-2">27+</div>
				<div class="font-label-lg text-on-surface-variant tracking-widest uppercase">{i18n.t.impact.years}</div>
			</div>
			
			<div class="glass-card p-8 rounded-xl relative overflow-hidden group reveal active is-revealed">
				<div class="absolute inset-0 bg-gradient-to-br from-primary/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
				<div class="font-display-lg text-display-lg text-gradient mb-2">2,500+</div>
				<div class="font-label-lg text-on-surface-variant tracking-widest uppercase">{i18n.t.impact.clients}</div>
			</div>
			
			<div class="glass-card p-8 rounded-xl relative overflow-hidden group reveal active is-revealed">
				<div class="absolute inset-0 bg-gradient-to-br from-secondary/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
				<div class="font-display-lg text-display-lg text-gradient mb-2">+95%</div>
				<div class="font-label-lg text-on-surface-variant tracking-widest uppercase">{i18n.t.impact.satisfaction}</div>
			</div>
		</div>
	</div>
</section>

<!-- Testimonials Section (Google Reviews) -->
<Testimonials />

<!-- Services Section (Bento Grid) -->
<section class="py-32 px-margin-mobile md:px-margin-desktop max-w-container-max mx-auto">
	<div class="text-center mb-20">
		<span class="inline-block px-4 py-2 rounded-full glass-panel font-label-sm text-electric-blue uppercase tracking-widest mb-4">
			{i18n.t.categories.badge}
		</span>
		<h2 class="font-headline-lg text-[32px] md:text-headline-lg text-on-background">{i18n.t.categories.title}</h2>
	</div>
	
	<div class="grid grid-cols-1 md:grid-cols-3 gap-6 auto-rows-[300px]">
		<!-- Sound System (Large) -->
		<div class="glass-panel rounded-2xl overflow-hidden relative group md:col-span-2 md:row-span-2 reveal active is-revealed">
			<div class="absolute inset-0 bg-gradient-to-t from-background via-background/40 to-transparent z-10"></div>
			<div 
				class="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?q=80&w=2070&auto=format&fit=crop')] bg-cover bg-center transition-transform duration-700 group-hover:scale-105"
			></div>
			<div class="absolute bottom-0 left-0 p-8 z-20 w-full">
				<div class="w-12 h-12 rounded-full glass-panel flex items-center justify-center mb-4 backdrop-blur-md text-on-surface">
					<span class="material-symbols-outlined">speaker</span>
				</div>
				<h3 class="font-headline-md text-headline-md text-on-surface mb-2">{i18n.t.categories.soundTitle}</h3>
				<p class="font-body-md text-on-surface-variant max-w-md">
					{i18n.t.categories.soundText}
				</p>
			</div>
		</div>

		<!-- Lighting -->
		<div class="glass-panel rounded-2xl overflow-hidden relative group reveal active is-revealed">
			<div class="absolute inset-0 bg-gradient-to-t from-background via-background/50 to-transparent z-10"></div>
			<div 
				class="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1492684223066-81342ee5ff30?q=80&w=2070&auto=format&fit=crop')] bg-cover bg-center transition-transform duration-700 group-hover:scale-105"
			></div>
			<div class="absolute bottom-0 left-0 p-6 z-20 w-full">
				<div class="w-10 h-10 rounded-full glass-panel flex items-center justify-center mb-3 backdrop-blur-md text-on-surface">
					<span class="material-symbols-outlined">lightbulb</span>
				</div>
				<h3 class="font-headline-md text-[24px] text-on-surface mb-1">{i18n.t.categories.lightTitle}</h3>
				<p class="font-body-md text-sm text-on-surface-variant">{i18n.t.categories.lightText}</p>
			</div>
		</div>

		<!-- Visuals/Projectors -->
		<div class="glass-panel rounded-2xl overflow-hidden relative group reveal active is-revealed">
			<div class="absolute inset-0 bg-gradient-to-t from-background via-background/50 to-transparent z-10"></div>
			<div 
				class="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1540575467063-178a50c2df87?q=80&w=2070&auto=format&fit=crop')] bg-cover bg-center transition-transform duration-700 group-hover:scale-105"
			></div>
			<div class="absolute bottom-0 left-0 p-6 z-20 w-full">
				<div class="w-10 h-10 rounded-full glass-panel flex items-center justify-center mb-3 backdrop-blur-md text-on-surface">
					<span class="material-symbols-outlined">videocam</span>
				</div>
				<h3 class="font-headline-md text-[24px] text-on-surface mb-1">{i18n.t.categories.visualTitle}</h3>
				<p class="font-body-md text-sm text-on-surface-variant">{i18n.t.categories.visualText}</p>
			</div>
		</div>

		<!-- Special Effects -->
		<div class="glass-panel rounded-2xl overflow-hidden relative group md:col-span-3 h-[200px] flex items-center px-8 reveal active is-revealed">
			<div class="absolute right-0 top-0 bottom-0 w-1/2 bg-gradient-to-l from-electric-blue/10 to-transparent opacity-50"></div>
			<div class="relative z-20 flex w-full justify-between items-center">
				<div>
					<h3 class="font-headline-md text-headline-md text-on-surface mb-2">{i18n.t.categories.fxTitle}</h3>
					<p class="font-body-md text-on-surface-variant max-w-lg">
						{i18n.t.categories.fxText}
					</p>
				</div>
				<a
					href="/services/"
					class="hidden md:flex w-16 h-16 rounded-full border border-border-glass items-center justify-center hover:bg-on-surface/5 active:scale-90 transition-all duration-300 text-on-surface"
				>
					<span class="material-symbols-outlined text-[32px] group-hover:translate-x-1 transition-transform">arrow_forward</span>
				</a>
			</div>
		</div>
	</div>
</section>

<!-- How It Works Section -->
<section class="py-24 px-margin-mobile md:px-margin-desktop relative border-y border-border-glass bg-surface-container-low transition-colors duration-300">
	<div class="max-w-container-max mx-auto">
		<div class="text-center mb-16">
			<span class="inline-block px-4 py-2 rounded-full glass-panel font-label-sm text-primary uppercase tracking-widest mb-4">
				{i18n.t.process.badge}
			</span>
			<h2 class="font-headline-lg text-[32px] md:text-headline-lg text-on-background">{i18n.t.process.title}</h2>
		</div>

		<div class="grid grid-cols-1 md:grid-cols-4 gap-8 relative">
			<div class="hidden md:block absolute top-8 left-[12.5%] right-[12.5%] h-px bg-gradient-to-r from-transparent via-border-glass to-transparent"></div>
			{#each steps as step, i}
				<div class="flex flex-col items-center text-center reveal active is-revealed" style="transition-delay: {i * 0.1}s">
					<div class="w-16 h-16 rounded-full glass-panel flex items-center justify-center mb-4 relative z-10 border border-border-glass">
						<span class="material-symbols-outlined text-electric-blue">{step.icon}</span>
					</div>
					<div class="font-bold text-[40px] text-gradient opacity-30 mb-2 leading-none">{step.num}</div>
					<h3 class="font-headline-sm text-[18px] text-on-surface mb-2">{step.title}</h3>
					<p class="font-body-md text-sm text-on-surface-variant">{step.desc}</p>
				</div>
			{/each}
		</div>
	</div>
</section>

<!-- Pricing Preview Section -->
<section class="py-32 px-margin-mobile md:px-margin-desktop relative border-b border-border-glass bg-surface-container-low transition-colors duration-300">
	<div class="max-w-container-max mx-auto">
		<div class="text-center mb-16">
			<span class="inline-block px-4 py-2 rounded-full glass-panel font-label-sm text-electric-blue uppercase tracking-widest mb-4">
				{i18n.t.pricingPreview.badge}
			</span>
			<h2 class="font-headline-lg text-[32px] md:text-headline-lg text-on-background mb-4">{i18n.t.pricingPreview.title}</h2>
			<p class="font-body-lg text-on-surface-variant max-w-lg mx-auto">{i18n.t.pricingPreview.subtitle}</p>
		</div>

		<div class="relative mb-12">
			<div
				bind:this={track}
				data-testid="packages-carousel-track"
				class="flex gap-6 overflow-x-auto snap-x snap-mandatory scroll-smooth pb-4 -mx-2 px-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden {scrollable ? '' : 'justify-center'}"
			>
				{#each homepagePacks as pack (pack.id)}
					<div
						data-testid="package-card"
						class="snap-start shrink-0 w-[320px] sm:w-[360px] glass-card p-8 rounded-2xl ambient-shadow reveal active is-revealed flex flex-col relative overflow-hidden {pack.borderClass}"
					>
						{#if pack.popular}
							<div class="absolute top-4 right-4">
								<span class="px-3 py-1 rounded-full bg-primary/20 text-primary font-label-sm text-[11px] uppercase tracking-widest">
									{i18n.t.pricing.mostPopular}
								</span>
							</div>
						{/if}
						<div class="w-12 h-12 rounded-full flex items-center justify-center mb-6 {pack.iconBg}">
							<span class="material-symbols-outlined">{pack.icon}</span>
						</div>
						<h3 class="font-headline-md text-[22px] text-on-surface mb-1 hover:text-electric-blue transition-colors">
							<a href={pack.route}>{pack.name}</a>
						</h3>
						<div class="text-[28px] font-bold mb-4 {pack.popular ? '' : 'text-on-surface'}">
							{#if pack.popular}
								<span class="text-gradient">{pack.price} €</span>
							{:else}
								<span>{pack.price} €</span>
							{/if}
							<span class="font-body-sm text-sm text-on-surface-variant">{i18n.t.pricing.plusVat}</span>
						</div>
						<p class="font-body-md text-on-surface-variant text-sm mb-6">{pack.desc}</p>
						<ul class="space-y-2 mb-8 flex-1">
							{#each pack.features as feature}
								<li class="flex items-center gap-2 text-sm text-on-surface-variant font-body-md">
									<span class="material-symbols-outlined text-[18px] {pack.checkIconClass}">check</span>
									{feature}
								</li>
							{/each}
						</ul>
						<a href={pack.route} class="glass-panel text-on-surface px-6 py-3 rounded-full font-label-lg text-center hover:bg-on-surface/10 hover:-translate-y-0.5 transition-all active:scale-95 duration-200">
							{i18n.t.packages.enquire}
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

		<div class="text-center">
			<a href="/packages/" class="inline-flex items-center gap-2 bg-gradient-to-r from-electric-blue to-primary-container text-white px-10 py-4 rounded-full font-label-lg hover:shadow-[0_0_30px_rgba(77,140,255,0.3)] hover:-translate-y-0.5 transition-all active:scale-95 duration-200">
				{i18n.t.pricingPreview.viewAll}
				<span class="material-symbols-outlined text-[20px]">arrow_forward</span>
			</a>
		</div>
	</div>
</section>

<!-- FAQ Section -->
<section class="py-24 px-margin-mobile md:px-margin-desktop bg-surface-container-low transition-colors duration-300">
	<div class="max-w-4xl mx-auto">
		<div class="text-center mb-16">
			<span class="inline-block px-4 py-2 rounded-full glass-panel font-label-sm text-primary uppercase tracking-widest mb-4">
				{i18n.t.faq.badge}
			</span>
			<h2 class="font-headline-lg text-[32px] md:text-headline-lg text-on-background">{i18n.t.faq.title}</h2>
		</div>

		<div class="space-y-4">
			{#each faqs as faq, i}
				{@const isOpen = openFaqIndex === i}
				<div class="glass-panel rounded-xl overflow-hidden transition-colors duration-300">
					<button
						onclick={() => openFaqIndex = openFaqIndex === i ? null : i}
						class="w-full px-6 py-5 flex justify-between items-center text-left hover:bg-white/5 transition-colors group"
						aria-expanded={isOpen}
					>
						<span class="font-body-lg text-body-lg font-semibold group-hover:text-electric-blue transition-colors text-on-surface">
							{faq.q}
						</span>
						<span class="material-symbols-outlined text-on-surface-variant transition-transform duration-300 {isOpen ? 'rotate-180' : ''}">
							{#if isOpen}remove{:else}add{/if}
						</span>
					</button>
					{#if isOpen}
						<div class="px-6 pb-5 text-on-surface-variant font-body-md text-body-md border-t border-border-glass/30 pt-3">
							<p>{faq.a}</p>
						</div>
					{/if}
				</div>
			{/each}
		</div>

		<div class="text-center mt-12">
			<p class="text-on-surface-variant font-body-md mb-4">
				{i18n.lang === 'en' ? 'Have more questions?' : '¿Tenés más preguntas?'}
			</p>
			<div class="flex flex-wrap items-center justify-center gap-4">
				<a href="/faq/" class="inline-flex items-center gap-2 bg-gradient-to-r from-electric-blue to-primary-container text-white px-8 py-3 rounded-full font-label-lg hover:shadow-[0_0_30px_rgba(77,140,255,0.3)] hover:-translate-y-0.5 transition-all active:scale-95 duration-200">
					{i18n.lang === 'en' ? 'See all FAQs' : 'Ver todas las preguntas frecuentes'}
					<span class="material-symbols-outlined text-[20px]">arrow_forward</span>
				</a>
				<a href="/contact/" class="glass-panel text-on-surface px-8 py-3 rounded-full font-label-lg hover:bg-on-surface/10 hover:-translate-y-0.5 transition-all active:scale-95 duration-200">
					{i18n.t.contact.title}
				</a>
			</div>
		</div>
	</div>
</section>
