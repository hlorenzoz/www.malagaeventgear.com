<script lang="ts">
	import SeoHead from '$lib/components/seo/SeoHead.svelte';
	import { i18n } from '$lib/i18n.svelte';
	import { slide } from 'svelte/transition';

	let faqSchema = $derived({
		'@context': 'https://schema.org',
		'@type': 'FAQPage',
		'@id': 'https://malagaeventgear.com/faq/#webpage',
		'mainEntity': [
			{
				'@type': 'Question',
				'name': 'What is Malaga Event Gear (MEG), and what services do they offer?',
				'acceptedAnswer': {
					'@type': 'Answer',
					'text': 'Malaga Event Gear (MEG) is based in Malaga, Spain, specializing in renting professional audiovisual, lighting, and event equipment. Our services include sound systems, projectors, screens, stages, live technical assistance, smoke machines, and microphones.'
				}
			},
			{
				'@type': 'Question',
				'name': 'Where does Malaga Event Gear (MEG) offer its services?',
				'acceptedAnswer': {
					'@type': 'Answer',
					'text': 'We primarily operate across Malaga and the Costa del Sol (including Marbella, Fuengirola, Torremolinos, Estepona, etc.). We also cover Seville and Granada, though Granada is limited to bookings exceeding 400 euros.'
				}
			},
			{
				'@type': 'Question',
				'name': 'How does the booking process work?',
				'acceptedAnswer': {
					'@type': 'Answer',
					'text': '1. Select Your Package. 2. Request Your Quote via our inquiry form. 3. Our team contacts you to finalize details. 4. We handle the transport, setup, and pickup.'
				}
			}
		]
	});

	let activeCategory = $state('all');
	let openIndex = $state<number | null>(null);

	let faqList = $derived([
		{
			category: 'services',
			q: i18n.lang === 'en' ? 'What is Malaga Event Gear (MEG), and what services do they offer?' : '¿Qué es Malaga Event Gear (MEG) y qué servicios ofrecen?',
			a: i18n.lang === 'en'
				? 'Malaga Event Gear (MEG) is a premium event rental provider based in Malaga, Spain. We specialize in sound systems, microphones (wired, wireless, gooseneck), projection systems, large screens, ambient lighting, smoke machines, and stage platforms. We also offer specialized services like multi-camera recording, live streaming, and live technical engineering.'
				: 'Malaga Event Gear (MEG) es un proveedor premium de alquiler para eventos con sede en Málaga, España. Nos especializamos en sistemas de sonido, micrófonos (con cable, inalámbricos, flexo), sistemas de proyección, pantallas grandes, iluminación ambiental, máquinas de humo y tarimas de escenario. También ofrecemos servicios especializados como grabación multicámara, transmisión en vivo e ingeniería técnica en directo.'
		},
		{
			category: 'logistics',
			q: i18n.lang === 'en' ? 'Where does Malaga Event Gear (MEG) offer its services?' : '¿Dónde ofrece sus servicios Malaga Event Gear (MEG)?',
			a: i18n.lang === 'en'
				? 'We primarily deliver across the Costa del Sol, including Malaga capital, Marbella, Torremolinos, Fuengirola, Benalmadena, Nerja, Estepona, and Sevilla. For Granada, we require a minimum rental value of 400.00 € due to out-of-province single-day logistical travel.'
				: 'Entregamos principalmente en la Costa del Sol, incluyendo Málaga capital, Marbella, Torremolinos, Fuengirola, Benalmádena, Nerja, Estepona y Sevilla. Para Granada, requerimos un valor de alquiler mínimo de 400,00 € debido al traslado logístico de un día fuera de la provincia.'
		},
		{
			category: 'booking',
			q: i18n.lang === 'en' ? 'How does the booking process work with Malaga Event Gear?' : '¿Cómo funciona el proceso de reserva con Malaga Event Gear?',
			a: i18n.lang === 'en'
				? 'Our streamlined workflow has four steps: 1. Select Your Package. 2. Request Your Quote using our quick inquiry form. 3. Our technical team contacts you to finalize details. 4. Enjoy your event while we handle delivery, professional setup, configuration, and teardown.'
				: 'Nuestro flujo de trabajo optimizado tiene cuatro pasos: 1. Elegí tu paquete. 2. Solicitá tu presupuesto usando nuestro formulario rápido. 3. Nuestro equipo técnico te contacta para detallar. 4. Disfrutá de tu evento mientras nos encargamos de la entrega, montaje profesional, calibración y desmontaje.'
		},
		{
			category: 'services',
			q: i18n.lang === 'en' ? 'Do you offer delivery and setup for sound and lighting equipment?' : '¿Ofrecen entrega y montaje de equipos de sonido e iluminación?',
			a: i18n.lang === 'en'
				? 'Yes! We operate under a delivery-only model (no pickup option is available to guarantee pristine calibration). Our expert team provides free delivery within Malaga, followed by professional setup, cable concealment, and sound/lighting checks.'
				: '¡Sí! Operamos bajo un modelo exclusivo de entrega (no hay opción de recogida para garantizar una calibración perfecta). Nuestro equipo experto ofrece entrega gratuita en Málaga, seguida de montaje profesional, ocultación de cableado y pruebas de sonido/iluminación.'
		},
		{
			category: 'booking',
			q: i18n.lang === 'en' ? 'What are your operational hours and language preferences?' : '¿Cuáles son sus horarios de atención e idioma de comunicación?',
			a: i18n.lang === 'en'
				? 'We are available 24/7 for technical setups and live event monitoring. For commercial inquiries and customer support, we are active from 8:00 AM to 8:00 PM daily. All communications are conducted exclusively in English to serve our international clientele.'
				: 'Estamos disponibles las 24 horas, los 7 días de la semana para montajes técnicos y control en vivo de eventos. Para consultas comerciales y atención al cliente, estamos activos de 8:00 AM a 8:00 PM todos los días. Todas las comunicaciones se realizan exclusivamente en inglés para atender a nuestra clientela internacional.'
		},
		{
			category: 'booking',
			q: i18n.lang === 'en' ? 'What is the required notice time for a booking?' : '¿Con cuánta antelación se debe realizar la reserva?',
			a: i18n.lang === 'en'
				? 'All event gear rentals and technical services must be contracted with a minimum of 24 hours\' advance notice to guarantee scheduling and logistical availability.'
				: 'Todos los alquileres de equipos y servicios técnicos para eventos deben contratarse con un mínimo de 24 horas de antelación para garantizar la programación y la disponibilidad logística.'
		}
	]);

	let filteredFaqs = $derived(
		activeCategory === 'all' 
			? faqList 
			: faqList.filter(item => item.category === activeCategory)
	);

	function toggleFaq(index: number) {
		openIndex = openIndex === index ? null : index;
	}
