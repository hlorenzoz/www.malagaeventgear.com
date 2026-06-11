import { z } from 'zod';

// Localized string schema
const LocalizedTextSchema = z.object({
	en: z.string(),
	es: z.string()
});

// Localized array schema
const LocalizedListSchema = z.object({
	en: z.array(z.string()),
	es: z.array(z.string())
});

// Per-package landing page copy — every piece of bespoke, localized presentational
// content lives here so the single dynamic /packages/[slug] route stays data-driven
// while preserving full SEO/content parity with the original standalone pages.
const LandingSchema = z.object({
	badge: LocalizedTextSchema,
	rateLabel: LocalizedTextSchema,
	vatNote: LocalizedTextSchema,
	specIcon: z.string(),
	specTitle: LocalizedTextSchema,
	specBody: LocalizedTextSchema,
	highlightIcon: z.string().optional(),
	highlightTitle: LocalizedTextSchema,
	highlightBody: LocalizedTextSchema,
	includesLabel: LocalizedTextSchema,
	optionalLabel: LocalizedTextSchema.optional(),
	note: z
		.object({
			title: LocalizedTextSchema,
			body: LocalizedTextSchema
		})
		.optional(),
	ctaHeading: LocalizedTextSchema,
	ctaBody: LocalizedTextSchema,
	ctaButton: LocalizedTextSchema
});

// SEO metadata per package (page title + JSON-LD Service descriptors)
const SeoSchema = z.object({
	title: LocalizedTextSchema,
	serviceName: z.string(),
	serviceType: z.string()
});// Main package Zod schema
export const PackageSchema = z.object({
	id: z.string(),
	slug: z.string(),
	route: z.string(),
	name: z.string(),
	price: z.number(), // in EUR (excluding VAT)
	desc: LocalizedTextSchema,
	includes: LocalizedListSchema,
	optional: LocalizedListSchema.optional(),
	maxGuests: z.number().optional(),
	popular: z.boolean().optional(),
	image: z.string().optional(),
	seo: SeoSchema,
	landing: LandingSchema,
	category: z.enum(['social', 'corporate']),
	// Granular e-commerce filtering metadata (single source of truth for /packages/ filters)
	purpose: z.array(z.enum(['party', 'wedding', 'corporate', 'presentation', 'meeting'])),
	includeTags: z.array(
		z.enum(['transport', 'screen', 'sound', 'microphone', 'lighting', 'technician'])
	),
	optionalTags: z
		.array(z.enum(['projector', 'smoke-machine', 'technical-assistant', 'lectern', 'staging']))
		.optional()
});

export type EventPackage = z.infer<typeof PackageSchema>;

