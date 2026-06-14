<script lang="ts">
	import SeoHead from '$lib/components/seo/SeoHead.svelte';
	import Icon from '$lib/components/navigation/Icon.svelte';
	import { onMount } from 'svelte';
	import { env } from '$env/dynamic/public';
	import { i18n } from '$lib/i18n.svelte';
	import { loadTurnstile } from '$lib/utils/turnstile';
	import { getContactFaqs, buildFaqSchema } from '$lib/data/faq';
	import { siteConfig } from '$lib/data/site';

	// Structured JSON-LD schema for the Contact Page
	let contactSchema = $derived({
		'@context': 'https://schema.org',
		'@type': 'ContactPage',
		'name': i18n.lang === 'en' ? 'Contact Us - Malaga Event Gear' : 'Contactanos - Malaga Event Gear',
		'description': i18n.lang === 'en'
			? 'Contact the technical team at Malaga Event Gear to request custom quotes for sound, lighting, and screen rentals.'
			: 'Contactá al equipo técnico de Malaga Event Gear para solicitar presupuestos personalizados de alquiler de sonido, iluminación y pantallas.',
		'url': 'https://malagaeventgear.com/contact',
		// Referencia al nodo de organización global (#organization) para no duplicar la entidad.
		'mainEntity': { '@id': 'https://malagaeventgear.com/#organization' }
	});

	// Reactive states managed by Svelte 5 Runes
	let name = $state('');
	let email = $state('');
	let phone = $state('');
	let date = $state('');
	let eventType = $state('');
	let message = $state('');
	
	let isSubmitted = $state(false);
	let errorMessage = $state('');
	let openFaqIndex = $state<number | null>(null);
	let isLoading = $state(false);

	// When arriving from a lead email-failure, the message is auto-generated and locked.
	let messageLocked = $state(false);

	// Anti-spam: honeypot (must stay empty) + Turnstile token (set by CF callback).
	let websiteHoneypot = $state('');
	let turnstileToken = $state('');
	const TURNSTILE_SITE_KEY = env.PUBLIC_TURNSTILE_SITE_KEY ?? '';

	// Earliest selectable event date = tomorrow (today and past dates are not bookable).
	// Built from local date parts to avoid UTC off-by-one from toISOString().
	const tomorrow = new Date();
	tomorrow.setDate(tomorrow.getDate() + 1);
	const minDate = `${tomorrow.getFullYear()}-${String(tomorrow.getMonth() + 1).padStart(2, '0')}-${String(tomorrow.getDate()).padStart(2, '0')}`;

	onMount(() => {
		// Capture query parameters if the user clicked from a specific pack
		const params = new URLSearchParams(window.location.search);
		const pack = params.get('pack');
		const category = params.get('category');
		const errtype = params.get('errtype');
		const lead = params.get('lead');

		if (errtype === 'email') {
			// Arrived from a lead whose confirmation/notification email failed.
			// Pre-fill a non-editable rescue message so the team can be reached.
			eventType = 'other';
			messageLocked = true;

			const intro = i18n.t.contact.errorPrefillMessage.replace('{ref}', lead || '—');

			// The submitted fields are carried via sessionStorage (set by LeadForm) to
			// avoid leaking PII through the URL. Append each non-empty value on its own line.
			let details = '';
			try {
				const raw = sessionStorage.getItem('meg:lead-error');
				sessionStorage.removeItem('meg:lead-error');
				if (raw) {
					const d = JSON.parse(raw) as Record<string, string>;
					const t = i18n.t.contact;
					const lines = [
						[t.errorDetailName, d.name],
						[t.errorDetailEmail, d.email],
						[t.errorDetailPhone, d.phone],
						[t.errorDetailDate, d.eventDate],
						[t.errorDetailPackage, d.packageId],
						[t.errorDetailComments, d.comments],
					]
						.filter(([, value]) => value && value.trim())
						.map(([label, value]) => `${label}: ${value}`);
					if (lines.length > 0) {
						details = `\n\n${t.errorDetailsHeader}\n${lines.join('\n')}`;
					}
				}
			} catch {
				// Malformed/unavailable storage — fall back to the intro only.
			}

			message = intro + details;
		} else if (pack) {
			eventType = pack === 'wedding' ? 'wedding' : 'corporate';
			message = i18n.lang === 'en'
				? `Hi, I am interested in booking the Pack: ${pack.toUpperCase()}. Please let me know the availability and details.`
				: `Hola, estoy interesado en reservar el Pack: ${pack.toUpperCase()}. Por favor, indíquenme disponibilidad y detalles.`;
		} else if (category) {
			message = i18n.lang === 'en'
				? `Hi, I am interested in booking equipment from the category: ${category.toUpperCase()}. I look forward to your quote.`
				: `Hola, estoy interesado en alquilar equipos de la categoría: ${category.toUpperCase()}. Quedo a la espera de su presupuesto.`;
		}

		// Load the Turnstile widget (no-op if the site key is absent, e.g. in dev).
		if (TURNSTILE_SITE_KEY) {
			loadTurnstile('_tsContactCallback', (token) => {
				turnstileToken = token;
			});
		}
	});

	async function handleSubmit(e: Event) {
		e.preventDefault();

		// Honeypot — silently pretend success.
		if (websiteHoneypot) {
			isSubmitted = true;
			return;
		}

		if (!name.trim() || !email.trim() || !message.trim()) {
			errorMessage = i18n.t.contact.formRequiredError;
			return;
		}
		// Guard against a past/today event date typed manually (native min only guards the picker).
		if (date && date < minDate) {
			errorMessage = i18n.lang === 'en'
				? 'Please choose an event date after today.'
				: 'Elegí una fecha de evento posterior a hoy.';
			return;
		}

		if (isLoading) return;
		isLoading = true;
		errorMessage = '';

		try {
			const res = await fetch('/api/contact', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({
					name: name.trim(),
					email: email.trim(),
					message: message.trim(),
					phone,
					eventDate: date,
					eventType,
					'cf-turnstile-response': turnstileToken,
					website: websiteHoneypot,
				}),
			});

			const data = (await res.json()) as { ok: boolean; error?: string };

			if (!res.ok || !data.ok) {
				if (data.error === 'turnstile-failed') {
					errorMessage = i18n.t.contact.formErrorTurnstile;
				} else if (data.error === 'rate_limited') {
					errorMessage = i18n.t.contact.formErrorRateLimited;
				} else if (data.error === 'validation-failed') {
					errorMessage = i18n.t.contact.formRequiredError;
				} else {
					errorMessage = i18n.t.contact.formErrorSubmit;
				}
				return;
			}

			// Success — note: if the contact email itself failed (emailStatus), we still
			// show success here to avoid a contact→contact redirect loop. The lead is saved.
			isSubmitted = true;
		} catch {
			errorMessage = i18n.t.contact.formErrorSubmit;
		} finally {
			isLoading = false;
		}
	}

	// Inquiry-oriented FAQs sourced from the centralized FAQ store (single source of truth)
	let contactFaqs = $derived(getContactFaqs());
	let faqs = $derived(
		contactFaqs.map((item) => ({
			q: item.question[i18n.lang],
			a: item.answer[i18n.lang]
		}))
	);

	// FAQPage structured data built from the same FAQs rendered on the page, so the
	// visible content and JSON-LD can never drift apart (Google rich-result requirement).
	let faqSchema = $derived(buildFaqSchema(contactFaqs, i18n.lang));

	function toggleFaq(index: number) {
		openFaqIndex = openFaqIndex === index ? null : index;
	}
