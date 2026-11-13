import { html, LitElement, type PropertyValues } from 'lit'
import { DsFormElement, define } from '@/elements/lib/element'
import styles from 'virtual:tw'

// Switch.vue as <conare-switch>: on or off, with no words (console2.css .v2-switch): a square thumb in a square track.
// The thumb slides on the console's curve and the track turns black at once. Grey while it can't be changed. Vue's
// boolean v-model is `checked` (an attribute, as a checkbox's) with `input` and `change` events. Form-associated: its
// `name` goes with the form as "on" while checked.

/**
 * @summary On or off, with no words.
 * @fires input - It was turned (read `checked`).
 * @fires change - It was turned (read `checked`).
 */
export class Switch extends DsFormElement {
	static styles = [DsFormElement.styles, styles]
	static shadowRootOptions = { ...LitElement.shadowRootOptions, delegatesFocus: true }
	static properties = { checked: { type: Boolean, reflect: true }, label: {}, disabled: { type: Boolean, reflect: true }, name: {}, required: { type: Boolean } }

	checked = false
	/** What it turns, for assistive tech (the row beside it says it for the eye). */
	label = ''
	disabled = false
	name?: string

	/** It must be on for its form to send. */
	required = false

	// No native control: a required switch that is off is missing its value, as a required checkbox is.
	syncValidity() {
		this.setMissing(this.required && !this.checked, 'checkbox', this.renderRoot.querySelector('button'))
	}
	protected updated(changed: PropertyValues) {
		super.updated(changed)
		if (changed.has('checked')) this.internals.setFormValue(this.checked ? 'on' : null)
	}
	render() {
		return html`<button data-ds="switch" type="button" role="switch" class="ds-switch" aria-checked=${String(this.checked)} aria-label=${this.label} ?disabled=${this.inactive} @click=${() => this.commit(!this.checked, 'checked')}><span aria-hidden="true"></span></button>`
	}
}

define('switch', Switch)
