<script lang="ts">
	import SeoHead from '$lib/components/seo/SeoHead.svelte';

	// Structured JSON-LD schema of product/service offers for Generative SEO
	const pricingSchema = {
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
			'offers': [
				{
					'@type': 'Offer',
					'name': 'Eco Pack',
					'price': '290.00',
					'priceCurrency': 'EUR',
					'priceSpecification': {
						'@type': 'UnitPriceSpecification',
						'priceType': 'http://purl.org/goodrelations/v1#ListPrice',
						'price': '290.00',
						'priceCurrency': 'EUR',
						'valueAddedTaxIncluded': 'false'
					}
				},
				{
					'@type': 'Offer',
					'name': 'Wedding Pack',
					'price': '650.00',
					'priceCurrency': 'EUR',
					'priceSpecification': {
						'@type': 'UnitPriceSpecification',
						'priceType': 'http://purl.org/goodrelations/v1#ListPrice',
						'price': '650.00',
						'priceCurrency': 'EUR',
						'valueAddedTaxIncluded': 'false'
					}
				},
				{
					'@type': 'Offer',
					'name': 'Full MICE Pack',
					'price': '490.00',
					'priceCurrency': 'EUR',
					'priceSpecification': {
						'@type': 'UnitPriceSpecification',
						'priceType': 'http://purl.org/goodrelations/v1#ListPrice',
						'price': '490.00',
						'priceCurrency': 'EUR',
						'valueAddedTaxIncluded': 'false'
					}
				}
			]
		}
	};
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
	
	<span class="font-label-lg text-electric-blue uppercase tracking-[0.2em] mb-4 block">Transparent Pricing</span>
	<h1 class="font-headline-lg-mobile md:font-headline-lg text-headline-lg-mobile md:text-headline-lg text-primary mb-6">
		Tailored Packages for Every Event
	</h1>
	<p class="font-body-lg text-body-lg text-on-surface-variant max-w-2xl mx-auto">
		Choose from our flexible rental packages designed to perfectly fit any event size and budget. We make planning simple!
	</p>
</header>

