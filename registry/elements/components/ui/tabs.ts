import { html } from 'lit'
import { DsElement, define } from '@/elements/lib/element'
import styles from 'virtual:tw'

// Tabs.vue as <conare-tabs>: the segmented control (console2.css .v2-tabs), for a few views of one thing or a range: a
// paper track in a hairline, the pick a white block with its own hairline. Where the browser has anchor positioning,
// one white block glides to the pick. v-model is `value` with `input` and `change` events.
export type TabOption = string | { value: string, label: string, disabled?: boolean }
const norm = (o: TabOption) => (typeof o === 'string' ? { value: o, label: o, disabled: false } : { disabled: false, ...o })

/**
 * @summary A segmented control for a few views of one thing.
 * @fires input - The pick changed (read `value`).
 * @fires change - The pick changed (read `value`).
 */
export class Tabs extends DsElement {
	static styles = [DsElement.styles, styles]
	static properties = { value: {}, options: { type: Array }, label: {} }

	/** The picked option's value. */
	value = ''
	/** Strings, or { value, label, disabled } (a JSON attribute or the property). */
	options: TabOption[] = []
	/** The group's name for assistive tech. */
	label = ''

	render() {
		return html`<div data-ds="tabs" class="ds-tabs" role="tablist" aria-label=${this.label}>${this.options.map(norm).map((o) => html`<button type="button" role="tab" aria-selected=${String(this.value === o.value)} ?disabled=${o.disabled} @click=${() => this.commit(o.value)}>${o.label}</button>`)}</div>`
	}
}

define('tabs', Tabs)
