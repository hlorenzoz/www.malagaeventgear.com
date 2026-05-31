<script lang="ts">
	import { i18n } from '$lib/i18n.svelte';
	import Icon from '$lib/components/navigation/Icon.svelte';
	import TestimonialCard from './TestimonialCard.svelte';
	import {
		getReviewsMeta,
		getTestimonials,
		GMB_PROFILE_URL,
		type ReviewsMeta,
		type Testimonial
	} from '$lib/data/testimonials';

	let {
		testimonials = getTestimonials(),
		meta = getReviewsMeta(),
		variant = 'carousel',
		limit,
		heading = true
	}: {
		testimonials?: Testimonial[];
		meta?: ReviewsMeta;
		variant?: 'carousel' | 'grid';
		limit?: number;
		heading?: boolean;
	} = $props();

	let items = $derived(typeof limit === 'number' ? testimonials.slice(0, limit) : testimonials);

	let basedOn = $derived(
		i18n.t.testimonials.basedOn.replace('{n}', String(meta.totalCount))
	);

	let track = $state<HTMLDivElement | null>(null);

	// Reactive scroll state so the nav arrows reflect reality: they are hidden when
	// the cards already fit (no overflow), and each arrow disables at its edge.
	let scrollable = $state(false);
	let atStart = $state(true);
	let atEnd = $state(false);

	function updateScrollState() {
		if (!track) return;
		const max = track.scrollWidth - track.clientWidth;
		scrollable = max > 1;
		atStart = track.scrollLeft <= 1;
		atEnd = track.scrollLeft >= max - 1;
	}

	function scrollByCard(direction: 1 | -1) {
		if (!track) return;
		const card = track.querySelector<HTMLElement>('[data-testid="testimonial-card"]');
		const amount = card ? card.offsetWidth + 24 : track.clientWidth * 0.8;
		track.scrollBy({ left: amount * direction, behavior: 'smooth' });
	}

	// Recompute on mount, on scroll, and whenever the track is resized.
	$effect(() => {
		if (!track) return;
		updateScrollState();
		const el = track;
		el.addEventListener('scroll', updateScrollState, { passive: true });
		const ro = new ResizeObserver(updateScrollState);
		ro.observe(el);
		return () => {
			el.removeEventListener('scroll', updateScrollState);
			ro.disconnect();
		};
	});
</script>

<section
	id="testimonials"
	data-testid="testimonials"
	class="py-32 px-margin-mobile md:px-margin-desktop bg-surface-container-low border-y border-border-glass transition-colors duration-300"
>
	<div class="max-w-container-max mx-auto">
		{#if heading}
			<div class="text-center mb-12">
				<span class="inline-block px-4 py-2 rounded-full glass-panel font-label-sm text-electric-blue uppercase tracking-widest mb-4">
					{i18n.t.testimonials.badge}
				</span>
				<h2 class="font-headline-lg text-[32px] md:text-headline-lg text-on-background mb-4">
					{i18n.t.testimonials.title}
				</h2>
				<p class="font-body-lg text-on-surface-variant max-w-xl mx-auto">
					{i18n.t.testimonials.subtitle}
				</p>
			</div>
		{/if}

		<!-- Aggregate rating block -->
		<div
			data-testid="reviews-meta"
			class="flex flex-col items-center gap-2 mb-10"
		>
			<span class="font-label-lg uppercase tracking-widest text-on-surface font-bold">
				{i18n.t.testimonials.ratingLabel}
			</span>
			<div class="flex items-center gap-0.5 text-[#fbbf24]">
				{#each Array(5) as _, i (i)}
					<Icon name={i < Math.round(meta.averageRating) ? 'star' : 'star_border'} size="22" />
				{/each}
			</div>
			<p class="font-body-md text-sm text-on-surface-variant">{basedOn}</p>
			<div class="flex items-center gap-1.5 text-on-surface-variant">
				<svg class="w-4 h-4" viewBox="0 0 24 24" aria-hidden="true">
					<path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.27-4.74 3.27-8.1Z"/>
					<path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.99.66-2.26 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84A11 11 0 0 0 12 23Z"/>
					<path fill="#FBBC05" d="M5.84 14.1a6.6 6.6 0 0 1 0-4.2V7.06H2.18a11 11 0 0 0 0 9.88l3.66-2.84Z"/>
					<path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1A11 11 0 0 0 2.18 7.06l3.66 2.84C6.71 7.3 9.14 5.38 12 5.38Z"/>
				</svg>
				<span class="font-body-sm text-xs">{i18n.t.testimonials.poweredBy}</span>
			</div>
		</div>

		{#if variant === 'grid'}
			<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
				{#each items as testimonial (testimonial.id)}
					<TestimonialCard {testimonial} />
				{/each}
			</div>
		{:else}
			<div class="relative">
				<div
					bind:this={track}
					data-testid="carousel-track"
					class="flex gap-6 overflow-x-auto snap-x snap-mandatory scroll-smooth pb-4 -mx-2 px-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden {scrollable ? '' : 'justify-center'}"
				>
					{#each items as testimonial (testimonial.id)}
						<TestimonialCard {testimonial} />
					{/each}
				</div>

				<!-- Nav arrows only appear when the track actually overflows -->
				{#if scrollable}
					<div class="flex justify-center gap-3 mt-6">
						<button
							data-testid="carousel-prev"
							type="button"
							aria-label={i18n.t.testimonials.prevAria}
							disabled={atStart}
							onclick={() => scrollByCard(-1)}
							class="w-11 h-11 rounded-full glass-panel border border-border-glass flex items-center justify-center text-on-surface hover:bg-on-surface/10 active:scale-90 transition-all duration-200 focus-visible:outline-2 focus-visible:outline-electric-blue disabled:opacity-30 disabled:pointer-events-none"
						>
							<Icon name="chevron_left" />
						</button>
						<button
							data-testid="carousel-next"
							type="button"
							aria-label={i18n.t.testimonials.nextAria}
							disabled={atEnd}
							onclick={() => scrollByCard(1)}
							class="w-11 h-11 rounded-full glass-panel border border-border-glass flex items-center justify-center text-on-surface hover:bg-on-surface/10 active:scale-90 transition-all duration-200 focus-visible:outline-2 focus-visible:outline-electric-blue disabled:opacity-30 disabled:pointer-events-none"
						>
							<Icon name="chevron_right" />
						</button>
					</div>
				{/if}
			</div>
		{/if}

		<!-- See all reviews → Google My Business profile -->
		<div class="text-center mt-12">
			<a
				data-testid="see-all-reviews"
				href={GMB_PROFILE_URL}
				target="_blank"
				rel="noopener noreferrer"
				class="inline-flex items-center gap-2 glass-panel text-on-surface px-8 py-3 rounded-full font-label-lg hover:bg-on-surface/10 hover:-translate-y-0.5 transition-all active:scale-95 duration-200"
			>
				<svg class="w-4 h-4" viewBox="0 0 24 24" aria-hidden="true">
					<path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.27-4.74 3.27-8.1Z"/>
					<path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.99.66-2.26 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84A11 11 0 0 0 12 23Z"/>
					<path fill="#FBBC05" d="M5.84 14.1a6.6 6.6 0 0 1 0-4.2V7.06H2.18a11 11 0 0 0 0 9.88l3.66-2.84Z"/>
					<path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1A11 11 0 0 0 2.18 7.06l3.66 2.84C6.71 7.3 9.14 5.38 12 5.38Z"/>
				</svg>
				{i18n.t.testimonials.seeAll}
				<Icon name="arrow_outward" size="20" />
			</a>
		</div>
	</div>
</section>
