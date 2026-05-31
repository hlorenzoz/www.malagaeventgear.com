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

	// ── E-commerce filter state (Svelte 5 runes) ──────────────────────────────
	type Purpose = 'party' | 'wedding' | 'corporate' | 'presentation' | 'meeting';
	type IncludeTag = 'transport' | 'screen' | 'sound' | 'microphone' | 'lighting' | 'technician';
	type OptionalTag = 'projector' | 'smoke-machine' | 'technical-assistant' | 'lectern' | 'staging';
	type Capacity = 'all' | 'small' | 'medium' | 'large';
	type PriceBracket = 'all' | 'low' | 'mid' | 'high';
	type Sort = 'recommended' | 'price-asc' | 'price-desc';

	let activePurpose = $state<Set<Purpose>>(new Set());
	let activeCapacity = $state<Capacity>('all');
	let activePrice = $state<PriceBracket>('all');
	let activeInclude = $state<Set<IncludeTag>>(new Set());
	let activeOptional = $state<Set<OptionalTag>>(new Set());
	let sortBy = $state<Sort>('recommended');
	let isMobileDrawerOpen = $state(false);

	const totalPackages = packages.length;

	// Generic Set toggle that reassigns to trigger Svelte reactivity
	function toggle<T>(set: Set<T>, value: T): Set<T> {
		const next = new Set(set);
		if (next.has(value)) next.delete(value);
		else next.add(value);
		return next;
	}

	function resetFilters() {
		activePurpose = new Set();
		activeCapacity = 'all';
		activePrice = 'all';
		activeInclude = new Set();
		activeOptional = new Set();
		sortBy = 'recommended';
	}

	let activeFilterCount = $derived(
		activePurpose.size +
			activeInclude.size +
			activeOptional.size +
			(activeCapacity !== 'all' ? 1 : 0) +
			(activePrice !== 'all' ? 1 : 0)
	);

	// Localized + filtered + sorted plans computed from the centralized packages store
	let filteredPlans = $derived.by(() => {
		let list = packages.map((pkg) => ({
			id: pkg.id,
			route: pkg.route,
			name: pkg.name,
			price: pkg.price.toFixed(2),
			rawPrice: pkg.price,
			desc: pkg.desc[i18n.lang],
			includes: pkg.includes[i18n.lang],
			optional: pkg.optional ? pkg.optional[i18n.lang] : undefined,
			popular: pkg.popular,
			image: pkg.image,
			maxGuests: pkg.maxGuests,
			purpose: pkg.purpose,
			includeTags: pkg.includeTags,
			optionalTags: pkg.optionalTags ?? [],
			...(packMeta[pkg.id] ?? fallbackMeta)
		}));

		// Purpose: OR within the group
		if (activePurpose.size > 0) {
			list = list.filter((p) => p.purpose.some((x) => activePurpose.has(x)));
		}

		// Guest capacity bracket
		if (activeCapacity !== 'all') {
			list = list.filter((p) => {
				if (!p.maxGuests) return false;
				if (activeCapacity === 'small') return p.maxGuests <= 50;
				if (activeCapacity === 'medium') return p.maxGuests > 50 && p.maxGuests <= 80;
				return p.maxGuests > 80; // large
			});
		}

		// Price bracket
		if (activePrice !== 'all') {
			list = list.filter((p) => {
				if (activePrice === 'low') return p.rawPrice <= 300;
				if (activePrice === 'mid') return p.rawPrice > 300 && p.rawPrice <= 500;
				return p.rawPrice > 500; // high
			});
		}

		// Equipment included: AND across selected tags
		if (activeInclude.size > 0) {
			list = list.filter((p) =>
				Array.from(activeInclude).every((t) => p.includeTags.includes(t))
			);
		}

		// Optional add-ons: AND across selected tags
		if (activeOptional.size > 0) {
			list = list.filter((p) =>
				Array.from(activeOptional).every((t) => p.optionalTags.includes(t))
			);
		}

		// Sorting (non-mutating copy)
		const sorted = [...list];
		if (sortBy === 'price-asc') sorted.sort((a, b) => a.rawPrice - b.rawPrice);
		else if (sortBy === 'price-desc') sorted.sort((a, b) => b.rawPrice - a.rawPrice);
		else sorted.sort((a, b) => Number(b.popular ?? false) - Number(a.popular ?? false));

		return sorted;
	});

	// Filter group option metadata (label keys resolved via i18n.t.filters)
	const purposeOptions: Purpose[] = ['party', 'wedding', 'corporate', 'presentation', 'meeting'];
	const capacityOptions: Exclude<Capacity, 'all'>[] = ['small', 'medium', 'large'];
	const priceOptions: { value: Exclude<PriceBracket, 'all'>; key: 'priceLow' | 'priceMid' | 'priceHigh' }[] = [
		{ value: 'low', key: 'priceLow' },
		{ value: 'mid', key: 'priceMid' },
		{ value: 'high', key: 'priceHigh' }
	];
	const includeOptions: IncludeTag[] = ['transport', 'screen', 'sound', 'microphone', 'lighting', 'technician'];
	const optionalOptions: { value: OptionalTag; key: 'projector' | 'smokeMachine' | 'technicalAssistant' | 'lectern' | 'staging' }[] = [
		{ value: 'projector', key: 'projector' },
		{ value: 'smoke-machine', key: 'smokeMachine' },
		{ value: 'technical-assistant', key: 'technicalAssistant' },
		{ value: 'lectern', key: 'lectern' },
		{ value: 'staging', key: 'staging' }
	];

	let resultsLabel = $derived(
		i18n.t.filters.showingResults
			.replace('{visible}', String(filteredPlans.length))
			.replace('{total}', String(totalPackages))
	);

	// Lock body scroll while the mobile drawer is open
	$effect(() => {
		if (typeof document === 'undefined') return;
		document.body.style.overflow = isMobileDrawerOpen ? 'hidden' : '';
		return () => {
			document.body.style.overflow = '';
		};
	});

	let faqOpen = $state(false);
