<script lang="ts">
	import { i18n } from '$lib/i18n.svelte';

	// Svelte 5 runes are fully active. Localization handles both English and Spanish contexts.
	let tooltipText = $derived(
		i18n.lang === 'en' ? 'Chat with us' : 'Chateá con nosotros'
	);
</script>

<!-- WhatsApp Floating Action Widget -->
<a
	href="https://wa.me/34600428750"
	target="_blank"
	rel="noopener noreferrer"
	class="group fixed right-6 z-40 flex items-center gap-3 p-1 rounded-full bg-linear-to-r from-[#25D366] to-[#128C7E] text-white shadow-xl shadow-green-500/20 hover:shadow-2xl hover:shadow-green-500/35 hover:-translate-y-1 active:scale-95 transition-all duration-300 ease-[cubic-bezier(0.32,0.72,0,1)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#25D366]"
	style="bottom: calc(1.5rem + env(safe-area-inset-bottom, 0px))"
	aria-label={tooltipText}
>
	<!-- Floating visual pulse -->
	<span class="absolute inset-0 rounded-full bg-[#25D366]/40 -z-10 animate-ping group-hover:animate-none opacity-75"></span>

	<!-- Icon wrapper -->
	<div class="w-12 h-12 rounded-full flex items-center justify-center bg-white/10 backdrop-blur-md">
		<svg 
			class="w-6 h-6 fill-white" 
			viewBox="0 0 24 24" 
			xmlns="http://www.w3.org/2000/svg"
		>
			<path d="M12.012 2c-5.506 0-9.988 4.482-9.988 9.988 0 1.76.46 3.47 1.332 4.974L2 22l5.228-1.372a9.932 9.932 0 004.784 1.22c5.506 0 9.988-4.482 9.988-9.988 0-2.658-1.036-5.158-2.916-7.038A9.919 9.919 0 0012.012 2zm0 1.71c2.19 0 4.254.856 5.808 2.41a8.173 8.173 0 012.41 5.808c0 4.536-3.69 8.226-8.226 8.226-1.554 0-3.084-.44-4.404-1.272l-.316-.2-.314.188-3.042.8.814-2.922-.214-.34A8.177 8.177 0 013.784 12c0-4.536 3.69-8.29 8.228-8.29zm-3.652 4.886c-.2.002-.456.074-.634.256-.256.256-.848.828-.848 2.018 0 1.19.866 2.336.988 2.5.122.164 1.704 2.6 4.128 3.648.576.25 1.026.398 1.376.51.578.184 1.106.158 1.522.096.464-.07 1.424-.582 1.624-1.144.2-.562.2-1.042.14-1.144-.06-.102-.22-.164-.462-.284-.242-.122-1.424-.702-1.644-.782-.22-.08-.38-.122-.542.122-.162.242-.622.782-.762.942-.14.164-.28.184-.522.062a7.172 7.172 0 01-1.938-1.196 7.9 7.9 0 01-1.344-1.67c-.14-.242-.016-.374.106-.494.11-.11.242-.284.364-.426.122-.142.162-.242.242-.404.08-.164.04-.306-.02-.426-.06-.122-.542-1.306-.742-1.788-.196-.472-.39-.408-.54-.41z"/>
		</svg>
	</div>

	<!-- Tooltip panel (slides in on hover) -->
	<span class="max-w-0 overflow-hidden opacity-0 group-hover:max-w-xs group-hover:opacity-100 group-hover:px-4 group-hover:pr-6 font-label-lg tracking-wider text-sm transition-all duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] whitespace-nowrap">
		{tooltipText}
	</span>
</a>
