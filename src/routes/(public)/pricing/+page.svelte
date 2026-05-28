<script lang="ts">
	import SeoHead from '$lib/components/seo/SeoHead.svelte';
	import { i18n } from '$lib/i18n.svelte';

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
	});

	// Localized plan specifications
	let plans = $derived([
		{
			id: 'eco',
			name: 'Eco Pack',
			price: '290.00',
			desc: i18n.lang === 'en' 
				? 'Ideal for private parties or small events of up to 50 people. Includes basic sound and lighting setups.'
				: 'Ideal para fiestas privadas o eventos pequeños de hasta 50 personas. Incluye configuración básica de sonido e iluminación.',
			includes: i18n.lang === 'en'
				? ['2 High-quality active speakers', '1 Wired microphone', '2 Light bars with RGBW LED spotlights']
				: ['2 Altavoces activos de alta calidad', '1 Micrófono de cable', '2 Barras de luz con focos LED RGBW'],
			optional: i18n.lang === 'en'
				? ['Projector & screen (+50€)', 'Fog machine (+20€)']
				: ['Proyector y pantalla (+50€)', 'Máquina de humo (+20€)']
		},
		{
			id: 'wedding',
			name: 'Wedding Pack',
			price: '650.00',
			desc: i18n.lang === 'en'
				? 'Designed to perfection for magical and unforgettable celebrations. Includes a professional high-end acoustic system for up to 80 guests, romantic ambient lighting, and wireless microphones for moving speeches.'
				: 'Diseñado a la perfección para celebraciones mágicas e inolvidables. Incluye sistema acústico profesional de alta gama para hasta 80 invitados, luces ambientales románticas y micrófonos inalámbricos para discursos emotivos.',
			includes: i18n.lang === 'en'
				? ['Transport in Malaga and surrounding areas', 'Professional setup and aesthetic cabling', 'Live technical assistance and control', 'Quick teardown post-event']
				: ['Transporte en Málaga y áreas cercanas', 'Montaje profesional y cableado estético', 'Asistencia técnica y control en directo', 'Desmontaje rápido post-evento'],
			popular: true,
			image: 'https://lh3.googleusercontent.com/aida/ADBb0ug5w7wOaGS-ye7h2_G8UyqDbYMZJnFo3n0EKPpcXxJTG8hzJQlSVNraO7x5ypbKYYdJHdo3SlEoMnm1hbLotISEcdS7yUcoRvwRZg2es3rmE9bBP2RrSNpbfBHYcUdgFqF8WFmO7Ir5Rt8jZQJnina2BmPgZFoQkNAY6_lCw3zSHd_rT30euyLl6PHKpYtOedfOVJGP-qnRQ_1xiw2YAefmwjTMiIqaOEN2gciZqGAqf1K1kEvrX8MD'
		},
		{
			id: 'presentation',
			name: 'Presentation Pack',
			price: '310.00',
			desc: i18n.lang === 'en'
				? 'Designed for presentations with high visual impact. Includes high-brightness projector, proper screen format, and sound reinforcement.'
				: 'Diseñado para presentaciones con alto impacto visual. Incluye proyector de alto brillo, pantalla de formato adecuado y refuerzo de sonido.',
			includes: i18n.lang === 'en'
				? ['1 Front projection screen', '1 HD Projector (5000 lumens)', 'Venue sound system & speakers', '1 Wireless handheld microphone']
				: ['1 Pantalla de proyección frontal', '1 Proyector HD (5000 lúmenes)', 'Sistema de sonido y altavoces para el lugar', '1 Micrófono inalámbrico de mano']
		},
		{
			id: 'mice-basic',
			name: 'Basic MICE',
			price: '295.00',
			desc: i18n.lang === 'en'
				? 'Essential setup for small events and speeches, featuring projection, microfonía, and professional setup.'
				: 'Configuración esencial para eventos pequeños y discursos, con proyección, microfonía y montaje profesional.',
			includes: i18n.lang === 'en'
				? ['2x2m Screen with 3000 lm projector', 'Basic sound system for up to 40 people', '1 Gooseneck microphone']
				: ['Pantalla de 2x2m con proyector de 3000 lm', 'Sistema de sonido básico para hasta 40 personas', '1 Micrófono de cuello de cisne'],
			optional: i18n.lang === 'en'
				? ['On-site technical support (+240€/day)']
				: ['Soporte técnico en sitio (+240€/día)']
		},
		{
			id: 'mice-full',
			name: 'Full MICE',
			price: '490.00',
			desc: i18n.lang === 'en'
				? 'Comprehensive corporate package featuring a large-format display, premium sound, microphone setup, and a dedicated live technical assistant.'
				: 'Paquete corporativo integral con pantalla de gran formato, sonido premium, configuración de micrófonos y técnico en vivo dedicado.',
			includes: i18n.lang === 'en'
				? ['Premium 60-inch LED screen', 'Venue sound system & professional speakers', '1 Gooseneck mic & 1 wireless handheld mic', '1 Specialized technician (max 6 hours)']
				: ['Pantalla LED premium de 60 pulgadas', 'Sistema de sonido del lugar y altavoces profesionales', '1 Micrófono de cuello de cisne y 1 inalámbrico', '1 Técnico especializado (máximo 6 horas)'],
			optional: i18n.lang === 'en'
				? ['Extra technical support hour (+40€/h)', 'Premium acrylic podium (+50€)', 'Stage platforms (+35€/m²)']
				: ['Hora de soporte técnico extra (+40€/h)', 'Atril de acrílico premium (+50€)', 'Tarimas de escenario (+35€/m²)']
		}
	]);
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
