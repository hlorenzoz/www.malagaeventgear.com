<script lang="ts">
	import SeoHead from '$lib/components/seo/SeoHead.svelte';
	import Icon from '$lib/components/navigation/Icon.svelte';
	import { i18n } from '$lib/i18n.svelte';
	import { buildItemListSchema } from '$lib/utils/schema';
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();

	let categories = $derived(data.categories);

	const canonicalUrl = 'https://malagaeventgear.com/blog/categories/';

	let collectionSchema = $derived({
		'@context': 'https://schema.org',
		'@type': 'CollectionPage',
		'@id': `${canonicalUrl}#webpage`,
		'url': canonicalUrl,
		'name': 'Blog Categories | Malaga Event Gear',
		'isPartOf': {
			'@type': 'WebSite',
			'@id': 'https://malagaeventgear.com/#website',
			'url': 'https://malagaeventgear.com/',
			'name': 'Malaga Event Gear'
		},
		'numberOfItems': categories.length
	});

	let itemListSchema = $derived(
		buildItemListSchema(
			categories.map((c) => ({ name: c.name, url: `/blog/category/${c.slug}/` })),
			'Blog Categories'
		)
	);

	function postCountLabel(count: number): string {
		return i18n.lang === 'en'
			? `${count} ${count === 1 ? 'post' : 'posts'}`
			: `${count} ${count === 1 ? 'artículo' : 'artículos'}`;
	}
</script>

<SeoHead
	title={i18n.lang === 'en'
		? 'Blog Categories | Malaga Event Gear'
		: 'Categorías del Blog | Malaga Event Gear'}
	description={i18n.lang === 'en'
		? 'Browse all Malaga Event Gear blog categories — weddings, audio visual rental, corporate events, gadgets and news.'
		: 'Explora todas las categorías del blog de Malaga Event Gear: bodas, alquiler audiovisual, eventos corporativos, gadgets y noticias.'}
	{canonicalUrl}
	jsonLdSchema={[collectionSchema, itemListSchema]}
/>

<!-- Categories Heading -->
<section class="px-margin-mobile md:px-margin-desktop py-16 max-w-container-max mx-auto">
	<div class="mb-10">
		<a href="/blog/" class="text-sm text-electric-blue hover:underline">
			← {i18n.lang === 'en' ? 'All Posts' : 'Todos los artículos'}
		</a>
		<h1 class="font-headline-lg-mobile md:font-display-lg text-headline-lg-mobile md:text-display-lg text-on-surface mt-4 leading-tight">
			{i18n.lang === 'en' ? 'Categories' : 'Categorías'}
		</h1>
		<p class="text-on-surface-variant font-body-md mt-2">
			{categories.length}
			{i18n.lang === 'en' ? 'categories' : 'categorías'}
		</p>
	</div>

	<!-- Categories Grid -->
	<div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
		<a
			href="/blog/"
			class="group bg-surface-container-low border border-border-glass rounded-[20px] p-6 flex items-center gap-4 hover:border-electric-blue/40 transition-colors duration-300"
		>
			<span class="text-electric-blue shrink-0">
				<Icon name="rss_feed" size="28" />
			</span>
			<span class="flex flex-col">
				<span class="font-headline-sm text-headline-sm text-on-surface group-hover:text-electric-blue transition-colors leading-tight">
					{i18n.lang === 'en' ? 'All Posts' : 'Todos los Posts'}
				</span>
				<span class="font-body-sm text-body-sm text-on-surface-variant mt-1">
					{postCountLabel(data.totalPosts)}
				</span>
			</span>
		</a>

		{#each categories as cat (cat.slug)}
			<a
				href="/blog/category/{cat.slug}/"
				class="group bg-surface-container-low border border-border-glass rounded-[20px] p-6 flex items-center gap-4 hover:border-electric-blue/40 transition-colors duration-300"
			>
				<span class="text-electric-blue shrink-0">
					<Icon name="folder" size="28" />
				</span>
				<span class="flex flex-col">
					<span class="font-headline-sm text-headline-sm text-on-surface group-hover:text-electric-blue transition-colors leading-tight">
						{cat.name}
					</span>
					<span class="font-body-sm text-body-sm text-on-surface-variant mt-1">
						{postCountLabel(cat.count)}
					</span>
				</span>
			</a>
		{/each}
	</div>
</section>
