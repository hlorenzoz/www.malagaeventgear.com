<script lang="ts">
	import SeoHead from '$lib/components/seo/SeoHead.svelte';
	import { i18n } from '$lib/i18n.svelte';

	let sitemapSchema = $derived({
		'@context': 'https://schema.org',
		'@type': 'WebPage',
		'@id': 'https://malagaeventgear.com/sitemap/#webpage',
		'url': 'https://malagaeventgear.com/sitemap/',
		'name': i18n.lang === 'en' ? 'Sitemap - Malaga Event Gear (MEG)' : 'Mapa del Sitio - Malaga Event Gear (MEG)',
		'description': i18n.lang === 'en'
			? 'Explore the sitemap for Malaga Event Gear. Find links to all our professional audiovisual and lighting rental services, packages, and contact information.'
			: 'Explorá el mapa del sitio de Malaga Event Gear. Encontrá enlaces a todos nuestros servicios de alquiler de equipos audiovisuales y de iluminación.'
	});
</script>

<SeoHead
	title={i18n.lang === 'en' ? 'Sitemap - Malaga Event Gear (MEG)' : 'Mapa del Sitio - Malaga Event Gear (MEG)'}
	description={i18n.lang === 'en'
		? 'Explore the sitemap for Malaga Event Gear. Find links to all our professional audiovisual and lighting rental services, packages, and contact information.'
		: 'Explorá el mapa del sitio de Malaga Event Gear. Encontrá enlaces a todos nuestros servicios de alquiler de equipos audiovisuales y de iluminación.'}
	canonicalUrl="https://malagaeventgear.com/sitemap"
	jsonLdSchema={sitemapSchema}
/>

