<script lang="ts">
	import SeoHead from '$lib/components/seo/SeoHead.svelte';
	import { i18n } from '$lib/i18n.svelte';

	let privacySchema = $derived({
		'@context': 'https://schema.org',
		'@type': 'WebPage',
		'@id': 'https://malagaeventgear.com/privacy-policy/#webpage',
		'url': 'https://malagaeventgear.com/privacy-policy/',
		'name': i18n.lang === 'en' ? 'Privacy Policy - Malaga Event Gear (MEG)' : 'Política de Privacidad - Malaga Event Gear (MEG)',
		'description': i18n.lang === 'en'
			? 'Read the official Privacy Policy for Malaga Event Gear. Learn how we collect, process, and protect your personal information.'
			: 'Leé la Política de Privacidad oficial de Malaga Event Gear. Aprendé cómo recopilamos, procesamos y protegemos tu información personal.'
	});
</script>

<SeoHead
	title={i18n.lang === 'en' ? 'Privacy Policy - Malaga Event Gear (MEG)' : 'Política de Privacidad - Malaga Event Gear (MEG)'}
	description={i18n.lang === 'en'
		? 'Read the official Privacy Policy for Malaga Event Gear. Learn how we collect, process, and protect your personal information.'
		: 'Leé la Política de Privacidad oficial de Malaga Event Gear. Aprendé cómo recopilamos, procesamos y protegemos tu información personal.'}
	canonicalUrl="https://malagaeventgear.com/privacy-policy"
	jsonLdSchema={privacySchema}
/>

<div class="relative w-full py-20 px-margin-mobile md:px-margin-desktop z-10 max-w-4xl mx-auto">
	<div class="text-center mb-16 reveal">
		<span class="inline-block px-4 py-2 rounded-full glass-panel font-label-sm text-electric-blue uppercase tracking-widest mb-4">
			{i18n.lang === 'en' ? 'Privacy Disclosures' : 'Declaraciones de Privacidad'}
		</span>
		<h1 class="font-headline-lg-mobile md:font-headline-lg text-headline-lg-mobile md:text-headline-lg mb-4 text-on-background">
			{i18n.lang === 'en' ? 'Privacy Policy' : 'Política de Privacidad'}
		</h1>
		<p class="font-body-md text-body-md text-on-surface-variant">
			{i18n.lang === 'en'
				? 'Effective Date: October 16, 2025'
				: 'Fecha de Vigencia: 16 de Octubre de 2025'}
		</p>
	</div>

	<div class="glass-panel rounded-xl p-8 md:p-12 space-y-8 text-on-surface-variant font-body-md leading-relaxed">
		<div>
			<h2 class="font-headline-sm text-headline-sm text-on-surface mb-4">
				{i18n.lang === 'en' ? 'Who We Are' : 'Quiénes Somos'}
			</h2>
			<p>
				{i18n.lang === 'en'
					? 'Our website address is https://malagaeventgear.com. At Malaga Event Gear (MEG), we are committed to protecting your personal information and providing transparent disclosures regarding data usage.'
					: 'Nuestra dirección web es https://malagaeventgear.com. En Malaga Event Gear (MEG), nos comprometemos a proteger tu información personal y a proporcionar declaraciones transparentes sobre el uso de datos.'}
			</p>
		</div>

		<div>
			<h2 class="font-headline-sm text-headline-sm text-on-surface mb-4">
				{i18n.lang === 'en' ? 'Information We Collect & Purpose' : 'Información que Recopilamos y Finalidad'}
			</h2>
			<p class="mb-4">
				{i18n.lang === 'en'
					? 'We collect and process personal data when you engage with our established business workflow (e.g., when you Request Your Quote via our inquiry form):'
					: 'Recopilamos y procesamos datos personales cuando interactuás con nuestro flujo de negocio establecido (por ejemplo, cuando solicitás tu presupuesto a través de nuestro formulario):'}
			</p>

			<div class="overflow-x-auto w-full border border-border-glass rounded-lg">
				<table class="w-full text-left border-collapse font-body-sm text-sm">
					<thead>
						<tr class="bg-on-surface/5 border-b border-border-glass">
							<th class="p-4 font-semibold text-on-surface">{i18n.lang === 'en' ? 'Data Category' : 'Categoría de Datos'}</th>
							<th class="p-4 font-semibold text-on-surface">{i18n.lang === 'en' ? 'Processing Purpose' : 'Finalidad del Procesamiento'}</th>
						</tr>
					</thead>
					<tbody class="divide-y divide-border-glass">
						<tr>
							<td class="p-4 font-semibold text-on-surface">{i18n.lang === 'en' ? 'Contact Details' : 'Datos de Contacto'}</td>
							<td class="p-4">{i18n.lang === 'en' ? 'Name, Email, Phone, or WhatsApp ID to finalize details, coordinate logistics, and confirm your booking. Conducted solely in English.' : 'Nombre, email, teléfono o WhatsApp para coordinar la logística y confirmar tu reserva. Realizado únicamente en inglés.'}</td>
						</tr>
						<tr>
							<td class="p-4 font-semibold text-on-surface">{i18n.lang === 'en' ? 'Event Logistics' : 'Logística del Evento'}</td>
							<td class="p-4">{i18n.lang === 'en' ? 'Precise Localization (location) and Horario (schedule) to coordinate delivery, custom equipment setup, and pickup.' : 'Localización (ubicación) y Horario exactos para coordinar la entrega, el montaje personalizado de los equipos y la retirada.'}</td>
						</tr>
						<tr>
							<td class="p-4 font-semibold text-on-surface">{i18n.lang === 'en' ? 'Financial Data' : 'Datos Financieros'}</td>
							<td class="p-4">{i18n.lang === 'en' ? 'Payment information processed during bookings. We guarantee that all payment transactions are 100% secure.' : 'Información de pago procesada durante las reservas. Garantizamos que todas las transacciones de pago son 100% seguras.'}</td>
						</tr>
					</tbody>
				</table>
			</div>
		</div>

		<div>
			<h2 class="font-headline-sm text-headline-sm text-on-surface mb-4">
				{i18n.lang === 'en' ? 'Reviews & Social Proof' : 'Reseñas y Prueba Social'}
			</h2>
			<p>
				{i18n.lang === 'en'
					? 'We display an EXCELLENT rating based on verified Google My Business reviews. The review verification is handled dynamically via Trustindex, ensuring that the original source of all customer testimonials is genuine and unaltered.'
					: 'Mostramos una calificación de EXCELENTE basada en reseñas verificadas de Google My Business. La verificación de las reseñas se gestiona de forma dinámica a través de Trustindex, lo que garantiza que la fuente original de todos los testimonios de los clientes sea genuina e inalterada.'}
			</p>
		</div>

		<div>
			<h2 class="font-headline-sm text-headline-sm text-on-surface mb-4">
				{i18n.lang === 'en' ? 'Data Retention & Rights' : 'Retención de Datos y Derechos'}
			</h2>
			<p>
				{i18n.lang === 'en'
					? 'We retain your personal data only as long as necessary to complete your contracted audiovisual services or comply with legal mandates. You have full rights under GDPR to access, rectify, object to, or request the deletion of your personal records at any time by contacting our Data Controller.'
					: 'Retenemos tus datos personales únicamente durante el tiempo necesario para completar los servicios audiovisuales contratados o cumplir con los mandatos legales. Tenés plenos derechos bajo el RGPD para acceder, rectificar, oponerte o solicitar la eliminación de tus registros personales en cualquier momento poniéndote en contacto con nuestro Responsable de Datos.'}
			</p>
		</div>
	</div>
</div>
