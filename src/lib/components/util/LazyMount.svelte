<script lang="ts">
	import { onMount, type Snippet } from 'svelte';

	let {
		minHeight = '600px',
		rootMargin = '200px',
		children
	}: {
		/** Reserved height before the content mounts, to avoid layout shift (CLS). */
		minHeight?: string;
		/** How early to mount before the placeholder scrolls into view. */
		rootMargin?: string;
		children?: Snippet;
	} = $props();

	// Defers mounting (and, when the child uses a dynamic import, downloading) of
	// below-the-fold content until it scrolls near the viewport. Keeps heavy sections
	// out of the initial DOM, hydration cost, and the critical render window.
	let placeholder = $state<HTMLDivElement | null>(null);
	let show = $state(false);

	onMount(() => {
		if (!placeholder) return;
		if (!('IntersectionObserver' in window)) {
			show = true; // graceful fallback for engines without IO
			return;
		}
		const io = new IntersectionObserver(
			(entries) => {
				if (entries.some((e) => e.isIntersecting)) {
					show = true;
					io.disconnect();
				}
			},
			{ rootMargin }
		);
		io.observe(placeholder);
		return () => io.disconnect();
	});
</script>

{#if show}
	{@render children?.()}
{:else}
	<div bind:this={placeholder} style:min-height={minHeight} aria-hidden="true"></div>
{/if}
