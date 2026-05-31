<script lang="ts">
	import SeoHead from '$lib/components/seo/SeoHead.svelte';
	import Icon from '$lib/components/navigation/Icon.svelte';
	import Testimonials from '$lib/components/testimonials/Testimonials.svelte';
	import { i18n } from '$lib/i18n.svelte';
	import { packages } from '$lib/data/packages';

	import { buildItemListSchema } from '$lib/utils/schema';
	import { faqs, buildFaqSchema } from '$lib/data/faq';

	// Esquema estructurado ItemList de paquetes de servicios (SEO Generativo)
	let pricingSchema = $derived(
		buildItemListSchema(
			packages.map((pkg) => ({
				name: pkg.name,
				url: pkg.route
			})),
			'Audiovisual Rental Packages - Malaga Event Gear'
		)
	);

	// Esquema estructurado FAQPage de tarifas de IVA (SEO Técnico)
	let faqSchema = $derived(
		buildFaqSchema(
			faqs.filter((f) => f.id === 'vat-pricing'),
			i18n.lang
		)
	);

	// Per-package visual identity: icon, icon chip, and the header accent gradient.
	// Keeps the grid premium and instantly readable when a package has no photo.
	const packMeta: Record<string, { icon: string; iconBg: string; gradient: string }> = {
		eco: {
			icon: 'eco',
			iconBg: 'bg-electric-blue/20 text-electric-blue',
			gradient: 'from-electric-blue/35 via-electric-blue/10 to-surface-container'
		},
		wedding: {
			icon: 'favorite',
			iconBg: 'bg-secondary/20 text-secondary',
			gradient: 'from-secondary/35 via-secondary/10 to-surface-container'
		},
		presentation: {
			icon: 'co_present',
			iconBg: 'bg-primary/20 text-primary',
			gradient: 'from-primary/35 via-primary/10 to-surface-container'
		},
		'mice-basic': {
			icon: 'groups',
			iconBg: 'bg-electric-blue/20 text-electric-blue',
			gradient: 'from-electric-blue/35 via-electric-blue/10 to-surface-container'
		},
		'mice-full': {
			icon: 'business_center',
			iconBg: 'bg-primary/20 text-primary',
			gradient: 'from-primary/35 via-primary/10 to-surface-container'
		}
	};
	const fallbackMeta = {
		icon: 'inventory_2',
		iconBg: 'bg-primary/20 text-primary',
		gradient: 'from-primary/35 via-primary/10 to-surface-container'
	};

	// Localized plan specifications computed from the centralized packages data store
	let plans = $derived(
		packages.map((pkg) => ({
			id: pkg.id,
			route: pkg.route,
			name: pkg.name,
			price: pkg.price.toFixed(2),
			desc: pkg.desc[i18n.lang],
			includes: pkg.includes[i18n.lang],
			optional: pkg.optional ? pkg.optional[i18n.lang] : undefined,
			popular: pkg.popular,
			image: pkg.image,
			maxGuests: pkg.maxGuests,
			...(packMeta[pkg.id] ?? fallbackMeta)
		}))
	);

	let faqOpen = $state(false);
</script>

<!-- SEO Head & JSON-LD Injection -->
<SeoHead
	title="Rates & Tailored Rental Packages | MEG"
	description="Discover our transparent rates and tailored sound, lighting, and screen rental packages in Malaga. Perfect options for weddings, corporate events, and parties."
	canonicalUrl="https://www.malagaeventgear.com/packages"
	jsonLdSchema={[pricingSchema, faqSchema]}
/>

<!-- Header Section -->
<header class="text-center mb-16 md:mb-20 relative max-w-container-max mx-auto px-margin-mobile pt-20 md:pt-28">
	<!-- Ambient glow -->
	<div class="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[600px] max-w-[90vw] bg-electric-blue/10 rounded-full blur-[120px] opacity-30 pointer-events-none"></div>

	<span class="inline-block px-4 py-1.5 rounded-full glass-panel font-label-sm text-electric-blue uppercase tracking-[0.2em] mb-6">
		{i18n.t.pricing.badge}
	</span>
	<h1 class="font-headline-lg-mobile md:font-headline-lg text-headline-lg-mobile md:text-headline-lg text-primary mb-6 leading-tight">
		{i18n.t.pricing.title}
	</h1>
	<p class="font-body-lg text-body-lg text-on-surface-variant max-w-2xl mx-auto">
		{i18n.t.pricing.subtitle}
	</p>
</header>

