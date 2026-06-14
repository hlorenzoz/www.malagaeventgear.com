import { browser } from '$app/environment';

export type Language = 'en' | 'es';

// Complete translation catalog for MEG site
export const translations = {
	en: {
		// Navigation
		nav: {
			equipment: 'Equipment',
			packages: 'Packages',
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
		// Overview (At a Glance — answer-engine optimization)
		overview: {
			badge: 'At a Glance',
			sellQ: 'What do we sell?',
			sellA: 'We rent premium audiovisual equipment — professional sound systems, stage lighting, projectors and screens — for events across Malaga and the Costa del Sol, including delivery, setup and on-site technical support.',
			whoQ: 'Who is it for?',
			whoA: 'Couples planning weddings, companies running conferences and corporate events, and anyone hosting a party or private celebration who wants flawless sound and lighting without buying the gear.',
			costQ: 'What does it cost?',
			costA: 'fixed-price packages with no hidden fees, scaled to your event size, plus tailored quotes for larger productions.',
			costFrom: 'From',
			howQ: 'How does it work?',
			howA: 'Four simple steps: pick your package, request a quote, we confirm and prepare your gear, and our team delivers and sets everything up on the day of your event.'
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
			bookEquipment: 'Book Packages'
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
		// Packages filters (e-commerce)
		filters: {
			title: 'Filters',
			clearAll: 'Clear all',
			resetFilters: 'Reset Filters',
			showingResults: 'Showing {visible} of {total} packages',
			noResults: 'No packages match your filters. Try clearing some selections!',
			openFilters: 'Filters',
			done: 'Show results',
			purpose: 'Event Type',
			capacity: 'Event Scale',
			price: 'Budget',
			equipment: 'Equipment Included',
			extras: 'Optional Add-ons',
			sortBy: 'Sort By',
			party: 'Parties',
			wedding: 'Weddings',
			corporate: 'Corporate',
			presentation: 'Presentations',
			meeting: 'Meetings',
			small: 'Small (up to 50 guests)',
			medium: 'Medium (51–80 guests)',
			large: 'Large (80+ guests)',
			priceLow: 'Up to 300€',
			priceMid: '300€ – 500€',
			priceHigh: '500€ and up',
			transport: 'Transport & Setup',
			screen: 'Screen / Display',
			sound: 'Sound System',
			microphone: 'Microphones',
			lighting: 'Ambient Lighting',
			technician: 'Live Technician',
			projector: 'Projector',
			smokeMachine: 'Smoke Machine',
			technicalAssistant: 'Technical Assistant',
			lectern: 'Lectern',
			staging: 'Staging',
			recommended: 'Recommended',
			priceAsc: 'Price: Low to High',
			priceDesc: 'Price: High to Low'
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
			formSubmitting: 'Sending...',
			formRequiredError: 'Please fill out all required fields.',
			formErrorSubmit: 'Something went wrong sending your request. Please try again or email us directly.',
			formErrorTurnstile: 'Security verification failed. Please try again.',
			formErrorRateLimited: 'Too many requests. Please wait a few minutes and try again.',
			lockedFieldNote: "Auto-generated from an error — this field can't be edited.",
			errorPrefillMessage:
				'Hi, I submitted a package request on your website but the confirmation email failed to send. Could you please confirm you received my enquiry? Reference: {ref}',
			errorDetailsHeader: 'Submitted details:',
			errorDetailName: 'Name',
			errorDetailEmail: 'Email',
			errorDetailPhone: 'Phone',
			errorDetailDate: 'Event date',
			errorDetailPackage: 'Package',
			errorDetailComments: 'Comments',
			successTitle: 'Quote Requested!',
			successText1: 'Hi',
			successText2: 'we received your request successfully. Our technical team in Malaga will evaluate it and contact you by email (',
			successText3: ') as soon as possible.',
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
			s2Desc: 'Fill out our quick form. We respond as soon as possible with full availability.',
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
		},
		// Lead capture form
		leadForm: {
			title: 'Secure Your Event Date',
			subtitle: "Fill in the form and we'll get back to you as soon as possible.",
			nameLabelInput: 'Full Name *',
			emailLabelInput: 'Email Address *',
			phoneLabelInput: 'Phone / WhatsApp *',
			eventDateLabel: 'Event Date *',
			commentsLabel: 'Questions or Comments',
			commentsPlaceholder: 'Tell us about your event — venue, number of guests, special requirements...',
			submitBtn: 'Check Date Availability',
			submitting: 'Sending...',
			errorRequired: 'This field is required.',
			errorEmail: 'Please enter a valid email address.',
			errorPhone: 'Please enter a valid phone number.',
			errorDateFuture: 'The event date must be in the future.',
			errorMinLength: 'Must be at least 2 characters.',
			errorMaxLength: 'Maximum 1000 characters allowed.',
			errorHoneypot: 'Spam detected.',
			errorSubmit: 'Something went wrong. Please try again or contact us directly.',
			errorTurnstile: 'Security verification failed. Please try again.',
			errorRateLimited: 'Too many requests. Please wait a few minutes and try again.',
			emailFailTitle: "We couldn't send your confirmation",
			emailFailBody: 'Your request was saved, but our email system failed to send it. Please contact our team directly so we don\'t lose your enquiry.',
			emailFailAction: 'Contact the team',
			emailFailDismiss: 'Close',
			countryCode: 'Country Code',
			responseTime: 'We respond as soon as possible',
			trustBadge: 'Trusted by 500+ events in Málaga'
		},
		// Thank-you page
		thankYou: {
			headline: 'Thank you! Your request is on its way.',
			subheadline: "We've received your enquiry and will get back to you as soon as possible.",
			responseTime: 'Expected response: as soon as possible',
			backToPackages: 'Browse all packages',
			whatsappCta: 'Or reach us now on WhatsApp',
			leadLabel: 'Reference'
		},
		// Gallery
		gallery: {
			titleHome: 'Our Events in Action',
			titlePackage: 'Past {pack} Events'
		}
	},
	es: {
		// Navigation
		nav: {
			equipment: 'Equipos',
			packages: 'Paquetes',
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
		// Overview (De un Vistazo — answer-engine optimization)
		overview: {
			badge: 'De un Vistazo',
			sellQ: '¿Qué vendemos?',
			sellA: 'Alquilamos equipos audiovisuales premium — sistemas de sonido profesional, iluminación de escenario, proyectores y pantallas — para eventos en Málaga y la Costa del Sol, con entrega, montaje y soporte técnico in situ.',
			whoQ: '¿Para quién es?',
			whoA: 'Parejas que organizan su boda, empresas con conferencias y eventos corporativos, y cualquiera que organice una fiesta o celebración privada y quiera sonido e iluminación impecables sin comprar el equipo.',
			costQ: '¿Cuánto cuesta?',
			costA: 'paquetes de precio fijo sin costos ocultos, escalados según el tamaño del evento, más presupuestos a medida para producciones grandes.',
			costFrom: 'Desde',
			howQ: '¿Cómo funciona?',
			howA: 'Cuatro pasos simples: elegís tu paquete, pedís presupuesto, confirmamos y preparamos el equipo, y nuestro equipo entrega y monta todo el día de tu evento.'
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
			bookEquipment: 'Reservar Paquetes'
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
		// Packages filters (e-commerce)
		filters: {
			title: 'Filtros',
			clearAll: 'Limpiar todo',
			resetFilters: 'Reiniciar Filtros',
			showingResults: 'Mostrando {visible} de {total} paquetes',
			noResults: 'Ningún paquete coincide con tus filtros. ¡Probá quitando algunas selecciones!',
			openFilters: 'Filtros',
			done: 'Ver resultados',
			purpose: 'Tipo de Evento',
			capacity: 'Escala del Evento',
			price: 'Presupuesto',
			equipment: 'Equipamiento Incluido',
			extras: 'Extras Opcionales',
			sortBy: 'Ordenar Por',
			party: 'Fiestas',
			wedding: 'Bodas',
			corporate: 'Corporativo',
			presentation: 'Presentaciones',
			meeting: 'Reuniones',
			small: 'Pequeño (hasta 50 invitados)',
			medium: 'Mediano (51–80 invitados)',
			large: 'Grande (80+ invitados)',
			priceLow: 'Hasta 300€',
			priceMid: '300€ – 500€',
			priceHigh: '500€ en adelante',
			transport: 'Transporte y Montaje',
			screen: 'Pantalla / Display',
			sound: 'Sistema de Sonido',
			microphone: 'Micrófonos',
			lighting: 'Iluminación Ambiental',
			technician: 'Técnico en Directo',
			projector: 'Proyector',
			smokeMachine: 'Máquina de Humo',
			technicalAssistant: 'Asistente Técnico',
			lectern: 'Atril',
			staging: 'Tarima / Escenario',
			recommended: 'Recomendado',
			priceAsc: 'Precio: Menor a Mayor',
			priceDesc: 'Precio: Mayor a Menor'
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
			formSubmitting: 'Enviando...',
			formRequiredError: 'Por favor, completá todos los campos obligatorios.',
			formErrorSubmit: 'Algo salió mal al enviar tu solicitud. Por favor intentá de nuevo o escribinos directamente.',
			formErrorTurnstile: 'Falló la verificación de seguridad. Por favor intentá de nuevo.',
			formErrorRateLimited: 'Demasiados intentos. Esperá unos minutos e intentá de nuevo.',
			lockedFieldNote: 'Generado automáticamente por un error — este campo no se puede editar.',
			errorPrefillMessage:
				'Hola, envié una solicitud de paquete en su sitio web pero el correo de confirmación no se pudo enviar. ¿Podrían confirmarme que recibieron mi consulta? Referencia: {ref}',
			errorDetailsHeader: 'Datos enviados:',
			errorDetailName: 'Nombre',
			errorDetailEmail: 'Correo',
			errorDetailPhone: 'Teléfono',
			errorDetailDate: 'Fecha del evento',
			errorDetailPackage: 'Paquete',
			errorDetailComments: 'Comentarios',
			successTitle: '¡Presupuesto Solicitado!',
			successText1: 'Hola',
			successText2: 'recibimos tu solicitud con éxito. Nuestro equipo técnico en Málaga la evaluará y te contactará por email (',
			successText3: ') lo antes posible.',
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
			s2Desc: 'Completá nuestro formulario rápido. Respondemos lo antes posible con disponibilidad completa.',
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
		},
		// Lead capture form
		leadForm: {
			title: 'Asegurá la Fecha de tu Evento',
			subtitle: 'Completá el formulario y te respondemos lo antes posible.',
			nameLabelInput: 'Nombre Completo *',
			emailLabelInput: 'Correo Electrónico *',
			phoneLabelInput: 'Teléfono / WhatsApp *',
			eventDateLabel: 'Fecha del Evento *',
			commentsLabel: 'Preguntas o Comentarios',
			commentsPlaceholder: 'Contanos sobre tu evento — espacio, cantidad de invitados, requerimientos especiales...',
			submitBtn: 'Verificar Disponibilidad',
			submitting: 'Enviando...',
			errorRequired: 'Este campo es obligatorio.',
			errorEmail: 'Por favor ingresá un correo electrónico válido.',
			errorPhone: 'Por favor ingresá un número de teléfono válido.',
			errorDateFuture: 'La fecha del evento debe ser en el futuro.',
			errorMinLength: 'Debe tener al menos 2 caracteres.',
			errorMaxLength: 'Máximo 1000 caracteres permitidos.',
			errorHoneypot: 'Spam detectado.',
			errorSubmit: 'Algo salió mal. Por favor intentá de nuevo o contactanos directamente.',
			errorTurnstile: 'Falló la verificación de seguridad. Por favor intentá de nuevo.',
			errorRateLimited: 'Demasiados intentos. Esperá unos minutos e intentá de nuevo.',
			emailFailTitle: 'No pudimos enviar tu confirmación',
			emailFailBody: 'Tu solicitud quedó guardada, pero nuestro sistema de correo no pudo enviarla. Por favor contactá al equipo directamente para que no perdamos tu consulta.',
			emailFailAction: 'Contactar al equipo',
			emailFailDismiss: 'Cerrar',
			countryCode: 'Código de País',
			responseTime: 'Respondemos lo antes posible',
			trustBadge: 'Confiado por más de 500 eventos en Málaga'
		},
		// Thank-you page
		thankYou: {
			headline: '¡Gracias! Tu solicitud está en camino.',
			subheadline: 'Recibimos tu consulta y te responderemos lo antes posible.',
			responseTime: 'Respuesta esperada: lo antes posible',
			backToPackages: 'Ver todos los paquetes',
			whatsappCta: 'O contactanos ahora por WhatsApp',
			leadLabel: 'Referencia'
		},
		// Gallery
		gallery: {
			titleHome: 'Nuestros Eventos en Acción',
			titlePackage: 'Eventos Anteriores de {pack}'
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
