/**
 * Tests para la lógica pura de post-touch.ts
 *
 * La función setUpdatedField es la única lógica pura exportada.
 * Los I/O (readFileSync, writeFileSync) no se testean aquí.
 */

import { describe, it, expect } from 'vitest';
import { setUpdatedField } from './post-touch';

// Frontmatter base de ejemplo con publishDate
const baseSvx = `---
title: "Mi Post"
description: "Una descripción de ejemplo para el post."
author: "Hector Luis Lorenzo"
publishDate: "2026-01-15"
excerpt: "Excerpt de ejemplo con más de diez caracteres aquí."
coverImage: "https://cdn.malagaeventgear.com/blog-media/placeholder.webp"
categories: []
tags: []
draft: true
---

Contenido del post aquí.
`;

describe('setUpdatedField', () => {
	it('inserts updated after publishDate when not present', () => {
		const result = setUpdatedField(baseSvx, '2026-06-07');
		expect(result).toContain('updated: "2026-06-07"');
		// Should appear right after publishDate line
		const lines = result.split('\n');
		const pubIdx = lines.findIndex((l) => l.startsWith('publishDate:'));
		const updatedIdx = lines.findIndex((l) => l.startsWith('updated:'));
		expect(pubIdx).toBeGreaterThan(-1);
		expect(updatedIdx).toBe(pubIdx + 1);
	});

	it('replaces an existing updated field', () => {
		const withUpdated = baseSvx.replace(
			'draft: true',
			'updated: "2026-01-20"\ndraft: true'
		);
		const result = setUpdatedField(withUpdated, '2026-06-07');
		expect(result).toContain('updated: "2026-06-07"');
		// Should not contain the old date
		expect(result).not.toContain('updated: "2026-01-20"');
		// Should only appear once
		const occurrences = (result.match(/^updated:/gm) ?? []).length;
		expect(occurrences).toBe(1);
	});

	it('preserves the body content unchanged', () => {
		const result = setUpdatedField(baseSvx, '2026-06-07');
		expect(result).toContain('Contenido del post aquí.');
	});

	it('does not duplicate content when called twice', () => {
		const first = setUpdatedField(baseSvx, '2026-06-07');
		const second = setUpdatedField(first, '2026-06-08');
		// Only one updated line
		const occurrences = (second.match(/^updated:/gm) ?? []).length;
		expect(occurrences).toBe(1);
		expect(second).toContain('updated: "2026-06-08"');
		expect(second).not.toContain('updated: "2026-06-07"');
	});

	it('inserts updated before draft when no publishDate present', () => {
		const noPublishDate = `---
title: "Post sin publishDate"
description: "Descripción de ejemplo suficientemente larga aquí."
author: "Autor"
draft: false
---

Cuerpo.
`;
		const result = setUpdatedField(noPublishDate, '2026-06-07');
		expect(result).toContain('updated: "2026-06-07"');
		const lines = result.split('\n');
		const updatedIdx = lines.findIndex((l) => l.startsWith('updated:'));
		const draftIdx = lines.findIndex((l) => l.startsWith('draft:'));
		expect(updatedIdx).toBeLessThan(draftIdx);
	});

	it('throws when frontmatter is missing', () => {
		expect(() => setUpdatedField('Sin frontmatter', '2026-06-07')).toThrow();
	});

	it('throws when frontmatter closing --- is missing', () => {
		const malformed = `---
title: "Malformado"
`;
		expect(() => setUpdatedField(malformed, '2026-06-07')).toThrow();
	});
});
