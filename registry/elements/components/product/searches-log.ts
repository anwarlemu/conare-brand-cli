import { html, nothing, type PropertyValues } from 'lit'
import { html as staticHtml } from 'lit/static-html.js'
import { DsElement, define, tag } from '@/elements/lib/element'
import { icon } from '@/elements/lib/icon'
import { enter, leave } from '@/elements/lib/transition'
import { Check, ChevronDown, Minus, Search, X } from 'lucide'
import '@/elements/components/ui/button'
import '@/elements/components/ui/table'
import '@/elements/components/product/download-mark'
import styles from 'virtual:tw'

// SearchesLog.vue as <conare-searches-log>: every search, newest first (searches/Log.vue with the Simple detail): the
// question, the agent, the outcome in Performance's words, the time and when, twelve at a time. A row opens in place
// under itself (180ms both ways on the strong ease-out, what's inside fading in and settling 4px), holding what came
// back: each passage's sentence with the part that answers in ink, its document to download, why a search went wrong
// and what to do about it. The opened row is drawn here (a custom element can't sit in a tbody); it stays while it
// leaves. Events carry Vue's payloads: `download` ({ passage }), `fix` ({ row }), `search` ({ question }).
export type SearchOutcome = 'strong' | 'weak' | 'none' | 'failed'
export interface SearchPassage { id: string, namespace: string, text: string, key: string }
export interface SearchRow { id: string, when: string, question: string, agent: string, outcome: SearchOutcome, tookMs: number, passages: SearchPassage[], why?: string, fix?: { action: string } }

const OUTCOME: Record<SearchOutcome, string> = { strong: 'Strong answer', weak: 'Weak match', none: 'Nothing found', failed: 'Failed' }
const took = (ms: number) => (ms >= 1000 ? `${(ms / 1000).toFixed(1)} s` : `${ms} ms`)
const parts = (p: SearchPassage) => {
	const at = p.text.indexOf(p.key)
	return at < 0 ? [p.text, '', ''] : [p.text.slice(0, at), p.key, p.text.slice(at + p.key.length)]
}
const ic = (node: Parameters<typeof icon>[0], name: string, size: number, stroke: number, cls: string) => icon(node, name, { size, strokeWidth: stroke, class: cls, attrs: { 'aria-hidden': 'true' } })

/**
 * @summary Every search, newest first; a row opens in place to what came back.
 * @fires download - A passage's document was pressed ({ passage }).
 * @fires fix - A search's fix was pressed ({ row }).
 * @fires search - Search it was pressed ({ question }).
 */
export class SearchesLog extends DsElement {
	static styles = [DsElement.styles, styles]
	static properties = { rows: { type: Array }, page: { type: Number }, opened: { state: true }, shown: { state: true } }

	/** The searches, newest first. */
	rows: SearchRow[] = []
	/** How many show at first, and how many each press adds. */
	page = 12
	private opened = ''
	private shown = 12
	private closing = ''

	protected willUpdate(changed: PropertyValues) {
		super.willUpdate(changed)
		// New rows (a filter): everything closes and the log starts over.
		if (changed.has('rows') || changed.has('page')) { this.opened = ''; this.closing = ''; this.shown = this.page }
		if (changed.has('opened')) {
			const was = changed.get('opened') as string | undefined
			if (was) this.closing = was
		}
	}
	protected updated(changed: PropertyValues) {
		super.updated(changed)
		// The chevron turns on a transition, so its svg stays and only data-open changes.
		for (const tr of this.renderRoot.querySelectorAll<HTMLElement>('tr[data-row]')) tr.querySelector('.ds-slog-chev')?.toggleAttribute('data-open', tr.dataset.row === this.opened)
		if (!changed.has('opened') || changed.get('opened') === undefined || changed.has('rows')) return
		const row = (id: string) => this.renderRoot.querySelector<HTMLElement>(`tr[data-opens="${id}"]`)
		const closing = this.closing
		if (this.opened) {
			const el = row(this.opened)
			if (el) void enter(el, 'ds-slog', 180)
		}
		if (closing) {
			const el = row(closing)
			if (!el) this.closing = ''
			else void leave(el, 'ds-slog', 180).then(() => { if (this.closing === closing) { this.closing = ''; this.requestUpdate() } })
		}
	}
	private toggle(id: string) {
		this.opened = this.opened === id ? '' : id
	}

