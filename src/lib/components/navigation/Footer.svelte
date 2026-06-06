<script lang="ts">
	import { i18n } from '$lib/i18n.svelte';
	import { packages } from '$lib/data/packages';
	import { siteConfig } from '$lib/data/site';
	import Icon from '$lib/components/navigation/Icon.svelte';
</script>

<!-- Footer Shared Component -->
<footer class="w-full py-16 px-margin-mobile md:px-margin-desktop border-t border-border-glass bg-surface-container-low transition-colors duration-300">
	<div class="max-w-container-max mx-auto">
		<div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-gutter mb-12">
			<!-- Col 1: Brand Info -->
			<div class="sm:col-span-2 lg:col-span-12 flex flex-col items-center gap-4 text-center mb-8 lg:mb-12">
				<!-- Brand logo (theme-aware via data-theme CSS swap) -->
				<img src="/logo-light.svg" alt={i18n.t.nav.brand} width="250" height="75" class="brand-logo brand-logo--light h-9 w-auto" />
				<img src="/logo-dark.svg" alt={i18n.t.nav.brand} width="250" height="75" class="brand-logo brand-logo--dark h-9 w-auto" />
				<p class="font-body-md text-body-md text-on-surface-variant max-w-3xl mt-2">
					{i18n.lang === 'en' 
						? 'Premium sound, lighting, and screen rentals for exclusive events in Malaga and the Costa del Sol. State-of-the-art equipment and tailored technical support.'
						: 'Alquiler de equipos premium de sonido, iluminación y pantallas para eventos exclusivos en Málaga y la Costa del Sol. Equipamiento de vanguardia y soporte técnico a medida.'
					}
				</p>
			</div>

			<!-- Col 2: Navigation / Links -->
			<div class="lg:col-span-3 flex flex-col gap-4">
				<span class="font-label-lg text-on-surface uppercase tracking-wider mb-2">
					{i18n.lang === 'en' ? 'Useful Links' : 'Enlaces Útiles'}
				</span>
				<nav class="flex flex-col gap-2">
					<a class="font-body-md text-body-md text-on-surface-variant hover:text-electric-blue hover:translate-x-1 transition-all duration-200" href="/">
						{i18n.lang === 'en' ? 'Home' : 'Inicio'}
					</a>
					<a class="font-body-md text-body-md text-on-surface-variant hover:text-electric-blue hover:translate-x-1 transition-all duration-200" href="/packages/">
						{i18n.lang === 'en' ? 'Packages' : 'Paquetes'}
					</a>
					<a class="font-body-md text-body-md text-on-surface-variant hover:text-electric-blue hover:translate-x-1 transition-all duration-200" href="/blog/">
						{i18n.lang === 'en' ? 'Blog' : 'Blog'}
					</a>
					<a class="font-body-md text-body-md text-on-surface-variant hover:text-electric-blue hover:translate-x-1 transition-all duration-200" href="/about-us/">
						{i18n.lang === 'en' ? 'About Us' : 'Sobre Nosotros'}
					</a>
					<a class="font-body-md text-body-md text-on-surface-variant hover:text-electric-blue hover:translate-x-1 transition-all duration-200" href="/meet-the-team/">
						{i18n.lang === 'en' ? 'Meet The Team' : 'Nuestro Equipo'}
					</a>
					<a class="font-body-md text-body-md text-on-surface-variant hover:text-electric-blue hover:translate-x-1 transition-all duration-200" href="/contact/">
						{i18n.lang === 'en' ? 'Contact Us' : 'Contáctanos'}
					</a>
					<a class="font-body-md text-body-md text-on-surface-variant hover:text-electric-blue hover:translate-x-1 transition-all duration-200" href="/terms-of-service/">
						{i18n.lang === 'en' ? 'Terms of Service' : 'Términos del Servicio'}
					</a>
					<a class="font-body-md text-body-md text-on-surface-variant hover:text-electric-blue hover:translate-x-1 transition-all duration-200" href="/privacy-policy/">
						{i18n.lang === 'en' ? 'Privacy Policy' : 'Política de Privacidad'}
					</a>
					<a class="font-body-md text-body-md text-on-surface-variant hover:text-electric-blue hover:translate-x-1 transition-all duration-200" href="/cookie-policy/">
						{i18n.lang === 'en' ? 'Cookie Policy' : 'Política de Cookies'}
					</a>
					<a class="font-body-md text-body-md text-on-surface-variant hover:text-electric-blue hover:translate-x-1 transition-all duration-200" href="/gdpr/">
						{i18n.lang === 'en' ? 'GDPR' : 'RGPD'}
					</a>
					<a class="font-body-md text-body-md text-on-surface-variant hover:text-electric-blue hover:translate-x-1 transition-all duration-200" href="/faq/">
						{i18n.lang === 'en' ? 'FAQ' : 'Preguntas Frecuentes'}
					</a>
					<a class="font-body-md text-body-md text-on-surface-variant hover:text-electric-blue hover:translate-x-1 transition-all duration-200" href="/sitemap/">
						{i18n.lang === 'en' ? 'Sitemap' : 'Mapa del Sitio'}
					</a>
				</nav>
			</div>

			<!-- Col 3: Service Packages -->
			<div class="lg:col-span-3 flex flex-col gap-4">
				<span class="font-label-lg text-on-surface uppercase tracking-wider mb-2">
					{i18n.lang === 'en' ? 'Service Packages' : 'Paquetes de Servicios'}
				</span>
				<nav class="flex flex-col gap-2">
					{#each packages as pkg (pkg.id)}
						<a class="font-body-md text-body-md text-on-surface-variant hover:text-electric-blue hover:translate-x-1 transition-all duration-200" href={pkg.route}>
							{pkg.name}
						</a>
					{/each}
				</nav>
			</div>

			<!-- Col 4: Address / Listings / Online Presence -->
			<div class="lg:col-span-3 flex flex-col gap-8">
				<div class="flex flex-col gap-4">
					<span class="font-label-lg text-on-surface uppercase tracking-wider mb-2">
						{i18n.lang === 'en' ? 'Local Address' : 'Dirección Local'}
					</span>
					<a class="font-body-md text-body-md text-on-surface-variant hover:text-electric-blue transition-colors duration-200" href={siteConfig.googleBusinessProfile} target="_blank" rel="noopener noreferrer">
						{siteConfig.displayAddress}
					</a>
				</div>

				<div class="flex flex-col gap-4">
					<span class="font-label-lg text-on-surface uppercase tracking-wider mb-2">
						{i18n.lang === 'en' ? 'Listings' : 'Directorios'}
					</span>
					<nav class="flex flex-col gap-2">
						<a class="font-body-md text-body-md text-on-surface-variant hover:text-electric-blue hover:translate-x-1 transition-all duration-200" href={siteConfig.googleBusinessProfile} target="_blank" rel="noopener noreferrer">
							Google My Business
						</a>
						<a class="font-body-md text-body-md text-on-surface-variant hover:text-electric-blue hover:translate-x-1 transition-all duration-200" href={siteConfig.listings.bingPlaces} target="_blank" rel="noopener noreferrer">
							Bing Places
						</a>
					</nav>
				</div>

				<div class="flex flex-col gap-4">
					<span class="font-label-lg text-on-surface uppercase tracking-wider mb-2">
						{i18n.lang === 'en' ? 'Online Presence' : 'Presencia Online'}
					</span>
					<nav class="flex flex-col gap-2">
						<a class="font-body-md text-body-md text-on-surface-variant hover:text-electric-blue hover:translate-x-1 transition-all duration-200" href={siteConfig.onlinePresence.medium} target="_blank" rel="noopener noreferrer">
							Medium
						</a>
						<a class="font-body-md text-body-md text-on-surface-variant hover:text-electric-blue hover:translate-x-1 transition-all duration-200" href={siteConfig.onlinePresence.pinterest} target="_blank" rel="noopener noreferrer">
							Pinterest
						</a>
					</nav>
				</div>
			</div>

			<!-- Col 5: More Information / Emails -->
			<div class="lg:col-span-3 flex flex-col gap-8">
				<div class="flex flex-col gap-4">
					<span class="font-label-lg text-on-surface uppercase tracking-wider mb-2">
						{i18n.lang === 'en' ? 'More Information' : 'Más Información'}
					</span>
					<p class="font-body-md text-body-md text-on-surface-variant">
						{i18n.lang === 'en'
							? 'Need more details? Contact us for info on our event gear rentals, pricing, and availability.'
							: '¿Necesitás más detalles? Contactanos para info sobre alquiler de equipos, precios y disponibilidad.'
						}
					</p>
					<p class="font-body-md text-body-md text-on-surface-variant">
						<span class="text-on-surface font-medium">{i18n.lang === 'en' ? 'Tel' : 'Tel'}:</span>
						<a class="hover:text-electric-blue transition-colors duration-200" href={siteConfig.phoneCallUrl}>
							{siteConfig.contactPhone}
						</a>
					</p>
					<p class="font-body-md text-body-md text-on-surface-variant">
						<span class="text-on-surface font-medium">WhatsApp:</span>
						<a class="hover:text-electric-blue transition-colors duration-200" href={siteConfig.whatsappUrl} target="_blank" rel="noopener noreferrer">
							{i18n.lang === 'en' ? 'Click To Chat' : 'Chateá Ahora'}
						</a>
					</p>
				</div>

				<div class="flex flex-col gap-4">
					<span class="font-label-lg text-on-surface uppercase tracking-wider mb-2">
						{i18n.lang === 'en' ? 'Emails' : 'Correos'}
					</span>
					<div class="flex flex-col gap-3">
						<p class="font-body-md text-body-md text-on-surface-variant">
							<span class="text-on-surface font-medium">{i18n.lang === 'en' ? 'For hire' : 'Para alquiler'}:</span><br />
							<a class="hover:text-electric-blue transition-colors duration-200 break-all" href="mailto:{siteConfig.emails.hire}">
								{siteConfig.emails.hire}
							</a>
						</p>
						<p class="font-body-md text-body-md text-on-surface-variant">
							<span class="text-on-surface font-medium">{i18n.lang === 'en' ? 'For contact' : 'Para contacto'}:</span><br />
							<a class="hover:text-electric-blue transition-colors duration-200 break-all" href="mailto:{siteConfig.emails.contact}">
								{siteConfig.emails.contact}
							</a>
						</p>
						<p class="font-body-md text-body-md text-on-surface-variant">
							<span class="text-on-surface font-medium">{i18n.lang === 'en' ? 'For legal' : 'Para legal'}:</span><br />
							<a class="hover:text-electric-blue transition-colors duration-200 break-all" href="mailto:{siteConfig.emails.legal}">
								{siteConfig.emails.legal}
							</a>
						</p>
					</div>
				</div>
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
					<Icon name="mail" size="20" />
				</a>
				<a 
					class="w-10 h-10 rounded-full glass-panel flex items-center justify-center text-primary hover:text-electric-blue hover:bg-white/10 active:scale-95 transition-all duration-300" 
					href="tel:+34600428750"
					aria-label="Call by phone"
				>
					<Icon name="call" size="20" />
				</a>
			</div>
		</div>
	</div>
</footer>

<style>
	/* Default theme is dark → show the light (white) logo. */
	.brand-logo--dark {
		display: none;
	}
	:global([data-theme='light']) .brand-logo--light {
		display: none;
	}
	:global([data-theme='light']) .brand-logo--dark {
		display: block;
	}
</style>
