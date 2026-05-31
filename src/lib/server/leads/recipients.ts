import {
	getActiveRecipientsByPackage,
	getGlobalActiveRecipients,
} from '$lib/server/db/queries';

/**
 * Resolves the list of email recipients for a lead notification.
 *
 * Resolution order (design.md §recipients):
 * 1. D1 active rows for package_slug match
 * 2. If empty: D1 global active rows (package_id IS NULL)
 * 3. If still empty: env.LEAD_NOTIFY_EMAILS comma-split
 * 4. Final fallback: [] (log warning)
 *
 * I/O: injects db + env so pure branches are unit-testable via vi.fn() mocks.
 */
export async function resolveRecipients(
	db: D1Database,
	packageSlug: string,
	leadNotifyEmails: string,
): Promise<string[]> {
	// 1. Package-scoped
	const packageRecipients = await getActiveRecipientsByPackage(db, packageSlug);
	if (packageRecipients.length > 0) return packageRecipients;

	// 2. Global
	const globalRecipients = await getGlobalActiveRecipients(db);
	if (globalRecipients.length > 0) return globalRecipients;

	// 3. Env fallback
	if (leadNotifyEmails) {
		const envRecipients = leadNotifyEmails
			.split(',')
			.map((s) => s.trim())
			.filter(Boolean);
		if (envRecipients.length > 0) return envRecipients;
	}

	// 4. No recipients — lead still saved, emails silently skipped
	return [];
}
