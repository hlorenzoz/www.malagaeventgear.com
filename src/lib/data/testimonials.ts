import { z } from 'zod';
import reviewsRaw from './reviews.json';
import { reviewTranslationOverrides } from './reviews.overrides';

// Public Google My Business profile (reviews) share link for Malaga Event Gear.
export const GMB_PROFILE_URL = 'https://share.google/xlg0PV3QeGBNKVnA9';

// Localized string schema (mirrors the pattern used in packages.ts)
const LocalizedTextSchema = z.object({
	en: z.string(),
	es: z.string()
});
export type LocalizedText = z.infer<typeof LocalizedTextSchema>;

// A single Google review, rendered as a testimonial card
export const TestimonialSchema = z.object({
	id: z.string(), // stable slug derived from author (+ text) by the ingest script
	author: z.string(),
	avatarUrl: z.string().optional(), // may be missing or hotlink-protected → fallback to initial
	rating: z.number().min(1).max(5),
	relativeTime: z.string(), // "12 months ago" — label exactly as Google renders it
	text: z.string(), // review body in its ORIGINAL language
	lang: z.string().optional(), // detected language of `text` (es | en | zh | …)
	translation: LocalizedTextSchema.optional(), // optional manual EN/ES override
	profileUrl: z.string().optional(),
	source: z.literal('google').default('google')
});
export type Testimonial = z.infer<typeof TestimonialSchema>;

// Aggregate rating block shown next to the cards
export const ReviewsMetaSchema = z.object({
	averageRating: z.number(),
	totalCount: z.number(),
	fetchedAt: z.string() // ISO timestamp of the last successful ingest
});
export type ReviewsMeta = z.infer<typeof ReviewsMetaSchema>;

const ReviewsFileSchema = z.object({
	meta: ReviewsMetaSchema,
	testimonials: z.array(z.unknown())
});

// Parse the curated review file once at module load. A malformed file should never
// crash the whole site, so we fall back to an empty-but-valid dataset.
const parsedFile = ReviewsFileSchema.safeParse(reviewsRaw);

if (!parsedFile.success) {
	console.error('Invalid reviews.generated.json structure', parsedFile.error.format());
}

const meta: ReviewsMeta = parsedFile.success
	? parsedFile.data.meta
	: { averageRating: 0, totalCount: 0, fetchedAt: new Date(0).toISOString() };

// Validate each testimonial individually. Invalid items are dropped (with a warning)
// instead of throwing — one bad scraped review must not blank out the section.
const testimonials: Testimonial[] = (parsedFile.success ? parsedFile.data.testimonials : [])
	.map((item) => {
		const result = TestimonialSchema.safeParse(item);
		if (!result.success) {
			console.warn('Skipping invalid testimonial', result.error.format());
			return null;
		}
		// Merge hand-written translation overrides without letting them clobber
		// a translation that may already be present on the scraped item.
		const override = reviewTranslationOverrides[result.data.id];
		return override ? { ...result.data, translation: result.data.translation ?? override } : result.data;
	})
	.filter((t): t is Testimonial => t !== null);

export const getTestimonials = (limit?: number): Testimonial[] =>
	typeof limit === 'number' ? testimonials.slice(0, limit) : testimonials;

export const getReviewsMeta = (): ReviewsMeta => meta;
