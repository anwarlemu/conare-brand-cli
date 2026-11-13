import { html, LitElement, type PropertyValues } from 'lit'
import { ifDefined } from 'lit/directives/if-defined.js'
import { live } from 'lit/directives/live.js'
import { DsFormElement, define } from '@/elements/lib/element'
import styles from 'virtual:tw'

// Input.vue as <conare-input>: a text field (console2.css .v2-input): 32px, a #C3C1BF hairline that turns ink on focus,
// 13px text and a muted placeholder. An svg in the `icon` slot (a 12px Lucide glyph) puts it at the start and makes it
// the 28px filter size. `invalid` turns the border red; <conare-field> shows the message. 40px and 16px on phones.
// It is form-associated (its `name` and `value` go with its form, a <label for> names it) and v-model is `value` with
// the native `input` and `change` events. aria-label and aria-description pass to the inner <input>.

/**
 * @summary A text field.
 * @slot icon - A 12px Lucide icon at the start (the filter size).
 * @fires input - On every keystroke (read `value`).
 * @fires change - When the value is committed.
 */
export class Input extends DsFormElement {
	static styles = [DsFormElement.styles, styles]
	static shadowRootOptions = { ...LitElement.shadowRootOptions, delegatesFocus: true }
	/** A field: a dialog starts in the first one. */
	static dsField = true
	static properties = {
		value: {},
		type: {},
		name: {},
		placeholder: {},
		autocomplete: {},
		disabled: { type: Boolean, reflect: true },
		readonly: { type: Boolean },
		required: { type: Boolean },
		invalid: { type: Boolean, reflect: true },
		label: { attribute: 'aria-label' },
		description: { attribute: 'aria-description' },
	}

	value = ''
	type = 'text'
	name?: string
	placeholder?: string
	autocomplete?: string
	disabled = false
	readonly = false
	required = false
	/** A red border (with the message under it in a field). */
	invalid = false
	/** The name for assistive tech, passed to the inner input. */
	label?: string
	/** The hint or error, passed to the inner input (a field sets it). */
	description?: string

	protected updated(changed: PropertyValues) {
		super.updated(changed)
		if (changed.has('value')) this.internals.setFormValue(this.value)
	}
	formResetCallback() {
		this.value = this.getAttribute('value') ?? ''
	}
	formDisabledCallback(disabled: boolean) {
		this.disabled = disabled
	}

	private onInput(event: Event) {
		this.value = (event.target as HTMLInputElement).value
	}
	private onChange() {
		this.dispatchEvent(new Event('change', { bubbles: true, composed: true }))
	}

	render() {
		const icon = this.hasSlot('icon')
		const input = (classes: string, ds?: string) => html`<input data-ds=${ifDefined(ds)} .value=${live(this.value)} type=${this.type} name=${ifDefined(this.name)} placeholder=${ifDefined(this.placeholder)} autocomplete=${ifDefined(this.autocomplete as never)} ?disabled=${this.disabled} ?readonly=${this.readonly} ?required=${this.required} aria-invalid=${ifDefined(this.invalid ? 'true' : undefined)} aria-label=${ifDefined(this.label)} aria-description=${ifDefined(this.description)} class=${classes} @input=${this.onInput} @change=${this.onChange}>`
		if (icon) {
			return html`<span data-ds="input" class="relative block w-full"><span class="pointer-events-none absolute top-1/2 left-2.5 flex -translate-y-1/2 text-fg-muted" aria-hidden="true"><slot name="icon"></slot></span>${input('h-control-sm w-full border border-edge-strong bg-surface pr-2.5 pl-7 text-meta leading-5 text-fg outline-none transition-[border-color] duration-120 ease-standard placeholder:text-fg-muted focus:border-edge-focus aria-invalid:border-action-danger disabled:cursor-not-allowed disabled:text-fg-muted max-md:h-control-touch max-md:text-input pointer-coarse:h-control-touch pointer-coarse:text-input')}</span>`
		}
		return input('h-control-md w-full border border-edge-strong bg-surface px-2.5 text-ui text-fg outline-none transition-[border-color] duration-120 ease-standard placeholder:text-fg-muted focus:border-edge-focus aria-invalid:border-action-danger disabled:cursor-not-allowed disabled:text-fg-muted max-md:h-control-touch max-md:text-input pointer-coarse:h-control-touch pointer-coarse:text-input', 'input')
	}
}

define('input', Input)
