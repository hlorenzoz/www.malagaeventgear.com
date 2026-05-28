<script lang="ts">
	import SeoHead from '$lib/components/seo/SeoHead.svelte';
	import { i18n } from '$lib/i18n.svelte';
	import { getPackageById } from '$lib/data/packages';

	let pkg = $derived(getPackageById('wedding')!);

	let seoSchema = $derived({
		'@context': 'https://schema.org',
		'@graph': [
			{
				'@type': 'Place',
				'@id': 'https://malagaeventgear.com/#place',
				'address': {
					'@type': 'PostalAddress',
					'streetAddress': 'Avenida de Barcelona, 34',
					'addressRegion': 'Malaga',
					'postalCode': '29009',
					'addressCountry': 'ES',
					'addressLocality': 'Distrito Centro'
				}
			},
			{
				'@type': 'LocalBusiness',
				'@id': 'https://malagaeventgear.com/#organization',
				'name': 'Malaga Event Gear',
				'url': 'https://malagaeventgear.com',
				'email': 'contact@malagaeventgear.com',
				'telephone': '+34 600 42 87 50',
				'priceRange': '290€ - 650€',
				'openingHours': ['Monday,Tuesday,Wednesday,Thursday,Friday,Saturday,Sunday 08:00-20:00'],
				'location': { '@id': 'https://malagaeventgear.com/#place' }
			},
			{
				'@type': 'Service',
				'@id': 'https://malagaeventgear.com/wedding-pack/#service',
				'name': 'Wedding Pack Audio & Lighting Rental Malaga - Malaga Event Gear (MEG)',
				'description': pkg.desc[i18n.lang],
				'serviceType': 'Audio visual wedding celebrations rentals',
				'provider': { '@id': 'https://malagaeventgear.com/#organization' },
				'offers': {
					'@type': 'Offer',
					'price': pkg.price.toFixed(2),
					'priceCurrency': 'EUR',
					'priceSpecification': {
						'@type': 'UnitPriceSpecification',
						'priceType': 'http://purl.org/goodrelations/v1#ListPrice',
						'price': pkg.price.toFixed(2),
						'priceCurrency': 'EUR',
						'valueAddedTaxIncluded': 'false'
					}
				}
			}
		]
	});
</script>

<SeoHead
	title={i18n.lang === 'en' ? 'Wedding Pack Sound & Romantic Lighting | Malaga Event Gear' : 'Pack Bodas Sonido e Iluminación Romántica | Malaga Event Gear'}
	description={pkg.desc[i18n.lang]}
	canonicalUrl="https://malagaeventgear.com/wedding-pack"
	jsonLdSchema={seoSchema}
/>