<!-- Packages Grid — every package fully visible, no carousel -->
<section class="relative max-w-container-max mx-auto px-margin-mobile pb-24 md:pb-32">
	<div class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
		{#each plans as plan, i (plan.id)}
			<article
				data-testid="package-card"
				class="group relative flex flex-col glass-card rounded-3xl overflow-hidden ambient-shadow reveal active is-revealed hover:-translate-y-1.5 transition-transform duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] {plan.popular
					? 'ring-2 ring-electric-blue shadow-2xl shadow-electric-blue/20 xl:scale-[1.02]'
					: ''}"
				style="transition-delay: {i * 80}ms"
			>
				<!-- Visual header: real photo when available, accent gradient + icon otherwise -->
				<div class="relative h-44 overflow-hidden bg-linear-to-br {plan.gradient}">
					{#if plan.image}
						<img
							src={plan.image}
							alt={plan.name}
							loading="lazy"
							class="absolute inset-0 w-full h-full object-cover transition-transform duration-700 ease-[cubic-bezier(0.32,0.72,0,1)] group-hover:scale-105"
						/>
						<div class="absolute inset-0 bg-linear-to-t from-surface-container via-surface-container/30 to-transparent"></div>
					{/if}

					<!-- Icon chip -->
					<div class="absolute bottom-4 left-6 w-14 h-14 rounded-2xl glass-panel flex items-center justify-center {plan.iconBg} shadow-lg">
						<Icon name={plan.icon} size="28" />
					</div>

					<!-- Guest capacity pill -->
					{#if plan.maxGuests}
						<span class="absolute bottom-4 right-6 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full glass-panel font-label-sm text-on-surface">
							<Icon name="group" size="16" />
							{plan.maxGuests}
						</span>
					{/if}

					<!-- Most-popular ribbon -->
					{#if plan.popular}
						<div class="absolute top-4 right-4 bg-electric-blue-strong text-white px-3 py-1 rounded-full font-label-sm tracking-wider uppercase shadow-lg shadow-electric-blue/30">
							{i18n.t.pricing.mostPopular}
						</div>
					{/if}
				</div>

				<!-- Body -->
				<div class="flex flex-col grow p-8">
					<h2 class="font-headline-md text-headline-md text-on-background mb-2">
						<a href={plan.route} class="hover:text-electric-blue transition-colors duration-300">
							{plan.name}
						</a>
					</h2>
					<p class="font-body-md text-body-md text-on-surface-variant mb-6">
						{plan.desc}
					</p>

					<div class="flex items-baseline gap-2 mb-8">
						<span class="font-display-lg text-[44px] leading-none font-bold text-electric-blue">{plan.price} €</span>
						<span class="text-on-surface-variant text-sm">{i18n.t.pricing.plusVat}</span>
					</div>

					<h3 class="font-label-lg text-label-lg text-primary mb-4 border-b border-border-glass pb-2">
						{i18n.t.pricing.includes}
					</h3>
					<ul class="space-y-3 mb-6">
						{#each plan.includes as inc (inc)}
							<li class="flex items-start">
								<Icon name="check_circle" size="16" className="text-electric-blue mr-2 mt-0.5" />
								<span class="text-on-surface text-sm">{inc}</span>
							</li>
						{/each}
					</ul>

					{#if plan.optional}
						<h3 class="font-label-lg text-label-lg text-on-surface mb-4 border-b border-border-glass pb-2">
							{i18n.t.pricing.optional}
						</h3>
						<ul class="space-y-3 mb-6">
							{#each plan.optional as opt (opt)}
								<li class="flex items-start">
									<Icon name="add" size="16" className="text-on-surface-variant mr-2 mt-0.5" />
									<span class="text-on-surface-variant text-sm">{opt}</span>
								</li>
							{/each}
						</ul>
					{/if}

					<!-- CTA pinned to the bottom so every card aligns -->
					<a
						class="group/cta mt-auto w-full flex items-center justify-center gap-2 py-3.5 rounded-full bg-linear-to-r from-electric-blue to-primary-container text-white font-label-lg hover:shadow-lg hover:shadow-electric-blue/25 active:scale-[0.98] transition-all duration-300 ease-[cubic-bezier(0.32,0.72,0,1)]"
						href={plan.route}
					>
						{i18n.t.pricing.bookPack} {plan.name}
						<Icon name="arrow_forward" size="20" className="transition-transform duration-300 group-hover/cta:translate-x-1" />
					</a>
				</div>
			</article>
		{/each}
	</div>
</section>

<!-- Client Reviews (Google testimonials) below the packages -->
<Testimonials variant="grid" />

<!-- Frequently Asked Questions Section -->
<section class="max-w-4xl mx-auto px-margin-mobile pt-24 pb-24 relative z-10">
	<div class="text-center mb-12">
		<span class="inline-block px-4 py-1.5 rounded-full glass-panel font-label-sm text-electric-blue uppercase tracking-[0.2em] mb-4">
			{i18n.lang === 'en' ? 'Pricing FAQ' : 'Preguntas Frecuentes de Tarifas'}
		</span>
		<h2 class="font-headline-md text-headline-md text-primary">
			{i18n.lang === 'en' ? 'Frequently Asked Questions' : 'Preguntas Frecuentes'}
		</h2>
	</div>

	<div class="glass-panel rounded-2xl overflow-hidden transition-all duration-300 border border-border-glass shadow-lg">
		<button
			onclick={() => faqOpen = !faqOpen}
			class="w-full px-6 py-5 flex justify-between items-center text-left hover:bg-white/5 transition-colors group focus-visible:outline-2 focus-visible:outline-electric-blue"
			aria-expanded={faqOpen}
		>
			<span class="font-body-lg text-body-lg font-semibold group-hover:text-electric-blue transition-colors text-on-surface">
				{i18n.lang === 'en' ? 'Are your package prices inclusive of VAT?' : '¿Los precios de los paquetes incluyen IVA?'}
			</span>
			<Icon name={faqOpen ? 'remove' : 'add'} className="text-on-surface-variant transition-transform duration-300 {faqOpen ? 'rotate-180' : ''}" />
		</button>
		{#if faqOpen}
			<div class="px-6 pb-5 text-on-surface-variant font-body-md text-body-md border-t border-border-glass/30 pt-3">
				<p class="leading-relaxed">
					{i18n.lang === 'en'
						? "No, the listed prices do not include VAT. As indicated by (+21% VAT) next to the rates, the standard 21% Spanish VAT (IVA) will be applied on top of the package price. Your final quote will show both the net price and the VAT breakdown with 100% transparency."
						: "No, las tarifas indicadas no incluyen IVA. Como se detalla con (+21% IVA) junto a cada precio, se aplicará el 21% de IVA español sobre el valor base del paquete. Tu presupuesto final detallará por separado el precio neto y el IVA correspondiente con total transparencia."}
				</p>
			</div>
		{/if}
	</div>
</section>
