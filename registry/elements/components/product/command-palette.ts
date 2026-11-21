import { html, nothing, type PropertyValues } from 'lit'
import { live } from 'lit/directives/live.js'
import { unsafeHTML } from 'lit/directives/unsafe-html.js'
import { Braces, Database, Search } from 'lucide'
import { DsElement, define } from '@/elements/lib/element'
import { icon } from '@/elements/lib/icon'
import styles from 'virtual:tw'

// CommandPalette.vue as <conare-command-palette>: one box for everything (Command.vue, .v2-cmd): documents as you
// type, namespaces, pages and actions. It opens many times a day, from ⌘K, / or the sidebar's search, so it shows and
// hides without animation. 560px wide, 15vh from the top on a page dimmed 24%, square, a hairline, no shadow: the
// website's dark window by default (`tone="dark"`, a title bar with the mark and a Search tag, key chips at the foot),
// or on the paper (`tone="light"`). The input keeps focus: arrows move the highlighted row (the menus' row with its red
// square), Enter runs it, Tab stays in the box, Escape or a press on the dimmed page closes and focus returns to what
// opened it. The highlight follows the arrows and the pointer alike. Documents come from the app: listen for `query`
// (detail.value, the text as typed; debounce it) and set `documents` and `searching`. `select` hands back the row
// picked (detail.pick). Vue's v-model:open is the `open` attribute with `open-change`; Vue's `title` is `heading`. A
// page or action's `icon` is an svg's markup (a Lucide icon's, say), drawn at 14px.
export interface PaletteDocument { id: string, namespace?: string, text?: string, logo?: string | null }
export interface PaletteNamespace { name: string, documents: number, logo?: string | null }
export interface PaletteLink { id?: string, label: string, icon?: string, href?: string }
export type PalettePick =
	| { kind: 'search', query: string }
	| { kind: 'document', document: PaletteDocument }
	| { kind: 'namespace', namespace: PaletteNamespace }
	| { kind: 'page', page: PaletteLink }
	| { kind: 'action', action: PaletteLink }
interface Row { id: string, group: string, label: string, pick: PalettePick, icon?: string, logo?: string | null, meta?: string, text?: string, mono?: boolean }

const compact = new Intl.NumberFormat('en-US', { notation: 'compact', maximumFractionDigits: 1 })
const SEARCH = Symbol('search')

// An svg's markup drawn as the Vue palette draws a row's icon component: 14px, a 1.5 stroke, muted, hidden from
// assistive tech. Each markup is parsed once.
const drawn = new Map<string, string>()
function rowIcon(markup: string) {
	let out = drawn.get(markup)
	if (out === undefined) {
		const t = document.createElement('template')
		t.innerHTML = markup.trim()
		const svg = t.content.querySelector('svg')
		if (svg) {
			svg.setAttribute('width', '14')
			svg.setAttribute('height', '14')
			svg.setAttribute('stroke-width', '1.5')
			svg.setAttribute('aria-hidden', 'true')
			svg.removeAttribute('hidden')
			svg.classList.add('ds-cmd-muted', 'shrink-0')
		}
		out = svg?.outerHTML ?? ''
		drawn.set(markup, out)
	}
	return unsafeHTML(out)
}

/**
 * @summary One box for documents, namespaces, pages and actions.
 * @slot mark - The brand mark in the dark window's title bar.
 * @fires query - The text changed (detail.value, trimmed).
 * @fires select - A row was run (detail.pick).
 * @fires open-change - It opened or closed (detail.value).
 */
export class CommandPalette extends DsElement {
	static styles = [DsElement.styles, styles]
	static properties = {
		pages: { type: Array },
		actions: { type: Array },
		namespaces: { type: Array },
		documents: { type: Array },
		searching: { type: Boolean },
		tone: {},
		heading: {},
		placeholder: {},
		open: { type: Boolean, reflect: true },
		text: { state: true },
		activeId: { state: true },
	}

	pages: PaletteLink[] = []
	actions: PaletteLink[] = []
	namespaces: PaletteNamespace[] = []
	/** The documents found for the text heard (set them after `query`). */
	documents: PaletteDocument[] = []
	/** A search for the text heard is running. */
	searching = false
	tone: 'dark' | 'light' = 'dark'
	/** The dark window's title (Vue's `title`). */
	heading = 'Conare'
	placeholder = 'Search documents, namespaces and pages'
	open = false
	private text = ''
	private activeId = ''
	private heard = ''
	private returnTo: HTMLElement | null = null
	private reveal = false

