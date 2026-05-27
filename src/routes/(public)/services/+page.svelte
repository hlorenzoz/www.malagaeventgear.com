<script lang="ts">
	import SeoHead from '$lib/components/seo/SeoHead.svelte';

	// Structured JSON-LD schema for the catalog of rental services
	const servicesSchema = {
		'@context': 'https://schema.org',
		'@type': 'ItemList',
		'name': 'Audiovisual Equipment Rental Catalog - Malaga Event Gear',
		'description': 'High-end audiovisual equipment for rental in corporate events, weddings, and parties in Malaga.',
		'numberOfItems': 4,
		'itemListElement': [
			{
				'@type': 'ListItem',
				'position': 1,
				'name': 'Professional Sound Systems',
				'description': 'High-fidelity speakers, mixing consoles, and wireless microphones rental.'
			},
			{
				'@type': 'ListItem',
				'position': 2,
				'name': 'Spectacular Dynamic Lighting',
				'description': 'LED wash lights, moving heads, and uplighting bars for event atmosphere.'
			},
			{
				'@type': 'ListItem',
				'position': 3,
				'name': 'High-Definition Projectors & Screens',
				'description': 'High-performance projectors and large-format LED displays for MICE events.'
			},
			{
				'@type': 'ListItem',
				'position': 4,
				'name': 'Special Effects & Atmospheric Illusions',
				'description': 'Low-lying fog machines, hazers, and scenic special lighting effects.'
			}
		]
	};
</script>

<!-- SEO Head & JSON-LD Injection -->
<SeoHead
	title="Premium Audiovisual Equipment Rental Catalog | MEG"
	description="Explore our high-quality inventory of professional sound systems, dynamic lighting, high-definition projectors, and special effects. Premium equipment in Malaga."
	canonicalUrl="https://www.malagaeventgear.com/services"
	jsonLdSchema={servicesSchema}
/>

<!-- Main Header Section -->
<section class="relative px-margin-mobile md:px-margin-desktop py-20 md:py-32 max-w-container-max mx-auto text-center flex flex-col items-center justify-center">
	<!-- Ambient decoration glow -->
	<div class="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary-container rounded-full blur-[120px] opacity-20 pointer-events-none"></div>
	
	<span class="font-label-lg text-electric-blue uppercase tracking-[0.2em] mb-4 block">Cutting-Edge Tech</span>
	<h1 class="font-headline-lg-mobile md:font-display-lg text-headline-lg-mobile md:text-display-lg text-on-surface mb-6 max-w-4xl mx-auto">
		Elevate your Event with <span class="text-transparent bg-clip-text bg-gradient-to-r from-primary to-electric-blue">Premium Equipment</span>
	</h1>
	<p class="font-body-lg text-body-lg text-on-surface-variant max-w-2xl mx-auto mb-10">
		Explore our catalog of high-fidelity sound, spectacular lighting, and special effects. We have the perfect tools to make your celebration unforgettable.
	</p>
</section>

