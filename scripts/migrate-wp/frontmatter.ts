/**
 * Frontmatter builder — converts a WP post object into a validated
 * frontmatter object and serializes it as a YAML block.
 *
 * Key conventions enforced here:
 *   W-01: author MUST be WP display_name (never the URL slug)
 *   S-01: handled in turndown.ts (not here)
 *   SC-MIG-08: derive excerpt from body when WP excerpt is empty
 *   SC-MIG-09: omit `updated` when equal to `date`
 *   SC-CDN-07: fallback to site OG image when no featured media
 */
import type { WpPost } from './types';
import { decodeEntities } from './decode-entities';

/** Site default OG image — used when a post has no featured media. */
export const DEFAULT_COVER_IMAGE = 'https://malagaeventgear.com/og-image.jpg';

/** Shape of the frontmatter object before YAML serialization. */
export interface PostFrontmatter {
	title: string;
	description: string;
	author: string; // display_name (W-01)
	slug: string;
	publishDate: string; // YYYY-MM-DD
	updated?: string; // YYYY-MM-DD — omitted when equal to publishDate
	excerpt: string;
	coverImage: string;
	categories: string[]; // display names
	tags: string[]; // display names
	draft: false;
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/**
 * Strips HTML tags from a string and decodes all HTML entities.
 * Order: strip tags first (turning <br> into spaces), then decode entities.
 */
function stripHtml(html: string): string {
	return decodeEntities(
		html
			.replace(/<[^>]+>/g, ' ')
			.replace(/\s{2,}/g, ' ')
			.trim()
	);
}

/** Formats a WP GMT datetime string (e.g. "2024-03-15T10:00:00") to YYYY-MM-DD. */
function toDateString(wpDateGmt: string): string {
	return wpDateGmt.slice(0, 10);
}

// ---------------------------------------------------------------------------
// Core builder (pure function — no I/O)
// ---------------------------------------------------------------------------

/**
 * Builds a PostFrontmatter object from a WP post.
 *
 * Requires _embedded data (author, wp:term, wp:featuredmedia).
 */
export function buildFrontmatter(post: WpPost): PostFrontmatter {
	// --- title (decode basic HTML entities) ---
	const title = stripHtml(post.title.rendered);

	// --- author (W-01: always display_name, decoded) ---
	const authorObj = post._embedded?.author?.[0];
	const author = decodeEntities(authorObj?.name ?? 'Unknown Author');

	// --- dates ---
	const publishDate = toDateString(post.date_gmt);
	const modifiedDate = toDateString(post.modified_gmt);
	const updated = modifiedDate !== publishDate ? modifiedDate : undefined;

	// --- excerpt (SC-MIG-08) ---
	const rawExcerpt = stripHtml(post.excerpt.rendered);
	let excerpt: string;
	if (rawExcerpt.length >= 10) {
		excerpt = rawExcerpt;
	} else {
		// Derive from body: strip HTML then take first 160 chars
		const bodyText = stripHtml(post.content.rendered);
		excerpt = bodyText.slice(0, 160).trim();
	}

	// --- description (excerpt, max 160 chars) ---
	const description = excerpt.slice(0, 160);

	// --- coverImage (SC-CDN-07) ---
	const featuredMedia = post._embedded?.['wp:featuredmedia'];
	const hasFeatured =
		post.featured_media &&
		post.featured_media > 0 &&
		featuredMedia &&
		featuredMedia.length > 0;
	const coverImage = hasFeatured
		? (featuredMedia![0].source_url ?? DEFAULT_COVER_IMAGE)
		: DEFAULT_COVER_IMAGE;

	// --- categories / tags from wp:term ---
	// wp:term[0] = categories, wp:term[1] = tags (per WP REST API embedding convention)
	const terms = post._embedded?.['wp:term'] ?? [];
	const categoryTerms = terms[0] ?? [];
	const tagTerms = terms[1] ?? [];

	const categories = categoryTerms
		.filter((t) => t.taxonomy === 'category')
		.map((t) => decodeEntities(t.name));
	const tags = tagTerms
		.filter((t) => t.taxonomy === 'post_tag')
		.map((t) => decodeEntities(t.name));

	return {
		title,
		description,
		author,
		slug: post.slug,
		publishDate,
		...(updated !== undefined ? { updated } : {}),
		excerpt,
		coverImage,
		categories,
		tags,
		draft: false,
	};
}

// ---------------------------------------------------------------------------
// YAML serializer
// ---------------------------------------------------------------------------

/**
 * Serializes a value to a safe YAML scalar string.
 * Uses double-quoted strings when the value contains special YAML chars.
 */
function yamlScalar(value: string): string {
	// Characters that require quoting in YAML
	const needsQuotes =
		value.includes(':') ||
		value.includes('"') ||
		value.includes("'") ||
		value.includes('#') ||
		value.includes('{') ||
		value.includes('}') ||
		value.includes('[') ||
		value.includes(']') ||
		value.includes(',') ||
		value.startsWith('*') ||
		value.startsWith('&') ||
		value.startsWith('!') ||
		value.startsWith('|') ||
		value.startsWith('>') ||
		value.startsWith('%') ||
		value.startsWith('@') ||
		value.startsWith('`') ||
		value.trim() !== value;

	if (!needsQuotes) return value;

	// Escape backslashes and double-quotes, then wrap in double quotes
	const escaped = value.replace(/\\/g, '\\\\').replace(/"/g, '\\"');
	return `"${escaped}"`;
}

/** Serializes a string array to YAML inline array, e.g. ["a", "b"] */
function yamlStringArray(arr: string[]): string {
	if (arr.length === 0) return '[]';
	const items = arr.map((s) => yamlScalar(s)).join(', ');
	return `[${items}]`;
}

/**
 * Serializes a PostFrontmatter to a YAML front-matter block
 * delimited by --- ... ---
 *
 * Omits `updated` if not set (SC-MIG-09).
 */
export function buildFrontmatterYaml(fm: PostFrontmatter): string {
	const lines: string[] = ['---'];

	lines.push(`title: ${yamlScalar(fm.title)}`);
	lines.push(`description: ${yamlScalar(fm.description)}`);
	lines.push(`author: ${yamlScalar(fm.author)}`);
	lines.push(`slug: ${fm.slug}`);
	lines.push(`publishDate: ${fm.publishDate}`);
	if (fm.updated !== undefined) {
		lines.push(`updated: ${fm.updated}`);
	}
	lines.push(`excerpt: ${yamlScalar(fm.excerpt)}`);
	lines.push(`coverImage: ${fm.coverImage}`);
	lines.push(`categories: ${yamlStringArray(fm.categories)}`);
	lines.push(`tags: ${yamlStringArray(fm.tags)}`);
	lines.push(`draft: false`);
	lines.push('---');

	return lines.join('\n') + '\n';
}
