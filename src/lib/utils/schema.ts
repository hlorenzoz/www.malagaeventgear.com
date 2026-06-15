import { siteConfig } from '../data/site';
import type { 
	BaseLdContext, 
	OrganizationSchema, 
	FaqPageSchema, 
	FaqQuestionSchema,
	JsonLdSchema 
} from '../types/seo';

/**
 * Genera el esquema LocalBusiness base utilizando los datos de site.ts.
 * Google recomienda LocalBusiness o un subtipo específico como ProfessionalService
 * para proveedores de servicios locales.
 */
export function buildLocalBusinessSchema(): Record<string, any> {
	return {
		'@context': 'https://schema.org',
		'@type': 'ProfessionalService',
		'@id': `${siteConfig.url}/#organization`,
		'name': siteConfig.brandName,
		'url': siteConfig.url,
		'logo': siteConfig.logoUrl,
		'image': siteConfig.logoUrl,
		'telephone': siteConfig.contactPhone,
		'email': siteConfig.contactEmail,
		'priceRange': '€€',
		'foundingDate': siteConfig.foundingYear.toString(),
		// sameAs = perfiles oficiales que confirman la identidad de la entidad (Google guidelines).
		'sameAs': [
			siteConfig.googleBusinessProfile,
			siteConfig.onlinePresence.medium,
			siteConfig.onlinePresence.pinterest,
			siteConfig.listings.bingPlaces
		],
		'address': {
			'@type': 'PostalAddress',
			'streetAddress': siteConfig.address.streetAddress,
			'addressLocality': siteConfig.address.addressLocality,
			'addressRegion': siteConfig.address.addressRegion,
			'postalCode': siteConfig.address.postalCode,
			'addressCountry': siteConfig.address.addressCountry
		},
		'geo': {
			'@type': 'GeoCoordinates',
			'latitude': siteConfig.geo.latitude,
			'longitude': siteConfig.geo.longitude
		},
		'openingHoursSpecification': [
			{
				'@type': 'OpeningHoursSpecification',
				'dayOfWeek': siteConfig.operatingHours.dayOfWeek,
				'opens': siteConfig.operatingHours.opens,
				'closes': siteConfig.operatingHours.closes
			}
		],
		'areaServed': siteConfig.serviceAreas.map(area => ({
			'@type': 'AdministrativeArea',
			'name': area
		}))
	};
}

/**
 * Genera el nodo WebSite del grafo de entidades. Resuelve las referencias `@id .../#website`
 * usadas por otras páginas (about-us, blog) y enlaza la publicación a la organización (#organization).
 */
export function buildWebSiteSchema(): Record<string, any> {
	return {
		'@context': 'https://schema.org',
		'@type': 'WebSite',
		'@id': `${siteConfig.url}/#website`,
		'name': siteConfig.brandName,
		'url': `${siteConfig.url}/`,
		'publisher': { '@id': `${siteConfig.url}/#organization` }
	};
}

/**
 * Genera el esquema de BreadcrumbList de manera dinámica basado en el path de la URL activa.
 * Respeta de forma estricta las trailing slashes.
 */
export function buildBreadcrumbsSchema(pathname: string, leafName?: string): Record<string, any> {
	// Asegurar que el pathname comience con / y termine con / si no es la Home
	let path = pathname;
	if (path !== '/' && !path.endsWith('/')) {
		path += '/';
	}

	const items = [
		{
			name: 'Home',
			item: `${siteConfig.url}/`
		}
	];

	if (path !== '/') {
		// Quitar las barras del inicio y final para separar
		const segments = path.split('/').filter(Boolean);
		const accumulatedSegments: string[] = [];

		segments.forEach((segment, idx) => {
			accumulatedSegments.push(segment);
			const currentPath = `/${accumulatedSegments.join('/')}/`;
			const isLast = idx === segments.length - 1;

			// La última miga usa el título real de la página (leafName) cuando está disponible;
			// el resto (y el fallback) capitaliza el segmento de la URL de forma amigable.
			const name =
				isLast && leafName
					? leafName
					: segment
							.split('-')
							.map((word) => word.charAt(0).toUpperCase() + word.slice(1))
							.join(' ');

			items.push({
				name,
				item: `${siteConfig.url}${currentPath}`
			});
		});
	}

	return {
		'@context': 'https://schema.org',
		'@type': 'BreadcrumbList',
		'itemListElement': items.map((item, index) => ({
			'@type': 'ListItem',
			'position': index + 1,
			'name': item.name,
			'item': item.item
		}))
	};
}

/**
 * Genera el esquema Service para servicios o paquetes de alquiler específicos.
 */
