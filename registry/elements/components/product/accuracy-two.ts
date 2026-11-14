import { html, nothing, type PropertyValues } from 'lit'
import { html as staticHtml } from 'lit/static-html.js'
import { DsElement, define, tag } from '@/elements/lib/element'
import { icon } from '@/elements/lib/icon'
import { Check, ChevronDown, X } from 'lucide'
import type { AccuracyView } from '@/elements/components/product/accuracy-detail'
import '@/elements/components/product/accuracy-detail'
import '@/elements/components/product/accuracy-opens'
import '@/elements/components/ui/button'
import '@/elements/components/ui/tabs'
import '@/elements/components/ui/count'
import styles from 'virtual:tw'

// AccuracyTwo.vue as <conare-accuracy-two>: Accuracy, "Two searches" (accuracy/Two.vue): Conare against the search the team uses today, the count of each over a
// 6px track (Conare's red) in the double rule, then only the questions where they part, the first one open. Conare's
// misses stay in. Each row marks both searches, a check for the right page and a red cross for the wrong one.
// A detail's `fix`, `search` and `remove` pass on out.
type Show = 'differ' | 'all' | 'missed'
const ic = (node: Parameters<typeof icon>[0], name: string, size = 12, stroke = 2, cls?: string) => icon(node, name, { size, strokeWidth: stroke, class: cls, attrs: { 'aria-hidden': 'true' } })

/**
 * @summary Accuracy, two searches: Conare against the team's current search, question by question.
 */
export class AccuracyTwo extends DsElement {
	static styles = [DsElement.styles, styles]
	static properties = { view: { type: Object }, show: { state: true }, opened: { state: true }, shown: { state: true } }

	view?: AccuracyView
	private show: Show = 'differ'
	private opened = ''
	private shown = 10
	private listKey = ''

	private get lists() {
		const rows = this.view?.rows ?? []
		return { rows, differ: rows.filter((r) => r.conare.ok !== r.current.ok), missed: rows.filter((r) => !r.conare.ok && !r.current.ok) }
	}
	private get list() {
		const l = this.lists
		return this.show === 'differ' ? l.differ : this.show === 'missed' ? l.missed : l.rows
	}

	protected willUpdate(changed: PropertyValues) {
		super.willUpdate(changed)
		// Vue's watch on the list (immediate): the first row opens when the open one leaves it.
		const list = this.list
		const key = list.map((r) => r.id).join(' ')
		if (key !== this.listKey) {
			this.listKey = key
			if (!list.some((r) => r.id === this.opened)) this.opened = list[0]?.id ?? ''
		}
		if (changed.has('show') && changed.get('show') !== undefined) this.shown = 10
	}

	protected updated(changed: PropertyValues) {
		super.updated(changed)
		for (const li of this.renderRoot.querySelectorAll<HTMLElement>('li[data-row]')) li.querySelector('.ds-chev')?.toggleAttribute('data-open', li.dataset.row === this.opened)
	}

	render() {
		const view = this.view
		if (!view) return nothing
		const { rows, differ, missed } = this.lists
		const list = this.list
		const filters = [
			{ value: 'differ', label: `Where they differ, ${differ.length}` },
			{ value: 'all', label: `All, ${rows.length}` },
			{ value: 'missed', label: `Both missed, ${missed.length}` },
		]
		const gain = view.right - view.current_right
		const lost = rows.filter((r) => !r.conare.ok && r.current.ok).length
		const share = (n: number) => `transform: scaleX(${view.questions ? n / view.questions : 0})`
		const b = tag('button')
		return html`<section data-ds="accuracy-two" class="m-1.25 grid grid-cols-2 gap-x-8 gap-y-6 border border-edge p-6 outline outline-offset-4 outline-edge max-md:gap-4 max-md:p-4" aria-label="your current search and Conare">${[{ name: view.current_name, n: view.current_right, red: false }, { name: 'Conare', n: view.right, red: true }].map((side) => html`<div class="min-w-0"><p class="type-meta text-fg-muted">${side.name}</p><p class="font-heading text-display leading-14 tracking-display tabular-nums max-md:text-heading-1 max-md:leading-10">${staticHtml`<${tag('count')} .value=${side.n}></${tag('count')}>`}${` of ${view.questions}`}</p><div class="ds-evaltrack" ?data-red=${side.red} aria-hidden="true"><span style=${share(side.n)}></span></div></div>`)}<p class="col-span-full text-body">${'Conare reached the right page on ' + gain + ' more questions' + (lost ? `, and missed ${lost} your current search found` : '') + '.'}</p></section><section data-ds="accuracy-two" class="flex flex-col gap-2" aria-label="question by question"><div class="flex self-start">${staticHtml`<${tag('tabs')} .value=${this.show} .options=${filters} label="which questions" @change=${(e: Event) => { this.show = (e.currentTarget as HTMLElement & { value: Show }).value }}></${tag('tabs')}>`}</div><p class="ds-evalheads max-sm:hidden" aria-hidden="true"><span>Yours</span><span>Conare</span></p><ul class="border border-edge bg-surface [&>*+*]:border-t [&>*+*]:border-edge">${list.slice(0, this.shown).map((r) => html`<li data-row=${r.id}><button type="button" class="ds-evalrow" aria-expanded=${String(this.opened === r.id)} @click=${() => { this.opened = this.opened === r.id ? '' : r.id }}><span class=${['min-w-0 flex-1 truncate max-sm:whitespace-normal', this.opened === r.id ? 'whitespace-normal' : ''].join(' ')}>${r.question}</span><span class="ds-evalmarks" aria-hidden="true"><span ?data-ok=${r.current.ok}><span class="sm:hidden">Yours</span>${r.current.ok ? icon(Check, 'check', { size: 12, strokeWidth: 2 }) : icon(X, 'x', { size: 12, strokeWidth: 2 })}</span><span ?data-ok=${r.conare.ok}><span class="sm:hidden">Conare</span>${r.conare.ok ? icon(Check, 'check', { size: 12, strokeWidth: 2 }) : icon(X, 'x', { size: 12, strokeWidth: 2 })}</span></span><span class="sr-only">${`${view.current_name}: ${r.current.ok ? 'right page' : 'wrong page'}. Conare: ${r.conare.ok ? 'right page' : 'wrong page'}.`}</span>${ic(ChevronDown, 'chevron-down', 14, 1.5, 'ds-chev shrink-0 text-fg-muted')}</button>${staticHtml`<${tag('accuracy-opens')} ?open=${this.opened === r.id}><${tag('accuracy-detail')} .row=${r} both .name=${view.current_name}></${tag('accuracy-detail')}></${tag('accuracy-opens')}>`}</li>`)}</ul>${this.shown < list.length ? html`<span class="self-start inline-flex">${staticHtml`<${b} variant="ghost" press @click=${() => { this.shown += 10 }}>Show 10 more</${b}>`}</span>` : nothing}</section>`
	}
}

define('accuracy-two', AccuracyTwo)
