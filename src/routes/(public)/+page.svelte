<script lang="ts">
	import SeoHead from '$lib/components/seo/SeoHead.svelte';

	// Structured JSON-LD schema for Generative SEO
	const homeSchema = {
		'@context': 'https://schema.org',
		'@type': 'LocalBusiness',
		'name': 'Malaga Event Gear',
		'image': 'https://www.malagaeventgear.com/screen.png',
		'@id': 'https://www.malagaeventgear.com/#organization',
		'url': 'https://www.malagaeventgear.com/',
		'telephone': '+34600428750',
		'priceRange': '$$',
		'address': {
			'@type': 'PostalAddress',
			'streetAddress': 'Av. de Barcelona, 34',
			'addressLocality': 'Malaga',
			'postalCode': '29009',
			'addressCountry': 'ES'
		},
		'geo': {
			'@type': 'GeoCoordinates',
			'latitude': 36.7212,
			'longitude': -4.4217
		},
		'openingHoursSpecification': {
			'@type': 'OpeningHoursSpecification',
			'dayOfWeek': [
				'Monday',
				'Tuesday',
				'Wednesday',
				'Thursday',
				'Friday',
				'Saturday',
				'Sunday'
			],
			'opens': '00:00',
			'closes': '23:59'
		}
	};
</script>

<!-- SEO Head & JSON-LD Injection -->
<SeoHead
	title="Premium Audiovisual Equipment Rental in Malaga | MEG"
	description="Malaga Event Gear (MEG) offers premium sound system, spectacular lighting, projector, and screen rentals for weddings, corporate events, and parties in Malaga."
	canonicalUrl="https://www.malagaeventgear.com/"
	jsonLdSchema={homeSchema}
/>

