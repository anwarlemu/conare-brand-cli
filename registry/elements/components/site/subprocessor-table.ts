import { html } from 'lit'
import { repeat } from 'lit/directives/repeat.js'
import { DsElement, define } from '@/elements/lib/element'
import styles from 'virtual:tw'

// SubprocessorTable.vue as <conare-subprocessor-table>: the subprocessors as a policy page's ruled table (home.css
// .legal-table): who, what for, what data and where, each name linking to its data-processing terms. The double rule
// frames it; on a phone it scrolls sideways inside its frame (a keyboard reaches it too), never the page.
export type Subprocessor = { name: string, terms: string, purpose: string, data: string, location: string }

/** @summary The subprocessors as a policy page's ruled table. */
export class SubprocessorTable extends DsElement {
	static styles = [DsElement.styles, styles]
	static properties = { rows: { type: Array }, label: {} }

	/** [{ name, terms, purpose, data, location }]. */
	rows: Subprocessor[] = []
	/** The region's name. */
	label = 'subprocessors'

	render() {
		return html`<div data-ds="subprocessor-table" class="ds-legal-table overflow-x-auto border border-edge outline outline-offset-4 outline-edge" role="region" aria-label=${this.label} tabindex="0">
			<table class="w-full min-w-160 text-left type-body">
				<thead>
					<tr>
						<th>Subprocessor</th>
						<th>Purpose of processing</th>
						<th>Data categories</th>
						<th>Processing location</th>
					</tr>
				</thead>
				<tbody>
					${repeat(this.rows ?? [], (p) => p.name, (p) => html`<tr>
						<td><a href=${p.terms} target="_blank" rel="noopener">${p.name}</a></td>
						<td>${p.purpose}</td>
						<td>${p.data}</td>
						<td>${p.location}</td>
					</tr>`)}
				</tbody>
			</table>
		</div>`
	}
}

define('subprocessor-table', SubprocessorTable)
