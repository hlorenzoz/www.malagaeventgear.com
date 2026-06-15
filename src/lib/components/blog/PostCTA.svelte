<script lang="ts">
	import type { EventPackage } from '$lib/data/packages';

	let {
		pkg
	}: {
		pkg: EventPackage;
	} = $props();

	// English-only headlines per package type
	const headlineMap: Record<string, string> = {
		wedding: 'Planning a wedding in Malaga?',
		'basic-mice': 'Organising a corporate event?',
		mice: 'Need premium MICE AV support?',
		'product-presentation': 'Launching a product or presentation?',
		eco: 'Planning a private event?'
	};

	const sublineMap: Record<string, string> = {
		wedding: 'Get the Wedding Pack: professional sound and romantic lighting for your special day.',
		'basic-mice': 'Get the Basic MICE Pack: clear AV for executive meetings and conferences.',
		mice: 'Get the MICE Pack: premium LED display, sound, and a live technician.',
		'product-presentation':
			'Get the Product Presentation Pack: laser projection and audio for high-impact showcases.',
		eco: 'Get the Eco Pack: solid sound and ambient lighting for up to 50 guests.'
	};

	let headline = $derived(headlineMap[pkg.slug] ?? headlineMap['eco']);
	let subline = $derived(sublineMap[pkg.slug] ?? sublineMap['eco']);
</script>

<aside
	class="post-cta"
	data-testid="post-cta"
	aria-label="Event package suggestion"
>
	<div class="post-cta-inner">
		<!-- Package image -->
		{#if pkg.image}
			<div class="post-cta-img-wrap">
				<!-- Thumbnail dedicado (160x160 ≈5–8 KiB) en vez del <slug>.webp completo (800x800) -->
				<img
					src={pkg.image.replace('.webp', '-thumb.webp')}
					alt={pkg.name}
					width="80"
					height="80"
					loading="lazy"
					decoding="async"
					class="post-cta-img"
				/>
			</div>
		{/if}

		<!-- Copy -->
		<div class="post-cta-body">
			<p class="post-cta-headline">{headline}</p>
			<p class="post-cta-subline">{subline}</p>
			<p class="post-cta-price">From <strong>€{pkg.price}</strong> <span>(+21% VAT)</span></p>

			<!-- CTAs -->
			<div class="post-cta-actions">
				<a
					href={pkg.route}
					class="post-cta-btn-primary"
					data-testid="post-cta-primary"
				>
					View the {pkg.name} →
				</a>
				<a
					href="/contact/"
					class="post-cta-btn-secondary"
					data-testid="post-cta-secondary"
				>
					Get a free quote
				</a>
			</div>
		</div>
	</div>
</aside>

<style>
	.post-cta {
		margin: 2.5rem 0;
		border-radius: 16px;
		border: 1px solid rgba(59, 130, 246, 0.3);
		background: linear-gradient(
			135deg,
			rgba(59, 130, 246, 0.08) 0%,
			rgba(139, 92, 246, 0.06) 100%
		);
		backdrop-filter: blur(12px);
		overflow: hidden;
	}

	.post-cta-inner {
		display: flex;
		align-items: flex-start;
		gap: 1.25rem;
		padding: 1.5rem;
	}

	.post-cta-img-wrap {
		flex-shrink: 0;
		width: 80px;
		height: 80px;
		border-radius: 10px;
		overflow: hidden;
		background: rgba(255, 255, 255, 0.06);
	}

	.post-cta-img {
		width: 100%;
		height: 100%;
		object-fit: cover;
	}

	.post-cta-body {
		flex: 1;
		min-width: 0;
	}

	.post-cta-headline {
		font-size: 1.125rem;
		font-weight: 700;
		color: var(--color-on-surface, #f1f5f9);
		margin-bottom: 0.375rem;
		line-height: 1.3;
	}

	.post-cta-subline {
		font-size: 0.9rem;
		color: var(--color-on-surface-variant, #94a3b8);
		margin-bottom: 0.5rem;
		line-height: 1.5;
	}

	.post-cta-price {
		font-size: 0.875rem;
		color: var(--color-on-surface-variant, #94a3b8);
		margin-bottom: 1rem;
	}

	.post-cta-price strong {
		color: var(--color-electric-blue, #3b82f6);
		font-weight: 700;
	}

	.post-cta-price span {
		font-size: 0.75rem;
		opacity: 0.7;
	}

	.post-cta-actions {
		display: flex;
		flex-wrap: wrap;
		gap: 0.75rem;
	}

	.post-cta-btn-primary {
		display: inline-flex;
		align-items: center;
		padding: 0.625rem 1.25rem;
		border-radius: 8px;
		background: var(--color-electric-blue, #3b82f6);
		color: #fff;
		font-size: 0.875rem;
		font-weight: 600;
		text-decoration: none;
		transition:
			background-color 0.2s ease,
			transform 0.15s ease;
	}

	.post-cta-btn-primary:hover {
		background: #2563eb;
		transform: translateY(-1px);
	}

	.post-cta-btn-primary:active {
		transform: scale(0.97);
	}

	.post-cta-btn-secondary {
		display: inline-flex;
		align-items: center;
		padding: 0.625rem 1.25rem;
		border-radius: 8px;
		border: 1px solid var(--color-border-glass, rgba(255, 255, 255, 0.15));
		background: transparent;
		color: var(--color-on-surface, #f1f5f9);
		font-size: 0.875rem;
		font-weight: 500;
		text-decoration: none;
		transition:
			border-color 0.2s ease,
			background-color 0.2s ease;
	}

	.post-cta-btn-secondary:hover {
		border-color: rgba(59, 130, 246, 0.5);
		background: rgba(59, 130, 246, 0.06);
	}

	@media (max-width: 480px) {
		.post-cta-inner {
			flex-direction: column;
			align-items: center;
			text-align: center;
		}

		.post-cta-actions {
			justify-content: center;
		}
	}

	@media (prefers-reduced-motion: reduce) {
		.post-cta-btn-primary,
		.post-cta-btn-secondary {
			transition: none;
		}
	}
</style>
