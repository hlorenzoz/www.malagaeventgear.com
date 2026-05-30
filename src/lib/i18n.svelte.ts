import { browser } from '$app/environment';

export type Language = 'en' | 'es';

// Complete translation catalog for MEG site
export const translations = {
	en: {
		// Navigation
		nav: {
			equipment: 'Equipment',
			pricing: 'Pricing',
			blog: 'Blog',
			contact: 'Contact',
			bookNow: 'Book Now',
			brand: 'Malaga Event Gear'
		},
		// Hero
		hero: {
			span: 'For All Types of Events',
			titlePart1: 'Premium Audiovisual',
			titleGradient: 'Equipment Rental',
			titlePart2: 'in Malaga',
			subtitle: 'Experience crystal-clear sound and stunning lighting with our premium equipment. Perfect for weddings, corporate events, and exclusive parties on the Costa del Sol.',
			viewPricing: 'View Pricing',
			contactUs: 'Contact Us'
		},
		// Bento Info Cards
		bento: {
			card1Title: '#1 Flawless Setup',
			card1Text: 'Dedicated technical support to ensure your event runs smoothly from start to finish without any worries.',
			card2Title: '#2 Tailored Packages',
			card2Text: 'Flexible rental packages designed to perfectly fit any event size, venue, and budget.',
			card3Title: '#3 Cutting-Edge Tech',
			card3Text: 'Enjoy state-of-the-art audiovisual gear that elevates the visual and sound quality of your production.'
		},
		// Impact
		impact: {
			title: 'Our Impact in Numbers',
			years: 'Years of Experience',
			clients: 'Happy Clients',
			satisfaction: 'Satisfaction Rate'
		},
		// Categories
		categories: {
			badge: 'Premium Gear',
			title: 'Available Categories',
			soundTitle: 'Sound Systems',
			soundText: 'Crystal-clear high-fidelity sound, ideal for intimate weddings or large corporate conferences. We work with leading brands to ensure the highest acoustic fidelity.',
			lightTitle: 'Lighting',
			lightText: 'Dynamic lighting solutions to create the perfect atmosphere in your venue space.',
			visualTitle: 'Projectors & Screens',
			visualText: 'Sharp, high-definition visuals for presentations with high visual impact.',
			fxTitle: 'Special Effects & Fog Machines',
			fxText: 'Create a stunning atmosphere at your event with our professional-grade special effects and fog machines.',
			bookEquipment: 'Book Equipment'
		},
		// Pricing
		pricing: {
			badge: 'Transparent Pricing',
			title: 'Tailored Packages for Every Event',
			subtitle: 'Choose from our flexible rental packages designed to perfectly fit any event size and budget. We make planning simple!',
			includes: 'Includes:',
			includedServices: 'Included Services:',
			optional: 'Optional:',
			check: 'Check Availability',
			mostPopular: 'Most Popular',
			from: 'From',
			plusVat: '(+21% VAT)',
			plusVatShort: '(+VAT)',
			bookPack: 'Book'
		},
		// Contact
		contact: {
			badge: 'Immediate Response 24/7',
			title: 'Get in Touch',
			subtitle: 'Ready to elevate your event? Contact our technical team to receive tailored quotes, check equipment availability, and get expert advice.',
			detailsTitle: 'Contact Details',
			phone: 'Phone',
			whatsapp: 'WhatsApp',
			email: 'Email',
			location: 'Location',
			hours: 'Operating Hours',
			hoursText: 'Technical support and logistics 24 hours, 7 days a week.',
			reqTitle: 'Request a Quote',
			formName: 'Full Name *',
			formEmail: 'Email Address *',
			formPhone: 'Contact Phone',
			formDate: 'Event Date',
			formType: 'Event Type',
			formTypeWedding: 'Wedding / Celebration',
			formTypeCorporate: 'Corporate Event',
			formTypeParty: 'Private Party',
			formTypeMice: 'Conference / MICE',
			formTypeOther: 'Other type of event',
			formMessage: 'Event Details & Technical Requirements *',
			formSubmit: 'Send Request',
			formRequiredError: 'Please fill out all required fields.',
			successTitle: 'Quote Requested!',
			successText1: 'Hi',
			successText2: 'we received your request successfully. Our technical team in Malaga will evaluate it and contact you by email (',
			successText3: ') in less than 2 hours.',
			successButton: 'Send another request',
			faqTitle: 'Frequently Asked Questions'
		},
		// Packages Showcase
		packages: {
			badge: 'Featured Packages',
			title: 'Choose Your Perfect Pack',
			subtitle: 'Tailored for every occasion. All packages include transport, setup, and on-site technical support.',
			ecoTitle: 'Eco Pack',
			ecoPrice: '€290',
			ecoDesc: 'For private parties and small events up to 50 guests. Solid sound and ambient lighting.',
			ecoF1: '2 Active speakers',
			ecoF2: '1 Wired microphone',
			ecoF3: '2 RGBW LED light bars',
			weddingTitle: 'Wedding Pack',
			weddingPrice: '€650',
			weddingDesc: 'Magical sound and romantic lighting for up to 80 guests. Our most-loved celebration package.',
			weddingF1: 'High-end acoustic system',
			weddingF2: 'Romantic ambient lighting',
			weddingF3: 'Wireless microphones',
			miceTitle: 'MICE Pack',
			micePrice: '€490',
			miceDesc: 'Professional AV for conferences and corporate events. Includes a 60" LED screen and on-site technician.',
			miceF1: '60" LED screen',
			miceF2: 'Wireless audio system',
			miceF3: 'On-site technical support',
			enquire: 'Get a Quote'
		},
		// How It Works
		process: {
			badge: 'How It Works',
			title: 'Your Event in 4 Simple Steps',
			s1Title: 'Select Your Pack',
			s1Desc: 'Browse our packages and pick the one that fits your event size and style.',
			s2Title: 'Request a Quote',
			s2Desc: 'Fill out our quick form. We respond in under 2 hours with full availability.',
			s3Title: 'Confirm & Plan',
			s3Desc: 'Our team confirms logistics, venue access, and every technical detail.',
			s4Title: 'Enjoy Your Event',
			s4Desc: 'We handle setup, run the show, and pack everything up. Zero stress for you.'
		},
		// Pricing Preview
		pricingPreview: {
			badge: 'Transparent Pricing',
			title: 'Simple, All-Inclusive Pricing',
			subtitle: 'No hidden fees. Transport, setup, and technical support always included.',
			viewAll: 'View All Packages'
		},
		// FAQ
		faq: {
			badge: 'FAQ',
			title: 'Common Questions'
		},
		// Testimonials (Google reviews)
		testimonials: {
			badge: 'Client Reviews',
			title: 'Real Stories from Real Events',
			subtitle: 'Verified Google reviews from clients across the Costa del Sol.',
			ratingLabel: 'EXCELLENT',
			basedOn: 'Based on {n} reviews',
			poweredBy: 'Showing our latest reviews',
			readMore: 'Read more',
			readLess: 'Read less',
			seeAll: 'See all reviews',
			prevAria: 'Previous review',
			nextAria: 'Next review'
		}
	},
	es: {
		// Navigation
		nav: {
			equipment: 'Equipos',
			pricing: 'Precios',
			blog: 'Blog',
			contact: 'Contacto',
			bookNow: 'Reservar Ahora',
			brand: 'Malaga Event Gear'
		},
		// Hero
		hero: {
			span: 'Para Todo Tipo de Eventos',
			titlePart1: 'Alquiler de Equipos',
			titleGradient: 'Audiovisuales Premium',
			titlePart2: 'en Málaga',
			subtitle: 'Disfrutá de un sonido nítido y una iluminación espectacular con nuestros equipos premium. Ideal para bodas, eventos corporativos y fiestas exclusivas en la Costa del Sol.',
			viewPricing: 'Ver Precios',
			contactUs: 'Contactar'
		},
		// Bento Info Cards
		bento: {
			card1Title: '#1 Montaje Impecable',
			card1Text: 'Soporte técnico dedicado para asegurar que tu evento salga a la perfección de principio a fin sin preocupaciones.',
			card2Title: '#2 Paquetes a Medida',
			card2Text: 'Paquetes de alquiler flexibles diseñados para adaptarse perfectamente a cualquier tamaño de evento, lugar y presupuesto.',
			card3Title: '#3 Tecnología de Punta',
			card3Text: 'Disfrutá de equipos audiovisuales de última generación que elevan la calidad visual y acústica de tu producción.'
		},
		// Impact
		impact: {
			title: 'Nuestro Impacto en Números',
			years: 'Años de Experiencia',
			clients: 'Clientes Felices',
			satisfaction: 'Tasa de Satisfacción'
		},
		// Categories
		categories: {
			badge: 'Equipos Premium',
			title: 'Categorías Disponibles',
			soundTitle: 'Sistemas de Sonido',
			soundText: 'Sonido de alta fidelidad cristalino, ideal para bodas íntimas o grandes conferencias corporativas. Trabajamos con marcas líderes para asegurar la mayor fidelidad acústica.',
			lightTitle: 'Iluminación',
			lightText: 'Soluciones de iluminación dinámica para crear el ambiente perfecto en tu espacio.',
			visualTitle: 'Proyectores y Pantallas',
			visualText: 'Visuales nítidos de alta definición para presentaciones de gran impacto visual.',
			fxTitle: 'Efectos Especiales y Máquinas de Humo',
			fxText: 'Creá una atmósfera increíble en tu evento con nuestros efectos especiales y máquinas de humo de grado profesional.',
			bookEquipment: 'Reservar Equipos'
		},
		// Pricing
		pricing: {
			badge: 'Precios Transparentes',
			title: 'Paquetes a Medida para Cada Evento',
			subtitle: 'Elegí entre nuestros paquetes de alquiler flexibles diseñados para adaptarse a la perfección al presupuesto y dimensión de tu evento.',
			includes: 'Incluye:',
			includedServices: 'Servicios Incluidos:',
			optional: 'Opcional:',
			check: 'Consultar Disponibilidad',
			mostPopular: 'Más Popular',
			from: 'Desde',
			plusVat: '(+21% IVA)',
			plusVatShort: '(+IVA)',
			bookPack: 'Reservar'
		},
		// Contact
		contact: {
			badge: 'Respuesta Inmediata 24/7',
			title: 'Ponete en Contacto',
			subtitle: '¿Listo para elevar tu evento? Contactá a nuestro equipo técnico para recibir presupuestos personalizados, consultar disponibilidad de equipos y recibir asesoramiento experto.',
			detailsTitle: 'Detalles de Contacto',
			phone: 'Teléfono',
			whatsapp: 'WhatsApp',
			email: 'Email',
			location: 'Ubicación',
			hours: 'Horario de Atención',
			hoursText: 'Soporte técnico y logística las 24 horas, los 7 días de la semana.',
			reqTitle: 'Solicitar Presupuesto',
			formName: 'Nombre Completo *',
			formEmail: 'Correo Electrónico *',
			formPhone: 'Teléfono de Contacto',
			formDate: 'Fecha del Evento',
			formType: 'Tipo de Evento',
			formTypeWedding: 'Boda / Celebración',
			formTypeCorporate: 'Evento Corporativo',
			formTypeParty: 'Fiesta Privada',
			formTypeMice: 'Conferencia / MICE',
			formTypeOther: 'Otro tipo de evento',
			formMessage: 'Detalles del Evento y Requerimientos Técnicos *',
			formSubmit: 'Enviar Solicitud',
			formRequiredError: 'Por favor, completá todos los campos obligatorios.',
			successTitle: '¡Presupuesto Solicitado!',
			successText1: 'Hola',
			successText2: 'recibimos tu solicitud con éxito. Nuestro equipo técnico en Málaga la evaluará y te contactará por email (',
			successText3: ') en menos de 2 horas.',
			successButton: 'Enviar otra solicitud',
			faqTitle: 'Preguntas Frecuentes'
		},
		// Packages Showcase
		packages: {
			badge: 'Packs Destacados',
			title: 'Elegí Tu Pack Ideal',
			subtitle: 'Personalizados para cada ocasión. Todos incluyen transporte, montaje y soporte técnico en sitio.',
			ecoTitle: 'Eco Pack',
			ecoPrice: '€290',
			ecoDesc: 'Para fiestas privadas y eventos pequeños de hasta 50 personas. Sonido sólido e iluminación ambiental.',
			ecoF1: '2 Altavoces activos',
			ecoF2: '1 Micrófono de cable',
			ecoF3: '2 Barras de luz LED RGBW',
			weddingTitle: 'Pack Bodas',
			weddingPrice: '€650',
			weddingDesc: 'Sonido mágico e iluminación romántica para hasta 80 invitados. Nuestro pack de celebración más elegido.',
			weddingF1: 'Sistema acústico de alta gama',
			weddingF2: 'Iluminación ambiental romántica',
			weddingF3: 'Micrófonos inalámbricos',
			miceTitle: 'Pack MICE',
			micePrice: '€490',
			miceDesc: 'AV profesional para conferencias y eventos corporativos. Incluye pantalla LED 60" y técnico en sitio.',
			miceF1: 'Pantalla LED 60"',
			miceF2: 'Sistema de audio inalámbrico',
			miceF3: 'Soporte técnico en sitio',
			enquire: 'Solicitar Presupuesto'
		},
		// How It Works
		process: {
			badge: 'Cómo Funciona',
			title: 'Tu Evento en 4 Pasos Simples',
			s1Title: 'Elegí Tu Pack',
			s1Desc: 'Explorá nuestros paquetes y elegí el que mejor se adapta al tamaño y estilo de tu evento.',
			s2Title: 'Solicitá Presupuesto',
			s2Desc: 'Completá nuestro formulario rápido. Respondemos en menos de 2 horas con disponibilidad completa.',
			s3Title: 'Confirmamos & Planificamos',
			s3Desc: 'Nuestro equipo confirma la logística, el acceso al lugar y cada detalle técnico.',
			s4Title: 'Disfrutá Tu Evento',
			s4Desc: 'Nos encargamos del montaje, el show y el desmontaje. Cero estrés para vos.'
		},
		// Pricing Preview
		pricingPreview: {
			badge: 'Precios Transparentes',
			title: 'Precios Simples y Todo Incluido',
			subtitle: 'Sin costos ocultos. Transporte, montaje y soporte técnico siempre incluidos.',
			viewAll: 'Ver Todos los Packs'
		},
		// FAQ
		faq: {
			badge: 'FAQ',
			title: 'Preguntas Frecuentes'
		},
		// Testimonials (reseñas de Google)
		testimonials: {
			badge: 'Reseñas de Clientes',
			title: 'Historias Reales de Eventos Reales',
			subtitle: 'Reseñas verificadas de Google de clientes en toda la Costa del Sol.',
			ratingLabel: 'EXCELENTE',
			basedOn: 'Basado en {n} reseñas',
			poweredBy: 'Mostrando nuestras últimas reseñas',
			readMore: 'Leer más',
			readLess: 'Leer menos',
			seeAll: 'Ver todas las reseñas',
			prevAria: 'Reseña anterior',
			nextAria: 'Reseña siguiente'
		}
	}
} as const;

// Svelte 5 Rune-driven state for language
let currentLang = $state<Language>('en');

export const i18n = {
	get lang(): Language {
		return currentLang;
	},
	set lang(val: Language) {
		currentLang = val;
		if (browser) {
			try {
				localStorage.setItem('lang', val);
			} catch (_) {}
		}
	},
	get t() {
		return translations[currentLang];
	},
	init() {
		if (browser) {
			try {
				const saved = localStorage.getItem('lang');
				if (saved === 'en' || saved === 'es') {
					currentLang = saved;
				} else {
					// Auto detect language
					const navLang = navigator.language.split('-')[0];
					if (navLang === 'es') {
						currentLang = 'es';
					}
				}
			} catch (_) {}
		}
	}
};
