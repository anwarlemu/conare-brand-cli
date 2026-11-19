import { nothing } from 'lit'
import { html as staticHtml } from 'lit/static-html.js'
import { DsElement, define, tag } from '@/elements/lib/element'
import { icon } from '@/elements/lib/icon'
import { ArrowLeft, Search } from 'lucide'
import '@/elements/components/product/console-page'
import '@/elements/components/ui/button'
import '@/elements/components/ui/card'
import '@/elements/components/ui/facts'
import '@/elements/components/ui/input'
import '@/elements/components/ui/pixel-button'
import '@/elements/components/ui/table'
import styles from 'virtual:tw'

// ListDetailPage.vue as <conare-list-detail-page>: a list and the page of one thing in it (pages/dashboard/namespaces,
// index and [namespace]): the list's head has a filter and the one dark button; each row opens its thing (a press, or
// Enter on the focused row). The thing's page takes its name in mono as the title, a way back and its own dark button,
// its facts, then what it holds in a flush card. A filter with no match says so. It calls nothing: `open` is the open
// row's name ('' for the list, Vue's v-model:open, with `change`), `create` and `search` (detail: the row) are the dark
// buttons. `heading` is Vue's `title`. The root is console-page's, named list-detail-page.
export type ListDoc = { id: string, updated: string, size: string }
export type ListRow = { name: string, documents: number, created: string, searched: string, model?: string, docs?: ListDoc[] }
const count = (n: number) => n.toLocaleString('en-US')

/**
 * @summary A list whose rows open a page of their own.
 * @fires change - A row opened or the page went back to the list (read `open`).
 * @fires create - The list's dark button was pressed.
 * @fires search - The thing's dark button was pressed; detail is its row.
 */
export class ListDetailPage extends DsElement {
	static styles = [DsElement.styles, styles]
	static properties = { rows: { type: Array }, heading: {}, noun: {}, open: {}, filter: { state: true } }

	rows: ListRow[] = []
	/** The list's title (Vue's `title`). */
	heading?: string
	/** What the rows are, for the filter and the buttons. */
	noun?: string
	/** The open row's name, '' for the list. */
	open = ''
	private filter = ''

	private go(name: string) {
		this.open = name
		this.emit('change')
	}
	private onRowKey(event: KeyboardEvent, name: string) {
		if (event.key !== 'Enter' && event.key !== ' ') return
		event.preventDefault()
		this.go(name)
	}

	render() {
		const [page, button, pixel, card, facts, input, table] = [tag('console-page'), tag('button'), tag('pixel-button'), tag('card'), tag('facts'), tag('input'), tag('table')]
		const thing = this.noun ?? 'namespace'
		const row = this.rows.find((r) => r.name === this.open)
		if (row) {
			const list = [{ name: 'Documents', value: count(row.documents) }, { name: 'Created', value: row.created }, { name: 'Last searched', value: row.searched }, ...(row.model ? [{ name: 'Model', value: row.model, mono: true }] : [])]
			return staticHtml`<${page} data-ds="list-detail-page" .rootName=${'list-detail-page'} .heading=${row.name} mono><${button} slot="actions" @click=${() => this.go('')}>${icon(ArrowLeft, 'arrow-left', { size: 12, strokeWidth: 1.5, attrs: { 'aria-hidden': 'true' } })}${`All ${thing}s`}</${button}><${pixel} slot="actions" @click=${() => this.emit('search', row)}>${icon(Search, 'search', { size: 12, strokeWidth: 1.5, attrs: { 'aria-hidden': 'true' } })}Test a search</${pixel}><${facts} .facts=${list}></${facts}><${card} heading="Documents" flush><${table}><table><thead><tr><th>Document</th><th class="w-px text-right max-sm:hidden">Size</th><th class="w-px">Updated</th></tr></thead><tbody>${!row.docs?.length ? staticHtml`<tr><td colspan="3" class="py-10 text-center text-fg-muted">No documents yet.</td></tr>` : nothing}${(row.docs ?? []).map((d) => staticHtml`<tr><td class="max-w-0 truncate font-code" title=${d.id}>${d.id}</td><td class="text-right whitespace-nowrap text-fg-muted tabular-nums max-sm:hidden">${d.size}</td><td class="whitespace-nowrap text-fg-muted">${d.updated}</td></tr>`)}</tbody></table></${table}></${card}></${page}>`
		}
		const q = this.filter.trim().toLowerCase()
		const shown = q ? this.rows.filter((r) => r.name.toLowerCase().includes(q)) : this.rows
		return staticHtml`<${page} data-ds="list-detail-page" .rootName=${'list-detail-page'} .heading=${this.heading ?? 'Namespaces'}><label slot="actions" class="w-64 max-sm:w-full"><${input} .value=${this.filter} placeholder=${`Filter ${thing}s`} aria-label=${`filter ${thing}s`} @input=${(e: Event) => { this.filter = (e.target as HTMLElement & { value: string }).value }}>${icon(Search, 'search', { size: 12, strokeWidth: 1.5, attrs: { slot: 'icon' } })}</${input}></label><${pixel} slot="actions" class="shrink-0" @click=${() => this.emit('create')}>${`New ${thing}`}</${pixel}>${!shown.length ? staticHtml`<p class="type-meta text-fg-muted">${`No ${thing} matches "${this.filter}".`}</p>` : staticHtml`<${table} framed><table><thead><tr><th>Name</th><th class="w-32 text-right">Documents</th><th class="w-36 max-md:hidden">Last searched</th><th class="w-32 max-sm:hidden">Created</th></tr></thead><tbody>${shown.map((r) => staticHtml`<tr class="is-link" tabindex="0" @click=${() => this.go(r.name)} @keydown=${(e: KeyboardEvent) => this.onRowKey(e, r.name)}><td class="max-w-0 truncate font-code">${r.name}</td><td class="text-right tabular-nums">${count(r.documents)}</td><td class="whitespace-nowrap text-fg-muted max-md:hidden">${r.searched}</td><td class="whitespace-nowrap text-fg-muted max-sm:hidden">${r.created}</td></tr>`)}</tbody></table></${table}>`}</${page}>`
	}
}

define('list-detail-page', ListDetailPage)
