/**
 * Malaga Event Gear (MEG) - Configuración Unificada del Sitio y Negocio
 * 
 * Este archivo actúa como la única fuente de verdad (Single Source of Truth)
 * para toda la información corporativa, de contacto, geográfica e institucional
 * utilizada tanto en la UI como en el SEO técnico (datos estructurados / JSON-LD).
 */

export const siteConfig = {
	brandName: 'Malaga Event Gear',
	brandShortName: 'MEG',
	slogan: {
		en: 'Rent your audiovisual system for multiple occasions',
		es: 'Alquilá tu sistema audiovisual para múltiples ocasiones'
	},
	url: 'https://malagaeventgear.com',
	logoUrl: 'https://malagaeventgear.com/logo.png', // Logo principal para Google Knowledge Graph
	contactEmail: 'contact@malagaeventgear.com',
	contactPhone: '+34 600 42 87 50',
	phoneCallUrl: 'tel:+34600428750',
	whatsappUrl: 'https://wa.me/34600428750',
	// Dirección de display (footer), idéntica a la ficha de Google Maps / GMB (NAP consistente).
	displayAddress: 'Av. de Barcelona, 34, Distrito Centro, 29009 Málaga',
	// Perfil de Google My Business — destino de todos los links de dirección del sitio.
	googleBusinessProfile: 'https://share.google/NVAtkdc4y0WJyF8cJ',
	emails: {
		hire: 'hire@malagaeventgear.com',
		contact: 'contact@malagaeventgear.com',
		legal: 'legal@malagaeventgear.com'
	},
	listings: {
		googleMyBusiness: 'https://share.google/kDiD1FgyJHt9fldoA',
		bingPlaces: 'https://www.bing.com/maps?ss=ypid.YN6317A92429033E45&mkt=en-ES'
	},
	onlinePresence: {
		medium: 'https://medium.com/@malagaeventgear',
		pinterest: 'https://es.pinterest.com/malagaeventgear/'
	},
	operatingHours: {
		opens: '08:00',
		closes: '20:00',
		dayOfWeek: [
			'Monday',
			'Tuesday',
			'Wednesday',
			'Thursday',
			'Friday',
			'Saturday',
			'Sunday'
		]
	},
	address: {
		streetAddress: 'Av. de Barcelona, 34, Distrito Centro',
		addressLocality: 'Málaga',
		addressRegion: 'Málaga',
		postalCode: '29009',
		addressCountry: 'ES'
	},
	geo: {
		latitude: 36.7243,
		longitude: -4.4373
	},
	socials: [
		'https://share.google/n4JrrhAnJttnN7ADs', // Google My Business Profile
		'https://g.page/r/Cc8g7neiciATEBM/review', // GMB Reviews
		'https://wa.me/34600428750' // WhatsApp
	],
	foundingYear: 1996,
	categories: [
		'Audio Visual Equipment Hire Service',
		'Party equipment rental service',
		'Stage lighting equipment supplier',
		'Video conferencing equipment supplier'
	],
	serviceAreas: [
		'Malaga',
		'Marbella',
		'Costa del Sol',
		'Sevilla',
		'Granada',
		'Coín',
		'Ronda',
		'Mijas',
		'Nerja',
		'Álora',
		'Benalmádena',
		'Ardales',
		'Pizarra',
		'Casares',
		'Cártama',
		'Estepona',
		'Vélez-Málaga',
		'Antequera',
		'Fuengirola',
		'Torremolinos',
		'Alhaurín el Grande',
		'Alhaurín de la Torre',
		'Rincón de la Victoria'
	]
};
