<script lang="ts">
	import SeoHead from '$lib/components/seo/SeoHead.svelte';
	import Icon from '$lib/components/navigation/Icon.svelte';
	import { i18n } from '$lib/i18n.svelte';

	let { data } = $props();

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
	canonicalUrl="https://malagaeventgear.com/sitemap/"
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
				<Icon name="flag" size="32" className="text-electric-blue" />
				<h2 class="font-headline-md text-headline-md text-on-surface">
					English Version
				</h2>
			</div>

			<div class="grid grid-cols-1 md:grid-cols-2 gap-6">
				<!-- Core Portals -->
				<div class="glass-panel rounded-xl p-6 flex flex-col gap-4">
					<h3 class="font-headline-sm text-headline-sm text-electric-blue flex items-center gap-2">
						<Icon name="explore" size="22" />
						Primary Portals
					</h3>
					<nav class="flex flex-col gap-3 font-body-md text-body-md text-on-surface-variant">
						<a class="hover:text-electric-blue transition-colors flex items-center gap-2" href="/">
							<Icon name="home" size="18" />
							Home Page
						</a>
						<a class="hover:text-electric-blue transition-colors flex items-center gap-2" href="/packages/">
							<Icon name="payments" size="18" />
							Pricing & Packages
						</a>
						<a class="hover:text-electric-blue transition-colors flex items-center gap-2" href="/equipment/">
							<Icon name="grid_view" size="18" />
							Equipment Catalog
						</a>
						<a class="hover:text-electric-blue transition-colors flex items-center gap-2" href="/contact/">
							<Icon name="mail" size="18" />
							Book Now / Contact
						</a>
					</nav>
				</div>

				<!-- Event Packs -->
				<div class="glass-panel rounded-xl p-6 flex flex-col gap-4">
					<h3 class="font-headline-sm text-headline-sm text-electric-blue flex items-center gap-2">
						<Icon name="inventory_2" size="22" />
						Event Packs
					</h3>
					<nav class="flex flex-col gap-3 font-body-md text-body-md text-on-surface-variant">
						<a class="hover:text-electric-blue transition-colors flex items-center gap-2" href="/packages/eco/">
							<Icon name="eco" size="18" />
							Eco Pack (290 €)
						</a>
						<a class="hover:text-electric-blue transition-colors flex items-center gap-2" href="/packages/wedding/">
							<Icon name="favorite" size="18" />
							Wedding Pack (650 €)
						</a>
						<a class="hover:text-electric-blue transition-colors flex items-center gap-2" href="/packages/product-presentation/">
							<Icon name="co_present" size="18" />
							Product Presentation (310 €)
						</a>
						<a class="hover:text-electric-blue transition-colors flex items-center gap-2" href="/packages/basic-mice/">
							<Icon name="groups" size="18" />
							Basic MICE Pack (295 €)
						</a>
						<a class="hover:text-electric-blue transition-colors flex items-center gap-2" href="/packages/mice/">
							<Icon name="corporate_fare" size="18" />
							MICE Pack (490 €)
						</a>
					</nav>
				</div>

				<!-- Legal & About Us -->
				<div class="glass-panel rounded-xl p-6 flex flex-col gap-4 md:col-span-2">
					<h3 class="font-headline-sm text-headline-sm text-electric-blue flex items-center gap-2">
						<Icon name="gavel" size="22" />
						Information & Legal
					</h3>
					<div class="grid grid-cols-1 md:grid-cols-2 gap-4">
						<nav class="flex flex-col gap-3 font-body-md text-body-md text-on-surface-variant">
							<a class="hover:text-electric-blue transition-colors flex items-center gap-2" href="/about-us/">
								<Icon name="info" size="18" />
								About Our Agency
							</a>
							<a class="hover:text-electric-blue transition-colors flex items-center gap-2" href="/meet-the-team/">
								<Icon name="groups" size="18" />
								Our Expert Team
							</a>
							<a class="hover:text-electric-blue transition-colors flex items-center gap-2" href="/faq/">
								<Icon name="help" size="18" />
								Frequently Asked Questions
							</a>
						</nav>
						<nav class="flex flex-col gap-3 font-body-md text-body-md text-on-surface-variant">
							<a class="hover:text-electric-blue transition-colors flex items-center gap-2" href="/terms-of-service/">
								<Icon name="policy" size="18" />
								Terms of Service
							</a>
							<a class="hover:text-electric-blue transition-colors flex items-center gap-2" href="/privacy-policy/">
								<Icon name="shield" size="18" />
								Privacy Policy
							</a>
							<a class="hover:text-electric-blue transition-colors flex items-center gap-2" href="/cookie-policy/">
								<Icon name="cookie" size="18" />
								Cookie Policy
							</a>
							<a class="hover:text-electric-blue transition-colors flex items-center gap-2" href="/gdpr/">
								<Icon name="verified_user" size="18" />
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
				<Icon name="flag" size="32" className="text-electric-blue" />
				<h2 class="font-headline-md text-headline-md text-on-surface">
					Versión en Español
				</h2>
			</div>

			<div class="grid grid-cols-1 md:grid-cols-2 gap-6">
				<!-- Portales Principales -->
				<div class="glass-panel rounded-xl p-6 flex flex-col gap-4">
					<h3 class="font-headline-sm text-headline-sm text-electric-blue flex items-center gap-2">
						<Icon name="explore" size="22" />
						Portales Principales
					</h3>
					<nav class="flex flex-col gap-3 font-body-md text-body-md text-on-surface-variant">
						<a class="hover:text-electric-blue transition-colors flex items-center gap-2" href="/">
							<Icon name="home" size="18" />
							Página de Inicio
						</a>
						<a class="hover:text-electric-blue transition-colors flex items-center gap-2" href="/packages/">
							<Icon name="payments" size="18" />
							Precios y Paquetes
						</a>
						<a class="hover:text-electric-blue transition-colors flex items-center gap-2" href="/equipment/">
							<Icon name="grid_view" size="18" />
							Catálogo de Equipos
						</a>
						<a class="hover:text-electric-blue transition-colors flex items-center gap-2" href="/contact/">
							<Icon name="mail" size="18" />
							Reservar / Contacto
						</a>
					</nav>
				</div>

				<!-- Paquetes de Eventos -->
				<div class="glass-panel rounded-xl p-6 flex flex-col gap-4">
					<h3 class="font-headline-sm text-headline-sm text-electric-blue flex items-center gap-2">
						<Icon name="inventory_2" size="22" />
						Paquetes de Eventos
					</h3>
					<nav class="flex flex-col gap-3 font-body-md text-body-md text-on-surface-variant">
						<a class="hover:text-electric-blue transition-colors flex items-center gap-2" href="/packages/eco/">
							<Icon name="eco" size="18" />
							Eco Pack (290 €)
						</a>
						<a class="hover:text-electric-blue transition-colors flex items-center gap-2" href="/packages/wedding/">
							<Icon name="favorite" size="18" />
							Wedding Pack (650 €)
						</a>
						<a class="hover:text-electric-blue transition-colors flex items-center gap-2" href="/packages/product-presentation/">
							<Icon name="co_present" size="18" />
							Product Presentation (310 €)
						</a>
						<a class="hover:text-electric-blue transition-colors flex items-center gap-2" href="/packages/basic-mice/">
							<Icon name="groups" size="18" />
							Basic MICE Pack (295 €)
						</a>
						<a class="hover:text-electric-blue transition-colors flex items-center gap-2" href="/packages/mice/">
							<Icon name="corporate_fare" size="18" />
							MICE Pack (490 €)
						</a>
					</nav>
				</div>

				<!-- Información y Legales -->
				<div class="glass-panel rounded-xl p-6 flex flex-col gap-4 md:col-span-2">
					<h3 class="font-headline-sm text-headline-sm text-electric-blue flex items-center gap-2">
						<Icon name="gavel" size="22" />
						Información y Legales
					</h3>
					<div class="grid grid-cols-1 md:grid-cols-2 gap-4">
						<nav class="flex flex-col gap-3 font-body-md text-body-md text-on-surface-variant">
							<a class="hover:text-electric-blue transition-colors flex items-center gap-2" href="/about-us/">
								<Icon name="info" size="18" />
								Sobre Nuestra Agencia
							</a>
							<a class="hover:text-electric-blue transition-colors flex items-center gap-2" href="/meet-the-team/">
								<Icon name="groups" size="18" />
								Nuestro Equipo de Expertos
							</a>
							<a class="hover:text-electric-blue transition-colors flex items-center gap-2" href="/faq/">
								<Icon name="help" size="18" />
								Preguntas Frecuentes
							</a>
						</nav>
						<nav class="flex flex-col gap-3 font-body-md text-body-md text-on-surface-variant">
							<a class="hover:text-electric-blue transition-colors flex items-center gap-2" href="/terms-of-service/">
								<Icon name="policy" size="18" />
								Términos del Servicio
							</a>
							<a class="hover:text-electric-blue transition-colors flex items-center gap-2" href="/privacy-policy/">
								<Icon name="shield" size="18" />
								Política de Privacidad
							</a>
							<a class="hover:text-electric-blue transition-colors flex items-center gap-2" href="/cookie-policy/">
								<Icon name="cookie" size="18" />
								Política de Cookies
							</a>
							<a class="hover:text-electric-blue transition-colors flex items-center gap-2" href="/gdpr/">
								<Icon name="verified_user" size="18" />
								Cumplimiento del RGPD
							</a>
						</nav>
					</div>
				</div>
			</div>
		</section>

	</div>

	<!-- ── Blog Section ──────────────────────────────────────────────────────── -->
	<section class="mb-24">
		<div class="flex items-center gap-3 border-b border-border-glass pb-4 mb-8">
			<Icon name="article" size="32" className="text-electric-blue" />
			<h2 class="font-headline-md text-headline-md text-on-surface">Blog</h2>
		</div>

		<div class="grid grid-cols-1 md:grid-cols-3 gap-6">
			<!-- Categories -->
			<div class="glass-panel rounded-xl p-6 flex flex-col gap-4">
				<h3 class="font-headline-sm text-headline-sm text-electric-blue flex items-center gap-2">
					<Icon name="label" size="22" />
					<a href="/blog/categories/" class="hover:underline">
						{i18n.lang === 'en' ? 'Categories' : 'Categorías'}
					</a>
				</h3>
				<nav class="flex flex-col gap-2 font-body-md text-body-md text-on-surface-variant">
					<a class="hover:text-electric-blue transition-colors flex items-center gap-2" href="/blog/">
						<Icon name="rss_feed" size="18" />
						{i18n.lang === 'en' ? 'All Posts' : 'Todos los Posts'}
					</a>
					{#each data.categories as cat (cat.slug)}
						<a
							class="hover:text-electric-blue transition-colors flex items-center gap-2"
							href="/blog/category/{cat.slug}/"
						>
							<Icon name="folder" size="18" />
							{cat.name}
							<span class="text-xs opacity-60">({cat.count})</span>
						</a>
					{/each}
				</nav>
			</div>

			<!-- Authors -->
			<div class="glass-panel rounded-xl p-6 flex flex-col gap-4">
				<h3 class="font-headline-sm text-headline-sm text-electric-blue flex items-center gap-2">
					<Icon name="person" size="22" />
					{i18n.lang === 'en' ? 'Authors' : 'Autores'}
				</h3>
				<nav class="flex flex-col gap-2 font-body-md text-body-md text-on-surface-variant">
					{#each data.authors as author (author.slug)}
						<a
							class="hover:text-electric-blue transition-colors flex items-center gap-2"
							href="/blog/author/{author.slug}/"
						>
							<Icon name="account_circle" size="18" />
							{author.name}
							<span class="text-xs opacity-60">({author.count})</span>
						</a>
					{/each}
				</nav>
			</div>

			<!-- Recent Posts -->
			<div class="glass-panel rounded-xl p-6 flex flex-col gap-4">
				<h3 class="font-headline-sm text-headline-sm text-electric-blue flex items-center gap-2">
					<Icon name="history" size="22" />
					{i18n.lang === 'en' ? 'Recent Posts' : 'Posts Recientes'}
				</h3>
				<nav class="flex flex-col gap-2 font-body-md text-body-md text-on-surface-variant">
					{#each data.posts as post (post.slug)}
						<a
							class="hover:text-electric-blue transition-colors text-sm leading-snug"
							href="/blog/{post.slug}/"
						>
							{post.title}
						</a>
					{/each}
					<a
						class="hover:text-electric-blue transition-colors flex items-center gap-1 text-sm font-semibold mt-2"
						href="/blog/"
					>
						{i18n.lang === 'en' ? 'View all posts →' : 'Ver todos →'}
					</a>
				</nav>
			</div>
		</div>
	</section>
</div>
