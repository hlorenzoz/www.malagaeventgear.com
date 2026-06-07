<script lang="ts">
	import BlogPost from '$lib/layouts/BlogPost.svelte';
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();

	// The mdsvex component (data.post.component) contains only the rendered Markdown body.
	// BlogPost.svelte wraps it with SEO, header, author links, category links, etc.
	let PostBody = $derived(data.post.component);
</script>

<BlogPost post={data.post}>
	<PostBody />
</BlogPost>