<!-- Hero Section -->
<section class="relative min-h-[90vh] flex items-center justify-center px-margin-mobile md:px-margin-desktop py-24 overflow-hidden">
	<div class="absolute inset-0 z-0">
		<img
			alt="Stage Background with Professional Event Lights"
			class="w-full h-full object-cover opacity-40"
			src="https://lh3.googleusercontent.com/aida/ADBb0ujwL9MEqhMYnveE1jbNDIUHYrmyJOBO--yssVc8JJO9MgsEDu9sTfsH7LFDRYMSvBu4kbGsto_MOWoy1odoXZad_rjvk9sg2x3CObPSiyAc4bEuGEnsWdW2MIPrK1v259VKP-OzvdRSWrdto2JARlP02O48uMcYLixmCro3nG5sQLl3sOm-3tJwYQ8WacA1GfJWDPmQmeIQc40QcvPWKXrhWVU9GaBK7sZB2biAA2t8l_PSbWTmh8tYVIQ"
			loading="eager"
			fetchpriority="high"
			width="1920"
			height="1080"
		/>
		<div class="absolute inset-0 bg-gradient-to-b from-background/80 via-background/60 to-background"></div>
	</div>
	
	<div class="relative z-10 max-w-container-max mx-auto w-full grid grid-cols-1 lg:grid-cols-2 gap-gutter items-center">
		<div class="space-y-8">
			<span class="inline-block px-4 py-2 rounded-full glass-panel font-label-sm text-primary uppercase tracking-widest">
				For All Types of Events
			</span>
			<h1 class="font-display-lg text-headline-lg-mobile md:text-display-lg text-on-background">
				Premium Audiovisual <br />
				<span class="text-gradient">Equipment Rental</span> in Malaga
			</h1>
			<p class="font-body-lg text-body-lg text-on-surface-variant max-w-xl">
				Experience crystal-clear sound and stunning lighting with our premium equipment. Perfect for weddings, corporate events, and exclusive parties on the Costa del Sol.
			</p>
			<div class="flex flex-wrap gap-4 pt-4">
				<a class="bg-gradient-to-r from-secondary-container to-secondary text-on-secondary px-8 py-4 rounded-full font-label-lg hover:shadow-[0_0_30px_rgba(255,180,164,0.3)] transition-all active:scale-95 duration-200" href="/pricing">
					View Pricing
				</a>
				<a class="glass-panel text-on-surface px-8 py-4 rounded-full font-label-lg hover:bg-white/10 transition-all flex items-center gap-2 active:scale-95 duration-200" href="/contact">
					Contact Us <span class="material-symbols-outlined text-[20px]">arrow_forward</span>
				</a>
			</div>
		</div>

		<!-- Bento Info Cards -->
		<div class="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-12 lg:mt-0">
			<div class="glass-panel p-6 rounded-xl ambient-shadow hover:-translate-y-2 transition-transform duration-300 reveal reveal-delay-1">
				<div class="w-12 h-12 rounded-full bg-electric-blue/20 flex items-center justify-center mb-4">
					<span class="material-symbols-outlined text-electric-blue">build</span>
				</div>
				<h3 class="font-headline-md text-[20px] mb-2 text-on-surface">#1 Flawless Setup</h3>
				<p class="font-body-md text-on-surface-variant text-sm">
					Dedicated technical support to ensure your event runs smoothly from start to finish without any worries.
				</p>
			</div>
			
			<div class="glass-panel p-6 rounded-xl ambient-shadow sm:translate-y-8 hover:translate-y-6 transition-transform duration-300 reveal reveal-delay-2">
				<div class="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center mb-4">
					<span class="material-symbols-outlined text-primary">inventory_2</span>
				</div>
				<h3 class="font-headline-md text-[20px] mb-2 text-on-surface">#2 Tailored Packages</h3>
				<p class="font-body-md text-on-surface-variant text-sm">
					Flexible rental packages designed to perfectly fit any event size, venue, and budget.
				</p>
			</div>
			
			<div class="glass-panel p-6 rounded-xl ambient-shadow hover:-translate-y-2 transition-transform duration-300 sm:col-span-2 sm:w-[80%] mx-auto sm:mt-8 reveal reveal-delay-3">
				<div class="w-12 h-12 rounded-full bg-secondary/20 flex items-center justify-center mb-4">
					<span class="material-symbols-outlined text-secondary">memory</span>
				</div>
				<h3 class="font-headline-md text-[20px] mb-2 text-on-surface">#3 Cutting-Edge Tech</h3>
				<p class="font-body-md text-on-surface-variant text-sm">
					Enjoy state-of-the-art audiovisual gear that elevates the visual and sound quality of your production.
				</p>
			</div>
		</div>
	</div>
</section>

<!-- Impact in Numbers Section -->
<section class="py-24 px-margin-mobile md:px-margin-desktop relative border-y border-border-glass bg-surface-container-low transition-colors duration-300">
	<div class="max-w-container-max mx-auto text-center">
		<h2 class="font-headline-lg text-headline-lg-mobile md:text-headline-lg mb-16 text-on-background">Our Impact in Numbers</h2>
		<div class="grid grid-cols-1 md:grid-cols-3 gap-8">
			<div class="glass-panel p-8 rounded-xl relative overflow-hidden group reveal reveal-delay-1">
				<div class="absolute inset-0 bg-gradient-to-br from-electric-blue/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
				<div class="font-display-lg text-display-lg text-gradient mb-2">27+</div>
				<div class="font-label-lg text-on-surface-variant tracking-widest uppercase">Years of Experience</div>
			</div>
			
			<div class="glass-panel p-8 rounded-xl relative overflow-hidden group reveal reveal-delay-2">
				<div class="absolute inset-0 bg-gradient-to-br from-primary/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
				<div class="font-display-lg text-display-lg text-gradient mb-2">2,500+</div>
				<div class="font-label-lg text-on-surface-variant tracking-widest uppercase">Happy Clients</div>
			</div>
			
			<div class="glass-panel p-8 rounded-xl relative overflow-hidden group reveal reveal-delay-3">
				<div class="absolute inset-0 bg-gradient-to-br from-secondary/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
				<div class="font-display-lg text-display-lg text-gradient mb-2">+95%</div>
				<div class="font-label-lg text-on-surface-variant tracking-widest uppercase">Satisfaction Rate</div>
			</div>
		</div>
	</div>
