<script lang="ts">
	import SeoHead from '$lib/components/seo/SeoHead.svelte';
	import { i18n } from '$lib/i18n.svelte';
	import { getPackageById } from '$lib/data/packages';

	let pkg = $derived(getPackageById('presentation')!);

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
				'@id': 'https://malagaeventgear.com/product-presentation-pack/#service',
				'name': 'Product Presentation Pack Projection & Audio Malaga - Malaga Event Gear (MEG)',
				'description': pkg.desc[i18n.lang],
				'serviceType': 'Audio visual product showcase and launch rentals',
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
	title={i18n.lang === 'en' ? 'Product Presentation Pack Laser Projection & Audio | Malaga Event Gear' : 'Pack Lanzamiento de Productos Proyección y Audio | Malaga Event Gear'}
	description={pkg.desc[i18n.lang]}
	canonicalUrl="https://malagaeventgear.com/product-presentation-pack"
	jsonLdSchema={seoSchema}
/>

<div class="relative w-full py-20 px-margin-mobile md:px-margin-desktop z-10 max-w-container-max mx-auto">
	<!-- Hero Header -->
	<div class="text-center mb-16 reveal active is-revealed">
		<span class="inline-block px-4 py-2 rounded-full glass-panel font-label-sm text-electric-blue uppercase tracking-widest mb-4">
			{i18n.lang === 'en' ? 'High Visual Impact Corporate Solutions' : 'Soluciones Corporativas de Alto Impacto Visual'}
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
		<!-- Pricing & Visual Hardware Card -->
		<div class="lg:col-span-5 flex flex-col gap-6">
			<!-- Glowing Price Card -->
			<div class="glass-panel rounded-xl p-8 flex flex-col justify-between relative overflow-hidden shadow-2xl">
				<div class="absolute -top-24 -left-24 w-64 h-64 bg-electric-blue/10 rounded-full blur-3xl pointer-events-none"></div>
				<div>
					<span class="font-label-md text-on-surface-variant uppercase tracking-wider block mb-2">
						{i18n.lang === 'en' ? 'Presentation Pack Flat Rate' : 'Tarifa Plana de Pack Lanzamientos'}
					</span>
					<span class="text-display-lg font-bold text-electric-blue block">
						{pkg.price} €
					</span>
					<span class="text-sm text-on-surface-variant block mt-1">
						{i18n.lang === 'en' ? '(+21% VAT) — Laser projector & screen included' : '(+21% IVA) — Proyector láser y pantalla incluidos'}
					</span>
				</div>
				<div class="mt-8 border-t border-border-glass pt-6">
					<div class="flex items-center gap-3">
						<span class="material-symbols-outlined text-electric-blue text-[24px]">videocam</span>
						<div>
							<span class="font-label-lg text-on-surface block">
								{i18n.lang === 'en' ? 'High-Brightness Laser' : 'Láser de Alto Brillo'}
							</span>
							<p class="text-sm text-on-surface-variant">
								{i18n.lang === 'en' ? '5000-Lumen HD Projector ideal for lit rooms.' : 'Proyector HD de 5000 lúmenes ideal para salas iluminadas.'}
							</p>
						</div>
					</div>
				</div>
			</div>

			<!-- Dynamic Visual Impact Card -->
			<div class="glass-panel rounded-xl p-8 flex flex-col justify-center">
				<h3 class="font-headline-sm text-headline-sm text-on-surface mb-3">
					{i18n.lang === 'en' ? 'Flawless Corporate Branding' : 'Branding Corporativo Impecable'}
				</h3>
				<p class="font-body-md text-body-md text-on-surface-variant leading-relaxed">
					{i18n.lang === 'en'
						? 'Maximize the attention of your dealership launch, hotel press release, or product showcase. Our professional setup aligns pristine graphic detail with high-performance speech amplification.'
						: 'Maximizá la atención de tu lanzamiento en concesionario, rueda de prensa en hotel o exhibición de producto. Nuestro montaje alinea un detalle gráfico impecable con amplificación de voz de alto rendimiento.'}
				</p>
			</div>
		</div>

		<!-- Inclusions Card -->
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
					
					<div class="p-4 rounded bg-on-surface/5 border border-border-glass">
						<span class="font-label-md text-on-surface uppercase tracking-wider block mb-1">
							{i18n.lang === 'en' ? 'Setup & Connection Support' : 'Soporte de Conexión y Montaje'}
						</span>
						<p class="text-sm text-on-surface-variant leading-relaxed">
							{i18n.lang === 'en'
								? 'We provide all necessary adapters (HDMI, USB-C) and audio interfaces to connect your company laptops, tablets, or players seamlessly.'
								: 'Proporcionamos todos los adaptadores necesarios (HDMI, USB-C) e interfaces de audio para conectar tus laptops, tablets o reproductores corporativos sin problemas.'}
						</p>
					</div>
				</div>
			</div>
		</div>
	</div>

	<!-- Booking Call to Action -->
	<div class="glass-panel rounded-xl p-8 md:p-12 text-center relative overflow-hidden reveal active is-revealed">
		<div class="absolute -bottom-24 -right-24 w-64 h-64 bg-electric-blue/10 rounded-full blur-3xl pointer-events-none"></div>
		<h2 class="font-headline-md text-headline-md mb-4 text-on-surface">
			{i18n.lang === 'en' ? 'Elevate Your Product Showcase' : 'Elevá el Lanzamiento de tu Producto'}
		</h2>
		<p class="font-body-lg text-body-lg text-on-surface-variant max-w-2xl mx-auto mb-8">
			{i18n.lang === 'en'
				? 'Give your audience the visual clarity and professional sound they deserve. Contact our technical team today to confirm availability.'
				: 'Dale a tu audiencia la claridad visual y el sonido profesional que merecen. Contactá a nuestro equipo técnico hoy para confirmar disponibilidad.'}
		</p>
		<div class="flex flex-wrap justify-center gap-4">
			<a 
				href="/contact-us?pack={pkg.id}"
				class="px-8 py-3 rounded-full bg-gradient-to-r from-electric-blue to-primary-container text-white font-label-lg tracking-wider uppercase hover:shadow-[0_0_20px_rgba(77,140,255,0.4)] active:scale-95 transition-all duration-300"
			>
				{i18n.lang === 'en' ? 'Book This Presentation Pack' : 'Reservar Este Pack Lanzamientos'}
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