// Verified package inventory data matching live business catalog
const packagesData: EventPackage[] = [
	{
		id: 'eco',
		slug: 'eco',
		route: '/packages/eco/',
		name: 'Eco Pack',
		price: 290,
		image: '/images/packages/eco.webp',
		desc: {
			en: 'Ideal for private parties or small events of up to 50 guests. Includes basic solid sound and ambient lighting.',
			es: 'Ideal para fiestas privadas o eventos pequeños de hasta 50 personas. Incluye configuración básica de sonido e iluminación.'
		},
		includes: {
			en: [
				'2 High-quality active speakers with stands',
				'1 Wired dynamic microphone',
				'2 Light bars with RGBW LED spotlights',
				'Aesthetic cabling and professional setup'
			],
			es: [
				'2 Altavoces activos de alta calidad con soportes',
				'1 Micrófono dinámico de cable',
				'2 Barras de luz con focos LED RGBW',
				'Cableado estético y montaje profesional'
			]
		},
		optional: {
			en: ['Projector & projection screen (+50€)', 'Professional smoke/fog machine (+20€)'],
			es: [
				'Proyector y pantalla de proyección (+50€)',
				'Máquina de humo/niebla profesional (+20€)'
			]
		},
		maxGuests: 50,
		popular: false,
		category: 'social',
		purpose: ['party'],
		includeTags: ['sound', 'microphone', 'lighting', 'transport'],
		optionalTags: ['projector', 'smoke-machine'],
		seo: {
			title: {
				en: 'Eco Pack Speaker & Lighting Rental | Malaga Event Gear',
				es: 'Eco Pack Alquiler de Sonido e Iluminación | Malaga Event Gear'
			},
			serviceName: 'Eco Pack Rental Malaga - Malaga Event Gear (MEG)',
			serviceType: 'Audio visual event rentals for private parties'
		},
		landing: {
			badge: { en: 'Small Events & Parties', es: 'Eventos Pequeños y Fiestas' },
			rateLabel: { en: 'Affordable All-Inclusive Rate', es: 'Tarifa Todo Incluido Asequible' },
			vatNote: {
				en: '(+21% VAT) — Setup & transport included',
				es: '(+21% IVA) — Montaje y transporte incluidos'
			},
			specIcon: 'group',
			specTitle: { en: 'Up to 50 Guests', es: 'Hasta 50 Personas' },
			specBody: {
				en: 'Perfect for villas, gardens, and private rooms.',
				es: 'Perfecto para villas, jardines y salas privadas.'
			},
			highlightTitle: { en: 'Stress-Free Service', es: 'Servicio Libre de Estrés' },
			highlightBody: {
				en: 'We operate as a delivery-only model with direct setups. We bring the gear, install it professionally, test the sound and lights, and retrieve everything after the event.',
				es: 'Operamos como un modelo exclusivo de entrega y montaje directo. Llevamos los equipos, los instalamos profesionalmente, probamos el sonido y las luces, y retiramos todo después del evento.'
			},
			includesLabel: { en: 'What is Included', es: 'Qué Incluye' },
			optionalLabel: { en: 'Optional Extras', es: 'Extras Opcionales' },
			ctaHeading: { en: 'Secure Your Booking Today', es: 'Asegurá tu Reserva Hoy' },
			ctaBody: {
				en: 'Fill out our quick technical quote request to check package availability for your date. We get back to you as soon as possible!',
				es: 'Completá nuestra solicitud rápida de presupuesto técnico para consultar disponibilidad del paquete en tu fecha. ¡Respondemos lo antes posible!'
			},
			ctaButton: { en: 'Book This Package', es: 'Reservar Este Paquete' }
		}
	},
	{
		id: 'wedding',
		slug: 'wedding',
		route: '/packages/wedding/',
		name: 'Wedding Pack',
		price: 650,
		desc: {
			en: 'Designed to perfection for magical and unforgettable wedding celebrations. Includes a professional high-end acoustic system, romantic ambient lighting, and wireless microphones for moving speeches.',
			es: 'Diseñado a la perfección para celebraciones mágicas e inolvidables. Incluye sistema acústico profesional de alta gama, luces ambientales románticas y micrófonos inalámbricos para discursos emotivos.'
		},
		includes: {
			en: [
				'High-end active PA acoustic sound system for up to 80 guests',
				'Fairy lights / warm LED strings for romantic ambient lighting',
				'Professional wireless microphones for speeches and announcements',
				'Transport in Malaga and surrounding areas',
				'Professional aesthetic setup and cabling',
				'On-site live technical control and engineering support during the event',
				'Post-event rapid teardown and logistics pickup'
			],
			es: [
				'Sistema de sonido acústico PA activo de alta gama para hasta 80 invitados',
				'Guirnaldas de luces LED cálidas para iluminación ambiental romántica',
				'Micrófonos inalámbricos profesionales para discursos y anuncios',
				'Transporte en Málaga y áreas cercanas',
				'Montaje estético profesional y cableado limpio',
				'Asistencia técnica y control en directo durante todo el evento',
				'Desmontaje rápido post-evento y recogida logística'
			]
		},
		maxGuests: 80,
		popular: true,
		image: '/images/packages/wedding.webp',
		category: 'social',
		purpose: ['wedding', 'party'],
		includeTags: ['sound', 'microphone', 'lighting', 'transport', 'technician'],
		seo: {
			title: {
				en: 'Wedding Pack Sound & Romantic Lighting | Malaga Event Gear',
				es: 'Pack Bodas Sonido e Iluminación Romántica | Malaga Event Gear'
			},
			serviceName: 'Wedding Pack Audio & Lighting Rental Malaga - Malaga Event Gear (MEG)',
			serviceType: 'Audio visual wedding celebrations rentals'
		},
		landing: {
			badge: {
				en: 'Our Most Popular Celebration Pack',
				es: 'Nuestro Pack de Celebración Más Elegido'
			},
			rateLabel: { en: 'Premium All-Inclusive Rate', es: 'Tarifa Todo Incluido Premium' },
			vatNote: {
				en: '(+21% VAT) — Setup & live support included',
				es: '(+21% IVA) — Montaje y técnico incluidos'
			},
			specIcon: 'group',
			specTitle: { en: 'Up to 80 Guests', es: 'Hasta 80 Personas' },
			specBody: {
				en: 'Perfect for beautiful villas, fincas, and wedding hotels.',
				es: 'Perfecto para villas hermosas, fincas y hoteles de boda.'
			},
			highlightIcon: 'engineering',
			highlightTitle: { en: 'Live On-Site Technician', es: 'Técnico en Vivo en el Sitio' },
			highlightBody: {
				en: 'Never worry about microphone feedback or visual issues. This package includes full live on-site technical monitoring and acoustic adjustments throughout your banquet and speeches.',
				es: 'No te preocupes por acoples de micrófonos o fallos visuales. Este paquete incluye soporte técnico y monitoreo en directo durante el banquete y los discursos.'
			},
			includesLabel: { en: 'Premium Inclusions', es: 'Servicios Premium Incluidos' },
			ctaHeading: { en: 'Make Your Celebration Magic', es: 'Hacé tu Celebración Mágica' },
			ctaBody: {
				en: 'Bookings for weddings fill up quickly. Secure your date with our technical crew today to guarantee the finest sound and romantic lighting on your special day.',
				es: 'Las reservas de bodas se completan rápidamente. Asegurá tu fecha con nuestro equipo técnico hoy para garantizar el mejor sonido e iluminación romántica en tu gran día.'
			},
			ctaButton: { en: 'Book This Wedding Pack', es: 'Reservar Este Pack Bodas' }
		}
	},
	{
		id: 'presentation',
		slug: 'product-presentation',
		route: '/packages/product-presentation/',
		name: 'Product Presentation Pack',
		price: 310,
		image: '/images/packages/product-presentation.webp',
		desc: {
			en: 'Designed for corporate presentations, dealership showcases, and product launches with high visual impact.',
			es: 'Diseñado para presentaciones corporativas, exhibiciones en concesionarios y lanzamientos de productos con alto impacto visual.'
		},
		includes: {
			en: [
				'1 Front projection screen with stable stand',
				'1 Full HD laser projector (5000 lumens) for crisp visuals',
				'Venue sound system with 2 speakers & mixing console',
				'1 Premium wireless handheld microphone for speakers'
			],
			es: [
				'1 Pantalla de proyección frontal con soporte estable',
				'1 Proyector láser Full HD (5000 lúmenes) para imágenes nítidas',
				'Sistema de sonido para el lugar con 2 altavoces y mesa de mezclas',
				'1 Micrófono inalámbrico de mano premium para oradores'
			]
		},
		popular: false,
		category: 'corporate',
		purpose: ['presentation', 'corporate'],
		includeTags: ['sound', 'microphone', 'screen'],
		seo: {
			title: {
				en: 'Product Presentation Pack Laser Projection & Audio | Malaga Event Gear',
				es: 'Pack Lanzamiento de Productos Proyección y Audio | Malaga Event Gear'
			},
			serviceName: 'Product Presentation Pack Projection & Audio Malaga - Malaga Event Gear (MEG)',
			serviceType: 'Audio visual product showcase and launch rentals'
		},
		landing: {
			badge: {
				en: 'High Visual Impact Corporate Solutions',
				es: 'Soluciones Corporativas de Alto Impacto Visual'
			},
			rateLabel: { en: 'Presentation Pack Flat Rate', es: 'Tarifa Plana de Pack Lanzamientos' },
			vatNote: {
				en: '(+21% VAT) — Laser projector & screen included',
				es: '(+21% IVA) — Proyector láser y pantalla incluidos'
			},
			specIcon: 'videocam',
			specTitle: { en: 'High-Brightness Laser', es: 'Láser de Alto Brillo' },
			specBody: {
				en: '5000-Lumen HD Projector ideal for lit rooms.',
				es: 'Proyector HD de 5000 lúmenes ideal para salas iluminadas.'
			},
			highlightTitle: { en: 'Flawless Corporate Branding', es: 'Branding Corporativo Impecable' },
			highlightBody: {
				en: 'Maximize the attention of your dealership launch, hotel press release, or product showcase. Our professional setup aligns pristine graphic detail with high-performance speech amplification.',
				es: 'Maximizá la atención de tu lanzamiento en concesionario, rueda de prensa en hotel o exhibición de producto. Nuestro montaje alinea un detalle gráfico impecable con amplificación de voz de alto rendimiento.'
			},
			includesLabel: { en: 'What is Included', es: 'Qué Incluye' },
			note: {
				title: { en: 'Setup & Connection Support', es: 'Soporte de Conexión y Montaje' },
				body: {
					en: 'We provide all necessary adapters (HDMI, USB-C) and audio interfaces to connect your company laptops, tablets, or players seamlessly.',
					es: 'Proporcionamos todos los adaptadores necesarios (HDMI, USB-C) e interfaces de audio para conectar tus laptops, tablets o reproductores corporativos sin problemas.'
				}
			},
			ctaHeading: { en: 'Elevate Your Product Showcase', es: 'Elevá el Lanzamiento de tu Producto' },
			ctaBody: {
				en: 'Give your audience the visual clarity and professional sound they deserve. Contact our technical team today to confirm availability.',
				es: 'Dale a tu audiencia la claridad visual y el sonido profesional que merecen. Contactá a nuestro equipo técnico hoy para confirmar disponibilidad.'
			},
			ctaButton: { en: 'Book This Presentation Pack', es: 'Reservar Este Pack Lanzamientos' }
		}
	},
	{
		id: 'mice-basic',
		slug: 'basic-mice',
		route: '/packages/basic-mice/',
		name: 'Basic MICE Pack',
		price: 295,
		image: '/images/packages/basic-mice.webp',
		desc: {
			en: 'Essential, high-performance audiovisual setup for small executive meetings, conferences, and presentations up to 40 guests.',
			es: 'Configuración audiovisual esencial y de alto rendimiento para pequeñas reuniones ejecutivas, conferencias y discursos de hasta 40 invitados.'
		},
		includes: {
			en: [
				'2x2m Projection screen with high-brightness 3000-lumen projector',
				'Basic crystal-clear sound reinforcement system for up to 40 people',
				'1 Professional gooseneck microphone for podium/lectern',
				'Logistics transport, setup, and aesthetic wiring'
			],
			es: [
				'Pantalla de proyección de 2x2m con proyector de 3000 lúmenes de alto brillo',
				'Sistema de refuerzo de sonido básico y cristalino para hasta 40 personas',
				'1 Micrófono de cuello de cisne profesional para atril/podio',
				'Transporte logístico, montaje y cableado estético'
			]
		},
		optional: {
			en: ['Dedicated on-site live technical assistant (+240€/day)'],
			es: ['Asistente técnico especializado en directo en el sitio (+240€/día)']
		},
		maxGuests: 40,
		popular: false,
		category: 'corporate',
		purpose: ['corporate', 'meeting'],
		includeTags: ['sound', 'microphone', 'screen', 'transport'],
		optionalTags: ['technical-assistant'],
		seo: {
			title: {
				en: 'Basic MICE Pack Corporate Meeting AV | Malaga Event Gear',
				es: 'Pack MICE Básico Equipamiento de Reuniones | Malaga Event Gear'
			},
			serviceName: 'Basic MICE Pack Speaker & Projector Rental - Malaga Event Gear (MEG)',
			serviceType: 'Audio visual MICE corporate meeting rentals'
		},
		landing: {
			badge: {
				en: 'Essential Executive Meeting Packages',
				es: 'Paquetes de Reunión Ejecutiva Esenciales'
			},
			rateLabel: { en: 'Corporate Meeting Flat Rate', es: 'Tarifa Plana de Reuniones Corporativas' },
			vatNote: {
				en: '(+21% VAT) — Setup & transport included',
				es: '(+21% IVA) — Montaje y transporte incluidos'
			},
			specIcon: 'group',
			specTitle: { en: 'Up to 40 Guests', es: 'Hasta 40 Personas' },
			specBody: {
				en: 'Designed for boardrooms, private salons, and hotel suites.',
				es: 'Diseñado para salas de juntas, salones privados y suites de hotel.'
			},
			highlightTitle: { en: 'Clear Speech Intelligibility', es: 'Inteligibilidad de Voz Clara' },
			highlightBody: {
				en: 'Professional gooseneck microphone configuration guarantees absolute clarity for board addresses, press announcements, or investor panels without echo or feedback.',
				es: 'La configuración de micrófono de cuello de cisne profesional garantiza una claridad absoluta para discursos de junta directiva, anuncios de prensa o paneles de inversores.'
			},
			includesLabel: { en: 'What is Included', es: 'Qué Incluye' },
			optionalLabel: { en: 'Optional Support', es: 'Soporte Opcional' },
			ctaHeading: { en: 'Plan Your Executive Meeting', es: 'Planificá tu Reunión Ejecutiva' },
			ctaBody: {
				en: 'Coordinate seamless corporate AV logistics with Malaga Event Gear. Connect with our experts to secure a professional boardroom experience.',
				es: 'Coordiná una logística audiovisual corporativa fluida con Malaga Event Gear. Conectate con nuestros expertos para asegurar una experiencia de sala de juntas profesional.'
			},
			ctaButton: { en: 'Book Basic MICE Pack', es: 'Reservar Pack MICE Básico' }
		}
	},
	{
		id: 'mice-full',
		slug: 'mice',
		route: '/packages/mice/',
		name: 'MICE Pack',
		price: 490,
		image: '/images/packages/mice.webp',
		desc: {
			en: 'Comprehensive corporate MICE solution featuring a large-format display screen, premium active sound reinforcement, wireless podium microphones, and dedicated live technician support.',
			es: 'Solución corporativa MICE completa con pantalla de gran formato, refuerzo de sonido activo premium, micrófonos inalámbricos para atril y soporte de técnico en directo dedicado.'
		},
		includes: {
			en: [
				'Premium 60-inch high-definition LED display screen with designer stand',
				'Professional active speakers and high-performance sound system',
				'1 Gooseneck microphone + 1 wireless handheld microphone',
				'1 Dedicated specialized live AV technician (up to 6 hours continuous support)',
				'Logistics delivery, custom wiring setup, and post-event teardown'
			],
			es: [
				'Pantalla LED de alta definición premium de 60 pulgadas con soporte de diseño',
				'Altavoces activos profesionales y sistema de sonido de alto rendimiento',
				'1 Micrófono de cuello de cisne + 1 micrófono inalámbrico de mano',
				'1 Técnico audiovisual en vivo especializado dedicado (hasta 6 horas de soporte continuo)',
				'Entrega logística, configuración de cableado a medida y desmontaje post-evento'
			]
		},
		optional: {
			en: [
				'Additional live technical assistant support hour (+40€/h)',
				'Premium methacrylate/acrylic modern lectern (+50€)',
				'Modular stage platforms / staging (+35€ per square meter)'
			],
			es: [
				'Hora adicional de soporte técnico audiovisual en vivo (+40€/h)',
				'Atril moderno de metacrilato/acrílico premium (+50€)',
				'Tarimas de escenario modulares / plataformas (+35€ por metro cuadrado)'
			]
		},
		maxGuests: 120,
		popular: false,
		category: 'corporate',
		purpose: ['corporate', 'meeting'],
		includeTags: ['sound', 'microphone', 'screen', 'transport', 'technician'],
		optionalTags: ['lectern', 'staging', 'technical-assistant'],
		seo: {
			title: {
				en: 'MICE Pack Corporate AV with LED Display & Technician | Malaga Event Gear',
				es: 'Pack MICE Corporativo con Pantalla LED y Técnico | Malaga Event Gear'
			},
			serviceName: 'MICE Pack LED Display, Sound & Live Technician Rental - Malaga Event Gear (MEG)',
			serviceType: 'Audio visual MICE corporate event rentals with live technician'
		},
		landing: {
			badge: {
				en: 'Premium Corporate MICE Experience',
				es: 'Experiencia MICE Corporativa Premium'
			},
			rateLabel: { en: 'All-Inclusive Corporate Rate', es: 'Tarifa Corporativa Todo Incluido' },
			vatNote: {
				en: '(+21% VAT) — LED display, sound & live technician included',
				es: '(+21% IVA) — Pantalla LED, sonido y técnico en directo incluidos'
			},
			specIcon: 'connected_tv',
			specTitle: { en: '60-inch LED Display', es: 'Pantalla LED de 60 Pulgadas' },
			specBody: {
				en: 'High-definition large-format screen for impactful corporate visuals.',
				es: 'Pantalla de gran formato en alta definición para visuales corporativos de impacto.'
			},
			highlightIcon: 'engineering',
			highlightTitle: { en: 'Dedicated Live Technician', es: 'Técnico en Directo Dedicado' },
			highlightBody: {
				en: 'A specialized AV technician runs your event for up to 6 continuous hours, guaranteeing flawless sound, visuals, and microphone management throughout your summit, conference, or product launch.',
				es: 'Un técnico audiovisual especializado opera tu evento durante hasta 6 horas continuas, garantizando sonido, visuales y gestión de micrófonos impecables durante tu cumbre, conferencia o lanzamiento.'
			},
			includesLabel: { en: 'Premium Inclusions', es: 'Servicios Premium Incluidos' },
			optionalLabel: { en: 'Optional Add-ons', es: 'Extras Opcionales' },
			ctaHeading: { en: 'Power Your Corporate Event', es: 'Potenciá tu Evento Corporativo' },
			ctaBody: {
				en: 'Deliver a flawless corporate experience with premium AV and dedicated technical support. Contact our team today to confirm availability for your date.',
				es: 'Brindá una experiencia corporativa impecable con audiovisual premium y soporte técnico dedicado. Contactá a nuestro equipo hoy para confirmar disponibilidad en tu fecha.'
			},
			ctaButton: { en: 'Book MICE Package', es: 'Reservar Paquete MICE' }
		}
	}
];

