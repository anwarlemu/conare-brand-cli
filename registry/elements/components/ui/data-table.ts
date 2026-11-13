import { html, nothing, type PropertyValues } from 'lit'
import { html as staticHtml } from 'lit/static-html.js'
import { ArrowDown, ArrowUp, ArrowUpDown } from 'lucide'
import { ifDefined } from 'lit/directives/if-defined.js'
import { repeat } from 'lit/directives/repeat.js'
import { styleMap } from 'lit/directives/style-map.js'
import { DsElement, define, tag } from '@/elements/lib/element'
import { icon } from '@/elements/lib/icon'
import '@/elements/components/product/filter-chip'
import '@/elements/components/ui/show-more'
import '@/elements/components/ui/table'
import styles from 'virtual:tw'

// DataTable.vue as <conare-data-table>: a table people narrow and order (Table with the search's filter chips and the
// credit history's foot): a filter-chip per filter over it, heads that sort (aria-sort; the arrow shows the order, a
// faint pair where it could), and the first `page-size` rows with "Show N more" under them, each new row landing as
// the credit history's lines do. Filters and sort reset what is shown. Cells render the value (numbers right, in
// tabular figures, en-US), or what `cells[key]({ row, value })` returns (a node or text: Vue's `cell-<key>` slots).
// Nothing matching shows one line with a way to clear the filters, or the `empty` slot. `columns`, `rows` and
// `filters` are JSON attributes or properties.

export type DataColumn = { key: string, label: string, align?: 'left' | 'right', sortable?: boolean, mono?: boolean, muted?: boolean }
export type DataFilter = { key: string, label: string, options: string[], any?: string }
export type DataRow = Record<string, unknown>
export type DataCell = (slot: { row: DataRow, value: unknown }) => unknown

const display = (v: unknown) => (typeof v === 'number' ? v.toLocaleString('en-US') : String(v ?? ''))

/**
 * @summary A table people filter, sort and open a few rows more of.
 * @slot empty - In place of the line shown when nothing matches the filters.
 */
export class DataTable extends DsElement {
	static styles = [DsElement.styles, styles]
	static properties = {
		columns: { type: Array },
		rows: { type: Array },
		rowKey: { attribute: 'row-key' },
		label: {},
		filters: { type: Array },
		pageSize: { type: Number, attribute: 'page-size' },
		cells: { attribute: false },
		picked: { state: true },
		sort: { state: true },
		shown: { state: true },
		fresh: { state: true },
	}

	columns: DataColumn[] = []
	rows: DataRow[] = []
	/** The field that tells rows apart. */
	rowKey = 'id'
	/** The table's name for assistive tech. */
	label = ''
	filters: DataFilter[] = []
	pageSize = 5
	/** How a column's cells render, by key (a property): table.cells = { status: ({ value }) => node }. */
	cells: Partial<Record<string, DataCell>> = {}
	private picked: Record<string, string> = {}
	private sort: { key: string, dir: 'ascending' | 'descending' } | null = null
	private shown = 5
	private fresh: number | null = null

	protected willUpdate(changed: PropertyValues) {
		super.willUpdate(changed)
		if (changed.has('pageSize') && changed.get('pageSize') === undefined) this.shown = this.pageSize
	}

	private get sorted() {
		const filtered = this.rows.filter((r) => this.filters.every((f) => !this.picked[f.key] || String(r[f.key]) === this.picked[f.key]))
		const s = this.sort
		if (!s) return filtered
		const sign = s.dir === 'ascending' ? 1 : -1
		return [...filtered].sort((a, b) => {
			const x = a[s.key]
			const y = b[s.key]
			return sign * (typeof x === 'number' && typeof y === 'number' ? x - y : String(x).localeCompare(String(y)))
		})
	}
	// Vue's watch on the filters and the sort: what is shown starts over.
	private restart() {
		this.shown = this.pageSize
		this.fresh = null
	}
	private pick(next: Record<string, string>) {
		this.picked = next
		this.restart()
	}
	private toggleSort(key: string) {
		const s = this.sort
		this.sort = s?.key !== key ? { key, dir: 'ascending' } : s.dir === 'ascending' ? { key, dir: 'descending' } : null
		this.restart()
	}
	private showMore() {
		this.fresh = this.shown
		this.shown += this.pageSize
	}

