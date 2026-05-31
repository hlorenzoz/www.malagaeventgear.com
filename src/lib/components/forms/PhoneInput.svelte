<script lang="ts">
	import { i18n } from '$lib/i18n.svelte';

	// Curated dial-code list — covers the main markets for MEG (Europe + LATAM)
	const DIAL_CODES: { code: string; label: string; flag: string }[] = [
		{ code: '+34', label: 'ES', flag: '🇪🇸' },
		{ code: '+44', label: 'UK', flag: '🇬🇧' },
		{ code: '+33', label: 'FR', flag: '🇫🇷' },
		{ code: '+49', label: 'DE', flag: '🇩🇪' },
		{ code: '+39', label: 'IT', flag: '🇮🇹' },
		{ code: '+31', label: 'NL', flag: '🇳🇱' },
		{ code: '+32', label: 'BE', flag: '🇧🇪' },
		{ code: '+41', label: 'CH', flag: '🇨🇭' },
		{ code: '+43', label: 'AT', flag: '🇦🇹' },
		{ code: '+351', label: 'PT', flag: '🇵🇹' },
		{ code: '+1', label: 'US', flag: '🇺🇸' },
		{ code: '+54', label: 'AR', flag: '🇦🇷' },
		{ code: '+52', label: 'MX', flag: '🇲🇽' },
	];

	let {
		value = $bindable(''),
		id = 'phone',
		name = 'phone',
		required = false,
		error = '',
		onblur
	}: {
		value?: string;
		id?: string;
		name?: string;
		required?: boolean;
		error?: string;
		onblur?: () => void;
	} = $props();

	let selectedCode = $state('+34');
	let localNumber = $state('');

	// Keep parent value in sync whenever either part changes
	$effect(() => {
		value = localNumber ? `${selectedCode}${localNumber}` : '';
	});
</script>

<div class="flex gap-2">
	<!-- Country code selector -->
	<div class="relative">
		<select
			bind:value={selectedCode}
			aria-label={i18n.t.leadForm.countryCode}
			class="h-full appearance-none rounded-lg border border-border-glass bg-surface-container px-3 py-3 pr-7 font-label-sm text-on-surface focus:outline-none focus:ring-2 focus:ring-electric-blue/50 cursor-pointer min-w-[5.5rem]"
		>
			{#each DIAL_CODES as dial}
				<option value={dial.code}>{dial.flag} {dial.code}</option>
			{/each}
		</select>
		<!-- Chevron icon -->
		<span class="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 text-on-surface-variant text-xs">▾</span>
	</div>

	<!-- Local number input -->
	<input
		type="tel"
		{id}
		{name}
		{required}
		bind:value={localNumber}
		onblur={onblur}
		placeholder="600 123 456"
		autocomplete="tel-national"
		class="flex-1 rounded-lg border px-4 py-3 font-body-md text-on-surface bg-surface-container placeholder:text-on-surface-variant/50 focus:outline-none focus:ring-2 focus:ring-electric-blue/50 transition
			{error ? 'border-red-500' : 'border-border-glass'}"
		aria-invalid={error ? 'true' : undefined}
		aria-describedby={error ? `${id}-error` : undefined}
	/>
</div>

{#if error}
	<p id="{id}-error" class="mt-1 text-sm text-red-400" role="alert">{error}</p>
{/if}
