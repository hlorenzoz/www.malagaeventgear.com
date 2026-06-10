<script lang="ts">
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

			<!-- Horizontal scroll-snap carousel (zero-JS, swipe on mobile / scroll on desktop) -->
			<div
				class="flex gap-5 overflow-x-auto snap-x snap-mandatory scroll-smooth pb-4 -mx-2 px-2 scrollbar-none [&::-webkit-scrollbar]:hidden"
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
