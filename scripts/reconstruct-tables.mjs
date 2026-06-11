/**
 * One-off migration helper: rebuild blog tables destroyed by the WordPress→mdsvex
 * import. Production (malagaeventgear.com) still serves the original <table> markup;
 * the local .svx has each table flattened into orphan paragraphs (one cell per
 * paragraph, row-major) followed by an italic "This table ..." caption.
 *
 * For each affected post:
 *   1. Fetch the production HTML and parse every <table> into a 2D cell array.
 *   2. For each table, build the row-major "needle" (cells joined by \n\n) and
 *      locate it verbatim in the .svx; replace it with a GFM pipe table.
 *   3. Report any table whose needle was not found (needs manual handling).
 *
 * Idempotent: a table already rewritten (needle absent) is reported as "skip".
 * Dry-run by default; pass --write to persist.
 */
import { readFileSync, writeFileSync, readdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const BLOG_DIR = join(__dirname, '..', 'src', 'content', 'blog');
const WRITE = process.argv.includes('--write');
const onlySlug = process.argv.find((a) => a.startsWith('--slug='))?.split('=')[1];

/** Decode HTML entities and strip tags for a single inline fragment (no <br>). */
function decodeInline(s) {
	return s
		.replace(/<[^>]+>/g, '')
		.replace(/&nbsp;/g, ' ')
		.replace(/&amp;/g, '&')
		.replace(/&lt;/g, '<')
		.replace(/&gt;/g, '>')
		.replace(/&quot;/g, '"')
		.replace(/&#8217;|&#039;|&#39;|&rsquo;/g, '’')
		.replace(/&#8216;|&lsquo;/g, '‘')
		.replace(/&#8220;|&ldquo;/g, '“')
		.replace(/&#8221;|&rdquo;/g, '”')
		.replace(/&#8211;|&ndash;/g, '–')
		.replace(/&#8212;|&mdash;/g, '—')
		.replace(/&#8230;|&hellip;/g, '…')
		.replace(/&euro;/g, '€')
		.replace(/[ \t]+/g, ' ')
		.trim();
}

/**
 * A cell becomes an array of line-parts (split on <br>). The WP→mdsvex flattening
 * preserved intra-cell <br> as markdown hardbreaks ("  \n"), so we keep the parts
 * to reproduce both the needle (parts joined by "  \n") and the pipe cell (joined by <br>).
 */
function cellParts(cellHtml) {
	const parts = cellHtml
		.split(/<br\s*\/?>/i)
		.map(decodeInline)
		.filter((p) => p.length > 0);
	return parts.length ? parts : [''];
}

/** Parse all <table> elements into arrays of rows (each row an array of cell part-arrays). */
function parseTables(html) {
	const tables = [];
	const tableRe = /<table[\s\S]*?<\/table>/gi;
	let m;
	while ((m = tableRe.exec(html))) {
		const rows = [];
		const rowRe = /<tr[\s\S]*?<\/tr>/gi;
		let rm;
		while ((rm = rowRe.exec(m[0]))) {
			const cells = [];
			const cellRe = /<(td|th)[\s\S]*?<\/\1>/gi;
			let cm;
			while ((cm = cellRe.exec(rm[0]))) cells.push(cellParts(cm[0]));
			if (cells.length) rows.push(cells);
		}
		if (rows.length) tables.push(rows);
	}
	return tables;
}

/** Render rows (cells = part arrays) as a GFM pipe table; multi-part cells use <br>. */
function toPipe(rows) {
	const cols = Math.max(...rows.map((r) => r.length));
	const cell = (parts) => parts.join('<br>');
	const norm = rows.map((r) => {
		const c = r.map(cell);
		while (c.length < cols) c.push('');
		return c;
	});
	const line = (r) => `| ${r.join(' | ')} |`;
	const sep = `| ${Array(cols).fill('---').join(' | ')} |`;
	return [line(norm[0]), sep, ...norm.slice(1).map(line)].join('\n');
}

/**
 * Row-major flattened representation as it appears in the .svx: each cell is a
 * paragraph (cells separated by \n\n), intra-cell <br> become markdown hardbreaks ("  \n").
 */
function toNeedle(rows) {
	return rows
		.flat()
		.map((parts) => parts.join('  \n'))
		.join('\n\n');
}

/** Flat list of plain cell strings (parts space-joined) for shape/report display. */
function flatCells(rows) {
	return rows.flat().map((parts) => parts.join(' '));
}

const slugFromUrl = (slug) => `https://malagaeventgear.com/${slug}/`;

async function processPost(slug) {
	const file = join(BLOG_DIR, `${slug}.svx`);
	let text;
	try {
		text = readFileSync(file, 'utf8');
	} catch {
		return { slug, error: 'file not found' };
	}

	const res = await fetch(slugFromUrl(slug), { redirect: 'follow' });
	if (!res.ok) return { slug, error: `HTTP ${res.status}` };
	const tables = parseTables(await res.text());
	if (!tables.length) return { slug, error: 'no tables in production' };

	const report = [];
	for (let i = 0; i < tables.length; i++) {
		const rows = tables[i];
		const needle = toNeedle(rows);
		const pipe = toPipe(rows);
		if (text.includes(pipe)) {
			report.push({ t: i + 1, status: 'already', shape: `${rows[0].length}x${rows.length}` });
			continue;
		}
		if (text.includes(needle)) {
			text = text.replace(needle, pipe);
			report.push({ t: i + 1, status: 'rewritten', shape: `${rows[0].length}x${rows.length}` });
		} else {
			report.push({
				t: i + 1,
				status: 'NOT FOUND',
				shape: `${rows[0].length}x${rows.length}`,
				firstCells: flatCells(rows).slice(0, 3)
			});
		}
	}

	if (WRITE) writeFileSync(file, text);
	return { slug, tables: tables.length, report };
}

// Affected slugs: every post whose body still contains a "This table" caption,
// plus any with flattened tables lacking a caption (discovered at runtime).
const captionRe = /this table\b/i;
const allSlugs = readdirSync(BLOG_DIR)
	.filter((f) => f.endsWith('.svx'))
	.map((f) => f.replace(/\.svx$/, ''));
const slugs = onlySlug
	? [onlySlug]
	: allSlugs.filter((s) => captionRe.test(readFileSync(join(BLOG_DIR, `${s}.svx`), 'utf8')));

console.log(`Mode: ${WRITE ? 'WRITE' : 'DRY-RUN'} | posts: ${slugs.length}\n`);

let totalRewritten = 0,
	totalNotFound = 0,
	totalAlready = 0;
for (const slug of slugs) {
	const r = await processPost(slug);
	if (r.error) {
		console.log(`✗ ${slug}: ${r.error}`);
		continue;
	}
	const parts = r.report
		.map((x) => `T${x.t}:${x.status}(${x.shape})${x.firstCells ? ' ' + JSON.stringify(x.firstCells) : ''}`)
		.join('  ');
	console.log(`${slug} [${r.tables} prod tables]  ${parts}`);
	for (const x of r.report) {
		if (x.status === 'rewritten') totalRewritten++;
		else if (x.status === 'NOT FOUND') totalNotFound++;
		else if (x.status === 'already') totalAlready++;
	}
}
console.log(`\nSummary: rewritten=${totalRewritten} already=${totalAlready} NOT_FOUND=${totalNotFound}`);
