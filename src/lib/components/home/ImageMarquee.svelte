<script lang="ts">
	import { onMount } from 'svelte';

	interface Props {
		images: { src: string; alt: string }[];
		speed?: 'slow' | 'normal' | 'fast';
		direction?: 'left' | 'right';
		pauseOnHover?: boolean;
	}

	let {
		images,
		speed = 'normal',
		direction = 'left',
		pauseOnHover = true
	}: Props = $props();

	// Duplicate the images array to enable seamless, infinite looping
	let doubleImages = $derived([...images, ...images]);

	// Map human-readable speed options to CSS duration values
	let speedVal = $derived(
		speed === 'slow' ? '70s' : speed === 'normal' ? '45s' : '25s'
	);

	// Select correct animation CSS class based on the direction prop
	let animationClass = $derived(
		direction === 'right' ? 'animate-marquee-reverse' : 'animate-marquee'
	);

	// Deferred mount: the marquee is decorative and below the fold. Rendering its
	// ~60 <img> + infinite animation server-side bloated the home DOM and saturated
	// the paint/composite path during the critical render window, which delayed and
	// destabilized the hero <h1> contentful paint → intermittent NO_LCP in Lighthouse.
	// We keep the image track out of the initial render and mount it only when it
	// scrolls near the viewport, so the animation also never runs offscreen.
	let container = $state<HTMLDivElement | null>(null);
	let inView = $state(false);

	onMount(() => {
		if (!container) return;
		if (!('IntersectionObserver' in window)) {
			inView = true; // graceful fallback for very old engines
			return;
		}
		const io = new IntersectionObserver(
			(entries) => {
				if (entries.some((e) => e.isIntersecting)) {
					inView = true;
					io.disconnect();
				}
			},
			{ rootMargin: '200px' }
		);
		io.observe(container);
		return () => io.disconnect();
	});
</script>

<div
	bind:this={container}
	class="marquee-container {pauseOnHover ? 'pause-on-hover' : ''}"
	style:--speed={speedVal}
>
	{#if inView}
		<div class="marquee-track {animationClass}">
			{#each doubleImages as img, i (img.src + '-' + i)}
				<div class="marquee-item">
					<img
						src={img.src}
						alt={img.alt}
						loading="lazy"
						decoding="async"
						width="320"
						height="220"
					/>
				</div>
			{/each}
		</div>
	{/if}
</div>

<style>
	.marquee-container {
		overflow: hidden;
		width: 100%;
		position: relative;
		padding: 1.5rem 0;
		/* Reserve the track height so the deferred (in-view) mount of the image row
		   doesn't shift layout: 220px item + 1.5rem top/bottom padding. */
		min-height: calc(220px + 3rem);
		/* Gradient mask to fade out the edges for a highly premium glass look */
		mask-image: linear-gradient(
			to right,
			transparent,
			white 15%,
			white 85%,
			transparent
		);
		-webkit-mask-image: linear-gradient(
			to right,
			transparent,
			white 15%,
			white 85%,
			transparent
		);
	}

	.marquee-track {
		display: flex;
		width: max-content;
		gap: 1.5rem;
	}

	.animate-marquee {
		animation: marquee var(--speed) linear infinite;
	}

	.animate-marquee-reverse {
		animation: marquee-reverse var(--speed) linear infinite;
	}

	/* Pause animation when the user hovers over the track */
	.pause-on-hover:hover .marquee-track {
		animation-play-state: paused;
	}

	.marquee-item {
		flex-shrink: 0;
		width: 320px;
		height: 220px;
		border-radius: 1rem;
		overflow: hidden;
		position: relative;
		/* Frosted glass styling matching DESIGN.md.
		   No backdrop-filter on purpose: each item nearly fills with an opaque photo,
		   so the live blur was barely visible yet ~60 of them saturated the compositor
		   during the critical render window (a cause of the home's intermittent NO_LCP).
		   The translucent background + border keep the frosted look statically. */
		background: rgba(255, 255, 255, 0.05);
		border: 1px solid rgba(255, 255, 255, 0.12);
		box-shadow: 0 4px 30px rgba(0, 0, 0, 0.1);
		transition:
			transform 0.4s ease,
			border-color 0.4s ease,
			box-shadow 0.4s ease;
	}

	.marquee-item:hover {
		transform: scale(1.03);
		border-color: rgba(255, 255, 255, 0.25);
		box-shadow: 0 8px 40px rgba(77, 140, 255, 0.15);
	}

	.marquee-item img {
		width: 100%;
		height: 100%;
		object-fit: cover;
		display: block;
		opacity: 0.85;
		transition:
			opacity 0.4s ease,
			transform 0.4s ease;
	}

	.marquee-item:hover img {
		opacity: 1;
		transform: scale(1.02);
	}

	/* CSS Animations with 3D transforms for GPU acceleration and high performance */
	@keyframes marquee {
		0% {
			transform: translate3d(0, 0, 0);
		}
		100% {
			transform: translate3d(-50%, 0, 0);
		}
	}

	@keyframes marquee-reverse {
		0% {
			transform: translate3d(-50%, 0, 0);
		}
		100% {
			transform: translate3d(0, 0, 0);
		}
	}
</style>