	private opensRow(r: SearchRow) {
		if (this.opened !== r.id && this.closing !== r.id) return nothing
		const b = tag('button')
		return html`<tr id=${`search-${r.id}`} data-opens=${r.id} class="ds-slog-open"><td colspan="6"><div class="ds-slog-grow"><div><div class="flex flex-col gap-3 px-4 pt-3 pb-4">${r.why ? html`<p>${r.why}</p>` : nothing}${r.passages.length ? html`<ul class="flex flex-col gap-2">${r.passages.map((p) => { const [a, k, z] = parts(p); return html`<li class="flex items-center justify-between gap-6 text-fg-soft max-sm:flex-col max-sm:items-start max-sm:gap-0.5"><p class="min-w-0 flex-1">${a}<span class="font-medium text-fg">${k}</span>${z}</p><span class="flex shrink-0 items-center gap-1"><button type="button" class="ds-slog-doc type-code-sm whitespace-nowrap" aria-label=${`download ${p.id}`} @click=${() => this.emit('download', { passage: p })}>${p.id}</button>${staticHtml`<${tag('download-mark')} doc-id=${p.id} @press=${() => this.emit('download', { passage: p })}></${tag('download-mark')}>`}</span></li>` })}</ul>` : nothing}<div class="flex flex-wrap gap-2">${r.fix ? staticHtml`<${b} press @click=${() => this.emit('fix', { row: r })}>${r.fix.action}</${b}>` : nothing}${staticHtml`<${b} press @click=${() => this.emit('search', { question: r.question })}>${ic(Search, 'search', 12, 1.5, '')}Search it</${b}>`}</div></div></div></div></td></tr>`
	}

	render() {
		const rows = this.rows
		const outcome = (o: SearchOutcome) => html`<span class=${o !== 'strong' ? 'inline-flex items-center gap-1.5 text-home-red-press' : 'inline-flex items-center gap-1.5'}>${o === 'strong' ? ic(Check, 'check', 12, 2, 'shrink-0') : o === 'weak' ? ic(Minus, 'minus', 12, 2, 'shrink-0') : ic(X, 'x', 12, 2, 'shrink-0')}${OUTCOME[o]}</span>`
		return html`<div data-ds="searches-log" class="overflow-hidden border border-edge bg-surface">${staticHtml`<${tag('table')}><table><thead class="max-sm:sr-only"><tr><th scope="col">Question</th><th scope="col" class="w-40 max-lg:hidden">Agent</th><th scope="col" class="w-44 max-md:hidden">Outcome</th><th scope="col" class="w-20 text-right max-md:hidden">Time</th><th scope="col" class="w-24 text-right max-lg:hidden">When</th><th scope="col" class="w-8"><span class="sr-only">Open</span></th></tr></thead><tbody>${rows.slice(0, this.shown).map((r) => html`<tr data-row=${r.id} class="is-link" @click=${() => this.toggle(r.id)}><td class="max-w-0 max-sm:w-full"><button type="button" class=${['block w-full truncate text-left focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-edge-focus max-sm:whitespace-normal', this.opened === r.id ? 'whitespace-normal' : ''].join(' ')} aria-expanded=${String(this.opened === r.id)} aria-controls=${`search-${r.id}`} @click=${(e: Event) => { e.stopPropagation(); this.toggle(r.id) }}>${r.question}</button><span class="block truncate type-meta text-fg-muted lg:hidden">${`${r.agent}, ${r.when}`}</span></td><td class="max-w-0 truncate max-lg:hidden">${r.agent}</td><td class="whitespace-nowrap max-md:hidden">${outcome(r.outcome)}</td><td class="text-right tabular-nums max-md:hidden">${took(r.tookMs)}</td><td class="text-right text-fg-muted max-lg:hidden">${r.when}</td><td class="text-right">${ic(ChevronDown, 'chevron-down', 14, 1.5, 'ds-slog-chev inline text-fg-muted')}</td></tr>${this.opensRow(r)}`)}</tbody></table></${tag('table')}>`}</div>${this.shown < rows.length ? html`<button data-ds="searches-log" type="button" class="ds-slog-more self-start" @click=${() => { this.shown += this.page }}>${`Show ${Math.min(this.page, rows.length - this.shown)} more`}</button>` : nothing}`
	}
}

define('searches-log', SearchesLog)