// Validate all packages at runtime using Zod to ensure complete type safety and data integrity
export const packages: EventPackage[] = packagesData.map((pkg) => {
	const result = PackageSchema.safeParse(pkg);
	if (!result.success) {
		console.error(`Invalid package configuration for ID: ${pkg.id}`, result.error.format());
		throw new Error(`Invalid package configuration: ${result.error.message}`);
	}
	return result.data;
});

export const getPackageBySlug = (slug: string): EventPackage | undefined => {
	return packages.find((pkg) => pkg.slug === slug);
};

/**
 * Category/keyword → package slug mapping table.
 * Rules are checked in order; first match wins.
 * Each rule has category keywords (matched against post.categories) and
 * title/tag keywords (matched against post.title and post.tags).
 */
const PACKAGE_RULES: {
	/** Patterns to match against category names (case-insensitive substring) */
	categoryPatterns?: RegExp[];
	/** Patterns to match against title and tags (case-insensitive substring) */
	keywordPatterns?: RegExp[];
	/** Patterns to match against the post slug (clean, single-topic signal) */
	slugPatterns?: RegExp[];
	/** Package slug to resolve when this rule matches */
	slug: string;
}[] = [
	// Weddings
	{
		categoryPatterns: [/\bwedding/i],
		keywordPatterns: [/\bwedding\b/i],
		slug: 'wedding'
	},
	// Product presentations / launches / seminars / training / virtual / remote.
	// El slug es la señal limpia (los títulos mezclan temas, p. ej. "Press Conferences
	// AND Corporate Events"), por eso va PRIMERO entre las reglas de eventos.
	{
		slugPatterns: [
			/seminar/,
			/training/,
			/virtual/,
			/remote/,
			/presentation/,
			/launch/,
			/webinar/,
			/press-conference/
		],
		keywordPatterns: [
			/\bpresentation\b/i,
			/\bproduct\s+launch\b/i,
			/\blaunch\b/i,
			/\bseminar/i,
			/\bwebinar/i,
			/\btraining\b/i,
			/\bvirtual\b/i
		],
		slug: 'product-presentation'
	},
	// MICE de mayor porte: galas, eventos deportivos, eventos corporativos.
	{
		slugPatterns: [/gala/, /sports/, /corporate-event/],
		keywordPatterns: [/\bgala\b/i, /\bsports?\b/i],
		slug: 'mice'
	},
	// Música / conciertos / performances → eco (social, centrado en sonido).
	{
		slugPatterns: [/music/, /performance/, /concert/],
		keywordPatterns: [/\bconcert\b/i],
		slug: 'eco'
	},
	// Corporate / MICE / Events / Conferences / Meetings — catch-all amplio para el
	// resto de eventos genéricos (el sitio viejo los mandaba a /pricing/).
	{
		categoryPatterns: [/\bcorporate\b/i, /\bmice\b/i, /\bevent/i, /\bconference/i, /\bmeeting/i],
		slug: 'basic-mice'
	}
	// Default: eco (handled separately below)
];

