<script lang="ts">
	import SeoHead from '$lib/components/seo/SeoHead.svelte';
	import { i18n } from '$lib/i18n.svelte';

	let aboutSchema = $derived({
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
				'@type': 'AboutPage',
				'@id': 'https://malagaeventgear.com/about-us/#webpage',
				'url': 'https://malagaeventgear.com/about-us',
				'name': i18n.lang === 'en' ? 'About Us - Malaga Event Gear (MEG)' : 'Sobre Nosotros - Malaga Event Gear (MEG)',
				'description': i18n.lang === 'en'
					? 'Meet the experts at Malaga Event Gear! We are dedicated to making your weddings, corporate events, and parties unforgettable with top-tier gear.'
					: 'Conocé a los expertos de Malaga Event Gear. Nos dedicamos a hacer que tus bodas, eventos corporativos y fiestas sean inolvidables con equipos de primer nivel.',
				'isPartOf': {
					'@type': 'WebSite',
					'@id': 'https://malagaeventgear.com/#website',
					'url': 'https://malagaeventgear.com',
					'name': 'Malaga Event Gear'
				}
			}
		]
	});
</script>

<SeoHead
	title={i18n.lang === 'en' ? 'About Us - Malaga Event Gear (MEG)' : 'Sobre Nosotros - Malaga Event Gear (MEG)'}
	description={i18n.lang === 'en'
		? 'Meet the experts at Malaga Event Gear! We are dedicated to making your weddings, corporate events, and parties unforgettable with top-tier gear.'
		: 'Conocé a los expertos de Malaga Event Gear. Nos dedicamos a hacer que tus bodas, eventos corporativos y fiestas sean inolvidables con equipos de primer nivel.'}
	canonicalUrl="https://malagaeventgear.com/about-us"
	jsonLdSchema={aboutSchema}
/>

