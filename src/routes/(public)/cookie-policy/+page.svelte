<script lang="ts">
	import SeoHead from '$lib/components/seo/SeoHead.svelte';
	import { i18n } from '$lib/i18n.svelte';

	let cookiesSchema = $derived({
		'@context': 'https://schema.org',
		'@type': 'WebPage',
		'@id': 'https://malagaeventgear.com/cookie-policy/#webpage',
		'url': 'https://malagaeventgear.com/cookie-policy/',
		'name': i18n.lang === 'en' ? 'Cookie Policy - Malaga Event Gear (MEG)' : 'Política de Cookies - Malaga Event Gear (MEG)',
		'description': i18n.lang === 'en'
			? 'Understand how Malaga Event Gear uses cookies and tracking technologies to optimize website usability and analyze performance.'
			: 'Comprendé cómo Malaga Event Gear utiliza cookies y tecnologías de seguimiento para optimizar la usabilidad del sitio web.'
	});
</script>

<SeoHead
	title={i18n.lang === 'en' ? 'Cookie Policy - Malaga Event Gear (MEG)' : 'Política de Cookies - Malaga Event Gear (MEG)'}
	description={i18n.lang === 'en'
		? 'Understand how Malaga Event Gear uses cookies and tracking technologies to optimize website usability and analyze performance.'
		: 'Comprendé cómo Malaga Event Gear utiliza cookies y tecnologías de seguimiento para optimizar la usabilidad del sitio web.'}
	canonicalUrl="https://malagaeventgear.com/cookie-policy"
	jsonLdSchema={cookiesSchema}
/>

<div class="relative w-full py-20 px-margin-mobile md:px-margin-desktop z-10 max-w-4xl mx-auto">
	<div class="text-center mb-16 reveal">
		<span class="inline-block px-4 py-2 rounded-full glass-panel font-label-sm text-electric-blue uppercase tracking-widest mb-4">
			{i18n.lang === 'en' ? 'Tracking & Usability' : 'Seguimiento y Usabilidad'}
		</span>
		<h1 class="font-headline-lg-mobile md:font-headline-lg text-headline-lg-mobile md:text-headline-lg mb-4 text-on-background">
			{i18n.lang === 'en' ? 'Cookie Policy' : 'Política de Cookies'}
		</h1>
		<p class="font-body-md text-body-md text-on-surface-variant">
			{i18n.lang === 'en'
				? 'Effective Date: October 16, 2025'
				: 'Fecha de Vigencia: 16 de Octubre de 2025'}
		</p>
	</div>

	<div class="glass-panel rounded-xl p-8 md:p-12 space-y-8 text-on-surface-variant font-body-md leading-relaxed">
		<div>
			<h2 class="font-headline-sm text-headline-sm text-on-surface mb-4">
				{i18n.lang === 'en' ? 'What are Cookies?' : '¿Qué son las Cookies?'}
			</h2>
			<p>
				{i18n.lang === 'en'
					? 'Cookies are small text files placed on your device when you visit our website. They help the website work more efficiently, allow us to persist your language preferences (e.g. EN/ES), and provide anonymous analytical data to our team.'
					: 'Las cookies son pequeños archivos de texto que se colocan en tu dispositivo cuando visitás nuestro sitio web. Ayudan a que el sitio funcione de manera más eficiente, nos permiten persistir tus preferencias de idioma (por ejemplo, EN/ES) y brindan datos analíticos anónimos a nuestro equipo.'}
			</p>
		</div>

		<div>
			<h2 class="font-headline-sm text-headline-sm text-on-surface mb-4">
				{i18n.lang === 'en' ? 'Categories of Cookies We Use' : 'Categorías de Cookies que Utilizamos'}
			</h2>
			<div class="space-y-4">
				<div>
					<h3 class="font-headline-xs text-headline-xs text-on-surface mb-2">
						1. {i18n.lang === 'en' ? 'Essential & Technical Cookies' : '1. Cookies Esenciales y Técnicas'}
					</h3>
					<p>
						{i18n.lang === 'en'
							? 'Highly essential for basic navigation, security, and the persistent operation of language preference selections. They cannot be turned off.'
							: 'Altamente esenciales para la navegación básica, la seguridad y el funcionamiento persistente de las selecciones de preferencias de idioma. No se pueden desactivar.'}
					</p>
				</div>
				<div>
					<h3 class="font-headline-xs text-headline-xs text-on-surface mb-2">
						2. {i18n.lang === 'en' ? 'Analytical & Performance Cookies' : '2. Cookies Analíticas y de Rendimiento'}
					</h3>
					<p>
						{i18n.lang === 'en'
							? 'We utilize Google Analytics and Google Search Console to monitor traffic, diagnostic bottlenecks, search query parameters, and site speed. All collected data is strictly aggregated and pseudonymized.'
							: 'Utilizamos Google Analytics y Google Search Console para monitorear el tráfico, diagnosticar cuellos de botella y velocidad del sitio. Todos los datos recopilados se agregan y se seudonimizan de manera estricta.'}
					</p>
				</div>
				<div>
					<h3 class="font-headline-xs text-headline-xs text-on-surface mb-2">
						3. {i18n.lang === 'en' ? 'Third-Party Verification Cookies' : '3. Cookies de Verificación de Terceros'}
					</h3>
					<p>
						{i18n.lang === 'en'
							? 'To display authentic customer testimonials verified directly from Google My Business, we integrate Trustindex. Trustindex may place cookies to track and validate review widgets dynamically.'
							: 'Para mostrar testimonios de clientes auténticos verificados directamente de Google My Business, integramos Trustindex. Trustindex puede colocar cookies para rastrear y validar dinámicamente los widgets de reseñas.'}
					</p>
				</div>
			</div>
		</div>

		<div>
			<h2 class="font-headline-sm text-headline-sm text-on-surface mb-4">
				{i18n.lang === 'en' ? 'Managing Your Preferences' : 'Gestión de tus Preferencias'}
			</h2>
			<p>
				{i18n.lang === 'en'
					? 'You can easily decline or block cookies through your individual browser preferences. However, please note that restricting all cookies may impact your access to advanced functionalities, such as automated form fillings or persistent language selections.'
					: 'Podés rechazar o bloquear fácilmente las cookies a través de las preferencias de tu navegador. Sin embargo, tené en cuenta que restringir todas las cookies puede afectar tu acceso a funcionalidades avanzadas, como el llenado automático de formularios o las selecciones de idioma persistentes.'}
			</p>
		</div>
	</div>
</div>
