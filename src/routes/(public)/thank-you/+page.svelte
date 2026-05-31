<script lang="ts">
	import { onMount } from 'svelte';
	import { page } from '$app/stores';
	import SeoHead from '$lib/components/seo/SeoHead.svelte';
	import { i18n } from '$lib/i18n.svelte';
	import { siteConfig } from '$lib/data/site';

	let leadId = $state('');

	onMount(() => {
		// Read lead param from URL (client-side only — page is noindex)
		const params = new URL(window.location.href).searchParams;
		leadId = params.get('lead') ?? '';

		// Conversion tracking — graceful if dataLayer is not defined
		try {
			(window as unknown as Record<string, unknown[]>)['dataLayer'] =
				((window as unknown as Record<string, unknown[]>)['dataLayer'] || []);
			(window as unknown as Record<string, unknown[]>)['dataLayer'].push({
				event: 'lead_submitted',
				lead_id: leadId
				// Uncomment for GA4 / Zaraz enhanced ecommerce:
				// currency: 'EUR',
				// value: 0
			});
		} catch {
			// Intentionally swallowed — analytics must never break the page
		}
	});
</script>

<!-- noindex: page must not appear in search results -->
<SeoHead
	title={i18n.t.thankYou.headline}
	description={i18n.t.thankYou.subheadline}
	canonicalUrl={`${siteConfig.url}/thank-you/`}
	noindex={true}
/>
<!-- Explicit meta for belt-and-suspenders noindex -->
<svelte:head>
	<meta name="robots" content="noindex, nofollow" />
</svelte:head>

<div class="min-h-[80vh] flex items-center justify-center px-margin-mobile md:px-margin-desktop py-24">
	<div class="max-w-2xl w-full text-center">
		<!-- Success icon -->
		<div class="flex justify-center mb-8">
			<div class="w-20 h-20 rounded-full bg-electric-blue/15 flex items-center justify-center">
				<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="w-10 h-10 text-electric-blue">
					<path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7" />
				</svg>
			</div>
		</div>

		<!-- Headline -->
		<h1 class="font-headline-lg-mobile md:font-headline-lg text-headline-lg-mobile md:text-headline-lg text-on-background mb-4">
			{i18n.t.thankYou.headline}
		</h1>

		<!-- Sub-headline -->
		<p class="font-body-lg text-body-lg text-on-surface-variant max-w-xl mx-auto mb-8 leading-relaxed">
			{i18n.t.thankYou.subheadline}
		</p>

		<!-- Response time badge -->
		<div class="inline-flex items-center gap-2 px-5 py-2 rounded-full glass-panel mb-10">
			<span class="text-electric-blue">⚡</span>
			<span class="font-label-md text-on-surface">{i18n.t.thankYou.responseTime}</span>
		</div>

		<!-- Lead reference (shown only if leadId is meaningful) -->
		{#if leadId && leadId !== 'stub'}
			<p class="text-sm text-on-surface-variant mb-8">
				{i18n.t.thankYou.leadLabel}: <code class="font-mono text-electric-blue">{leadId}</code>
			</p>
		{/if}

		<!-- CTAs -->
		<div class="flex flex-col sm:flex-row items-center justify-center gap-4">
			<a
				href="/packages/"
				class="px-8 py-3 rounded-full bg-gradient-to-r from-electric-blue to-primary-container text-white font-label-lg uppercase tracking-wider hover:shadow-[0_0_20px_rgba(77,140,255,0.4)] active:scale-95 transition-all duration-300"
			>
				{i18n.t.thankYou.backToPackages}
			</a>
			<a
				href={siteConfig.whatsappUrl}
				target="_blank"
				rel="noopener noreferrer"
				class="px-8 py-3 rounded-full border border-border-glass bg-on-surface/5 hover:bg-on-surface/10 text-on-surface font-label-lg active:scale-95 transition-all"
			>
				{i18n.t.thankYou.whatsappCta}
			</a>
		</div>
	</div>
</div>
