import { nothing } from 'lit'
import { html } from 'lit/static-html.js'
import { DsElement, define, tag } from '@/elements/lib/element'
import '@/elements/components/site/docs-inline'
import styles from 'virtual:tw'

// DocsTable.vue as <conare-docs-table>: a docs table (docs/Table.vue): ruled rows under a paper head, or none for a
// key-value table, whose first column is set in ink. Cells take docs inline text. It scrolls sideways in its own frame
// on a phone.

/** @summary A ruled docs table that scrolls sideways in its own frame. */
export class DocsTable extends DsElement {
	static styles = [DsElement.styles, styles]
	static properties = { head: { type: Array }, rows: { type: Array }, label: {} }

	/** The head's cells; none for a key-value table. */
	head?: string[]
	/** The rows, each an array of cells. */
	rows: string[][] = []
	/** The region's name (else the head, joined). */
	label?: string

	render() {
		const inline = tag('docs-inline')
		return html`<div data-ds="docs-table" class="ds-docs-table fade-x overflow-x-auto border border-edge" role="region" aria-label=${this.label ?? this.head?.join(', ') ?? 'table'} tabindex="0">
			<table class="w-full text-left type-body">
				${this.head ? html`<thead class="bg-surface-subtle text-fg-muted"><tr>${this.head.map((h) => html`<th class="px-4 py-3 text-meta font-normal whitespace-nowrap">${h}</th>`)}</tr></thead>` : nothing}
				<tbody>
					${(this.rows ?? []).map((row) => html`<tr>${row.map((cell, c) => html`<td class=${['px-4 py-3 align-top', c === 0 ? 'min-w-35 text-fg' : 'text-fg-muted'].join(' ')}><${inline} .text=${cell}></${inline}></td>`)}</tr>`)}
				</tbody>
			</table>
		</div>`
	}
}

define('docs-table', DocsTable)