<!-- Pricing Bento Grid -->
<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-gutter max-w-container-max mx-auto px-margin-mobile">
	<!-- Eco Pack -->
	<div class="glass-card reveal-card rounded-xl p-8 flex flex-col hover:bg-white/10 transition-all duration-300">
		<div class="mb-6">
			<h3 class="font-headline-md text-headline-md text-on-background mb-2">Eco Pack</h3>
			<p class="font-body-md text-body-md text-on-surface-variant min-h-[48px]">
				Ideal for private parties or small events of up to 50 people. Includes basic sound and lighting setups.
			</p>
		</div>
		<div class="mb-8">
			<span class="font-display-lg text-[48px] font-bold text-electric-blue">290.00 €</span>
			<span class="text-on-surface-variant text-sm block mt-1">(+21% VAT)</span>
		</div>
		<div class="flex-grow">
			<h4 class="font-label-lg text-label-lg text-primary mb-4 border-b border-border-glass pb-2">Includes:</h4>
			<ul class="space-y-3 mb-6">
				<li class="flex items-start">
					<span class="material-symbols-outlined text-electric-blue mr-2 text-sm mt-1">check_circle</span>
					<span class="text-on-surface">2 High-quality active speakers</span>
				</li>
				<li class="flex items-start">
					<span class="material-symbols-outlined text-electric-blue mr-2 text-sm mt-1">check_circle</span>
					<span class="text-on-surface">1 Wired microphone</span>
				</li>
				<li class="flex items-start">
					<span class="material-symbols-outlined text-electric-blue mr-2 text-sm mt-1">check_circle</span>
					<span class="text-on-surface">2 Light bars with RGBW LED spotlights</span>
				</li>
			</ul>
			
			<h4 class="font-label-lg text-label-lg text-on-surface mb-4 border-b border-border-glass pb-2">Optional:</h4>
			<ul class="space-y-3">
				<li class="flex items-start">
					<span class="material-symbols-outlined text-on-surface-variant mr-2 text-sm mt-1">add</span>
					<span class="text-on-surface-variant text-sm">Projector & screen (+50€)</span>
				</li>
				<li class="flex items-start">
					<span class="material-symbols-outlined text-on-surface-variant mr-2 text-sm mt-1">add</span>
					<span class="text-on-surface-variant text-sm">Fog machine (+20€)</span>
				</li>
			</ul>
		</div>
		<a 
			class="mt-8 w-full block text-center py-3 rounded border border-border-glass bg-white/5 hover:bg-white/10 text-on-surface font-label-lg active:scale-98 transition-all" 
			href="/contact?pack=eco"
		>
			Check Availability
		</a>
	</div>

	<!-- Wedding Pack (Most Popular) -->
	<div class="glass-card reveal-card-featured rounded-xl p-8 flex flex-col glow-effect border-electric-blue relative lg:col-span-1 lg:row-span-2 overflow-hidden">
		<div class="absolute top-0 right-0 bg-electric-blue text-white px-4 py-1 rounded-bl-lg font-label-sm tracking-wider uppercase">
			Most Popular
		</div>
		<!-- Embedded Image for Wedding Pack -->
		<div class="w-full h-48 rounded-lg overflow-hidden mb-6 relative">
			<img 
				alt="Spectacular wedding decoration with premium lighting" 
				class="object-cover w-full h-full transform hover:scale-105 transition-transform duration-500" 
				src="https://lh3.googleusercontent.com/aida/ADBb0ug5w7wOaGS-ye7h2_G8UyqDbYMZJnFo3n0EKPpcXxJTG8hzJQlSVNraO7x5ypbKYYdJHdo3SlEoMnm1hbLotISEcdS7yUcoRvwRZg2es3rmE9bBP2RrSNpbfBHYcUdgFqF8WFmO7Ir5Rt8jZQJnina2BmPgZFoQkNAY6_lCw3zSHd_rT30euyLl6PHKpYtOedfOVJGP-qnRQ_1xiw2YAefmwjTMiIqaOEN2gciZqGAqf1K1kEvrX8MD"
				loading="lazy"
				decoding="async"
				width="600"
				height="400"
			/>
			<div class="absolute inset-0 bg-gradient-to-t from-background/80 to-transparent"></div>
		</div>
		<div class="mb-6 relative z-10">
			<h3 class="font-headline-md text-headline-md text-on-background mb-2">Wedding Pack</h3>
			<p class="font-body-md text-body-md text-on-surface-variant">
				Designed to perfection for magical and unforgettable celebrations. Includes a professional high-end acoustic system for up to 80 guests, romantic ambient lighting, and wireless microphones for moving speeches.
			</p>
		</div>
		<div class="mb-8 relative z-10">
			<span class="font-display-lg text-[56px] font-bold text-electric-blue">650.00 €</span>
			<span class="text-on-surface-variant text-sm block mt-1">(+21% VAT)</span>
		</div>
		<div class="flex-grow relative z-10">
			<h4 class="font-label-lg text-label-lg text-primary mb-4 border-b border-border-glass pb-2">Included Services:</h4>
			<ul class="space-y-4 mb-6">
				<li class="flex items-center p-2 rounded bg-white/5 gap-3">
					<span class="material-symbols-outlined text-electric-blue">local_shipping</span>
					<span class="text-on-surface">Transport in Malaga and surrounding areas</span>
				</li>
				<li class="flex items-center p-2 rounded bg-white/5 gap-3">
					<span class="material-symbols-outlined text-electric-blue">build</span>
					<span class="text-on-surface">Professional setup and aesthetic cabling</span>
				</li>
				<li class="flex items-center p-2 rounded bg-white/5 gap-3">
					<span class="material-symbols-outlined text-electric-blue">support_agent</span>
					<span class="text-on-surface">Live technical assistance and control</span>
				</li>
				<li class="flex items-center p-2 rounded bg-white/5 gap-3">
					<span class="material-symbols-outlined text-electric-blue">inventory_2</span>
					<span class="text-on-surface">Quick teardown post-event</span>
				</li>
			</ul>
		</div>
		<a 
			class="mt-8 w-full block text-center py-4 rounded-full bg-gradient-to-r from-secondary-container to-on-secondary-fixed-variant text-white font-label-lg hover:shadow-lg active:scale-95 transition-all duration-300" 
			href="/contact?pack=wedding"
		>
			Book Wedding Pack
		</a>
	</div>

	<!-- Presentation Pack -->
	<div class="glass-card reveal-card rounded-xl p-8 flex flex-col hover:bg-white/10 transition-all duration-300">
		<div class="mb-6">
			<h3 class="font-headline-md text-headline-md text-on-background mb-2">Presentation Pack</h3>
			<p class="font-body-md text-body-md text-on-surface-variant min-h-[48px]">
				Designed for presentations with high visual impact. Includes high-brightness projector, proper screen format, and sound reinforcement.
			</p>
		</div>
		<div class="mb-8">
			<span class="font-display-lg text-[48px] font-bold text-electric-blue">310.00 €</span>
			<span class="text-on-surface-variant text-sm block mt-1">(+21% VAT)</span>
		</div>
		<div class="flex-grow">
			<h4 class="font-label-lg text-label-lg text-primary mb-4 border-b border-border-glass pb-2">Includes:</h4>
			<ul class="space-y-3">
				<li class="flex items-start">
					<span class="material-symbols-outlined text-electric-blue mr-2 text-sm mt-1">check_circle</span>
					<span class="text-on-surface">1 Front projection screen</span>
				</li>
				<li class="flex items-start">
					<span class="material-symbols-outlined text-electric-blue mr-2 text-sm mt-1">check_circle</span>
					<span class="text-on-surface">1 HD Projector (5000 lumens)</span>
				</li>
				<li class="flex items-start">
					<span class="material-symbols-outlined text-electric-blue mr-2 text-sm mt-1">check_circle</span>
					<span class="text-on-surface">Venue sound system & speakers</span>
				</li>
				<li class="flex items-start">
					<span class="material-symbols-outlined text-electric-blue mr-2 text-sm mt-1">check_circle</span>
					<span class="text-on-surface">1 Wireless handheld microphone</span>
				</li>
			</ul>
		</div>
		<a 
			class="mt-8 w-full block text-center py-3 rounded border border-border-glass bg-white/5 hover:bg-white/10 text-on-surface font-label-lg active:scale-98 transition-all" 
			href="/contact?pack=presentation"
		>
			Check Availability
		</a>
	</div>

	<!-- Basic MICE Pack -->
	<div class="glass-card reveal-card rounded-xl p-8 flex flex-col hover:bg-white/10 transition-all duration-300">
		<div class="mb-6">
			<h3 class="font-headline-md text-headline-md text-on-background mb-2">Basic MICE</h3>
			<p class="font-body-md text-body-md text-on-surface-variant min-h-[48px]">
				Essential setup for small events and speeches, featuring projection, microfonía, and professional setup.
			</p>
		</div>
		<div class="mb-8">
			<span class="font-display-lg text-[48px] font-bold text-electric-blue">295.00 €</span>
			<span class="text-on-surface-variant text-sm block mt-1">(+21% VAT)</span>
		</div>
		<div class="flex-grow">
			<h4 class="font-label-lg text-label-lg text-primary mb-4 border-b border-border-glass pb-2">Includes:</h4>
			<ul class="space-y-3 mb-6">
				<li class="flex items-start">
					<span class="material-symbols-outlined text-electric-blue mr-2 text-sm mt-1">check_circle</span>
					<span class="text-on-surface">2x2m Screen with 3000 lm projector</span>
				</li>
				<li class="flex items-start">
					<span class="material-symbols-outlined text-electric-blue mr-2 text-sm mt-1">check_circle</span>
					<span class="text-on-surface">Basic sound system for up to 40 people</span>
				</li>
				<li class="flex items-start">
					<span class="material-symbols-outlined text-electric-blue mr-2 text-sm mt-1">check_circle</span>
					<span class="text-on-surface">1 Gooseneck microphone</span>
				</li>
			</ul>
			
			<h4 class="font-label-lg text-label-lg text-on-surface mb-4 border-b border-border-glass pb-2">Optional:</h4>
			<ul class="space-y-3">
				<li class="flex items-start">
					<span class="material-symbols-outlined text-on-surface-variant mr-2 text-sm mt-1">add</span>
					<span class="text-on-surface-variant text-sm">On-site technical support (+240€/day)</span>
				</li>
			</ul>
		</div>
		<a 
			class="mt-8 w-full block text-center py-3 rounded border border-border-glass bg-white/5 hover:bg-white/10 text-on-surface font-label-lg active:scale-98 transition-all" 
			href="/contact?pack=mice-basic"
		>
			Check Availability
		</a>
	</div>

	<!-- Full MICE Pack -->
	<div class="glass-card reveal-card rounded-xl p-8 flex flex-col hover:bg-white/10 transition-all duration-300">
		<div class="mb-6">
			<h3 class="font-headline-md text-headline-md text-on-background mb-2">Full MICE</h3>
			<p class="font-body-md text-body-md text-on-surface-variant min-h-[48px]">
				Comprehensive corporate package featuring a large-format display, premium sound, microphone setup, and a dedicated live technical assistant.
			</p>
		</div>
		<div class="mb-8">
			<span class="font-display-lg text-[48px] font-bold text-electric-blue">490.00 €</span>
			<span class="text-on-surface-variant text-sm block mt-1">(+21% VAT)</span>
		</div>
		<div class="flex-grow">
			<h4 class="font-label-lg text-label-lg text-primary mb-4 border-b border-border-glass pb-2">Includes:</h4>
			<ul class="space-y-3 mb-6">
				<li class="flex items-start">
					<span class="material-symbols-outlined text-electric-blue mr-2 text-sm mt-1">check_circle</span>
					<span class="text-on-surface">Premium 60-inch LED screen</span>
				</li>
				<li class="flex items-start">
					<span class="material-symbols-outlined text-electric-blue mr-2 text-sm mt-1">check_circle</span>
					<span class="text-on-surface">Venue sound system & professional speakers</span>
				</li>
				<li class="flex items-start">
					<span class="material-symbols-outlined text-electric-blue mr-2 text-sm mt-1">check_circle</span>
					<span class="text-on-surface">1 Gooseneck mic & 1 wireless handheld mic</span>
				</li>
				<li class="flex items-start">
					<span class="material-symbols-outlined text-electric-blue mr-2 text-sm mt-1">check_circle</span>
					<span class="text-on-surface">1 Specialized technician (max 6 hours)</span>
				</li>
			</ul>
			
			<h4 class="font-label-lg text-label-lg text-on-surface mb-4 border-b border-border-glass pb-2">Optional:</h4>
			<ul class="space-y-3">
				<li class="flex items-start">
					<span class="material-symbols-outlined text-on-surface-variant mr-2 text-sm mt-1">add</span>
					<span class="text-on-surface-variant text-sm">Extra technical support hour (+40€/h)</span>
				</li>
				<li class="flex items-start">
					<span class="material-symbols-outlined text-on-surface-variant mr-2 text-sm mt-1">add</span>
					<span class="text-on-surface-variant text-sm">Premium acrylic podium (+50€)</span>
				</li>
				<li class="flex items-start">
					<span class="material-symbols-outlined text-on-surface-variant mr-2 text-sm mt-1">add</span>
					<span class="text-on-surface-variant text-sm">Stage platforms (+35€/m²)</span>
				</li>
			</ul>
		</div>
		<a 
			class="mt-8 w-full block text-center py-3 rounded border border-border-glass bg-white/5 hover:bg-white/10 text-on-surface font-label-lg active:scale-98 transition-all" 
			href="/contact?pack=mice-full"
		>
			Check Availability
		</a>
	</div>
</div>
