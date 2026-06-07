import { describe, it, expect } from 'vitest';
import { decodeEntities } from './decode-entities';
import { slugify } from '../../src/lib/utils/slugify';

describe('decodeEntities — named entities', () => {
	it('decodes &amp;', () => {
		expect(decodeEntities('Corporate &amp; Enterprise')).toBe('Corporate & Enterprise');
	});

	it('decodes &lt; and &gt;', () => {
		expect(decodeEntities('a &lt; b &gt; c')).toBe('a < b > c');
	});

	it('decodes &quot;', () => {
		expect(decodeEntities('say &quot;hello&quot;')).toBe('say "hello"');
	});

	it('decodes &apos; and &#039;', () => {
		expect(decodeEntities("it&apos;s fine")).toBe("it's fine");
		expect(decodeEntities("it&#039;s fine")).toBe("it's fine");
	});

	it('decodes &nbsp; to a regular space', () => {
		expect(decodeEntities('hello&nbsp;world')).toBe('hello world');
	});

	it('decodes typographic entities: &hellip; &ndash; &mdash;', () => {
		expect(decodeEntities('wait&hellip;')).toBe('wait…');
		expect(decodeEntities('2020&ndash;2024')).toBe('2020–2024');
		expect(decodeEntities('em&mdash;dash')).toBe('em—dash');
	});

	it('decodes curly quotes: &rsquo; &lsquo; &ldquo; &rdquo;', () => {
		expect(decodeEntities('it&rsquo;s')).toBe('it’s');
		expect(decodeEntities('&lsquo;quoted&rsquo;')).toBe('‘quoted’');
		expect(decodeEntities('&ldquo;double&rdquo;')).toBe('“double”');
	});
});

describe('decodeEntities — numeric entities', () => {
	it('decodes decimal numeric entities &#NNNN;', () => {
		expect(decodeEntities('&#8217;')).toBe('’'); // right single quote
		expect(decodeEntities('&#8211;')).toBe('–'); // en dash
		expect(decodeEntities('&#8220;')).toBe('“'); // left double quote
		expect(decodeEntities('&#8221;')).toBe('”'); // right double quote
		expect(decodeEntities('&#38;')).toBe('&');
	});

	it('decodes hex numeric entities &#xHH;', () => {
		expect(decodeEntities('&#x2019;')).toBe('’');
		expect(decodeEntities('&#x26;')).toBe('&');
		expect(decodeEntities('&#x201C;')).toBe('“');
	});
});

describe('decodeEntities — integration with slugify', () => {
	it('Corporate &amp; Enterprise → corporate-enterprise (NOT corporate-amp-enterprise)', () => {
		const decoded = decodeEntities('Corporate &amp; Enterprise');
		expect(decoded).toBe('Corporate & Enterprise');
		expect(slugify(decoded)).toBe('corporate-enterprise');
	});

	it('Events &amp; Weddings → events-weddings', () => {
		expect(slugify(decodeEntities('Events &amp; Weddings'))).toBe('events-weddings');
	});

	// Real MEG categories from dry-run
	it('Audio Visual Rental → audio-visual-rental (no entities, passes through)', () => {
		expect(slugify(decodeEntities('Audio Visual Rental'))).toBe('audio-visual-rental');
	});

	it('Corporate &amp; Enterprise → corporate-enterprise (real MEG category)', () => {
		expect(slugify(decodeEntities('Corporate &amp; Enterprise'))).toBe('corporate-enterprise');
	});
});

describe('decodeEntities — edge cases', () => {
	it('returns plain strings unchanged', () => {
		expect(decodeEntities('hello world')).toBe('hello world');
	});

	it('handles empty string', () => {
		expect(decodeEntities('')).toBe('');
	});

	it('handles multiple entities in one string', () => {
		expect(decodeEntities('&lt;p&gt;Hello &amp; &quot;world&quot;&lt;/p&gt;')).toBe(
			'<p>Hello & "world"</p>'
		);
	});

	it('does not corrupt already-decoded text', () => {
		expect(decodeEntities('Corporate & Enterprise')).toBe('Corporate & Enterprise');
	});
});
