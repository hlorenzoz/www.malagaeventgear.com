import { z } from 'zod';

/**
 * Zod schema for blog post frontmatter.
 * This is the authoritative schema for the data layer.
 * The existing BlogPostFrontmatterSchema in seo.ts is kept as-is for backward compat.
 */
export const BlogPostSchema = z.object({
	title: z.string().min(1, 'Title is required'),
	description: z.string().min(10, 'Description must be at least 10 characters'),
	author: z.string().min(1, 'Author is required'),
	// slug is derived from filename — injected by the data layer, not from frontmatter
	slug: z.string().min(1).optional(),
	// publishDate: plain YYYY-MM-DD or ISO 8601 with offset
	publishDate: z
		.string()
		.datetime({ offset: true })
		.or(z.string().date()),
	updated: z.string().optional(),
	excerpt: z.string().min(10),
	coverImage: z.string().url(),
	categories: z.array(z.string()).default([]),
	tags: z.array(z.string()).default([]),
	draft: z.boolean().optional().default(false)
});

export type BlogPostFrontmatter = z.infer<typeof BlogPostSchema>;

/**
 * BlogPost extends frontmatter with the slug derived from the .svx filename.
 * The compiled component is NOT carried here — it is loaded lazily per-route via
 * getPostComponentLoader(slug) so listing pages don't bundle every post body.
 */
export type BlogPost = BlogPostFrontmatter & {
	slug: string;
	// Responsive cover variants attached from cover-thumbs.json (frontmatter coverImage
	// stays the full-size image, used for og:image). thumb = ~768px <img src> fallback;
	// srcset = all R2 variants so the browser picks the right size per DPR/viewport.
	coverImageThumb?: string;
	coverImageSrcset?: string;
};

/**
 * A blog category derived from published posts.
 */
export interface Category {
	name: string;   // display name (e.g. "Event Planning")
	slug: string;   // URL-safe (e.g. "event-planning")
	count: number;  // number of published posts in this category
	lastmod: string; // max(updated ?? publishDate) across posts in category
}

/**
 * A blog author derived from published posts.
 */
export interface Author {
	name: string;   // display name (e.g. "Hector Lorenzo")
	slug: string;   // URL-safe (e.g. "hector-lorenzo")
	count: number;  // number of published posts by this author
	lastmod: string; // max(updated ?? publishDate) across posts by author
}