/**
 * Resolves the most relevant EventPackage for a given blog post.
 *
 * Matching strategy (in order):
 * 1. Check post.categories against categoryPatterns for each rule
 * 2. Check post.tags and post.title against keywordPatterns for each rule
 * 3. Fallback: 'eco' package
 *
 * @param post - A BlogPost (or minimal subset with categories, tags, title)
 * @returns The most relevant EventPackage
 */
export function resolvePackageForPost(post: {
	categories: string[];
	tags: string[];
	title: string;
	slug?: string;
	isNews?: boolean;
}): EventPackage {
	for (const rule of PACKAGE_RULES) {
		// Check slug first — it's the cleanest single-topic signal, so a specific
		// slug (e.g. ".../seminars") wins over the broad category catch-all below.
		if (rule.slugPatterns && post.slug) {
			const matched = rule.slugPatterns.some((pattern) => pattern.test(post.slug!));
			if (matched) {
				const pkg = packages.find((p) => p.slug === rule.slug);
				if (pkg) return pkg;
			}
		}

		// Check categories
		if (rule.categoryPatterns) {
			const matched = post.categories.some((cat) =>
				rule.categoryPatterns!.some((pattern) => pattern.test(cat))
			);
			if (matched) {
				const pkg = packages.find((p) => p.slug === rule.slug);
				if (pkg) return pkg;
			}
		}

		// Check title and tags for keyword patterns
		if (rule.keywordPatterns) {
			const searchStrings = [post.title, ...post.tags];
			const matched = searchStrings.some((str) =>
				rule.keywordPatterns!.some((pattern) => pattern.test(str))
			);
			if (matched) {
				const pkg = packages.find((p) => p.slug === rule.slug);
				if (pkg) return pkg;
			}
		}
	}

	// Default fallback: eco pack
	return packages.find((p) => p.slug === 'eco')!;
}

