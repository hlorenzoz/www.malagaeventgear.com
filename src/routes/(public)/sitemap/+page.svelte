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

<div class="relative w-full py-20 px-margin-mobile md:px-margin-desktop z-10 max-w-container-max mx-auto">
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
				? 'A complete directory of pages and service packages across our Malaga Event Gear audiovisual rental platform.'
				: 'Un directorio completo de páginas y paquetes de servicios en nuestra plataforma de alquiler audiovisual Malaga Event Gear.'}
		</p>
	</div>

	<!-- Bento Sitemap Dashboard -->
	<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-gutter items-stretch mb-24">
		<!-- Core Pages -->
		<div class="glass-panel rounded-xl p-8 flex flex-col gap-6 reveal">
			<div class="flex items-center gap-3 text-electric-blue">
				<span class="material-symbols-outlined text-[28px]">explore</span>
				<h2 class="font-headline-sm text-headline-sm text-on-surface">
					{i18n.lang === 'en' ? 'Primary Portals' : 'Portales Principales'}
				</h2>
			</div>
			<hr class="border-border-glass" />
			<nav class="flex flex-col gap-4 font-body-md text-body-md text-on-surface-variant">
				<a class="hover:text-electric-blue transition-colors flex items-center gap-2" href="/">
					<span class="material-symbols-outlined text-[18px]">home</span>
					{i18n.lang === 'en' ? 'Home Page' : 'Página de Inicio'}
				</a>
				<a class="hover:text-electric-blue transition-colors flex items-center gap-2" href="/pricing">
					<span class="material-symbols-outlined text-[18px]">payments</span>
					{i18n.lang === 'en' ? 'Pricing & Packages' : 'Precios y Paquetes'}
				</a>
				<a class="hover:text-electric-blue transition-colors flex items-center gap-2" href="/services">
					<span class="material-symbols-outlined text-[18px]">grid_view</span>
					{i18n.lang === 'en' ? 'Services Catalog' : 'Catálogo de Servicios'}
				</a>
				<a class="hover:text-electric-blue transition-colors flex items-center gap-2" href="/contact-us">
					<span class="material-symbols-outlined text-[18px]">mail</span>
					{i18n.lang === 'en' ? 'Contact Us Form' : 'Formulario de Contacto'}
				</a>
			</nav>
		</div>

		<!-- Event Packs -->
		<div class="glass-panel rounded-xl p-8 flex flex-col gap-6 reveal">
			<div class="flex items-center gap-3 text-electric-blue">
				<span class="material-symbols-outlined text-[28px]">inventory_2</span>
				<h2 class="font-headline-sm text-headline-sm text-on-surface">
					{i18n.lang === 'en' ? 'Event Packages' : 'Paquetes para Eventos'}
				</h2>
			</div>
			<hr class="border-border-glass" />
			<nav class="flex flex-col gap-4 font-body-md text-body-md text-on-surface-variant">
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

		<!-- Legal & Trust -->
		<div class="glass-panel rounded-xl p-8 flex flex-col gap-6 reveal">
			<div class="flex items-center gap-3 text-electric-blue">
				<span class="material-symbols-outlined text-[28px]">gavel</span>
				<h2 class="font-headline-sm text-headline-sm text-on-surface">
					{i18n.lang === 'en' ? 'Legal & Trust Resources' : 'Recursos Legales y Confianza'}
				</h2>
			</div>
			<hr class="border-border-glass" />
			<nav class="flex flex-col gap-4 font-body-md text-body-md text-on-surface-variant">
				<a class="hover:text-electric-blue transition-colors flex items-center gap-2" href="/about-us">
					<span class="material-symbols-outlined text-[18px]">info</span>
					{i18n.lang === 'en' ? 'About Our Agency' : 'Sobre Nuestra Agencia'}
				</a>
				<a class="hover:text-electric-blue transition-colors flex items-center gap-2" href="/meet-the-team">
					<span class="material-symbols-outlined text-[18px]">groups</span>
					{i18n.lang === 'en' ? 'Our Expert Team' : 'Nuestro Equipo de Expertos'}
				</a>
				<a class="hover:text-electric-blue transition-colors flex items-center gap-2" href="/terms-of-service">
					<span class="material-symbols-outlined text-[18px]">policy</span>
					{i18n.lang === 'en' ? 'Terms of Service' : 'Términos del Servicio'}
				</a>
				<a class="hover:text-electric-blue transition-colors flex items-center gap-2" href="/privacy-policy">
					<span class="material-symbols-outlined text-[18px]">shield</span>
					{i18n.lang === 'en' ? 'Privacy Policy' : 'Política de Privacidad'}
				</a>
				<a class="hover:text-electric-blue transition-colors flex items-center gap-2" href="/cookie-policy">
					<span class="material-symbols-outlined text-[18px]">cookie</span>
					{i18n.lang === 'en' ? 'Cookie Policy' : 'Política de Cookies'}
				</a>
				<a class="hover:text-electric-blue transition-colors flex items-center gap-2" href="/gdpr">
					<span class="material-symbols-outlined text-[18px]">verified_user</span>
					{i18n.lang === 'en' ? 'GDPR Compliance' : 'Cumplimiento del RGPD'}
				</a>
				<a class="hover:text-electric-blue transition-colors flex items-center gap-2" href="/faq">
					<span class="material-symbols-outlined text-[18px]">help</span>
					{i18n.lang === 'en' ? 'Frequently Asked Questions' : 'Preguntas Frecuentes'}
				</a>
			</nav>
		</div>
	</div>
</div>
