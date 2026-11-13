import { html, nothing } from 'lit'
import { html as staticHtml } from 'lit/static-html.js'
import { DsElement, define, tag } from '@/elements/lib/element'
import { icon } from '@/elements/lib/icon'
import { Check, Search, X } from 'lucide'
import '@/elements/components/product/accuracy-thumb'
import '@/elements/components/ui/button'
import styles from 'virtual:tw'

// AccuracyDetail.vue as <conare-accuracy-detail>: One question of an accuracy test, opened (accuracy/Detail.vue): what came back, its page drawn small, the document in
// mono and the page number, the words with the part that answers in ink, and whether it reached the right page; the
// right one carries a 2px red line on top. `both` sets the team's current search and Conare side by side. Its foot says
// what to fix with the fix as a button, then Search it and Remove question: the app listens for `fix`, `search` and `remove` ({{ row }}).
export interface AccuracyHit { id: string, number: number, count: number, top: number, text: string, key: string, ok: boolean }
export interface AccuracyRow { id: string, question: string, namespace: string, conare: AccuracyHit, current: AccuracyHit, fix?: { why: string, action: string } }
export interface AccuracyView {
	state: 'running' | 'done'
	/** When it ran, as the page says it ("3 hours ago"), who ran it, how long it took and what it cost. */
	ran: string
	by: string
	seconds: number
	cost: number
	questions: number
	done: number
	right: number
	current_right: number
	current_name: string
	rows: AccuracyRow[]
	queued: Array<{ id: string, question: string, namespace: string }>
}

const split = (h: AccuracyHit) => {
	const at = h.text.indexOf(h.key)
	return at < 0 ? [h.text, '', ''] : [h.text.slice(0, at), h.key, h.text.slice(at + h.key.length)]
}

/**
 * @summary One question of an accuracy test, opened: what came back and whether it was the right page.
 * @fires fix - The fix was pressed ({ row }).
 * @fires search - Search it was pressed ({ row }).
 * @fires remove - Remove question was pressed ({ row }).
 */
export class AccuracyDetail extends DsElement {
	static styles = [DsElement.styles, styles]
	static properties = { row: { type: Object }, both: { type: Boolean }, name: {} }

	row?: AccuracyRow
	/** The team's current search and Conare side by side. */
	both = false
	/** The current search's name. */
	name?: string

	render() {
		const row = this.row
		if (!row) return nothing
		const answers = this.both ? [{ label: this.name ?? 'Your current search', hit: row.current }, { label: 'Conare', hit: row.conare }] : [{ label: 'What came back', hit: row.conare }]
		const b = tag('button')
		return html`<div data-ds="accuracy-detail" class="flex flex-col bg-surface-subtle"><div class=${this.both ? 'grid md:grid-cols-2' : 'grid'}>${answers.map((a, i) => html`<div class=${i > 0 ? 'ds-answer border-edge max-md:border-t md:border-l' : 'ds-answer'} ?data-won=${a.hit.ok}><p class="type-ui-strong">${a.label}</p><div class="flex items-center gap-3">${staticHtml`<${tag('accuracy-thumb')} .number=${a.hit.number} .top=${a.hit.top}></${tag('accuracy-thumb')}>`}<p class="min-w-0"><span class="block truncate type-code-sm">${a.hit.id}</span><span class="block type-meta text-fg-muted">${`Page ${a.hit.number} of ${a.hit.count}`}</span></p></div><p class="text-body leading-5.5 text-pretty text-fg-muted">${split(a.hit)[0]}<span class="font-medium text-fg">${split(a.hit)[1]}</span>${split(a.hit)[2]}</p><span class="ds-verdict" ?data-ok=${a.hit.ok}>${a.hit.ok ? icon(Check, 'check', { size: 12, strokeWidth: 2, attrs: { 'aria-hidden': 'true' } }) : icon(X, 'x', { size: 12, strokeWidth: 2, attrs: { 'aria-hidden': 'true' } })}${a.hit.ok ? 'Right page' : 'Wrong page'}</span></div>`)}</div><div class="flex flex-wrap items-center justify-end gap-2 px-4 pb-3">${row.fix ? html`<p class="min-w-0 flex-1 max-sm:basis-full">${row.fix.why}</p>${staticHtml`<${b} press @click=${() => this.emit('fix', { row })}>${row.fix.action}</${b}>`}` : nothing}${staticHtml`<${b} variant="ghost" press @click=${() => this.emit('search', { row })}>${icon(Search, 'search', { size: 12, strokeWidth: 1.5, attrs: { 'aria-hidden': 'true' } })}Search it</${b}><${b} variant="ghost" press @click=${() => this.emit('remove', { row })}>Remove question</${b}>`}</div></div>`
	}
}

define('accuracy-detail', AccuracyDetail)
