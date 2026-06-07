/**
 * Vitest setup for scripts/migrate-wp tests.
 *
 * NOTE: A globalThis.DOMParser patch was attempted here to enable turndown's
 * browser DOMParser code path. It was NOT effective because:
 *   1. turndown@7.x uses `var root = typeof window !== 'undefined' ? window : {}`
 *      → root is always {} in Node/Bun (no global window)
 *   2. root.DOMParser is {} ['DOMParser'] = undefined → domino fallback is always used
 *   3. Patching globalThis.DOMParser does not affect root.DOMParser
 *
 * Conclusion: turndown correctly uses @mixmark-io/domino in Node/Bun.
 * No DOMParser setup is needed. This file is kept as documentation only.
 */

// No setup needed — domino works correctly as turndown's Node fallback.
// See turndown.ts and domino-spike.test.ts for investigation findings.
