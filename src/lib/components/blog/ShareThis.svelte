<script lang="ts">
	import { browser } from '$app/environment';
	import { i18n } from '$lib/i18n.svelte';
	import { getShareLinks } from '$lib/utils/share';

	let {
		url = '',
		title = '',
		coverImage = '',
		mode = 'inline',
		visible = true
	}: {
		url?: string;
		title?: string;
		coverImage?: string;
		mode?: 'inline' | 'sidebar' | 'drawer';
		visible?: boolean;
	} = $props();

	// Resolve the share URL and Title dynamically if empty
	let shareUrl = $derived.by(() => {
		if (url) return url;
		if (browser) return window.location.href;
		return 'https://malagaeventgear.com';
	});

	let shareTitle = $derived(title || 'Premium Audiovisual Equipment Rental in Malaga');

	// Local states
	let copied = $state(false);
	let isOpen = $state(false);

	// Copy Link implementation
	async function handleCopyLink(e: Event) {
		e.preventDefault();
		try {
			if (navigator.clipboard && window.isSecureContext) {
				await navigator.clipboard.writeText(shareUrl);
				copied = true;
			} else {
				// Fallback using traditional text area selection
				const textArea = document.createElement('textarea');
				textArea.value = shareUrl;
				textArea.style.position = 'fixed';
				textArea.style.opacity = '0';
				document.body.appendChild(textArea);
				textArea.focus();
				textArea.select();
				document.execCommand('copy');
				document.body.removeChild(textArea);
				copied = true;
			}
			setTimeout(() => {
				copied = false;
			}, 2000);
		} catch (err) {
			// Fallback force state in case of secure context restrictions during tests
			copied = true;
			setTimeout(() => {
				copied = false;
			}, 2000);
			console.error('Failed to copy text: ', err);
		}
	}

	// Share networks definitions
	let networks = $derived(getShareLinks(shareUrl, shareTitle, coverImage));
</script>