	render() {
		const sorted = this.sorted
		const visible = sorted.slice(0, this.shown)
		const more = Math.min(this.pageSize, sorted.length - this.shown)
		const anyOn = Object.values(this.picked).some(Boolean)
		const [chip, table, showMore] = [tag('filter-chip'), tag('table'), tag('show-more')]
		const sortIcon = (c: DataColumn) => (this.sort?.key === c.key && this.sort.dir === 'ascending'
			? icon(ArrowUp, 'arrow-up', { size: 12, strokeWidth: 1.5, class: 'text-fg', attrs: { 'aria-hidden': 'true' } })
			: this.sort?.key === c.key
				? icon(ArrowDown, 'arrow-down', { size: 12, strokeWidth: 1.5, class: 'text-fg', attrs: { 'aria-hidden': 'true' } })
				: icon(ArrowUpDown, 'arrow-up-down', { size: 12, strokeWidth: 1.5, class: 'ds-sort-idle', attrs: { 'aria-hidden': 'true' } }))
		const clear = (classes: string) => html`<button type="button" class=${classes} @click=${() => this.pick({})}>Clear filters</button>`
		return staticHtml`<div data-ds="data-table" class="ds-data-table flex min-w-0 flex-col gap-3">
			${this.filters.length
				? html`<div class="flex flex-wrap items-center gap-2">${this.filters.map((f) => staticHtml`<${chip} .value=${this.picked[f.key] ?? ''} @change=${(e: Event) => this.pick({ ...this.picked, [f.key]: String((e.target as HTMLElement & { value: unknown }).value ?? '') })} label=${f.label} .options=${f.options.map((o) => ({ value: o, label: o }))} any=${f.any ?? 'Any'}></${chip}>`)}${anyOn ? clear('ds-more relative ml-1 cursor-pointer text-meta font-medium text-fg-soft') : nothing}</div>`
				: nothing}
			<${table} framed label=${this.label}>
				<table>
					<thead>
						<tr>${this.columns.map((c) => html`<th class=${c.align === 'right' ? 'text-right' : ''} aria-sort=${ifDefined(this.sort?.key === c.key ? this.sort.dir : c.sortable ? 'none' : undefined)}>${c.sortable
							? html`<button type="button" class=${['ds-sort inline-flex cursor-pointer items-center gap-1', c.align === 'right' ? 'flex-row-reverse' : ''].join(' ')} @click=${() => this.toggleSort(c.key)}>${c.label}${sortIcon(c)}</button>`
							: c.label}</th>`)}</tr>
					</thead>
					<tbody>
						${repeat(visible, (r) => String(r[this.rowKey]), (r, i) => {
							const isNew = this.fresh !== null && i >= this.fresh
							return html`<tr data-new=${ifDefined(isNew ? '' : undefined)} style=${styleMap(isNew ? { '--i': String(i - this.fresh!) } : {})}>${this.columns.map((c) => html`<td class=${[c.align === 'right' ? 'text-right tabular-nums' : '', c.mono ? 'type-code-sm' : '', c.muted ? 'type-meta whitespace-nowrap text-fg-muted' : ''].join(' ').trim()}>${this.cells[c.key] ? this.cells[c.key]!({ row: r, value: r[c.key] }) : display(r[c.key])}</td>`)}</tr>`
						})}
						${visible.length ? nothing : html`<tr><td colspan=${this.columns.length} class="py-6 text-center type-meta text-fg-muted"><slot name="empty">Nothing matches these filters. ${clear('ds-more relative ml-1 cursor-pointer font-medium text-fg-soft')}</slot></td></tr>`}
					</tbody>
				</table>
			</${table}>
			${sorted.length > this.pageSize
				? staticHtml`<div class="flex items-center justify-between gap-3">${more > 0 ? staticHtml`<${showMore} count=${more} @click=${this.showMore}></${showMore}>` : nothing}<span class="ml-auto type-meta text-fg-muted tabular-nums">${visible.length} of ${sorted.length}</span></div>`
				: nothing}
		</div>`
	}
}

define('data-table', DataTable)