</script>

<!-- SEO Head & JSON-LD Injection -->
<SeoHead
	title="Rates & Tailored Rental Packages | MEG"
	description="Discover our transparent rates and tailored sound, lighting, and screen rental packages in Malaga. Perfect options for weddings, corporate events, and parties."
	canonicalUrl="https://www.malagaeventgear.com/packages"
	image="/images/packages/wedding.webp"
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

<svelte:window
	onkeydown={(e) => {
		if (e.key === 'Escape' && isMobileDrawerOpen) isMobileDrawerOpen = false;
	}}
/>

<!-- Reusable filter panel: rendered in the desktop sidebar and the mobile drawer -->
{#snippet filterGroup(label: string, children: import('svelte').Snippet)}
	<details class="group/grp border-b border-border-glass/40 py-4" open>
		<summary class="flex items-center justify-between cursor-pointer list-none font-label-lg text-label-lg text-on-surface select-none min-h-[44px]">
			{label}
			<Icon name="expand_more" size="20" className="transition-transform duration-300 group-open/grp:rotate-180 text-on-surface-variant" />
		</summary>
		<div class="mt-3 flex flex-col gap-1.5">
			{@render children()}
		</div>
	</details>
{/snippet}

{#snippet chip(active: boolean, onclick: () => void, label: string, testid: string)}
	<button
		type="button"
		{onclick}
		data-testid={testid}
		aria-pressed={active}
		class="inline-flex items-center gap-2 px-3.5 py-2.5 min-h-[44px] rounded-xl text-sm text-left transition-all duration-300 ease-[cubic-bezier(0.32,0.72,0,1)] focus-visible:outline-2 focus-visible:outline-electric-blue {active
			? 'bg-electric-blue/15 text-electric-blue ring-1 ring-electric-blue/60 font-semibold'
			: 'glass-panel text-on-surface hover:bg-white/5'}"
	>
		<Icon name={active ? 'check_circle' : 'radio_button_unchecked'} size="18" className={active ? 'text-electric-blue' : 'text-on-surface-variant'} />
		{label}
	</button>
{/snippet}

{#snippet filterPanel()}
	<div class="flex items-center justify-between mb-2">
		<h2 class="font-headline-sm text-headline-sm text-primary flex items-center gap-2">
			<Icon name="tune" size="22" className="text-electric-blue" />
			{i18n.t.filters.title}
		</h2>
		{#if activeFilterCount > 0}
			<button
				type="button"
				data-testid="filter-reset"
				onclick={resetFilters}
				class="text-sm text-electric-blue hover:underline min-h-[44px] px-2 focus-visible:outline-2 focus-visible:outline-electric-blue rounded"
			>
				{i18n.t.filters.clearAll}
			</button>
		{/if}
	</div>

	<!-- Sort -->
	<label class="block py-4 border-b border-border-glass/40">
		<span class="font-label-lg text-label-lg text-on-surface">{i18n.t.filters.sortBy}</span>
		<select
			data-testid="filter-sort"
			bind:value={sortBy}
			class="mt-2 w-full px-3 py-2.5 min-h-[44px] rounded-xl glass-panel text-on-surface text-sm focus-visible:outline-2 focus-visible:outline-electric-blue"
		>
			<option value="recommended">{i18n.t.filters.recommended}</option>
			<option value="price-asc">{i18n.t.filters.priceAsc}</option>
			<option value="price-desc">{i18n.t.filters.priceDesc}</option>
		</select>
	</label>

	<!-- Event Type (purpose) -->
	{#snippet purposeBody()}
		{#each purposeOptions as p (p)}
			{@render chip(activePurpose.has(p), () => (activePurpose = toggle(activePurpose, p)), i18n.t.filters[p], `filter-purpose-${p}`)}
		{/each}
	{/snippet}
	{@render filterGroup(i18n.t.filters.purpose, purposeBody)}

	<!-- Event Scale (capacity) -->
	{#snippet capacityBody()}
		{#each capacityOptions as c (c)}
			{@render chip(activeCapacity === c, () => (activeCapacity = activeCapacity === c ? 'all' : c), i18n.t.filters[c], `filter-capacity-${c}`)}
		{/each}
	{/snippet}
	{@render filterGroup(i18n.t.filters.capacity, capacityBody)}

	<!-- Budget (price) -->
	{#snippet priceBody()}
		{#each priceOptions as opt (opt.value)}
			{@render chip(activePrice === opt.value, () => (activePrice = activePrice === opt.value ? 'all' : opt.value), i18n.t.filters[opt.key], `filter-price-${opt.value}`)}
		{/each}
	{/snippet}
	{@render filterGroup(i18n.t.filters.price, priceBody)}

	<!-- Equipment included -->
	{#snippet equipmentBody()}
		{#each includeOptions as t (t)}
			{@render chip(activeInclude.has(t), () => (activeInclude = toggle(activeInclude, t)), i18n.t.filters[t], `filter-include-${t}`)}
		{/each}
	{/snippet}
	{@render filterGroup(i18n.t.filters.equipment, equipmentBody)}

	<!-- Optional add-ons -->
	{#snippet extrasBody()}
		{#each optionalOptions as opt (opt.value)}
			{@render chip(activeOptional.has(opt.value), () => (activeOptional = toggle(activeOptional, opt.value)), i18n.t.filters[opt.key], `filter-optional-${opt.value}`)}
		{/each}
	{/snippet}
	{@render filterGroup(i18n.t.filters.extras, extrasBody)}
{/snippet}

<!-- Packages catalog — sticky filter sidebar (desktop) + mobile bottom drawer -->
<section class="relative max-w-container-max mx-auto px-margin-mobile pb-24 md:pb-32 lg:grid lg:grid-cols-[280px_1fr] lg:gap-10 lg:items-start">
	<!-- Desktop sidebar -->
	<aside class="hidden lg:block lg:sticky lg:top-24 glass-card rounded-3xl p-6 ambient-shadow">
		{@render filterPanel()}
	</aside>

	<!-- Catalog column -->
	<div>
		<!-- Results counter -->
		<div class="flex items-center justify-between mb-6">
			<p data-testid="results-count" class="font-body-md text-body-md text-on-surface-variant" aria-live="polite">
				{resultsLabel}
			</p>
		</div>

		{#if filteredPlans.length === 0}
			<!-- Empty state -->
			<div data-testid="empty-state" class="glass-card rounded-3xl py-20 px-8 text-center ambient-shadow">
				<div class="mx-auto w-16 h-16 rounded-2xl glass-panel flex items-center justify-center text-electric-blue mb-6">
					<Icon name="search_off" size="32" />
				</div>
				<p class="font-body-lg text-body-lg text-on-surface mb-6 max-w-md mx-auto">
					{i18n.t.filters.noResults}
				</p>
				<button
					type="button"
					onclick={resetFilters}
					class="inline-flex items-center gap-2 px-6 py-3 min-h-[44px] rounded-full bg-linear-to-r from-electric-blue to-primary-container text-white font-label-lg hover:shadow-lg hover:shadow-electric-blue/25 active:scale-[0.98] transition-all duration-300 focus-visible:outline-2 focus-visible:outline-electric-blue"
				>
					<Icon name="restart_alt" size="20" />
					{i18n.t.filters.resetFilters}
				</button>
			</div>
		{:else}
			<div class="grid grid-cols-1 md:grid-cols-2 gap-8">
				{#each filteredPlans as plan, i (plan.id)}
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
						{@const mobileImage = plan.image.replace('.webp', '-mobile.webp')}
						{@const desktopImage = plan.image.replace('.webp', '-desktop.webp')}
						<picture class="absolute inset-0 w-full h-full">
							<source media="(max-width: 767px)" srcset={mobileImage} type="image/webp" />
							<source media="(min-width: 768px)" srcset={desktopImage} type="image/webp" />
							<img
								src={desktopImage}
								alt={plan.name}
								loading={i === 0 ? 'eager' : 'lazy'}
								fetchpriority={i === 0 ? 'high' : 'auto'}
								decoding="async"
								class="w-full h-full object-cover transition-transform duration-700 ease-[cubic-bezier(0.32,0.72,0,1)] group-hover:scale-105"
								width="800"
								height="380"
							/>
						</picture>
						<div class="absolute inset-0 bg-linear-to-t from-surface-container via-surface-container/30 to-transparent pointer-events-none"></div>
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
		{/if}
	</div>
</section>

<!-- Mobile filter trigger (floating glass pill) -->
<button
	type="button"
	data-testid="filter-drawer-trigger"
	onclick={() => (isMobileDrawerOpen = true)}
	class="lg:hidden fixed bottom-6 left-1/2 -translate-x-1/2 z-40 inline-flex items-center gap-2 px-6 py-3.5 min-h-[44px] rounded-full bg-electric-blue text-white font-label-lg shadow-xl shadow-electric-blue/40 ring-1 ring-white/20 active:scale-[0.98] transition-transform duration-300 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-electric-blue"
	aria-haspopup="dialog"
	aria-expanded={isMobileDrawerOpen}
>
	<Icon name="tune" size="20" className="text-white" />
	{i18n.t.filters.openFilters}
	{#if activeFilterCount > 0}
		<span class="ml-1 inline-flex items-center justify-center w-6 h-6 rounded-full bg-white text-electric-blue text-xs font-bold">{activeFilterCount}</span>
	{/if}
</button>

<!-- Mobile bottom drawer -->
{#if isMobileDrawerOpen}
	<!-- Scrim -->
	<button
		type="button"
		aria-label="Close filters"
		onclick={() => (isMobileDrawerOpen = false)}
		class="lg:hidden fixed inset-0 z-40 bg-black/50 backdrop-blur-sm animate-scrim-in"
	></button>

	<!-- Drawer panel -->
	<div
		role="dialog"
		aria-modal="true"
		aria-label={i18n.t.filters.title}
		class="lg:hidden fixed inset-x-0 bottom-0 z-50 max-h-[85dvh] overflow-y-auto glass-card rounded-t-3xl p-6 pb-8 ambient-shadow animate-slide-up"
	>
		<!-- Grab handle -->
		<div class="mx-auto mb-4 h-1.5 w-12 rounded-full bg-on-surface-variant/30"></div>
		{@render filterPanel()}

		<button
			type="button"
			onclick={() => (isMobileDrawerOpen = false)}
			class="mt-6 w-full flex items-center justify-center gap-2 py-3.5 min-h-[44px] rounded-full bg-linear-to-r from-electric-blue to-primary-container text-white font-label-lg active:scale-[0.98] transition-transform duration-300 focus-visible:outline-2 focus-visible:outline-electric-blue"
		>
			{i18n.t.filters.done} ({filteredPlans.length})
		</button>
	</div>
{/if}

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
