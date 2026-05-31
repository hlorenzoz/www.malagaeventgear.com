/**
 * Raw D1 SQL helpers — I/O boundary.
 * Uses Web APIs only: crypto.randomUUID(), no Node deps.
 */

export interface LeadRow {
	id: string;
	package_slug: string;
	name: string;
	email: string;
	phone: string | null;
	event_date: string | null;
	message: string | null;
	lang: string;
	status: string;
	created_at: string;
	updated_at: string;
}

export interface LeadEventRow {
	id: string;
	lead_id: string;
	step: string;
	meta: string | null;
	created_at: string;
}

export interface RecipientRow {
	id: string;
	package_id: string | null;
	email: string;
	active: number;
	created_at: string;
}

export async function insertLead(
	db: D1Database,
	params: Omit<LeadRow, 'id' | 'created_at' | 'updated_at'>,
): Promise<string> {
	const id = crypto.randomUUID();
	const now = new Date().toISOString();

	await db
		.prepare(
			`INSERT INTO leads (id, package_slug, name, email, phone, event_date, message, lang, status, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
		)
		.bind(
			id,
			params.package_slug,
			params.name,
			params.email,
			params.phone ?? null,
			params.event_date ?? null,
			params.message ?? null,
			params.lang,
			params.status,
			now,
			now,
		)
		.run();

	return id;
}

export async function insertLeadEvent(
	db: D1Database,
	params: Pick<LeadEventRow, 'lead_id' | 'step' | 'meta'>,
): Promise<string> {
	const id = crypto.randomUUID();
	const now = new Date().toISOString();

	await db
		.prepare(
			`INSERT INTO lead_events (id, lead_id, step, meta, created_at)
       VALUES (?, ?, ?, ?, ?)`,
		)
		.bind(id, params.lead_id, params.step, params.meta ?? null, now)
		.run();

	return id;
}

export async function insertEmailMessage(
	db: D1Database,
	params: { lead_id: string; kind: string; resend_id: string | null; status: string },
): Promise<string> {
	const id = crypto.randomUUID();
	const now = new Date().toISOString();

	await db
		.prepare(
			`INSERT INTO email_messages (id, lead_id, kind, resend_id, sent_at, status)
       VALUES (?, ?, ?, ?, ?, ?)`,
		)
		.bind(id, params.lead_id, params.kind, params.resend_id ?? null, now, params.status)
		.run();

	return id;
}

export async function insertReviewRequest(
	db: D1Database,
	params: { lead_id: string; event_date: string; next_send_at: string },
): Promise<string> {
	const id = crypto.randomUUID();
	// 32-byte random token → base64url (Web API, no Node)
	const tokenBytes = new Uint8Array(32);
	crypto.getRandomValues(tokenBytes);
	const token = btoa(String.fromCharCode(...tokenBytes))
		.replace(/\+/g, '-')
		.replace(/\//g, '_')
		.replace(/=+$/, '');

	const now = new Date().toISOString();

	await db
		.prepare(
			`INSERT INTO review_requests (id, lead_id, token, event_date, next_send_at, send_count, max_sends, clicked_at, created_at)
       VALUES (?, ?, ?, ?, ?, 0, 3, NULL, ?)`,
		)
		.bind(id, params.lead_id, token, params.event_date, params.next_send_at, now)
		.run();

	return id;
}

/**
 * Rate-limit check: count leads created by this IP in the last window (seconds).
 * Uses lead_events or a lightweight approach via D1 — here we use a simple
 * count on leads.created_at since CF-Connecting-IP is stored in meta of the event.
 *
 * More accurate: count lead_events WHERE meta LIKE '%ip%' — but that requires JSON parsing in SQL.
 * Simple approach: store IP in a separate column or in lead_events.meta JSON.
 * For Phase 2, we count rows inserted in the last `windowSecs` seconds where
 * the submitted event meta contains the IP (JSON string match).
 */
export async function countRecentLeadsByIP(
	db: D1Database,
	ip: string,
	windowSecs: number,
): Promise<number> {
	const since = new Date(Date.now() - windowSecs * 1000).toISOString();
	const result = await db
		.prepare(
			`SELECT COUNT(*) as cnt FROM lead_events
       WHERE step = 'submitted'
         AND meta LIKE ?
         AND created_at > ?`,
		)
		.bind(`%"ip":"${ip}"%`, since)
		.first<{ cnt: number }>();

	return result?.cnt ?? 0;
}

export async function getActiveRecipientsByPackage(
	db: D1Database,
	packageSlug: string,
): Promise<string[]> {
	const rows = await db
		.prepare(
			`SELECT email FROM recipients WHERE package_id = ? AND active = 1`,
		)
		.bind(packageSlug)
		.all<{ email: string }>();

	return rows.results.map((r) => r.email);
}

export async function getGlobalActiveRecipients(db: D1Database): Promise<string[]> {
	const rows = await db
		.prepare(`SELECT email FROM recipients WHERE package_id IS NULL AND active = 1`)
		.all<{ email: string }>();

	return rows.results.map((r) => r.email);
}
