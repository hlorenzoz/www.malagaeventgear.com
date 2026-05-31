<script lang="ts">
	import SeoHead from '$lib/components/seo/SeoHead.svelte';
	import Icon from '$lib/components/navigation/Icon.svelte';
	import { i18n } from '$lib/i18n.svelte';
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();
	let pkg = $derived(data.pkg);
	let landing = $derived(pkg.landing);

	import { buildServiceSchema } from '$lib/utils/schema';

	let seoSchema = $derived(
		buildServiceSchema({
			name: pkg.name,
			description: pkg.desc[i18n.lang],
			price: pkg.price,
			url: pkg.route,
			category: pkg.seo.serviceType
		}, i18n.lang)
	);
</script>

<SeoHead
	title={pkg.seo.title[i18n.lang]}
	description={pkg.desc[i18n.lang]}
	canonicalUrl={`https://malagaeventgear.com${pkg.route}`}
	jsonLdSchema={seoSchema}
/>

<div class="relative w-full py-20 px-margin-mobile md:px-margin-desktop z-10 max-w-container-max mx-auto">
	<!-- Hero Header -->
	<div class="text-center mb-16 reveal active is-revealed">
		<span class="inline-block px-4 py-2 rounded-full glass-panel font-label-sm text-electric-blue uppercase tracking-widest mb-4">
			{landing.badge[i18n.lang]}
		</span>
		<h1 class="font-headline-lg-mobile md:font-headline-lg text-headline-lg-mobile md:text-headline-lg mb-6 text-on-background">
			{pkg.name}
		</h1>
		<p class="font-body-lg text-body-lg text-on-surface-variant max-w-3xl mx-auto leading-relaxed">
			{pkg.desc[i18n.lang]}
		</p>
	</div>

	<!-- Bento Details Layout -->
	<div class="grid grid-cols-1 lg:grid-cols-12 gap-gutter items-stretch mb-20">
		<!-- Pricing & Capacity Card -->
		<div class="lg:col-span-5 flex flex-col gap-6">
			<!-- Glowing Price Card -->
			<div class="glass-panel rounded-xl p-8 flex flex-col justify-between relative overflow-hidden shadow-2xl">
				<div class="absolute -top-24 -left-24 w-64 h-64 bg-electric-blue/10 rounded-full blur-3xl pointer-events-none"></div>
				<div>
					{#if pkg.popular}
						<span class="inline-block bg-electric-blue text-white px-3 py-1 rounded-full font-label-sm tracking-wider uppercase mb-3">
							{i18n.lang === 'en' ? 'Most Popular' : 'Más Popular'}
						</span>
					{/if}
					<span class="font-label-md text-on-surface-variant uppercase tracking-wider block mb-2">
						{landing.rateLabel[i18n.lang]}
					</span>
					<span class="text-display-lg font-bold text-electric-blue block">
						{pkg.price} €
					</span>
					<span class="text-sm text-on-surface-variant block mt-1">
						{landing.vatNote[i18n.lang]}
					</span>
				</div>
				<div class="mt-8 border-t border-border-glass pt-6">
					<div class="flex items-center gap-3">
						<Icon name={landing.specIcon} size="24" className="text-electric-blue" />
						<div>
							<span class="font-label-lg text-on-surface block">
								{landing.specTitle[i18n.lang]}
							</span>
							<p class="text-sm text-on-surface-variant">
								{landing.specBody[i18n.lang]}
							</p>
						</div>
					</div>
				</div>
			</div>

			<!-- Dynamic Highlight / Support Card -->
			<div class="glass-panel rounded-xl p-8 flex flex-col justify-center">
				<div class="flex items-center gap-3 mb-3">
					{#if landing.highlightIcon}
						<Icon name={landing.highlightIcon} size="28" className="text-electric-blue" />
					{/if}
					<h2 class="font-headline-sm text-headline-sm text-on-surface">
						{landing.highlightTitle[i18n.lang]}
					</h2>
				</div>
				<p class="font-body-md text-body-md text-on-surface-variant leading-relaxed">
					{landing.highlightBody[i18n.lang]}
				</p>
			</div>
		</div>

		<!-- Inclusions & Optional Extras Card -->
		<div class="lg:col-span-7 flex">
			<div class="glass-panel rounded-xl p-8 md:p-12 w-full flex flex-col justify-between relative overflow-hidden">
				<div class="absolute -bottom-24 -right-24 w-64 h-64 bg-electric-blue/5 rounded-full blur-3xl pointer-events-none"></div>
				<div>
					{#if pkg.image}
						<div class="w-full h-48 rounded-lg overflow-hidden mb-8 relative">
							<img
								alt={pkg.name}
								class="object-cover w-full h-full opacity-90"
								src={pkg.image}
								loading="lazy"
								decoding="async"
								width="600"
								height="400"
							/>
							<div class="absolute inset-0 bg-gradient-to-t from-background/90 to-transparent"></div>
						</div>
					{/if}
					<h2 class="font-headline-md text-headline-md text-on-surface mb-6 border-b border-border-glass pb-4">
						{landing.includesLabel[i18n.lang]}
					</h2>
					<ul class="space-y-4 mb-8">
						{#each pkg.includes[i18n.lang] as item}
							<li class="flex items-start gap-3">
								<Icon name="check_circle" size="20" className="text-electric-blue mt-0.5" />
								<span class="font-body-md text-body-md text-on-surface-variant leading-relaxed">{item}</span>
							</li>
						{/each}
					</ul>

					{#if pkg.optional && landing.optionalLabel}
						<h3 class="font-label-lg text-label-lg text-on-surface uppercase tracking-wider mb-4">
							{landing.optionalLabel[i18n.lang]}
						</h3>
						<ul class="space-y-3">
							{#each pkg.optional[i18n.lang] as extra}
								<li class="flex items-center gap-3 p-3 rounded bg-on-surface/5">
									<Icon name="add_circle" size="18" className="text-on-surface-variant" />
									<span class="font-body-md text-body-md text-on-surface">{extra}</span>
								</li>
							{/each}
						</ul>
					{/if}

					{#if landing.note}
						<div class="p-4 rounded bg-on-surface/5 border border-border-glass">
							<span class="font-label-md text-on-surface uppercase tracking-wider block mb-1">
								{landing.note.title[i18n.lang]}
							</span>
							<p class="text-sm text-on-surface-variant leading-relaxed">
								{landing.note.body[i18n.lang]}
							</p>
						</div>
					{/if}
				</div>
			</div>
		</div>
	</div>

	<!-- Booking Call to Action -->
	<div class="glass-panel rounded-xl p-8 md:p-12 text-center relative overflow-hidden reveal active is-revealed">
		<div class="absolute -bottom-24 -right-24 w-64 h-64 bg-electric-blue/10 rounded-full blur-3xl pointer-events-none"></div>
		<h2 class="font-headline-md text-headline-md mb-4 text-on-surface">
			{landing.ctaHeading[i18n.lang]}
		</h2>
		<p class="font-body-lg text-body-lg text-on-surface-variant max-w-2xl mx-auto mb-8">
			{landing.ctaBody[i18n.lang]}
		</p>
		<div class="flex flex-wrap justify-center gap-4">
			<a
				href="/contact/?pack={pkg.id}"
				class="px-8 py-3 rounded-full bg-gradient-to-r from-electric-blue to-primary-container text-white font-label-lg tracking-wider uppercase hover:shadow-[0_0_20px_rgba(77,140,255,0.4)] active:scale-95 transition-all duration-300"
			>
				{landing.ctaButton[i18n.lang]}
			</a>
			<a
				href="/packages/"
				class="px-8 py-3 rounded-full border border-border-glass bg-on-surface/5 hover:bg-on-surface/10 text-on-surface font-label-lg active:scale-95 transition-all"
			>
				{i18n.lang === 'en' ? 'Compare All Packages' : 'Comparar Todos los Paquetes'}
			</a>
		</div>
	</div>
</div>