export function buildServiceSchema(
	service: {
		name: string;
		description: string;
		price: number;
		url: string;
		category?: string;
	},
	lang: 'en' | 'es' = 'en'
): Record<string, any> {
	// Referencia al nodo canónico de la organización (emitido en el layout con
	// @id .../#organization). NO redefinimos la empresa aquí: un provider parcial
	// hace que Google detecte una segunda "Empresa local" incompleta (faltan
	// telephone, priceRange, address, image). El grafo de entidades exige un único
	// nodo canónico referenciado por @id — igual que hace buildWebSiteSchema.
	const providerSchema = {
		'@id': `${siteConfig.url}/#organization`
	};

	return {
		'@context': 'https://schema.org',
		'@type': 'Service',
		'@id': `${siteConfig.url}${service.url}#service`,
		'name': service.name,
		'description': service.description,
		'serviceType': service.category || 'Audiovisual Equipment Rental',
		'provider': providerSchema,
		'areaServed': siteConfig.serviceAreas.map(area => ({
			'@type': 'AdministrativeArea',
			'name': area
		})),
		'offers': {
			'@type': 'Offer',
			'price': service.price.toFixed(2),
			'priceCurrency': 'EUR',
			'url': `${siteConfig.url}${service.url}`,
			'availability': 'https://schema.org/InStock',
			'priceSpecification': {
				'@type': 'UnitPriceSpecification',
				'price': service.price.toFixed(2),
				'priceCurrency': 'EUR',
				'valueAddedTaxIncluded': true
			}
		}
	};
}

/**
 * Genera el esquema ItemList para agrupar múltiples servicios o posts en páginas de categorías.
 */
export function buildItemListSchema(
	items: Array<{ name: string; url: string }>,
	listName: string
): Record<string, any> {
	return {
		'@context': 'https://schema.org',
		'@type': 'ItemList',
		'name': listName,
		'itemListElement': items.map((item, index) => ({
			'@type': 'ListItem',
			'position': index + 1,
			'url': `${siteConfig.url}${item.url}`,
			'name': item.name
		}))
	};
}

/**
 * Genera un ItemList donde cada elemento ES la entidad Service del paquete, con su
 * Offer (precio). A diferencia de buildItemListSchema (name + url planos, sin valor
 * semántico), esto enlaza el listado al grafo de entidades: cada item usa el MISMO
 * `@id` (.../#service) que su página individual /packages/[slug]/, y referencia el
 * nodo canónico de la organización por @id. Google entiende cada paquete como un
 * servicio con precio y proveedor, sin duplicar entidades.
 *
 * Nota: Service + Offer es válido y refuerza el grafo, pero NO genera un snippet de
 * precio visible en la búsqueda (eso requiere Product/merchant listings).
 */
export function buildServiceListSchema(
	services: Array<{
		name: string;
		description: string;
		price: number;
		url: string;
		serviceType?: string;
		image?: string;
	}>,
	listName: string
): Record<string, any> {
	return {
		'@context': 'https://schema.org',
		'@type': 'ItemList',
		'name': listName,
		'itemListElement': services.map((service, index) => {
			const serviceNode: Record<string, any> = {
				'@type': 'Service',
				'@id': `${siteConfig.url}${service.url}#service`,
				'name': service.name,
				'description': service.description,
				'serviceType': service.serviceType || 'Audiovisual Equipment Rental',
				'url': `${siteConfig.url}${service.url}`,
				'provider': { '@id': `${siteConfig.url}/#organization` },
				'offers': {
					'@type': 'Offer',
					'price': service.price.toFixed(2),
					'priceCurrency': 'EUR',
					'url': `${siteConfig.url}${service.url}`,
					'availability': 'https://schema.org/InStock'
				}
			};

			if (service.image) {
				serviceNode['image'] = `${siteConfig.url}${service.image}`;
			}

			return {
				'@type': 'ListItem',
				'position': index + 1,
				'item': serviceNode
			};
		})
	};
}

/**
 * Genera el esquema FAQPage dinámico.
 */
export function buildFAQPageSchema(
	faqs: Array<{ question: string; answer: string }>
): FaqPageSchema {
	const mainEntity: FaqQuestionSchema[] = faqs.map(faq => ({
		'@type': 'Question',
		'name': faq.question,
		'acceptedAnswer': {
			'@type': 'Answer',
			'text': faq.answer
		}
	}));

	return {
		'@context': 'https://schema.org',
		'@type': 'FAQPage',
		'mainEntity': mainEntity
	};
}

/**
 * Genera el esquema BlogPosting o NewsArticle para los posts del blog.
 *
 * Extended fields vs. the original:
 * - type: 'BlogPosting' | 'NewsArticle' — defaults to 'BlogPosting'
 * - articleSection: maps to schema.org articleSection
 * - keywords: joined as comma-separated string per schema.org spec
 * - inLanguage: always 'en' (site language)
 * - image: emitted as ImageObject when imageUrl is provided (with optional dims);
 *   falls back to siteConfig.logoUrl as a plain string only when imageUrl is absent
 */
/**
 * Offset (en minutos) de una zona horaria IANA para un instante dado.
 * Edge-safe: solo usa `Intl` (sin Node ni dependencia de `timeZoneName: 'longOffset'`).
 */
