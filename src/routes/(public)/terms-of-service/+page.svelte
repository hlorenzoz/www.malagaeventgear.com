<script lang="ts">
	import SeoHead from '$lib/components/seo/SeoHead.svelte';
	import { i18n } from '$lib/i18n.svelte';

	let termsSchema = $derived({
		'@context': 'https://schema.org',
		'@type': 'WebPage',
		'@id': 'https://malagaeventgear.com/terms-of-service/#webpage',
		'url': 'https://malagaeventgear.com/terms-of-service/',
		'name': i18n.lang === 'en' ? 'Terms of Service - Malaga Event Gear (MEG)' : 'Términos del Servicio - Malaga Event Gear (MEG)',
		'description': i18n.lang === 'en'
			? 'Read the official Terms of Service for Malaga Event Gear rentals. Understand our policies on booking, payments, and secure service.'
			: 'Leé los Términos de Servicio oficiales para el alquiler en Malaga Event Gear. Entendé nuestras políticas de reservas, pagos y servicios.'
	});
</script>

<SeoHead
	title={i18n.lang === 'en' ? 'Terms of Service - Malaga Event Gear (MEG)' : 'Términos del Servicio - Malaga Event Gear (MEG)'}
	description={i18n.lang === 'en'
		? 'Read the official Terms of Service for Malaga Event Gear rentals. Understand our policies on booking, payments, and secure service.'
		: 'Leé los Términos de Servicio oficiales para el alquiler en Malaga Event Gear. Entendé nuestras políticas de reservas, pagos y servicios.'}
	canonicalUrl="https://malagaeventgear.com/terms-of-service/"
	jsonLdSchema={termsSchema}
/>

