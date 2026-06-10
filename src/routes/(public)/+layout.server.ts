import { getCategories } from '$lib/data/blog';
import type { LayoutServerLoad } from './$types';

// Server-only: serializa solo el array de categorías (≈6 objetos pequeños) para el Footer,
// sin arrastrar $lib/data/blog (frontmatter de todos los posts) al bundle cliente del layout.
export const load: LayoutServerLoad = () => {
	return { categories: getCategories() };
};
