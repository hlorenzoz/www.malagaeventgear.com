<script lang="ts">
	import { i18n } from '$lib/i18n.svelte';
	import { slugify } from '$lib/utils/slugify';
	import type { BlogPost } from '$lib/types/blog';

	let { post }: { post: BlogPost } = $props();

	function formatDate(dateStr: string): string {
		try {
			return new Date(dateStr).toLocaleDateString(i18n.lang === 'es' ? 'es-ES' : 'en-GB', {
				year: 'numeric',
				month: 'short',
				day: 'numeric'
			});
		} catch {
			return dateStr;
		}
	}
</script>

<!--
  Compact blog card for the home "Latest Posts/News" carousels. Fixed width so 5 cards
  scroll-snap horizontally on any viewport. Cover uses the small cover-thumb srcset.
-->
<article
	data-testid="home-post-card"
	class="snap-start shrink-0 w-[280px] bg-surface-container-low border border-border-glass rounded-2xl overflow-hidden hover:border-electric-blue/40 transition-colors duration-300 flex flex-col"
>
	{#if post.coverImage}
		<a href="/blog/{post.slug}/" class="block aspect-video overflow-hidden" aria-label={post.title}>
			<img
				src={post.coverImageThumb ?? post.coverImage}
				srcset={post.coverImageSrcset}
				sizes="280px"
				alt={post.title}
				width="280"
				height="158"
				class="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
				loading="lazy"
				decoding="async"
			/>
		</a>
	{/if}

	<div class="p-5 flex flex-col flex-1">
		<!-- Badge: News, else first category -->
		<div class="mb-2">
			{#if post.isNews}
				<span class="px-2 py-0.5 rounded-full text-xs font-label-sm bg-electric-blue-strong text-white uppercase tracking-wider">
					{i18n.lang === 'en' ? 'News' : 'Noticias'}
				</span>
			{:else if post.categories && post.categories.length > 0}
				<a
					href="/blog/category/{slugify(post.categories[0])}/"
					class="text-xs font-label-sm text-electric-blue uppercase tracking-wider hover:underline"
				>
					{post.categories[0]}
				</a>
			{/if}
		</div>

		<h3 class="font-headline-sm text-base text-on-surface leading-snug mb-3 line-clamp-2">
			<a href="/blog/{post.slug}/" class="hover:text-electric-blue transition-colors">
				{post.title}
			</a>
		</h3>

		<time datetime={post.publishDate} class="mt-auto text-xs text-on-surface-variant">
			{formatDate(post.publishDate)}
		</time>
	</div>
</article>
