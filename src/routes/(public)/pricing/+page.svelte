<script lang="ts">
	import SeoHead from '$lib/components/seo/SeoHead.svelte';
	import { i18n } from '$lib/i18n.svelte';
	import { packages } from '$lib/data/packages';

	// Structured JSON-LD schema of product/service offers for Generative SEO
	let pricingSchema = $derived({
		'@context': 'https://schema.org',
		'@type': 'Product',
		'name': 'Audiovisual Rental Packages - Malaga Event Gear',
		'description': 'Tailored packages for sound, lighting, and projection for events in Malaga. Options for weddings, conferences, and parties.',
		'image': 'https://www.malagaeventgear.com/screen.png',
		'offers': {
			'@type': 'AggregateOffer',
			'priceCurrency': 'EUR',
			'lowPrice': '290.00',
			'highPrice': '650.00',
			'offerCount': '5',
			'offers': packages.map((pkg) => ({
				'@type': 'Offer',
				'name': pkg.name,
				'price': pkg.price.toFixed(2),
				'priceCurrency': 'EUR',
				'priceSpecification': {
					'@type': 'UnitPriceSpecification',
					'priceType': 'http://purl.org/goodrelations/v1#ListPrice',
					'price': pkg.price.toFixed(2),
					'priceCurrency': 'EUR',
					'valueAddedTaxIncluded': 'false'
				}
			}))
		}
	});

	// Localized plan specifications computed from the centralized packages data store
	let plans = $derived(
		packages.map((pkg) => ({
			id: pkg.id,
			name: pkg.name,
			price: pkg.price.toFixed(2),
			desc: pkg.desc[i18n.lang],
			includes: pkg.includes[i18n.lang],
			optional: pkg.optional ? pkg.optional[i18n.lang] : undefined,
			popular: pkg.popular,
			image: pkg.image
		}))
	);
</script>

<!-- SEO Head & JSON-LD Injection -->
<SeoHead
	title="Rates & Tailored Rental Packages | MEG"
	description="Discover our transparent rates and tailored sound, lighting, and screen rental packages in Malaga. Perfect options for weddings, corporate events, and parties."
	canonicalUrl="https://www.malagaeventgear.com/pricing"
	jsonLdSchema={pricingSchema}
/>

<!-- Header Section -->
<header class="text-center mb-20 relative max-w-container-max mx-auto px-margin-mobile pt-16">
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

<!-- Pricing Bento Grid -->
<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-gutter max-w-container-max mx-auto px-margin-mobile">
	{#each plans as plan}
		{#if plan.popular}
			<!-- Wedding Pack (Most Popular - Featured styling) -->
			<div class="glass-card reveal active is-revealed rounded-xl p-8 flex flex-col border-2 border-electric-blue relative lg:col-span-1 lg:row-span-2 overflow-hidden shadow-2xl shadow-electric-blue/10">
				<div class="absolute top-0 right-0 bg-electric-blue text-white px-4 py-1 rounded-bl-lg font-label-sm tracking-wider uppercase">
					{i18n.t.pricing.mostPopular}
				</div>
				<!-- Embedded Image for Wedding Pack -->
				{#if plan.image}
					<div class="w-full h-48 rounded-lg overflow-hidden mb-6 relative">
						<img 
							alt="Spectacular wedding decoration with premium lighting" 
							class="object-cover w-full h-full transform hover:scale-105 transition-transform duration-500 opacity-90" 
							src={plan.image}
							loading="lazy"
							decoding="async"
							width="600"
							height="400"
						/>
						<div class="absolute inset-0 bg-gradient-to-t from-background/90 to-transparent"></div>
					</div>
				{/if}
				<div class="mb-6 relative z-10">
					<h3 class="font-headline-md text-headline-md text-on-background mb-2">{plan.name}</h3>
					<p class="font-body-md text-body-md text-on-surface-variant">
						{plan.desc}
					</p>
				</div>
				<div class="mb-8 relative z-10">
					<span class="font-display-lg text-[56px] font-bold text-electric-blue">{plan.price} €</span>
					<span class="text-on-surface-variant text-sm block mt-1">{i18n.t.pricing.plusVat}</span>
				</div>
				<div class="flex-grow relative z-10">
					<h4 class="font-label-lg text-label-lg text-primary mb-4 border-b border-border-glass pb-2">{i18n.t.pricing.includedServices}</h4>
					<ul class="space-y-4 mb-6">
						{#each plan.includes as inc}
							<li class="flex items-center p-2 rounded bg-on-surface/5 gap-3">
								<span class="material-symbols-outlined text-electric-blue text-[18px]">check_circle</span>
								<span class="text-on-surface text-sm">{inc}</span>
							</li>
						{/each}
					</ul>
				</div>
				<a 
					class="mt-8 w-full block text-center py-4 rounded-full bg-gradient-to-r from-secondary-container to-secondary text-white font-label-lg hover:shadow-lg active:scale-95 transition-all duration-300" 
					href="/contact?pack={plan.id}"
				>
					{i18n.t.pricing.bookPack} {plan.name}
				</a>
			</div>
		{:else}
			<!-- Eco and other Packs -->
			<div class="glass-card reveal active is-revealed rounded-xl p-8 flex flex-col hover:bg-on-surface/5 transition-all duration-300">
				<div class="mb-6">
					<h3 class="font-headline-md text-headline-md text-on-background mb-2">{plan.name}</h3>
					<p class="font-body-md text-body-md text-on-surface-variant min-h-[48px]">
						{plan.desc}
					</p>
				</div>
				<div class="mb-8">
					<span class="font-display-lg text-[48px] font-bold text-electric-blue">{plan.price} €</span>
					<span class="text-on-surface-variant text-sm block mt-1">{i18n.t.pricing.plusVat}</span>
				</div>
				<div class="flex-grow">
					<h4 class="font-label-lg text-label-lg text-primary mb-4 border-b border-border-glass pb-2">{i18n.t.pricing.includes}</h4>
					<ul class="space-y-3 mb-6">
						{#each plan.includes as inc}
							<li class="flex items-start">
								<span class="material-symbols-outlined text-electric-blue mr-2 text-sm mt-1">check_circle</span>
								<span class="text-on-surface text-sm">{inc}</span>
							</li>
						{/each}
					</ul>
					
					{#if plan.optional}
						<h4 class="font-label-lg text-label-lg text-on-surface mb-4 border-b border-border-glass pb-2">{i18n.t.pricing.optional}</h4>
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
					class="mt-8 w-full block text-center py-3 rounded border border-border-glass bg-on-surface/5 hover:bg-on-surface/10 text-on-surface font-label-lg active:scale-98 transition-all" 
					href="/contact?pack={plan.id}"
				>
					{i18n.t.pricing.check}
				</a>
			</div>
		{/if}
	{/each}
</div>
