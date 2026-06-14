<script lang="ts">
	import { onMount } from 'svelte';
	import Icon from '$lib/components/navigation/Icon.svelte';
	import BlogPostCard from '$lib/components/blog/BlogPostCard.svelte';
	import type { BlogPost } from '$lib/types/blog';

	let {
		title,
		posts,
		viewAllHref,
		viewAllLabel
	}: {
		title: string;
		posts: BlogPost[];
		viewAllHref: string;
		viewAllLabel: string;
	} = $props();

	// Start NON-scrollable, become scrollable after hydration. Root cause of the home's
	// NO_LCP: the browser scroll-adjusts a scrollable carousel container during initial
	// layout (~150ms, before the hero <h1> paints), and that early container scroll stops
	// Largest Contentful Paint recording -> zero LCP candidates. Rendering overflow-x:hidden
	// in SSR prevents the scroll; onMount runs after FCP (the <h1> is already the recorded
	// LCP), so enabling scroll then is safe. These rows are below the fold, so there is no
	// visible difference.
	let scrollable = $state(false);
	onMount(() => {
		scrollable = true;
	});
</script>

{#if posts.length > 0}
	<section class="py-16 px-margin-mobile md:px-margin-desktop">
		<div class="max-w-container-max mx-auto">
			<div class="flex items-center justify-between gap-4 mb-8">
				<h2 class="font-headline-lg text-[28px] md:text-headline-lg text-on-background">{title}</h2>
				<a
					href={viewAllHref}
					class="hidden sm:inline-flex items-center gap-2 text-electric-blue font-label-sm uppercase tracking-wider hover:underline whitespace-nowrap"
				>
					{viewAllLabel}
					<Icon name="arrow_forward" size="18" />
				</a>
			</div>

			<!-- Horizontal scroll-snap carousel (zero-JS, swipe on mobile / scroll on desktop).
			     snap-proximity (not mandatory) on purpose: mandatory makes the browser perform a
			     forced snap-scroll on initial layout (the first card's snap point sits 8px in due to
			     the px-2 padding), and that early container scroll suppressed Largest Contentful Paint
			     recording on the home -> NO_LCP. proximity keeps the snap UX without the load scroll. -->
			<div
				class="flex gap-5 {scrollable ? 'overflow-x-auto' : 'overflow-x-hidden'} snap-x snap-proximity scroll-smooth pb-4 -mx-2 px-2 scrollbar-none [&::-webkit-scrollbar]:hidden"
			>
				{#each posts as post (post.slug)}
					<BlogPostCard {post} />
				{/each}
			</div>

			<!-- Mobile "view all" button (the header link is hidden on mobile) -->
			<div class="sm:hidden mt-6 text-center">
				<a
					href={viewAllHref}
					class="inline-flex items-center gap-2 bg-electric-blue-strong text-white px-8 py-3 rounded-full font-label-lg hover:-translate-y-0.5 transition-all active:scale-95 duration-200"
				>
					{viewAllLabel}
					<Icon name="arrow_forward" size="20" />
				</a>
			</div>
		</div>
	</section>
{/if}
