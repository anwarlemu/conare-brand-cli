import { html, nothing, type PropertyValues } from 'lit'
import { html as staticHtml } from 'lit/static-html.js'
import { DsElement, define, tag } from '@/elements/lib/element'
import { icon } from '@/elements/lib/icon'
import { enter, leave } from '@/elements/lib/transition'
import { Check, ChevronDown, Plus, X } from 'lucide'
import type { AccuracyRow, AccuracyView } from '@/elements/components/product/accuracy-detail'
import '@/elements/components/product/accuracy-detail'
import '@/elements/components/ui/button'
import '@/elements/components/ui/dot-matrix'
import '@/elements/components/ui/table'
import '@/elements/components/ui/count'
import styles from 'virtual:tw'

// AccuracySheet.vue as <conare-accuracy-sheet>: Accuracy, "Question sheet" (accuracy/Sheet.vue): the questions are the page, as teams keep them in a spreadsheet.
// Right and wrong counted over a 2px line that fills as the run lands; a numbered sheet whose first row takes a new
// question (or a pasted list, one a line), questions still waiting with the dot matrix, each answered row opening to
// what came back. Twelve at a time. `add` carries the new questions ({{ questions }}).
// The opened question is a table row drawn here (AccuracyOpens' table form). A detail's `fix`, `search` and `remove`
// pass on out.
const ic = (node: Parameters<typeof icon>[0], name: string, size = 12, stroke = 2, cls?: string) => icon(node, name, { size, strokeWidth: stroke, class: cls, attrs: { 'aria-hidden': 'true' } })

/**
 * @summary Accuracy, question sheet: the questions are the page, filling in as the run lands.
 * @fires add - Questions were added ({ questions }).
 */
export class AccuracySheet extends DsElement {
	static styles = [DsElement.styles, styles]
	static properties = { view: { type: Object }, text: { state: true }, opened: { state: true }, shown: { state: true } }

	view?: AccuracyView
	private text = ''
	private opened = ''
	private shown = 12
	// The table's opened row (AccuracyOpens with `colspan`): it stays while it leaves.
	private closing = ''
	protected willUpdate(changed: PropertyValues) {
		super.willUpdate(changed)
		if (changed.has('opened')) {
			const was = changed.get('opened') as string | undefined
			if (was) this.closing = was
		}
	}
	protected updated(changed: PropertyValues) {
		super.updated(changed)
		// The chevron turns on a transition, so its svg stays and only data-open changes.
		for (const tr of this.renderRoot.querySelectorAll<HTMLElement>('tr[data-row]')) tr.querySelector('.ds-chev')?.toggleAttribute('data-open', tr.dataset.row === this.opened)
		if (!changed.has('opened') || changed.get('opened') === undefined) return
		const row = (id: string) => this.renderRoot.querySelector<HTMLElement>(`tr[data-opens="${id}"]`)
		const closing = this.closing
		if (this.opened) {
			const el = row(this.opened)
			if (el) void enter(el, 'ds-opens', 180)
		}
		if (closing) {
			const el = row(closing)
			if (!el) this.closing = ''
			else void leave(el, 'ds-opens', 180).then(() => { if (this.closing === closing) { this.closing = ''; this.requestUpdate() } })
		}
	}
	private opensRow(r: AccuracyRow, cols: number, both = false, name?: string) {
		if (this.opened !== r.id && this.closing !== r.id) return nothing
		return html`<tr data-ds="accuracy-opens" class="ds-opens-row" data-opens=${r.id}><td colspan=${cols}><div class="ds-opens-grow"><div>${staticHtml`<${tag('accuracy-detail')} .row=${r} ?both=${both} .name=${name}></${tag('accuracy-detail')}>`}</div></div></td></tr>`
	}


	private submit(value = this.text) {
		const questions = value.split('\n').map((l) => l.trim()).filter(Boolean)
		if (!questions.length) return
		this.emit('add', { questions })
		this.text = ''
	}
	private paste = (event: ClipboardEvent) => {
		const pasted = event.clipboardData?.getData('text') ?? ''
		if (!pasted.includes('\n')) return
		event.preventDefault()
		this.text = pasted
		this.submit(pasted)
	}
	private toggle(id: string) {
		this.opened = this.opened === id ? '' : id
	}

