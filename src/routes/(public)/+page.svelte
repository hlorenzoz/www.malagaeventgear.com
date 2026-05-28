<script lang="ts">
	import SeoHead from '$lib/components/seo/SeoHead.svelte';
	import { i18n } from '$lib/i18n.svelte';

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
			class="w-full h-full object-cover opacity-30 dark:opacity-40 transition-opacity duration-300"
			src="/premium_event_stage.png"
			loading="eager"
			fetchpriority="high"
			width="1920"
			height="1080"
		/>
		<div class="absolute inset-0 bg-gradient-to-b from-background/90 via-background/60 to-background transition-colors duration-300"></div>
	</div>
	
	<div class="relative z-10 max-w-container-max mx-auto w-full grid grid-cols-1 lg:grid-cols-2 gap-gutter items-center">
		<div class="space-y-8">
			<span class="inline-block px-4 py-2 rounded-full glass-panel font-label-sm text-primary uppercase tracking-widest">
				{i18n.t.hero.span}
			</span>
			<h1 class="font-display-lg text-[40px] md:text-display-lg text-on-background leading-tight">
				{i18n.t.hero.titlePart1} <br />
				<span class="text-gradient font-bold">{i18n.t.hero.titleGradient}</span> {i18n.t.hero.titlePart2}
			</h1>
			<p class="font-body-lg text-body-lg text-on-surface-variant max-w-xl">
				{i18n.t.hero.subtitle}
			</p>
			<div class="flex flex-wrap gap-4 pt-4">
				<a class="bg-gradient-to-r from-secondary-container to-secondary text-on-secondary px-8 py-4 rounded-full font-label-lg hover:shadow-[0_0_30px_rgba(255,180,164,0.3)] hover:-translate-y-0.5 transition-all active:scale-95 duration-200" href="/pricing">
					{i18n.t.hero.viewPricing}
				</a>
				<a class="glass-panel text-on-surface px-8 py-4 rounded-full font-label-lg hover:bg-on-surface/10 hover:-translate-y-0.5 transition-all flex items-center gap-2 active:scale-95 duration-200" href="/contact">
					{i18n.t.hero.contactUs} <span class="material-symbols-outlined text-[20px]">arrow_forward</span>
				</a>
			</div>
		</div>

		<!-- Bento Info Cards -->
		<div class="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-12 lg:mt-0">
			<div class="glass-card p-6 rounded-xl ambient-shadow hover:-translate-y-2 transition-transform duration-300 reveal active is-revealed">
				<div class="w-12 h-12 rounded-full bg-electric-blue/20 flex items-center justify-center mb-4">
					<span class="material-symbols-outlined text-electric-blue">build</span>
				</div>
				<h3 class="font-headline-md text-[20px] mb-2 text-on-surface">{i18n.t.bento.card1Title}</h3>
				<p class="font-body-md text-on-surface-variant text-sm">
					{i18n.t.bento.card1Text}
				</p>
			</div>
			
			<div class="glass-card p-6 rounded-xl ambient-shadow sm:translate-y-8 hover:translate-y-6 transition-transform duration-300 reveal active is-revealed">
				<div class="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center mb-4">
					<span class="material-symbols-outlined text-primary">inventory_2</span>
				</div>
				<h3 class="font-headline-md text-[20px] mb-2 text-on-surface">{i18n.t.bento.card2Title}</h3>
				<p class="font-body-md text-on-surface-variant text-sm">
					{i18n.t.bento.card2Text}
				</p>
			</div>
			
			<div class="glass-card p-6 rounded-xl ambient-shadow hover:-translate-y-2 transition-transform duration-300 sm:col-span-2 sm:w-[80%] mx-auto sm:mt-8 reveal active is-revealed">
				<div class="w-12 h-12 rounded-full bg-secondary/20 flex items-center justify-center mb-4">
					<span class="material-symbols-outlined text-secondary">memory</span>
				</div>
				<h3 class="font-headline-md text-[20px] mb-2 text-on-surface">{i18n.t.bento.card3Title}</h3>
				<p class="font-body-md text-on-surface-variant text-sm">
					{i18n.t.bento.card3Text}
				</p>
			</div>
		</div>
	</div>
</section>

<!-- Impact in Numbers Section -->
<section class="py-24 px-margin-mobile md:px-margin-desktop relative border-y border-border-glass bg-surface-container-low transition-colors duration-300">
	<div class="max-w-container-max mx-auto text-center">
		<h2 class="font-headline-lg text-[32px] md:text-headline-lg mb-16 text-on-background">{i18n.t.impact.title}</h2>
		<div class="grid grid-cols-1 md:grid-cols-3 gap-8">
			<div class="glass-card p-8 rounded-xl relative overflow-hidden group reveal active is-revealed">
				<div class="absolute inset-0 bg-gradient-to-br from-electric-blue/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
				<div class="font-display-lg text-display-lg text-gradient mb-2">27+</div>
				<div class="font-label-lg text-on-surface-variant tracking-widest uppercase">{i18n.t.impact.years}</div>
			</div>
			
			<div class="glass-card p-8 rounded-xl relative overflow-hidden group reveal active is-revealed">
				<div class="absolute inset-0 bg-gradient-to-br from-primary/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
				<div class="font-display-lg text-display-lg text-gradient mb-2">2,500+</div>
				<div class="font-label-lg text-on-surface-variant tracking-widest uppercase">{i18n.t.impact.clients}</div>
			</div>
			
			<div class="glass-card p-8 rounded-xl relative overflow-hidden group reveal active is-revealed">
				<div class="absolute inset-0 bg-gradient-to-br from-secondary/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
				<div class="font-display-lg text-display-lg text-gradient mb-2">+95%</div>
				<div class="font-label-lg text-on-surface-variant tracking-widest uppercase">{i18n.t.impact.satisfaction}</div>
			</div>
		</div>
	</div>
