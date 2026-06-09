<script lang="ts">
	import BlogPost from '$lib/layouts/BlogPost.svelte';
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();

	// data.component is the lazily-loaded mdsvex component (only the rendered Markdown body).
	// BlogPost.svelte wraps it with SEO, header, author links, category links, etc.
	let PostBody = $derived(data.component);
</script>

<BlogPost post={data.post}>
	<PostBody />
</BlogPost>