<div class="relative w-full py-20 px-margin-mobile md:px-margin-desktop z-10 max-w-container-max mx-auto">
	<!-- Hero Section -->
	<div class="text-center mb-16 reveal">
		<span class="inline-block px-4 py-2 rounded-full glass-panel font-label-sm text-electric-blue uppercase tracking-widest mb-4">
			{i18n.lang === 'en' ? 'Who We Are' : 'Quiénes Somos'}
		</span>
		<h1 class="font-headline-lg-mobile md:font-headline-lg text-headline-lg-mobile md:text-headline-lg mb-6 text-on-background">
			{i18n.lang === 'en' ? 'About Us' : 'Sobre Nosotros'}
		</h1>
		<p class="font-body-lg text-body-lg text-on-surface-variant max-w-3xl mx-auto">
			{i18n.lang === 'en' 
				? 'Welcome to Malaga Event Gear (MEG) — your go-to source for high-quality audio visual equipment rentals in Malaga, Spain. We specialize in providing top-notch gear for events of all sizes.'
				: 'Bienvenido a Malaga Event Gear (MEG), tu fuente de referencia para el alquiler de equipos audiovisuales de alta calidad en Málaga, España. Nos especializamos en proporcionar equipos de primer nivel para eventos de todos los tamaños.'}
		</p>
	</div>

	<!-- Main Story Bento -->
	<div class="grid grid-cols-1 lg:grid-cols-12 gap-gutter items-stretch mb-24">
		<div class="lg:col-span-7 flex">
			<div class="glass-panel rounded-xl p-8 md:p-12 w-full flex flex-col justify-between relative overflow-hidden">
				<div class="absolute -top-24 -left-24 w-64 h-64 bg-electric-blue/10 rounded-full blur-3xl pointer-events-none"></div>
				<div>
					<h2 class="font-headline-md text-headline-md mb-6 text-on-surface">
						{i18n.lang === 'en' ? 'Our Mission & History' : 'Nuestra Misión e Historia'}
					</h2>
					<p class="font-body-md text-body-md text-on-surface-variant mb-6 leading-relaxed">
						{i18n.lang === 'en'
							? 'Malaga Event Gear has been active in the audiovisual industry since 1996 and operating as independent freelancers since 2010. Over nearly three decades, we have developed a passion for flawless events and crystal-clear acoustics.'
							: 'Malaga Event Gear ha estado activo en la industria audiovisual desde 1996 y operando como profesionales independientes desde 2010. A lo largo de casi tres décadas, hemos desarrollado una pasión por eventos impecables y una acústica cristalina.'}
					</p>
					<p class="font-body-md text-body-md text-on-surface-variant leading-relaxed">
						{i18n.lang === 'en'
							? 'We operate under a delivery-only model with direct setups, meaning we do not maintain a physical storefront. Instead, we bring our premium systems, cabling, and support directly to your villa, hotel, or venue across Malaga and the Costa del Sol.'
							: 'Operamos bajo un modelo exclusivo de entrega y montaje directo, lo que significa que no mantenemos una tienda física. En su lugar, llevamos nuestros sistemas premium, cableado e ingeniería directamente a tu villa, hotel o recinto en toda Málaga y la Costa del Sol.'}
					</p>
				</div>
			</div>
		</div>

		<div class="lg:col-span-5 flex flex-col gap-6">
			<!-- Experience Card -->
			<div class="glass-panel rounded-xl p-8 flex-1 flex flex-col justify-center text-center">
				<span class="text-display-md font-bold text-electric-blue mb-2">27+</span>
				<h3 class="font-label-lg text-label-lg text-on-surface uppercase tracking-wider">
					{i18n.lang === 'en' ? 'Years of Experience' : 'Años de Experiencia'}
				</h3>
				<p class="font-body-md text-body-md text-on-surface-variant mt-2">
					{i18n.lang === 'en' ? 'In professional AV industry' : 'En la industria profesional de AV'}
				</p>
			</div>

			<!-- Satisfied Clients Card -->
			<div class="glass-panel rounded-xl p-8 flex-1 flex flex-col justify-center text-center">
				<span class="text-display-md font-bold text-electric-blue mb-2">1,000+</span>
				<h3 class="font-label-lg text-label-lg text-on-surface uppercase tracking-wider">
					{i18n.lang === 'en' ? 'Happy Clients' : 'Clientes Satisfechos'}
				</h3>
				<p class="font-body-md text-body-md text-on-surface-variant mt-2">
					{i18n.lang === 'en' ? 'Across the Costa del Sol' : 'En toda la Costa del Sol'}
				</p>
			</div>
		</div>
	</div>

	<!-- What We Offer -->
	<div class="mb-24 reveal">
		<div class="text-center mb-16">
			<h2 class="font-headline-md text-headline-md mb-4 text-on-background">
				{i18n.lang === 'en' ? 'What We Offer' : 'Qué Ofrecemos'}
			</h2>
			<p class="font-body-lg text-body-lg text-on-surface-variant max-w-2xl mx-auto">
				{i18n.lang === 'en'
					? 'We provide a wide range of rental services tailored to meet the needs of various events, including weddings, corporate events, private parties, and MICE conferences.'
					: 'Ofrecemos una amplia gama de servicios de alquiler adaptados a las necesidades de diversos eventos, incluyendo bodas, eventos corporativos, fiestas privadas y conferencias MICE.'}
			</p>
		</div>

		<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-gutter">
			<!-- Sound Systems -->
			<div class="glass-panel rounded-xl p-8 flex flex-col gap-4">
				<div class="bg-surface-glass p-3 rounded-lg border border-border-glass text-electric-blue w-fit">
					<span class="material-symbols-outlined text-[24px]">volume_up</span>
				</div>
				<h3 class="font-headline-sm text-headline-sm text-on-surface">
					{i18n.lang === 'en' ? 'Sound Systems' : 'Sistemas de Sonido'}
				</h3>
				<p class="font-body-md text-body-md text-on-surface-variant leading-relaxed">
					{i18n.lang === 'en'
						? 'From small speaker setups for private parties to high-fidelity active acoustic PA systems for large venues.'
						: 'Desde pequeños altavoces para fiestas privadas hasta sistemas PA activos de alta fidelidad para grandes recintos.'}
				</p>
			</div>

			<!-- Lighting -->
			<div class="glass-panel rounded-xl p-8 flex flex-col gap-4">
				<div class="bg-surface-glass p-3 rounded-lg border border-border-glass text-electric-blue w-fit">
					<span class="material-symbols-outlined text-[24px]">lightbulb</span>
				</div>
				<h3 class="font-headline-sm text-headline-sm text-on-surface">
					{i18n.lang === 'en' ? 'Lighting' : 'Iluminación'}
				</h3>
				<p class="font-body-md text-body-md text-on-surface-variant leading-relaxed">
					{i18n.lang === 'en'
						? 'Dynamic lighting solutions, including wash lights, moving heads, and LED bars to create the perfect ambiance.'
						: 'Soluciones de iluminación dinámica, incluyendo focos wash, cabezas móviles y barras LED para el ambiente perfecto.'}
				</p>
			</div>

			<!-- Screens and Projectors -->
			<div class="glass-panel rounded-xl p-8 flex flex-col gap-4">
				<div class="bg-surface-glass p-3 rounded-lg border border-border-glass text-electric-blue w-fit">
					<span class="material-symbols-outlined text-[24px]">videocam</span>
				</div>
				<h3 class="font-headline-sm text-headline-sm text-on-surface">
					{i18n.lang === 'en' ? 'Screens and Projectors' : 'Pantallas y Proyectores'}
				</h3>
				<p class="font-body-md text-body-md text-on-surface-variant leading-relaxed">
					{i18n.lang === 'en'
						? 'High-quality laser projectors and screens ideal for presentations, conferences, and outdoor cinema events.'
						: 'Proyectores láser de alta calidad y pantallas ideales para presentaciones, conferencias y cine al aire libre.'}
				</p>
			</div>

			<!-- Microphones -->
			<div class="glass-panel rounded-xl p-8 flex flex-col gap-4">
				<div class="bg-surface-glass p-3 rounded-lg border border-border-glass text-electric-blue w-fit">
					<span class="material-symbols-outlined text-[24px]">mic</span>
				</div>
				<h3 class="font-headline-sm text-headline-sm text-on-surface">
					{i18n.lang === 'en' ? 'Microphones' : 'Microfonía'}
				</h3>
				<p class="font-body-md text-body-md text-on-surface-variant leading-relaxed">
					{i18n.lang === 'en'
						? 'Professional Shure/Sennheiser wired and wireless handheld, lapel, and gooseneck microphone configurations.'
						: 'Configuraciones profesionales de micrófonos Shure/Sennheiser con cable, inalámbricos de mano, de solapa o flexo.'}
				</p>
			</div>

			<!-- Event Technicians -->
			<div class="glass-panel rounded-xl p-8 flex flex-col gap-4">
				<div class="bg-surface-glass p-3 rounded-lg border border-border-glass text-electric-blue w-fit">
					<span class="material-symbols-outlined text-[24px]">engineering</span>
				</div>
				<h3 class="font-headline-sm text-headline-sm text-on-surface">
					{i18n.lang === 'en' ? 'Event Technicians' : 'Técnicos para Eventos'}
				</h3>
				<p class="font-body-md text-body-md text-on-surface-variant leading-relaxed">
					{i18n.lang === 'en'
						? 'Experienced sound and lighting technicians available to oversee your setup, operation, and live monitoring.'
						: 'Técnicos experimentados de sonido e iluminación disponibles para supervisar el montaje, operación y monitoreo en vivo.'}
				</p>
			</div>

			<!-- Special Effects -->
			<div class="glass-panel rounded-xl p-8 flex flex-col gap-4">
				<div class="bg-surface-glass p-3 rounded-lg border border-border-glass text-electric-blue w-fit">
					<span class="material-symbols-outlined text-[24px]">cyclone</span>
				</div>
				<h3 class="font-headline-sm text-headline-sm text-on-surface">
					{i18n.lang === 'en' ? 'Special Effects' : 'Efectos Especiales'}
				</h3>
				<p class="font-body-md text-body-md text-on-surface-variant leading-relaxed">
					{i18n.lang === 'en'
						? 'Scenic atmospheric hazers, professional fog machines, and low-lying cloud generators to add extra flair.'
						: 'Haze escénico, máquinas de humo profesionales y generadores de nubes bajas para dar un toque increíble.'}
				</p>
			</div>
		</div>
	</div>

	<!-- CTA Banner -->
	<div class="glass-panel rounded-xl p-8 md:p-12 text-center relative overflow-hidden reveal">
		<div class="absolute -bottom-24 -right-24 w-64 h-64 bg-electric-blue/10 rounded-full blur-3xl pointer-events-none"></div>
		<h2 class="font-headline-md text-headline-md mb-4 text-on-surface">
			{i18n.lang === 'en' ? 'Ready to Elevate Your Next Event?' : '¿Listo para Elevar tu Próximo Evento?'}
		</h2>
		<p class="font-body-lg text-body-lg text-on-surface-variant max-w-2xl mx-auto mb-8">
			{i18n.lang === 'en'
				? 'Explore our pre-configured packages or request a completely custom quote from our technical team.'
				: 'Explorá nuestros paquetes preconfigurados o solicitá un presupuesto totalmente personalizado a nuestro equipo técnico.'}
		</p>
		<div class="flex flex-wrap justify-center gap-4">
			<a
				href="/packages/"
				class="px-8 py-3 rounded-full bg-gradient-to-r from-electric-blue to-primary-container text-white font-label-lg tracking-wider uppercase hover:shadow-[0_0_20px_rgba(77,140,255,0.4)] active:scale-95 transition-all duration-300"
			>
				{i18n.lang === 'en' ? 'View Pricing Packages' : 'Ver Paquetes de Precios'}
			</a>
			<a 
				href="/contact/"
				class="px-8 py-3 rounded-full border border-border-glass bg-on-surface/5 hover:bg-on-surface/10 text-on-surface font-label-lg active:scale-95 transition-all"
			>
				{i18n.lang === 'en' ? 'Contact Us Directly' : 'Contáctanos Directamente'}
			</a>
		</div>
	</div>
</div>
