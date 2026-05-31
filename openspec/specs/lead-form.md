# Capability Spec: lead-form

> Source change: package-lead-capture-cro
> Archived: 2026-05-31
> Status: implemented

## Purpose

Client-side lead capture form with Cloudflare Turnstile CAPTCHA, country-code phone input, honeypot bot protection, bilingual i18n, and thank-you redirect.

---

## Requirements

**REQ-09** `LeadForm.svelte` MUST be located at `src/lib/components/forms/LeadForm.svelte` and accept a `packageId: string` prop that is included in the submitted payload.

**REQ-10** The form MUST include the following fields:

| Field | Type | Required | Notes |
|---|---|---|---|
| Name | text | Yes | min 2 chars |
| Email | email | Yes | valid email format |
| Phone / WhatsApp | tel | Yes | with country-code selector |
| Event Date | date | Yes | must be a future date |
| Questions / Comments | textarea | No | max 1000 chars |

**REQ-11** `PhoneInput.svelte` MUST be located at `src/lib/components/forms/PhoneInput.svelte`. It MUST render a country-code selector defaulting to `+34` (Spain) and combine the country code with the local number before validation.

**REQ-12** Client-side validation MUST run on submit and on blur for each required field. The form MUST NOT submit if any required field is invalid. Error messages MUST be sourced from the `leadForm` i18n namespace.

**REQ-13** The form MUST include a Cloudflare Turnstile invisible widget. The site key MUST be read from `PUBLIC_TURNSTILE_SITE_KEY`. During Phase 1 the widget response token MAY be sent as a stub; it MUST be a real token sent to the server from Phase 2 onward.

**REQ-14** The form MUST include a honeypot field (e.g., `name="website"`) that is visually hidden via CSS (NOT `display:none` or `visibility:hidden` alone — MUST use off-screen positioning or `aria-hidden`). A non-empty honeypot value MUST silently prevent submission.

**REQ-15** On successful server response (HTTP 201), the form MUST navigate to `/thank-you/?lead={leadId}` using SvelteKit's `goto`. On server error (4xx/5xx), an inline error message MUST be shown without redirecting.

**REQ-16** The form MUST disable the submit button and show a loading indicator while a submission is in flight. Double-submission MUST be prevented.

**REQ-17** All form labels and error messages MUST be bilingual via the `leadForm` i18n namespace added to `src/lib/i18n/translations.ts`.

## Scenarios

```
Given a visitor views a package detail page
When the LeadForm is rendered
Then all five fields are present and labelled in the current locale
And the phone input shows +34 as the default country code
And a Turnstile widget is mounted (invisible)
And a honeypot field exists off-screen and is not announced to screen readers

Given a visitor submits the form with the Name field empty
When client validation runs
Then the submit is blocked
And an error message from the leadForm i18n namespace is displayed under Name

Given a visitor fills Event Date with yesterday's date
When client validation runs on that field
Then an error message indicates the date must be in the future
And the form cannot be submitted

Given a visitor fills all required fields correctly and submits
When the server returns HTTP 201 with { leadId }
Then the browser navigates to /thank-you/?lead={leadId}

Given a visitor fills all required fields correctly and submits
When the server returns HTTP 422
Then an inline error is shown
And the form remains on the page with field values preserved

Given a bot fills the honeypot field and submits
When the form submit handler runs
Then no network request is made to /api/leads
And the page shows no error (silent discard)

Given the form is in a loading state after submit
When the user clicks the submit button again
Then the duplicate click is ignored and only one request is sent
```

## Implementation Notes

- Files: `src/lib/components/forms/LeadForm.svelte`, `src/lib/components/forms/PhoneInput.svelte`
- Honeypot: `position:absolute; left:-9999px` + `aria-hidden="true"`
- Turnstile widget: `<div class="cf-turnstile" data-sitekey={PUBLIC_TURNSTILE_SITE_KEY}>` with Cloudflare script tag
- Dev keys: site key `1x00000000000000000000AA`, secret `1x0000000000000000000000000000000AA`
