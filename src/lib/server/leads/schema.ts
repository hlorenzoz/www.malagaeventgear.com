import { z } from 'zod';

// ISO date string in YYYY-MM-DD format, must be in the future
const futureDateString = z
	.string()
	.min(1, 'required')
	.regex(/^\d{4}-\d{2}-\d{2}$/, 'invalid-date-format')
	.refine((val) => {
		// Compare as date strings (YYYY-MM-DD) to avoid timezone ambiguity with Date parsing
		const todayStr = new Date().toISOString().slice(0, 10);
		return val > todayStr;
	}, 'date-must-be-future');

// Same future-date rule, but optional: empty string is allowed (no date given).
const optionalFutureDateString = z
	.string()
	.optional()
	.default('')
	.refine((val) => {
		if (!val) return true; // empty = not provided
		if (!/^\d{4}-\d{2}-\d{2}$/.test(val)) return false;
		const todayStr = new Date().toISOString().slice(0, 10);
		return val > todayStr;
	}, 'date-must-be-future');

export const LeadInputSchema = z.object({
	packageId: z.string().min(1, 'required'),
	name: z.string().min(1, 'required').min(2, 'too-short'),
	email: z.string().min(1, 'required').email('invalid-email'),
	phone: z.string().min(1, 'required'),
	eventDate: futureDateString,
	comments: z.string().max(1000).optional().default(''),
	// Cloudflare Turnstile token
	'cf-turnstile-response': z.string().optional().default(''),
	// Honeypot — must be empty; presence is checked in the endpoint, not schema
	website: z.string().optional().default(''),
});

export type LeadInput = z.infer<typeof LeadInputSchema>;

/**
 * Lenient schema for the general contact form.
 * Only name, email, and message are required; everything else is optional.
 * Maps onto the same lead pipeline (message → comments, eventType → packageId).
 */
export const ContactInputSchema = z.object({
	name: z.string().min(1, 'required').min(2, 'too-short'),
	email: z.string().min(1, 'required').email('invalid-email'),
	message: z.string().min(1, 'required').max(2000, 'too-long'),
	phone: z.string().optional().default(''),
	eventDate: optionalFutureDateString,
	eventType: z.string().optional().default(''),
	// Cloudflare Turnstile token
	'cf-turnstile-response': z.string().optional().default(''),
	// Honeypot — must be empty; presence is checked in the endpoint, not schema
	website: z.string().optional().default(''),
});

export type ContactInput = z.infer<typeof ContactInputSchema>;
