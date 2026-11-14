import { html, nothing, type PropertyValues } from 'lit'
import { html as staticHtml } from 'lit/static-html.js'
import { DsElement, define, tag } from '@/elements/lib/element'
import { icon } from '@/elements/lib/icon'
import { enter, leave } from '@/elements/lib/transition'
import { Check, ChevronDown, X } from 'lucide'
import type { AccuracyRow, AccuracyView } from '@/elements/components/product/accuracy-detail'
import '@/elements/components/product/accuracy-detail'
import '@/elements/components/ui/button'
import '@/elements/components/ui/table'
import '@/elements/components/ui/count'
import styles from 'virtual:tw'

// AccuracyVerdict.vue as <conare-accuracy-verdict>: Accuracy, "Verdict first" (accuracy/Verdict.vue): a count read in five seconds in the double rule, beside a field of
// a hundred squares, one a question, ink where the right page came back and red where it did not; pointing at one reads
// its question, a click opens it in the list. Then only what needs a person, each with its fix, then every question, ten
// at a time, each opening to what came back. The squares land once, row by row; reduced motion shows them at once.
// The opened question is a table row drawn here (AccuracyOpens' table form). A detail's `fix`, `search` and `remove`
// pass on out; the list's fix buttons fire `fix` ({ row }) too.
const ic = (node: Parameters<typeof icon>[0], name: string, size = 12, stroke = 2, cls?: string) => icon(node, name, { size, strokeWidth: stroke, class: cls, attrs: { 'aria-hidden': 'true' } })

/**
 * @summary Accuracy, verdict first: the count, a field of squares, what to look at, then every question.
 * @fires fix - A fix was pressed ({ row }).
 */
export class AccuracyVerdict extends DsElement {
	static styles = [DsElement.styles, styles]
	static properties = { view: { type: Object }, pointed: { state: true }, opened: { state: true }, shown: { state: true } }

	view?: AccuracyView
	private pointed: AccuracyRow | null = null
	private opened = ''
	private shown = 10

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

