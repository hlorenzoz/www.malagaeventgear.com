import { z } from 'zod';
import type { FaqPageSchema } from '$lib/types/seo';

// Localized string schema (reused pattern from packages.ts)
const LocalizedTextSchema = z.object({
	en: z.string(),
	es: z.string()
});

// FAQ thematic categories used by the /faq page filter
export const FaqCategorySchema = z.enum(['services', 'logistics', 'booking', 'contact']);
export type FaqCategory = z.infer<typeof FaqCategorySchema>;

// Single FAQ entry schema
export const FaqItemSchema = z.object({
	id: z.string(),
	category: FaqCategorySchema,
	onHomepage: z.boolean(), // surfaced in the homepage FAQ teaser (only the 5 highest-value ones)
	question: LocalizedTextSchema,
	answer: LocalizedTextSchema
});

export type FaqItem = z.infer<typeof FaqItemSchema>;

// Single source of truth for all FAQ content.
// Base set mirrors the live malagaeventgear.com FAQ; extended set is authored
// strictly from existing business context (packages.ts, homepage copy, service list).
const faqData: FaqItem[] = [
	{
		id: 'what-is-meg',
		category: 'services',
		onHomepage: true,
		question: {
			en: 'What is Malaga Event Gear (MEG), and what services do they offer?',
			es: '¿Qué es Malaga Event Gear (MEG) y qué servicios ofrece?'
		},
		answer: {
			en: 'Malaga Event Gear (MEG) is a company based in Malaga, Spain, specializing in the rental of professional audiovisual, lighting, and event equipment. We provide sound systems, projectors, screens, stages, technical assistance, smoke machines, lighting solutions, and microphones — plus specialized services such as audio and video recording, live video production, live sound reinforcement, simultaneous translation, interactive voting systems, and video wall setups.',
			es: 'Malaga Event Gear (MEG) es una empresa con sede en Málaga, España, especializada en el alquiler de equipos profesionales audiovisuales, de iluminación y de eventos. Ofrecemos sistemas de sonido, proyectores, pantallas, escenarios, asistencia técnica, máquinas de humo, soluciones de iluminación y micrófonos — además de servicios especializados como grabación de audio y video, producción de video en directo, refuerzo de sonido en vivo, traducción simultánea, sistemas de votación interactiva y montajes de video wall.'
		}
	},
	{
		id: 'event-types',
		category: 'services',
		onHomepage: true,
		question: {
			en: 'What types of events can Malaga Event Gear (MEG) cater to?',
			es: '¿Qué tipos de eventos cubre Malaga Event Gear (MEG)?'
		},
		answer: {
			en: 'We cover personal celebrations such as weddings and private parties; professional gatherings such as corporate events, meetings, conferences, and product presentations; and larger-scale events such as congresses, fairs, and exhibitions, always with tailored audiovisual solutions.',
			es: 'Cubrimos celebraciones personales como bodas y fiestas privadas; encuentros profesionales como eventos corporativos, reuniones, conferencias y presentaciones de producto; y eventos de mayor escala como congresos, ferias y exposiciones, siempre con soluciones audiovisuales a medida.'
		}
	},
	{
		id: 'service-areas',
		category: 'logistics',
		onHomepage: true,
		question: {
			en: 'Where does Malaga Event Gear (MEG) offer its services?',
			es: '¿Dónde ofrece sus servicios Malaga Event Gear (MEG)?'
		},
		answer: {
			en: 'While "Malaga" is in our name, our services extend well beyond the city. We primarily operate across the Costa del Sol — including Malaga capital, Marbella, Coín, Ronda, Mijas, Nerja, Torremolinos, Fuengirola, Benalmadena, and Estepona. We also serve Sevilla and Granada, though Granada typically requires bookings exceeding 400 € due to the out-of-province travel distance.',
			es: 'Aunque "Málaga" está en nuestro nombre, nuestros servicios van mucho más allá de la ciudad. Operamos principalmente en la Costa del Sol — incluyendo Málaga capital, Marbella, Coín, Ronda, Mijas, Nerja, Torremolinos, Fuengirola, Benalmádena y Estepona. También atendemos Sevilla y Granada, aunque Granada normalmente requiere reservas superiores a 400 € por la distancia de traslado fuera de la provincia.'
		}
	},
	{
		id: 'what-makes-unique',
		category: 'services',
		onHomepage: false,
		question: {
			en: 'What makes Malaga Event Gear (MEG) unique compared to other audiovisual rental companies?',
			es: '¿Qué hace única a Malaga Event Gear (MEG) frente a otras empresas de alquiler audiovisual?'
		},
		answer: {
			en: 'MEG differentiates itself through a customer-centric and streamlined approach: a dedicated on-site technician for every booking, premium brand equipment, and transparent all-inclusive pricing. We are moving toward a 100% online booking experience with standardized fixed pricing and fully transparent transactions.',
			es: 'MEG se diferencia por un enfoque centrado en el cliente y simplificado: un técnico dedicado en sitio en cada reserva, equipamiento de marcas premium y precios transparentes y todo incluido. Avanzamos hacia una experiencia de reserva 100% online con precios fijos estandarizados y transacciones totalmente transparentes.'
		}
	},
	{
		id: 'booking-process',
		category: 'booking',
		onHomepage: true,
		question: {
			en: 'How does the booking process work with Malaga Event Gear?',
			es: '¿Cómo funciona el proceso de reserva con Malaga Event Gear?'
		},
		answer: {
			en: 'Our streamlined workflow has four steps: 1. Select your package. 2. Request your quote using our quick inquiry form. 3. Our team contacts you to finalize details and confirm the booking. 4. Enjoy a hassle-free event while we handle delivery, professional setup, configuration, and teardown. Please note that services must be contracted at least 24 hours in advance.',
			es: 'Nuestro flujo de trabajo optimizado tiene cuatro pasos: 1. Elegí tu paquete. 2. Solicitá tu presupuesto con nuestro formulario rápido. 3. Nuestro equipo te contacta para detallar y confirmar la reserva. 4. Disfrutá de un evento sin complicaciones mientras nos encargamos de la entrega, montaje profesional, calibración y desmontaje. Tené en cuenta que los servicios deben contratarse con al menos 24 horas de antelación.'
		}
	},
	{
		id: 'popular-packages',
		category: 'booking',
		onHomepage: true,
		question: {
			en: 'What are some of the popular packages offered by Malaga Event Gear?',
			es: '¿Cuáles son algunos de los paquetes populares de Malaga Event Gear?'
		},
		answer: {
			en: 'Our most popular pre-designed packages include the Eco Pack (€290), Wedding Pack (€650), Product Presentation Pack (€310), Basic MICE Pack (€295), and MICE Pack (€490), each with different equipment and features. Visit our Pricing page for the full breakdown of what each one includes.',
			es: 'Nuestros paquetes prediseñados más populares incluyen el Eco Pack (290 €), Wedding Pack (650 €), Product Presentation Pack (310 €), Basic MICE Pack (295 €) y MICE Pack (490 €), cada uno con distinto equipamiento y prestaciones. Visitá nuestra página de Precios para ver el detalle completo de lo que incluye cada uno.'
		}
	},
	{
		id: 'language-hours',
		category: 'booking',
		onHomepage: false,
		question: {
			en: 'In what language do they communicate with clients, and what are their operating hours?',
			es: '¿En qué idioma se comunican con los clientes y cuál es su horario de atención?'
		},
		answer: {
			en: 'Malaga Event Gear (MEG) communicates with clients primarily in English, and all services are offered in English to serve our international clientele. We are available 24 hours a day, 7 days a week for technical setups and live event monitoring.',
			es: 'Malaga Event Gear (MEG) se comunica con los clientes principalmente en inglés, y todos los servicios se ofrecen en inglés para atender a nuestra clientela internacional. Estamos disponibles las 24 horas, los 7 días de la semana, para montajes técnicos y control en vivo de eventos.'
		}
	},
	{
		id: 'contact-info',
		category: 'contact',
		onHomepage: false,
		question: {
			en: 'How can customers contact Malaga Event Gear (MEG), and what information should they provide?',
			es: '¿Cómo pueden contactar con Malaga Event Gear (MEG) y qué información deben facilitar?'
		},
		answer: {
			en: 'You can reach us by phone at +34 600 42 87 50, via WhatsApp, or by email. To get an accurate quote, please share your event date, location, expected number of guests, and the type of equipment or package you are interested in. See our Contact Us page for more details.',
			es: 'Podés contactarnos por teléfono al +34 600 42 87 50, por WhatsApp o por email. Para darte un presupuesto preciso, indicanos la fecha del evento, la ubicación, el número estimado de invitados y el tipo de equipo o paquete que te interesa. Visitá nuestra página de Contacto para más detalles.'
		}
	},
	{
		id: 'delivery-setup',
		category: 'services',
		onHomepage: false,
		question: {
			en: 'Do you offer delivery and setup for sound and lighting equipment?',
			es: '¿Ofrecen entrega y montaje de equipos de sonido e iluminación?'
		},
		answer: {
			en: 'Yes. MEG provides full delivery, professional setup, and post-event breakdown for all sound and lighting rentals. Our service includes transport, installation, cable concealment, sound/lighting checks, and optional on-site technical assistance across Málaga, Marbella, Fuengirola, Torremolinos, Estepona, and surrounding regions.',
			es: 'Sí. MEG ofrece entrega completa, montaje profesional y desmontaje post-evento para todos los alquileres de sonido e iluminación. Nuestro servicio incluye transporte, instalación, ocultación de cableado, pruebas de sonido/iluminación y asistencia técnica opcional en sitio en Málaga, Marbella, Fuengirola, Torremolinos, Estepona y zonas cercanas.'
		}
	},
	{
		id: 'vat-pricing',
		category: 'booking',
		onHomepage: false,
		question: {
			en: 'Are your package prices inclusive of VAT?',
			es: '¿Los precios de los paquetes incluyen IVA?'
		},
		answer: {
			en: 'The prices listed in our catalog are shown excluding VAT. Spanish VAT (IVA) is applied on top of the listed package price. Your final quote will always detail the net amount and the applicable VAT separately so the total is fully transparent.',
			es: 'Los precios que figuran en nuestro catálogo se muestran sin IVA. El IVA español se aplica sobre el precio del paquete indicado. Tu presupuesto final siempre detallará por separado el importe neto y el IVA aplicable para que el total sea totalmente transparente.'
		}
	},
	{
		id: 'on-site-technician',
		category: 'services',
		onHomepage: false,
		question: {
			en: 'Do you provide an on-site technician during the event?',
			es: '¿Proporcionan un técnico en sitio durante el evento?'
		},
		answer: {
			en: 'Yes. Several packages — such as the Wedding Pack and the full MICE Pack — include a dedicated live technician who handles technical control and engineering support throughout your event. For packages where it is not included (for example the Basic MICE Pack), on-site technical assistance can be added as an option from 240 € per day.',
			es: 'Sí. Varios paquetes —como el Wedding Pack y el MICE Pack completo— incluyen un técnico en directo dedicado que se encarga del control técnico y el soporte de ingeniería durante todo tu evento. En los paquetes donde no está incluido (por ejemplo el Basic MICE Pack), la asistencia técnica en sitio se puede añadir como opción desde 240 € por día.'
		}
	},
	{
		id: 'equipment-brands',
		category: 'services',
		onHomepage: false,
		question: {
			en: 'What equipment brands do you work with?',
			es: '¿Con qué marcas de equipos trabajan?'
		},
		answer: {
			en: 'We use premium professional brands trusted in the live-event industry, including Shure, QSC, and Martin, among others. This ensures reliable, high-fidelity sound and lighting performance for every booking.',
			es: 'Usamos marcas profesionales premium de confianza en la industria de eventos en vivo, incluyendo Shure, QSC y Martin, entre otras. Esto garantiza un rendimiento de sonido e iluminación fiable y de alta fidelidad en cada reserva.'
		}
	},
	{
		id: 'delivery-only',
		category: 'logistics',
		onHomepage: false,
		question: {
			en: 'Do you offer a self-pickup option, or is it delivery-only?',
			es: '¿Ofrecen recogida por cuenta propia o el servicio es solo con entrega?'
		},
		answer: {
			en: 'We operate under a delivery-only model — there is no self-pickup option. This guarantees that every system arrives professionally transported, installed, and calibrated by our team, so the equipment performs exactly as intended at your event.',
			es: 'Operamos bajo un modelo exclusivo de entrega — no hay opción de recogida por cuenta propia. Esto garantiza que cada sistema llegue transportado, instalado y calibrado profesionalmente por nuestro equipo, para que el equipo funcione exactamente como debe en tu evento.'
		}
	},
	{
		id: 'streaming-recording',
		category: 'services',
		onHomepage: false,
		question: {
			en: 'Do you offer live streaming and multi-camera recording?',
			es: '¿Ofrecen transmisión en vivo y grabación multicámara?'
		},
		answer: {
			en: 'Yes. Beyond equipment rental, we offer specialized production services including audio and video recording, multi-camera live video production, and live sound reinforcement — ideal for conferences, product launches, and hybrid events that need to reach a remote audience.',
			es: 'Sí. Más allá del alquiler de equipos, ofrecemos servicios de producción especializados que incluyen grabación de audio y video, producción de video en directo multicámara y refuerzo de sonido en vivo — ideales para conferencias, lanzamientos de producto y eventos híbridos que necesitan llegar a una audiencia remota.'
		}
	},
	{
		id: 'translation-voting',
		category: 'services',
		onHomepage: false,
		question: {
			en: 'Do you provide simultaneous translation or interactive voting systems?',
			es: '¿Proporcionan traducción simultánea o sistemas de votación interactiva?'
		},
		answer: {
			en: 'Yes. For corporate and congress-grade events we provide simultaneous translation, interactive voting systems, and video wall setups. These solutions are tailored to the size and format of your event, so let us know your requirements when requesting a quote.',
			es: 'Sí. Para eventos corporativos y de nivel congreso ofrecemos traducción simultánea, sistemas de votación interactiva y montajes de video wall. Estas soluciones se adaptan al tamaño y formato de tu evento, así que indicanos tus necesidades al solicitar el presupuesto.'
		}
	},
	{
		id: 'large-scale-events',
		category: 'services',
		onHomepage: false,
		question: {
			en: 'Can you handle large-scale congresses, fairs, and exhibitions?',
			es: '¿Pueden gestionar congresos, ferias y exposiciones de gran escala?'
		},
		answer: {
			en: 'Absolutely. Alongside weddings and corporate meetings, we equip larger-scale events such as congresses, fairs, and exhibitions with tailored audiovisual solutions — combining sound reinforcement, large-format screens, video walls, stages, and dedicated technical staff as needed.',
			es: 'Por supuesto. Además de bodas y reuniones corporativas, equipamos eventos de mayor escala como congresos, ferias y exposiciones con soluciones audiovisuales a medida — combinando refuerzo de sonido, pantallas de gran formato, video walls, escenarios y personal técnico dedicado según haga falta.'
		}
	},
	{
		id: 'notice-time',
		category: 'booking',
		onHomepage: false,
		question: {
			en: 'What is the minimum notice time to make a booking?',
			es: '¿Con cuánta antelación mínima se debe hacer una reserva?'
		},
		answer: {
			en: 'All event gear rentals and technical services must be contracted with a minimum of 24 hours’ advance notice to guarantee scheduling and logistical availability. For large or complex events, we recommend booking as early as possible to secure your date.',
			es: 'Todos los alquileres de equipos y servicios técnicos deben contratarse con un mínimo de 24 horas de antelación para garantizar la programación y la disponibilidad logística. Para eventos grandes o complejos, recomendamos reservar lo antes posible para asegurar tu fecha.'
		}
	},
	{
		id: 'minimum-order-granada',
		category: 'logistics',
		onHomepage: false,
		question: {
			en: 'Is there a minimum order for service outside the Costa del Sol?',
			es: '¿Hay un pedido mínimo para el servicio fuera de la Costa del Sol?'
		},
		answer: {
			en: 'Within the Costa del Sol there is no special minimum. For more distant, out-of-province destinations such as Granada, we require a minimum rental value exceeding 400 € to cover the single-day logistical travel. Sevilla is also served — contact us to confirm conditions for your specific location.',
			es: 'Dentro de la Costa del Sol no hay un mínimo especial. Para destinos más lejanos y fuera de la provincia, como Granada, requerimos un valor de alquiler superior a 400 € para cubrir el traslado logístico de un día. Sevilla también está cubierta — contactanos para confirmar las condiciones de tu ubicación concreta.'
		}
	},
	{
		id: 'customize-package',
		category: 'booking',
		onHomepage: false,
		question: {
			en: 'Can I customize or extend a package for my specific needs?',
			es: '¿Puedo personalizar o ampliar un paquete según mis necesidades?'
		},
		answer: {
			en: 'Yes. Every package can be extended with add-ons such as projectors and screens, professional smoke machines, extra microphones, premium acrylic lecterns, modular stage platforms, and additional live technician hours. Tell us your requirements when requesting a quote and we will build the perfect configuration for your event.',
			es: 'Sí. Cada paquete se puede ampliar con complementos como proyectores y pantallas, máquinas de humo profesionales, micrófonos adicionales, atriles de acrílico premium, tarimas de escenario modulares y horas extra de técnico en directo. Contanos tus necesidades al solicitar el presupuesto y armamos la configuración perfecta para tu evento.'
		}
	}
];

