<script lang="ts">
	import { goto } from '$app/navigation';
	import { env } from '$env/dynamic/public';
	import { i18n } from '$lib/i18n.svelte';
	import PhoneInput from './PhoneInput.svelte';

	let { packageId }: { packageId: string } = $props();

	// Form field state
	let name = $state('');
	let email = $state('');
	let phone = $state('');
	let eventDate = $state('');
	let comments = $state('');
	// Honeypot — must stay empty
	let websiteHoneypot = $state('');

	// Errors per field
	let errors = $state<Record<string, string>>({});
	let submitError = $state('');
	let isLoading = $state(false);

	// Turnstile token (populated by CF callback)
	let turnstileToken = $state('');

	// Form root — used to lazy-load Turnstile only when the form approaches the viewport
	let formEl = $state<HTMLElement | null>(null);

	// Turnstile site key — gracefully absent in dev
	const TURNSTILE_SITE_KEY = env.PUBLIC_TURNSTILE_SITE_KEY ?? '';

	function injectTurnstileScript() {
		// Expose callback for Turnstile managed widget
		(window as unknown as Record<string, unknown>)['_tsCallback'] = (token: string) => {
			turnstileToken = token;
		};

		if (!document.querySelector('script[data-turnstile]')) {
			const script = document.createElement('script');
			script.src = 'https://challenges.cloudflare.com/turnstile/v0/api.js';
			script.async = true;
			script.defer = true;
			script.setAttribute('data-turnstile', '1');
			document.head.appendChild(script);
		}
	}

	// Defer the Turnstile third-party script until the form nears the viewport. On package pages the
	// form sits below the fold (mobile), so loading it eagerly competed with LCP for network/main-thread.
	$effect(() => {
		if (!TURNSTILE_SITE_KEY || typeof window === 'undefined' || !formEl) return;

		if (!('IntersectionObserver' in window)) {
			injectTurnstileScript();
			return;
		}

		const el = formEl;
		let observer: IntersectionObserver | null = null;
		// Diferir el observe() al siguiente frame: medir la posición del form durante la hidratación
		// fuerza layout sincrónico (forced reflow). Tras el primer paint es gratis.
		const raf = requestAnimationFrame(() => {
			observer = new IntersectionObserver(
				(entries) => {
					if (entries.some((e) => e.isIntersecting)) {
						injectTurnstileScript();
						observer?.disconnect();
					}
				},
				{ rootMargin: '200px' }
			);
			observer.observe(el);
		});

		return () => {
			cancelAnimationFrame(raf);
			observer?.disconnect();
		};
	});

	// Today in YYYY-MM-DD for min date attribute
	function todayString(): string {
		const d = new Date();
		const yyyy = d.getFullYear();
		const mm = String(d.getMonth() + 1).padStart(2, '0');
		const dd = String(d.getDate() + 1).padStart(2, '0'); // tomorrow as minimum
		return `${yyyy}-${mm}-${dd}`;
	}

	// Validators
	function validateName(): string {
		if (!name.trim()) return i18n.t.leadForm.errorRequired;
		if (name.trim().length < 2) return i18n.t.leadForm.errorMinLength;
		return '';
	}

	function validateEmail(): string {
		if (!email.trim()) return i18n.t.leadForm.errorRequired;
		if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) return i18n.t.leadForm.errorEmail;
		return '';
	}

	function validatePhone(): string {
		if (!phone) return i18n.t.leadForm.errorRequired;
		// Must have at least a dial code + 5 digits
		if (phone.replace(/\D/g, '').length < 6) return i18n.t.leadForm.errorPhone;
		return '';
	}

	function validateDate(): string {
		if (!eventDate) return i18n.t.leadForm.errorRequired;
		const selected = new Date(eventDate);
		const today = new Date();
		today.setHours(0, 0, 0, 0);
		if (selected <= today) return i18n.t.leadForm.errorDateFuture;
		return '';
	}

	function validateAll(): boolean {
		const next: Record<string, string> = {
			name: validateName(),
			email: validateEmail(),
			phone: validatePhone(),
			eventDate: validateDate(),
		};
		errors = next;
		return Object.values(next).every((e) => !e);
	}

	// Blur handlers
	function blurName() { errors = { ...errors, name: validateName() }; }
	function blurEmail() { errors = { ...errors, email: validateEmail() }; }
	function blurPhone() { errors = { ...errors, phone: validatePhone() }; }
	function blurDate() { errors = { ...errors, eventDate: validateDate() }; }

	async function handleSubmit(event: SubmitEvent) {
		event.preventDefault();

		// Honeypot check — silent discard
		if (websiteHoneypot) {
			await goto('/thank-you/?lead=stub');
			return;
		}

		if (!validateAll()) return;
		if (isLoading) return;

		isLoading = true;
		submitError = '';

		try {
			const res = await fetch('/api/leads', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({
					packageId,
					name: name.trim(),
					email: email.trim(),
					phone,
					eventDate,
					comments: comments.trim(),
					'cf-turnstile-response': turnstileToken,
					website: websiteHoneypot,
				}),
			});

			const data = (await res.json()) as { ok: boolean; leadId?: string };

			if (!res.ok || !data.ok) {
				submitError = i18n.t.leadForm.errorSubmit;
				return;
			}

			await goto(`/thank-you/?lead=${data.leadId ?? ''}`);
		} catch {
			submitError = i18n.t.leadForm.errorSubmit;
		} finally {
			isLoading = false;
		}
	}
