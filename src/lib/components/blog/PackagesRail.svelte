<script lang="ts">
	import { packages } from '$lib/data/packages';
</script>

<!--
  PackagesRail — shows event packages.
  Desktop (lg+): vertical sticky list in col1.
  Mobile: horizontal scroll-snap strip (lg:hidden, rendered after header in BlogPost).

  Responsive: same component, different layout via CSS classes.
  Wrap in outer div with appropriate class based on context.
-->

<nav aria-label="Event packages" class="packages-rail" data-testid="packages-rail">
	<p class="packages-rail-title">Our Packages</p>
	<ul class="packages-rail-list">
		{#each packages as pkg (pkg.slug)}
			<li class="packages-rail-item">
				<a href={pkg.route} class="packages-rail-card" data-testid="package-card">
					{#if pkg.image}
						<div class="packages-rail-img-wrap">
							<img
								src={pkg.image}
								alt={pkg.name}
								width="64"
								height="64"
								loading="lazy"
								decoding="async"
								class="packages-rail-img"
							/>
						</div>
					{/if}
					<div class="packages-rail-info">
						<span class="packages-rail-name">{pkg.name}</span>
						<span class="packages-rail-price">from €{pkg.price}</span>
					</div>
				</a>
			</li>
		{/each}
	</ul>
</nav>

<style>
	.packages-rail {
		width: 100%;
	}

	.packages-rail-title {
		font-size: 0.6875rem;
		font-weight: 700;
		letter-spacing: 0.1em;
		text-transform: uppercase;
		color: var(--color-on-surface-variant, #94a3b8);
		margin-bottom: 0.75rem;
		padding: 0 0.25rem;
	}

	.packages-rail-list {
		list-style: none;
		padding: 0;
		margin: 0;
		display: flex;
		flex-direction: column;
		gap: 0.5rem;
	}

	.packages-rail-item {
		width: 100%;
	}

	.packages-rail-card {
		display: flex;
		align-items: center;
		gap: 0.625rem;
		padding: 0.5rem 0.625rem;
		border-radius: 10px;
		border: 1px solid var(--color-border-glass, rgba(255, 255, 255, 0.1));
		background: var(--color-surface-container-low, rgba(255, 255, 255, 0.04));
		text-decoration: none;
		transition:
			border-color 0.2s ease,
			background-color 0.2s ease;
	}

	.packages-rail-card:hover {
		border-color: rgba(59, 130, 246, 0.4);
		background: rgba(59, 130, 246, 0.06);
	}

	.packages-rail-img-wrap {
		flex-shrink: 0;
		width: 40px;
		height: 40px;
		border-radius: 6px;
		overflow: hidden;
		background: rgba(255, 255, 255, 0.06);
	}

	.packages-rail-img {
		width: 100%;
		height: 100%;
		object-fit: cover;
	}

	.packages-rail-info {
		display: flex;
		flex-direction: column;
		gap: 0.125rem;
		min-width: 0;
	}

	.packages-rail-name {
		font-size: 0.8125rem;
		font-weight: 600;
		color: var(--color-on-surface, #f1f5f9);
		white-space: nowrap;
		overflow: hidden;
		text-overflow: ellipsis;
	}

	.packages-rail-price {
		font-size: 0.75rem;
		color: var(--color-electric-blue, #3b82f6);
		font-weight: 500;
	}

	/* Mobile horizontal scroll-snap layout (applied via parent .packages-rail-mobile) */
	:global(.packages-rail-mobile) .packages-rail {
		overflow: hidden;
	}

	:global(.packages-rail-mobile) .packages-rail-list {
		flex-direction: row;
		overflow-x: auto;
		scroll-snap-type: x mandatory;
		scroll-behavior: smooth;
		-webkit-overflow-scrolling: touch;
		scrollbar-width: none;
		padding-bottom: 0.25rem;
	}

	:global(.packages-rail-mobile) .packages-rail-list::-webkit-scrollbar {
		display: none;
	}

	:global(.packages-rail-mobile) .packages-rail-item {
		flex-shrink: 0;
		scroll-snap-align: start;
		width: 160px;
	}

	:global(.packages-rail-mobile) .packages-rail-card {
		flex-direction: column;
		align-items: center;
		text-align: center;
		height: 100%;
		gap: 0.5rem;
	}

	:global(.packages-rail-mobile) .packages-rail-img-wrap {
		width: 48px;
		height: 48px;
	}

	:global(.packages-rail-mobile) .packages-rail-name {
		white-space: normal;
		text-align: center;
		font-size: 0.75rem;
	}

	@media (prefers-reduced-motion: reduce) {
		.packages-rail-card {
			transition: none;
		}
	}
</style>
