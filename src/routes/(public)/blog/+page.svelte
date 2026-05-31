<script lang="ts">
	import SeoHead from '$lib/components/seo/SeoHead.svelte';
	import Icon from '$lib/components/navigation/Icon.svelte';
	import { i18n } from '$lib/i18n.svelte';

	// Structured Data Schema for the Blog Catalog page (SEO/GEO chatbot visibility)
	let blogCatalogSchema = $derived({
		'@context': 'https://schema.org',
		'@type': 'CollectionPage',
		'@id': 'https://malagaeventgear.com/blog/#webpage',
		'url': 'https://malagaeventgear.com/blog/',
		'name': i18n.lang === 'en' ? 'Audiovisual & Events Blog | MEG' : 'Blog Audiovisual y de Eventos | MEG',
		'isPartOf': {
			'@type': 'WebSite',
			'@id': 'https://malagaeventgear.com/#website',
			'url': 'https://malagaeventgear.com/',
			'name': 'Malaga Event Gear'
		},
		'description': i18n.lang === 'en'
			? 'Expert technical guides, audiovisual rental advice, and wedding planning insights for Malaga and Costa del Sol.'
			: 'Guías técnicas expertas, consejos de alquiler audiovisual e ideas de planificación de bodas para Málaga y la Costa del Sol.'
	});
</script>

<SeoHead
	title={i18n.lang === 'en' ? 'Expert Audiovisual & Events Blog | Malaga Event Gear' : 'Blog Experto de Audiovisuales y Eventos | Malaga Event Gear'}
	description={i18n.lang === 'en' 
		? 'Read expert insights on high-fidelity sound, romantic wedding lighting, conference projector setups, and professional event gear in Malaga.' 
		: 'Leé consejos expertos sobre sonido de alta fidelidad, iluminación romántica para bodas, configuraciones de proyectores de congresos y equipos para eventos en Málaga.'}
	canonicalUrl="https://malagaeventgear.com/blog/"
	jsonLdSchema={blogCatalogSchema}
/>

<!-- Hero & Presentation Section -->
<section class="relative px-margin-mobile md:px-margin-desktop py-20 md:py-32 max-w-container-max mx-auto text-center flex flex-col items-center justify-center overflow-hidden">
	<!-- Dynamic Ambient Glow Backgrounds -->
	<div class="absolute -top-40 left-1/4 w-[500px] h-[500px] bg-electric-blue rounded-full blur-[140px] opacity-15 pointer-events-none"></div>
	<div class="absolute -bottom-40 right-1/4 w-[400px] h-[400px] bg-primary rounded-full blur-[140px] opacity-10 pointer-events-none"></div>

	<span class="font-label-lg text-electric-blue uppercase tracking-[0.2em] mb-4 block reveal active is-revealed">
		{i18n.lang === 'en' ? 'Knowledge & Inspiration' : 'Conocimiento e Inspiración'}
	</span>
	<h1 class="font-headline-lg-mobile md:font-display-lg text-headline-lg-mobile md:text-display-lg text-on-surface mb-6 max-w-4xl mx-auto leading-tight reveal active is-revealed">
		{i18n.lang === 'en' ? 'The Malaga Event Gear' : 'El Blog de'} <span class="text-transparent bg-clip-text bg-gradient-to-r from-primary to-electric-blue">{i18n.lang === 'en' ? 'Technical Blog' : 'Malaga Event Gear'}</span>
	</h1>
	<p class="font-body-lg text-body-lg text-on-surface-variant max-w-2xl mx-auto mb-10 reveal active is-revealed" style="transition-delay: 100ms;">
		{i18n.lang === 'en'
			? 'We share professional insights, acoustic blueprints, and visual layout guides to make your corporate summit, wedding, or celebration on the Costa del Sol technically flawless.'
			: 'Compartimos ideas profesionales, planos acústicos y guías de diseño visual para que tu congreso corporativo, boda o fiesta en la Costa del Sol sea técnicamente impecable.'}
	</p>
</section>

