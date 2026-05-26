import { z } from 'zod';

/**
 * Zod Schema para validación estricta en tiempo de compilación o ejecución
 * del Frontmatter de los artículos del Blog (.mdx).
 */
export const BlogPostFrontmatterSchema = z.object({
	title: z.string().min(1, 'El título es obligatorio'),
	description: z.string().min(10, 'La descripción meta debe tener al menos 10 caracteres'),
	date: z.string().refine((val) => !isNaN(Date.parse(val)), {
		message: 'Fecha inválida. Debe ser un formato de fecha ISO válido (YYYY-MM-DD)'
	}),
	author: z.string().min(1, 'El autor es obligatorio'),
	schemaType: z.string().optional().default('BlogPosting'),
	image: z.string().url().optional(),
	tags: z.array(z.string()).optional()
});

/**
 * Interface derivada del Zod Schema para TypeScript estricto.
 */
export type BlogPostFrontmatter = z.infer<typeof BlogPostFrontmatterSchema>;

/**
 * Estructura tipada para la inyección de Open Graph Protocol.
 */
export interface OpenGraphMeta {
	title?: string;
	description?: string;
	url?: string;
	type?: 'website' | 'article' | 'profile' | 'book';
	siteName?: string;
	images?: Array<{
		url: string;
		width?: number;
		height?: number;
		alt?: string;
		type?: string;
	}>;
	locale?: string;
	alternateLocales?: string[];
}

/**
 * Estructura tipada para Twitter Cards (respetando especificaciones oficiales).
 */
export interface TwitterCardMeta {
	card?: 'summary' | 'summary_large_image' | 'app' | 'player';
	site?: string; // e.g., @MegMalaga
	creator?: string; // e.g., @MegMalaga
	title?: string;
	description?: string;
	image?: string;
	imageAlt?: string;
}

/**
 * Tipados de Schema.org para JSON-LD de SEO Generativo.
 */
export interface BaseLdContext {
	'@context': 'https://schema.org';
}

export interface WebSiteSchema extends BaseLdContext {
	'@type': 'WebSite';
	name: string;
	url: string;
	potentialAction?: Record<string, unknown> | Record<string, unknown>[];
}

export interface OrganizationSchema extends BaseLdContext {
	'@type': 'Organization';
	name: string;
	url: string;
	logo?: string;
	sameAs?: string[];
}

export interface BlogPostingSchema extends BaseLdContext {
	'@type': 'BlogPosting' | 'Article' | 'TechArticle';
	headline: string;
	description: string;
	datePublished: string;
	dateModified?: string;
	author: {
		'@type': 'Person' | 'Organization';
		name: string;
		url?: string;
	};
	publisher?: {
		'@type': 'Organization';
		name: string;
		logo?: {
			'@type': 'ImageObject';
			url: string;
		};
	};
	mainEntityOfPage?: string;
	image?: string | string[];
}

/**
 * Tipo de unión que representa esquemas JSON-LD soportados o un registro genérico Schema.org.
 */
export type JsonLdSchema =
	| WebSiteSchema
	| OrganizationSchema
	| BlogPostingSchema
	| Record<string, unknown>;
