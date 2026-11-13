import { html, LitElement, nothing, type PropertyValues } from 'lit'
import { html as staticHtml } from 'lit/static-html.js'
import { CalendarDays } from 'lucide'
import { ifDefined } from 'lit/directives/if-defined.js'
import { DsFormElement, define, tag, uid } from '@/elements/lib/element'
import { icon } from '@/elements/lib/icon'
import { PopoverController, popoverStyles } from '@/elements/lib/popover'
import '@/elements/components/ui/calendar'
import styles from 'virtual:tw'

// DatePicker.vue as <conare-date-picker>: a date in a field: a button drawn as the 32px text field (a #C3C1BF hairline
// that turns ink while it is open or focused, 13px, the placeholder muted) that opens a <conare-calendar> in Menu's
// square panel under it, in the top layer. Opening puts focus on the picked day (or today); picking a day closes it and
// returns focus to the field; Escape closes it unchanged. Put it in a <conare-field> as an input. v-model is `value` (a
// Date, or an ISO date attribute) with `input` and `change`. `min` and `max` are Dates (or ISO date attributes);
// `disabled` is a function of the day, set as a property. Form-associated: its `name` goes with the form as the day's
// ISO date (2026-11-13). aria-label and aria-description pass to the button.

const dateAttr = { fromAttribute: (v: string | null) => (v ? new Date(`${v}T00:00:00`) : null) }
const iso = (d: Date) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`

/**
 * @summary A date in a field, picked from a calendar.
 * @fires input - A day was picked (read `value`).
 * @fires change - A day was picked (read `value`).
 */
export class DatePicker extends DsFormElement {
	static styles = [DsFormElement.styles, popoverStyles, styles]
	static shadowRootOptions = { ...LitElement.shadowRootOptions, delegatesFocus: true }
	static dsField = true
	static properties = {
		value: { converter: dateAttr },
		name: {},
		placeholder: {},
		min: { converter: dateAttr },
		max: { converter: dateAttr },
		disabled: { attribute: false },
		invalid: { type: Boolean, reflect: true },
		locale: {},
		format: { type: Object },
		label: { attribute: 'aria-label' },
		description: { attribute: 'aria-description' },
	}

	value: Date | null = null
	name?: string
	placeholder = 'Pick a date'
	min?: Date | null
	max?: Date | null
	/** Days that can't be picked (a property: picker.disabled = (d) => d.getDay() === 0). */
	disabled?: (day: Date) => boolean
	/** A red edge (with the message under it in a field). */
	invalid = false
	locale = 'en-US'
	/** How the picked day reads in the field (Intl.DateTimeFormat options). */
	format: Intl.DateTimeFormatOptions = { month: 'short', day: 'numeric', year: 'numeric' }
	/** The name for assistive tech, passed to the button (a field sets it). */
	label?: string
	/** The hint or error, passed to the button (a field sets it). */
	description?: string
	private panelId = uid('date')
	private pop = new PopoverController(this, {
		side: 'bottom',
		align: 'start',
		gap: 4,
		anchor: () => this.renderRoot.querySelector<HTMLElement>('button[data-ds="date-picker"]'),
		panel: () => this.renderRoot.querySelector<HTMLElement>('.ds-pop'),
	})

	protected updated(changed: PropertyValues) {
		super.updated(changed)
		if (changed.has('value')) this.internals.setFormValue(this.value ? iso(this.value) : null)
	}
	formResetCallback() {
		this.value = dateAttr.fromAttribute(this.getAttribute('value'))
	}

	private onClick = async (event: MouseEvent | { detail: number }) => {
		if (this.pop.open) return this.pop.hide(event.detail === 0, event.detail === 0)
		await this.pop.show({ keyboard: event.detail === 0 })
		// The picked day (or today) in the calendar's own shadow root.
		const calendar = this.renderRoot.querySelector('.ds-pop')?.firstElementChild as HTMLElement | null
		await (calendar as unknown as { updateComplete?: Promise<unknown> })?.updateComplete
		calendar?.shadowRoot?.querySelector<HTMLElement>('.ds-day[tabindex="0"]')?.focus({ preventScroll: true })
	}
	private onKey(event: KeyboardEvent) {
		if (event.key === 'ArrowDown' && !this.pop.open) {
			event.preventDefault()
			void this.onClick({ detail: 0 })
		}
	}
	private onChange(event: Event) {
		event.stopPropagation()
		this.commit((event.target as HTMLElement & { value: Date | null }).value)
	}
	// The calendar's own select stays inside: Vue's DatePicker emits only its model.
	private picked(event: Event) {
		event.stopPropagation()
		this.pop.hide(true)
	}

	render() {
		const text = this.value?.toLocaleDateString(this.locale, this.format)
		const calendar = tag('calendar')
		return html`<button
				data-ds="date-picker"
				type="button"
				class="flex h-control-md w-full cursor-pointer items-center gap-2 border border-edge-strong bg-surface px-2.5 text-left text-ui text-fg outline-none transition-[border-color] duration-120 ease-standard focus-visible:border-edge-focus aria-expanded:border-edge-focus aria-invalid:border-action-danger max-md:h-control-touch max-md:text-input"
				?disabled=${this.formDisabled}
				aria-haspopup="dialog"
				aria-expanded=${String(this.pop.open)}
				aria-controls=${ifDefined(this.pop.open ? this.panelId : undefined)}
				aria-invalid=${ifDefined(this.invalid ? 'true' : undefined)}
				aria-label=${ifDefined(this.label)}
				aria-description=${ifDefined(this.description)}
				@click=${this.onClick}
				@keydown=${this.onKey}
			>${icon(CalendarDays, 'calendar-days', { size: 14, strokeWidth: 1.5, class: 'shrink-0 text-fg-muted', attrs: { 'aria-hidden': 'true' } })}<span class=${text ? 'min-w-0 flex-1 truncate' : 'min-w-0 flex-1 truncate text-fg-muted'}>${text ?? this.placeholder}</span></button>
			${this.pop.rendered
				? html`<div data-ds="date-picker" id=${this.panelId} popover="manual" class="ds-pop p-3" role="dialog" aria-label="choose a date" tabindex="-1" data-side=${this.pop.pos.side} ?data-instant=${this.pop.instant} ?data-placed=${this.pop.pos.placed} style=${this.pop.style()} @focusout=${this.pop.onFocusOut}>${staticHtml`<${calendar} .value=${this.value} .min=${this.min} .max=${this.max} .disabled=${this.disabled} .locale=${this.locale} @input=${(e: Event) => e.stopPropagation()} @change=${this.onChange} @select=${this.picked}></${calendar}>`}</div>`
				: nothing}`
	}
}

define('date-picker', DatePicker)
