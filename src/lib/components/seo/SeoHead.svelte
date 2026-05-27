<script lang="ts">
	import type { OpenGraphMeta, TwitterCardMeta, JsonLdSchema } from '$lib/types/seo';

	// Props con Runes de Svelte 5
	let {
		title,
		description,
		canonicalUrl,
		openGraph = {},
		twitter = {},
		jsonLdSchema
	}: {
		title: string;
		description: string;
		canonicalUrl: string;
		openGraph?: OpenGraphMeta;
		twitter?: TwitterCardMeta;
		jsonLdSchema?: JsonLdSchema | JsonLdSchema[];
	} = $props();

	// Simplificación usando el rune $derived de Svelte 5 para evitar condicionales complejos en el template
	let schemas = $derived(
		jsonLdSchema
			? Array.isArray(jsonLdSchema)
				? jsonLdSchema
				: [jsonLdSchema]
			: []
	);
</script>

<svelte:head>
	<!-- SEO Básico -->
	<title>{title}</title>
	<meta name="description" content={description} />
	<link rel="canonical" href={canonicalUrl} />
	<link rel="manifest" href="/manifest.webmanifest" />

	<!-- Open Graph Protocol -->
	<meta property="og:title" content={openGraph.title || title} />
	<meta property="og:description" content={openGraph.description || description} />
	<meta property="og:url" content={openGraph.url || canonicalUrl} />
	<meta property="og:type" content={openGraph.type || 'website'} />
	{#if openGraph.siteName}
		<meta property="og:site_name" content={openGraph.siteName} />
	{/if}
	{#if openGraph.locale}
		<meta property="og:locale" content={openGraph.locale} />
	{/if}
	{#if openGraph.alternateLocales}
		{#each openGraph.alternateLocales as altLocale}
			<meta property="og:locale:alternate" content={altLocale} />
		{/each}
	{/if}
	{#if openGraph.images && openGraph.images.length > 0}
		{#each openGraph.images as img}
			<meta property="og:image" content={img.url} />
			{#if img.width}
				<meta property="og:image:width" content={img.width.toString()} />
			{/if}
			{#if img.height}
				<meta property="og:image:height" content={img.height.toString()} />
			{/if}
			{#if img.alt}
				<meta property="og:image:alt" content={img.alt} />
			{/if}
			{#if img.type}
				<meta property="og:image:type" content={img.type} />
			{/if}
		{/each}
	{/if}

	<!-- Twitter Cards -->
	<meta name="twitter:card" content={twitter.card || 'summary_large_image'} />
	<meta name="twitter:title" content={twitter.title || openGraph.title || title} />
	<meta name="twitter:description" content={twitter.description || openGraph.description || description} />
	{#if twitter.site}
		<meta name="twitter:site" content={twitter.site} />
	{/if}
	{#if twitter.creator}
		<meta name="twitter:creator" content={twitter.creator} />
	{/if}
	{#if twitter.image || (openGraph.images && openGraph.images.length > 0)}
		<meta name="twitter:image" content={twitter.image || openGraph.images?.[0]?.url} />
		{#if twitter.imageAlt || (openGraph.images && openGraph.images[0]?.alt)}
			<meta name="twitter:image:alt" content={twitter.imageAlt || openGraph.images?.[0]?.alt} />
		{/if}
	{/if}

	<!-- SEO Generativo: Inyección de JSON-LD estructurado -->
	{#each schemas as schema}
		{@html `<script type="application/ld+json">${JSON.stringify(schema)}<\/script>`}
	{/each}
</svelte:head>
