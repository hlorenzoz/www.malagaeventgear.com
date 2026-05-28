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

// Main package Zod schema
export const PackageSchema = z.object({
	id: z.string(),
	route: z.string(),
	name: z.string(),
	price: z.number(), // in EUR (excluding VAT)
	desc: LocalizedTextSchema,
	includes: LocalizedListSchema,
	optional: LocalizedListSchema.optional(),
	maxGuests: z.number().optional(),
	popular: z.boolean().optional(),
	image: z.string().optional()
});

export type EventPackage = z.infer<typeof PackageSchema>;

// Verified package inventory data matching live business catalog
const packagesData: EventPackage[] = [
	{
		id: 'eco',
		route: '/eco-pack',
		name: 'Eco Pack',
		price: 290,
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
			en: [
				'Projector & projection screen (+50€)',
				'Professional smoke/fog machine (+20€)'
			],
			es: [
				'Proyector y pantalla de proyección (+50€)',
				'Máquina de humo/niebla profesional (+20€)'
			]
		},
		maxGuests: 50,
		popular: false
	},
	{
		id: 'wedding',
		route: '/wedding-pack',
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
		image: 'https://lh3.googleusercontent.com/aida/ADBb0ug5w7wOaGS-ye7h2_G8UyqDbYMZJnFo3n0EKPpcXxJTG8hzJQlSVNraO7x5ypbKYYdJHdo3SlEoMnm1hbLotISEcdS7yUcoRvwRZg2es3rmE9bBP2RrSNpbfBHYcUdgFqF8WFmO7Ir5Rt8jZQJnina2BmPgZFoQkNAY6_lCw3zSHd_rT30euyLl6PHKpYtOedfOVJGP-qnRQ_1xiw2YAefmwjTMiIqaOEN2gciZqGAqf1K1kEvrX8MD'
	},
	{
		id: 'presentation',
		route: '/product-presentation-pack',
		name: 'Product Presentation Pack',
		price: 310,
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
		popular: false
	},
	{
		id: 'mice-basic',
		route: '/basic-mice-pack',
		name: 'Basic MICE Pack',
		price: 295,
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
			en: [
				'Dedicated on-site live technical assistant (+240€/day)'
			],
			es: [
				'Asistente técnico especializado en directo en el sitio (+240€/día)'
			]
		},
		maxGuests: 40,
		popular: false
	},
	{
		id: 'mice-full',
		route: '/mice-pack',
		name: 'MICE Pack',
		price: 490,
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
		popular: false
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

export const getPackageById = (id: string): EventPackage | undefined => {
	return packages.find((pkg) => pkg.id === id);
};

export const getPackageByRoute = (route: string): EventPackage | undefined => {
	return packages.find((pkg) => pkg.route === route);
};
