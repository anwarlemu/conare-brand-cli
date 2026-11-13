import { html, nothing, type PropertyValues } from 'lit'
import { html as staticHtml } from 'lit/static-html.js'
import { repeat } from 'lit/directives/repeat.js'
import { DsElement, define, tag } from '@/elements/lib/element'
import { icon } from '@/elements/lib/icon'
import { enter, leave } from '@/elements/lib/transition'
import { Check, Search, X } from 'lucide'
import { GlideMarkController } from '@/elements/controllers/glide-mark'
import type { AccuracyRow, AccuracyView } from '@/elements/components/product/accuracy-detail'
import '@/elements/components/product/accuracy-thumb'
import '@/elements/components/ui/button'
import '@/elements/components/ui/dot-matrix'
import '@/elements/components/ui/count'
import '@/elements/components/ui/pixel-button'
import '@/elements/components/visuals/cell-burst'
import '@/elements/components/visuals/grain'
import styles from 'virtual:tw'

// AccuracyAtWork.vue as <conare-accuracy-at-work>: Accuracy, "Test at work" (accuracy/AtWork.vue, the version that ships): the website's benchmarks on the team's own
// questions. Four tiles in the double rule carry the results and filter the list on a click (a 2px red line runs across
// the picked one). Beside the list, a dark window holds a hundred squares, one a question, red where Conare reached the
// right page and hollow where it missed. Pointing at a question, in the list or on the field, glides a block to its row
// and a bracket to its square, and the window shows what each search handed back. The block follows the pointer at
// once; the window waits 80ms for it to rest, so a pointer crossing to the window's buttons changes nothing.
// The window's fix, Search it and Remove question fire `fix`, `search` and `remove` ({ row }).
type Show = 'all' | 'current' | 'differ' | 'look'
// The field, twenty squares to a row, with a crosshair and a bracket on the question on show.
const COLS = 20
const pitch = (n: number) => `calc(${n} * (100cqw + 4px) / ${COLS})`
const half = `(100cqw + 4px) / ${COLS * 2} - 2px`
const split = (text: string, key: string) => {
	const i = text.indexOf(key)
	return i < 0 ? [text, '', ''] : [text.slice(0, i), key, text.slice(i + key.length)]
}
const mark = (ok: boolean) => (ok ? icon(Check, 'check', { size: 12, strokeWidth: 2 }) : icon(X, 'x', { size: 12, strokeWidth: 2 }))

/**
 * @summary Accuracy, test at work: the tiles, the list and the window of squares.
 * @fires fix - The window's fix was pressed ({ row }).
 * @fires search - Search it was pressed ({ row }).
 * @fires remove - Remove question was pressed ({ row }).
 */
export class AccuracyAtWork extends DsElement {
	static styles = [DsElement.styles, styles]
	static properties = { view: { type: Object }, show: { state: true }, pickedId: { state: true }, shown: { state: true } }

	view?: AccuracyView
	private show: Show = 'all'
	private pickedId = ''
	private shown = 12
	private resting: ReturnType<typeof setTimeout> | undefined
	private settled = ''
	// The window's body swaps on a crossfade (Vue's <Transition name="ds-winswap">): the one leaving stays until done.
	private swaps: Array<{ key: string, row: AccuracyRow, running: boolean }> = []
	private glide = new GlideMarkController(this, () => this.renderRoot.querySelector<HTMLElement>('[data-list]'), () => {
		const i = this.list.slice(0, this.shown).findIndex((r) => r.id === this.picked?.id)
		return i < 0 ? null : i
	})

	private get rows() {
		return this.view?.rows ?? []
	}
	private get lists(): Record<Show, AccuracyRow[]> {
		const rows = this.rows
		return { all: rows, current: rows.filter((r) => !r.current.ok), differ: rows.filter((r) => r.conare.ok !== r.current.ok), look: rows.filter((r) => !r.conare.ok) }
	}
	private get list() {
		return this.lists[this.show]
	}
	private get running() {
		return this.view?.state === 'running'
	}
	private get picked(): AccuracyRow | null {
		const rows = this.rows
		return (this.running ? rows.at(-1) : rows.find((r) => r.id === this.pickedId)) ?? this.list[0] ?? rows[0] ?? null
	}
	private pick(row: AccuracyRow) {
		this.pickedId = row.id
	}

