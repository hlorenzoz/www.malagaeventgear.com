<script lang="ts">
	import SeoHead from '$lib/components/seo/SeoHead.svelte';
	import { onMount } from 'svelte';
	import { i18n } from '$lib/i18n.svelte';
	import { slide } from 'svelte/transition';

	let contactSchema = $derived({
		'@context': 'https://schema.org',
		'@type': 'ContactPage',
		'name': i18n.lang === 'en' ? 'Contact Us - Malaga Event Gear' : 'Contáctanos - Malaga Event Gear',
		'description': i18n.lang === 'en'
			? 'Contact the technical team at Malaga Event Gear to request custom quotes for sound, lighting, and screen rentals.'
			: 'Contactá al equipo técnico de Malaga Event Gear para solicitar presupuestos personalizados de alquiler de sonido, iluminación y pantallas.',
		'url': 'https://malagaeventgear.com/contact-us',
		'mainEntity': {
			'@type': 'LocalBusiness',
			'name': 'Malaga Event Gear',
			'telephone': '+34600428750',
			'email': 'contact@malagaeventgear.com',
			'address': {
				'@type': 'PostalAddress',
				'streetAddress': 'Av. de Barcelona, 34',
				'addressLocality': 'Malaga',
				'postalCode': '29009',
				'addressCountry': 'ES'
			}
		}
	});

	let name = $state('');
	let email = $state('');
	let phone = $state('');
	let date = $state('');
	let eventType = $state('');
	let message = $state('');
	
	let isSubmitted = $state(false);
	let errorMessage = $state('');
	let openFaqIndex = $state<number | null>(null);

	onMount(() => {
		const params = new URLSearchParams(window.location.search);
		const pack = params.get('pack');
		const category = params.get('category');
		
		if (pack) {
			eventType = pack === 'wedding' ? 'wedding' : 'corporate';
			message = i18n.lang === 'en' 
				? `Hi, I am interested in booking the Pack: ${pack.toUpperCase()}. Please let me know the availability and details.`
				: `Hola, estoy interesado en reservar el Pack: ${pack.toUpperCase()}. Por favor, indíquenme disponibilidad y detalles.`;
		} else if (category) {
			message = i18n.lang === 'en'
				? `Hi, I am interested in booking equipment from the category: ${category.toUpperCase()}. I look forward to your quote.`
				: `Hola, estoy interesado en alquilar equipos de la categoría: ${category.toUpperCase()}. Quedo a la espera de su presupuesto.`;
		}
	});

	function handleSubmit(e: Event) {
		e.preventDefault();
		if (!name.trim() || !email.trim() || !message.trim()) {
			errorMessage = i18n.t.contact.formRequiredError;
			return;
		}
		errorMessage = '';
		isSubmitted = true;
	}

	let faqs = $derived([
		{
			q: i18n.lang === 'en' ? 'How does the booking process work?' : '¿Cómo funciona el proceso de reserva?',
			a: i18n.lang === 'en'
				? 'The process is simple: 1. Select your pack or equipment. 2. Fill out our quote form. 3. Our technical team contacts you to confirm specifications. Enjoy a stress-free event while we handle setup and teardown.'
				: 'El proceso es simple: 1. Elegís tu pack o equipos. 2. Completás nuestro formulario de presupuesto. 3. Nuestro equipo técnico te contacta para confirmar las especificaciones. Disfrutá de un evento sin estrés mientras nos encargamos del montaje y desmontaje.'
		},
		{
			q: i18n.lang === 'en' ? 'Where do you offer your services?' : '¿Dónde ofrecen sus servicios?',
			a: i18n.lang === 'en'
				? 'We operate mainly across the Costa del Sol, including Malaga, Marbella, Torremolinos, Fuengirola, Benalmadena, Estepona, and nearby areas. We also cover Seville, Granada, and Cordoba for specific projects.'
				: 'Operamos principalmente en la Costa del Sol, incluyendo Málaga, Marbella, Torremolinos, Fuengirola, Benalmádena, Estepona y zonas cercanas. También cubrimos Sevilla, Granada y Córdoba para proyectos específicos.'
		},
		{
			q: i18n.lang === 'en' ? 'Do you offer technical support during the event?' : '¿Ofrecen asistencia técnica durante el evento?',
			a: i18n.lang === 'en'
				? 'Yes, many of our packages (like the MICE Pack) already include a dedicated technician on-site to manage sound and displays. For smaller packages, you can optionally hire on-site assistance per hour or full day.'
				: 'Sí, muchos de nuestros paquetes (como el MICE Pack) ya incluyen un técnico dedicado en sitio para gestionar el sonido y las pantallas. Para paquetes más pequeños, podés contratar opcionalmente asistencia en sitio por hora o día completo.'
		}
	]);

	function toggleFaq(index: number) {
		openFaqIndex = openFaqIndex === index ? null : index;
	}
