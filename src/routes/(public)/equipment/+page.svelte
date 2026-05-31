<script lang="ts">
	import SeoHead from '$lib/components/seo/SeoHead.svelte';
	import { i18n } from '$lib/i18n.svelte';
	import Icon from '$lib/components/navigation/Icon.svelte';

	import { buildItemListSchema } from '$lib/utils/schema';

	// Esquema de catálogo de servicios (SEO Generativo)
	let servicesSchema = $derived(
		buildItemListSchema(
			[
				{ name: i18n.t.categories.soundTitle, url: '/equipment/' },
				{ name: i18n.t.categories.lightTitle, url: '/equipment/' },
				{ name: i18n.t.categories.visualTitle, url: '/equipment/' },
				{ name: i18n.t.categories.fxTitle, url: '/equipment/' }
			],
			i18n.lang === 'en'
				? 'Audiovisual Equipment Rental Catalog - Malaga Event Gear'
				: 'Catálogo de Alquiler de Equipos Audiovisuales - Malaga Event Gear'
		)
	);
</script>

<!-- SEO Head & JSON-LD Injection -->
<SeoHead
	title="Premium Audiovisual Equipment Rental Catalog | MEG"
	description="Explore our high-quality inventory of professional sound systems, dynamic lighting, high-definition projectors, and special effects. Premium equipment in Malaga."
	canonicalUrl="https://www.malagaeventgear.com/equipment"
	jsonLdSchema={servicesSchema}
/>

<!-- Main Header Section -->
<section class="relative px-margin-mobile md:px-margin-desktop py-20 md:py-32 max-w-container-max mx-auto text-center flex flex-col items-center justify-center">
	<!-- Ambient decoration glow -->
	<div class="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary-container rounded-full blur-[120px] opacity-20 pointer-events-none"></div>
	
	<span class="font-label-lg text-electric-blue uppercase tracking-[0.2em] mb-4 block">
		{i18n.lang === 'en' ? 'Cutting-Edge Tech' : 'Tecnología de Punta'}
	</span>
	<h1 class="font-headline-lg-mobile md:font-display-lg text-headline-lg-mobile md:text-display-lg text-on-surface mb-6 max-w-4xl mx-auto leading-tight">
		{i18n.lang === 'en' ? 'Elevate your Event with' : 'Elevá tu Evento con'} <span class="text-transparent bg-clip-text bg-gradient-to-r from-primary to-electric-blue">{i18n.lang === 'en' ? 'Premium Equipment' : 'Equipos Premium'}</span>
	</h1>
	<p class="font-body-lg text-body-lg text-on-surface-variant max-w-2xl mx-auto mb-10">
		{i18n.lang === 'en' 
			? 'Explore our catalog of high-fidelity sound, spectacular lighting, and special effects. We have the perfect tools to make your celebration unforgettable.'
			: 'Explorá nuestro catálogo de sonido de alta fidelidad, iluminación espectacular y efectos especiales. Tenemos las herramientas perfectas para hacer tu celebración inolvidable.'
		}
	</p>
</section>