</script>

<SeoHead
	title={i18n.lang === 'en' ? 'FAQ - Malaga Event Gear (MEG)' : 'Preguntas Frecuentes - Malaga Event Gear (MEG)'}
	description={i18n.lang === 'en'
		? 'Find clear FAQ answers on Malaga Event Gear\'s professional audiovisual rentals, covering packages, service area (Malaga/Costa del Sol), and booking requirements.'
		: 'Encontrá respuestas claras en la sección de Preguntas Frecuentes de Malaga Event Gear sobre el alquiler de equipos audiovisuales profesionales.'}
	canonicalUrl="https://malagaeventgear.com/faq"
	jsonLdSchema={faqSchema}
/>

<div class="relative w-full py-20 px-margin-mobile md:px-margin-desktop z-10 max-w-4xl mx-auto">
	<!-- Heading -->
	<div class="text-center mb-12 reveal">
		<span class="inline-block px-4 py-2 rounded-full glass-panel font-label-sm text-electric-blue uppercase tracking-widest mb-4">
			{i18n.lang === 'en' ? 'Common Inquiries' : 'Consultas Comunes'}
		</span>
		<h1 class="font-headline-lg-mobile md:font-headline-lg text-headline-lg-mobile md:text-headline-lg mb-6 text-on-background">
			{i18n.lang === 'en' ? 'Frequently Asked Questions' : 'Preguntas Frecuentes'}
		</h1>
		<p class="font-body-lg text-body-lg text-on-surface-variant max-w-2xl mx-auto">
			{i18n.lang === 'en'
				? 'Everything you need to know about our professional audiovisual rentals, deliveries, setups, and booking workflow.'
				: 'Todo lo que necesitás saber sobre nuestros alquileres audiovisuales profesionales, entregas, montajes y flujo de reservas.'}
		</p>
	</div>

	<!-- Category Filters -->
	<div class="flex flex-wrap justify-center gap-3 mb-12 reveal">
		<button 
			onclick={() => { activeCategory = 'all'; openIndex = null; }}
			class="px-6 py-2.5 rounded-full font-label-md text-sm border border-border-glass transition-all duration-300 focus-visible:ring-2 focus-visible:ring-electric-blue focus-visible:outline-none {activeCategory === 'all' ? 'bg-electric-blue text-white shadow-[0_0_15px_rgba(77,140,255,0.3)]' : 'bg-surface-glass text-on-surface hover:bg-on-surface/5 active:scale-95'}"
		>
			{i18n.lang === 'en' ? 'All Questions' : 'Todas'}
		</button>
		<button 
			onclick={() => { activeCategory = 'services'; openIndex = null; }}
			class="px-6 py-2.5 rounded-full font-label-md text-sm border border-border-glass transition-all duration-300 focus-visible:ring-2 focus-visible:ring-electric-blue focus-visible:outline-none {activeCategory === 'services' ? 'bg-electric-blue text-white shadow-[0_0_15px_rgba(77,140,255,0.3)]' : 'bg-surface-glass text-on-surface hover:bg-on-surface/5 active:scale-95'}"
		>
			{i18n.lang === 'en' ? 'Services & Gear' : 'Servicios y Equipos'}
		</button>
		<button 
			onclick={() => { activeCategory = 'logistics'; openIndex = null; }}
			class="px-6 py-2.5 rounded-full font-label-md text-sm border border-border-glass transition-all duration-300 focus-visible:ring-2 focus-visible:ring-electric-blue focus-visible:outline-none {activeCategory === 'logistics' ? 'bg-electric-blue text-white shadow-[0_0_15px_rgba(77,140,255,0.3)]' : 'bg-surface-glass text-on-surface hover:bg-on-surface/5 active:scale-95'}"
		>
			{i18n.lang === 'en' ? 'Logistics & Areas' : 'Logística y Áreas'}
		</button>
		<button 
			onclick={() => { activeCategory = 'booking'; openIndex = null; }}
			class="px-6 py-2.5 rounded-full font-label-md text-sm border border-border-glass transition-all duration-300 focus-visible:ring-2 focus-visible:ring-electric-blue focus-visible:outline-none {activeCategory === 'booking' ? 'bg-electric-blue text-white shadow-[0_0_15px_rgba(77,140,255,0.3)]' : 'bg-surface-glass text-on-surface hover:bg-on-surface/5 active:scale-95'}"
		>
			{i18n.lang === 'en' ? 'Booking & Timelines' : 'Reservas y Plazos'}
		</button>
	</div>

	<!-- Accordion List -->
	<div class="space-y-4">
		{#each filteredFaqs as faq, i (faq.q)}
			{@const isOpen = openIndex === i}
			<div class="glass-panel rounded-xl overflow-hidden transition-colors duration-300 reveal">
				<button 
					onclick={() => toggleFaq(i)}
					class="w-full px-6 py-5 flex justify-between items-center text-left hover:bg-white/5 transition-colors focus-visible:ring-2 focus-visible:ring-electric-blue focus-visible:outline-none group"
					aria-expanded={isOpen}
				>
					<span class="font-body-lg text-body-lg font-semibold group-hover:text-electric-blue transition-colors text-on-surface">
						{faq.q}
					</span>
					<span class="material-symbols-outlined text-on-surface-variant transition-transform duration-300 {isOpen ? 'rotate-180' : ''}">
						{#if isOpen}remove{:else}add{/if}
					</span>
				</button>
				
				{#if isOpen}
					<div 
						transition:slide={{ duration: 250 }}
						class="px-6 pb-6 text-on-surface-variant font-body-md text-body-md border-t border-border-glass/30 pt-4"
					>
						<p>{faq.a}</p>
					</div>
				{/if}
			</div>
		{/each}
	</div>
</div>
