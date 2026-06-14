import { readFileSync, writeFileSync, readdirSync } from 'fs';
import { join } from 'path';

const WORKSPACE_DIR = '/Users/hlorenzoz/databank/Development/[MEG - Malaga Event Gear (malagaeventgear.com)]/projects/website';
const REDIRECTS_PATH = join(WORKSPACE_DIR, '_redirects');
const BLOG_DIR = join(WORKSPACE_DIR, 'src/content/blog');

// 1. Correct packages targets in _redirects to include trailing slash
console.log('Updating _redirects targets to use canonical trailing slashes...');
let redirectsContent = readFileSync(REDIRECTS_PATH, 'utf-8');

const packageRedirectsReplacements = [
	{ search: '/packages', replace: '/packages/' },
	{ search: '/packages/eco', replace: '/packages/eco/' },
	{ search: '/packages/wedding', replace: '/packages/wedding/' },
	{ search: '/packages/product-presentation', replace: '/packages/product-presentation/' },
	{ search: '/packages/basic-mice', replace: '/packages/basic-mice/' },
	{ search: '/packages/mice', replace: '/packages/mice/' }
];

packageRedirectsReplacements.forEach(({ search, replace }) => {
	const regex = new RegExp(`(\\s+)${search.replace(/\//g, '\\/')}(\\s+301)`, 'g');
	redirectsContent = redirectsContent.replace(regex, `$1${replace}$2`);
});

writeFileSync(REDIRECTS_PATH, redirectsContent, 'utf-8');
console.log('_redirects updated successfully.');

// 2. Parse redirects to build mapping table
console.log('Parsing redirect rules...');
const lines = redirectsContent.split('\n');
const redirectMap: { from: string; to: string }[] = [];

lines.forEach((line) => {
	const trimmed = line.trim();
	if (!trimmed || trimmed.startsWith('#')) return;

	const parts = trimmed.split(/\s+/);
	if (parts.length >= 2) {
		const from = parts[0];
		const to = parts[1];
		redirectMap.push({ from, to });
	}
});

console.log(`Parsed ${redirectMap.length} redirect rules.`);

// 3. Process blog posts (.svx)
const files = readdirSync(BLOG_DIR).filter((f) => f.endsWith('.svx'));
console.log(`Found ${files.length} blog post files.`);

let totalReplacements = 0;

files.forEach((file) => {
	const filePath = join(BLOG_DIR, file);
	let content = readFileSync(filePath, 'utf-8');
	let modified = false;

	redirectMap.forEach(({ from, to }) => {
		const cleanFrom = from.replace(/^\/|\/$/g, '');
		const cleanTo = to;

		// We match the URL variations but enforce that they are complete URLs (not substrings of longer URLs)
		// We use a regex that matches the variation path, followed by an optional trailing slash,
		// and uses a positive lookahead to ensure it is followed by a URL delimiter: ), ", ', whitespace or end of line.
		const escapedPath = cleanFrom.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');

		const variations = [
			{
				// Match: https://malagaeventgear.com/cleanFrom with optional slash
				pattern: `https:\\/\\/malagaeventgear\\.com\\/${escapedPath}(?:\\/)?(?=[)"'\\s]|$)`,
				replacement: cleanTo
			},
			{
				// Match: /cleanFrom with optional slash (only when preceded by ( or href=" or href=')
				pattern: `(?<=[("'])\\/${escapedPath}(?:\\/)?(?=[)"'\\s]|$)`,
				replacement: cleanTo
			}
		];

		variations.forEach(({ pattern, replacement }) => {
			const regex = new RegExp(pattern, 'g');
			if (regex.test(content)) {
				// Don't replace if it's already the destination URL
				if (cleanTo.replace(/^\/|\/$/g, '') === cleanFrom) return;

				// Reset regex index and replace
				regex.lastIndex = 0;
				content = content.replace(regex, replacement);
				modified = true;
				totalReplacements++;
			}
		});
	});

	if (modified) {
		writeFileSync(filePath, content, 'utf-8');
		console.log(`Modified: ${file}`);
	}
});

console.log(`Finished processing posts. Total link replacements made: ${totalReplacements}`);
