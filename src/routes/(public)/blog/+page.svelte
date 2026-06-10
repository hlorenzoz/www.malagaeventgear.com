<script lang="ts">
	import SeoHead from '$lib/components/seo/SeoHead.svelte';
	import Icon from '$lib/components/navigation/Icon.svelte';
	import Testimonials from '$lib/components/testimonials/Testimonials.svelte';
	import { i18n } from '$lib/i18n.svelte';
	import { slugify } from '$lib/utils/slugify';
	import type { PageData } from './$types';

	// Clusters temáticos que cubre el blog (decorativos, fieles al diseño original).
	const clusters = [
		{ icon: 'favorite', en: 'Weddings', es: 'Bodas' },
		{ icon: 'business', en: 'Corporate AV', es: 'MICE Corporativo' },
		{ icon: 'speaker', en: 'Sound Acoustics', es: 'Acústica y Sonido' },
		{ icon: 'highlight', en: 'Scenic Lights', es: 'Luces Escénicas' },
		{ icon: 'videocam', en: 'Laser Projection', es: 'Proyección Láser' },
		{ icon: 'celebration', en: 'Private Parties', es: 'Fiestas Privadas' }
	];

	let { data }: { data: PageData } = $props();

	let posts = $derived(data.posts);

	let blogSchema = $derived({
		'@context': 'https://schema.org',
		'@type': 'CollectionPage',
		'@id': 'https://malagaeventgear.com/blog/#webpage',
		'url': 'https://malagaeventgear.com/blog/',
		'name': i18n.lang === 'en'
			? 'Audiovisual & Events Blog | MEG'
			: 'Blog Audiovisual y de Eventos | MEG',
		'isPartOf': {
			'@type': 'WebSite',
			'@id': 'https://malagaeventgear.com/#website',
			'url': 'https://malagaeventgear.com/',
			'name': 'Malaga Event Gear'
		},
		'description': i18n.lang === 'en'
			? 'Expert technical guides, audiovisual rental advice, and wedding planning insights for Malaga and Costa del Sol.'
			: 'Guías técnicas expertas, consejos de alquiler audiovisual e ideas de planificación de bodas para Málaga y la Costa del Sol.',
		'numberOfItems': posts.length
	});

	function formatDate(dateStr: string): string {
		try {
			return new Date(dateStr).toLocaleDateString(i18n.lang === 'es' ? 'es-ES' : 'en-GB', {
				year: 'numeric',
				month: 'long',
				day: 'numeric'
			});
		} catch {
			return dateStr;
		}
	}
</script>

<SeoHead
	title={i18n.lang === 'en'
		? 'Expert Audiovisual & Events Blog | Malaga Event Gear'
		: 'Blog Experto de Audiovisuales y Eventos | Malaga Event Gear'}
	description={i18n.lang === 'en'
		? 'Read expert insights on high-fidelity sound, romantic wedding lighting, conference projector setups, and professional event gear in Malaga.'
		: 'Leé consejos expertos sobre sonido de alta fidelidad, iluminación romántica para bodas, configuraciones de proyectores de congresos y equipos para eventos en Málaga.'}
	canonicalUrl="https://malagaeventgear.com/blog/"
	jsonLdSchema={blogSchema}
/>

<!-- Hero & Presentation Section -->
<section class="relative px-margin-mobile md:px-margin-desktop py-20 md:py-32 max-w-container-max mx-auto text-center flex flex-col items-center justify-center overflow-hidden">
	<!-- Dynamic Ambient Glow Backgrounds -->
	<div class="absolute -top-40 left-1/4 w-[500px] h-[500px] bg-electric-blue rounded-full blur-[140px] opacity-15 pointer-events-none"></div>
	<div class="absolute -bottom-40 right-1/4 w-[400px] h-[400px] bg-primary rounded-full blur-[140px] opacity-10 pointer-events-none"></div>

	<span class="font-label-lg text-electric-blue uppercase tracking-[0.2em] mb-4 block reveal active is-revealed">
		{i18n.lang === 'en' ? 'Knowledge & Inspiration' : 'Conocimiento e Inspiración'}
	</span>
	<h1 class="font-headline-lg-mobile md:font-display-lg text-headline-lg-mobile md:text-display-lg text-on-surface mb-6 max-w-4xl mx-auto leading-tight reveal active is-revealed">
		{i18n.lang === 'en' ? 'The Malaga Event Gear' : 'El Blog de'} <span class="text-transparent bg-clip-text bg-linear-to-r from-primary to-electric-blue">{i18n.lang === 'en' ? 'Technical Blog' : 'Malaga Event Gear'}</span>
	</h1>
	<p class="font-body-lg text-body-lg text-on-surface-variant max-w-2xl mx-auto mb-10 reveal active is-revealed" style="transition-delay: 100ms;">
		{i18n.lang === 'en'
			? 'We share professional insights, acoustic blueprints, and visual layout guides to make your corporate summit, wedding, or celebration on the Costa del Sol technically flawless.'
			: 'Compartimos ideas profesionales, planos acústicos y guías de diseño visual para que tu congreso corporativo, boda o fiesta en la Costa del Sol sea técnicamente impecable.'}
	</p>
</section>

