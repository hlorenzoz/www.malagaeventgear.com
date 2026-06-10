<script lang="ts">
	import SeoHead from '$lib/components/seo/SeoHead.svelte';
	import { buildArticleSchema, buildFAQSchema } from '$lib/utils/schema';
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

	// First category for articleSection (if any)
	let firstCategory = $derived(post.categories[0] ?? undefined);

	let articleSchema = $derived(
		buildArticleSchema({
			title: post.title,
			description: post.description,
			datePublished: post.publishDate,
			dateModified: post.updated,
			authorName: post.author,
			url: `/blog/${post.slug}/`,
			imageUrl: post.coverImage,
			// Use NewsArticle @type when the post belongs to the "News" category
			type: post.isNews ? 'NewsArticle' : 'BlogPosting',
			articleSection: firstCategory,
			keywords: post.tags && post.tags.length > 0 ? post.tags : undefined
		})
	);

	// Build FAQPage schema only when the post has FAQ pairs
	let faqSchema = $derived(
		post.faqs && post.faqs.length > 0 ? buildFAQSchema(post.faqs) : null
	);

	// Array of JSON-LD schemas to inject — article always present, FAQ when available
	let jsonLdSchemas = $derived(
		faqSchema ? [articleSchema, faqSchema] : [articleSchema]
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
	jsonLdSchema={jsonLdSchemas}
	openGraph={{
		type: 'article',
		publishedTime: post.publishDate,
		modifiedTime: post.updated ?? post.publishDate,
		section: firstCategory,
		tags: post.tags && post.tags.length > 0 ? post.tags : undefined,
		author: post.author,
		images: [{ url: post.coverImage, alt: post.title }]
	}}
/>

<article class="max-w-3xl mx-auto px-margin-mobile md:px-margin-desktop py-16 md:py-24">
	<!-- Cover Image -->
	{#if post.coverImage}
		<div class="mb-8 rounded-2xl overflow-hidden aspect-video">
			<img
				src={post.coverImageThumb ?? post.coverImage}
				srcset={post.coverImageSrcset}
				sizes="(min-width: 768px) 768px, calc(100vw - 2rem)"
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

<style>
	/* FAQ Accordion — global styles targeting the rehype-faq-accordion plugin output.
	   Must be :global because the content is rendered dynamically via mdsvex, not
	   within this component's static template. */

	:global(.faq-section) {
		margin-top: 2.5rem;
		margin-bottom: 2.5rem;
	}

	:global(.faq-title) {
		font-size: 1.5rem;
		font-weight: 700;
		margin-bottom: 1.25rem;
		color: var(--color-on-surface, #f1f5f9);
	}

	:global(.faq-item) {
		border: 1px solid var(--color-border-glass, rgba(255,255,255,0.1));
		border-radius: 12px;
		background: var(--color-surface-container-low, rgba(255,255,255,0.04));
		backdrop-filter: blur(8px);
		margin-bottom: 0.75rem;
		overflow: hidden;
		transition: border-color 0.2s ease;
	}

	:global(.faq-item:hover) {
		border-color: rgba(59,130,246,0.4);
	}

	:global(.faq-q) {
		display: flex;
		align-items: center;
		justify-content: space-between;
		padding: 1rem 1.25rem;
		font-weight: 600;
		font-size: 1rem;
		cursor: pointer;
		list-style: none;
		color: var(--color-on-surface, #f1f5f9);
		/* Minimum 44px tap target for accessibility */
		min-height: 44px;
	}

	/* Remove default triangle in WebKit */
	:global(.faq-q::-webkit-details-marker) {
		display: none;
	}

	/* Chevron via pseudo-element */
	:global(.faq-q::after) {
		content: '';
		display: inline-block;
		width: 0.5em;
		height: 0.5em;
		border-right: 2px solid currentColor;
		border-bottom: 2px solid currentColor;
		transform: rotate(45deg);
		transition: transform 0.25s ease;
		flex-shrink: 0;
		margin-left: 0.75rem;
		opacity: 0.6;
	}

	:global(details[open] > .faq-q::after) {
		transform: rotate(-135deg);
	}

	:global(.faq-answer) {
		padding: 0 1.25rem 1.25rem;
		color: var(--color-on-surface-variant, #94a3b8);
		font-size: 0.9375rem;
		line-height: 1.7;
	}

	:global(.faq-answer p) {
		margin-bottom: 0.75rem;
	}

	:global(.faq-answer p:last-child) {
		margin-bottom: 0;
	}

	/* Respect reduced-motion preference */
	@media (prefers-reduced-motion: reduce) {
		:global(.faq-item),
		:global(.faq-q::after) {
			transition: none;
		}
	}

	/* Mobile: ensure touch targets are comfortable */
	@media (max-width: 640px) {
		:global(.faq-q) {
			padding: 0.875rem 1rem;
		}

		:global(.faq-answer) {
			padding: 0 1rem 1rem;
		}
	}
</style>
