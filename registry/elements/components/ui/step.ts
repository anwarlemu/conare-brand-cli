import { html, nothing, type PropertyValues } from 'lit'
import { Check } from 'lucide'
import { DsElement, define } from '@/elements/lib/element'
import { icon } from '@/elements/lib/icon'
import { enter, leave } from '@/elements/lib/transition'
import type { StepState } from '@/elements/controllers/steps'
import styles from 'virtual:tw'

// Step.vue as <conare-step>: one step (the console's byapi/Step.vue, .v2-movestep): a 44px head with its number in
// Geist Mono, the title and, folded, a line that says what came of it. It opens when it's reached; a finished step
// folds to that line and opens again on a click; a step not reached is dimmed and locked, so the next thing to do is
// the only open thing. The body opens in place: its height on the strong ease-out over 180ms (in 200ms, out 140ms), its
// content rising 4px. `locked`: what's done can't be undone from here, so its line doesn't open. Take states from
// StepsController (controllers/steps.ts) or the page's own script.

const DURATION = { enter: 200, leave: 140 }

/**
 * @summary One step: a numbered head that opens its body when it is the step to do.
 * @slot - The body: a line on what to do and its action.
 * @fires open - The head was pressed (open or fold it).
 */
export class Step extends DsElement {
	static styles = [DsElement.styles, styles]
	static properties = { n: { type: Number }, heading: {}, state: { reflect: true }, says: {}, locked: { type: Boolean }, leaving: { state: true } }

	/** The step's number. */
	n = 1
	/** The step's title (Vue's `title`; `title` is HTML's tooltip attribute). */
	heading = ''
	/** now (open), done, todo (reached, folded) or next (locked). */
	state: StepState = 'next'
	/** What came of it, shown while folded. */
	says?: string
	/** What's done can't be undone from here, so its line doesn't open. */
	locked = false
	/** The body stays in the page while it folds away (Vue's leaving <Transition>). */
	private leaving = false
	private rendered = false

	protected willUpdate(changed: PropertyValues) {
		const was = changed.get('state') as StepState | undefined
		if (this.rendered && changed.has('state') && was === 'now' && this.state !== 'now') this.leaving = true
	}

	protected updated(changed: PropertyValues) {
		super.updated(changed)
		const was = changed.get('state') as StepState | undefined
		const body = this.renderRoot.querySelector<HTMLElement>('.ds-step-wrap')
		if (this.rendered && changed.has('state') && body) {
			if (this.state === 'now' && was !== 'now') {
				this.leaving = false
				void enter(body, 'ds-step', DURATION)
			} else if (was === 'now' && this.state !== 'now') {
				void leave(body, 'ds-step', DURATION).then(() => {
					if (this.state !== 'now') this.leaving = false
				})
			}
		}
		this.rendered = true
	}

	render() {
		const now = this.state === 'now'
		return html`<li data-ds="step" class="ds-step" data-state=${this.state}>
			<button type="button" class="ds-step-head" ?disabled=${this.state === 'next' || (this.locked && !now)} aria-expanded=${String(now)} @click=${() => this.emit('open')}>
				<span class="ds-step-mark" aria-hidden="true">${this.state === 'done' ? icon(Check, 'check', { size: 12, strokeWidth: 2 }) : this.n}</span>
				<span class="type-ui-strong">${this.heading}</span>
				${this.says && !now ? html`<span class="ds-step-says">${this.says}</span>` : nothing}
			</button>
			${now || this.leaving ? html`<div class="ds-step-wrap"><div class="ds-step-grow"><div><div class="ds-step-body"><slot></slot></div></div></div></div>` : nothing}
		</li>`
	}
}

define('step', Step)