	private get q() {
		return this.text.trim()
	}
	private rows(): Row[] {
		const q = this.q
		const has = (label: string) => !q || label.toLowerCase().includes(q.toLowerCase())
		const logoOf = (namespace?: string) => this.namespaces.find((n) => n.name === namespace)?.logo ?? null
		const list: Row[] = []
		if (q) {
			list.push({ id: 'search', group: '', label: `Search documents for "${q}"`, icon: SEARCH as unknown as string, pick: { kind: 'search', query: q } })
			for (const d of this.documents) list.push({ id: `doc:${d.namespace}/${d.id}`, group: 'Documents', label: d.id, mono: true, logo: d.logo ?? logoOf(d.namespace), meta: d.namespace, text: d.text, pick: { kind: 'document', document: d } })
		}
		// With nothing typed, the five largest namespaces, so the pages stay in view.
		const namespaces = this.namespaces.filter((n) => has(n.name))
		for (const n of q ? namespaces : namespaces.slice(0, 5)) list.push({ id: `ns:${n.name}`, group: 'Namespaces', label: n.name, mono: true, logo: n.logo, meta: compact.format(n.documents), pick: { kind: 'namespace', namespace: n } })
		for (const p of this.pages.filter((p) => has(p.label))) list.push({ id: `page:${p.id ?? p.label}`, group: 'Pages', label: p.label, icon: p.icon, pick: { kind: 'page', page: p } })
		for (const a of this.actions.filter((a) => has(a.label))) list.push({ id: `act:${a.id ?? a.label}`, group: 'Actions', label: a.label, icon: a.icon, pick: { kind: 'action', action: a } })
		return list
	}

	private get dialog() {
		return this.renderRoot.querySelector('dialog')
	}
	private activeIndex(rows: Row[]) {
		return Math.max(0, rows.findIndex((r) => r.id === this.activeId))
	}
	private move(step: number) {
		const rows = this.rows()
		const n = rows.length
		if (!n) return
		this.activeId = rows[(this.activeIndex(rows) + step + n) % n]!.id
		this.reveal = true
	}
	private run(row: Row | undefined) {
		if (!row) return
		this.emit('select', { pick: row.pick })
		if (row.pick.kind !== 'search') this.setOpen(false)
	}
	private onKey = (event: KeyboardEvent) => {
		if (event.key === 'ArrowDown') { event.preventDefault(); this.move(1) }
		else if (event.key === 'ArrowUp') { event.preventDefault(); this.move(-1) }
		else if (event.key === 'Enter') {
			event.preventDefault()
			const rows = this.rows()
			this.run(rows[this.activeIndex(rows)])
		}
		// Focus stays in the box: the rows are reached by arrows, not Tab.
		else if (event.key === 'Tab') event.preventDefault()
	}
	private onInput = (event: Event) => {
		this.text = (event.target as HTMLInputElement).value
	}
	private setOpen(open: boolean) {
		if (this.open === open) return
		this.open = open
		this.emit('open-change', { value: open })
	}
	private show() {
		const d = this.dialog
		if (!d || d.open) return
		let a = document.activeElement as Element | null
		while (a?.shadowRoot?.activeElement) a = a.shadowRoot.activeElement
		this.returnTo = a instanceof HTMLElement ? a : null
		d.showModal()
		this.renderRoot.querySelector('input')?.focus()
	}
	// The dialog's own Escape (cancel) and a press on the dimmed page, which lands on the dialog element itself.
	private onCancel = (event: Event) => {
		event.preventDefault()
		this.setOpen(false)
	}
	private onDown = (event: MouseEvent) => {
		if (event.target === this.dialog) this.setOpen(false)
	}