	render() {
		const view = this.view
		if (!view) return nothing
		const rows = [...view.rows.map((r) => ({ id: r.id, question: r.question, namespace: r.namespace, row: r as AccuracyRow | null })), ...view.queued.map((q) => ({ ...q, row: null }))]
		const wrong = view.done - view.right
		const b = tag('button')
		return html`<section data-ds="accuracy-sheet" class="relative flex flex-wrap items-baseline gap-x-6 gap-y-1 pb-3" aria-live="polite"><p><span class="font-heading text-heading-2 tabular-nums">${staticHtml`<${tag('count')} .value=${view.right}></${tag('count')}>`}</span> right</p><p><span class=${wrong > 0 ? 'font-heading text-heading-2 tabular-nums text-fg-accent' : 'font-heading text-heading-2 tabular-nums'}>${staticHtml`<${tag('count')} .value=${wrong}></${tag('count')}>`}</span> wrong</p><p class="ml-auto type-meta text-fg-muted">${view.state === 'running' ? `${view.done} of ${view.questions} done` : `${view.questions} questions, run ${view.ran}`}</p><span class="ds-sheetline" aria-hidden="true"><span style=${`transform: scaleX(${view.questions ? view.done / view.questions : 0})`}></span></span></section><div data-ds="accuracy-sheet" class="overflow-hidden border border-edge bg-surface">${staticHtml`<${tag('table')}><table><thead><tr><th scope="col" class="w-10 text-right max-sm:hidden"><span class="sr-only">Number</span></th><th scope="col">Question</th><th scope="col" class="w-40 max-lg:hidden">Namespace</th><th scope="col" class="w-32 max-sm:hidden">Result</th><th scope="col" class="w-8"><span class="sr-only">Open</span></th></tr></thead><tbody><tr><td class="text-right text-fg-muted max-sm:hidden">${ic(Plus, 'plus', 12, 1.5, 'inline')}</td><td colspan="4" class="!p-0"><form @submit=${(e: Event) => { e.preventDefault(); this.submit() }}><label class="sr-only" for="eval-add">add a question</label><input id="eval-add" .value=${this.text} @input=${(e: Event) => { this.text = (e.target as HTMLInputElement).value }} class="h-10 w-full bg-transparent px-3 text-ui placeholder:text-fg-muted focus:outline-2 focus:-outline-offset-2 focus:outline-edge-accent max-md:text-input" autocomplete="off" placeholder="Add a question, or paste a list" @paste=${this.paste}></form></td></tr>${rows.slice(0, this.shown).map((r, i) => html`<tr data-row=${r.id} class=${[r.row ? 'is-link' : '', this.opened === r.id ? 'ds-row-open' : ''].join(' ').trim()} @click=${() => { if (r.row) this.toggle(r.id) }}><td class="text-right text-fg-muted tabular-nums max-sm:hidden">${i + 1}</td><td class="max-w-0 max-sm:w-full">${r.row ? html`<button type="button" class=${['block w-full cursor-pointer truncate text-left focus-visible:outline-2 focus-visible:outline-edge-accent max-sm:whitespace-normal', this.opened === r.id ? 'whitespace-normal' : ''].join(' ')} aria-expanded=${String(this.opened === r.id)} @click=${(e: Event) => { e.stopPropagation(); this.toggle(r.id) }}>${r.question}</button><span class="ds-verdict mt-0.5 sm:hidden" ?data-ok=${r.row.conare.ok}>${r.row.conare.ok ? `Page ${r.row.conare.number}` : 'Wrong page'}</span>` : html`<span class="block truncate max-sm:whitespace-normal">${r.question}</span>`}</td><td class="type-code-sm max-lg:hidden">${r.namespace}</td><td class="max-sm:hidden">${!r.row ? html`<span class="ds-verdict !text-fg-muted">${staticHtml`<${tag('dot-matrix')}></${tag('dot-matrix')}>`}Waiting</span>` : html`<span class="ds-verdict" ?data-ok=${r.row.conare.ok}>${r.row.conare.ok ? ic(Check, 'check') : ic(X, 'x')}${r.row.conare.ok ? `Page ${r.row.conare.number}` : 'Wrong page'}</span>`}</td><td class="text-right">${r.row ? ic(ChevronDown, 'chevron-down', 14, 1.5, 'ds-chev inline text-fg-muted') : nothing}</td></tr>${r.row ? this.opensRow(r.row, 5) : nothing}`)}</tbody></table></${tag('table')}>`}</div>${this.shown < rows.length ? staticHtml`<${b} .rootName=${'accuracy-sheet'} variant="ghost" press class="self-start" @click=${() => { this.shown += 12 }}>Show 12 more</${b}>` : nothing}`
	}
}

define('accuracy-sheet', AccuracySheet)