function tzOffsetMinutes(isoUtc: string, timeZone: string): number {
	const instant = new Date(isoUtc);
	const dtf = new Intl.DateTimeFormat('en-US', {
		timeZone,
		hour12: false,
		year: 'numeric',
		month: '2-digit',
		day: '2-digit',
		hour: '2-digit',
		minute: '2-digit',
		second: '2-digit'
	});
	const parts: Record<string, string> = {};
	for (const p of dtf.formatToParts(instant)) parts[p.type] = p.value;
	// Algunas implementaciones devuelven "24" para medianoche → normalizar a "00".
	const hour = parts.hour === '24' ? '00' : parts.hour;
	const asLocalMs = Date.UTC(
		Number(parts.year),
		Number(parts.month) - 1,
		Number(parts.day),
		Number(hour),
		Number(parts.minute),
		Number(parts.second)
	);
	return Math.round((asLocalMs - instant.getTime()) / 60000);
}

/**
 * Normaliza una fecha a ISO 8601 completo CON offset de zona horaria — requerido por Google
 * para `datePublished`/`dateModified` en Article/NewsArticle (un valor solo-fecha "YYYY-MM-DD"
 * dispara los avisos "no es válido" / "falta la zona horaria" en Rich Results).
 *
 * - Si el valor ya trae hora (contiene 'T'), se respeta sin tocar.
 * - Si es solo fecha (YYYY-MM-DD), se le agrega una hora local fija + el offset REAL de
 *   `timeZone` para ese día (respeta DST: Europe/Madrid = +01:00 invierno, +02:00 verano).
 *
 * Ejemplo: "2026-06-15" → "2026-06-15T09:00:00+02:00".
 */
export function toIso8601WithOffset(
	date: string,
	timeZone = 'Europe/Madrid',
	clock = '09:00:00'
): string {
	if (!date) return date;
	if (date.includes('T')) return date; // ya es datetime → respetar
	if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) return date; // formato inesperado → no romper
	const offsetMinutes = tzOffsetMinutes(`${date}T${clock}Z`, timeZone);
	const sign = offsetMinutes >= 0 ? '+' : '-';
	const abs = Math.abs(offsetMinutes);
	const hh = String(Math.floor(abs / 60)).padStart(2, '0');
	const mm = String(abs % 60).padStart(2, '0');
	return `${date}T${clock}${sign}${hh}:${mm}`;
}

export function buildArticleSchema(post: {
	title: string;
	description: string;
	datePublished: string;
	dateModified?: string;
	authorName: string;
	authorUrl?: string;
	url: string;
	imageUrl?: string;
	imageWidth?: number;
	imageHeight?: number;
	type?: 'BlogPosting' | 'NewsArticle';
	articleSection?: string;
	keywords?: string[];
}): Record<string, any> {
	// Build image node
	let imageNode: Record<string, any> | string;
	if (post.imageUrl) {
		imageNode = { '@type': 'ImageObject', url: post.imageUrl };
		if (post.imageWidth != null) imageNode.width = post.imageWidth;
		if (post.imageHeight != null) imageNode.height = post.imageHeight;
	} else {
		imageNode = siteConfig.logoUrl;
	}

	const schema: Record<string, any> = {
		'@context': 'https://schema.org',
		'@type': post.type ?? 'BlogPosting',
		'@id': `${siteConfig.url}${post.url}#article`,
		'headline': post.title,
		'description': post.description,
		'datePublished': toIso8601WithOffset(post.datePublished),
		'dateModified': toIso8601WithOffset(post.dateModified || post.datePublished),
		'inLanguage': 'en',
		'image': imageNode,
		'author': {
			'@type': 'Person',
			'name': post.authorName,
			...(post.authorUrl ? { 'url': post.authorUrl } : {})
		},
		// Referencia al nodo canónico de la organización (#organization, emitido por el layout
		// público vía buildLocalBusinessSchema con name+logo+address). Consolidar por @id evita
		// un segundo nodo "Organization" parcial en el grafo. Mismo patrón que buildWebSiteSchema.
		'publisher': { '@id': `${siteConfig.url}/#organization` },
		'mainEntityOfPage': {
			'@type': 'WebPage',
			'@id': `${siteConfig.url}${post.url}`
		}
	};

	if (post.articleSection) {
		schema['articleSection'] = post.articleSection;
	}

	if (post.keywords && post.keywords.length > 0) {
		schema['keywords'] = post.keywords.join(', ');
	}

	return schema;
}

/**
 * Genera el esquema FAQPage para colecciones de preguntas y respuestas en posts.
 *
 * @param faqs - Array of { question, answer } pairs (answer as plain text)
 * @returns FAQPage JSON-LD schema object
 */
export function buildFAQSchema(faqs: { question: string; answer: string }[]): Record<string, any> {
	return {
		'@context': 'https://schema.org',
		'@type': 'FAQPage',
		'mainEntity': faqs.map((faq) => ({
			'@type': 'Question',
			'name': faq.question,
			'acceptedAnswer': {
				'@type': 'Answer',
				'text': faq.answer
			}
		}))
	};
}