<div class="relative w-full py-20 px-margin-mobile md:px-margin-desktop z-10 max-w-4xl mx-auto">
	<div class="text-center mb-16 reveal">
		<span class="inline-block px-4 py-2 rounded-full glass-panel font-label-sm text-electric-blue uppercase tracking-widest mb-4">
			{i18n.lang === 'en' ? 'Legal Framework' : 'Marco Legal'}
		</span>
		<h1 class="font-headline-lg-mobile md:font-headline-lg text-headline-lg-mobile md:text-headline-lg mb-4 text-on-background">
			{i18n.lang === 'en' ? 'Terms of Service' : 'Términos del Servicio'}
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
				1. {i18n.lang === 'en' ? 'Introduction and Acceptance of Terms' : 'Introducción y Aceptación de los Términos'}
			</h2>
			<p>
				{i18n.lang === 'en'
					? 'By accessing or using the services provided by Malaga Event Gear (MEG), you agree to be bound by these Terms of Service. Malaga Event Gear provides professional sound, lighting, and event equipment rentals for various occasions including weddings, private parties, corporate events, meetings, and MICE conferences.'
					: 'Al acceder o utilizar los servicios proporcionados por Malaga Event Gear (MEG), aceptás estar sujeto a estos Términos de Servicio. Malaga Event Gear ofrece alquiler de equipos profesionales de sonido, iluminación y eventos para diversas ocasiones, incluyendo bodas, fiestas privadas, eventos corporativos, reuniones y conferencias MICE.'}
			</p>
		</div>

		<div>
			<h2 class="font-headline-sm text-headline-sm text-on-surface mb-4">
				2. {i18n.lang === 'en' ? 'Scope of Service & Offerings' : 'Alcance del Servicio y Ofertas'}
			</h2>
			<p class="mb-4">
				{i18n.lang === 'en'
					? 'We specialize in offering high-fidelity active acoustic PA systems, professional lighting solutions (wash lights, LED bars, moving heads), high-lumen projection units, microphones (wired, wireless, gooseneck), fog machines, and stage platforms.'
					: 'Nos especializamos en ofrecer sistemas PA acústicos activos de alta fidelidad, soluciones de iluminación profesional (focos wash, barras LED, cabezas móviles), proyectores de altos lúmenes, micrófonos (con cable, inalámbricos, flexo), máquinas de humo y tarimas de escenario.'}
			</p>
			<p>
				{i18n.lang === 'en'
					? 'Many of our packages, such as the Wedding Pack and MICE Pack, include transport, professional installation, on-site live technical support, and post-event breakdown for a completely stress-free experience.'
					: 'Muchos de nuestros paquetes, como el Pack Boda y el Pack MICE, incluyen transporte, instalación profesional, soporte técnico en vivo en el sitio y desmontaje posterior al evento para una experiencia completamente libre de estrés.'}
			</p>
		</div>

		<div>
			<h2 class="font-headline-sm text-headline-sm text-on-surface mb-4">
				3. {i18n.lang === 'en' ? 'Geographical & Operational Limits' : 'Límites Geográficos y Operativos'}
			</h2>
			<p class="mb-4">
				{i18n.lang === 'en'
					? 'Our services are primarily concentrated in Malaga province and the Costa del Sol (including Malaga capital, Marbella, Fuengirola, Torremolinos, Estepona, Sevilla, and adjacent areas). Service to Granada is available only for packages exceeding 400.00 € due to out-of-province single-day travel overhead.'
					: 'Nuestros servicios se concentran principalmente en la provincia de Málaga y la Costa del Sol (incluyendo Málaga capital, Marbella, Fuengirola, Torremolinos, Estepona, Sevilla y zonas adyacentes). El servicio a Granada está disponible únicamente para paquetes que superen los 400,00 € debido a los gastos de viaje de un día fuera de la provincia.'}
			</p>
			<p class="mb-4">
				{i18n.lang === 'en'
					? 'Malaga Event Gear operates 7 days a week, from 8:00 AM to 8:00 PM for commercial inquiries, and 24/7 for technical logistics and setup support.'
					: 'Malaga Event Gear opera los 7 días de la semana, de 8:00 AM a 8:00 PM para consultas comerciales, y 24/7 para logística técnica y soporte de montaje.'}
			</p>
			<p>
				{i18n.lang === 'en'
					? 'To guarantee absolute technical accuracy for our international audience, all communication, documentation, and interface bookings are conducted solely in English.'
					: 'Para garantizar la absoluta precisión técnica para nuestro público internacional, toda la comunicación, documentación y reservas de la interfaz se realizan únicamente en inglés.'}
			</p>
		</div>

		<div>
			<h2 class="font-headline-sm text-headline-sm text-on-surface mb-4">
				4. {i18n.lang === 'en' ? 'Booking, Pricing & Security' : 'Reservas, Precios y Seguridad'}
			</h2>
			<p class="mb-4">
				{i18n.lang === 'en'
					? 'All service provisions must be contracted with a minimum of 24 hours\' advance notice. To finalize a booking, the client must provide the precise Localization (Location) and Horario (Schedule/Time) of the event.'
					: 'Todas las prestaciones de servicios deben contratarse con un mínimo de 24 horas de antelación. Para finalizar una reserva, el cliente debe proporcionar la Localización exacta y el Horario del evento.'}
			</p>
			<p>
				{i18n.lang === 'en'
					? 'All prices listed on our website are provided with VAT (+21%) not included. We guarantee that all payment transactions are 100% secure and processed using trusted financial gateways.'
					: 'Todos los precios indicados en nuestro sitio web se proporcionan con el IVA (+21%) no incluido. Garantizamos que todas las transacciones de pago son 100% seguras y se procesan utilizando pasarelas financieras de confianza.'}
			</p>
		</div>

		<div>
			<h2 class="font-headline-sm text-headline-sm text-on-surface mb-4">
				5. {i18n.lang === 'en' ? 'Client Obligations & Equipment Responsibility' : 'Obligaciones del Cliente y Responsabilidad del Equipo'}
			</h2>
			<p>
				{i18n.lang === 'en'
					? 'The client is responsible for ensuring venue access and necessary power outlets are available at the scheduled Localization and Horario. The client acknowledges that they are renting high-quality, professional gear, and must ensure the safety and physical integrity of the equipment during the agreed rental timeline.'
					: 'El cliente es responsable de garantizar el acceso al recinto y que las tomas de corriente necesarias estén disponibles en la Localización y Horario programados. El cliente reconoce que está alquilando equipos profesionales de alta calidad y debe garantizar la seguridad e integridad física de los mismos durante el período de alquiler acordado.'}
			</p>
		</div>
	</div>
</div>