</script>

<SeoHead
	title={i18n.lang === 'en' ? 'Contact Us & Audiovisual Quotes | MEG' : 'Contáctanos y Presupuestos Audiovisuales | MEG'}
	description={i18n.lang === 'en'
		? 'Get in touch with Malaga Event Gear to request quotes for sound, lighting, and screen rentals. 24/7 technical support.'
		: 'Ponete en contacto con Malaga Event Gear para solicitar presupuestos de alquiler de sonido, iluminación y pantallas. Soporte técnico 24/7.'}
	canonicalUrl="https://malagaeventgear.com/contact-us"
	jsonLdSchema={contactSchema}
/>

<div class="pt-8 pb-24 max-w-container-max mx-auto w-full relative z-10 px-margin-mobile">
	<div class="text-center mb-16">
		<span class="inline-block px-4 py-2 rounded-full glass-panel font-label-sm text-electric-blue uppercase tracking-widest mb-4">
			{i18n.t.contact.badge}
		</span>
		<h1 class="font-headline-lg-mobile md:font-headline-lg text-headline-lg-mobile md:text-headline-lg mb-4 text-on-background">
			{i18n.t.contact.title}
		</h1>
		<p class="font-body-lg text-body-lg text-on-surface-variant max-w-2xl mx-auto">
			{i18n.t.contact.subtitle}
		</p>
	</div>

	<div class="grid grid-cols-1 lg:grid-cols-12 gap-gutter items-stretch">
		<!-- Sidebar Info -->
		<div class="lg:col-span-4 flex">
			<div class="glass-panel rounded-xl p-8 w-full flex flex-col justify-between">
				<div>
					<h3 class="font-headline-md text-headline-md mb-8 text-on-surface">{i18n.t.contact.detailsTitle}</h3>
					<div class="space-y-6">
						<div class="flex items-start space-x-4">
							<div class="bg-surface-glass p-3 rounded-lg border border-border-glass text-electric-blue flex items-center justify-center">
								<span class="material-symbols-outlined">call</span>
							</div>
							<div>
								<p class="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-widest mb-1">{i18n.t.contact.phone}</p>
								<a class="font-body-lg text-body-lg hover:text-electric-blue transition-colors text-on-surface" href="tel:+34600428750">
									+34 600 42 87 50
								</a>
							</div>
						</div>
						
						<div class="flex items-start space-x-4">
							<div class="bg-surface-glass p-3 rounded-lg border border-border-glass text-electric-blue flex items-center justify-center">
								<span class="material-symbols-outlined">chat</span>
							</div>
							<div>
								<p class="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-widest mb-1">{i18n.t.contact.whatsapp}</p>
								<a class="font-body-lg text-body-lg hover:text-electric-blue transition-colors text-on-surface" href="https://wa.me/34600428750" target="_blank" rel="noopener noreferrer">
									{i18n.lang === 'en' ? 'Send us a message' : 'Envianos un mensaje'}
								</a>
							</div>
						</div>
						
						<div class="flex items-start space-x-4">
							<div class="bg-surface-glass p-3 rounded-lg border border-border-glass text-electric-blue flex items-center justify-center">
								<span class="material-symbols-outlined">mail</span>
							</div>
							<div>
								<p class="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-widest mb-1">{i18n.t.contact.email}</p>
								<a class="font-body-md text-body-md hover:text-electric-blue transition-colors text-on-surface break-all" href="mailto:contact@malagaeventgear.com">
									contact@malagaeventgear.com
								</a>
							</div>
						</div>
						
						<div class="flex items-start space-x-4">
							<div class="bg-surface-glass p-3 rounded-lg border border-border-glass text-electric-blue flex items-center justify-center">
								<span class="material-symbols-outlined">location_on</span>
							</div>
							<div>
								<p class="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-widest mb-1">{i18n.t.contact.location}</p>
								<p class="font-body-md text-body-md text-on-surface-variant">
									Av. de Barcelona, 34, 3B<br />
									District Centro<br />
									29009 Malaga, Spain
								</p>
							</div>
						</div>
						
						<div class="flex items-start space-x-4">
							<div class="bg-surface-glass p-3 rounded-lg border border-border-glass text-electric-blue flex items-center justify-center">
								<span class="material-symbols-outlined">schedule</span>
							</div>
							<div>
								<p class="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-widest mb-1">{i18n.t.contact.hours}</p>
								<p class="font-body-md text-body-md text-on-surface-variant">
									{i18n.t.contact.hoursText}
								</p>
							</div>
						</div>
					</div>
				</div>
			</div>
		</div>

		<!-- Inquiry Form -->
		<div class="lg:col-span-8 flex">
			<div class="glass-panel rounded-xl p-8 md:p-12 w-full relative overflow-hidden flex flex-col justify-center">
				<div class="absolute -top-24 -right-24 w-64 h-64 bg-electric-blue/10 rounded-full blur-3xl pointer-events-none"></div>
				
				{#if isSubmitted}
					<div class="text-center py-12 space-y-6 animate-fade-in relative z-10">
						<div class="w-20 h-20 bg-electric-blue/20 text-electric-blue rounded-full flex items-center justify-center mx-auto mb-4 border border-electric-blue/30">
							<span class="material-symbols-outlined text-[48px]">check_circle</span>
						</div>
						<h2 class="font-headline-md text-headline-md text-on-surface">{i18n.t.contact.successTitle}</h2>
						<p class="font-body-lg text-body-lg text-on-surface-variant max-w-md mx-auto">
							{i18n.t.contact.successText1} <strong>{name}</strong>, {i18n.t.contact.successText2}<strong>{email}</strong>{i18n.t.contact.successText3}
						</p>
						<button 
							onclick={() => { isSubmitted = false; name = ''; email = ''; phone = ''; message = ''; date = ''; eventType = ''; }}
							class="px-8 py-3 rounded-full border border-border-glass bg-on-surface/5 hover:bg-on-surface/10 text-on-surface font-label-lg active:scale-95 transition-all"
						>
							{i18n.t.contact.successButton}
						</button>
					</div>
				{:else}
					<h2 class="font-headline-md text-headline-md mb-8 text-on-surface">{i18n.t.contact.reqTitle}</h2>
					<form onsubmit={handleSubmit} class="space-y-6 relative z-10">
						{#if errorMessage}
							<div class="p-4 rounded-lg bg-error-container/30 border border-error text-error text-sm font-body-md animate-fade-in">
								{errorMessage}
							</div>
						{/if}

						<div class="grid grid-cols-1 md:grid-cols-2 gap-6">
							<div class="relative">
								<input 
									type="text" 
									id="name"
									bind:value={name}
									required
									placeholder="Full Name"
									class="peer w-full bg-surface-glass border-b border-border-glass border-t-0 border-x-0 px-0 py-3 text-on-surface focus:ring-0 focus:border-electric-blue transition-colors placeholder-transparent"
								/>
								<label 
									for="name"
									class="absolute left-0 -top-3.5 text-on-surface-variant font-label-sm text-label-sm transition-all peer-placeholder-shown:text-body-md peer-placeholder-shown:top-3 peer-focus:-top-3.5 peer-focus:text-label-sm peer-focus:text-electric-blue"
								>
									{i18n.t.contact.formName}
								</label>
							</div>

							<div class="relative">
								<input 
									type="email" 
									id="email"
									bind:value={email}
									required
									placeholder="Email Address"
									class="peer w-full bg-surface-glass border-b border-border-glass border-t-0 border-x-0 px-0 py-3 text-on-surface focus:ring-0 focus:border-electric-blue transition-colors placeholder-transparent"
								/>
								<label 
									for="email"
									class="absolute left-0 -top-3.5 text-on-surface-variant font-label-sm text-label-sm transition-all peer-placeholder-shown:text-body-md peer-placeholder-shown:top-3 peer-focus:-top-3.5 peer-focus:text-label-sm peer-focus:text-electric-blue"
								>
									{i18n.t.contact.formEmail}
								</label>
							</div>
						</div>

						<div class="grid grid-cols-1 md:grid-cols-2 gap-6">
							<div class="relative">
								<input 
									type="tel" 
									id="phone"
									bind:value={phone}
									placeholder="Phone"
									class="peer w-full bg-surface-glass border-b border-border-glass border-t-0 border-x-0 px-0 py-3 text-on-surface focus:ring-0 focus:border-electric-blue transition-colors placeholder-transparent"
								/>
								<label 
									for="phone"
									class="absolute left-0 -top-3.5 text-on-surface-variant font-label-sm text-label-sm transition-all peer-placeholder-shown:text-body-md peer-placeholder-shown:top-3 peer-focus:-top-3.5 peer-focus:text-label-sm peer-focus:text-electric-blue"
								>
									{i18n.t.contact.formPhone}
								</label>
							</div>

							<div class="relative">
								<input 
									type="date" 
									id="date"
									bind:value={date}
									class="peer w-full bg-surface-glass border-b border-border-glass border-t-0 border-x-0 px-0 py-3 text-on-surface-variant focus:ring-0 focus:border-electric-blue transition-colors text-on-surface"
								/>
								<label 
									for="date"
									class="absolute left-0 -top-3.5 text-electric-blue font-label-sm text-label-sm"
								>
									{i18n.t.contact.formDate}
								</label>
							</div>
						</div>

						<div class="relative">
							<select 
								id="eventType"
								bind:value={eventType}
								class="w-full bg-surface-glass border-b border-border-glass border-t-0 border-x-0 px-0 py-3 text-on-surface focus:ring-0 focus:border-electric-blue transition-colors appearance-none"
							>
								<option class="bg-surface text-on-surface-variant" disabled value="">{i18n.t.contact.formType}</option>
								<option class="bg-surface" value="wedding">{i18n.t.contact.formTypeWedding}</option>
								<option class="bg-surface" value="corporate">{i18n.t.contact.formTypeCorporate}</option>
								<option class="bg-surface" value="party">{i18n.t.contact.formTypeParty}</option>
								<option class="bg-surface" value="conference">{i18n.t.contact.formTypeMice}</option>
								<option class="bg-surface" value="other">{i18n.t.contact.formTypeOther}</option>
							</select>
							<span class="material-symbols-outlined absolute right-0 top-3 text-on-surface-variant pointer-events-none">expand_more</span>
						</div>

						<div class="relative">
							<textarea 
								id="message"
								bind:value={message}
								required
								rows="4"
								placeholder="Message"
								class="peer w-full bg-surface-glass border-b border-border-glass border-t-0 border-x-0 px-0 py-3 text-on-surface focus:ring-0 focus:border-electric-blue transition-colors placeholder-transparent resize-none"
							></textarea>
							<label 
								for="message"
								class="absolute left-0 -top-3.5 text-on-surface-variant font-label-sm text-label-sm transition-all peer-placeholder-shown:text-body-md peer-placeholder-shown:top-3 peer-focus:-top-3.5 peer-focus:text-label-sm peer-focus:text-electric-blue"
							>
								{i18n.t.contact.formMessage}
							</label>
						</div>

						<button 
							type="submit"
							class="w-full bg-gradient-to-r from-electric-blue to-primary-container text-white py-4 rounded-lg font-label-lg tracking-wider uppercase hover:shadow-[0_0_20px_rgba(77,140,255,0.4)] active:scale-[0.98] transition-all duration-300"
						>
							{i18n.t.contact.formSubmit}
						</button>
					</form>
				{/if}
			</div>
		</div>
	</div>

	<!-- FAQ -->
	<section class="mt-32 max-w-4xl mx-auto">
		<h2 class="font-headline-md text-headline-md text-center mb-12 text-on-background">{i18n.t.contact.faqTitle}</h2>
		<div class="space-y-4">
			{#each faqs as faq, i}
				{@const isOpen = openFaqIndex === i}
				<div class="glass-panel rounded-xl overflow-hidden transition-colors duration-300">
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
							class="px-6 pb-5 text-on-surface-variant font-body-md text-body-md border-t border-border-glass/30 pt-3"
						>
							<p>{faq.a}</p>
						</div>
					{/if}
				</div>
			{/each}
		</div>
	</section>
</div>
