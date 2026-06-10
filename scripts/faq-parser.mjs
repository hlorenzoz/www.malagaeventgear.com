/**
 * Shared FAQ parser — pure function, no Node.js dependencies.
 *
 * Given a post's raw .svx body (markdown after frontmatter), finds the FAQ
 * section marked by ## FAQs (or ## FAQ), treats each ### heading as a question,
 * and collects the text between that h3 and the next h3 / h2 / end as the answer.
 *
 * Returns [{ question: string, answer: string }].
 * Answer is plain text: markdown links, bold, italic, and list markers stripped;
 * whitespace collapsed.
 *
 * Semantics match the rehype-faq-accordion.mjs plugin so head JSON-LD and body
 * HTML always represent the same data.
 *
 * @param {string} body - Raw markdown body of the post (after frontmatter).
 * @returns {{ question: string; answer: string }[]}
 */
export function parseFaqs(body) {
	if (!body || typeof body !== 'string') return [];

	const lines = body.split('\n');

	// Find the ## FAQs / ## FAQ heading
	let faqStart = -1;
	for (let i = 0; i < lines.length; i++) {
		if (/^##\s+(FAQs?)\s*$/i.test(lines[i].trim())) {
			faqStart = i;
			break;
		}
	}
	if (faqStart === -1) return [];

	const faqs = [];
	let currentQuestion = null;
	let currentAnswerLines = [];

	function flushQuestion() {
		if (currentQuestion !== null) {
			faqs.push({
				question: currentQuestion,
				answer: cleanAnswer(currentAnswerLines.join('\n')),
			});
		}
		currentQuestion = null;
		currentAnswerLines = [];
	}

	for (let i = faqStart + 1; i < lines.length; i++) {
		const line = lines[i];

		// Stop at the next h2 (## …) — end of FAQ section
		if (/^##\s/.test(line)) {
			flushQuestion();
			break;
		}

		// h3 (### …) = new question
		const h3Match = line.match(/^###\s+(.+)$/);
		if (h3Match) {
			flushQuestion();
			currentQuestion = h3Match[1].trim();
			continue;
		}

		// Collect answer lines when inside a question
		if (currentQuestion !== null) {
			currentAnswerLines.push(line);
		}
	}

	// Flush last question if we reached end of file
	flushQuestion();

	return faqs;
}

/**
 * Strip markdown syntax from answer text and collapse whitespace.
 * @param {string} text
 * @returns {string}
 */
function cleanAnswer(text) {
	return text
		// Strip markdown links: [text](url) → text
		.replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
		// Strip bold: **text** or __text__ → text
		.replace(/\*\*([^*]+)\*\*/g, '$1')
		.replace(/__([^_]+)__/g, '$1')
		// Strip italic: *text* or _text_ → text
		.replace(/\*([^*]+)\*/g, '$1')
		.replace(/_([^_]+)_/g, '$1')
		// Strip ordered list markers: "1. ", "2. ", etc.
		.replace(/^\d+\.\s+/gm, '')
		// Strip unordered list markers: "- ", "– ", "* "
		.replace(/^[-–*]\s+/gm, '')
		// Collapse multiple blank lines into at most one
		.replace(/\n{3,}/g, '\n\n')
		// Collapse leading/trailing whitespace
		.trim();
}
