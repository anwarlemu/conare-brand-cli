import { html, nothing } from 'lit'
import { ifDefined } from 'lit/directives/if-defined.js'
import { repeat } from 'lit/directives/repeat.js'
import { define } from '@/elements/lib/element'
import { VizWindow } from '@/elements/components/visuals/viz-window'
import styles from 'virtual:tw'

// EvalViz.vue as <conare-eval-viz>: one benchmark as a window (the website's EvalViz.vue): the benchmark and its metric
// in the title bar, what it measures, the model's score and rank, then the top of the leaderboard as bars that grow in
// rank order, the model's own row in red, and the benchmark's disclosure under them. Rows are ranked best first by the
// benchmark's direction, the model's row kept in (last) when it falls outside the top `limit`. `items`, `pick` and
// `runs` make it one window for several results: it keeps its place and crossfades what is in it, the picked body
// drawn anew when its run changes so its timeline plays again. `wide` lets it grow past 560px. It is a
// <conare-viz-window> drawing its own title and body (so the window's part rules reach them).
export interface EvalRow { name: string, value: number, ours?: boolean, rank?: number, note?: string }
export interface Eval {
	id: string
	name: string
	description: string
	metric: string
	better: 'higher' | 'lower'
	unit?: '%'
	model: string
	score: number
	rank: { n: number, of: number, word?: string }
	rows: EvalRow[]
	/** The value a full bar stands for. */
	max: number
	disclosure?: string
}

const formatScore = (e: Eval, value: number) => (e.unit === '%' ? `${value.toFixed(1)}%` : value.toFixed(1))
const rankLabel = (e: Eval) => `#${e.rank.n} of ${e.rank.of}${e.rank.word ? `, ${e.rank.word}` : ''}`
function topRows(e: Eval, limit: number) {
	const sorted = [...e.rows].sort((a, b) => (e.better === 'higher' ? b.value - a.value : a.value - b.value))
	if (!limit || sorted.length <= limit) return sorted
	const top = sorted.slice(0, limit)
	const ours = sorted.find((r) => r.ours)
	return top.some((r) => r.ours) || !ours ? top : [...top.slice(0, limit - 1), ours]
}

/**
 * @summary One benchmark as a window: score, rank and the leaderboard's bars growing in turn.
 */
export class EvalViz extends VizWindow {
	static styles = [VizWindow.styles, styles]
	static properties = { ...VizWindow.properties, item: { type: Object }, limit: { type: Number }, wide: { type: Boolean }, items: { type: Array }, pick: { type: Number }, runs: { type: Array } }

	/** The benchmark (a JSON attribute or a property). */
	item?: Eval
	/** How many rows show. */
	limit = 6
	/** Lets it grow past 560px. */
	wide = false
	/** Several results in one window (in place of `item`). */
	items?: Eval[]
	/** Which of `items` shows. */
	pick = 0
	/** Each result's run: a new number plays its timeline again. */
	runs?: number[]

	private get list(): Eval[] {
		return this.items ?? (this.item ? [this.item] : [])
	}

	protected rootClass() {
		return this.wide ? 'max-w-190' : 'max-w-140'
	}

	protected renderTitle() {
		return html`<span class="grid min-w-0">${this.list.map((e, k) => html`<span class="ds-viz-title flex min-w-0 items-center gap-2 [grid-area:1/1]" data-active=${String(k === this.pick)}><span class="truncate text-ui leading-4">${e.name}</span><span class="hidden shrink-0 bg-ds-neutral-200 px-1.5 py-0.5 text-caption text-ds-neutral-500 sm:inline">${e.metric}</span></span>`)}</span>`
	}

	protected renderBody() {
		return html`<div class="grid grid-cols-[minmax(0,1fr)]">${this.list.map((e, k) => html`<div class="ds-viz-body [grid-area:1/1]" data-active=${String(k === this.pick)} ?inert=${k !== this.pick}>${repeat([`${k}-${this.runs?.[k] ?? 0}`], (key) => key, () => this.renderRun(e))}</div>`)}</div>`
	}

	private renderRun(e: Eval) {
		const rows = topRows(e, this.limit)
		return html`<div class="ds-viz flex flex-col gap-4 px-4 pt-1 pb-4" data-active=${String(this.active)}><p class="ds-viz-in text-meta leading-5 text-ds-neutral-500" style="--d: 200">${e.description}</p><div class="ds-viz-in flex flex-wrap items-end justify-between gap-x-4 gap-y-3" style="--d: 400"><span class="shrink-0"><span class="block text-caption whitespace-nowrap text-ds-neutral-500">${e.model}</span><span class="mt-1 block text-viz-score leading-none tracking-display tabular-nums">${formatScore(e, e.score)}</span></span><span class="flex min-w-0 flex-wrap items-center gap-2 text-meta text-ds-neutral-500"><span class="ds-viz-chip text-off-white"><span class="ds-viz-dot bg-home-red"></span>${rankLabel(e)}</span>${e.better === 'lower' ? 'Lower is better' : nothing}</span></div><ol class="border border-ds-neutral-300">${rows.map((row, i) => html`<li class="ds-viz-in flex h-10 items-center gap-2 border-b border-ds-neutral-300 px-3 last:border-b-0 sm:gap-3" style="--d: ${700 + i * 110}" title=${ifDefined(row.note)}><span class="w-4 shrink-0 text-right text-caption text-ds-neutral-500 tabular-nums">${row.rank ?? i + 1}</span><span class=${row.ours ? 'min-w-0 flex-1 truncate text-ui leading-4 sm:w-56 sm:flex-none text-off-white' : 'min-w-0 flex-1 truncate text-ui leading-4 sm:w-56 sm:flex-none text-ds-neutral-600'}>${row.name}</span><span class="h-1 w-12 shrink-0 bg-ds-neutral-300 sm:w-auto sm:min-w-0 sm:flex-1"><span class=${row.ours ? 'ds-viz-bar block h-full bg-home-red' : 'ds-viz-bar block h-full bg-ds-neutral-500'} style="--w: ${Math.min(1, row.value / e.max)}; --d: ${900 + i * 110}"></span></span><span class=${row.ours ? 'w-12 shrink-0 text-right text-meta tabular-nums text-off-white' : 'w-12 shrink-0 text-right text-meta tabular-nums text-ds-neutral-500'}>${formatScore(e, row.value)}</span></li>`)}</ol>${e.disclosure ? html`<p class="ds-viz-in flex gap-2 text-meta leading-5 text-ds-neutral-500" style="--d: 1700"><svg width="12" height="12" viewBox="0 0 12 12" aria-hidden="true" class="mt-1 shrink-0"><rect x="0.5" y="0.5" width="11" height="11" fill="none" stroke="currentColor"></rect><rect x="5.25" y="5" width="1.5" height="4" fill="currentColor"></rect><rect x="5.25" y="2.5" width="1.5" height="1.5" fill="currentColor"></rect></svg>${e.disclosure}</p>` : nothing}</div>`
	}
}

define('eval-viz', EvalViz)