<!-- Featured Package: MICE Pack -->
<section class="px-margin-mobile md:px-margin-desktop py-16 max-w-container-max mx-auto">
	<div class="relative bg-surface-container-low border border-border-glass rounded-[24px] overflow-hidden group reveal-on-scroll">
		<!-- Hover ambient shadow -->
		<div class="absolute -inset-1 bg-gradient-to-r from-electric-blue/10 to-primary-container/10 blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-700"></div>
		
		<div class="relative grid grid-cols-1 lg:grid-cols-2 gap-0">
			<!-- Featured Image -->
			<div class="relative h-[400px] lg:h-auto overflow-hidden">
				<img 
					alt="MICE Audiovisual Pack Setup for Meetings" 
					class="absolute inset-0 w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-700 ease-out" 
					src="https://lh3.googleusercontent.com/aida/ADBb0uhhn7muQzMrOq1OET9-W3b-HkkGO1YqJ0eziICavObri9c3v27TKrh2o7y8lXKu7GvEk4fUSo7ZcNRp9_7Qez7owNCqSP9L0pgURBdXvwSJviS2Bgb7_4Bmbfe1t6KPwFuk8J5W7OWK04ZYuib7ZI5aeQW5M-7Cbk3OENjceK-YLLUH2yYCBGpfzwYJNdMWYIrpZN5YEvJRSE4bvQqCKAIIF5B4I39qHt1372WeZkGL8_T_ZABMvMhAtw"
					loading="lazy"
					decoding="async"
					width="800"
					height="600"
				/>
				<div class="absolute inset-0 bg-gradient-to-t from-surface-container-low via-transparent to-transparent lg:bg-gradient-to-r"></div>
				<div class="absolute top-6 left-6 bg-surface-glass backdrop-blur-md border border-border-glass rounded-full px-4 py-1.5 flex items-center gap-2">
					<div class="w-2 h-2 rounded-full bg-electric-blue animate-pulse"></div>
					<span class="font-label-sm text-label-sm text-on-surface uppercase">Featured Pack</span>
				</div>
			</div>
			
			<!-- Content Details -->
			<div class="p-8 md:p-16 flex flex-col justify-center relative z-10 bg-surface-glass backdrop-blur-xl">
				<h2 class="font-headline-md text-headline-md text-on-surface mb-4">MICE Pack</h2>
				<p class="font-body-md text-body-md text-on-surface-variant mb-8">
					Ideal for conferences and corporate events. The MICE Pack includes a 60-inch LED screen, premium audiovisual gear, tabletop and wireless microphones, and up to 6 hours of on-site technical support to ensure your presentation runs flawlessly.
				</p>
				
				<div class="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
					<div class="flex items-start gap-3">
						<span class="material-symbols-outlined text-electric-blue">tv</span>
						<span class="font-label-sm text-label-sm text-on-surface">60" LED Screen</span>
					</div>
					<div class="flex items-start gap-3">
						<span class="material-symbols-outlined text-electric-blue">mic</span>
						<span class="font-label-sm text-label-sm text-on-surface">Wireless Audio</span>
					</div>
					<div class="flex items-start gap-3">
						<span class="material-symbols-outlined text-electric-blue">engineering</span>
						<span class="font-label-sm text-label-sm text-on-surface">Technical Support Included</span>
					</div>
					<div class="flex items-start gap-3">
						<span class="material-symbols-outlined text-electric-blue">speaker</span>
						<span class="font-label-sm text-label-sm text-on-surface">Premium Sound</span>
					</div>
				</div>
				
				<div class="flex flex-col sm:flex-row items-center gap-6 mt-auto">
					<div class="text-left w-full sm:w-auto">
						<span class="block font-label-sm text-label-sm text-on-surface-variant">From</span>
						<span class="font-headline-md text-[28px] text-primary">490.00 € <span class="text-[14px] text-on-surface-variant">(+VAT)</span></span>
					</div>
					<a 
						class="w-full sm:w-auto px-8 py-3 rounded-full bg-electric-blue text-white font-label-lg uppercase tracking-wider hover:shadow-lg hover:shadow-electric-blue/30 active:scale-95 transition-all duration-300 ml-auto flex items-center justify-center gap-2"
						href="/contact?pack=mice"
					>
						Request Info <span class="material-symbols-outlined text-[18px]">arrow_forward</span>
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
			<h2 class="font-headline-md text-headline-md text-on-surface">Technical Categories</h2>
			<p class="font-body-md text-body-md text-on-surface-variant mt-2">Browse through our inventory to meet the technical needs of your production.</p>
		</div>
	</div>
	
	<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 auto-rows-[400px]">
		<!-- Audio -->
		<div class="group relative rounded-[20px] overflow-hidden border border-border-glass bg-surface-container-low lg:col-span-2 row-span-1 reveal-on-scroll">
			<div 
				class="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?q=80&w=2070&auto=format&fit=crop')] bg-cover bg-center opacity-40 group-hover:opacity-60 transition-opacity duration-500"
			></div>
			<div class="absolute inset-0 bg-gradient-to-t from-background via-background/50 to-transparent"></div>
			<div class="absolute inset-0 bg-surface-glass backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
			<div class="absolute bottom-0 left-0 w-full p-8 flex flex-col justify-end h-full z-10 transform translate-y-4 group-hover:translate-y-0 transition-transform duration-500">
				<div class="w-12 h-12 rounded-full bg-primary-container/50 border border-electric-blue/30 flex items-center justify-center mb-4 backdrop-blur-md">
					<span class="material-symbols-outlined text-primary">speaker</span>
				</div>
				<h3 class="font-headline-md text-[28px] text-on-surface mb-2">Sound Equipment</h3>
				<p class="font-body-md text-body-md text-on-surface-variant max-w-md opacity-0 group-hover:opacity-100 transition-opacity duration-500 delay-100">
					Line array systems, active speakers, digital mixing consoles, and Shure wireless microphones for high acoustic fidelity.
				</p>
			</div>
		</div>

		<!-- Lighting -->
		<div class="group relative rounded-[20px] overflow-hidden border border-border-glass bg-surface-container-low row-span-1 reveal-on-scroll" style="transition-delay: 100ms;">
			<div 
				class="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1492684223066-81342ee5ff30?q=80&w=2070&auto=format&fit=crop')] bg-cover bg-center opacity-40 group-hover:opacity-60 transition-opacity duration-500"
			></div>
			<div class="absolute inset-0 bg-gradient-to-t from-background via-background/60 to-transparent"></div>
			<div class="absolute bottom-0 left-0 w-full p-8 z-10">
				<div class="w-12 h-12 rounded-full bg-primary-container/50 border border-primary/30 flex items-center justify-center mb-4 backdrop-blur-md">
					<span class="material-symbols-outlined text-primary">lightbulb</span>
				</div>
				<h3 class="font-headline-md text-[24px] text-on-surface mb-2">Dynamic Lighting</h3>
				<p class="font-body-md text-body-md text-on-surface-variant text-sm line-clamp-2">
					RGBW LED spotlights, Beam/Spot moving heads, and control systems to create romantic or energetic atmospheres.
				</p>
			</div>
		</div>

		<!-- Visuals -->
		<div class="group relative rounded-[20px] overflow-hidden border border-border-glass bg-surface-container-low row-span-1 reveal-on-scroll" style="transition-delay: 200ms;">
			<div 
				class="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1540655037529-dec98120b8c7?q=80&w=2070&auto=format&fit=crop')] bg-cover bg-center opacity-40 group-hover:opacity-60 transition-opacity duration-500"
			></div>
			<div class="absolute inset-0 bg-gradient-to-t from-background via-background/60 to-transparent"></div>
			<div class="absolute bottom-0 left-0 w-full p-8 z-10">
				<div class="w-12 h-12 rounded-full bg-primary-container/50 border border-primary/30 flex items-center justify-center mb-4 backdrop-blur-md">
					<span class="material-symbols-outlined text-primary">videocam</span>
				</div>
				<h3 class="font-headline-md text-[24px] text-on-surface mb-2">Projectors & Screens</h3>
				<p class="font-body-md text-body-md text-on-surface-variant text-sm line-clamp-2">
					5000+ lumens laser projectors, rear projection screens, and giant displays to give your audience a sharp visual experience.
				</p>
			</div>
		</div>

		<!-- Special Effects -->
		<div class="group relative rounded-[20px] overflow-hidden border border-border-glass bg-surface-container-low lg:col-span-2 row-span-1 reveal-on-scroll" style="transition-delay: 300ms;">
			<div 
				class="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1514525253161-7a46d19cd819?q=80&w=1974&auto=format&fit=crop')] bg-cover bg-center opacity-30 group-hover:opacity-50 transition-opacity duration-500"
			></div>
			<div class="absolute inset-0 bg-gradient-to-r from-background via-background/80 to-transparent"></div>
			<div class="absolute top-0 left-0 w-full h-full p-8 flex flex-col justify-center z-10 max-w-lg">
				<div class="w-12 h-12 rounded-full bg-primary-container/50 border border-primary/30 flex items-center justify-center mb-4 backdrop-blur-md">
					<span class="material-symbols-outlined text-primary">air</span>
				</div>
				<h3 class="font-headline-md text-[28px] text-on-surface mb-4">Special Effects</h3>
				<p class="font-body-md text-body-md text-on-surface-variant mb-6">
					Low-lying fog machines (cloud effect for weddings), hazers to enhance light beams, and professional confetti cannons.
				</p>
				<a 
					class="flex items-center gap-2 text-electric-blue font-label-lg group-hover:translate-x-2 transition-all duration-300 active:scale-95 w-fit"
					href="/contact?category=effects"
				>
					Book Equipment <span class="material-symbols-outlined text-[18px]">arrow_forward</span>
				</a>
			</div>
		</div>
	</div>
</section>

<!-- Special Effects banner -->
<section class="py-20 px-margin-mobile md:px-margin-desktop max-w-container-max mx-auto">
	<div class="glass-panel rounded-2xl overflow-hidden relative group h-[200px] flex items-center px-8 reveal-on-scroll">
		<div class="absolute right-0 top-0 bottom-0 w-1/2 bg-gradient-to-l from-electric-blue/10 to-transparent opacity-50"></div>
		<div class="relative z-20 flex w-full justify-between items-center">
			<div>
				<h3 class="font-headline-md text-headline-md text-on-surface mb-2">Special Effects & Fog Machines</h3>
				<p class="font-body-md text-on-surface-variant max-w-lg">
					Create a stunning atmosphere at your event with our professional-grade special effects and fog machines.
				</p>
			</div>
			<a 
				href="/services"
				class="hidden md:flex w-16 h-16 rounded-full border border-border-glass items-center justify-center group-hover:bg-white/5 active:scale-90 transition-all duration-300 text-on-surface"
			>
				<span class="material-symbols-outlined text-[32px] group-hover:translate-x-1 transition-transform">arrow_forward</span>
			</a>
		</div>
	</div>
</section>