</section>

<!-- Services Section (Bento Grid) -->
<section class="py-32 px-margin-mobile md:px-margin-desktop max-w-container-max mx-auto">
	<div class="text-center mb-20">
		<span class="inline-block px-4 py-2 rounded-full glass-panel font-label-sm text-electric-blue uppercase tracking-widest mb-4">
			{i18n.t.categories.badge}
		</span>
		<h2 class="font-headline-lg text-[32px] md:text-headline-lg text-on-background">{i18n.t.categories.title}</h2>
	</div>
	
	<div class="grid grid-cols-1 md:grid-cols-3 gap-6 auto-rows-[300px]">
		<!-- Sound System (Large) -->
		<div class="glass-panel rounded-2xl overflow-hidden relative group md:col-span-2 md:row-span-2 reveal active is-revealed">
			<div class="absolute inset-0 bg-gradient-to-t from-background via-background/40 to-transparent z-10"></div>
			<div 
				class="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?q=80&w=2070&auto=format&fit=crop')] bg-cover bg-center transition-transform duration-700 group-hover:scale-105"
			></div>
			<div class="absolute bottom-0 left-0 p-8 z-20 w-full">
				<div class="w-12 h-12 rounded-full glass-panel flex items-center justify-center mb-4 backdrop-blur-md text-on-surface">
					<span class="material-symbols-outlined">speaker</span>
				</div>
				<h3 class="font-headline-md text-headline-md text-on-surface mb-2">{i18n.t.categories.soundTitle}</h3>
				<p class="font-body-md text-on-surface-variant max-w-md">
					{i18n.t.categories.soundText}
				</p>
			</div>
		</div>

		<!-- Lighting -->
		<div class="glass-panel rounded-2xl overflow-hidden relative group reveal active is-revealed">
			<div class="absolute inset-0 bg-gradient-to-t from-background via-background/50 to-transparent z-10"></div>
			<div 
				class="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1492684223066-81342ee5ff30?q=80&w=2070&auto=format&fit=crop')] bg-cover bg-center transition-transform duration-700 group-hover:scale-105"
			></div>
			<div class="absolute bottom-0 left-0 p-6 z-20 w-full">
				<div class="w-10 h-10 rounded-full glass-panel flex items-center justify-center mb-3 backdrop-blur-md text-on-surface">
					<span class="material-symbols-outlined">lightbulb</span>
				</div>
				<h3 class="font-headline-md text-[24px] text-on-surface mb-1">{i18n.t.categories.lightTitle}</h3>
				<p class="font-body-md text-sm text-on-surface-variant">{i18n.t.categories.lightText}</p>
			</div>
		</div>

		<!-- Visuals/Projectors -->
		<div class="glass-panel rounded-2xl overflow-hidden relative group reveal active is-revealed">
			<div class="absolute inset-0 bg-gradient-to-t from-background via-background/50 to-transparent z-10"></div>
			<div 
				class="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1540575467063-178a50c2df87?q=80&w=2070&auto=format&fit=crop')] bg-cover bg-center transition-transform duration-700 group-hover:scale-105"
			></div>
			<div class="absolute bottom-0 left-0 p-6 z-20 w-full">
				<div class="w-10 h-10 rounded-full glass-panel flex items-center justify-center mb-3 backdrop-blur-md text-on-surface">
					<span class="material-symbols-outlined">videocam</span>
				</div>
				<h3 class="font-headline-md text-[24px] text-on-surface mb-1">{i18n.t.categories.visualTitle}</h3>
				<p class="font-body-md text-sm text-on-surface-variant">{i18n.t.categories.visualText}</p>
			</div>
		</div>

		<!-- Special Effects -->
		<div class="glass-panel rounded-2xl overflow-hidden relative group md:col-span-3 h-[200px] flex items-center px-8 reveal active is-revealed">
			<div class="absolute right-0 top-0 bottom-0 w-1/2 bg-gradient-to-l from-electric-blue/10 to-transparent opacity-50"></div>
			<div class="relative z-20 flex w-full justify-between items-center">
				<div>
					<h3 class="font-headline-md text-headline-md text-on-surface mb-2">{i18n.t.categories.fxTitle}</h3>
					<p class="font-body-md text-on-surface-variant max-w-lg">
						{i18n.t.categories.fxText}
					</p>
				</div>
				<a 
					href="/services"
					class="hidden md:flex w-16 h-16 rounded-full border border-border-glass items-center justify-center hover:bg-on-surface/5 active:scale-90 transition-all duration-300 text-on-surface"
				>
					<span class="material-symbols-outlined text-[32px] group-hover:translate-x-1 transition-transform">arrow_forward</span>
				</a>
			</div>
		</div>
	</div>
</section>
