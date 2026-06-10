<script lang="ts">
	import type { BlogPost } from '$lib/types/blog';

	let {
		toc = []
	}: {
		toc?: NonNullable<BlogPost['toc']>;
	} = $props();

	// Track the active heading id via IntersectionObserver
	let activeId = $state<string>('');

	$effect(() => {
		if (!toc || toc.length === 0) return;

		const headingIds = toc.map((e) => e.id);
		const observedElements: Element[] = [];

		const observer = new IntersectionObserver(
			(entries) => {
				// Find the topmost visible heading
				const visible = entries
					.filter((e) => e.isIntersecting)
					.sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
				if (visible.length > 0) {
					activeId = (visible[0].target as HTMLElement).id;
				}
			},
			{
				rootMargin: '-80px 0px -60% 0px',
				threshold: 0
			}
		);

		for (const id of headingIds) {
			const el = document.getElementById(id);
			if (el) {
				observer.observe(el);
				observedElements.push(el);
			}
		}

		return () => {
			observer.disconnect();
		};
	});
</script>

{#if toc && toc.length > 0}
	<nav aria-label="Table of contents" class="toc-desktop">
		<p class="toc-desktop-title">In this article</p>
		<ol class="toc-desktop-list">
			{#each toc as entry (entry.id)}
				<li class={entry.level === 3 ? 'toc-desktop-item toc-desktop-item--h3' : 'toc-desktop-item'}>
					<a
						href="#{entry.id}"
						class={[
							'toc-desktop-link',
							activeId === entry.id ? 'toc-desktop-link--active' : ''
						].join(' ').trim()}
						aria-current={activeId === entry.id ? 'true' : undefined}
					>
						{entry.text}
					</a>
				</li>
			{/each}
		</ol>
	</nav>
{/if}

<style>
	.toc-desktop {
		padding: 1rem 0;
	}

	.toc-desktop-title {
		font-size: 0.6875rem;
		font-weight: 700;
		letter-spacing: 0.1em;
		text-transform: uppercase;
		color: var(--color-on-surface-variant, #94a3b8);
		margin-bottom: 0.75rem;
	}

	.toc-desktop-list {
		list-style: none;
		padding: 0;
		margin: 0;
		display: flex;
		flex-direction: column;
		gap: 0.25rem;
	}

	.toc-desktop-item {
		line-height: 1.4;
	}

	.toc-desktop-item--h3 {
		padding-left: 0.875rem;
	}

	.toc-desktop-link {
		display: block;
		font-size: 0.8125rem;
		color: var(--color-on-surface-variant, #94a3b8);
		text-decoration: none;
		padding: 0.25rem 0.5rem;
		border-left: 2px solid transparent;
		border-radius: 0 4px 4px 0;
		transition:
			color 0.15s ease,
			border-color 0.15s ease,
			background-color 0.15s ease;
		line-height: 1.4;
	}

	.toc-desktop-link:hover {
		color: var(--color-on-surface, #f1f5f9);
		background-color: rgba(255, 255, 255, 0.04);
	}

	.toc-desktop-link--active {
		color: var(--color-electric-blue, #3b82f6);
		border-left-color: var(--color-electric-blue, #3b82f6);
		font-weight: 600;
	}

	@media (prefers-reduced-motion: reduce) {
		.toc-desktop-link {
			transition: none;
		}
	}
</style>
