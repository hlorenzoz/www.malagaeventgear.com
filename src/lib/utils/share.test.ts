import { describe, it, expect } from 'vitest';
import { getShareLinks } from './share';

describe('share utility', () => {
	const testUrl = 'https://malagaeventgear.com/blog/test-post/';
	const testTitle = 'Test Post Title';
	const testCover = 'https://cdn.malagaeventgear.com/test-cover.jpg';

	it('should generate correct share links for all platforms', () => {
		const links = getShareLinks(testUrl, testTitle, testCover);

		// We expect 6 platform links
		expect(links.length).toBe(6);

		// WhatsApp
		const whatsapp = links.find((l) => l.name === 'WhatsApp');
		expect(whatsapp?.href).toBe(
			`https://api.whatsapp.com/send?text=${encodeURIComponent(testTitle + ' ' + testUrl)}`
		);

		// Facebook
		const facebook = links.find((l) => l.name === 'Facebook');
		expect(facebook?.href).toBe(
			`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(testUrl)}`
		);

		// Twitter
		const twitter = links.find((l) => l.name === 'Twitter');
		expect(twitter?.href).toBe(
			`https://twitter.com/intent/tweet?text=${encodeURIComponent(testTitle)}&url=${encodeURIComponent(testUrl)}`
		);

		// Pinterest
		const pinterest = links.find((l) => l.name === 'Pinterest');
		expect(pinterest?.href).toBe(
			`https://pinterest.com/pin/create/button/?url=${encodeURIComponent(testUrl)}&description=${encodeURIComponent(testTitle)}&media=${encodeURIComponent(testCover)}`
		);

		// LinkedIn
		const linkedin = links.find((l) => l.name === 'LinkedIn');
		expect(linkedin?.href).toBe(
			`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(testUrl)}`
		);

		// Email
		const email = links.find((l) => l.name === 'Email');
		expect(email?.href).toBe(
			`mailto:?subject=${encodeURIComponent(testTitle)}&body=${encodeURIComponent(testUrl)}`
		);
	});

	it('should omit media query from Pinterest share link if coverImage is not provided', () => {
		const links = getShareLinks(testUrl, testTitle);
		const pinterest = links.find((l) => l.name === 'Pinterest');
		expect(pinterest?.href).toBe(
			`https://pinterest.com/pin/create/button/?url=${encodeURIComponent(testUrl)}&description=${encodeURIComponent(testTitle)}`
		);
	});
});
