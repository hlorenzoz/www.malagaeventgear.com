import { readdir, readFile, writeFile } from 'fs/promises';
import { join } from 'path';

const BLOG_DIR = join(process.cwd(), 'src/content/blog');

async function main() {
	console.log(`Scanning blog directory: ${BLOG_DIR}...`);
	const files = await readdir(BLOG_DIR);
	const svxFiles = files.filter(f => f.endsWith('.svx') && !f.includes('test-fixture'));

	console.log(`Found ${svxFiles.length} blog posts to process.`);

	let modifiedCount = 0;

	for (const filename of svxFiles) {
		const filepath = join(BLOG_DIR, filename);
		let content = await readFile(filepath, 'utf-8');

		// 1. Parse frontmatter categories and slug
		const frontmatterMatch = content.match(/^---\r?\n([\s\S]*?)\r?\n---/);
		if (!frontmatterMatch) {
			console.warn(`[SKIP] No frontmatter found in ${filename}`);
			continue;
		}

		const frontmatterText = frontmatterMatch[1];
		const slugMatch = frontmatterText.match(/slug:\s*(["']?)(.*?)\1/);
		const slug = slugMatch ? slugMatch[2] : filename.replace('.svx', '');
		
		const categoriesMatch = frontmatterText.match(/categories:\s*\[(.*?)]/) || frontmatterText.match(/categories:\s*\r?\n(\s*-\s*.*)+/);
		let categoriesStr = '';
		if (categoriesMatch) {
			categoriesStr = categoriesMatch[0];
		}

		// 2. Classify category for package images
		let category: 'wedding' | 'mice' | 'eco' = 'eco';
		const lowerSlug = slug.toLowerCase();
		const lowerCategories = categoriesStr.toLowerCase();

		if (lowerCategories.includes('wedding') || lowerSlug.includes('wedding')) {
			category = 'wedding';
		} else if (
			lowerCategories.includes('corporate') || 
			lowerCategories.includes('mice') ||
			lowerSlug.includes('conference') || 
			lowerSlug.includes('seminar') || 
			lowerSlug.includes('meeting') || 
			lowerSlug.includes('product-launch') ||
			lowerSlug.includes('mice')
		) {
			category = 'mice';
		}

		// Check if ImageMarquee is already injected to make it idempotent
		if (content.includes('ImageMarquee')) {
			console.log(`[SKIP] ImageMarquee already present in ${filename}`);
			continue;
		}

		// 3. Inject Imports into <script> tag
		const marqueeImport = `import ImageMarquee from '$lib/components/home/ImageMarquee.svelte';`;
		const galleryImport = `import { getImagesForPackage } from '$lib/data/gallery';`;

		const scriptRegex = /(<script[^>]*>)([\s\S]*?)(<\/script>)/;
		const scriptMatch = content.match(scriptRegex);

		if (scriptMatch) {
			// Script block exists, inject imports inside it
			const openingTag = scriptMatch[1];
			let scriptBody = scriptMatch[2];
			const closingTag = scriptMatch[3];

			// Ensure imports are in scriptBody
			if (!scriptBody.includes('ImageMarquee')) {
				scriptBody = `\n\t${marqueeImport}\n\t${galleryImport}${scriptBody}`;
			}
			content = content.replace(scriptRegex, `${openingTag}${scriptBody}${closingTag}`);
		} else {
			// No script block, create one after frontmatter
			const endOfFrontmatter = frontmatterMatch[0];
			const newScriptBlock = `\n\n<script>\n\t${marqueeImport}\n\t${galleryImport}\n</script>`;
			content = content.replace(endOfFrontmatter, `${endOfFrontmatter}${newScriptBlock}`);
		}

		// 4. Find the best placement H2 heading (~60% depth)
		const lines = content.split(/\r?\n/);
		const headings: { text: string; lineIndex: number }[] = [];

		// We scan lines outside frontmatter and scripts to find valid H2 headings
		let inFrontmatter = false;
		let inScript = false;
		let frontmatterDashesCount = 0;

		for (let i = 0; i < lines.length; i++) {
			const line = lines[i].trim();
			if (line === '---') {
				frontmatterDashesCount++;
				inFrontmatter = frontmatterDashesCount < 2;
				continue;
			}
			if (inFrontmatter) continue;

			if (line.startsWith('<script')) {
				inScript = true;
				continue;
			}
			if (line.startsWith('</script>')) {
				inScript = false;
				continue;
			}
			if (inScript) continue;

			if (line.startsWith('## ')) {
				const headingText = line.replace('## ', '').trim().toLowerCase();
				// Filter out structural headings
				const isStructural = [
					'brief overview',
					'key highlights',
					'table of contents',
					'testimonials',
					'conclusions',
					'faqs',
					'faq',
					'inviting feedback',
					'conclusión'
				].some(term => headingText.includes(term));

				if (!isStructural) {
					headings.push({ text: line, lineIndex: i });
				}
			}
		}

		// 5. Inject the ImageMarquee component code
		const marqueeCode = `\n<div class="my-12 overflow-hidden w-full">\n\t<ImageMarquee images={getImagesForPackage('${category}')} speed="normal" direction="left" />\n</div>\n\n`;

		if (headings.length > 0) {
			// Select heading near 60% of valid H2 headings depth
			const targetIndex = Math.floor(headings.length * 0.6);
			const targetHeading = headings[targetIndex];
			lines[targetHeading.lineIndex] = marqueeCode + lines[targetHeading.lineIndex];
			content = lines.join('\n');
		} else {
			// Fallback: Place it before ## Conclusions or at the end of the body
			let fallbackLineIndex = -1;
			for (let i = 0; i < lines.length; i++) {
				const line = lines[i].trim().toLowerCase();
				if (line.startsWith('## conclusion') || line.startsWith('## faqs') || line.startsWith('## faq')) {
					fallbackLineIndex = i;
					break;
				}
			}

			if (fallbackLineIndex !== -1) {
				lines[fallbackLineIndex] = marqueeCode + lines[fallbackLineIndex];
				content = lines.join('\n');
			} else {
				content += marqueeCode;
			}
		}

		await writeFile(filepath, content, 'utf-8');
		console.log(`[OK] Successfully injected marquee into ${filename} (mapped to package: ${category})`);
		modifiedCount++;
	}

	console.log(`\nAll done! Modified ${modifiedCount} posts.`);
}

main().catch(err => {
	console.error('Migration failed:', err);
	process.exit(1);
});
