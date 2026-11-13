import { html, nothing } from 'lit'
import { html as staticHtml } from 'lit/static-html.js'
import { DsElement, define, tag } from '@/elements/lib/element'
import '@/elements/components/ui/button'
import '@/elements/components/ui/pixel-button'
import styles from 'virtual:tw'

// LoginPage.vue as <conare-login-page>: the sign-in page (pages/login.vue): the mark over one line while the app
// forwards to sign-in, or, when sign-in came back with an error, the reason and the ways on: book a demo (the one dark
// action), request access (only for an email with no invite) and sign in again. It forwards nowhere itself: the app
// sets `error` (a code or its own words) and the links, and does the forwarding. `full` fills the window; full="false"
// sits in its container.
export type LoginError = 'expired' | 'cancelled' | 'unavailable' | 'failed' | 'private'

const MESSAGES: Record<LoginError, string> = {
	expired: 'Your sign-in took too long. Try again.',
	cancelled: 'Sign-in was cancelled.',
	unavailable: 'Sign-in is not available right now. Try again in a few minutes.',
	failed: 'Sign-in did not complete. Try again.',
	private: 'This email doesn\'t have an invite yet. Ask an admin of your team to invite you, or request access.',
}
const MARK = 'M89.9457 0C78.5373 44.7769 44.0171 80.8044 0 93.9101V76.5306C31.3148 65.2608 53.8763 35.2427 53.8763 0.0219872V0H89.9457ZM0 74.7799V49.3572C6.77999 39.8903 10.8293 25.0091 10.6866 0H42.5338C42.9715 6.97682 43.1458 24.5886 32.7226 43.2406C21.955 62.5083 6.17623 71.6192 0 74.7799ZM0 107.597V95.6608C50.9824 86.7546 92.0424 49.6664 104.695 0H148.127C141.469 15.4405 128.26 40.2998 103.082 62.7968C62.7173 98.8614 17.3404 105.841 0 107.597ZM0.139963 120.692L0 120.696V109.348L0.139963 109.341C15.0227 108.547 29.4993 106.273 43.4134 102.67C84.5887 92.003 120.841 69.6901 148.132 39.6226V82.8631C129.632 92.8289 104.14 104.192 72.4324 111.856C44.4205 118.627 19.5812 120.571 0.139963 120.692ZM148.132 102.776V133.776H0V122.447C51.2376 122.434 101.006 115.324 148.132 102.776Z'

/** On by default, as in Vue: full="false" turns it off. */
const onByDefault = { fromAttribute: (v: string | null) => v !== 'false' }

/** @summary The sign-in page: the mark over one line while forwarding, or the reason and the ways on. */
export class LoginPage extends DsElement {
	static styles = [DsElement.styles, styles]
	static properties = { error: {}, heading: {}, signInHref: { attribute: 'sign-in-href' }, demoHref: { attribute: 'demo-href' }, requestHref: { attribute: 'request-href' }, full: { converter: onByDefault } }

	/** A code (expired, cancelled, unavailable, failed, private) or the app's own words. */
	error?: LoginError | string
	/** The heading over the reason (Vue's `title`; `title` is HTML's tooltip attribute). */
	heading = 'Conare is invite-only'
	signInHref = ''
	demoHref = ''
	/** Request access, shown for an email with no invite. */
	requestHref?: string
	/** Fills the window; full="false" sits in its container. */
	full = true

	render() {
		const message = this.error ? (MESSAGES[this.error as LoginError] ?? this.error) : ''
		const button = tag('button')
		const pixel = tag('pixel-button')
		return html`<main data-ds="login-page" class=${['flex flex-col items-center justify-center gap-6 bg-surface px-4 text-center text-fg', this.full ? 'min-h-dvh' : 'py-24'].join(' ')}>
			<svg viewBox="0 0 149 134" class="h-12 w-auto text-fg" fill="currentColor" role="img" aria-label="Conare"><path fill-rule="evenodd" d=${MARK}></path></svg>
			${message
				? html`<h1 class="type-heading-3">${this.heading}</h1>
					<p class="max-w-sm bg-surface-danger px-3 py-2 type-ui text-fg" role="alert">${message}</p>
					<div class="flex flex-wrap justify-center gap-3">
						${staticHtml`<${pixel} href=${this.demoHref}>Book a demo</${pixel}>`}
						${this.error === 'private' && this.requestHref ? staticHtml`<${button} href=${this.requestHref}>Request access</${button}>` : nothing}
						${staticHtml`<${button} href=${this.signInHref}>Sign in again</${button}>`}
					</div>`
				: html`<p class="type-ui text-fg-muted" role="status">Taking you to sign in.</p>`}
		</main>`
	}
}

define('login-page', LoginPage)
