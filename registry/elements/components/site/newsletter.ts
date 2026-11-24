import { html, nothing } from 'lit'
import { html as staticHtml } from 'lit/static-html.js'
import { DsElement, define, tag } from '@/elements/lib/element'
import '@/elements/components/site/section-head'
import '@/elements/components/ui/field'
import '@/elements/components/ui/input'
import '@/elements/components/ui/pixel-button'
import styles from 'virtual:tw'

// Newsletter.vue as <conare-newsletter>: a sign-up for news by email: the band's head, then one email field and the one
// dark button in the website's double rule. It calls nothing: `submit` carries the address (detail), `sent` (the
// app's) swaps the form for the line the app gives, and a failure from the server (`error`) shows under it. `heading`
// is Vue's `title`.

/**
 * @summary A sign-up for news by email, in the double rule.
 * @fires submit - The form was sent; detail is the email address.
 */
export class Newsletter extends DsElement {
	static styles = [DsElement.styles, styles]
	static properties = { heading: {}, tag: {}, body: {}, label: {}, action: {}, sent: { type: Boolean }, sentText: { attribute: 'sent-text' }, sending: { type: Boolean }, error: {}, titleId: { attribute: 'title-id' }, email: { state: true } }

	/** The band's line (Vue's `title`). */
	heading = ''
	tag?: string
	body?: string
	label = 'Work email'
	action = 'Subscribe'
	/** The app has the address: `sentText` shows in place of the form. */
	sent = false
	sentText = ''
	sending = false
	error?: string
	titleId = 'newsletter-title'
	private email = ''

	private onSubmit(event: SubmitEvent) {
		event.preventDefault()
		this.emit('submit', this.email)
	}

	render() {
		const [head, field, input, pixel] = [tag('section-head'), tag('field'), tag('input'), tag('pixel-button')]
		return html`<section data-ds="newsletter" aria-labelledby=${this.titleId} class="mx-auto max-w-[1440px] px-4 pb-24 sm:px-6 lg:px-10 lg:pb-32">${staticHtml`<${head} .heading=${this.heading} .tag=${this.tag} .body=${this.body} .titleId=${this.titleId}></${head}>`}<div class="mx-auto mt-10 max-w-[560px] border border-edge p-5 outline outline-offset-4 outline-edge sm:p-6">${this.sent
			? html`<p role="status" class="type-ui text-fg">${this.sentText}</p>`
			: staticHtml`<form class="flex flex-col gap-4 sm:flex-row sm:items-end" aria-label=${this.heading} @submit=${this.onSubmit}><div class="min-w-0 flex-1"><${field} label=${this.label}><${input} .value=${this.email} name="email" type="email" autocomplete="email" maxlength="200" required @input=${(e: Event) => { this.email = (e.target as HTMLElement & { value: string }).value }}></${input}></${field}></div><div><${pixel} type="submit" ?disabled=${this.sending}>${this.action}</${pixel}></div></form>`}${this.error ? html`<p class="mt-4 bg-surface-danger px-3 py-2 type-ui" role="alert">${this.error}</p>` : nothing}</div></section>`
	}
}

define('newsletter', Newsletter)
