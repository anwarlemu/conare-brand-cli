import { html, LitElement, type PropertyValues } from 'lit'
import { ifDefined } from 'lit/directives/if-defined.js'
import { live } from 'lit/directives/live.js'
import { DsFormElement, define } from '@/elements/lib/element'
import styles from 'virtual:tw'

// Textarea.vue as <conare-textarea>: several lines of text (main.css textarea.c-input, square under the console): 13px on
// 20px lines, 6px 12px inside, a #C3C1BF hairline that darkens on hover and turns to a 2px ink edge on focus (the text
// does not move), a red edge when invalid. Grows by hand downward only. 16px on phones, so iOS does not zoom. Put it in
// a <conare-field> for its label and hint. Form-associated (its `name` and `value` go with its form, a <label for> names
// it); v-model is `value` with the native `input` and `change` events. aria-label and aria-description pass to the
// inner <textarea>.

/**
 * @summary Several lines of text.
 * @fires input - On every keystroke (read `value`).
 * @fires change - When the value is committed.
 */
export class Textarea extends DsFormElement {
	static styles = [DsFormElement.styles, styles]
	static shadowRootOptions = { ...LitElement.shadowRootOptions, delegatesFocus: true }
	/** A field: a dialog starts in the first one. */
	static dsField = true
	static properties = {
		value: {},
		rows: { type: Number },
		name: {},
		placeholder: {},
		maxlength: { type: Number },
		disabled: { type: Boolean, reflect: true },
		readonly: { type: Boolean },
		required: { type: Boolean },
		invalid: { type: Boolean, reflect: true },
		label: { attribute: 'aria-label' },
		description: { attribute: 'aria-description' },
	}

	value = ''
	rows = 4
	name?: string
	placeholder?: string
	maxlength?: number
	disabled = false
	readonly = false
	required = false
	/** A red edge (with the message under it in a field). */
	invalid = false
	/** The name for assistive tech, passed to the inner textarea. */
	label?: string
	/** The hint or error, passed to the inner textarea (a field sets it). */
	description?: string

	protected updated(changed: PropertyValues) {
		super.updated(changed)
		if (changed.has('value')) this.internals.setFormValue(this.value)
	}
	protected validityControl() {
		return this.renderRoot.querySelector<HTMLTextAreaElement>('textarea')
	}
	formResetCallback() {
		this.value = this.getAttribute('value') ?? ''
	}
	private onInput(event: Event) {
		this.value = (event.target as HTMLTextAreaElement).value
	}
	// The inner change does not leave the shadow root: the element sends its own.
	private onChange() {
		this.dispatchEvent(new Event('change', { bubbles: true, composed: true }))
	}

	render() {
		return html`<textarea data-ds="textarea" .value=${live(this.value)} rows=${this.rows} name=${ifDefined(this.name)} placeholder=${ifDefined(this.placeholder)} maxlength=${ifDefined(this.maxlength)} ?disabled=${this.inactive} ?readonly=${this.readonly} ?required=${this.required} aria-invalid=${ifDefined(this.invalid ? 'true' : undefined)} aria-label=${ifDefined(this.label)} aria-description=${ifDefined(this.description)} class="ds-textarea" @input=${this.onInput} @change=${this.onChange}></textarea>`
	}
}

define('textarea', Textarea)