</script>

<section
	bind:this={formEl}
	id="lead-form"
	class="glass-panel rounded-2xl p-8 md:p-12 relative overflow-hidden scroll-mt-24"
	aria-labelledby="lead-form-title"
>
	<div class="absolute -top-24 -right-24 w-64 h-64 bg-electric-blue/10 rounded-full blur-3xl pointer-events-none"></div>

	<h2 id="lead-form-title" class="font-headline-md text-headline-md text-on-surface mb-2">
		{i18n.t.leadForm.title}
	</h2>
	<p class="font-body-md text-body-md text-on-surface-variant mb-8">
		{i18n.t.leadForm.subtitle}
	</p>

	<!-- Trust badge -->
	<div class="flex items-center gap-2 mb-8 text-sm text-on-surface-variant">
		<span class="text-electric-blue">★★★★★</span>
		<span>{i18n.t.leadForm.trustBadge}</span>
	</div>

	<form onsubmit={handleSubmit} novalidate>
		<!-- Honeypot — off-screen, not display:none, aria-hidden -->
		<div style="position:absolute;left:-9999px;top:-9999px;" aria-hidden="true">
			<label for="website-honeypot">Website</label>
			<input
				id="website-honeypot"
				type="text"
				name="website"
				bind:value={websiteHoneypot}
				tabindex="-1"
				autocomplete="off"
			/>
		</div>

		<div class="grid grid-cols-1 gap-6 mb-6">
			<!-- Name -->
			<div>
				<label for="lead-name" class="block font-label-md text-on-surface mb-2">
					{i18n.t.leadForm.nameLabelInput}
				</label>
				<input
					id="lead-name"
					type="text"
					name="name"
					bind:value={name}
					onblur={blurName}
					autocomplete="name"
					required
					class="w-full rounded-lg border px-4 py-3 font-body-md text-on-surface bg-surface-container placeholder:text-on-surface-variant/50 focus:outline-none focus:ring-2 focus:ring-electric-blue/50 transition
						{errors.name ? 'border-red-500' : 'border-border-glass'}"
					aria-invalid={errors.name ? 'true' : undefined}
					aria-describedby={errors.name ? 'lead-name-error' : undefined}
				/>
				{#if errors.name}
					<p id="lead-name-error" class="mt-1 text-sm text-red-400" role="alert">{errors.name}</p>
				{/if}
			</div>

			<!-- Email -->
			<div>
				<label for="lead-email" class="block font-label-md text-on-surface mb-2">
					{i18n.t.leadForm.emailLabelInput}
				</label>
				<input
					id="lead-email"
					type="email"
					name="email"
					bind:value={email}
					onblur={blurEmail}
					autocomplete="email"
					required
					class="w-full rounded-lg border px-4 py-3 font-body-md text-on-surface bg-surface-container placeholder:text-on-surface-variant/50 focus:outline-none focus:ring-2 focus:ring-electric-blue/50 transition
						{errors.email ? 'border-red-500' : 'border-border-glass'}"
					aria-invalid={errors.email ? 'true' : undefined}
					aria-describedby={errors.email ? 'lead-email-error' : undefined}
				/>
				{#if errors.email}
					<p id="lead-email-error" class="mt-1 text-sm text-red-400" role="alert">{errors.email}</p>
				{/if}
			</div>

			<!-- Phone -->
			<div>
				<label for="phone" class="block font-label-md text-on-surface mb-2">
					{i18n.t.leadForm.phoneLabelInput}
				</label>
				<PhoneInput
					bind:value={phone}
					id="phone"
					name="phone"
					required={true}
					error={errors.phone ?? ''}
					onblur={blurPhone}
				/>
			</div>

			<!-- Event Date -->
			<div>
				<label for="lead-event-date" class="block font-label-md text-on-surface mb-2">
					{i18n.t.leadForm.eventDateLabel}
				</label>
				<input
					id="lead-event-date"
					type="date"
					name="eventDate"
					bind:value={eventDate}
					onblur={blurDate}
					min={todayString()}
					required
					class="w-full rounded-lg border px-4 py-3 font-body-md text-on-surface bg-surface-container focus:outline-none focus:ring-2 focus:ring-electric-blue/50 transition
						{errors.eventDate ? 'border-red-500' : 'border-border-glass'}"
					aria-invalid={errors.eventDate ? 'true' : undefined}
					aria-describedby={errors.eventDate ? 'lead-date-error' : undefined}
				/>
				{#if errors.eventDate}
					<p id="lead-date-error" class="mt-1 text-sm text-red-400" role="alert">{errors.eventDate}</p>
				{/if}
			</div>
		</div>

		<!-- Comments -->
		<div class="mb-6">
			<label for="lead-comments" class="block font-label-md text-on-surface mb-2">
				{i18n.t.leadForm.commentsLabel}
			</label>
			<textarea
				id="lead-comments"
				name="comments"
				bind:value={comments}
				placeholder={i18n.t.leadForm.commentsPlaceholder}
				rows="4"
				maxlength="1000"
				class="w-full rounded-lg border border-border-glass px-4 py-3 font-body-md text-on-surface bg-surface-container placeholder:text-on-surface-variant/50 focus:outline-none focus:ring-2 focus:ring-electric-blue/50 transition resize-y"
			></textarea>
		</div>

		<!-- Turnstile widget (only rendered if site key is configured) -->
		{#if TURNSTILE_SITE_KEY}
			<div
				class="cf-turnstile mb-6"
				data-sitekey={TURNSTILE_SITE_KEY}
				data-callback="_tsCallback"
				data-theme="dark"
			></div>
		{/if}

		<!-- Submit error -->
		{#if submitError}
			<div class="mb-4 rounded-lg border border-red-500/50 bg-red-500/10 px-4 py-3 text-sm text-red-400" role="alert">
				{submitError}
			</div>
		{/if}

		<!-- Submit button -->
		<button
			type="submit"
			disabled={isLoading}
			class="w-full rounded-full bg-electric-blue-strong px-8 py-4 font-label-lg uppercase tracking-wider text-white transition-all duration-300 hover:shadow-[0_0_24px_rgba(77,140,255,0.45)] active:scale-95 disabled:cursor-not-allowed disabled:opacity-60"
		>
			{isLoading ? i18n.t.leadForm.submitting : i18n.t.leadForm.submitBtn}
		</button>

		<!-- Micro-copy de confianza -->
		<div class="mt-4 flex flex-col items-center justify-center gap-1 text-center text-xs text-on-surface-variant/75">
			<p>🛡️ {i18n.lang === 'en' ? 'No credit card required to check availability' : 'No se requiere tarjeta de crédito para consultar'}</p>
			<p>⚡ {i18n.lang === 'en' ? 'Response as soon as possible' : 'Respuesta lo antes posible'}</p>
		</div>
	</form>
</section>