</script>

<!-- SEO Head & JSON-LD Injection -->
<SeoHead
	title="Contact Us & Audiovisual Quotes | MEG"
	description="Get in touch with Malaga Event Gear to request quotes for sound, lighting, and screen rentals. 24/7 technical support."
	canonicalUrl="https://malagaeventgear.com/contact"
	jsonLdSchema={[contactSchema, faqSchema]}
/>

<!-- Main Content Canvas -->
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
		<!-- Contact Info Sidebar (4 Cols) -->
		<div class="lg:col-span-4 flex">
			<div class="glass-panel rounded-xl p-8 w-full flex flex-col justify-between">
				<div>
					<h2 class="font-headline-md text-headline-md mb-8 text-on-surface">{i18n.t.contact.detailsTitle}</h2>
					<div class="space-y-6">
						<div class="flex items-start space-x-4">
							<div class="bg-surface-glass p-3 rounded-lg border border-border-glass text-electric-blue flex items-center justify-center">
								<Icon name="call" />
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
								<Icon name="chat" />
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
								<Icon name="mail" />
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
								<Icon name="location_on" />
							</div>
							<div>
								<p class="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-widest mb-1">{i18n.t.contact.location}</p>
								<a class="font-body-md text-body-md text-on-surface-variant hover:text-electric-blue transition-colors" href={siteConfig.googleBusinessProfile} target="_blank" rel="noopener noreferrer">
									{siteConfig.displayAddress}
								</a>
							</div>
						</div>
						
						<div class="flex items-start space-x-4">
							<div class="bg-surface-glass p-3 rounded-lg border border-border-glass text-electric-blue flex items-center justify-center">
								<Icon name="schedule" />
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

		<!-- Inquiry Form (8 Cols) -->
		<div class="lg:col-span-8 flex">
			<div class="glass-panel rounded-xl p-8 md:p-12 w-full relative overflow-hidden flex flex-col justify-center">
				<!-- Subtle decorative glow -->
				<div class="absolute -top-24 -right-24 w-64 h-64 bg-electric-blue/10 rounded-full blur-3xl pointer-events-none"></div>
				
				{#if isSubmitted}
					<div class="text-center py-12 space-y-6 animate-fade-in relative z-10">
						<div class="w-20 h-20 bg-electric-blue/20 text-electric-blue rounded-full flex items-center justify-center mx-auto mb-4 border border-electric-blue/30">
							<Icon name="check_circle" size="48" />
						</div>
						<h2 class="font-headline-md text-headline-md text-on-surface">{i18n.t.contact.successTitle}</h2>
						<p class="font-body-lg text-body-lg text-on-surface-variant max-w-md mx-auto">
							{i18n.t.contact.successText1} <strong>{name}</strong>, {i18n.t.contact.successText2}<strong>{email}</strong>{i18n.t.contact.successText3}
						</p>
						<button 
							onclick={() => { isSubmitted = false; name = ''; email = ''; phone = ''; message = ''; date = ''; eventType = ''; messageLocked = false; }}
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
							<!-- Name -->
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

							<!-- Email -->
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
							<!-- Phone -->
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

							<!-- Date -->
							<div class="relative">
								<input
									type="date"
									id="date"
									bind:value={date}
									min={minDate}
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

						<!-- Event Type -->
						<div class="relative">
							<select
								id="eventType"
								aria-label={i18n.t.contact.formType}
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
							<Icon name="expand_more" className="absolute right-0 top-3 text-on-surface-variant pointer-events-none" />
						</div>

						<!-- Message -->
						<div class="relative">
							<textarea
								id="message"
								bind:value={message}
								required
								readonly={messageLocked}
								aria-readonly={messageLocked}
								rows={messageLocked ? 8 : 4}
								placeholder="Message"
								class="peer w-full bg-surface-glass border-b border-border-glass border-t-0 border-x-0 px-0 py-3 text-on-surface focus:ring-0 focus:border-electric-blue transition-colors placeholder-transparent resize-none {messageLocked ? 'opacity-70 cursor-not-allowed' : ''}"
							></textarea>
							<label
								for="message"
								class="absolute left-0 -top-3.5 bg-surface-container px-1.5 rounded text-on-surface-variant font-label-sm text-label-sm transition-all peer-placeholder-shown:bg-transparent peer-placeholder-shown:px-0 peer-placeholder-shown:text-body-md peer-placeholder-shown:top-3 peer-focus:-top-3.5 peer-focus:bg-surface-container peer-focus:px-1.5 peer-focus:text-label-sm peer-focus:text-electric-blue"
							>
								{i18n.t.contact.formMessage}
							</label>
							{#if messageLocked}
								<p class="mt-2 flex items-center gap-1.5 text-xs text-on-surface-variant/75">
									<Icon name="lock" size="14" />
									{i18n.t.contact.lockedFieldNote}
								</p>
							{/if}
						</div>

						<!-- Honeypot — visually hidden, must stay empty -->
						<input
							type="text"
							name="website"
							tabindex="-1"
							autocomplete="off"
							aria-hidden="true"
							bind:value={websiteHoneypot}
							class="absolute left-[-9999px] h-0 w-0 opacity-0"
						/>

						<!-- Turnstile widget (rendered only when a site key is configured) -->
						{#if TURNSTILE_SITE_KEY}
							<div
								class="cf-turnstile"
								data-sitekey={TURNSTILE_SITE_KEY}
								data-callback="_tsContactCallback"
								data-theme="dark"
							></div>
						{/if}

						<!-- Submit Button -->
						<button
							type="submit"
							disabled={isLoading}
							class="w-full bg-electric-blue-strong text-white py-4 rounded-lg font-label-lg tracking-wider uppercase hover:shadow-[0_0_20px_rgba(77,140,255,0.4)] active:scale-[0.98] transition-all duration-300 disabled:cursor-not-allowed disabled:opacity-60"
						>
							{isLoading ? i18n.t.contact.formSubmitting : i18n.t.contact.formSubmit}
						</button>
					</form>
				{/if}
			</div>
		</div>
	</div>

	<!-- FAQ Accordion Section -->
	<section class="mt-32 max-w-4xl mx-auto">
		<h2 class="font-headline-md text-headline-md text-center mb-12 text-on-background">{i18n.t.contact.faqTitle}</h2>
		<div class="space-y-4">
			{#each faqs as faq, i}
				{@const isOpen = openFaqIndex === i}
				<div class="glass-panel rounded-xl overflow-hidden transition-colors duration-300">
					<button 
						onclick={() => toggleFaq(i)}
						class="w-full px-6 py-5 flex justify-between items-center text-left hover:bg-white/5 transition-colors group"
						aria-expanded={isOpen}
					>
						<span class="font-body-lg text-body-lg font-semibold group-hover:text-electric-blue transition-colors text-on-surface">
							{faq.q}
						</span>
						<Icon name={isOpen ? 'remove' : 'add'} className="text-on-surface-variant transition-transform duration-300 {isOpen ? 'rotate-180' : ''}" />
					</button>
					
					{#if isOpen}
						<div class="px-6 pb-5 text-on-surface-variant font-body-md text-body-md animate-fade-in border-t border-border-glass/30 pt-3">
							<p>{faq.a}</p>
						</div>
					{/if}
				</div>
			{/each}
		</div>
	</section>
</div>