<!-- Featured Package: MICE Pack -->
<section class="px-margin-mobile md:px-margin-desktop py-16 max-w-container-max mx-auto">
	<div class="relative bg-surface-container-low border border-border-glass rounded-[24px] overflow-hidden group reveal active is-revealed">
		<!-- Hover ambient shadow -->
		<div class="absolute -inset-1 bg-gradient-to-r from-electric-blue/10 to-primary-container/10 blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-700"></div>
		
		<div class="relative grid grid-cols-1 lg:grid-cols-2 gap-0">
			<!-- Featured Image -->
			<div class="relative h-[400px] lg:h-auto overflow-hidden">
				<picture class="absolute inset-0 w-full h-full">
					<source media="(max-width: 1023px)" srcset="/images/packages/mice-mobile.webp" type="image/webp" />
					<source media="(min-width: 1024px)" srcset="/images/packages/mice.webp" type="image/webp" />
					<img 
						alt="MICE Audiovisual Pack Setup for Meetings" 
						class="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-700 ease-out opacity-80" 
						src="/images/packages/mice.webp"
						loading="eager"
						fetchpriority="high"
						decoding="async"
						width="800"
						height="600"
					/>
				</picture>
				<div class="absolute inset-0 bg-gradient-to-t from-surface-container-low via-transparent to-transparent lg:bg-gradient-to-r"></div>
				<div class="absolute top-6 left-6 bg-surface-glass backdrop-blur-md border border-border-glass rounded-full px-4 py-1.5 flex items-center gap-2">
					<div class="w-2 h-2 rounded-full bg-electric-blue animate-pulse"></div>
					<span class="font-label-sm text-label-sm text-on-surface uppercase">{i18n.lang === 'en' ? 'Featured Pack' : 'Pack Destacado'}</span>
				</div>
			</div>
			
			<!-- Content Details -->
			<div class="p-8 md:p-16 flex flex-col justify-center relative z-10 bg-surface-glass backdrop-blur-xl">
				<h2 class="font-headline-md text-headline-md text-on-surface mb-4">MICE Pack</h2>
				<p class="font-body-md text-body-md text-on-surface-variant mb-8">
					{i18n.lang === 'en'
						? 'Ideal for conferences and corporate events. The MICE Pack includes a 60-inch LED screen, premium audiovisual gear, tabletop and wireless microphones, and up to 6 hours of on-site technical support to ensure your presentation runs flawlessly.'
						: 'Ideal para conferencias y eventos corporativos. El MICE Pack incluye una pantalla LED de 60 pulgadas, equipamiento audiovisual premium, micrófonos de mesa e inalámbricos, y hasta 6 horas de asistencia técnica en sitio para asegurar una presentación impecable.'
					}
				</p>
				
				<div class="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
					<div class="flex items-start gap-3">
						<Icon name="inventory_2" className="text-electric-blue" size="20" />
						<span class="font-label-sm text-label-sm text-on-surface">{i18n.lang === 'en' ? '60" LED Screen' : 'Pantalla LED de 60"'}</span>
					</div>
					<div class="flex items-start gap-3">
						<Icon name="call" className="text-electric-blue" size="20" />
						<span class="font-label-sm text-label-sm text-on-surface">{i18n.lang === 'en' ? 'Wireless Audio' : 'Audio Inalámbrico'}</span>
					</div>
					<div class="flex items-start gap-3">
						<Icon name="build" className="text-electric-blue" size="20" />
						<span class="font-label-sm text-label-sm text-on-surface">{i18n.lang === 'en' ? 'Technical Support Included' : 'Soporte Técnico Incluido'}</span>
					</div>
					<div class="flex items-start gap-3">
						<Icon name="speaker" className="text-electric-blue" size="20" />
						<span class="font-label-sm text-label-sm text-on-surface">{i18n.lang === 'en' ? 'Premium Sound' : 'Sonido Premium'}</span>
					</div>
				</div>
				
				<div class="flex flex-col sm:flex-row items-center gap-6 mt-auto">
					<div class="text-left w-full sm:w-auto">
						<span class="block font-label-sm text-label-sm text-on-surface-variant">{i18n.t.pricing.from}</span>
						<span class="font-headline-md text-[28px] text-primary">490.00 € <span class="text-[14px] text-on-surface-variant">{i18n.t.pricing.plusVatShort}</span></span>
					</div>
					<a 
						class="w-full sm:w-auto px-8 py-3 rounded-full bg-electric-blue-strong text-white font-label-lg uppercase tracking-wider hover:shadow-lg hover:shadow-electric-blue/30 active:scale-95 transition-all duration-300 ml-auto flex items-center justify-center gap-2"
						href="/packages/mice/"
					>
						{i18n.lang === 'en' ? 'Request Info' : 'Solicitar Info'} <Icon name="arrow_forward" size="18" />
					</a>
				</div>
			</div>
		</div>
	</div>
</section>