<div class="relative w-full py-20 px-margin-mobile md:px-margin-desktop z-10 max-w-container-max mx-auto">
	<!-- Hero Header -->
	<div class="text-center mb-16 reveal active is-revealed">
		<span class="inline-block px-4 py-2 rounded-full glass-panel font-label-sm text-electric-blue uppercase tracking-widest mb-4">
			{i18n.lang === 'en' ? 'Our Most Popular Celebration Pack' : 'Nuestro Pack de Celebración Más Elegido'}
		</span>
		<h1 class="font-headline-lg-mobile md:font-headline-lg text-headline-lg-mobile md:text-headline-lg mb-6 text-on-background">
			{pkg.name}
		</h1>
		<p class="font-body-lg text-body-lg text-on-surface-variant max-w-3xl mx-auto leading-relaxed">
			{pkg.desc[i18n.lang]}
		</p>
	</div>

	<!-- Bento Details Layout -->
	<div class="grid grid-cols-1 lg:grid-cols-12 gap-gutter items-stretch mb-20">
		<!-- Pricing & Capacity Card -->
		<div class="lg:col-span-5 flex flex-col gap-6">
			<!-- Glowing Price Card -->
			<div class="glass-panel rounded-xl p-8 flex flex-col justify-between relative overflow-hidden shadow-2xl border-2 border-electric-blue/30">
				<div class="absolute top-0 right-0 bg-electric-blue text-white px-4 py-1 rounded-bl-lg font-label-sm tracking-wider uppercase">
					{i18n.lang === 'en' ? 'Most Popular' : 'Más Popular'}
				</div>
				<div class="absolute -top-24 -left-24 w-64 h-64 bg-electric-blue/15 rounded-full blur-3xl pointer-events-none"></div>
				<div>
					<span class="font-label-md text-on-surface-variant uppercase tracking-wider block mb-2">
						{i18n.lang === 'en' ? 'Premium All-Inclusive Rate' : 'Tarifa Todo Incluido Premium'}
					</span>
					<span class="text-display-lg font-bold text-electric-blue block">
						{pkg.price} €
					</span>
					<span class="text-sm text-on-surface-variant block mt-1">
						{i18n.lang === 'en' ? '(+21% VAT) — Setup & live support included' : '(+21% IVA) — Montaje y técnico incluidos'}
					</span>
				</div>
				<div class="mt-8 border-t border-border-glass pt-6">
					<div class="flex items-center gap-3">
						<span class="material-symbols-outlined text-electric-blue text-[24px]">group</span>
						<div>
							<span class="font-label-lg text-on-surface block">
								{i18n.lang === 'en' ? `Up to ${pkg.maxGuests} Guests` : `Hasta ${pkg.maxGuests} Personas`}
							</span>
							<p class="text-sm text-on-surface-variant">
								{i18n.lang === 'en' ? 'Perfect for beautiful villas, fincas, and wedding hotels.' : 'Perfecto para villas hermosas, fincas y hoteles de boda.'}
							</p>
						</div>
					</div>
				</div>
			</div>

			<!-- Dynamic Live Engineering Support Card -->
			<div class="glass-panel rounded-xl p-8 flex flex-col justify-center">
				<div class="flex items-center gap-3 mb-3">
					<span class="material-symbols-outlined text-electric-blue text-[28px]">engineering</span>
					<h3 class="font-headline-sm text-headline-sm text-on-surface">
						{i18n.lang === 'en' ? 'Live On-Site Technician' : 'Técnico en Vivo en el Sitio'}
					</h3>
				</div>
				<p class="font-body-md text-body-md text-on-surface-variant leading-relaxed">
					{i18n.lang === 'en'
						? 'Never worry about microphone feedback or visual issues. This package includes full live on-site technical monitoring and acoustic adjustments throughout your banquet and speeches.'
						: 'No te preocupes por acoples de micrófonos o fallos visuales. Este paquete incluye soporte técnico y monitoreo en directo durante el banquete y los discursos.'}
				</p>
			</div>
		</div>

		<!-- Inclusions & Visual Display Card -->
		<div class="lg:col-span-7 flex flex-col gap-6">
			{#if pkg.image}
				<div class="w-full h-56 rounded-xl overflow-hidden relative shadow-lg">
					<img 
						src={pkg.image}
						alt="Beautiful wedding decoration with premium active ambient lighting" 
						class="object-cover w-full h-full transform hover:scale-105 transition-transform duration-700" 
						loading="lazy"
					/>
					<div class="absolute inset-0 bg-gradient-to-t from-background/90 via-transparent to-transparent"></div>
				</div>
			{/if}

			<div class="glass-panel rounded-xl p-8 md:p-10 flex-grow relative overflow-hidden">
				<div class="absolute -bottom-24 -right-24 w-64 h-64 bg-electric-blue/5 rounded-full blur-3xl pointer-events-none"></div>
				<div>
					<h3 class="font-headline-md text-headline-md text-on-surface mb-6 border-b border-border-glass pb-4">
						{i18n.lang === 'en' ? 'Premium Inclusions' : 'Servicios Premium Incluidos'}
					</h3>
					<ul class="space-y-4">
						{#each pkg.includes[i18n.lang] as item}
							<li class="flex items-start gap-3">
								<span class="material-symbols-outlined text-electric-blue text-[20px] mt-0.5">check_circle</span>
								<span class="font-body-md text-body-md text-on-surface-variant leading-relaxed">{item}</span>
							</li>
						{/each}
					</ul>
				</div>
			</div>
		</div>
	</div>

	<!-- Booking Call to Action -->
	<div class="glass-panel rounded-xl p-8 md:p-12 text-center relative overflow-hidden reveal active is-revealed">
		<div class="absolute -bottom-24 -right-24 w-64 h-64 bg-electric-blue/10 rounded-full blur-3xl pointer-events-none"></div>
		<h2 class="font-headline-md text-headline-md mb-4 text-on-surface">
			{i18n.lang === 'en' ? 'Make Your Celebration Magic' : 'Hacé tu Celebración Mágica'}
		</h2>
		<p class="font-body-lg text-body-lg text-on-surface-variant max-w-2xl mx-auto mb-8">
			{i18n.lang === 'en'
				? 'Bookings for weddings fill up quickly. Secure your date with our technical crew today to guarantee the finest sound and romantic lighting on your special day.'
				: 'Las reservas de bodas se completan rápidamente. Asegurá tu fecha con nuestro equipo técnico hoy para garantizar el mejor sonido e iluminación romántica en tu gran día.'}
		</p>
		<div class="flex flex-wrap justify-center gap-4">
			<a 
				href="/contact-us?pack={pkg.id}"
				class="px-8 py-3 rounded-full bg-gradient-to-r from-electric-blue to-primary-container text-white font-label-lg tracking-wider uppercase hover:shadow-[0_0_20px_rgba(77,140,255,0.4)] active:scale-95 transition-all duration-300"
			>
				{i18n.lang === 'en' ? 'Book This Wedding Pack' : 'Reservar Este Pack Bodas'}
			</a>
			<a 
				href="/pricing"
				class="px-8 py-3 rounded-full border border-border-glass bg-on-surface/5 hover:bg-on-surface/10 text-on-surface font-label-lg active:scale-95 transition-all"
			>
				{i18n.lang === 'en' ? 'Compare All Packages' : 'Comparar Todos los Paquetes'}
			</a>
		</div>
	</div>
</div>