/**
 * Per-package relevance signals (mirror PACKAGE_RULES, but one entry per package so each
 * can be scored independently). Used by getPackagesForPost to rank the rail by relevance.
 * `slug` mirrors PACKAGE_RULES.slugPatterns — the cleanest single-topic signal, so it
 * carries the highest weight in scorePackage and keeps the rail consistent with the CTA.
 */
const PACKAGE_SIGNALS: Record<string, { slug: RegExp[]; category: RegExp[]; keyword: RegExp[] }> = {
	wedding: {
		slug: [/wedding/],
		category: [/\bwedding/i],
		keyword: [/\bwedding\b/i, /\bbride/i, /\bceremony\b/i, /\breception\b/i]
	},
	'basic-mice': {
		// No slug rule in PACKAGE_RULES — basic-mice is the broad category catch-all.
		slug: [],
		category: [/\bcorporate\b/i, /\bmice\b/i, /\bevent/i, /\bconference/i, /\bmeeting/i],
		keyword: [/\bcorporate\b/i, /\bconference/i, /\bmeeting/i, /\bseminar/i, /\bmice\b/i]
	},
	mice: {
		slug: [/gala/, /sports/, /corporate-event/],
		category: [/\bcorporate\b/i, /\bmice\b/i, /\bevent/i, /\bconference/i, /\bmeeting/i],
		keyword: [/\bgala\b/i, /\bsports?\b/i, /\bcorporate\b/i, /\bconference/i, /\bmice\b/i]
	},
	'product-presentation': {
		slug: [/seminar/, /training/, /virtual/, /remote/, /presentation/, /launch/, /webinar/, /press-conference/],
		category: [/\bcorporate\b/i, /\bpresentation\b/i, /\blaunch\b/i],
		keyword: [/\bpresentation\b/i, /\bproduct\s+launch\b/i, /\blaunch\b/i, /\bseminar/i, /\bwebinar/i, /\btraining\b/i, /\bvirtual\b/i, /\bshowcase\b/i, /\bdealership\b/i, /\bproduct\b/i]
	},
	eco: {
		slug: [/music/, /performance/, /concert/],
		category: [/\bparty\b/i, /\bprivate\b/i, /\bcelebration\b/i],
		keyword: [/\bparty\b/i, /\bbirthday\b/i, /\bcelebration\b/i, /\bbudget\b/i, /\bprivate\b/i, /\bmusic\b/i, /\bconcert\b/i]
	}
};

