import { file, write } from "bun";

const filePath = "worker-configuration.d.ts";
const f = file(filePath);

if (await f.exists()) {
	const content = await f.text();
	const target = 'typeof import("./.svelte-kit/cloudflare/_worker")';
	if (content.includes(target)) {
		const newContent = content.replace(target, "any");
		await write(f, newContent);
		console.log("Patch applied to worker-configuration.d.ts successfully.");
	} else {
		console.log("No patch needed or already applied.");
	}
} else {
	console.log("worker-configuration.d.ts does not exist.");
}
