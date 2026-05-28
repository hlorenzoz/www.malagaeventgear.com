<script lang="ts">
	import SeoHead from '$lib/components/seo/SeoHead.svelte';
	import { i18n } from '$lib/i18n.svelte';

	let teamSchema = $derived({
		'@context': 'https://schema.org',
		'@graph': [
			{
				'@type': 'WebPage',
				'@id': 'https://malagaeventgear.com/meet-the-team/#webpage',
				'url': 'https://malagaeventgear.com/meet-the-team/',
				'name': i18n.lang === 'en' ? 'Meet The Team - Malaga Event Gear (MEG)' : 'Nuestro Equipo - Malaga Event Gear (MEG)',
				'description': i18n.lang === 'en'
					? 'Meet the team at Malaga Event Gear! Learn about our experienced team driving our professional service and seamless events in Malaga, Spain.'
					: 'Conocé al equipo de Malaga Event Gear. Descubrí al equipo experimentado detrás de nuestro servicio profesional y montajes sin contratiempos.'
			},
			{
				'@type': 'Person',
				'@id': 'https://malagaeventgear.com/author/hector-luis-lorenzo/',
				'name': 'Hector Luis Lorenzo',
				'description': 'Hector Luis Lorenzo is a SEO specialist with more than two years of experience helping brands grow their online visibility. He is the co-founder of Malaga Event Gear.',
				'url': 'https://malagaeventgear.com/author/hector-luis-lorenzo/',
				'worksFor': {
					'@type': 'LocalBusiness',
					'@id': 'https://malagaeventgear.com/#organization',
					'name': 'Malaga Event Gear'
				}
			}
		]
	});
</script>

<SeoHead
	title={i18n.lang === 'en' ? 'Meet The Team - Malaga Event Gear (MEG)' : 'Nuestro Equipo - Malaga Event Gear (MEG)'}
	description={i18n.lang === 'en'
		? 'Meet the team at Malaga Event Gear! Learn about our experienced team driving our professional service and seamless events in Malaga, Spain.'
		: 'Conocé al equipo de Malaga Event Gear. Descubrí al equipo experimentado detrás de nuestro servicio profesional y montajes sin contratiempos.'}
	canonicalUrl="https://malagaeventgear.com/meet-the-team"
	jsonLdSchema={teamSchema}
/>

