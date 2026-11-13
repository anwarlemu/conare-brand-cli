import { html, nothing, type PropertyValues } from 'lit'
import { html as staticHtml } from 'lit/static-html.js'
import { DsElement, define, tag } from '@/elements/lib/element'
import '@/elements/components/ui/button'
import '@/elements/components/ui/field'
import '@/elements/components/ui/input'
import '@/elements/components/ui/native-select'
import '@/elements/components/ui/pixel-button'
import '@/elements/components/ui/textarea'
import styles from 'virtual:tw'

// RequestAccessPage.vue as <conare-request-access-page>: where sign-in sends someone it does not admit
// (pages/request-access.vue): the mark, the heading and one line, then the part for where they are. `state` is the
// app's: loading (shown after 300ms), signed-out (sign in with a work email first), failed (try again), form (their
// email, then name, company, team size and what they want to build) or sent (what happens next). It calls nothing:
// `submit` carries the answers (detail), `retry` and `edit` ask the app to load again or reopen the form. `full` fills
// the window; full="false" sits in its container. The required fields are checked as the browser checks Vue's form:
// the first empty one shows the browser's message and takes focus, and nothing is sent.
export type AccessState = 'loading' | 'signed-out' | 'failed' | 'form' | 'sent'
export type AccessAnswers = { name: string, company: string, teamSize: string, useCase: string }

const MARK = 'M89.9457 0C78.5373 44.7769 44.0171 80.8044 0 93.9101V76.5306C31.3148 65.2608 53.8763 35.2427 53.8763 0.0219872V0H89.9457ZM0 74.7799V49.3572C6.77999 39.8903 10.8293 25.0091 10.6866 0H42.5338C42.9715 6.97682 43.1458 24.5886 32.7226 43.2406C21.955 62.5083 6.17623 71.6192 0 74.7799ZM0 107.597V95.6608C50.9824 86.7546 92.0424 49.6664 104.695 0H148.127C141.469 15.4405 128.26 40.2998 103.082 62.7968C62.7173 98.8614 17.3404 105.841 0 107.597ZM0.139963 120.692L0 120.696V109.348L0.139963 109.341C15.0227 108.547 29.4993 106.273 43.4134 102.67C84.5887 92.003 120.841 69.6901 148.132 39.6226V82.8631C129.632 92.8289 104.14 104.192 72.4324 111.856C44.4205 118.627 19.5812 120.571 0.139963 120.692ZM148.132 102.776V133.776H0V122.447C51.2376 122.434 101.006 115.324 148.132 102.776Z'
const link = 'underline decoration-edge-strong underline-offset-4 transition-[text-decoration-color] duration-200 ease-standard hover:decoration-fg'
/** On by default, as in Vue: full="false" turns it off. */
const onByDefault = { fromAttribute: (v: string | null) => v !== 'false' }

/**
 * @summary The request-access page: the form, and the states around it.
 * @fires submit - The form was sent; detail is the answers (name, company, teamSize, useCase).
 * @fires retry - Try again was pressed after a failed load.
 * @fires edit - Change your answers was pressed.
 */
export class RequestAccessPage extends DsElement {
	static styles = [DsElement.styles, styles]
	static properties = {
		state: {},
		email: {},
		personalEmail: { type: Boolean, attribute: 'personal-email' },
		name: {},
		teamSizes: { type: Array, attribute: 'team-sizes' },
		sending: { type: Boolean },
		error: {},
		heading: {},
		homeHref: { attribute: 'home-href' },
		demoHref: { attribute: 'demo-href' },
		signInHref: { attribute: 'sign-in-href' },
		privacyHref: { attribute: 'privacy-href' },
		supportEmail: { attribute: 'support-email' },
		full: { converter: onByDefault },
		answers: { state: true },
	}

	state: AccessState = 'form'
	email?: string
	/** The email is a personal address: say so, with a way to sign in with a work one. */
	personalEmail = false
	/** Fills the name field. */
	name?: string
	teamSizes: string[] = ['1-10', '11-50', '51-200', '201-1,000', '1,001+']
	sending = false
	/** The server's answer to a send, shown above the button. */
	error?: string
	/** The heading (Vue's `title`; `title` is HTML's tooltip attribute). */
	heading = 'Conare is invite-only'
	homeHref = ''
	demoHref = ''
	signInHref = ''
	privacyHref = ''
	supportEmail = 'support@acme.com'
	/** Fills the window; full="false" sits in its container. */
	full = true
	private answers: AccessAnswers = { name: '', company: '', teamSize: '', useCase: '' }

	protected willUpdate(changed: PropertyValues) {
		super.willUpdate(changed)
		if (changed.has('name') && this.name && !this.answers.name) this.answers = { ...this.answers, name: this.name }
	}

	private set(key: keyof AccessAnswers) {
		return (event: Event) => {
			this.answers = { ...this.answers, [key]: (event.target as HTMLElement & { value: string }).value }
		}
	}
	// Vue's form has no novalidate: the browser checks its required fields. The fields here are elements, so the page
	// asks each one's own control and shows the first message the browser would.
	private onSubmit(event: SubmitEvent) {
		event.preventDefault()
		const form = event.currentTarget as HTMLFormElement
		for (const field of form.querySelectorAll<HTMLElement>('[required]')) {
			const control = field.shadowRoot?.querySelector<HTMLInputElement>('input, select, textarea')
			if (control && !control.checkValidity()) {
				control.reportValidity()
				return
			}
		}
		this.emit('submit', { ...this.answers })
	}