	private onRow(row: AccuracyRow, i: number, event: PointerEvent) {
		if (event.pointerType !== 'mouse') return
		this.glide.point(i)
		clearTimeout(this.resting)
		// ds-latency: the window waits for the pointer to rest on a row; the block under it moved at once.
		this.resting = setTimeout(() => this.pick(row), 80)
	}
	private offList = () => {
		clearTimeout(this.resting)
		this.glide.leave()
	}
	private rowAt(event: Event) {
		return this.rows.find((r) => r.id === (event.target as HTMLElement).dataset.id)
	}
	private pointField = (event: PointerEvent) => {
		const row = this.rowAt(event)
		if (row && event.pointerType === 'mouse' && this.list.some((r) => r.id === row.id)) this.pick(row)
	}
	private clickField = async (event: MouseEvent) => {
		const row = this.rowAt(event)
		if (!row) return
		if (!this.list.some((r) => r.id === row.id)) {
			this.show = 'all'
			await this.updateComplete
		}
		this.pick(row)
		const i = this.list.findIndex((r) => r.id === row.id)
		if (i >= this.shown) this.shown = i + 1
	}
	// On a narrow page the window sits above the list, so a tap takes you to it.
	private tap(row: AccuracyRow) {
		this.pick(row)
		if (matchMedia('(max-width: 1023px)').matches) this.renderRoot.querySelector('.ds-testpanel')?.scrollIntoView({ block: 'start', behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth' })
	}

	protected willUpdate(changed: PropertyValues) {
		super.willUpdate(changed)
		// Vue's watch on the filter: back to its first row and twelve shown.
		if (changed.has('show') && changed.get('show') !== undefined) {
			this.pickedId = this.list[0]?.id ?? ''
			this.shown = 12
		}
		const p = this.picked
		const key = p ? (this.running ? 'run' : p.id) : ''
		const last = this.swaps.at(-1)
		if (!p) this.swaps = []
		else if (!last) this.swaps = [{ key, row: p, running: this.running }]
		else if (last.key !== key) this.swaps = [...this.swaps, { key, row: p, running: this.running }]
		else this.swaps = [...this.swaps.slice(0, -1), { key, row: p, running: this.running }]
	}

	protected updated(changed: PropertyValues) {
		super.updated(changed)
		// Vue's watch on the picked row, the filter, how many show and the rows: the block settles where it rests.
		const key = [this.picked?.id, this.show, this.shown, this.rows.length].join('|')
		if (key !== this.settled) {
			this.settled = key
			void this.updateComplete.then(() => this.glide.settle())
		}
		const nodes = [...this.renderRoot.querySelectorAll<HTMLElement>('.ds-testswap[data-key]')]
		const live = this.swaps.at(-1)?.key
		for (const n of nodes) {
			if (n.dataset.state) continue
			if (n.dataset.key === live) {
				n.dataset.state = 'in'
				if (this.swaps.length > 1) void enter(n, 'ds-winswap')
			}
		}
		for (const s of this.swaps.slice(0, -1)) {
			const n = nodes.find((x) => x.dataset.key === s.key)
			if (!n || n.dataset.state === 'out') continue
			n.dataset.state = 'out'
			void leave(n, 'ds-winswap').then(() => {
				this.swaps = this.swaps.filter((x) => x !== s)
				this.requestUpdate()
			})
		}
	}

	disconnectedCallback() {
		super.disconnectedCallback()
		clearTimeout(this.resting)
	}

	private renderSwap(s: { key: string, row: AccuracyRow, running: boolean }) {
		const view = this.view!
		const p = s.row
		const answers = [{ id: 'current', label: view.current_name, hit: p.current }, { id: 'conare', label: 'Conare', hit: p.conare }]
		return html`<div class="ds-testswap" data-key=${s.key}><p class="bg-code-raised px-3 py-2 text-ui">${p.question}</p>${s.running
			? html`<p class="flex items-center gap-2 text-ui text-code-muted">${staticHtml`<${tag('dot-matrix')} tone="inverse"></${tag('dot-matrix')}>`}Searching your data</p>`
			: html`${answers.map((a) => html`<div class="ds-testanswer">${staticHtml`<${tag('accuracy-thumb')} .number=${a.hit.number} .top=${a.hit.top}></${tag('accuracy-thumb')}>`}<div class="min-w-0 flex-1"><p class="flex items-center justify-between gap-3 type-meta text-code-muted"><span>${a.label}</span><span class="ds-testverdict" ?data-ok=${a.hit.ok}>${a.hit.ok ? 'Right page' : 'Wrong page'}</span></p><p class="mt-1 text-ui text-code-muted">${split(a.hit.text, a.hit.key)[0]}<strong class="font-medium text-code-fg">${split(a.hit.text, a.hit.key)[1]}</strong>${split(a.hit.text, a.hit.key)[2]}</p><p class="mt-1 flex justify-between gap-3 type-meta text-code-muted"><span class="truncate">${a.hit.id}</span><span class="shrink-0">${`Page ${a.hit.number} of ${a.hit.count}`}</span></p></div></div>`)}${p.fix ? html`<p class="text-ui">${p.fix.why}</p>` : nothing}<div class="mt-auto flex flex-wrap items-center gap-x-4 gap-y-2">${p.fix ? staticHtml`<${tag('pixel-button')} @click=${() => this.emit('fix', { row: p })}>${p.fix.action}</${tag('pixel-button')}>` : nothing}<button type="button" class="ds-testlink" @click=${() => this.emit('search', { row: p })}>${icon(Search, 'search', { size: 12, strokeWidth: 1.5, attrs: { 'aria-hidden': 'true' } })}Search it</button><button type="button" class="ds-testlink" @click=${() => this.emit('remove', { row: p })}>Remove question</button></div>`}</div>`
	}

	render() {
		const view = this.view
		if (!view) return nothing
		const rows = this.rows
		const lists = this.lists
		const list = this.list
		const inList = new Set(list.map((r) => r.id))
		const tiles = [
			{ id: 'all' as Show, label: 'Conare', value: view.right, of: view.questions, line: 'reached the right page' },
			{ id: 'current' as Show, label: view.current_name, value: view.current_right, of: view.questions, line: 'reached the right page' },
			{ id: 'differ' as Show, label: 'Where they differ', value: lists.differ.length, of: 0, line: view.right >= view.current_right ? `Conare is ahead by ${view.right - view.current_right}` : 'Your search is ahead' },
			{ id: 'look' as Show, label: 'To look at', value: lists.look.length, of: 0, line: lists.look.length ? 'each with its fix' : 'nothing left to fix' },
		]
		const running = this.running
		const picked = this.picked
		const cells = [...rows.map((r) => ({ id: r.id, ok: r.conare.ok, queued: false })), ...view.queued.map((q) => ({ id: q.id, ok: false, queued: true }))]
		const at = Math.max(0, cells.findIndex((c) => c.id === picked?.id))
		const scope = { c: at % COLS, r: Math.floor(at / COLS) }
		const m = this.glide.mark
		return html`<section data-ds="accuracy-at-work" class="m-1.25 grid grid-cols-4 gap-px border border-edge bg-edge outline outline-offset-4 outline-edge max-lg:grid-cols-2" aria-label="results">${tiles.map((t) => html`<button type="button" class="ds-testtile" aria-pressed=${String(this.show === t.id)} ?data-red=${t.id === 'look' && t.value > 0} @click=${() => { this.show = t.id }}><span class="block type-meta">${t.label}</span><span class="ds-testtile-num">${staticHtml`<${tag('count')} .value=${t.value} once=${`accuracy-${t.id}`}></${tag('count')}>`}${t.of ? html`<span class="ds-testtile-of">${` of ${t.of}`}</span>` : nothing}</span><span class="block type-meta">${t.line}</span></button>`)}</section><div data-ds="accuracy-at-work" class="grid grid-cols-2 items-start gap-6 max-lg:grid-cols-1"><div data-list class="relative flex min-w-0 flex-col" @pointerleave=${this.offList}>${m ? html`<span class="ds-glidemark" ?data-shown=${this.glide.shown} ?data-instant=${this.glide.instant} style=${`transform: translateY(${m.y}px); height: ${m.h}px`} aria-hidden="true"></span>` : nothing}${!list.length ? html`<p class="px-3 py-3 type-meta text-fg-muted">No questions here.</p>` : html`<p class="flex items-center gap-3 border-b border-edge px-3 pb-2 type-meta text-fg-muted" aria-hidden="true"><span class="flex-1">Question</span><span class="ds-testmarks"><span>Current</span><span>Conare</span></span></p>`}${list.slice(0, this.shown).map((r, i) => html`<button type="button" data-glide-row class="ds-testrow" aria-current=${picked?.id === r.id ? 'true' : nothing} @pointerenter=${(e: PointerEvent) => this.onRow(r, i, e)} @focus=${() => { this.pick(r); this.glide.point(i) }} @click=${() => this.tap(r)}><span class="min-w-0 flex-1 truncate max-sm:whitespace-normal">${r.question}</span><span class="ds-testmarks" aria-hidden="true"><span ?data-ok=${r.current.ok}>${mark(r.current.ok)}</span><span ?data-ok=${r.conare.ok}>${mark(r.conare.ok)}</span></span><span class="sr-only">${`${view.current_name}: ${r.current.ok ? 'right page' : 'wrong page'}. Conare: ${r.conare.ok ? 'right page' : 'wrong page'}.`}</span></button>`)}${this.shown < list.length ? html`<span class="mt-2 self-start inline-flex">${staticHtml`<${tag('button')} variant="ghost" press @click=${() => { this.shown += 12 }}>Show 12 more</${tag('button')}>`}</span>` : nothing}</div><section class="ds-testpanel m-1.25" aria-label="the question on show">${staticHtml`<${tag('grain')}></${tag('grain')}>`}<div class="pointer-events-none absolute inset-0 opacity-70" aria-hidden="true">${staticHtml`<${tag('cell-burst')} seed="31" jumble></${tag('cell-burst')}>`}</div><div class="relative w-full border border-code-edge bg-code text-code-fg"><div class="flex h-11 items-center gap-2 px-4 text-ui leading-4"><span class="size-2 shrink-0 bg-surface-accent" aria-hidden="true"></span><span class="truncate">Your test</span><span class="shrink-0 bg-code-raised px-1.5 py-0.5 type-meta tabular-nums">${running ? `${view.done} of ${view.questions}` : `${view.questions} questions`}</span></div><div class="ds-testfield" role="img" aria-label=${`${view.right} of ${view.questions} questions reached the right page`} @pointermove=${this.pointField} @click=${this.clickField}>${cells.map((c, i) => html`<span class="ds-testcell" data-id=${c.id} ?data-ok=${c.ok} ?data-queued=${c.queued} ?data-dim=${!c.queued && !inList.has(c.id)} style="--r: ${Math.floor(i / COLS)}"></span>`)}${picked ? html`<span class="ds-testline" data-h aria-hidden="true" style=${`transform: translateY(calc(${pitch(scope.r)} + ${half}))`}></span><span class="ds-testline" data-v aria-hidden="true" style=${`transform: translateX(calc(${pitch(scope.c)} + ${half}))`}></span><svg class="ds-bracket" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true" style=${`transform: translate(${pitch(scope.c)}, ${pitch(scope.r)})`}><path d="M0 34V0H34M66 0H100V34M100 66V100H66M34 100H0V66" vector-effect="non-scaling-stroke"></path></svg>` : nothing}</div><div class="grid min-h-85 border-t border-code-edge max-lg:min-h-0">${repeat(this.swaps, (s) => s.key, (s) => this.renderSwap(s))}</div></div></section></div>`
	}
}

define('accuracy-at-work', AccuracyAtWork)