<!-- Catalog Bento Grid -->
<section class="px-margin-mobile md:px-margin-desktop py-20 max-w-container-max mx-auto">
	<div class="flex justify-between items-end mb-12 border-b border-border-glass pb-6">
		<div>
			<h2 class="font-headline-md text-headline-md text-on-surface">
				{i18n.lang === 'en' ? 'Technical Categories' : 'Categorías Técnicas'}
			</h2>
			<p class="font-body-md text-body-md text-on-surface-variant mt-2">
				{i18n.lang === 'en' 
					? 'Browse through our inventory to meet the technical needs of your production.'
					: 'Explorá nuestro inventario para cubrir las necesidades técnicas de tu producción.'
				}
			</p>
		</div>
	</div>
	
	<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 auto-rows-[400px]">
		<!-- Audio -->
		<div class="group relative rounded-[20px] overflow-hidden border border-border-glass bg-surface-container-low lg:col-span-2 row-span-1 reveal active is-revealed">
			<div 
				class="absolute inset-0 bg-[url('/images/services/sound.webp')] bg-cover bg-center opacity-30 group-hover:opacity-50 transition-opacity duration-500"
			></div>
			<div class="absolute inset-0 bg-gradient-to-t from-background via-background/40 to-transparent"></div>
			<div class="absolute inset-0 bg-surface-glass backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
			<div class="absolute bottom-0 left-0 w-full p-8 flex flex-col justify-end h-full z-10 transform translate-y-4 group-hover:translate-y-0 transition-transform duration-500">
				<div class="w-12 h-12 rounded-full bg-primary-container/50 border border-electric-blue/30 flex items-center justify-center mb-4 backdrop-blur-md">
					<Icon name="speaker" className="text-primary" />
				</div>
				<h3 class="font-headline-md text-[28px] text-on-surface mb-2">{i18n.t.categories.soundTitle}</h3>
				<p class="font-body-md text-body-md text-on-surface-variant max-w-md opacity-0 group-hover:opacity-100 transition-opacity duration-500 delay-100">
					{i18n.lang === 'en'
						? 'Line array systems, active speakers, digital mixing consoles, and Shure wireless microphones for high acoustic fidelity.'
						: 'Sistemas line array, altavoces activos, consolas de mezcla digital y micrófonos inalámbricos Shure para máxima fidelidad acústica.'
					}
				</p>
			</div>
		</div>

		<!-- Lighting -->
		<div class="group relative rounded-[20px] overflow-hidden border border-border-glass bg-surface-container-low row-span-1 reveal active is-revealed" style="transition-delay: 100ms;">
			<div 
				class="absolute inset-0 bg-[url('/images/services/lighting.webp')] bg-cover bg-center opacity-30 group-hover:opacity-50 transition-opacity duration-500"
			></div>
			<div class="absolute inset-0 bg-gradient-to-t from-background via-background/50 to-transparent"></div>
			<div class="absolute bottom-0 left-0 w-full p-8 z-10">
				<div class="w-12 h-12 rounded-full bg-primary-container/50 border border-primary/30 flex items-center justify-center mb-4 backdrop-blur-md">
					<Icon name="lightbulb" className="text-primary" />
				</div>
				<h3 class="font-headline-md text-[24px] text-on-surface mb-2">{i18n.t.categories.lightTitle}</h3>
				<p class="font-body-md text-body-md text-on-surface-variant text-sm line-clamp-2">
					{i18n.lang === 'en'
						? 'RGBW LED spotlights, Beam/Spot moving heads, and control systems to create romantic or energetic atmospheres.'
						: 'Focos LED RGBW, cabezas móviles Beam/Spot y sistemas de control para crear ambientes románticos o energéticos.'
					}
				</p>
			</div>
		</div>

		<!-- Visuals -->
		<div class="group relative rounded-[20px] overflow-hidden border border-border-glass bg-surface-container-low row-span-1 reveal active is-revealed" style="transition-delay: 200ms;">
			<div 
				class="absolute inset-0 bg-[url('/images/services/projectors-screens.webp')] bg-cover bg-center opacity-30 group-hover:opacity-50 transition-opacity duration-500"
			></div>
			<div class="absolute inset-0 bg-gradient-to-t from-background via-background/50 to-transparent"></div>
			<div class="absolute bottom-0 left-0 w-full p-8 z-10">
				<div class="w-12 h-12 rounded-full bg-primary-container/50 border border-primary/30 flex items-center justify-center mb-4 backdrop-blur-md">
					<Icon name="videocam" className="text-primary" />
				</div>
				<h3 class="font-headline-md text-[24px] text-on-surface mb-2">{i18n.t.categories.visualTitle}</h3>
				<p class="font-body-md text-body-md text-on-surface-variant text-sm line-clamp-2">
					{i18n.lang === 'en'
						? '5000+ lumens laser projectors, rear projection screens, and giant displays to give your audience a sharp visual experience.'
						: 'Proyectores láser de más de 5000 lúmenes, pantallas de retroproyección y pantallas gigantes para brindar una experiencia visual nítida.'
					}
				</p>
			</div>
		</div>

		<!-- Special Effects -->
		<div class="group relative rounded-[20px] overflow-hidden border border-border-glass bg-surface-container-low lg:col-span-2 row-span-1 reveal active is-revealed" style="transition-delay: 300ms;">
			<div 
				class="absolute inset-0 bg-[url('/images/services/fx.webp')] bg-cover bg-center opacity-25 group-hover:opacity-40 transition-opacity duration-500"
			></div>
			<div class="absolute inset-0 bg-gradient-to-r from-background via-background/70 to-transparent"></div>
			<div class="absolute top-0 left-0 w-full h-full p-8 flex flex-col justify-center z-10 max-w-lg">
				<div class="w-12 h-12 rounded-full bg-primary-container/50 border border-primary/30 flex items-center justify-center mb-4 backdrop-blur-md">
					<Icon name="memory" className="text-primary" />
				</div>
				<h3 class="font-headline-md text-[28px] text-on-surface mb-4">{i18n.lang === 'en' ? 'Special Effects' : 'Efectos Especiales'}</h3>
				<p class="font-body-md text-body-md text-on-surface-variant mb-6">
					{i18n.lang === 'en'
						? 'Low-lying fog machines (cloud effect for weddings), hazers to enhance light beams, and professional confetti cannons.'
						: 'Máquinas de humo bajo (efecto nube para bodas), hazers para resaltar haces de luz y cañones profesionales de confeti.'
					}
				</p>
				<a 
					class="flex items-center gap-2 text-electric-blue font-label-lg group-hover:translate-x-2 transition-all duration-300 active:scale-95 w-fit"
					href="/packages/"
				>
					{i18n.t.categories.bookEquipment} <Icon name="arrow_forward" size="18" />
				</a>
			</div>
		</div>
	</div>
</section>

<!-- Special Effects banner -->
<section class="py-20 px-margin-mobile md:px-margin-desktop max-w-container-max mx-auto">
	<div class="glass-panel rounded-2xl overflow-hidden relative group h-[200px] flex items-center px-8 reveal active is-revealed">
		<div class="absolute right-0 top-0 bottom-0 w-1/2 bg-gradient-to-l from-electric-blue/10 to-transparent opacity-50"></div>
		<div class="relative z-20 flex w-full justify-between items-center">
			<div>
				<h2 class="font-headline-md text-headline-md text-on-surface mb-2">{i18n.t.categories.fxTitle}</h2>
				<p class="font-body-md text-on-surface-variant max-w-lg">
					{i18n.t.categories.fxText}
				</p>
			</div>
			<a 
				href="/equipment/"
				class="hidden md:flex w-16 h-16 rounded-full border border-border-glass items-center justify-center hover:bg-on-surface/5 active:scale-90 transition-all duration-300 text-on-surface"
			>
				<Icon name="arrow_forward" size="32" className="group-hover:translate-x-1 transition-transform" />
			</a>
		</div>
	</div>
</section>