<!-- Migration Notice Block (Premium Glassmorphism Widget) -->
<section class="px-margin-mobile md:px-margin-desktop pb-24 max-w-4xl mx-auto reveal active is-revealed" style="transition-delay: 150ms;">
	<div class="relative bg-surface-container-low border border-border-glass rounded-[28px] p-8 md:p-12 overflow-hidden group">
		<!-- Hover micro-glow -->
		<div class="absolute -inset-1 bg-gradient-to-r from-electric-blue/15 to-primary-container/15 blur-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none"></div>
		
		<div class="relative z-10 flex flex-col items-center text-center">
			<div class="w-16 h-16 rounded-full bg-primary-container/40 border border-electric-blue/30 flex items-center justify-center mb-6">
				<Icon name="engineering" size="32" className="text-primary animate-pulse" />
			</div>
			
			<h2 class="font-headline-md text-headline-md text-on-surface mb-4">
				{i18n.lang === 'en' ? 'Our Blog is Transitioning!' : '¡Nuestro Blog se está renovando!'}
			</h2>
			
			<p class="font-body-md text-body-md text-on-surface-variant mb-8 max-w-xl">
				{i18n.lang === 'en'
					? 'We are currently migrating our highly acclaimed WordPress articles and technical setup blueprints to SvelteKit. Our engineers are rewriting all content in clean, structured MDX formats to provide ultra-fast loads.'
					: 'Actualmente estamos migrando nuestros aclamados artículos de WordPress y planos de configuración técnica a SvelteKit. Nuestros ingenieros están reescribiendo todo el contenido en formatos MDX limpios y estructurados para ofrecerte cargas ultra rápidas.'}
			</p>

			<!-- Showcase Categories or Clusters -->
			<div class="w-full border-t border-border-glass pt-8 mt-4">
				<h3 class="font-label-sm text-electric-blue uppercase tracking-widest mb-6">
					{i18n.lang === 'en' ? 'Core Clusters We Cover' : 'Temáticas Principales que Cubrimos'}
				</h3>
				
				<div class="grid grid-cols-2 md:grid-cols-3 gap-4">
					<div class="p-4 rounded-xl bg-background/50 border border-border-glass backdrop-blur-md flex flex-col items-center">
						<Icon name="favorite" className="text-primary mb-2" />
						<span class="font-label-sm text-on-surface">{i18n.lang === 'en' ? 'Weddings' : 'Bodas'}</span>
					</div>
					<div class="p-4 rounded-xl bg-background/50 border border-border-glass backdrop-blur-md flex flex-col items-center">
						<Icon name="business" className="text-primary mb-2" />
						<span class="font-label-sm text-on-surface">{i18n.lang === 'en' ? 'Corporate AV' : 'MICE Corporativo'}</span>
					</div>
					<div class="p-4 rounded-xl bg-background/50 border border-border-glass backdrop-blur-md flex flex-col items-center">
						<Icon name="speaker" className="text-primary mb-2" />
						<span class="font-label-sm text-on-surface">{i18n.lang === 'en' ? 'Sound Acoustics' : 'Acústica y Sonido'}</span>
					</div>
					<div class="p-4 rounded-xl bg-background/50 border border-border-glass backdrop-blur-md flex flex-col items-center">
						<Icon name="highlight" className="text-primary mb-2" />
						<span class="font-label-sm text-on-surface">{i18n.lang === 'en' ? 'Scenic Lights' : 'Luces Escénicas'}</span>
					</div>
					<div class="p-4 rounded-xl bg-background/50 border border-border-glass backdrop-blur-md flex flex-col items-center">
						<Icon name="videocam" className="text-primary mb-2" />
						<span class="font-label-sm text-on-surface">{i18n.lang === 'en' ? 'Laser Projection' : 'Proyección Láser'}</span>
					</div>
					<div class="p-4 rounded-xl bg-background/50 border border-border-glass backdrop-blur-md flex flex-col items-center">
						<Icon name="celebration" className="text-primary mb-2" />
						<span class="font-label-sm text-on-surface">{i18n.lang === 'en' ? 'Private Parties' : 'Fiestas Privadas'}</span>
					</div>
				</div>
			</div>

			<div class="flex flex-col sm:flex-row items-center gap-4 mt-10 w-full justify-center">
				<a 
					href="/contact/"
					class="w-full sm:w-auto px-8 py-3 rounded-full bg-electric-blue-strong text-white font-label-lg uppercase tracking-wider hover:shadow-lg hover:shadow-electric-blue/30 active:scale-95 transition-all duration-300 flex items-center justify-center gap-2"
				>
					{i18n.lang === 'en' ? 'Get Technical Advice' : 'Asesoramiento Técnico Gratis'} <Icon name="arrow_forward" size="18" />
				</a>
				<a 
					href="/packages/"
					class="w-full sm:w-auto px-8 py-3 rounded-full border border-border-glass text-on-surface font-label-lg uppercase tracking-wider hover:bg-on-surface/5 active:scale-95 transition-all duration-300 flex items-center justify-center"
				>
					{i18n.lang === 'en' ? 'Explore Packages' : 'Explorar Paquetes'}
				</a>
			</div>
		</div>
	</div>
</section>