// Validate all FAQ entries at runtime using Zod to ensure data integrity and full type safety
export const faqs: FaqItem[] = faqData.map((item) => {
	const result = FaqItemSchema.safeParse(item);
	if (!result.success) {
		console.error(`Invalid FAQ configuration for ID: ${item.id}`, result.error.format());
		throw new Error(`Invalid FAQ configuration: ${result.error.message}`);
	}
	return result.data;
});

// FAQs surfaced in the homepage teaser section (highest-value, conversion-oriented)
export const getHomepageFaqs = (): FaqItem[] => faqs.filter((item) => item.onHomepage);

// FAQs filtered by thematic category (used by the /faq page filter)
export const getFaqsByCategory = (category: FaqCategory): FaqItem[] =>
	faqs.filter((item) => item.category === category);

type Lang = 'en' | 'es';

// Build a Schema.org FAQPage JSON-LD object from the given FAQ items, in a single
// canonical language (English by default). Generated from the same source as the
// rendered content so the structured data can never drift out of sync.
export const buildFaqSchema = (items: FaqItem[], lang: Lang = 'en'): FaqPageSchema => ({
	'@context': 'https://schema.org',
	'@type': 'FAQPage',
	mainEntity: items.map((item) => ({
		'@type': 'Question',
		name: item.question[lang],
		acceptedAnswer: {
			'@type': 'Answer',
			text: item.answer[lang]
		}
	}))
});