</section>

<!-- Services Section (Bento Grid) -->
<section class="py-32 px-margin-mobile md:px-margin-desktop max-w-container-max mx-auto">
	<div class="text-center mb-20">
		<span class="inline-block px-4 py-2 rounded-full glass-panel font-label-sm text-electric-blue uppercase tracking-widest mb-4">
			Premium Gear
		</span>
		<h2 class="font-headline-lg text-headline-lg-mobile md:text-headline-lg text-on-background">Available Categories</h2>
	</div>
	
	<div class="grid grid-cols-1 md:grid-cols-3 gap-6 auto-rows-[300px]">
		<!-- Sound System (Large) -->
		<div class="glass-panel rounded-2xl overflow-hidden relative group md:col-span-2 md:row-span-2 reveal reveal-delay-1">
			<div class="absolute inset-0 bg-gradient-to-t from-background via-background/50 to-transparent z-10"></div>
			<div 
				class="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?q=80&w=2070&auto=format&fit=crop')] bg-cover bg-center transition-transform duration-700 group-hover:scale-105"
			></div>
			<div class="absolute bottom-0 left-0 p-8 z-20 w-full">
				<div class="w-12 h-12 rounded-full glass-panel flex items-center justify-center mb-4 backdrop-blur-md text-on-surface">
					<span class="material-symbols-outlined">speaker</span>
				</div>
				<h3 class="font-headline-md text-headline-md text-on-surface mb-2">Sound Systems</h3>
				<p class="font-body-md text-on-surface-variant max-w-md">
					Crystal-clear high-fidelity sound, ideal for intimate weddings or large corporate conferences. We work with leading brands to ensure the highest acoustic fidelity.
				</p>
			</div>
		</div>

		<!-- Lighting -->
		<div class="glass-panel rounded-2xl overflow-hidden relative group reveal reveal-delay-2">
			<div class="absolute inset-0 bg-gradient-to-t from-background via-background/60 to-transparent z-10"></div>
			<div 
				class="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1492684223066-81342ee5ff30?q=80&w=2070&auto=format&fit=crop')] bg-cover bg-center transition-transform duration-700 group-hover:scale-105"
			></div>
			<div class="absolute bottom-0 left-0 p-6 z-20 w-full">
				<div class="w-10 h-10 rounded-full glass-panel flex items-center justify-center mb-3 backdrop-blur-md text-on-surface">
					<span class="material-symbols-outlined">lightbulb</span>
				</div>
				<h3 class="font-headline-md text-[24px] text-on-surface mb-1">Lighting</h3>
				<p class="font-body-md text-sm text-on-surface-variant">Dynamic lighting solutions to create the perfect atmosphere in your venue space.</p>
			</div>
		</div>

		<!-- Visuals/Projectors -->
		<div class="glass-panel rounded-2xl overflow-hidden relative group reveal reveal-delay-3">
			<div class="absolute inset-0 bg-gradient-to-t from-background via-background/60 to-transparent z-10"></div>
			<div 
				class="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1540575467063-178a50c2df87?q=80&w=2070&auto=format&fit=crop')] bg-cover bg-center transition-transform duration-700 group-hover:scale-105"
			></div>
			<div class="absolute bottom-0 left-0 p-6 z-20 w-full">
				<div class="w-10 h-10 rounded-full glass-panel flex items-center justify-center mb-3 backdrop-blur-md text-on-surface">
					<span class="material-symbols-outlined">videocam</span>
				</div>
				<h3 class="font-headline-md text-[24px] text-on-surface mb-1">Projectors & Screens</h3>
				<p class="font-body-md text-sm text-on-surface-variant">Sharp, high-definition visuals for presentations with high visual impact.</p>
			</div>
		</div>

		<!-- Special Effects -->
		<div class="glass-panel rounded-2xl overflow-hidden relative group md:col-span-3 h-[200px] flex items-center px-8 reveal reveal-delay-1">
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
	</div>
</section>
