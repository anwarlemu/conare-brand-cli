import { html, nothing } from 'lit'
import { html as staticHtml } from 'lit/static-html.js'
import { define, tag } from '@/elements/lib/element'
import { SiteFrameElement } from '@/elements/components/site/site-page'
import '@/elements/components/site/section-head'
import '@/elements/components/ui/button'
import '@/elements/components/ui/field'
import '@/elements/components/ui/input'
import '@/elements/components/ui/pixel-button'
import '@/elements/components/ui/textarea'
import styles from 'virtual:tw'

// ContactPage.vue as <conare-contact-page>: the head, then the ways to reach the team on the left (each a label over
// its address, between hairlines) and the form on the right in the double rule (name, work email, company, message;
// the browser asks for the empty ones), its one dark button at the foot. It calls nothing: `submit` carries the answers
// (detail), and `sent` (the app's) swaps the form for what happens next; `edit` asks for the form back. A failure from
// the server (`error`) shows above the button. In the site's frame (site-page).
export type ContactAnswers = { name: string, email: string, company: string, message: string }
const link = 'underline decoration-edge-strong underline-offset-4 transition-[text-decoration-color] duration-200 ease-standard hover:decoration-fg'

/**
 * @summary Contact: the ways to reach the team and the form.
 * @fires submit - The form was sent; detail is the answers (name, email, company, message).
 * @fires edit - Send another was pressed.
 * @slot logo - The logo in the header's home link.
 * @slot actions - The header's buttons.
 * @slot sheet-actions - The same buttons again, for the header's sheet on phones.
 */
export class ContactPage extends SiteFrameElement {
	static styles = [SiteFrameElement.styles, styles]
	static properties = { head: { type: Object }, channels: { type: Array }, sent: { type: Boolean }, sending: { type: Boolean }, error: {}, answers: { state: true } }

	head: { tag?: string, title: string, body?: string } = { title: '' }
	channels: { label: string, value: string, href: string }[] = []
	/** The app has the message: what happens next shows in place of the form. */
	sent = false
	/** The send is running. */
	sending = false
	/** The server's answer to a send, shown above the button. */
	error?: string
	private answers: ContactAnswers = { name: '', email: '', company: '', message: '' }

	private set(key: keyof ContactAnswers) {
		return (event: Event) => {
			this.answers = { ...this.answers, [key]: (event.target as HTMLElement & { value: string }).value }
		}
	}
	private onSubmit(event: SubmitEvent) {
		event.preventDefault()
		this.emit('submit', { ...this.answers })
	}

	render() {
		const [sectionHead, button, pixel, field, input, textarea] = [tag('section-head'), tag('button'), tag('pixel-button'), tag('field'), tag('input'), tag('textarea')]
		const h = this.head
		const a = this.answers
		return this.frame('contact-page', staticHtml`<section aria-labelledby="contact-page-title" class="mx-auto max-w-[1440px] px-4 pt-14 pb-32 sm:px-6 lg:px-10 lg:pt-20 lg:pb-40"><${sectionHead} as="h1" title-id="contact-page-title" .tag=${h.tag} .heading=${h.title} .body=${h.body}></${sectionHead}><div class="mx-auto mt-14 grid max-w-[1008px] grid-cols-[minmax(0,1fr)] gap-12 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.5fr)] lg:gap-16"><dl class="flex flex-col self-start border-t border-edge">${this.channels.map((c) => html`<div class="flex flex-col gap-1 border-b border-edge py-5"><dt class="type-meta text-fg-muted">${c.label}</dt><dd class="type-body-lg text-fg"><a href=${c.href} class=${link}>${c.value}</a></dd></div>`)}</dl><div class="border border-edge p-5 outline outline-offset-4 outline-edge sm:p-6">${this.sent
			? staticHtml`<div role="status" class="type-ui"><h2 class="type-heading-4">We have your message.</h2><p class="mt-2 text-fg-muted">We reply by email, usually within a working day.</p><${button} class="mt-6" @click=${() => this.emit('edit')}>Send another</${button}></div>`
			: staticHtml`<form class="flex flex-col gap-5" aria-label="Contact" @submit=${this.onSubmit}><div class="grid gap-5 sm:grid-cols-2"><${field} label="Name"><${input} .value=${a.name} name="name" autocomplete="name" maxlength="200" required @input=${this.set('name')}></${input}></${field}><${field} label="Work email"><${input} .value=${a.email} name="email" type="email" autocomplete="email" maxlength="200" required @input=${this.set('email')}></${input}></${field}></div><${field} label="Company"><${input} .value=${a.company} name="company" autocomplete="organization" maxlength="200" @input=${this.set('company')}></${input}></${field}><${field} label="Message"><${textarea} .value=${a.message} name="message" rows="5" maxlength="4000" placeholder="What you want to build, and what you need from us." required @input=${this.set('message')}></${textarea}></${field}>${this.error ? html`<p class="bg-surface-danger px-3 py-2 type-ui" role="alert">${this.error}</p>` : nothing}<div><${pixel} type="submit" ?disabled=${this.sending}>${this.sending ? 'Sending' : 'Send message'}</${pixel}></div></form>`}</div></div></section>`)
	}
}

define('contact-page', ContactPage)
