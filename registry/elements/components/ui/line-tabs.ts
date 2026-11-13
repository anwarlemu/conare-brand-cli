import { html } from 'lit'
import { DsElement, define } from '@/elements/lib/element'
import styles from 'virtual:tw'

// LineTabs.vue as <conare-line-tabs>: line tabs for a page's sections (console2.css .v2-tabline): 13px muted labels
// 24px apart over a hairline; the current one in ink with a 2px ink underline and a 4px red square before it. v-model
// is `value` with `input` and `change` events.
export type LineTabOption = string | { value: string, label: string }
const norm = (o: LineTabOption) => (typeof o === 'string' ? { value: o, label: o } : o)

/**
 * @summary Line tabs for a page's sections.
 * @fires input - The pick changed (read `value`).
 * @fires change - The pick changed (read `value`).
 */
export class LineTabs extends DsElement {
	static styles = [DsElement.styles, styles]
	static properties = { value: {}, options: { type: Array }, label: {} }

	value = ''
	/** Strings, or { value, label } (a JSON attribute or the property). */
	options: LineTabOption[] = []
	label = ''

	render() {
		return html`<div data-ds="line-tabs" class="ds-tabline" role="tablist" aria-label=${this.label}>${this.options.map(norm).map((o) => html`<button type="button" role="tab" aria-selected=${String(this.value === o.value)} @click=${() => this.commit(o.value)}>${o.label}</button>`)}</div>`
	}
}

define('line-tabs', LineTabs)