<div class="relative w-full py-20 px-margin-mobile md:px-margin-desktop z-10 max-w-container-max mx-auto animate-fade-in">
	<!-- Heading -->
	<div class="text-center mb-16 reveal">
		<span class="inline-block px-4 py-2 rounded-full glass-panel font-label-sm text-electric-blue uppercase tracking-widest mb-4">
			{i18n.lang === 'en' ? 'Website Directory' : 'Directorio de la Web'}
		</span>
		<h1 class="font-headline-lg-mobile md:font-headline-lg text-headline-lg-mobile md:text-headline-lg mb-6 text-on-background">
			{i18n.lang === 'en' ? 'Sitemap' : 'Mapa del Sitio'}
		</h1>
		<p class="font-body-lg text-body-lg text-on-surface-variant max-w-2xl mx-auto">
			{i18n.lang === 'en'
				? 'Explore our complete, bilingual directory of static pages and specialized event packages in both English and Spanish.'
				: 'Explorá nuestro directorio bilingüe completo de páginas estáticas y paquetes de eventos tanto en inglés como en español.'}
		</p>
	</div>

	<!-- Bilingual Grid Structure -->
	<div class="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start mb-24">
		
		<!-- ================= ENGLISH VERSION ================= -->
		<section class="flex flex-col gap-8" lang="en">
			<div class="flex items-center gap-3 border-b border-border-glass pb-4">
				<span class="material-symbols-outlined text-[32px] text-electric-blue">flag</span>
				<h2 class="font-headline-md text-headline-md text-on-surface">
					English Version
				</h2>
			</div>

			<div class="grid grid-cols-1 md:grid-cols-2 gap-6">
				<!-- Core Portals -->
				<div class="glass-panel rounded-xl p-6 flex flex-col gap-4">
					<h3 class="font-headline-sm text-headline-sm text-electric-blue flex items-center gap-2">
						<span class="material-symbols-outlined text-[22px]">explore</span>
						Primary Portals
					</h3>
					<nav class="flex flex-col gap-3 font-body-md text-body-md text-on-surface-variant">
						<a class="hover:text-electric-blue transition-colors flex items-center gap-2" href="/">
							<span class="material-symbols-outlined text-[18px]">home</span>
							Home Page
						</a>
						<a class="hover:text-electric-blue transition-colors flex items-center gap-2" href="/pricing">
							<span class="material-symbols-outlined text-[18px]">payments</span>
							Pricing & Packages
						</a>
						<a class="hover:text-electric-blue transition-colors flex items-center gap-2" href="/services">
							<span class="material-symbols-outlined text-[18px]">grid_view</span>
							Services Catalog
						</a>
						<a class="hover:text-electric-blue transition-colors flex items-center gap-2" href="/contact">
							<span class="material-symbols-outlined text-[18px]">mail</span>
							Book Now / Contact
						</a>
					</nav>
				</div>

				<!-- Event Packs -->
				<div class="glass-panel rounded-xl p-6 flex flex-col gap-4">
					<h3 class="font-headline-sm text-headline-sm text-electric-blue flex items-center gap-2">
						<span class="material-symbols-outlined text-[22px]">inventory_2</span>
						Event Packs
					</h3>
					<nav class="flex flex-col gap-3 font-body-md text-body-md text-on-surface-variant">
						<a class="hover:text-electric-blue transition-colors flex items-center gap-2" href="/eco-pack">
							<span class="material-symbols-outlined text-[18px]">eco</span>
							Eco Pack (290 €)
						</a>
						<a class="hover:text-electric-blue transition-colors flex items-center gap-2" href="/wedding-pack">
							<span class="material-symbols-outlined text-[18px]">favorite</span>
							Wedding Pack (650 €)
						</a>
						<a class="hover:text-electric-blue transition-colors flex items-center gap-2" href="/product-presentation-pack">
							<span class="material-symbols-outlined text-[18px]">co_present</span>
							Product Presentation (310 €)
						</a>
						<a class="hover:text-electric-blue transition-colors flex items-center gap-2" href="/basic-mice-pack">
							<span class="material-symbols-outlined text-[18px]">groups</span>
							Basic MICE Pack (295 €)
						</a>
						<a class="hover:text-electric-blue transition-colors flex items-center gap-2" href="/mice-pack">
							<span class="material-symbols-outlined text-[18px]">corporate_fare</span>
							MICE Pack (490 €)
						</a>
					</nav>
				</div>

				<!-- Legal & About Us -->
				<div class="glass-panel rounded-xl p-6 flex flex-col gap-4 md:col-span-2">
					<h3 class="font-headline-sm text-headline-sm text-electric-blue flex items-center gap-2">
						<span class="material-symbols-outlined text-[22px]">gavel</span>
						Information & Legal
					</h3>
					<div class="grid grid-cols-1 md:grid-cols-2 gap-4">
						<nav class="flex flex-col gap-3 font-body-md text-body-md text-on-surface-variant">
							<a class="hover:text-electric-blue transition-colors flex items-center gap-2" href="/about-us">
								<span class="material-symbols-outlined text-[18px]">info</span>
								About Our Agency
							</a>
							<a class="hover:text-electric-blue transition-colors flex items-center gap-2" href="/meet-the-team">
								<span class="material-symbols-outlined text-[18px]">groups</span>
								Our Expert Team
							</a>
							<a class="hover:text-electric-blue transition-colors flex items-center gap-2" href="/faq">
								<span class="material-symbols-outlined text-[18px]">help</span>
								Frequently Asked Questions
							</a>
						</nav>
						<nav class="flex flex-col gap-3 font-body-md text-body-md text-on-surface-variant">
							<a class="hover:text-electric-blue transition-colors flex items-center gap-2" href="/terms-of-service">
								<span class="material-symbols-outlined text-[18px]">policy</span>
								Terms of Service
							</a>
							<a class="hover:text-electric-blue transition-colors flex items-center gap-2" href="/privacy-policy">
								<span class="material-symbols-outlined text-[18px]">shield</span>
								Privacy Policy
							</a>
							<a class="hover:text-electric-blue transition-colors flex items-center gap-2" href="/cookie-policy">
								<span class="material-symbols-outlined text-[18px]">cookie</span>
								Cookie Policy
							</a>
							<a class="hover:text-electric-blue transition-colors flex items-center gap-2" href="/gdpr">
								<span class="material-symbols-outlined text-[18px]">verified_user</span>
								GDPR Compliance
							</a>
						</nav>
					</div>
				</div>
			</div>
		</section>

		<!-- ================= VERSÍON EN ESPAÑOL ================= -->
		<section class="flex flex-col gap-8" lang="es">
			<div class="flex items-center gap-3 border-b border-border-glass pb-4">
				<span class="material-symbols-outlined text-[32px] text-electric-blue">flag</span>
				<h2 class="font-headline-md text-headline-md text-on-surface">
					Versión en Español
				</h2>
			</div>

			<div class="grid grid-cols-1 md:grid-cols-2 gap-6">
				<!-- Portales Principales -->
				<div class="glass-panel rounded-xl p-6 flex flex-col gap-4">
					<h3 class="font-headline-sm text-headline-sm text-electric-blue flex items-center gap-2">
						<span class="material-symbols-outlined text-[22px]">explore</span>
						Portales Principales
					</h3>
					<nav class="flex flex-col gap-3 font-body-md text-body-md text-on-surface-variant">
						<a class="hover:text-electric-blue transition-colors flex items-center gap-2" href="/">
							<span class="material-symbols-outlined text-[18px]">home</span>
							Página de Inicio
						</a>
						<a class="hover:text-electric-blue transition-colors flex items-center gap-2" href="/pricing">
							<span class="material-symbols-outlined text-[18px]">payments</span>
							Precios y Paquetes
						</a>
						<a class="hover:text-electric-blue transition-colors flex items-center gap-2" href="/services">
							<span class="material-symbols-outlined text-[18px]">grid_view</span>
							Catálogo de Servicios
						</a>
						<a class="hover:text-electric-blue transition-colors flex items-center gap-2" href="/contact">
							<span class="material-symbols-outlined text-[18px]">mail</span>
							Reservar / Contacto
						</a>
					</nav>
				</div>

				<!-- Paquetes de Eventos -->
				<div class="glass-panel rounded-xl p-6 flex flex-col gap-4">
					<h3 class="font-headline-sm text-headline-sm text-electric-blue flex items-center gap-2">
						<span class="material-symbols-outlined text-[22px]">inventory_2</span>
						Paquetes de Eventos
					</h3>
					<nav class="flex flex-col gap-3 font-body-md text-body-md text-on-surface-variant">
						<a class="hover:text-electric-blue transition-colors flex items-center gap-2" href="/eco-pack">
							<span class="material-symbols-outlined text-[18px]">eco</span>
							Eco Pack (290 €)
						</a>
						<a class="hover:text-electric-blue transition-colors flex items-center gap-2" href="/wedding-pack">
							<span class="material-symbols-outlined text-[18px]">favorite</span>
							Wedding Pack (650 €)
						</a>
						<a class="hover:text-electric-blue transition-colors flex items-center gap-2" href="/product-presentation-pack">
							<span class="material-symbols-outlined text-[18px]">co_present</span>
							Product Presentation (310 €)
						</a>
						<a class="hover:text-electric-blue transition-colors flex items-center gap-2" href="/basic-mice-pack">
							<span class="material-symbols-outlined text-[18px]">groups</span>
							Basic MICE Pack (295 €)
						</a>
						<a class="hover:text-electric-blue transition-colors flex items-center gap-2" href="/mice-pack">
							<span class="material-symbols-outlined text-[18px]">corporate_fare</span>
							MICE Pack (490 €)
						</a>
					</nav>
				</div>

				<!-- Información y Legales -->
				<div class="glass-panel rounded-xl p-6 flex flex-col gap-4 md:col-span-2">
					<h3 class="font-headline-sm text-headline-sm text-electric-blue flex items-center gap-2">
						<span class="material-symbols-outlined text-[22px]">gavel</span>
						Información y Legales
					</h3>
					<div class="grid grid-cols-1 md:grid-cols-2 gap-4">
						<nav class="flex flex-col gap-3 font-body-md text-body-md text-on-surface-variant">
							<a class="hover:text-electric-blue transition-colors flex items-center gap-2" href="/about-us">
								<span class="material-symbols-outlined text-[18px]">info</span>
								Sobre Nuestra Agencia
							</a>
							<a class="hover:text-electric-blue transition-colors flex items-center gap-2" href="/meet-the-team">
								<span class="material-symbols-outlined text-[18px]">groups</span>
								Nuestro Equipo de Expertos
							</a>
							<a class="hover:text-electric-blue transition-colors flex items-center gap-2" href="/faq">
								<span class="material-symbols-outlined text-[18px]">help</span>
								Preguntas Frecuentes
							</a>
						</nav>
						<nav class="flex flex-col gap-3 font-body-md text-body-md text-on-surface-variant">
							<a class="hover:text-electric-blue transition-colors flex items-center gap-2" href="/terms-of-service">
								<span class="material-symbols-outlined text-[18px]">policy</span>
								Términos del Servicio
							</a>
							<a class="hover:text-electric-blue transition-colors flex items-center gap-2" href="/privacy-policy">
								<span class="material-symbols-outlined text-[18px]">shield</span>
								Política de Privacidad
							</a>
							<a class="hover:text-electric-blue transition-colors flex items-center gap-2" href="/cookie-policy">
								<span class="material-symbols-outlined text-[18px]">cookie</span>
								Política de Cookies
							</a>
							<a class="hover:text-electric-blue transition-colors flex items-center gap-2" href="/gdpr">
								<span class="material-symbols-outlined text-[18px]">verified_user</span>
								Cumplimiento del RGPD
							</a>
						</nav>
					</div>
				</div>
			</div>
		</section>

	</div>
</div>
