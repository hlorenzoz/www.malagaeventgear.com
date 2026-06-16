<script lang="ts">
	import type { OpenGraphMeta, TwitterCardMeta, JsonLdSchema } from '$lib/types/seo';
	import { siteConfig } from '$lib/data/site';
	import { i18n } from '$lib/i18n.svelte';

	// Props con Runes de Svelte 5
	let {
		title,
		description,
		canonicalUrl,
		image,
		imageWidth,
		imageHeight,
		openGraph = {},
		twitter = {},
		jsonLdSchema,
		noindex = false
	}: {
		title: string;
		description: string;
		canonicalUrl: string;
		image?: string;
		imageWidth?: number;
		imageHeight?: number;
		openGraph?: OpenGraphMeta;
		twitter?: TwitterCardMeta;
		jsonLdSchema?: JsonLdSchema | JsonLdSchema[];
		noindex?: boolean;
	} = $props();

	// Simplificación usando el rune $derived de Svelte 5 para evitar condicionales complejos en el template
	let schemas = $derived(
		jsonLdSchema
			? Array.isArray(jsonLdSchema)
				? jsonLdSchema
				: [jsonLdSchema]
			: []
	);

	// Función para asegurar URLs absolutas en og:image y twitter:image
	const getAbsoluteImageUrl = (imgUrl: string | undefined): string => {
		if (!imgUrl) return `${siteConfig.url}/premium_event_stage.webp`;
		if (imgUrl.startsWith('http://') || imgUrl.startsWith('https://')) return imgUrl;
		const cleanPath = imgUrl.startsWith('/') ? imgUrl : `/${imgUrl}`;
		return `${siteConfig.url}${cleanPath}`;
	};

	let ogImage = $derived(getAbsoluteImageUrl(image || openGraph.images?.[0]?.url));
	// Dimensiones del og:image del fallback. Sin `image` -> el default premium_event_stage.webp
	// es 1024x1024. Con `image` -> solo declaramos dimensiones si la página las provee (no inventar).
	let ogImageWidth = $derived(image ? imageWidth : 1024);
	let ogImageHeight = $derived(image ? imageHeight : 1024);
	let ogLocale = $derived(i18n.lang === 'es' ? 'es_ES' : 'en_US');
	let ogAlternateLocales = $derived(i18n.lang === 'es' ? ['en_US'] : ['es_ES']);
</script>

<svelte:head>
	<!-- SEO Básico -->
	<title>{title}</title>
	<meta name="description" content={description} />
	{#if noindex}
		<meta name="robots" content="noindex, nofollow" />
	{:else}
		<link rel="canonical" href={canonicalUrl} />
	{/if}

	<!-- Open Graph Protocol -->
	<meta property="og:title" content={openGraph.title || title} />
	<meta property="og:description" content={openGraph.description || description} />
	<meta property="og:url" content={openGraph.url || canonicalUrl} />
	<meta property="og:type" content={openGraph.type || 'website'} />
	<meta property="og:site_name" content={openGraph.siteName || siteConfig.brandName} />
	<meta property="og:locale" content={openGraph.locale || ogLocale} />
	
	{#each (openGraph.alternateLocales || ogAlternateLocales) as altLocale}
		<meta property="og:locale:alternate" content={altLocale} />
	{/each}

	{#if openGraph.images && openGraph.images.length > 0}
		{#each openGraph.images as img}
			<meta property="og:image" content={getAbsoluteImageUrl(img.url)} />
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
	{:else}
		<meta property="og:image" content={ogImage} />
		{#if ogImageWidth}
			<meta property="og:image:width" content={ogImageWidth.toString()} />
		{/if}
		{#if ogImageHeight}
			<meta property="og:image:height" content={ogImageHeight.toString()} />
		{/if}
		<meta property="og:image:alt" content={openGraph.images?.[0]?.alt || title} />
		<meta property="og:image:type" content="image/webp" />
	{/if}

	<!-- Open Graph Article tags (only when og:type === 'article') -->
	{#if openGraph?.type === 'article'}
		{#if openGraph.publishedTime}
			<meta property="article:published_time" content={openGraph.publishedTime} />
		{/if}
		{#if openGraph.modifiedTime}
			<meta property="article:modified_time" content={openGraph.modifiedTime} />
		{/if}
		{#if openGraph.section}
			<meta property="article:section" content={openGraph.section} />
		{/if}
		{#if openGraph.author}
			<meta property="article:author" content={openGraph.author} />
		{/if}
		{#if openGraph.tags && openGraph.tags.length > 0}
			{#each openGraph.tags as tag}
				<meta property="article:tag" content={tag} />
			{/each}
		{/if}
	{/if}

	<!-- Twitter Cards -->
	<meta name="twitter:card" content={twitter.card || 'summary_large_image'} />
	<meta name="twitter:title" content={twitter.title || openGraph.title || title} />
	<meta name="twitter:description" content={twitter.description || openGraph.description || description} />
	<meta name="twitter:image" content={getAbsoluteImageUrl(twitter.image || ogImage)} />
	<meta name="twitter:image:alt" content={twitter.imageAlt || openGraph.images?.[0]?.alt || title} />
	{#if twitter.site}
		<meta name="twitter:site" content={twitter.site} />
	{/if}
	{#if twitter.creator}
		<meta name="twitter:creator" content={twitter.creator} />
	{/if}

	<!-- SEO Generativo: Inyección de JSON-LD estructurado -->
	{#each schemas as schema}
		{@html `<script type="application/ld+json">${JSON.stringify(schema)}<\/script>`}
	{/each}
</svelte:head>