<div class="relative w-full py-20 px-margin-mobile md:px-margin-desktop z-10 max-w-container-max mx-auto">
	<!-- Heading -->
	<div class="text-center mb-16 reveal">
		<span class="inline-block px-4 py-2 rounded-full glass-panel font-label-sm text-electric-blue uppercase tracking-widest mb-4">
			{i18n.lang === 'en' ? 'Who is Behind MEG' : 'Quiénes Están Detrás'}
		</span>
		<h1 class="font-headline-lg-mobile md:font-headline-lg text-headline-lg-mobile md:text-headline-lg mb-6 text-on-background">
			{i18n.lang === 'en' ? 'Meet The Team' : 'Nuestro Equipo'}
		</h1>
		<p class="font-body-lg text-body-lg text-on-surface-variant max-w-2xl mx-auto">
			{i18n.lang === 'en'
				? 'Meet the talented specialists at Malaga Event Gear. From setup to real-time engineering, we guarantee a stress-free experience.'
				: 'Conocé a los talentosos especialistas de Malaga Event Gear. Desde el montaje hasta la asistencia en tiempo real, garantizamos un evento sin estrés.'}
		</p>
	</div>

	<!-- Team Cards Grid -->
	<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-gutter items-stretch mb-24">
		<!-- Technical Personnel -->
		<div class="glass-panel rounded-xl p-8 flex flex-col justify-between items-center text-center relative overflow-hidden group">
			<div class="absolute -top-24 -right-24 w-48 h-48 bg-electric-blue/5 rounded-full blur-3xl pointer-events-none group-hover:scale-125 transition-transform duration-500"></div>
			<div class="flex flex-col items-center">
				<div class="w-24 h-24 rounded-full bg-surface-glass border border-border-glass flex items-center justify-center text-electric-blue mb-6">
					<span class="material-symbols-outlined text-[48px]">engineering</span>
				</div>
				<h2 class="font-headline-sm text-headline-sm text-on-surface mb-2">
					{i18n.lang === 'en' ? 'Technical Personnel' : 'Personal Técnico'}
				</h2>
				<p class="font-label-sm text-label-sm text-electric-blue uppercase tracking-widest mb-4">
					{i18n.lang === 'en' ? 'AV Engineering & Setup' : 'Ingeniería AV y Montaje'}
				</p>
				<p class="font-body-md text-body-md text-on-surface-variant leading-relaxed">
					{i18n.lang === 'en'
						? 'Experienced audiovisual technicians who ensure the seamless setup and smooth operation of all sound, lighting, and screen equipment.'
						: 'Técnicos audiovisuales experimentados que garantizan un montaje sin problemas y un funcionamiento impecable de todos los equipos de sonido, luces y pantallas.'}
				</p>
			</div>
		</div>

		<!-- Sales Personnel -->
		<div class="glass-panel rounded-xl p-8 flex flex-col justify-between items-center text-center relative overflow-hidden group">
			<div class="absolute -top-24 -right-24 w-48 h-48 bg-electric-blue/5 rounded-full blur-3xl pointer-events-none group-hover:scale-125 transition-transform duration-500"></div>
			<div class="flex flex-col items-center">
				<div class="w-24 h-24 rounded-full bg-surface-glass border border-border-glass flex items-center justify-center text-electric-blue mb-6">
					<span class="material-symbols-outlined text-[48px]">support_agent</span>
				</div>
				<h2 class="font-headline-sm text-headline-sm text-on-surface mb-2">
					{i18n.lang === 'en' ? 'Sales Team' : 'Equipo Comercial'}
				</h2>
				<p class="font-label-sm text-label-sm text-electric-blue uppercase tracking-widest mb-4">
					{i18n.lang === 'en' ? 'Client Support & Booking' : 'Atención al Cliente y Reservas'}
				</p>
				<p class="font-body-md text-body-md text-on-surface-variant leading-relaxed">
					{i18n.lang === 'en'
						? 'Our sales team guides you through selecting the ideal package and assists with receiving your custom quote to finalize your booking.'
						: 'Nuestro equipo de ventas te guía en la selección del paquete ideal y te ayuda a recibir tu presupuesto personalizado para concretar tu reserva.'}
				</p>
			</div>
		</div>

		<!-- Hector Luis Lorenzo -->
		<div class="glass-panel rounded-xl p-8 flex flex-col justify-between items-center text-center relative overflow-hidden group">
			<div class="absolute -top-24 -right-24 w-48 h-48 bg-electric-blue/5 rounded-full blur-3xl pointer-events-none group-hover:scale-125 transition-transform duration-500"></div>
			<div class="flex flex-col items-center">
				<div class="w-24 h-24 rounded-full bg-surface-glass border border-border-glass flex items-center justify-center text-electric-blue mb-6 overflow-hidden">
					<span class="material-symbols-outlined text-[48px]">person</span>
				</div>
				<h2 class="font-headline-sm text-headline-sm text-on-surface mb-2">
					Hector Luis Lorenzo
				</h2>
				<p class="font-label-sm text-label-sm text-electric-blue uppercase tracking-widest mb-4">
					{i18n.lang === 'en' ? 'SEO Specialist & Co-founder' : 'Especialista SEO y Co-fundador'}
				</p>
				<p class="font-body-md text-body-md text-on-surface-variant leading-relaxed mb-6">
					{i18n.lang === 'en'
						? 'SEO specialist who applies his expertise to strengthen the company’s digital presence and attract clients through effective search engine driven strategies.'
						: 'Especialista en SEO que aplica su experiencia para fortalecer la presencia digital de la empresa y atraer clientes mediante estrategias de posicionamiento efectivas.'}
				</p>
				<div class="flex items-center gap-3">
					<a 
						href="https://www.linkedin.com/in/hlorenzoz/" 
						target="_blank" 
						rel="noopener noreferrer" 
						class="text-on-surface-variant hover:text-electric-blue transition-colors"
						aria-label="LinkedIn profile"
					>
						<svg class="w-6 h-6 fill-current" viewBox="0 0 24 24">
							<path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.32 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.79M6.88 8.56a1.68 1.68 0 0 0 1.68-1.68c0-.93-.75-1.69-1.68-1.69a1.69 1.69 0 0 0-1.69 1.69c0 .93.76 1.68 1.69 1.68m1.39 9.94v-8.37H5.5v8.37h2.77z"/>
						</svg>
					</a>
				</div>
			</div>
		</div>
	</div>
</div>
