<script lang="ts">
	import { i18n } from '$lib/i18n.svelte';
	import type { Testimonial } from '$lib/data/testimonials';

	let { testimonial }: { testimonial: Testimonial } = $props();

	let expanded = $state(false);

	// Prefer a manual translation that matches the current UI language; otherwise
	// always fall back to the review's original-language body.
	let body = $derived(testimonial.translation?.[i18n.lang] ?? testimonial.text);

	// Only long reviews get a Read more / Read less toggle.
	const CLAMP_THRESHOLD = 160;
	let isLong = $derived(body.length > CLAMP_THRESHOLD);

	// Deterministic accent colour for the initial-avatar fallback.
	const avatarPalette = [
		'bg-electric-blue/20 text-electric-blue',
		'bg-primary/20 text-primary',
		'bg-secondary/20 text-secondary'
	];
	let initial = $derived(testimonial.author.trim().charAt(0).toUpperCase());
	let avatarClass = $derived(
		avatarPalette[testimonial.author.charCodeAt(0) % avatarPalette.length]
	);

	let ratingLabel = $derived(`${testimonial.rating} ${i18n.lang === 'es' ? 'de 5 estrellas' : 'out of 5 stars'}`);
</script>

<article
	data-testid="testimonial-card"
	data-expanded={expanded}
	class="glass-card rounded-2xl p-6 flex flex-col h-full snap-start shrink-0 w-[300px] sm:w-[360px] ambient-shadow"
>
	<header class="flex items-center justify-between mb-4">
		<div class="flex items-center gap-3">
			{#if testimonial.avatarUrl}
				<img
					src={testimonial.avatarUrl}
					alt={testimonial.author}
					width="44"
					height="44"
					loading="lazy"
					class="w-11 h-11 rounded-full object-cover"
				/>
			{:else}
				<div class="w-11 h-11 rounded-full flex items-center justify-center font-bold {avatarClass}">
					{initial}
				</div>
			{/if}
			<div>
				<p class="font-headline-sm text-[16px] text-on-surface leading-tight">{testimonial.author}</p>
				<p class="font-body-sm text-xs text-on-surface-variant">{testimonial.relativeTime}</p>
			</div>
		</div>
		<!-- Google glyph -->
		<svg class="w-5 h-5 shrink-0" viewBox="0 0 24 24" aria-hidden="true">
			<path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.27-4.74 3.27-8.1Z"/>
			<path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.99.66-2.26 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84A11 11 0 0 0 12 23Z"/>
			<path fill="#FBBC05" d="M5.84 14.1a6.6 6.6 0 0 1 0-4.2V7.06H2.18a11 11 0 0 0 0 9.88l3.66-2.84Z"/>
			<path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1A11 11 0 0 0 2.18 7.06l3.66 2.84C6.71 7.3 9.14 5.38 12 5.38Z"/>
		</svg>
	</header>

	<div
		data-testid="rating-stars"
		role="img"
		aria-label={ratingLabel}
		class="flex items-center gap-0.5 mb-3 text-[#fbbf24]"
	>
		{#each Array(5) as _, i (i)}
			<span class="material-symbols-outlined text-[18px]" style="font-variation-settings: 'FILL' 1;">
				{i < testimonial.rating ? 'star' : 'star_border'}
			</span>
		{/each}
	</div>

	<p
		class="font-body-md text-sm text-on-surface-variant flex-1 {!expanded && isLong ? 'line-clamp-4' : ''}"
		lang={testimonial.lang}
	>
		{body}
	</p>

	{#if isLong}
		<button
			data-testid="read-more"
			type="button"
			onclick={() => (expanded = !expanded)}
			class="self-start mt-3 font-label-sm text-electric-blue hover:underline focus-visible:outline-2 focus-visible:outline-electric-blue rounded"
		>
			{expanded ? i18n.t.testimonials.readLess : i18n.t.testimonials.readMore}
		</button>
	{/if}
</article>
