<script lang="ts">
	import SeoHead from '$lib/components/seo/SeoHead.svelte';
	import { buildArticleSchema, buildFAQSchema } from '$lib/utils/schema';
	import { i18n } from '$lib/i18n.svelte';
	import { slugify } from '$lib/utils/slugify';
	import { siteConfig } from '$lib/data/site';
	import type { BlogPost } from '$lib/types/blog';
	import TableOfContents from '$lib/components/blog/TableOfContents.svelte';
	import PackagesRail from '$lib/components/blog/PackagesRail.svelte';
	import PostCTA from '$lib/components/blog/PostCTA.svelte';
	import Testimonials from '$lib/components/testimonials/Testimonials.svelte';
	import { resolvePackageForPost, getPackagesForPost } from '$lib/data/packages';
	import { setContext, onMount } from 'svelte';
	import ShareThis from '$lib/components/blog/ShareThis.svelte';
	import ClickToTweet from '$lib/components/blog/ClickToTweet.svelte';

	let {
		post,
		children
	}: {
		post: BlogPost;
		children?: import('svelte').Snippet;
	} = $props();

	let canonicalUrl = $derived(`${siteConfig.url}/blog/${post.slug}/`);

	// First category for articleSection (if any)
	let firstCategory = $derived(post.categories[0] ?? undefined);

	let authorSlug = $derived(slugify(post.author));
	let authorUrl = $derived(`${siteConfig.url}/blog/author/${authorSlug}/`);

	let articleSchema = $derived(
		buildArticleSchema({
			title: post.title,
			description: post.description,
			datePublished: post.publishDate,
			dateModified: post.updated,
			authorName: post.author,
			authorUrl: authorUrl,
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

	// Resolve the most relevant package for this post's context
	let resolvedPackage = $derived(resolvePackageForPost(post));

	// Expose the resolved package to descendant components (e.g. <InlineCTA /> in the
	// mdsvex body) as a getter, so inline CTAs render the SAME package as the end-of-post
	// PostCTA below. A getter (not the raw value) keeps it reactive through the closure.
	setContext('post-package', () => resolvedPackage);

	// Packages ordered by relevance to this post (resolved first → matches the CTA)
	let railPackages = $derived(getPackagesForPost(post));

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

	let topShareEl = $state<HTMLElement | null>(null);
	let isTopVisible = $state(true);

	onMount(() => {
		if (!topShareEl) return;
		const observer = new IntersectionObserver(
			([entry]) => {
				isTopVisible = entry.isIntersecting;
			},
			{ threshold: 0 }
		);
		observer.observe(topShareEl);
		return () => observer.disconnect();
	});
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
		author: authorUrl,
		images: [{ url: post.coverImage, alt: post.title }]
	}}
/>

<div class="max-w-7xl mx-auto px-margin-mobile md:px-margin-desktop py-16 md:py-24">
	<!-- 3-col grid: [packages | content | toc] on desktop; single col on mobile -->
	<div class="lg:grid lg:grid-cols-[minmax(0,210px)_minmax(0,1fr)_minmax(0,240px)] lg:gap-10 lg:items-start">

		<!-- ── Col 1: Packages Rail (desktop only, sticky) ── -->
		<aside
			class="hidden lg:block lg:sticky lg:top-24 lg:self-start lg:max-h-[calc(100vh-7rem)] lg:overflow-y-auto"
			aria-label="Event packages sidebar"
		>
			<PackagesRail packages={railPackages} />
			<ShareThis mode="sidebar" visible={isTopVisible} url={canonicalUrl} title={post.title} coverImage={post.coverImage} />
		</aside>

		<!-- ── Col 2: Main content ── -->
		<article>
			<!-- Cover Image -->
			{#if post.coverImage}
				<div class="mb-8 rounded-2xl overflow-hidden aspect-video">
					<img
						src={post.coverImageThumb ?? post.coverImage}
						srcset={post.coverImageSrcset}
						sizes="(min-width: 1280px) 700px, (min-width: 768px) 600px, calc(100vw - 2rem)"
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

				<h1 class="font-display-lg text-[2.25rem] sm:text-[2.75rem] md:text-[3.5rem] lg:text-[4rem] leading-[1.12] tracking-tight text-on-surface text-center mt-3 mb-8">
					{post.title}
				</h1>

				<!-- Meta: author + date -->
				<div class="flex flex-wrap items-center justify-center gap-4 text-on-surface-variant font-body-sm text-body-sm">
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

			<!-- Mobile Packages strip (horizontal scroll-snap, hidden on lg+) -->
			<div class="packages-rail-mobile lg:hidden mb-8" data-testid="packages-rail-mobile">
				<PackagesRail packages={railPackages} />
			</div>

			<!-- Share Widget (Top, inline) -->
			<div bind:this={topShareEl}>
				<ShareThis mode="inline" url={canonicalUrl} title={post.title} coverImage={post.coverImage} />
			</div>

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

			<!-- Post CTA (package-driven, English copy) -->
			<PostCTA pkg={resolvedPackage} />

			<!-- Compact Testimonials carousel (no heading) -->
			<Testimonials variant="carousel" heading={false} compact />
		</article>

		<!-- ── Col 3: Table of Contents (desktop only, sticky) ── -->
		<aside
			class="hidden lg:block lg:sticky lg:top-24 lg:self-start lg:max-h-[calc(100vh-7rem)] lg:overflow-y-auto"
			aria-label="Table of contents sidebar"
		>
			<TableOfContents toc={post.toc} />
		</aside>

	</div>
</div>

<!-- Mobile FAB and Drawer Share (hidden on lg+) -->
<div class="lg:hidden">
	<ShareThis mode="drawer" visible={isTopVisible} url={canonicalUrl} title={post.title} coverImage={post.coverImage} />
</div>

<ClickToTweet url={canonicalUrl} title={post.title} />

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

	/* ── Mobile ToC (injected by rehype-post-toc) ─────────────────────────── */
	:global(.toc-mobile) {
		margin: 1.5rem 0 2rem;
		padding: 1.25rem 1.5rem;
		border-radius: 12px;
		border: 1px solid var(--color-border-glass, rgba(255,255,255,0.1));
		background: var(--color-surface-container-low, rgba(255,255,255,0.04));
		backdrop-filter: blur(8px);
	}

	:global(.toc-mobile-title) {
		font-size: 0.6875rem;
		font-weight: 700;
		letter-spacing: 0.1em;
		text-transform: uppercase;
		color: var(--color-on-surface-variant, #94a3b8);
		margin-bottom: 0.75rem;
	}

	:global(.toc-mobile-list) {
		list-style: none;
		padding: 0;
		margin: 0;
		display: flex;
		flex-direction: column;
		gap: 0.375rem;
	}

	:global(.toc-mobile-item--h3) {
		padding-left: 1rem;
	}

	:global(.toc-mobile-link) {
		display: block;
		font-size: 0.875rem;
		color: var(--color-on-surface-variant, #94a3b8);
		text-decoration: none;
		line-height: 1.4;
		padding: 0.125rem 0;
	}

	:global(.toc-mobile-link:hover) {
		color: var(--color-on-surface, #f1f5f9);
		text-decoration: underline;
	}

	/* ── Section cards (injected by rehype-section-cards) ─────────────────── */
	:global(.section-card) {
		margin: 2rem 0;
		padding: 1.5rem;
		border-radius: 16px;
		border: 1px solid var(--color-border-glass, rgba(255,255,255,0.1));
		background: var(--color-surface-container-low, rgba(255,255,255,0.04));
		backdrop-filter: blur(12px);
	}

	:global(.section-card--highlights) {
		border-color: rgba(59, 130, 246, 0.35);
		background: linear-gradient(
			135deg,
			rgba(59, 130, 246, 0.07) 0%,
			rgba(139, 92, 246, 0.05) 100%
		);
	}

	:global(.section-card-title) {
		font-size: 1.25rem;
		font-weight: 700;
		color: var(--color-on-surface, #f1f5f9);
		margin-bottom: 1rem;
		padding-bottom: 0.5rem;
		border-bottom: 2px solid rgba(59, 130, 246, 0.3);
		display: flex;
		align-items: center;
		gap: 0.5rem;
	}

	:global(.section-card--highlights .section-card-title) {
		color: var(--color-electric-blue, #3b82f6);
	}

	/* ── Image gallery (injected by rehype-image-gallery) ─────────────────── */
	:global(.img-gallery) {
		margin: 1.5rem 0;
		display: flex;
		overflow-x: auto;
		scroll-snap-type: x mandatory;
		scroll-behavior: smooth;
		-webkit-overflow-scrolling: touch;
		scrollbar-width: none;
		gap: 0.75rem;
		border-radius: 12px;
		padding-bottom: 0.25rem;
	}

	:global(.img-gallery::-webkit-scrollbar) {
		display: none;
	}

	:global(.img-gallery > figure),
	:global(.img-gallery > p) {
		flex: 0 0 auto;
		scroll-snap-align: start;
		width: min(82%, 440px);
		margin: 0;
	}

	:global(.img-gallery img) {
		width: 100%;
		aspect-ratio: 4 / 3;
		height: auto;
		display: block;
		object-fit: cover;
		border-radius: 14px;
		box-shadow: 0 10px 30px -12px rgba(0, 0, 0, 0.5);
	}

	:global(.img-gallery figcaption) {
		margin-top: 0.6rem;
		font-size: 0.8125rem;
		line-height: 1.5;
		font-style: italic;
		color: var(--color-on-surface-variant, #94a3b8);
	}

	/* ── Prose typography improvements (Medium-inspired) ───────────────────── */
	:global(.prose) {
		font-size: 1.125rem;
		line-height: 1.8;
		color: var(--color-on-surface-variant, #94a3b8);
	}

	:global(.prose p) {
		margin-bottom: 1.5rem;
	}

	:global(.prose h2) {
		font-size: 1.625rem;
		font-weight: 700;
		letter-spacing: -0.015em;
		margin-top: 3rem;
		margin-bottom: 1rem;
		color: var(--color-on-surface, #f1f5f9);
		line-height: 1.25;
	}

	:global(.prose h3) {
		font-size: 1.25rem;
		font-weight: 600;
		letter-spacing: -0.01em;
		margin-top: 2rem;
		margin-bottom: 0.75rem;
		color: var(--color-on-surface, #f1f5f9);
		line-height: 1.3;
	}

	:global(.prose strong) {
		color: var(--color-on-surface, #f1f5f9);
		font-weight: 600;
	}

	:global(.prose a) {
		color: var(--color-electric-blue, #3b82f6);
		text-decoration: underline;
		text-underline-offset: 3px;
	}

	:global(.prose a:hover) {
		text-decoration-thickness: 2px;
	}

	:global(.prose ul),
	:global(.prose ol) {
		margin-bottom: 1.5rem;
		padding-left: 1.5rem;
	}

	/* Tailwind v4 preflight resets list-style to none on ul/ol; re-apply markers */
	:global(.prose ul) {
		list-style: disc;
	}

	:global(.prose ol) {
		list-style: decimal;
	}

	:global(.prose ul ul) {
		list-style: circle;
	}

	:global(.prose ul ul ul) {
		list-style: square;
	}

	:global(.prose li) {
		margin-bottom: 0.5rem;
	}

	:global(.prose li::marker) {
		color: var(--color-electric-blue, #3b82f6);
	}

	:global(.prose blockquote) {
		border-left: 3px solid var(--color-electric-blue, #3b82f6);
		padding-left: 1.25rem;
		margin: 2rem 0;
		color: var(--color-on-surface-variant, #94a3b8);
		font-style: italic;
	}

	:global(.prose hr) {
		border-color: var(--color-border-glass, rgba(255,255,255,0.1));
		margin: 2.5rem 0;
	}

	:global(.prose figure) {
		margin: 1.5rem 0;
	}

	:global(.prose figcaption) {
		font-size: 0.875rem;
		color: var(--color-on-surface-variant, #94a3b8);
		text-align: center;
		margin-top: 0.5rem;
		font-style: italic;
	}

	/* Tables — wrapped by rehypeTableWrap for horizontal scroll on narrow viewports */
	:global(.prose .table-wrap) {
		overflow-x: auto;
		margin: 1.5rem 0;
		-webkit-overflow-scrolling: touch;
		border-radius: 0.5rem;
		border: 1px solid var(--color-border-glass, rgba(255, 255, 255, 0.1));
	}

	:global(.prose table) {
		width: 100%;
		border-collapse: collapse;
		min-width: 32rem;
		font-size: 0.95em;
	}

	:global(.prose th),
	:global(.prose td) {
		border: 1px solid var(--color-border-glass, rgba(255, 255, 255, 0.1));
		padding: 0.6rem 0.85rem;
		text-align: left;
		vertical-align: top;
	}

	:global(.prose thead th) {
		background: rgba(255, 255, 255, 0.05);
		font-weight: 600;
	}

	:global(.prose tbody tr:nth-child(even)) {
		background: rgba(255, 255, 255, 0.02);
	}

	@media (max-width: 640px) {
		:global(.prose th),
		:global(.prose td) {
			padding: 0.5rem 0.6rem;
			font-size: 0.875em;
		}
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
