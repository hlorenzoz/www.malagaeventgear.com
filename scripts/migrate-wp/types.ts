/**
 * Shared TypeScript interfaces for the WP → mdsvex migration script.
 * Design §4 — manifest schema (enriched per blog-media-cdn.md spec).
 */

/**
 * One entry per WP image size variant in the manifest.
 * The manifest key is the original WP URL; this interface is the value.
 */
export interface MediaEntry {
	/** WordPress attachment post ID */
	wpId: number;
	/** R2 object key, e.g. "42/venue-main-1200x800.jpg" */
	r2Key: string;
	/** Canonical CDN URL: https://cdn.malagaeventgear.com/<r2Key> */
	r2Url: string;
	/** CDN base URL of the full-size image for this attachment */
	cdnUrl: string;
	/** Category slug inferred from owning post's WP category (e.g. "blog") */
	category: string;
	/** WP media tags — defaults to [] */
	tags: string[];
	/** Original file name as uploaded to WP (e.g. "venue-main.jpg") */
	fileName: string;
	/** WP attachment title (may be empty string) */
	title: string;
	/** WP attachment alt text (may be empty string) */
	alt: string;
	/** WP attachment caption (may be empty string) */
	caption: string;
	/** WP attachment description (may be empty string) */
	description: string;
	/** MIME type (e.g. "image/jpeg") */
	mimeType: string;
	/** File size in bytes; 0 if unavailable */
	fileSize: number;
	/** Pixel width of this variant */
	width: number;
	/** Pixel height of this variant */
	height: number;
	/** ISO 8601 upload date (WP attachment date) */
	uploadedOn: string;
	/** WP author display name */
	uploadedBy: string;
	/** The original WP URL (same as the manifest key, for self-documentation) */
	originalUrl: string;
	/** True if this image should be excluded from any future image sitemap */
	excludeFromSitemap: boolean;
}

/** One entry per migrated WP post. */
export interface PostEntry {
	/** WordPress post ID */
	wpId: number;
	/** URL slug (matches .svx filename) */
	slug: string;
	/** WP post title */
	title: string;
	/** Absolute path to emitted .svx file, e.g. "src/content/blog/my-post.svx" */
	svxPath: string;
	/** R2 keys referenced from this post's body */
	mediaRefs: string[];
}

/**
 * Root manifest structure.
 * Stored at scripts/migrate-wp/manifest.json.
 */
export interface Manifest {
	version: 1;
	generatedAt: string;
	sourceUrl: string;
	r2Bucket: string;
	cdnBase: string;
	/**
	 * Maps every known URL variant (http/https, www/no-www, size-suffixed)
	 * to the canonical CDN URL.
	 */
	urlVariantMap: Record<string, string>;
	/** Keyed by original WP URL */
	media: Record<string, MediaEntry>;
	posts: PostEntry[];
}

/** Shape of a WP REST API post object (fields we care about). */
export interface WpPost {
	id: number;
	slug: string;
	/** Canonical permalink of the post on the live WP site (used for redirect derivation). */
	link: string;
	title: { rendered: string };
	content: { rendered: string };
	excerpt: { rendered: string };
	date_gmt: string;
	modified_gmt: string;
	status: string;
	/** Embedded data from ?_embed=true */
	_embedded?: {
		author?: WpUser[];
		'wp:term'?: WpTerm[][];
		'wp:featuredmedia'?: WpMedia[];
	};
	featured_media: number;
}

export interface WpUser {
	id: number;
	name: string; // display_name — W-01: ALWAYS use this, never slug
	slug: string;
}

export interface WpTerm {
	id: number;
	name: string;
	slug: string;
	taxonomy: 'category' | 'post_tag';
}

export interface WpMedia {
	id: number;
	source_url: string;
	alt_text: string;
	caption: { rendered: string };
	title: { rendered: string };
	description: { rendered: string };
	date_gmt: string;
	media_details: {
		width: number;
		height: number;
		file: string;
		filesize?: number;
		sizes?: Record<
			string,
			{
				file: string;
				width: number;
				height: number;
				filesize?: number;
				source_url: string;
				mime_type: string;
			}
		>;
	};
	mime_type: string;
	author: number;
	/** Embedded author data from ?_embed=true (available when media is fetched with _embed) */
	_embedded?: {
		author?: WpUser[];
	};
}

export interface WpCategory {
	id: number;
	name: string;
	slug: string;
	count: number;
}

export interface WpTag {
	id: number;
	name: string;
	slug: string;
	count: number;
}
