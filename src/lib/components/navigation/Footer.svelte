<script lang="ts">
	import { i18n } from '$lib/i18n.svelte';
</script>

<!-- Footer Shared Component -->
<footer class="w-full py-16 px-margin-mobile md:px-margin-desktop border-t border-border-glass bg-surface-container-low transition-colors duration-300">
	<div class="max-w-container-max mx-auto">
		<div class="grid grid-cols-1 md:grid-cols-12 gap-gutter mb-12">
			<!-- Col 1: Brand Info -->
			<div class="md:col-span-4 flex flex-col gap-4">
				<span class="font-display-lg text-headline-md text-primary tracking-tight">
					{i18n.t.nav.brand}
				</span>
				<p class="font-body-md text-body-md text-on-surface-variant max-w-sm mt-2">
					{i18n.lang === 'en' 
						? 'Premium sound, lighting, and screen rentals for exclusive events in Malaga and the Costa del Sol. State-of-the-art equipment and tailored technical support.'
						: 'Alquiler de equipos premium de sonido, iluminación y pantallas para eventos exclusivos en Málaga y la Costa del Sol. Equipamiento de vanguardia y soporte técnico a medida.'
					}
				</p>
			</div>

			<!-- Col 2: Navigation / Links -->
			<div class="md:col-span-3 md:col-start-6 flex flex-col gap-4">
				<span class="font-label-lg text-on-surface uppercase tracking-wider mb-2">Legal</span>
				<nav class="flex flex-col gap-3">
					<a class="font-body-md text-body-md text-on-surface-variant hover:text-electric-blue hover:translate-x-1 transition-all duration-200" href="/terms">
						{i18n.lang === 'en' ? 'Terms of Service' : 'Términos del Servicio'}
					</a>
					<a class="font-body-md text-body-md text-on-surface-variant hover:text-electric-blue hover:translate-x-1 transition-all duration-200" href="/privacy">
						{i18n.lang === 'en' ? 'Privacy Policy' : 'Política de Privacidad'}
					</a>
				</nav>
			</div>

			<!-- Col 3: Resources -->
			<div class="md:col-span-3 flex flex-col gap-4">
				<span class="font-label-lg text-on-surface uppercase tracking-wider mb-2">
					{i18n.lang === 'en' ? 'Resources' : 'Recursos'}
				</span>
				<nav class="flex flex-col gap-3">
					<a class="font-body-md text-body-md text-on-surface-variant hover:text-electric-blue hover:translate-x-1 transition-all duration-200" href="/inventory">
						{i18n.lang === 'en' ? 'Complete Catalog' : 'Catálogo Completo'}
					</a>
					<a class="font-body-md text-body-md text-on-surface-variant hover:text-electric-blue hover:translate-x-1 transition-all duration-200" href="/partners">
						{i18n.lang === 'en' ? 'Partner Venues' : 'Espacios Colaboradores'}
					</a>
				</nav>
			</div>
		</div>

		<!-- Bottom Row: Copyright & Socials -->
		<div class="pt-8 border-t border-border-glass/50 flex flex-col md:flex-row justify-between items-center gap-4 text-center">
			<span class="font-body-md text-body-md text-on-surface-variant text-sm">
				© {new Date().getFullYear()} {i18n.t.nav.brand}. {i18n.lang === 'en' ? 'All rights reserved.' : 'Todos los derechos reservados.'}
			</span>
			<div class="flex items-center gap-4">
				<a 
					class="w-10 h-10 rounded-full glass-panel flex items-center justify-center text-primary hover:text-electric-blue hover:bg-white/10 active:scale-95 transition-all duration-300" 
					href="mailto:contact@malagaeventgear.com"
					aria-label="Send email"
				>
					<span class="material-symbols-outlined text-[20px]">mail</span>
				</a>
				<a 
					class="w-10 h-10 rounded-full glass-panel flex items-center justify-center text-primary hover:text-electric-blue hover:bg-white/10 active:scale-95 transition-all duration-300" 
					href="tel:+34600428750"
					aria-label="Call by phone"
				>
					<span class="material-symbols-outlined text-[20px]">call</span>
				</a>
			</div>
		</div>
	</div>
</footer>
