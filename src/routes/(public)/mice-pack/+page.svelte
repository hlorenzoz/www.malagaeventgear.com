<script lang="ts">
	import SeoHead from '$lib/components/seo/SeoHead.svelte';
	import { i18n } from '$lib/i18n.svelte';
	import { getPackageById } from '$lib/data/packages';

	let pkg = $derived(getPackageById('mice-full')!);

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
				'@id': 'https://malagaeventgear.com/mice-pack/#service',
				'name': 'MICE Pack LED Display & Sound Rental Malaga - Malaga Event Gear (MEG)',
				'description': pkg.desc[i18n.lang],
				'serviceType': 'Audio visual MICE corporate congress and forum rentals',
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
	title={i18n.lang === 'en' ? 'MICE Pack Large Display & Audio Rental | Malaga Event Gear' : 'Pack MICE Pantalla Gigante y Sonido | Malaga Event Gear'}
	description={pkg.desc[i18n.lang]}
	canonicalUrl="https://malagaeventgear.com/mice-pack"
	jsonLdSchema={seoSchema}
/>

<div class="relative w-full py-20 px-margin-mobile md:px-margin-desktop z-10 max-w-container-max mx-auto">
	<!-- Hero Header -->
	<div class="text-center mb-16 reveal active is-revealed">
		<span class="inline-block px-4 py-2 rounded-full glass-panel font-label-sm text-electric-blue uppercase tracking-widest mb-4">
			{i18n.lang === 'en' ? 'Professional Medium & Large Corporate Events' : 'Eventos Corporativos Medianos y Grandes Profesionales'}
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
		<!-- Pricing & Visual Display Card -->
		<div class="lg:col-span-5 flex flex-col gap-6">
			<!-- Glowing Price Card -->
			<div class="glass-panel rounded-xl p-8 flex flex-col justify-between relative overflow-hidden shadow-2xl">
				<div class="absolute -top-24 -left-24 w-64 h-64 bg-electric-blue/10 rounded-full blur-3xl pointer-events-none"></div>
				<div>
					<span class="font-label-md text-on-surface-variant uppercase tracking-wider block mb-2">
						{i18n.lang === 'en' ? 'Complete Corporate AV Flat Rate' : 'Tarifa Plana de AV Corporativo Completo'}
					</span>
					<span class="text-display-lg font-bold text-electric-blue block">
						{pkg.price} €
					</span>
					<span class="text-sm text-on-surface-variant block mt-1">
						{i18n.lang === 'en' ? '(+21% VAT) — LED Screen & technician included' : '(+21% IVA) — Pantalla LED y técnico incluidos'}
					</span>
				</div>
				<div class="mt-8 border-t border-border-glass pt-6">
					<div class="flex items-center gap-3">
						<span class="material-symbols-outlined text-electric-blue text-[24px]">desktop_windows</span>
						<div>
							<span class="font-label-lg text-on-surface block">
								{i18n.lang === 'en' ? 'Premium 60" LED Screen' : 'Pantalla LED Premium de 60"'}
							</span>
							<p class="text-sm text-on-surface-variant">
								{i18n.lang === 'en' ? 'Includes heavy-duty designer floor stand.' : 'Incluye soporte de suelo de diseño resistente.'}
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
						{i18n.lang === 'en' ? 'AV Technician Included' : 'Técnico Audiovisual Incluido'}
					</h3>
				</div>
				<p class="font-body-md text-body-md text-on-surface-variant leading-relaxed">
					{i18n.lang === 'en'
						? 'This package includes up to 6 hours of continuous, live technical support. An AV specialist will handle setup, connection testing, microfonía control, and live slide changes for a flawless presentation.'
						: 'Este paquete incluye hasta 6 horas de soporte técnico en directo. Un especialista en AV se encargará del montaje, pruebas de conexión, control de microfonía y cambios de diapositivas.'}
				</p>
			</div>
		</div>

		<!-- Inclusions & Optional Extras Card -->
		<div class="lg:col-span-7 flex">
			<div class="glass-panel rounded-xl p-8 md:p-12 w-full flex flex-col justify-between relative overflow-hidden">
				<div class="absolute -bottom-24 -right-24 w-64 h-64 bg-electric-blue/5 rounded-full blur-3xl pointer-events-none"></div>
				<div>
					<h3 class="font-headline-md text-headline-md text-on-surface mb-6 border-b border-border-glass pb-4">
						{i18n.lang === 'en' ? 'What is Included' : 'Qué Incluye'}
					</h3>
					<ul class="space-y-4 mb-8">
						{#each pkg.includes[i18n.lang] as item}
							<li class="flex items-start gap-3">
								<span class="material-symbols-outlined text-electric-blue text-[20px] mt-0.5">check_circle</span>
								<span class="font-body-md text-body-md text-on-surface-variant leading-relaxed">{item}</span>
							</li>
						{/each}
					</ul>

					{#if pkg.optional}
						<h4 class="font-label-lg text-label-lg text-on-surface uppercase tracking-wider mb-4">
							{i18n.lang === 'en' ? 'Optional Staging & Extras' : 'Escenario y Extras Opcionales'}
						</h4>
						<ul class="space-y-3">
							{#each pkg.optional[i18n.lang] as extra}
								<li class="flex items-center gap-3 p-3 rounded bg-on-surface/5">
									<span class="material-symbols-outlined text-on-surface-variant text-[18px]">add_circle</span>
									<span class="font-body-md text-body-md text-on-surface">{extra}</span>
								</li>
							{/each}
						</ul>
					{/if}
				</div>
			</div>
		</div>
	</div>

	<!-- Booking Call to Action -->
	<div class="glass-panel rounded-xl p-8 md:p-12 text-center relative overflow-hidden reveal active is-revealed">
		<div class="absolute -bottom-24 -right-24 w-64 h-64 bg-electric-blue/10 rounded-full blur-3xl pointer-events-none"></div>
		<h2 class="font-headline-md text-headline-md mb-4 text-on-surface">
			{i18n.lang === 'en' ? 'Coordinate Flawless MICE AV' : 'Coordiná un MICE AV Impecable'}
		</h2>
		<p class="font-body-lg text-body-lg text-on-surface-variant max-w-2xl mx-auto mb-8">
			{i18n.lang === 'en'
				? 'Give your corporate forum, congress, or summit the executive visual polish and acoustic prestige it deserves. Reach out to our technical team today.'
				: 'Dale a tu foro corporativo, congreso o cumbre el pulido visual ejecutivo y el prestigio acústico que se merece. Ponete en contacto con nuestro equipo técnico hoy.'}
		</p>
		<div class="flex flex-wrap justify-center gap-4">
			<a 
				href="/contact-us?pack={pkg.id}"
				class="px-8 py-3 rounded-full bg-gradient-to-r from-electric-blue to-primary-container text-white font-label-lg tracking-wider uppercase hover:shadow-[0_0_20px_rgba(77,140,255,0.4)] active:scale-95 transition-all duration-300"
			>
				{i18n.lang === 'en' ? 'Book MICE Package' : 'Reservar Paquete MICE'}
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
