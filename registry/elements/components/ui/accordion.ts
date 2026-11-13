import { html, type PropertyValues } from 'lit'
import { DsElement, define, tagName } from '@/elements/lib/element'
import styles from 'virtual:tw'

// Accordion.vue as <conare-accordion>: a stack of disclosures, built in Conare's style from the console's disclosure
// (.v2-collapse, .c-details) and the website's FAQ: hairlines between rows, a 12px muted chevron that turns as a row
// opens, the row's height opening from 0fr to 1fr over 260ms and closing in 180ms on the strong ease-out, its words
// fading down into place a beat after. One open at a time by default (a second press closes it); `multiple` lets
// several stay open. v-model is `value` (the open item's value, or a JSON list of them with `multiple`) with `input`
// and `change` events. Compose with <conare-accordion-item>.
export type AccordionValue = string | string[] | null

/**
 * @summary A stack of disclosures, one open at a time or several.
 * @slot - The rows: <conare-accordion-item>.
 * @fires input - A row opened or closed (read `value`).
 * @fires change - A row opened or closed (read `value`).
 */
export class Accordion extends DsElement {
	static styles = [DsElement.styles, styles]
	static properties = {
		multiple: { type: Boolean },
		value: { converter: { fromAttribute: (v: string | null) => (v?.trim().startsWith('[') ? JSON.parse(v) : v || null), toAttribute: (v: AccordionValue) => (Array.isArray(v) ? JSON.stringify(v) : v) } },
	}

	/** Several rows stay open. */
	multiple = false
	/** The open row's value, or the list of them with `multiple`. */
	value: AccordionValue = null

	private list() {
		return Array.isArray(this.value) ? this.value : this.value ? [this.value] : []
	}
	/** Whether the row with this value is open (read by the items). */
	isOpen(v: string) {
		return this.list().includes(v)
	}
	/** Opens or closes the row with this value (the items' press). */
	toggle(v: string) {
		const open = this.list()
		if (this.multiple) this.commit(open.includes(v) ? open.filter((x) => x !== v) : [...open, v])
		else this.commit(open.includes(v) ? null : v)
	}

	protected updated(changed: PropertyValues<this>) {
		super.updated(changed)
		if (changed.has('value')) for (const item of this.querySelectorAll<HTMLElement & { requestUpdate(): void }>(tagName('accordion-item'))) item.requestUpdate()
	}

	render() {
		return html`<div data-ds="accordion" class="ds-accordion border-t border-edge"><slot></slot></div>`
	}
}

define('accordion', Accordion)
