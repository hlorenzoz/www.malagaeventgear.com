<script lang="ts">
	import SeoHead from '$lib/components/seo/SeoHead.svelte';
	import { i18n } from '$lib/i18n.svelte';
	import { slugify } from '$lib/utils/slugify';
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();

	let posts = $derived(data.posts);
	let categorySlug = $derived(data.category);
	// Display name from categoryMeta if available, otherwise prettify the slug
	let categoryName = $derived(
		data.categoryMeta?.name ??
		categorySlug.split('-').map((w: string) => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')
	);

	let canonicalUrl = $derived(`https://malagaeventgear.com/blog/category/${categorySlug}/`);

	let collectionSchema = $derived({
		'@context': 'https://schema.org',
		'@type': 'CollectionPage',
		'@id': `${canonicalUrl}#webpage`,
		'url': canonicalUrl,
		'name': `${categoryName} | Blog | Malaga Event Gear`,
		'isPartOf': {
			'@type': 'WebSite',
			'@id': 'https://malagaeventgear.com/#website',
			'url': 'https://malagaeventgear.com/',
			'name': 'Malaga Event Gear'
		},
		'numberOfItems': posts.length
	});

	function formatDate(dateStr: string): string {
		try {
			return new Date(dateStr).toLocaleDateString(i18n.lang === 'es' ? 'es-ES' : 'en-GB', {
				year: 'numeric',
				month: 'long',
				day: 'numeric'
			});
		} catch {
			return dateStr;
		}
	}
</script>

<SeoHead
	title={`${categoryName} | Blog | Malaga Event Gear`}
	description={i18n.lang === 'en'
		? `Read all posts about ${categoryName} from the Malaga Event Gear blog.`
		: `Todos los artículos sobre ${categoryName} en el blog de Malaga Event Gear.`}
	{canonicalUrl}
	jsonLdSchema={collectionSchema}
/>

<!-- Category Heading -->
<section class="px-margin-mobile md:px-margin-desktop py-16 max-w-container-max mx-auto">
	<div class="mb-10">
		<a href="/blog/" class="text-sm text-electric-blue hover:underline">
			← {i18n.lang === 'en' ? 'All Posts' : 'Todos los artículos'}
		</a>
		<h1 class="font-headline-lg-mobile md:font-display-lg text-headline-lg-mobile md:text-display-lg text-on-surface mt-4 leading-tight">
			{categoryName}
		</h1>
		<p class="text-on-surface-variant font-body-md mt-2">
			{posts.length}
			{i18n.lang === 'en' ? (posts.length === 1 ? 'post' : 'posts') : (posts.length === 1 ? 'artículo' : 'artículos')}
		</p>
	</div>

	<!-- Posts Grid -->
	<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
		{#each posts as post, i}
			<article data-testid="post-card" class="relative bg-surface-container-low border border-border-glass rounded-[20px] overflow-hidden hover:border-electric-blue/40 transition-colors duration-300 flex flex-col">
				{#if post.coverImage}
					<a href="/blog/{post.slug}/" class="block aspect-video overflow-hidden">
						<img
							src={post.coverImageThumb ?? post.coverImage}
							srcset={post.coverImageSrcset}
							sizes="(min-width: 1024px) 370px, (min-width: 768px) 45vw, calc(100vw - 2rem)"
							alt={post.title}
							width="370"
							height="208"
							class="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
							loading={i === 0 ? 'eager' : 'lazy'}
							fetchpriority={i === 0 ? 'high' : undefined}
						/>
					</a>
				{/if}

				<div class="p-6 flex flex-col flex-1">
					<div class="flex flex-wrap items-center gap-2 mb-3">
						{#if post.isNews}
							<span class="px-2 py-0.5 rounded-full text-xs font-label-sm bg-electric-blue text-white uppercase tracking-wider">
								{i18n.lang === 'en' ? 'News' : 'Noticias'}
							</span>
						{/if}
						{#each post.categories as cat}
							<a
								href="/blog/category/{slugify(cat)}/"
								class="text-xs font-label-sm text-electric-blue uppercase tracking-wider hover:underline"
							>
								{cat}
							</a>
						{/each}
					</div>

					<h2 class="font-headline-sm text-headline-sm text-on-surface mb-3 leading-tight">
						<a href="/blog/{post.slug}/" class="hover:text-electric-blue transition-colors">
							{post.title}
						</a>
					</h2>

					{#if post.excerpt}
						<p class="font-body-sm text-body-sm text-on-surface-variant mb-4 flex-1 line-clamp-3">
							{post.excerpt}
						</p>
					{/if}

					<div class="flex items-center justify-between mt-auto pt-4 border-t border-border-glass">
						<time datetime={post.publishDate} class="text-xs text-on-surface-variant">
							{formatDate(post.publishDate)}
						</time>
						<a
							href="/blog/{post.slug}/"
							class="text-xs font-label-sm text-electric-blue hover:underline uppercase tracking-wider"
						>
							{i18n.lang === 'en' ? 'Read More →' : 'Leer Más →'}
						</a>
					</div>
				</div>
			</article>
		{/each}
	</div>
</section>