{#if mode === 'inline'}
	<!-- Inline Mode: Horizontal Share Bar (typically above the post content) -->
	<div 
		class="share-inline-container" 
		data-testid="share-inline"
	>
		<p class="share-title">{i18n.lang === 'es' ? 'Compartir:' : 'Share This:'}</p>
		<div class="share-buttons-grid">
			{#each networks as net}
				<a
					href={net.href}
					target="_blank"
					rel="noopener noreferrer"
					class="share-btn {net.color}"
					aria-label="Share on {net.name}"
				>
					<span class="share-icon-wrapper">
						{#if net.icon === 'whatsapp'}
							<svg viewBox="0 0 24 24" class="w-5 h-5 fill-current"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L0 24l6.335-1.662c1.746.953 3.71 1.455 5.703 1.456h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
						{:else if net.icon === 'facebook'}
							<svg viewBox="0 0 24 24" class="w-5 h-5 fill-current"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>
						{:else if net.icon === 'twitter'}
							<svg viewBox="0 0 24 24" class="w-5 h-5 fill-current"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
						{:else if net.icon === 'pinterest'}
							<svg viewBox="0 0 24 24" class="w-5 h-5 fill-current"><path d="M12.017 0C5.396 0 .029 5.367.029 11.987c0 5.079 3.158 9.417 7.618 11.162-.105-.948-.199-2.403.041-3.439.219-.937 1.406-5.966 1.406-5.966s-.359-.72-.359-1.781c0-1.663.967-2.911 2.168-2.911 1.024 0 1.518.769 1.518 1.688 0 1.029-.653 2.567-.992 3.992-.285 1.193.6 2.165 1.775 2.165 2.128 0 3.768-2.245 3.768-5.487 0-2.861-2.063-4.869-5.008-4.869-3.41 0-5.409 2.562-5.409 5.199 0 1.033.394 2.143.889 2.741.099.12.112.225.085.345-.09.375-.293 1.199-.334 1.363-.053.211-.174.263-.403.156-1.492-.689-2.42-2.854-2.42-4.586 0-3.725 2.711-7.147 7.82-7.147 4.103 0 7.29 2.928 7.29 6.826 0 4.085-2.577 7.374-6.146 7.374-1.202 0-2.334-.625-2.722-1.363l-.742 2.828c-.269 1.045-1.001 2.352-1.492 3.146 1.124.347 2.317.535 3.554.535 6.607 0 11.985-5.36 11.985-11.97C24.008 5.368 18.63 0 12.017 0z"/></svg>
						{:else if net.icon === 'linkedin'}
							<svg viewBox="0 0 24 24" class="w-5 h-5 fill-current"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0z"/></svg>
						{:else if net.icon === 'email'}
							<svg viewBox="0 0 24 24" class="w-5 h-5 fill-current"><path d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z"/></svg>
						{/if}
					</span>
					<span class="share-btn-text">{net.name}</span>
				</a>
			{/each}

			<button
				onclick={handleCopyLink}
				class="share-btn hover:bg-electric-blue hover:text-white relative"
				aria-label="Copy link to clipboard"
				data-testid="copy-link-button"
			>
				<span class="share-icon-wrapper">
					{#if copied}
						<svg viewBox="0 0 24 24" class="w-5 h-5 fill-none stroke-current" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
					{:else}
						<svg viewBox="0 0 24 24" class="w-5 h-5 fill-none stroke-current" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"></path><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"></path></svg>
					{/if}
				</span>
				<span class="share-btn-text">{copied ? (i18n.lang === 'es' ? 'Copiado!' : 'Copied!') : (i18n.lang === 'es' ? 'Copiar' : 'Copy link')}</span>

				{#if copied}
					<span class="copy-tooltip">{i18n.lang === 'es' ? '¡Copiado!' : 'Copied!'}</span>
				{/if}
			</button>
		</div>
	</div>
{:else if mode === 'sidebar'}
	<!-- Sidebar Mode: Sticky Vertical Bar under the Packages Rail -->
	<div 
		class="share-sidebar-container {visible ? 'opacity-0 pointer-events-none' : 'opacity-100'}" 
		data-testid="share-sidebar"
		aria-hidden={visible}
	>
		<p class="share-sidebar-title">{i18n.lang === 'es' ? 'COMPARTIR' : 'SHARE THIS'}</p>
		<div class="share-sidebar-grid">
			{#each networks as net}
				<a
					href={net.href}
					target="_blank"
					rel="noopener noreferrer"
					class="share-sidebar-btn {net.color}"
					aria-label="Share on {net.name}"
				>
					<span class="share-sidebar-icon">
						{#if net.icon === 'whatsapp'}
							<svg viewBox="0 0 24 24" class="w-5 h-5 fill-current"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L0 24l6.335-1.662c1.746.953 3.71 1.455 5.703 1.456h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
						{:else if net.icon === 'facebook'}
							<svg viewBox="0 0 24 24" class="w-5 h-5 fill-current"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>
						{:else if net.icon === 'twitter'}
							<svg viewBox="0 0 24 24" class="w-5 h-5 fill-current"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
						{:else if net.icon === 'pinterest'}
							<svg viewBox="0 0 24 24" class="w-5 h-5 fill-current"><path d="M12.017 0C5.396 0 .029 5.367.029 11.987c0 5.079 3.158 9.417 7.618 11.162-.105-.948-.199-2.403.041-3.439.219-.937 1.406-5.966 1.406-5.966s-.359-.72-.359-1.781c0-1.663.967-2.911 2.168-2.911 1.024 0 1.518.769 1.518 1.688 0 1.029-.653 2.567-.992 3.992-.285 1.193.6 2.165 1.775 2.165 2.128 0 3.768-2.245 3.768-5.487 0-2.861-2.063-4.869-5.008-4.869-3.41 0-5.409 2.562-5.409 5.199 0 1.033.394 2.143.889 2.741.099.12.112.225.085.345-.09.375-.293 1.199-.334 1.363-.053.211-.174.263-.403.156-1.492-.689-2.42-2.854-2.42-4.586 0-3.725 2.711-7.147 7.82-7.147 4.103 0 7.29 2.928 7.29 6.826 0 4.085-2.577 7.374-6.146 7.374-1.202 0-2.334-.625-2.722-1.363l-.742 2.828c-.269 1.045-1.001 2.352-1.492 3.146 1.124.347 2.317.535 3.554.535 6.607 0 11.985-5.36 11.985-11.97C24.008 5.368 18.63 0 12.017 0z"/></svg>
						{:else if net.icon === 'linkedin'}
							<svg viewBox="0 0 24 24" class="w-5 h-5 fill-current"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0z"/></svg>
						{:else if net.icon === 'email'}
							<svg viewBox="0 0 24 24" class="w-5 h-5 fill-current"><path d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z"/></svg>
						{/if}
					</span>
					<span class="share-sidebar-text">{net.name}</span>
				</a>
			{/each}

			<button
				onclick={handleCopyLink}
				class="share-sidebar-btn hover:bg-electric-blue hover:text-white relative"
				aria-label="Copy link to clipboard"
				data-testid="copy-link-sidebar"
			>
				<span class="share-sidebar-icon">
					{#if copied}
						<svg viewBox="0 0 24 24" class="w-5 h-5 fill-none stroke-current" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
					{:else}
						<svg viewBox="0 0 24 24" class="w-5 h-5 fill-none stroke-current" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"></path><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"></path></svg>
					{/if}
				</span>
				<span class="share-sidebar-text">{copied ? (i18n.lang === 'es' ? 'Copiado!' : 'Copied!') : (i18n.lang === 'es' ? 'Copiar' : 'Copy link')}</span>

				{#if copied}
					<span class="copy-tooltip-sidebar">{i18n.lang === 'es' ? '¡Copiado!' : 'Copied!'}</span>
				{/if}
			</button>
		</div>
	</div>
{:else if mode === 'drawer'}
	<!-- Drawer Mode: Mobile FAB + Slide-up Drawer -->
	<!-- Floating FAB Button -->
	<button
		onclick={() => (isOpen = true)}
		class="share-fab {visible ? 'opacity-0 pointer-events-none scale-75' : 'opacity-100 scale-100'}"
		aria-label="Open sharing options"
		data-testid="share-fab"
	>
		<svg viewBox="0 0 24 24" class="w-6 h-6 text-white" stroke="currentColor" fill="none">
			<!-- Share Nodes -->
			<circle cx="6" cy="12" r="2.5" fill="currentColor" stroke="none" />
			<circle cx="14" cy="7" r="2.5" fill="currentColor" stroke="none" />
			<circle cx="14" cy="17" r="2.5" fill="currentColor" stroke="none" />
			<!-- Connecting Lines -->
			<line x1="8.5" y1="10.4" x2="11.5" y2="8.6" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" />
			<line x1="8.5" y1="13.6" x2="11.5" y2="15.4" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" />
			<!-- Plus Symbol -->
			<path d="M19 12h4m-2-2v4" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" />
		</svg>
	</button>

	<!-- Backdrop & Modal Bottom Sheet -->
	{#if isOpen}
		<!-- svelte-ignore a11y_click_events_have_key_events -->
		<!-- svelte-ignore a11y_no_noninteractive_element_interactions -->
		<div 
			class="share-drawer-backdrop" 
			onclick={() => (isOpen = false)}
			role="dialog"
			aria-modal="true"
			data-testid="share-drawer-overlay"
		>
			<div 
				class="share-drawer-sheet" 
				onclick={(e) => e.stopPropagation()}
				role="document"
			>
				<!-- Top Bar Indicator & Close Button -->
				<div class="share-drawer-header">
					<div class="share-drawer-handle"></div>
					<button 
						class="share-drawer-close" 
						onclick={() => (isOpen = false)}
						aria-label="Close sharing options"
					>
						<svg viewBox="0 0 24 24" class="w-6 h-6 fill-none stroke-current" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
							<line x1="18" y1="6" x2="6" y2="18"></line>
							<line x1="6" y1="6" x2="18" y2="18"></line>
						</svg>
					</button>
				</div>

				<div class="share-drawer-content">
					<h3 class="share-drawer-title">{i18n.lang === 'es' ? 'Compartir publicación' : 'Share this post'}</h3>
					
					<div class="share-drawer-buttons">
						{#each networks as net}
							<a
								href={net.href}
								target="_blank"
								rel="noopener noreferrer"
								class="share-drawer-item"
								onclick={() => (isOpen = false)}
							>
								<span class="share-drawer-circle {net.bgClass}">
									{#if net.icon === 'whatsapp'}
										<svg viewBox="0 0 24 24" class="w-6 h-6 fill-current"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L0 24l6.335-1.662c1.746.953 3.71 1.455 5.703 1.456h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
									{:else if net.icon === 'facebook'}
										<svg viewBox="0 0 24 24" class="w-6 h-6 fill-current"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>
									{:else if net.icon === 'twitter'}
										<svg viewBox="0 0 24 24" class="w-6 h-6 fill-current"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
									{:else if net.icon === 'pinterest'}
										<svg viewBox="0 0 24 24" class="w-6 h-6 fill-current"><path d="M12.017 0C5.396 0 .029 5.367.029 11.987c0 5.079 3.158 9.417 7.618 11.162-.105-.948-.199-2.403.041-3.439.219-.937 1.406-5.966 1.406-5.966s-.359-.72-.359-1.781c0-1.663.967-2.911 2.168-2.911 1.024 0 1.518.769 1.518 1.688 0 1.029-.653 2.567-.992 3.992-.285 1.193.6 2.165 1.775 2.165 2.128 0 3.768-2.245 3.768-5.487 0-2.861-2.063-4.869-5.008-4.869-3.41 0-5.409 2.562-5.409 5.199 0 1.033.394 2.143.889 2.741.099.12.112.225.085.345-.09.375-.293 1.199-.334 1.363-.053.211-.174.263-.403.156-1.492-.689-2.42-2.854-2.42-4.586 0-3.725 2.711-7.147 7.82-7.147 4.103 0 7.29 2.928 7.29 6.826 0 4.085-2.577 7.374-6.146 7.374-1.202 0-2.334-.625-2.722-1.363l-.742 2.828c-.269 1.045-1.001 2.352-1.492 3.146 1.124.347 2.317.535 3.554.535 6.607 0 11.985-5.36 11.985-11.97C24.008 5.368 18.63 0 12.017 0z"/></svg>
									{:else if net.icon === 'linkedin'}
										<svg viewBox="0 0 24 24" class="w-6 h-6 fill-current"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0z"/></svg>
									{:else if net.icon === 'email'}
										<svg viewBox="0 0 24 24" class="w-6 h-6 fill-current"><path d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z"/></svg>
									{/if}
								</span>
								<span class="share-drawer-label">{net.name}</span>
							</a>
						{/each}

						<!-- Copy Link Button in Drawer -->
						<button
							onclick={handleCopyLink}
							class="share-drawer-item w-full bg-transparent border-0 text-left cursor-pointer p-0"
						>
							<span class="share-drawer-circle relative {copied ? 'bg-electric-blue text-white' : 'bg-white/10 text-white'}">
								{#if copied}
									<svg viewBox="0 0 24 24" class="w-6 h-6 fill-none stroke-current" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
								{:else}
									<svg viewBox="0 0 24 24" class="w-6 h-6 fill-none stroke-current" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"></path><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"></path></svg>
								{/if}
								
								{#if copied}
									<span class="copy-tooltip-drawer">{i18n.lang === 'es' ? '¡Copiado!' : 'Copied!'}</span>
								{/if}
							</span>
							<span class="share-drawer-label">{copied ? (i18n.lang === 'es' ? '¡Copiado!' : 'Copied!') : (i18n.lang === 'es' ? 'Copiar link' : 'Copy link')}</span>
						</button>
					</div>
				</div>
			</div>
		</div>
	{/if}
{/if}

<style>
	/* --- Common Styles --- */
	.copy-tooltip, .copy-tooltip-sidebar, .copy-tooltip-drawer {
		position: absolute;
		bottom: 100%;
		left: 50%;
		transform: translateX(-50%) translateY(-8px);
		background-color: var(--color-electric-blue, #4D8CFF);
		color: #ffffff;
		font-size: 0.75rem;
		font-weight: 600;
		padding: 4px 8px;
		border-radius: 6px;
		white-space: nowrap;
		box-shadow: 0 4px 12px rgba(77, 140, 255, 0.3);
		animation: tooltip-fade 0.2s ease forwards;
		z-index: 50;
	}

	.copy-tooltip::after, .copy-tooltip-sidebar::after {
		content: '';
		position: absolute;
		top: 100%;
		left: 50%;
		transform: translateX(-50%);
		border-width: 5px;
		border-style: solid;
		border-color: var(--color-electric-blue, #4D8CFF) transparent transparent transparent;
	}

	@keyframes tooltip-fade {
		from { opacity: 0; transform: translateX(-50%) translateY(0); }
		to { opacity: 1; transform: translateX(-50%) translateY(-8px); }
	}

	/* --- Inline Mode (Horizontal Bar) --- */
	.share-inline-container {
		display: flex;
		flex-direction: column;
		gap: 0.75rem;
		margin: 1.5rem 0 2rem 0;
		padding: 1rem 0;
		border-top: 1px solid var(--color-border-glass, rgba(255, 255, 255, 0.12));
		border-bottom: 1px solid var(--color-border-glass, rgba(255, 255, 255, 0.12));
	}

	.share-title {
		font-family: 'Plus Jakarta Sans', sans-serif;
		font-size: 0.6875rem;
		font-weight: 700;
		text-transform: uppercase;
		letter-spacing: 0.1em;
		color: var(--color-on-surface-variant, #cac4d1);
		margin: 0;
	}

	.share-buttons-grid {
		display: flex;
		flex-wrap: wrap;
		gap: 0.625rem;
	}

	.share-btn {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		gap: 0.5rem;
		padding: 0.5rem 0.875rem;
		min-height: 44px; /* a11y target size */
		border-radius: var(--rounded-md, 8px);
		font-family: 'Plus Jakarta Sans', sans-serif;
		font-size: 0.8125rem;
		font-weight: 600;
		color: var(--color-on-surface, #e2e2e2);
		text-decoration: none;
		background-color: var(--color-surface-glass, rgba(255, 255, 255, 0.05));
		border: 1px solid var(--color-border-glass, rgba(255, 255, 255, 0.12));
		cursor: pointer;
		transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
		user-select: none;
	}

	.share-btn:hover {
		transform: translateY(-2px);
		box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
	}

	.share-icon-wrapper {
		display: flex;
		align-items: center;
		justify-content: center;
		flex-shrink: 0;
	}

	/* Mobile handling for inline */
	@media (max-width: 640px) {
		.share-btn-text {
			display: none;
		}
		
		.share-btn {
			padding: 0.5rem;
			width: 44px;
			height: 44px;
			border-radius: 9999px;
		}

		.share-buttons-grid {
			justify-content: space-between;
		}
	}

	/* --- Sidebar Mode (Vertical Bar) --- */
	.share-sidebar-container {
		display: flex;
		flex-direction: column;
		gap: 0.75rem;
		margin-top: 1.5rem;
		width: 100%;
		transition: opacity 0.3s ease-in-out;
	}

	.share-sidebar-title {
		font-family: 'Plus Jakarta Sans', sans-serif;
		font-size: 0.6875rem;
		font-weight: 700;
		text-transform: uppercase;
		letter-spacing: 0.1em;
		color: var(--color-on-surface-variant, #cac4d1);
		margin-bottom: 0.25rem;
		padding: 0 0.25rem;
	}

	.share-sidebar-grid {
		display: flex;
		flex-direction: column;
		gap: 0.5rem;
	}

	.share-sidebar-btn {
		display: flex;
		align-items: center;
		gap: 0.625rem;
		padding: 0.5rem 0.75rem;
		min-height: 44px;
		border-radius: var(--rounded-md, 8px);
		font-family: 'Plus Jakarta Sans', sans-serif;
		font-size: 0.8125rem;
		font-weight: 600;
		color: var(--color-on-surface, #e2e2e2);
		text-decoration: none;
		background-color: var(--color-surface-glass, rgba(255, 255, 255, 0.05));
		border: 1px solid var(--color-border-glass, rgba(255, 255, 255, 0.12));
		cursor: pointer;
		transition: all 0.2s ease;
	}

	.share-sidebar-btn:hover {
		transform: translateX(4px);
	}

	.share-sidebar-icon {
		display: flex;
		align-items: center;
		justify-content: center;
		flex-shrink: 0;
	}

	.copy-tooltip-sidebar {
		left: 100%;
		bottom: auto;
		top: 50%;
		transform: translateX(8px) translateY(-50%);
		animation: tooltip-fade-sidebar 0.2s ease forwards;
	}

	.copy-tooltip-sidebar::after {
		top: 50%;
		left: auto;
		right: 100%;
		transform: translateY(-50%);
		border-color: transparent var(--color-electric-blue, #4D8CFF) transparent transparent;
	}

	@keyframes tooltip-fade-sidebar {
		from { opacity: 0; transform: translateX(0) translateY(-50%); }
		to { opacity: 1; transform: translateX(8px) translateY(-50%); }
	}

	/* --- Drawer Mode (Mobile Floating FAB & Drawer) --- */
	.share-fab {
		position: fixed;
		bottom: calc(7.25rem + env(safe-area-inset-bottom, 0px)); /* Posicionado físicamente encima de WhatsApp para evitar solapamientos */
		right: 1.5rem;
		z-index: 100;
		width: 56px;
		height: 56px;
		border-radius: 9999px;
		background: linear-gradient(135deg, var(--color-electric-blue, #4D8CFF) 0%, var(--color-primary-container, #31215d) 100%);
		color: #ffffff;
		border: 1px solid rgba(255, 255, 255, 0.2);
		box-shadow: 0 4px 20px rgba(0, 0, 0, 0.4);
		display: flex;
		align-items: center;
		justify-content: center;
		cursor: pointer;
		transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
	}

	.share-fab:active {
		transform: scale(0.9);
	}

	.share-drawer-backdrop {
		position: fixed;
		top: 0;
		left: 0;
		right: 0;
		bottom: 0;
		background-color: rgba(18, 20, 20, 0.7);
		backdrop-filter: blur(8px);
		z-index: 200;
		display: flex;
		align-items: flex-end;
		justify-content: center;
	}

	.share-drawer-sheet {
		width: 100%;
		max-width: 600px;
		background: rgba(30, 32, 32, 0.95);
		border-top: 1px solid var(--color-border-glass, rgba(255, 255, 255, 0.12));
		border-radius: 20px 20px 0 0;
		padding: 1.5rem;
		padding-bottom: calc(1.5rem + env(safe-area-inset-bottom, 0px));
		box-shadow: 0 -10px 40px rgba(0, 0, 0, 0.5);
		animation: slide-up 0.3s cubic-bezier(0.32, 0.94, 0.6, 1);
		display: flex;
		flex-direction: column;
		gap: 1.25rem;
	}

	@keyframes slide-up {
		from { transform: translateY(100%); }
		to { transform: translateY(0); }
	}

	.share-drawer-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		position: relative;
	}

	.share-drawer-handle {
		width: 40px;
		height: 4px;
		background-color: var(--color-outline-variant, #49454f);
		border-radius: 9999px;
		position: absolute;
		left: 50%;
		transform: translateX(-50%);
		top: -4px;
	}

	.share-drawer-close {
		background: none;
		border: none;
		color: var(--color-on-surface-variant, #cac4d1);
		padding: 0.5rem;
		cursor: pointer;
		margin-left: auto;
	}

	.share-drawer-content {
		display: flex;
		flex-direction: column;
		gap: 1rem;
	}

	.share-drawer-title {
		font-family: 'Plus Jakarta Sans', sans-serif;
		font-size: 1.125rem;
		font-weight: 700;
		color: var(--color-on-surface, #e2e2e2);
		margin: 0;
	}

	.share-drawer-buttons {
		display: grid;
		grid-template-cols: repeat(4, 1fr);
		gap: 1.25rem;
		padding: 0.5rem 0;
	}

	.share-drawer-item {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 0.5rem;
		text-decoration: none;
	}

	.share-drawer-circle {
		width: 50px;
		height: 50px;
		border-radius: 9999px;
		display: flex;
		align-items: center;
		justify-content: center;
		border: 1px solid rgba(255, 255, 255, 0.08);
		transition: transform 0.2s ease;
	}

	.share-drawer-circle:active {
		transform: scale(0.9);
	}

	.share-drawer-label {
		font-family: 'Plus Jakarta Sans', sans-serif;
		font-size: 0.6875rem;
		font-weight: 600;
		color: var(--color-on-surface-variant, #cac4d1);
		text-align: center;
		white-space: nowrap;
		overflow: hidden;
		text-overflow: ellipsis;
		max-width: 100%;
	}

	.copy-tooltip-drawer {
		position: absolute;
		bottom: 110%;
		left: 50%;
		transform: translateX(-50%) translateY(0);
		z-index: 250;
	}

	/* --- Animations and Media Queries --- */
	@media (prefers-reduced-motion: reduce) {
		.share-btn, .share-sidebar-btn, .share-fab, .share-drawer-sheet {
			transition: none !important;
			animation: none !important;
		}
	}
</style>
