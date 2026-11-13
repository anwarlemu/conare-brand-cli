import { html, LitElement, nothing, type PropertyValues } from 'lit'
import { ifDefined } from 'lit/directives/if-defined.js'
import { live } from 'lit/directives/live.js'
import { DsFormElement, define, uid } from '@/elements/lib/element'
import styles from 'virtual:tw'

// RadioGroup.vue as <conare-radio-group>: one of a few, all in view (new, in the console's grammar): square 16px boxes in
// the #C3C1BF hairline, an ink 8px square inside the picked one (it settles in from 0.6 in 120ms; reduced motion fades
// it), rows 28px (40px on phones) with a 13px label and an optional muted hint. Arrows move the pick, as native radios
// do; focus is the switch's red outline. More than five options is a NativeSelect or a Menu; two views of one thing are
// Tabs. `options` is a JSON attribute or a property; v-model is `value` with the native `input` and `change` events. Form-associated: its
// `name` goes with the form as the picked value.

export interface RadioOption { value: string, label: string, hint?: string, disabled?: boolean }

/**
 * @summary One of a few, all in view.
 * @fires input - The pick moved (read `value`).
 * @fires change - The pick moved (read `value`).
 */
export class RadioGroup extends DsFormElement {
	static styles = [DsFormElement.styles, styles]
	static shadowRootOptions = { ...LitElement.shadowRootOptions, delegatesFocus: true }
	static dsField = true
	static properties = { options: { type: Array }, label: {}, name: {}, inline: { type: Boolean }, disabled: { type: Boolean, reflect: true }, value: {} }

	options: RadioOption[] = []
	/** The group's name for assistive tech. */
	label = ''
	/** The form field's name (also the radios' group). */
	name?: string
	/** The options in a row. */
	inline = false
	disabled = false
	value?: string
	private group = uid('radio')

	protected updated(changed: PropertyValues) {
		super.updated(changed)
		if (changed.has('value')) this.internals.setFormValue(this.value ?? null)
	}
	formResetCallback() {
		this.value = this.getAttribute('value') ?? undefined
	}
	// The inner input event crosses the shadow root on its own (the value is set by then); change does not.
	private onChange() {
		this.dispatchEvent(new Event('change', { bubbles: true, composed: true }))
	}

	render() {
		const name = this.name ?? this.group
		return html`<div data-ds="radio-group" role="radiogroup" aria-label=${this.label} class="ds-radios" data-inline=${ifDefined(this.inline ? 'true' : undefined)}>${this.options.map((o) => html`<label class="ds-radiorow" data-disabled=${ifDefined(this.inactive || o.disabled ? 'true' : undefined)}>
				<span class="ds-radio"><input type="radio" name=${name} .value=${o.value} .checked=${live(this.value === o.value)} ?disabled=${this.inactive || !!o.disabled} aria-describedby=${ifDefined(o.hint ? `${name}-${o.value}` : undefined)} @input=${() => { this.value = o.value }} @change=${this.onChange}><i aria-hidden="true"></i></span>
				<span class="flex min-w-0 flex-col">
					<span>${o.label}</span>
					${o.hint ? html`<span id=${`${name}-${o.value}`} class="type-meta text-fg-muted">${o.hint}</span>` : nothing}
				</span>
			</label>`)}</div>`
	}
}

define('radio-group', RadioGroup)