	render() {
		const button = tag('button')
		const pixel = tag('pixel-button')
		const field = tag('field')
		const input = tag('input')
		const select = tag('native-select')
		const textarea = tag('textarea')
		const a = this.answers
		const s = this.state
		return html`<main data-ds="request-access-page" class=${['bg-surface px-4 py-12 text-fg md:py-24', this.full ? 'min-h-dvh' : ''].join(' ')}>
			<div class="mx-auto max-w-140">
				<a href=${this.homeHref} aria-label="Home" class="inline-block">
					<svg viewBox="0 0 149 134" class="h-8 w-auto" fill="currentColor" aria-hidden="true"><path fill-rule="evenodd" d=${MARK}></path></svg>
				</a>
				<h1 class="mt-12 type-heading-3">${this.heading}</h1>
				<p class="mt-4 type-ui text-fg-muted">We set it up with each company directly. Tell us about your team and we'll reply by email, or <a href=${this.demoHref} class=${`text-fg ${link}`}>book a demo</a>.</p>

				${s === 'loading' ? html`<p class="ds-access-loading mt-8 type-ui text-fg-muted" role="status">Loading.</p>` : nothing}

				${s === 'signed-out'
					? html`<section class="mt-8 border border-edge p-4 type-ui" data-state="signed-out">
							<p>Sign in with your work email first. We reply to that address, and it's the one your organization will use.</p>
							<div class="mt-6 flex flex-wrap items-center gap-4">
								${staticHtml`<${pixel} href=${this.signInHref}>Sign in</${pixel}>`}
								<a href=${`mailto:${this.supportEmail}`} class=${`type-meta ${link}`}>or write to ${this.supportEmail}</a>
							</div>
						</section>`
					: nothing}

				${s === 'failed'
					? html`<section class="mt-8" data-state="failed">
							<p class="bg-surface-danger px-3 py-2 type-ui" role="alert">Something went wrong. Try again.</p>
							${staticHtml`<${button} class="mt-4" @click=${() => this.emit('retry')}>Try again</${button}>`}
						</section>`
					: nothing}

				${s === 'form'
					? staticHtml`<form class="mt-8 flex flex-col gap-6 border border-edge p-4" data-state="form" @submit=${this.onSubmit}>
							<div>
								<p class="type-meta text-fg-soft">Work email</p>
								<p class="mt-1.5 type-ui wrap-anywhere">${this.email}</p>
								${this.personalEmail
									? html`<p class="mt-2 type-meta text-fg-muted">This is a personal address. To ask for your company, <a href=${this.signInHref} class=${`text-fg ${link}`}>sign in with your work email</a>.</p>`
									: html`<a href=${this.signInHref} class=${`mt-2 inline-block type-meta ${link}`}>Use a different email</a>`}
							</div>
							<${field} label="Name">
								<${input} .value=${a.name} name="name" autocomplete="name" maxlength="200" required @input=${this.set('name')}></${input}>
							</${field}>
							<${field} label="Company">
								<${input} .value=${a.company} name="company" autocomplete="organization" maxlength="200" required @input=${this.set('company')}></${input}>
							</${field}>
							<${field} label="Team size">
								<${select} .value=${a.teamSize} name="team-size" required @input=${this.set('teamSize')}>
									<option value="" disabled>Choose</option>
									${this.teamSizes.map((size) => html`<option value=${size}>${size} people</option>`)}
								</${select}>
							</${field}>
							<${field} label="What you want to build">
								<${textarea} .value=${a.useCase} name="use-case" maxlength="4000" placeholder="For example: support agents that answer from our help center and past tickets." required @input=${this.set('useCase')}></${textarea}>
							</${field}>
							${this.error ? html`<p class="bg-surface-danger px-3 py-2 type-ui" role="alert">${this.error}</p>` : nothing}
							<div class="flex flex-wrap items-center gap-4">
								<${pixel} type="submit" ?disabled=${this.sending}>${this.sending ? 'Sending' : 'Send request'}</${pixel}>
								<p class="type-meta text-fg-muted">We use these answers only to reply to you. <a href=${this.privacyHref} class=${`text-fg ${link}`}>Privacy policy</a>.</p>
							</div>
						</form>`
					: nothing}

				${s === 'sent'
					? html`<section class="mt-8 border border-edge p-4 type-ui" data-state="sent" role="status">
							<h2 class="type-heading-4">We have your request.</h2>
							<p class="mt-2">We'll reply to <span class="wrap-anywhere">${this.email}</span>.</p>
							<p class="mt-8 type-meta text-fg-muted">What happens next</p>
							<ol class="mt-4 flex flex-col gap-3">
								<li class="flex gap-4"><span class="text-fg-muted tabular-nums">1</span><span>We read your request and reply by email.</span></li>
								<li class="flex gap-4"><span class="text-fg-muted tabular-nums">2</span><span>If it fits, we create an organization for your company and invite you to it.</span></li>
								<li class="flex gap-4"><span class="text-fg-muted tabular-nums">3</span><span>Open the invite and sign in with this email. The dashboard opens on get started.</span></li>
							</ol>
							<div class="mt-8 flex flex-wrap items-center gap-4">
								${staticHtml`<${button} href=${this.homeHref}>Back to the website</${button}>`}
								<button type="button" class=${`cursor-pointer type-meta ${link}`} @click=${() => this.emit('edit')}>Change your answers</button>
							</div>
						</section>`
					: nothing}

				${s === 'form' || s === 'signed-out' ? html`<p class="mt-6 type-meta text-fg-muted">Is your team already on it? Ask one of its admins to invite you.</p>` : nothing}
			</div>
		</main>`
	}
}

define('request-access-page', RequestAccessPage)
