import { html } from 'lit'
import { ifDefined } from 'lit/directives/if-defined.js'
import { DsElement, define } from '@/elements/lib/element'
import styles from 'virtual:tw'

// Stat.vue as <conare-stat>: a label over a number (console2.css .v2-stat): 12px muted label, 16px medium value in
// tabular figures. A stat that drives a chart is a button: set `pressed` (pressed="false" for one that is not pinned)
// and it fills with the paper under the pointer, and the pinned one stays filled with a 2px red edge on top. Inside
// <conare-stats>, or alone at the top of a card.

/** No attribute: not pressable; pressed="false": pressable, not pinned; pressed or pressed="true": pinned. */
const tristate = { fromAttribute: (v: string | null) => (v === null ? undefined : v !== 'false') }

/**
 * @summary A label over a number; with `pressed`, a button that pins it.
 * @slot - The value, in place of `value`.
 * @fires press - A pressable stat was pressed.
 */
export class Stat extends DsElement {
	static styles = [DsElement.styles, styles]
	static properties = { label: {}, value: {}, pressed: { converter: tristate } }

	/** The 12px label. */
	label = ''
	/** The number. */
	value?: string
	/** Set (true or false) for a stat that is a button; true while it is pinned. */
	pressed?: boolean

	render() {
		const body = html`<p class="type-meta text-fg-muted">${this.label}</p><p class="ds-stat-value"><slot>${this.value}</slot></p>`
		return this.pressed !== undefined
			? html`<button data-ds="stat" type="button" class="ds-stat" aria-pressed=${String(this.pressed)} data-on=${ifDefined(this.pressed ? '' : undefined)} @click=${() => this.emit('press')}>${body}</button>`
			: html`<div data-ds="stat" class="ds-stat">${body}</div>`
	}
}

define('stat', Stat)