	protected willUpdate(changed: PropertyValues) {
		if (changed.has('text') && this.q !== this.heard) {
			this.heard = this.q
			this.activeId = ''
			this.emit('query', { value: this.q })
		}
	}
	protected updated(changed: PropertyValues<this>) {
		super.updated(changed)
		if (changed.has('open')) {
			if (this.open) this.show()
			else if (changed.get('open') !== undefined) {
				if (this.dialog?.open) this.dialog.close()
				this.text = ''
				this.returnTo?.focus({ preventScroll: true })
			}
		}
		if (this.reveal) {
			this.reveal = false
			this.renderRoot.querySelector(`#ds-cmd-${this.activeIndex(this.rows())}`)?.scrollIntoView({ block: 'nearest' })
		}
	}

	render() {
		const rows = this.rows()
		const active = this.activeIndex(rows)
		const groups: Array<{ label: string, rows: Row[] }> = []
		for (const row of rows) {
			const last = groups.at(-1)
			if (last && last.label === row.group) last.rows.push(row)
			else groups.push({ label: row.group, rows: [row] })
		}
		const muted = { size: 14, strokeWidth: 1.5, class: 'ds-cmd-muted shrink-0', attrs: { 'aria-hidden': 'true' } }
		const glyph = (row: Row) => row.logo
			? html`<img src=${row.logo} alt="" width="14" height="14" class="size-3.5 shrink-0 object-contain">`
			: (row.icon as unknown) === SEARCH ? icon(Search, 'search', muted)
				: row.icon ? rowIcon(row.icon)
					: row.group === 'Documents' ? icon(Braces, 'braces', muted) : icon(Database, 'database', muted)
		return html`<dialog data-ds="command-palette" class="ds-cmd" data-tone=${this.tone} aria-label="search and jump" @cancel=${this.onCancel} @mousedown=${this.onDown}>
			${this.tone === 'dark' ? html`<div class="ds-cmd-bar" aria-hidden="true"><slot name="mark"></slot><span>${this.heading}</span><span class="ds-cmd-tag">Search</span></div>` : nothing}
			<label class="ds-cmd-box">
				${icon(Search, 'search', muted)}
				<input .value=${live(this.text)} enterkeyhint="search" role="combobox" aria-controls="ds-cmd-list" aria-autocomplete="list" aria-expanded="true" aria-activedescendant=${rows.length ? `ds-cmd-${active}` : nothing} placeholder=${this.placeholder} aria-label=${this.placeholder.toLowerCase()} autocomplete="off" spellcheck="false" @input=${this.onInput} @keydown=${this.onKey}>
			</label>
			<div id="ds-cmd-list" class="ds-cmd-list fade-y" role="listbox" aria-label="results">
				${groups.map((g) => html`<div role="group" aria-label=${g.label || nothing}>
					${g.label ? html`<p class="ds-cmd-label" aria-hidden="true">${g.label}${g.label === 'Documents' && this.searching ? html`<span>Searching</span>` : nothing}</p>` : nothing}
					${g.rows.map((row) => {
						const i = rows.indexOf(row)
						// One line, no whitespace between the parts: a row's text is its words alone, as the Vue row's is.
						return html`<div id=${`ds-cmd-${i}`} role="option" class="ds-cmd-row" ?data-doc=${!!row.text} aria-selected=${String(i === active)} ?data-active=${i === active} @mousemove=${() => { this.activeId = row.id }} @click=${() => this.run(row)}>${glyph(row)}<span class="flex min-w-0 flex-1 flex-col"><span class="flex min-w-0 items-baseline gap-2">${row.text && row.meta ? html`<span class="ds-cmd-muted shrink-0 type-code-sm">${row.meta}</span>` : nothing}<span class=${row.mono ? 'truncate type-code-sm' : 'truncate'}>${row.label}</span></span>${row.text ? html`<span class="ds-cmd-muted truncate type-meta">${row.text}</span>` : nothing}</span>${row.meta && !row.text ? html`<span class="ds-cmd-muted min-w-10 text-right text-meta tabular-nums">${row.meta}</span>` : nothing}</div>`
					})}
				</div>`)}
				${rows.length ? nothing : html`<p class="ds-cmd-muted px-3.5 py-2 type-meta">${`Nothing matches "${this.q}".`}</p>`}
			</div>
			${this.tone === 'dark' ? html`<div class="ds-cmd-foot" aria-hidden="true"><span class="ds-cmd-key">↑↓ move</span><span class="ds-cmd-key">↵ open</span><span class="ds-cmd-key">esc close</span></div>` : nothing}
		</dialog>`
	}
}

define('command-palette', CommandPalette)
