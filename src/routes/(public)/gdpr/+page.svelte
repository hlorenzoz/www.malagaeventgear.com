<script lang="ts">
	import SeoHead from '$lib/components/seo/SeoHead.svelte';
	import { i18n } from '$lib/i18n.svelte';

	let gdprSchema = $derived({
		'@context': 'https://schema.org',
		'@type': 'WebPage',
		'@id': 'https://malagaeventgear.com/gdpr/#webpage',
		'url': 'https://malagaeventgear.com/gdpr/',
		'name': i18n.lang === 'en' ? 'GDPR Compliance - Malaga Event Gear (MEG)' : 'Cumplimiento del RGPD - Malaga Event Gear (MEG)',
		'description': i18n.lang === 'en'
			? 'Understand how Malaga Event Gear secures your personal data under the General Data Protection Regulation (GDPR) for audiovisual rentals.'
			: 'Comprendé cómo Malaga Event Gear protege tus datos personales de acuerdo con el Reglamento General de Protección de Datos (RGPD).'
	});

	let requestStatus = $state<string | null>(null);

	function triggerRightsRequest(action: string) {
		requestStatus = i18n.lang === 'en' 
			? `Your request for ${action.toUpperCase()} has been initiated. Please email us at contact@malagaeventgear.com to finalize verification.`
			: `Tu solicitud de ${action.toUpperCase()} ha sido iniciada. Por favor, escribinos a contact@malagaeventgear.com para completar la verificación.`;
	}
</script>

<SeoHead
	title={i18n.lang === 'en' ? 'GDPR Compliance - Malaga Event Gear (MEG)' : 'Cumplimiento del RGPD - Malaga Event Gear (MEG)'}
	description={i18n.lang === 'en'
		? 'Understand how Malaga Event Gear secures your personal data under the General Data Protection Regulation (GDPR) for audiovisual rentals.'
		: 'Comprendé cómo Malaga Event Gear protege tus datos personales de acuerdo con el Reglamento General de Protección de Datos (RGPD).'}
	canonicalUrl="https://malagaeventgear.com/gdpr"
	jsonLdSchema={gdprSchema}
/>

