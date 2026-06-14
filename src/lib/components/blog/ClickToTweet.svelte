<script lang="ts">
	import { onMount } from 'svelte';
	import { browser } from '$app/environment';
	import { i18n } from '$lib/i18n.svelte';

	let { url, title }: { url: string; title: string } = $props();

	let show = $state(false);
	let x = $state(0);
	let y = $state(0);
	let selectedText = $state('');

	function handleSelectionChange() {
		if (!browser) return;
		const selection = window.getSelection();
		if (!selection || selection.isCollapsed) {
			show = false;
			return;
		}

		const text = selection.toString().trim();
		// Constraints: length must be between 3 and 200 chars
		if (text.length < 3 || text.length > 200) {
			show = false;
			return;
		}

		// Verify selection is entirely inside a container with class `.prose`
		try {
			const range = selection.getRangeAt(0);
			const commonAncestor = range.commonAncestorContainer;
			const ancestorElement = commonAncestor.nodeType === Node.ELEMENT_NODE
				? (commonAncestor as HTMLElement)
				: commonAncestor.parentElement;

			if (!ancestorElement || !ancestorElement.closest('.prose')) {
				show = false;
				return;
			}

			const rect = range.getBoundingClientRect();
			
			// Position the bubble relative to the page viewport scroll
			x = rect.left + window.scrollX + rect.width / 2;
			y = rect.top + window.scrollY;
			selectedText = text;
			show = true;
		} catch (e) {
			show = false;
		}
	}

	onMount(() => {
		document.addEventListener('selectionchange', handleSelectionChange);
		return () => {
			document.removeEventListener('selectionchange', handleSelectionChange);
		};
	});

	function handleTweet(e: MouseEvent) {
		e.preventDefault();
		// Formulate the tweet URL
		const tweetText = `“${selectedText}”`;
		const shareUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(tweetText)}&url=${encodeURIComponent(url)}`;
		
		window.open(shareUrl, '_blank', 'noopener,noreferrer');
		
		// Clear selection after sharing
		const selection = window.getSelection();
		if (selection) {
			selection.removeAllRanges();
		}
		show = false;
	}

	// Prevent selection from clearing when clicking/mousedown on the tooltip
	function handleMouseDown(e: MouseEvent) {
		e.preventDefault();
	}
</script>

{#if show}
	<!-- svelte-ignore a11y_click_events_have_key_events -->
	<!-- svelte-ignore a11y_no_noninteractive_element_interactions -->
	<div
		class="click-to-tweet-bubble"
		style="left: {x}px; top: {y}px;"
		onmousedown={handleMouseDown}
		role="tooltip"
		data-testid="click-to-tweet-tooltip"
	>
		<button
			onclick={handleTweet}
			class="tweet-share-btn"
			aria-label="Tweet this selection"
			data-testid="click-to-tweet-button"
		>
			<!-- X Logo SVG -->
			<svg viewBox="0 0 24 24" class="w-4 h-4 fill-current">
				<path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
			</svg>
			<span class="btn-text">
				{i18n.lang === 'es' ? 'Twittear' : 'Tweet'}
			</span>
		</button>
	</div>
{/if}

<style>
	.click-to-tweet-bubble {
		position: absolute;
		z-index: 100;
		transform: translate(-50%, -100%) translateY(-12px);
		animation: pop-in 0.2s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards;
		pointer-events: auto;
	}

	.tweet-share-btn {
		display: inline-flex;
		align-items: center;
		gap: 0.5rem;
		padding: 0.5rem 0.875rem;
		height: 38px;
		border-radius: 9999px;
		font-family: 'Plus Jakarta Sans', sans-serif;
		font-size: 0.8125rem;
		font-weight: 600;
		color: #ffffff;
		background: rgba(18, 20, 20, 0.9);
		backdrop-filter: blur(12px);
		-webkit-backdrop-filter: blur(12px);
		border: 1px solid var(--color-border-glass, rgba(255, 255, 255, 0.12));
		box-shadow: 0 10px 30px -12px rgba(0, 0, 0, 0.5);
		cursor: pointer;
		user-select: none;
		transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
	}

	.tweet-share-btn:hover {
		transform: scale(1.05);
		background-color: var(--color-electric-blue, #4D8CFF);
		border-color: rgba(77, 140, 255, 0.4);
		box-shadow: 0 4px 15px rgba(77, 140, 255, 0.3);
	}

	.tweet-share-btn:active {
		transform: scale(0.95);
	}

	@keyframes pop-in {
		from {
			opacity: 0;
			transform: translate(-50%, -100%) translateY(-4px) scale(0.85);
		}
		to {
			opacity: 1;
			transform: translate(-50%, -100%) translateY(-12px) scale(1);
		}
	}

	/* Respect reduced motion */
	@media (prefers-reduced-motion: reduce) {
		.click-to-tweet-bubble {
			animation: none !important;
		}
		.tweet-share-btn {
			transition: none !important;
		}
	}
</style>
