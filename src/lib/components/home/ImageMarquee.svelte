<script lang="ts">
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
</script>

<div
	class="marquee-container {pauseOnHover ? 'pause-on-hover' : ''}"
	style:--speed={speedVal}
>
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
</div>

<style>
	.marquee-container {
		overflow: hidden;
		width: 100%;
		position: relative;
		padding: 1.5rem 0;
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
		/* Frosted glass styling matching DESIGN.md */
		background: rgba(255, 255, 255, 0.05);
		border: 1px solid rgba(255, 255, 255, 0.12);
		backdrop-filter: blur(20px);
		-webkit-backdrop-filter: blur(20px);
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