<div class="relative w-full py-20 px-margin-mobile md:px-margin-desktop z-10 max-w-4xl mx-auto">
	<div class="text-center mb-16 reveal">
		<span class="inline-block px-4 py-2 rounded-full glass-panel font-label-sm text-electric-blue uppercase tracking-widest mb-4">
			{i18n.lang === 'en' ? 'European Regulation' : 'Regulación Europea'}
		</span>
		<h1 class="font-headline-lg-mobile md:font-headline-lg text-headline-lg-mobile md:text-headline-lg mb-4 text-on-background">
			{i18n.lang === 'en' ? 'GDPR Compliance' : 'Cumplimiento del RGPD'}
		</h1>
		<p class="font-body-md text-body-md text-on-surface-variant">
			{i18n.lang === 'en' ? 'Malaga Event Gear (MEG) | Effective Date: October 16, 2025' : 'Malaga Event Gear (MEG) | Fecha de Vigencia: 16 de Octubre de 2025'}
		</p>
	</div>

	<div class="glass-panel rounded-xl p-8 md:p-12 space-y-8 text-on-surface-variant font-body-md leading-relaxed mb-12">
		<div>
			<h2 class="font-headline-sm text-headline-sm text-on-surface mb-4">
				{i18n.lang === 'en' ? 'GDPR Commitment' : 'Compromiso con el RGPD'}
			</h2>
			<p>
				{i18n.lang === 'en'
					? 'As Malaga Event Gear (MEG) is based in Málaga, Spain, we strictly adhere to the General Data Protection Regulation (GDPR) (Regulation (EU) 2016/679) regarding the collection, processing, and retention of personal data.'
					: 'Dado que Malaga Event Gear (MEG) tiene su sede en Málaga, España, cumplimos estrictamente con el Reglamento General de Protección de Datos (RGPD) (Reglamento (UE) 2016/679) en lo que respecta a la recopilación, procesamiento y retención de datos personales.'}
			</p>
		</div>

		<div>
			<h2 class="font-headline-sm text-headline-sm text-on-surface mb-4">
				{i18n.lang === 'en' ? 'Personal Data Processing Details' : 'Detalles de Procesamiento de Datos Personales'}
			</h2>
			<div class="overflow-x-auto w-full border border-border-glass rounded-lg mb-4">
				<table class="w-full text-left border-collapse font-body-sm text-sm">
					<thead>
						<tr class="bg-on-surface/5 border-b border-border-glass">
							<th class="p-4 font-semibold text-on-surface">{i18n.lang === 'en' ? 'Data Category' : 'Categoría de Datos'}</th>
							<th class="p-4 font-semibold text-on-surface">{i18n.lang === 'en' ? 'Legal Basis' : 'Base Legal'}</th>
							<th class="p-4 font-semibold text-on-surface">{i18n.lang === 'en' ? 'Usage Purpose' : 'Finalidad de Uso'}</th>
						</tr>
					</thead>
					<tbody class="divide-y divide-border-glass">
						<tr>
							<td class="p-4 font-semibold text-on-surface">{i18n.lang === 'en' ? 'Identity & Contact' : 'Identidad y Contacto'}</td>
							<td class="p-4">Contract Performance</td>
							<td class="p-4">{i18n.lang === 'en' ? 'To communicate, finalize booking specifications, and send quote details via email, phone, or WhatsApp in English.' : 'Para comunicarse, finalizar especificaciones de reserva y enviar presupuestos por email, teléfono o WhatsApp en inglés.'}</td>
						</tr>
						<tr>
							<td class="p-4 font-semibold text-on-surface">{i18n.lang === 'en' ? 'Event Location & Schedule' : 'Ubicación y Horario del Evento'}</td>
							<td class="p-4">Contract Performance</td>
							<td class="p-4">{i18n.lang === 'en' ? 'Essential to coordinate delivery, custom professional setup, and teardown logistics.' : 'Esencial para coordinar la entrega, el montaje profesional personalizado y la retirada.'}</td>
						</tr>
						<tr>
							<td class="p-4 font-semibold text-on-surface">{i18n.lang === 'en' ? 'Payment Data' : 'Datos de Pago'}</td>
							<td class="p-4">Contract Performance & Security</td>
							<td class="p-4">{i18n.lang === 'en' ? 'To finalize secure transactions. We guarantee that all checkout payments are 100% Payment Secure.' : 'Para finalizar transacciones seguras. Garantizamos que todos los pagos de compra son 100% seguros.'}</td>
						</tr>
					</tbody>
				</table>
			</div>
		</div>

		<div>
			<h2 class="font-headline-sm text-headline-sm text-on-surface mb-4">
				{i18n.lang === 'en' ? 'Data Subject Rights under GDPR' : 'Derechos del Interesado bajo el RGPD'}
			</h2>
			<p class="mb-4">
				{i18n.lang === 'en'
					? 'Under the GDPR, you possess the following rights regarding the personal data we process:'
					: 'Bajo el RGPD, tenés los siguientes derechos con respecto a los datos personales que procesamos:'}
			</p>
			<ul class="list-disc pl-6 space-y-2">
				<li><strong>{i18n.lang === 'en' ? 'Right of Access:' : 'Derecho de Acceso:'}</strong> {i18n.lang === 'en' ? 'You can request confirmation and copy of all personal records we maintain.' : 'Podés solicitar confirmación y copia de todos los registros personales que mantenemos.'}</li>
				<li><strong>{i18n.lang === 'en' ? 'Right to Rectification:' : 'Derecho de Rectificación:'}</strong> {i18n.lang === 'en' ? 'You may request updates to incomplete or inaccurate data.' : 'Podés solicitar la actualización de datos incompletos o inexactos.'}</li>
				<li><strong>{i18n.lang === 'en' ? 'Right to Erasure:' : 'Derecho de Supresión (Derecho al Olvido):'}</strong> {i18n.lang === 'en' ? 'You can request the deletion of your personal records.' : 'Podés solicitar la eliminación de tus registros personales.'}</li>
				<li><strong>{i18n.lang === 'en' ? 'Right to Restriction:' : 'Derecho a la Limitación del Tratamiento:'}</strong> {i18n.lang === 'en' ? 'You can request that we restrict processing under certain conditions.' : 'Podés solicitar que limitemos el procesamiento bajo ciertas condiciones.'}</li>
			</ul>
		</div>
	</div>

	<!-- Interactive Rights Portal -->
	<div class="glass-panel rounded-xl p-8 md:p-12 text-center relative overflow-hidden reveal">
		<div class="absolute -bottom-24 -right-24 w-64 h-64 bg-electric-blue/10 rounded-full blur-3xl pointer-events-none"></div>
		<h2 class="font-headline-md text-headline-md mb-4 text-on-surface">
			{i18n.lang === 'en' ? 'Exercise Your GDPR Rights' : 'Ejercé tus Derechos del RGPD'}
		</h2>
		<p class="font-body-md text-body-md text-on-surface-variant max-w-2xl mx-auto mb-8">
			{i18n.lang === 'en'
				? 'Select an action below to automatically trigger your privacy request to our data compliance team.'
				: 'Seleccioná una acción a continuación para iniciar automáticamente tu solicitud de privacidad a nuestro equipo.'}
		</p>
		
		{#if requestStatus}
			<div class="p-4 mb-8 rounded-lg bg-electric-blue/10 border border-electric-blue/20 text-electric-blue text-sm font-body-md animate-fade-in">
				{requestStatus}
			</div>
		{/if}

		<div class="flex flex-wrap justify-center gap-4">
			<button 
				onclick={() => triggerRightsRequest('access')}
				class="px-6 py-3 rounded-full border border-border-glass bg-on-surface/5 hover:bg-on-surface/10 text-on-surface font-label-md active:scale-95 transition-all"
			>
				{i18n.lang === 'en' ? 'Request Data Access' : 'Solicitar Acceso a Datos'}
			</button>
			<button 
				onclick={() => triggerRightsRequest('rectification')}
				class="px-6 py-3 rounded-full border border-border-glass bg-on-surface/5 hover:bg-on-surface/10 text-on-surface font-label-md active:scale-95 transition-all"
			>
				{i18n.lang === 'en' ? 'Request Data Rectification' : 'Solicitar Rectificación de Datos'}
			</button>
			<button 
				onclick={() => triggerRightsRequest('erasure')}
				class="px-6 py-3 rounded-full border border-error/20 bg-error/5 hover:bg-error/15 text-error font-label-md active:scale-95 transition-all"
			>
				{i18n.lang === 'en' ? 'Request Data Erasure' : 'Solicitar Eliminación de Datos'}
			</button>
		</div>
	</div>
</div>
