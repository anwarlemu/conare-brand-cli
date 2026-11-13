import { html, LitElement, nothing, type PropertyValues } from 'lit'
import { ifDefined } from 'lit/directives/if-defined.js'
import { live } from 'lit/directives/live.js'
import { DsFormElement, define } from '@/elements/lib/element'
import styles from 'virtual:tw'

// InputOtp.vue as <conare-input-otp>: a one-time code (new, in the console's grammar): square 32px cells in the #C3C1BF
// hairline, Geist Mono digits at 16px, the cell being typed into ink-edged with a caret, and an optional gap after
// `split` cells. It is one real input laid over the cells, so paste, the phone's code suggestion
// (autocomplete="one-time-code"), arrows and delete all work as in any field. Fires `complete` when every cell is
// filled. A red edge on every cell when invalid. 40px cells on phones. Form-associated (its `name` and `value` go with
// its form); v-model is `value` with the native `input` and `change` events.

/**
 * @summary A one-time code, one cell per character.
 * @fires input - On every keystroke (read `value`).
 * @fires change - When the value is committed.
 * @fires complete - Every cell is filled; detail.value is the code.
 */
export class InputOtp extends DsFormElement {
	static styles = [DsFormElement.styles, styles]
	static shadowRootOptions = { ...LitElement.shadowRootOptions, delegatesFocus: true }
	static dsField = true
	static properties = {
		value: {},
		length: { type: Number },
		split: { type: Number },
		label: {},
		numeric: { converter: { fromAttribute: (v: string | null) => v !== 'false' } },
		invalid: { type: Boolean, reflect: true },
		disabled: { type: Boolean, reflect: true },
		name: {},
		focused: { state: true },
		caret: { state: true },
	}

	value = ''
	length = 6
	/** A gap after this many cells (3 for two threes). */
	split?: number
	/** The name for assistive tech. */
	label = ''
	/** Digits only (numeric="false" takes letters too). */
	numeric = true
	invalid = false
	disabled = false
	name?: string
	private focused = false
	private caret = 0

	protected updated(changed: PropertyValues) {
		super.updated(changed)
		if (changed.has('value')) this.internals.setFormValue(this.value)
	}
	formResetCallback() {
		this.value = this.getAttribute('value') ?? ''
	}
	private get input() {
		return this.renderRoot.querySelector('input')
	}
	private sync() {
		const el = this.input
		if (!el) return
		this.caret = el.selectionStart ?? el.value.length
	}
	// A click lands on the next empty cell, as typing would.
	private toEnd() {
		const el = this.input
		if (!el) return
		const end = el.value.length
		el.setSelectionRange(end, end)
		this.sync()
	}
	private onInput(event: Event) {
		const el = event.target as HTMLInputElement
		const clean = (this.numeric ? el.value.replace(/\D/g, '') : el.value.replace(/\s/g, '')).slice(0, this.length)
		if (clean !== el.value) el.value = clean
		this.value = clean
		this.sync()
		if (clean.length === this.length) this.emit('complete', { value: clean })
	}
	// The inner change does not leave the shadow root: the element sends its own.
	private onChange() {
		this.dispatchEvent(new Event('change', { bubbles: true, composed: true }))
	}

	render() {
		const active = this.focused ? Math.min(this.caret, this.length - 1) : -1
		const cells = Array.from({ length: this.length }, (_, i) => this.value[i] ?? '')
		return html`<div data-ds="input-otp" class="ds-otp" data-invalid=${ifDefined(this.invalid ? 'true' : undefined)} data-disabled=${ifDefined(this.inactive ? 'true' : undefined)}>
			<input
				.value=${live(this.value)}
				maxlength=${this.length}
				inputmode=${this.numeric ? 'numeric' : 'text'}
				pattern=${ifDefined(this.numeric ? '[0-9]*' : undefined)}
				autocomplete="one-time-code"
				spellcheck="false"
				aria-label=${this.label}
				aria-invalid=${ifDefined(this.invalid ? 'true' : undefined)}
				?disabled=${this.inactive}
				@input=${this.onInput}
				@change=${this.onChange}
				@focus=${() => { this.focused = true; this.toEnd() }}
				@blur=${() => { this.focused = false }}
				@keyup=${this.sync}
				@click=${this.toEnd}
			>
			${cells.map((c, i) => html`<span class="ds-otp-cell" data-active=${ifDefined(i === active ? 'true' : undefined)} data-gap=${ifDefined(this.split && i === this.split - 1 && i < this.length - 1 ? 'true' : undefined)} aria-hidden="true">${c}${i === active && !c ? html`<i></i>` : nothing}</span>`)}
		</div>`
	}
}

define('input-otp', InputOtp)
