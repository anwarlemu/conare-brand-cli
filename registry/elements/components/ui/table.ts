import { html } from 'lit'
import { ifDefined } from 'lit/directives/if-defined.js'
import { DsElement, define, tagName } from '@/elements/lib/element'
import styles from 'virtual:tw'

// Table.vue as <conare-table>: rows of one kind of thing. `product` (console2.css .v2-table): a paper head in sentence
// case, 12px muted; 40px rows (48px on phones); IDs in mono, numbers in tabular figures. `settings` (.c-table under the
// console): the plainer table Settings and the audit log share, its first and last columns on a 16px inset and a last
// column of buttons one width (92px). Rows with class `is-link` take the paper fill under the pointer. `framed` puts it
// in a hairline box that scrolls sideways on its own, so a phone never scrolls the page.
//
// Put the page's own <table> inside (<conare-table><table><thead>...</thead><tbody>...</tbody></table></conare-table>):
// an HTML parser drops <thead>, <tr> and <td> anywhere but in a <table>, so the element cannot hold them itself. It
// marks that table (class ds-table, data-variant) and gives the page the table's rules once, as its cells are the
// page's, out of the shadow root's reach.

/** Table.vue's <style>, scoped to tables inside the element. */
const RULES = `
.ds-table { position: relative; width: 100%; border-collapse: collapse; font-size: var(--ds-text-ui); line-height: var(--ds-text-ui-leading); }
.ds-table th { height: var(--ds-size-control-md); padding: 0 12px; border-bottom: var(--ds-border-hairline) solid var(--ds-color-edge); background: var(--ds-color-surface-subtle); color: var(--ds-color-fg-muted); font-size: var(--ds-text-meta); font-weight: var(--ds-font-weight-regular); text-align: left; white-space: nowrap; vertical-align: middle; }
.ds-table th.text-right { text-align: right; }
.ds-table td { height: var(--ds-size-row); padding: 4px 12px; border-bottom: var(--ds-border-hairline) solid var(--ds-color-edge); vertical-align: middle; }
.ds-table tbody tr:last-child td { border-bottom: 0; }
.ds-table tbody tr.is-link { cursor: pointer; }
@media (hover: hover) and (pointer: fine) { .ds-table tbody tr.is-link:hover td { background: color-mix(in srgb, var(--ds-color-surface-subtle) 70%, var(--ds-color-off-white)); } }
.ds-table tbody tr.is-link:focus-visible { outline: var(--ds-border-focus) solid var(--ds-color-edge-focus); outline-offset: -2px; }
/* Settings: a 16px inset at both ends, 6px cell padding, heads in sentence case. */
.ds-table[data-variant="settings"] td { padding: 6px 12px; }
.ds-table[data-variant="settings"] :is(th, td):first-child { padding-left: 16px; }
.ds-table[data-variant="settings"] :is(th, td):last-child { padding-right: 16px; }
.ds-table[data-variant="settings"] th::first-letter { text-transform: uppercase; }
.ds-table[data-variant="settings"] td:last-child :is(button, a):only-child { width: 92px; }
.ds-table[data-variant="settings"] td:last-child > :only-child::part(control) { width: 92px; }
@media (pointer: coarse), (max-width: 767px) {
  .ds-table[data-variant="product"] td { height: 48px; }
  .ds-table[data-variant="product"] th { height: var(--ds-size-control-lg); }
}
@media (max-width: 359px) { .ds-table[data-variant="product"] :is(th, td) { padding-inline: 8px; } }
/* Beside a sidebar, a tablet has less room than its width suggests. */
@media (min-width: 768px) and (max-width: 1023px) { .ds-table :is(th, td) { padding-inline: 8px; } }
`
const sheets = new WeakSet<Document | ShadowRoot>()
function adoptRules(root: Node) {
	if (!(root instanceof Document || root instanceof ShadowRoot) || sheets.has(root)) return
	const sheet = new CSSStyleSheet()
	sheet.replaceSync(`@scope (${tagName('table')}) { ${RULES} }`)
	root.adoptedStyleSheets = [...root.adoptedStyleSheets, sheet]
	sheets.add(root)
}

/**
 * @summary Rows of one kind of thing: wraps the page's own <table>.
 * @slot - A <table> with its <thead> and <tbody>.
 */
export class Table extends DsElement {
	static styles = [DsElement.styles, styles]
	static properties = { variant: {}, framed: { type: Boolean }, label: {} }

	/** product or settings. */
	variant: 'product' | 'settings' = 'product'
	/** A hairline box that scrolls sideways on its own. */
	framed = false
	/** The frame's name (a region), when framed. */
	label?: string

	connectedCallback() {
		super.connectedCallback()
		adoptRules(this.getRootNode())
	}

	// The page's table takes Vue's classes; unframed, it is the item's box and carries data-ds.
	protected updated() {
		const table = this.querySelector(':scope > table')
		if (!table) return
		table.classList.add('ds-table')
		table.setAttribute('data-variant', this.variant)
		if (this.framed) table.removeAttribute('data-ds')
		else table.setAttribute('data-ds', 'table')
	}

	render() {
		return this.framed
			? html`<div data-ds="table" class="overflow-x-auto border border-edge bg-surface" role=${ifDefined(this.label ? 'region' : undefined)} aria-label=${ifDefined(this.label)} tabindex=${ifDefined(this.label ? '0' : undefined)}><slot @slotchange=${() => this.updated()}></slot></div>`
			: html`<slot @slotchange=${() => this.updated()}></slot>`
	}
}

define('table', Table)