<!-- Posts Grid -->
<section class="px-margin-mobile md:px-margin-desktop pb-24 max-w-container-max mx-auto">
	{#if posts.length === 0}
		<p class="text-center text-on-surface-variant font-body-lg">
			{i18n.lang === 'en' ? 'No posts yet. Check back soon!' : '¡Aún no hay artículos. Volvé pronto!'}
		</p>
	{:else}
		<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
			{#each posts as post, i}
				<!-- content-visibility:auto deja que el navegador SALTE render/layout/paint de las cards
				     fuera de viewport (sin sacarlas del DOM → SEO intacto). La primera card queda exenta:
				     está above-the-fold y es dueña de la imagen LCP (eager). contain-intrinsic-size con
				     `auto` recuerda el alto real una vez renderizada → CLS se mantiene en 0. -->
				<article
					data-testid="post-card"
					class="relative bg-surface-container-low border border-border-glass rounded-[20px] overflow-hidden hover:border-electric-blue/40 transition-colors duration-300 flex flex-col {i === 0 ? '' : '[content-visibility:auto] [contain-intrinsic-size:auto_420px]'}"
				>
					<!-- Cover Image -->
					{#if post.coverImage}
						<a href="/blog/{post.slug}/" class="block aspect-video overflow-hidden">
							<img
								src={post.coverImageThumb ?? post.coverImage}
								srcset={post.coverImageSrcset}
								sizes="(min-width: 1024px) 370px, (min-width: 768px) 45vw, calc(100vw - 2rem)"
								alt={post.title}
								width="370"
								height="208"
								class="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
								loading={i === 0 ? 'eager' : 'lazy'}
								fetchpriority={i === 0 ? 'high' : undefined}
							/>
						</a>
					{/if}

					<div class="p-6 flex flex-col flex-1">
						<!-- Categories + News badge -->
						<div class="flex flex-wrap items-center gap-2 mb-3">
							{#if post.isNews}
								<span class="px-2 py-0.5 rounded-full text-xs font-label-sm bg-electric-blue-strong text-white uppercase tracking-wider">
									{i18n.lang === 'en' ? 'News' : 'Noticias'}
								</span>
							{/if}
							{#each post.categories as category}
								<a
									href="/blog/category/{slugify(category)}/"
									class="text-xs font-label-sm text-electric-blue uppercase tracking-wider hover:underline"
								>
									{category}
								</a>
							{/each}
						</div>

						<!-- Title -->
						<h2 class="font-headline-sm text-headline-sm text-on-surface mb-3 leading-tight">
							<a href="/blog/{post.slug}/" class="hover:text-electric-blue transition-colors">
								{post.title}
							</a>
						</h2>

						<!-- Excerpt -->
						{#if post.excerpt}
							<p class="font-body-sm text-body-sm text-on-surface-variant mb-4 flex-1 line-clamp-3">
								{post.excerpt}
							</p>
						{/if}

						<!-- Meta: date + read more -->
						<div class="flex items-center justify-between mt-auto pt-4 border-t border-border-glass">
							<time datetime={post.publishDate} class="text-xs text-on-surface-variant">
								{formatDate(post.publishDate)}
							</time>
							<a
								href="/blog/{post.slug}/"
								class="text-xs font-label-sm text-electric-blue hover:underline uppercase tracking-wider"
							>
								{i18n.lang === 'en' ? 'Read More →' : 'Leer Más →'}
							</a>
						</div>
					</div>
				</article>
			{/each}
		</div>
	{/if}
</section>

<!-- Core Clusters We Cover + CTAs -->
<section data-testid="blog-clusters" class="px-margin-mobile md:px-margin-desktop py-16 md:py-24 max-w-4xl mx-auto border-t border-border-glass">
	<div class="relative flex flex-col items-center text-center">
		<!-- Ambient glow -->
		<div class="absolute -inset-x-10 -top-10 h-64 bg-electric-blue rounded-full blur-[160px] opacity-10 pointer-events-none"></div>

		<h2 class="relative z-10 font-label-sm text-electric-blue uppercase tracking-widest mb-8">
			{i18n.lang === 'en' ? 'Core Clusters We Cover' : 'Temáticas Principales que Cubrimos'}
		</h2>

		<div class="relative z-10 w-full grid grid-cols-2 md:grid-cols-3 gap-4">
			{#each clusters as cluster}
				<div class="p-6 rounded-2xl bg-surface-container-low border border-border-glass backdrop-blur-md flex flex-col items-center gap-3 hover:border-electric-blue/40 transition-colors duration-300">
					<Icon name={cluster.icon} size="28" className="text-on-surface" />
					<span class="font-label-sm text-on-surface">
						{i18n.lang === 'en' ? cluster.en : cluster.es}
					</span>
				</div>
			{/each}
		</div>

		<div class="relative z-10 flex flex-col sm:flex-row items-center gap-4 mt-12 w-full justify-center">
			<a
				href="/contact/"
				class="w-full sm:w-auto px-8 py-3 rounded-full bg-electric-blue-strong text-white font-label-lg uppercase tracking-wider hover:shadow-lg hover:shadow-electric-blue/30 active:scale-95 transition-all duration-300 flex items-center justify-center gap-2"
			>
				{i18n.lang === 'en' ? 'Get Technical Advice' : 'Asesoramiento Técnico Gratis'}
				<Icon name="arrow_forward" size="18" />
			</a>
			<a
				href="/packages/"
				class="w-full sm:w-auto px-8 py-3 rounded-full border border-border-glass text-on-surface font-label-lg uppercase tracking-wider hover:bg-on-surface/5 active:scale-95 transition-all duration-300 flex items-center justify-center"
			>
				{i18n.lang === 'en' ? 'Explore Packages' : 'Explorar Paquetes'}
			</a>
		</div>
	</div>
</section>

<!-- Google My Business reviews carousel (reused component) -->
<Testimonials />
