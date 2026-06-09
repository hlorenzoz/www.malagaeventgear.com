<script lang="ts">
	import SeoHead from '$lib/components/seo/SeoHead.svelte';
	import { buildArticleSchema } from '$lib/utils/schema';
	import { i18n } from '$lib/i18n.svelte';
	import { slugify } from '$lib/utils/slugify';
	import type { BlogPost } from '$lib/types/blog';

	let {
		post,
		children
	}: {
		post: BlogPost;
		children?: import('svelte').Snippet;
	} = $props();

	let canonicalUrl = $derived(`https://malagaeventgear.com/blog/${post.slug}/`);

	let articleSchema = $derived(
		buildArticleSchema({
			title: post.title,
			description: post.description,
			datePublished: post.publishDate,
			dateModified: post.updated,
			authorName: post.author,
			url: `/blog/${post.slug}/`,
			imageUrl: post.coverImage
		})
	);

	let authorSlug = $derived(slugify(post.author));

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
	title={post.title}
	description={post.description}
	{canonicalUrl}
	image={post.coverImage}
	jsonLdSchema={articleSchema}
/>

<article class="max-w-3xl mx-auto px-margin-mobile md:px-margin-desktop py-16 md:py-24">
	<!-- Cover Image -->
	{#if post.coverImage}
		<div class="mb-8 rounded-2xl overflow-hidden aspect-video">
			<img
				src={post.coverImageThumb ?? post.coverImage}
				srcset={post.coverImageSrcset}
				sizes="(min-width: 768px) 768px, 100vw"
				alt={post.title}
				width="768"
				height="432"
				class="w-full h-full object-cover"
				loading="eager"
				fetchpriority="high"
			/>
		</div>
	{/if}

	<!-- Post Header -->
	<header class="mb-10">
		<!-- Categories -->
		{#if post.categories && post.categories.length > 0}
			<div class="flex flex-wrap gap-2 mb-4">
				{#each post.categories as category}
					<a
						href="/blog/category/{slugify(category)}/"
						class="text-sm font-label-sm text-electric-blue uppercase tracking-wider hover:underline"
					>
						{category}
					</a>
				{/each}
			</div>
		{/if}

		<h1 class="font-headline-lg-mobile md:font-display-lg text-headline-lg-mobile md:text-display-lg text-on-surface leading-tight mb-6">
			{post.title}
		</h1>

		<!-- Meta: author + date -->
		<div class="flex flex-wrap items-center gap-4 text-on-surface-variant font-body-sm text-body-sm">
			<span>
				{i18n.lang === 'en' ? 'By' : 'Por'}
				<a href="/blog/author/{authorSlug}/" class="text-electric-blue hover:underline ml-1">
					{post.author}
				</a>
			</span>
			<span class="text-border-glass">·</span>
			<time datetime={post.publishDate}>{formatDate(post.publishDate)}</time>
			{#if post.updated && post.updated !== post.publishDate}
				<span class="text-border-glass">·</span>
				<span>
					{i18n.lang === 'en' ? 'Updated' : 'Actualizado'}
					<time datetime={post.updated}>{formatDate(post.updated)}</time>
				</span>
			{/if}
		</div>
	</header>

	<!-- Post Body (mdsvex content rendered via children snippet) -->
	<div class="prose prose-invert prose-lg max-w-none">
		{@render children?.()}
	</div>

	<!-- Tags -->
	{#if post.tags && post.tags.length > 0}
		<footer class="mt-12 pt-8 border-t border-border-glass">
			<div class="flex flex-wrap gap-2">
				{#each post.tags as tag}
					<span class="px-3 py-1 rounded-full text-xs font-label-sm bg-surface-container-low border border-border-glass text-on-surface-variant">
						{tag}
					</span>
				{/each}
			</div>
		</footer>
	{/if}
</article>
