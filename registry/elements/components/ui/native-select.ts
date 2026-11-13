import { html, LitElement, type PropertyValues } from 'lit'
import { ChevronDown } from 'lucide'
import { ifDefined } from 'lit/directives/if-defined.js'
import { DsFormElement, define } from '@/elements/lib/element'
import { icon } from '@/elements/lib/icon'
import styles from 'virtual:tw'

// NativeSelect.vue as <conare-native-select>: the browser's own select, drawn as the console's field (main.css
// select.c-input, square under the console): 32px (28px with `small`), 13px, the #C3C1BF hairline that darkens on hover
// and turns to a 2px ink edge on focus, and its own 12px chevron in the muted grey, the same in every browser. 40px and
// 16px on phones, where the system picker opens. Options go inside as <option>s, as in Vue's slot: a <select> takes
// only its own children, so the element draws a copy of them in its shadow root and follows changes to them. The host
// is the box (Vue's root span), so a class on the element lands on it. Form-associated (its `name` and `value` go with
// its form, a <label for> names it); v-model is `value` with the native `input` and `change` events. aria-label and
// aria-description pass to the inner <select>.

/**
 * @summary The browser's own select, drawn as the console's field.
 * @slot - The <option>s (copied into the select).
 * @fires input - The pick changed (read `value`).
 * @fires change - The pick changed (read `value`).
 */
export class NativeSelect extends DsFormElement {
	static styles = [DsFormElement.styles, styles]
	static shadowRootOptions = { ...LitElement.shadowRootOptions, delegatesFocus: true }
	static dsField = true
	static properties = {
		value: {},
		name: {},
		small: { type: Boolean, reflect: true },
		mono: { type: Boolean },
		disabled: { type: Boolean, reflect: true },
		required: { type: Boolean },
		invalid: { type: Boolean, reflect: true },
		label: { attribute: 'aria-label' },
		description: { attribute: 'aria-description' },
	}

	/** The picked option's value (the first option's when unset, as a select's). */
	value?: string
	name?: string
	/** The 28px size, for a row of filters. */
	small = false
	/** The options in Geist Mono (namespaces, ids). */
	mono = false
	disabled = false
	required = false
	/** A red edge (with the message under it in a field). */
	invalid = false
	/** The name for assistive tech, passed to the inner select. */
	label?: string
	/** The hint or error, passed to the inner select (a field sets it). */
	description?: string
	private observer = new MutationObserver(() => this.requestUpdate())

	connectedCallback() {
		super.connectedCallback()
		this.observer.observe(this, { childList: true, subtree: true, characterData: true, attributes: true })
	}
	disconnectedCallback() {
		super.disconnectedCallback()
		this.observer.disconnect()
	}

	private get select() {
		return this.renderRoot.querySelector('select')
	}
	protected updated(changed: PropertyValues) {
		super.updated(changed)
		const select = this.select
		if (!select) return
		// The options render after the select's own bindings, so the value goes on once they are there.
		if (this.value === undefined) this.value = select.value
		else if (select.value !== this.value) select.value = this.value
		this.internals.setFormValue(this.value ?? null)
	}
	formResetCallback() {
		this.value = this.getAttribute('value') ?? undefined
	}
	private onInput(event: Event) {
		this.value = (event.target as HTMLSelectElement).value
	}
	// The inner change does not leave the shadow root: the element sends its own.
	private onChange() {
		this.dispatchEvent(new Event('change', { bubbles: true, composed: true }))
	}

	render() {
		const options = [...this.querySelectorAll('option')]
		return html`<select name=${ifDefined(this.name)} ?disabled=${this.inactive} ?required=${this.required} aria-invalid=${ifDefined(this.invalid ? 'true' : undefined)} aria-label=${ifDefined(this.label)} aria-description=${ifDefined(this.description)} class=${this.mono ? 'font-code' : ''} @input=${this.onInput} @change=${this.onChange}>${options.map((o) => html`<option value=${o.value} ?disabled=${o.disabled}>${o.text}</option>`)}</select>${icon(ChevronDown, 'chevron-down', { size: 12, strokeWidth: 2, attrs: { 'aria-hidden': 'true' } })}`
	}
}

define('native-select', NativeSelect)
