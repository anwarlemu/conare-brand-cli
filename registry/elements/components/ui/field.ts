import { html, nothing } from 'lit'
import { ifDefined } from 'lit/directives/if-defined.js'
import { DsElement, define } from '@/elements/lib/element'
import styles from 'virtual:tw'

// Field.vue as <conare-field>: a label over one control, with a hint or an error under it (the console's forms): the
// label 12px soft, the hint 12px muted, the error in the danger red. Vue's scoped slot hands the control its ids; here
// the field wires the control it holds: the label names it (aria-label) and clicking the label focuses it, the hint
// or error describes it (aria-description), and an error sets its `invalid`.

/**
 * @summary A label over one control, with a hint or an error under it.
 * @slot - The control: <conare-input>, <conare-select>, or any input.
 */
export class Field extends DsElement {
	static styles = [DsElement.styles, styles]
	static properties = { label: {}, hint: {}, error: {} }

	label = ''
	hint?: string
	error?: string

	private control() {
		return [...this.children].find((c) => !c.hasAttribute('slot')) as (HTMLElement & { invalid?: boolean }) | undefined
	}
	protected updated() {
		const c = this.control()
		if (!c) return
		c.setAttribute('aria-label', this.label)
		const text = this.error || this.hint
		if (text) c.setAttribute('aria-description', text)
		else c.removeAttribute('aria-description')
		if ('invalid' in c) c.invalid = !!this.error
	}

	render() {
		const text = this.error || this.hint
		return html`<label class="type-meta text-fg-soft" @click=${() => this.control()?.focus()}>${this.label}</label>
			<slot @slotchange=${() => this.updated()}></slot>
			${text ? html`<p class=${`type-meta ${this.error ? 'text-fg-danger' : 'text-fg-muted'}`} role=${ifDefined(this.error ? 'alert' : undefined)}>${text}</p>` : nothing}`
	}
}

define('field', Field)
