import { error } from '@sveltejs/kit';
import { getPackageBySlug, packages } from '$lib/data/packages';
import type { EntryGenerator, PageLoad } from './$types';

// Statically generate one page per package slug (better SEO/perf for static content)
export const prerender = true;

export const entries: EntryGenerator = () => packages.map((pkg) => ({ slug: pkg.slug }));

export const load: PageLoad = ({ params }) => {
	const pkg = getPackageBySlug(params.slug);
	if (!pkg) {
		error(404, 'Package not found');
	}
	return { pkg };
};