/**
 * Relevance score of a package for a post.
 * Weights: slug match = 4 (strongest, mirrors the resolver), category match = 3,
 * title keyword = 2, each tag keyword = 1.
 */
function scorePackage(
	slug: string,
	post: { categories: string[]; tags: string[]; title: string; slug?: string }
): number {
	const sig = PACKAGE_SIGNALS[slug];
	if (!sig) return 0;
	let score = 0;
	if (post.slug && sig.slug.some((re) => re.test(post.slug!))) score += 4;
	for (const cat of post.categories) {
		if (sig.category.some((re) => re.test(cat))) score += 3;
	}
	if (sig.keyword.some((re) => re.test(post.title))) score += 2;
	for (const tag of post.tags) {
		if (sig.keyword.some((re) => re.test(tag))) score += 1;
	}
	return score;
}

/**
 * Returns ALL packages ordered by relevance to the post:
 * the resolved (most relevant) package first — matching resolvePackageForPost so the rail
 * stays consistent with the PostCTA — then the rest sorted by relevance score (desc),
 * with catalog order as a stable tiebreaker.
 *
 * @param post - A BlogPost (or minimal subset with categories, tags, title)
 * @returns Every EventPackage exactly once, most relevant first.
 */
export function getPackagesForPost(post: {
	categories: string[];
	tags: string[];
	title: string;
	slug?: string;
	isNews?: boolean;
}): EventPackage[] {
	const resolved = resolvePackageForPost(post);
	const catalogIndex = new Map(packages.map((p, i) => [p.slug, i]));
	const others = packages
		.filter((p) => p.slug !== resolved.slug)
		.sort((a, b) => {
			const diff = scorePackage(b.slug, post) - scorePackage(a.slug, post);
			if (diff !== 0) return diff;
			return catalogIndex.get(a.slug)! - catalogIndex.get(b.slug)!;
		});
	return [resolved, ...others];
}
