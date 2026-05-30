<script lang="ts">
	import SeoHead from '$lib/components/seo/SeoHead.svelte';
	import { i18n } from '$lib/i18n.svelte';
	import { faqs, buildFaqSchema } from '$lib/data/faq';
	import { slide } from 'svelte/transition';

	// FAQPage JSON-LD generated from the same source as the rendered content,
	// so the structured data always matches every visible question.
	let faqSchema = buildFaqSchema(faqs);

	let activeCategory = $state('all');
	let openIndex = $state<number | null>(null);

	let faqList = $derived(
		faqs.map((item) => ({
			category: item.category,
			q: item.question[i18n.lang],
			a: item.answer[i18n.lang]
		}))
	);

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
		<button
			onclick={() => { activeCategory = 'contact'; openIndex = null; }}
			class="px-6 py-2.5 rounded-full font-label-md text-sm border border-border-glass transition-all duration-300 focus-visible:ring-2 focus-visible:ring-electric-blue focus-visible:outline-none {activeCategory === 'contact' ? 'bg-electric-blue text-white shadow-[0_0_15px_rgba(77,140,255,0.3)]' : 'bg-surface-glass text-on-surface hover:bg-on-surface/5 active:scale-95'}"
		>
			{i18n.lang === 'en' ? 'Contact' : 'Contacto'}
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
