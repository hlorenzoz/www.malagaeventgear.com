<script lang="ts">
	interface Props {
		open: boolean;
		title: string;
		message: string;
		actionLabel: string;
		dismissLabel: string;
		onAction: () => void;
		onClose: () => void;
	}

	let {
		open = $bindable(false),
		title,
		message,
		actionLabel,
		dismissLabel,
		onAction,
		onClose,
	}: Props = $props();

	let dialogEl = $state<HTMLDialogElement | null>(null);

	// Drive the native <dialog> from the `open` prop. showModal() gives us the
	// accessible top-layer + backdrop + focus trap for free.
	$effect(() => {
		const el = dialogEl;
		if (!el) return;
		if (open && !el.open) el.showModal();
		else if (!open && el.open) el.close();
	});

	function handleClose() {
		open = false;
		onClose();
	}

	function handleAction() {
		open = false;
		onAction();
	}
</script>

<dialog
	bind:this={dialogEl}
	class="error-modal glass-panel max-w-md rounded-2xl p-0 text-on-surface backdrop:bg-black/60"
	onclose={handleClose}
	aria-labelledby="error-modal-title"
>
	<div class="p-6 md:p-8">
		<div class="mb-4 flex items-start gap-3">
			<span aria-hidden="true" class="text-2xl leading-none text-red-400">⚠</span>
			<h2 id="error-modal-title" class="font-headline-md text-headline-md text-on-surface">
				{title}
			</h2>
		</div>

		<p class="font-body-md text-body-md text-on-surface-variant mb-6">
			{message}
		</p>

		<div class="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
			<button
				type="button"
				class="rounded-lg px-4 py-2.5 text-sm font-medium text-on-surface-variant transition-colors hover:text-on-surface"
				onclick={handleClose}
			>
				{dismissLabel}
			</button>
			<button
				type="button"
				class="rounded-lg bg-electric-blue px-5 py-2.5 text-sm font-semibold text-black transition-opacity hover:opacity-90"
				onclick={handleAction}
			>
				{actionLabel}
			</button>
		</div>
	</div>
</dialog>

<style>
	/* Center the dialog (native <dialog> defaults to auto margins for top-layer). */
	.error-modal {
		margin: auto;
	}
</style>