	private rowOf(event: Event) {
		return this.view?.rows.find((r) => r.id === (event.target as HTMLElement).dataset.id)
	}
	private open(row: AccuracyRow) {
		const rows = this.view?.rows ?? []
		this.opened = this.opened === row.id ? '' : row.id
		if (!rows.slice(0, this.shown).some((r) => r.id === row.id)) this.shown = rows.length
		void this.updateComplete.then(() => this.renderRoot.querySelector(`#eval-${row.id}`)?.scrollIntoView({ block: 'center', behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth' }))
	}

	render() {
		const view = this.view
		if (!view) return nothing
		const rows = view.rows
		const wrong = rows.filter((r) => !r.conare.ok)
		const cells = [...rows.map((r) => ({ id: r.id, wrong: !r.conare.ok, queued: false })), ...view.queued.map((q) => ({ id: q.id, wrong: false, queued: true }))]
		const b = tag('button')
		return html`<section data-ds="accuracy-verdict" class="m-1.25 grid grid-cols-[minmax(0,1fr)_240px] gap-8 border border-edge p-6 outline outline-offset-4 outline-edge max-md:grid-cols-1 max-md:p-4" aria-labelledby="eval-score"><div class="flex min-w-0 flex-col gap-1"><p id="eval-score" class="font-heading text-display leading-14 tracking-display tabular-nums max-md:text-heading-1 max-md:leading-10">${staticHtml`<${tag('count')} .value=${view.right}></${tag('count')}>`}${` of ${view.questions}`}</p><p class="text-input">${view.state === 'running' ? `Running. ${view.done} of ${view.questions} done.` : 'questions reached the right page.'}</p><p class="mt-auto type-meta text-fg-muted">${this.pointed ? this.pointed.question : `Run ${view.ran} by ${view.by}, ${view.seconds} s, $${view.cost.toFixed(2)}`}</p></div><div class="ds-evalfield max-md:max-w-50" role="img" aria-label=${`${view.right} of ${view.questions} questions reached the right page`} @pointermove=${(e: Event) => { this.pointed = this.rowOf(e) ?? null }} @pointerleave=${() => { this.pointed = null }} @click=${(e: Event) => { const r = this.rowOf(e); if (r) this.open(r) }}>${cells.map((c, i) => html`<span data-id=${c.id} ?data-wrong=${c.wrong} ?data-queued=${c.queued} style="--i: ${Math.floor(i / 10)}"></span>`)}</div></section>${wrong.length ? html`<section data-ds="accuracy-verdict" class="flex flex-col gap-2" aria-labelledby="eval-look"><h2 id="eval-look" class="type-ui-strong">${wrong.length === 1 ? '1 to look at' : `${wrong.length} to look at`}</h2><ul class="border border-edge bg-surface [&>*+*]:border-t [&>*+*]:border-edge">${wrong.map((r) => html`<li class="flex min-h-10 items-center justify-between gap-4 px-4 py-1.5 max-sm:flex-col max-sm:items-start max-sm:gap-2 max-sm:py-3"><span class="min-w-0"><span class="block">${r.question}</span><span class="block type-meta text-fg-muted"><span class="font-code whitespace-nowrap">${r.namespace}</span>${`. ${r.fix?.why ?? 'The wrong page came back first.'}`}</span></span>${r.fix ? staticHtml`<${b} press @click=${() => this.emit('fix', { row: r })}>${r.fix.action}</${b}>` : nothing}</li>`)}</ul></section>` : nothing}<section data-ds="accuracy-verdict" class="flex flex-col gap-2" aria-labelledby="eval-all"><h2 id="eval-all" class="type-ui-strong">Every question</h2><div class="overflow-hidden border border-edge bg-surface">${staticHtml`<${tag('table')}><table><thead class="max-sm:sr-only"><tr><th scope="col">Question</th><th scope="col" class="w-40 max-lg:hidden">Namespace</th><th scope="col" class="w-28 max-sm:hidden">Result</th><th scope="col" class="w-8"><span class="sr-only">Open</span></th></tr></thead><tbody>${rows.slice(0, this.shown).map((r) => html`<tr id=${`eval-${r.id}`} data-row=${r.id} class=${this.opened === r.id ? 'is-link ds-row-open' : 'is-link'} @click=${() => this.open(r)}><td class="max-w-0 max-sm:w-full"><button type="button" class=${['block w-full cursor-pointer truncate text-left focus-visible:outline-2 focus-visible:outline-edge-accent max-sm:whitespace-normal', this.opened === r.id ? 'whitespace-normal' : ''].join(' ')} aria-expanded=${String(this.opened === r.id)} @click=${(e: Event) => { e.stopPropagation(); this.open(r) }}>${r.question}</button><span class="ds-verdict mt-0.5 sm:hidden" ?data-ok=${r.conare.ok}>${r.conare.ok ? `Page ${r.conare.number}` : 'Wrong page'}</span></td><td class="type-code-sm max-lg:hidden">${r.namespace}</td><td class="max-sm:hidden"><span class="ds-verdict" ?data-ok=${r.conare.ok}>${r.conare.ok ? ic(Check, 'check') : ic(X, 'x')}${r.conare.ok ? `Page ${r.conare.number}` : 'Wrong page'}</span></td><td class="text-right">${icon(ChevronDown, 'chevron-down', { size: 14, strokeWidth: 1.5, class: 'ds-chev inline text-fg-muted', attrs: { 'aria-hidden': 'true' } })}</td></tr>${this.opensRow(r, 4)}`)}</tbody></table></${tag('table')}>`}</div>${this.shown < rows.length ? html`<span class="self-start inline-flex">${staticHtml`<${b} variant="ghost" press @click=${() => { this.shown += 10 }}>Show 10 more</${b}>`}</span>` : nothing}</section>`
	}
}

define('accuracy-verdict', AccuracyVerdict)
