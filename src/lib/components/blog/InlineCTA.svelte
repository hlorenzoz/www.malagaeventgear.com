<script lang="ts">
	import { getContext } from 'svelte';
	import PostCTA from './PostCTA.svelte';
	import { getPackageBySlug, type EventPackage } from '$lib/data/packages';

	// El layout BlogPost.svelte expone el paquete resuelto del post como un getter
	// vía setContext('post-package', () => resolvedPackage). Lo leemos acá para que
	// el CTA inline coincida exactamente con el CTA del final del post.
	const getPkg = getContext<(() => EventPackage) | undefined>('post-package');

	// Fallback seguro: si el componente se renderiza fuera de BlogPost (o el context
	// no está disponible durante prerender), caemos al pack 'eco'.
	let pkg = $derived(getPkg?.() ?? getPackageBySlug('eco')!);
</script>

<div data-testid="inline-cta">
	<PostCTA {pkg} />
</div>
