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
export function buildBreadcrumbsSchema(pathname: string): Record<string, any> {
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

		segments.forEach((segment) => {
			accumulatedSegments.push(segment);
			const currentPath = `/${accumulatedSegments.join('/')}/`;
			
			// Capitalizar el nombre del segmento de forma amigable para la miga de pan
			const name = segment
				.split('-')
				.map(word => word.charAt(0).toUpperCase() + word.slice(1))
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
		'datePublished': post.datePublished,
		'dateModified': post.dateModified || post.datePublished,
		'inLanguage': 'en',
		'image': imageNode,
		'author': {
			'@type': 'Person',
			'name': post.authorName,
			...(post.authorUrl ? { 'url': post.authorUrl } : {})
		},
		'publisher': {
			'@type': 'Organization',
			'name': siteConfig.brandName,
			'logo': {
				'@type': 'ImageObject',
				'url': siteConfig.logoUrl
			},
			'url': siteConfig.url
		},
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
