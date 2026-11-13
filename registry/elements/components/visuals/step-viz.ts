import { html } from 'lit'
import { repeat } from 'lit/directives/repeat.js'
import { define } from '@/elements/lib/element'
import { VizWindow } from '@/elements/components/visuals/viz-window'
import styles from 'virtual:tw'

// StepViz.vue as <conare-step-viz>: How it works' window (the website's StepViz.vue): one search shown step by step, as
// an agent window. The ask in a filled bubble, what was added to context, a status that shimmers while it works and
// then says how it went, the outcome as a sentence with the records it touched as inline chips, and a progress row with
// the dot matrix and a ticking timer. Steps: 0 write, 1 sync a source, 2 search (results land where they were found,
// then glide to the reranked order), 3 an agent over MCP. One window for every step: picking one keeps the window and
// crossfades what is in it, every step's body in one grid cell so the window never resizes; a new number in `runs`
// draws the picked body anew, replaying it. It is a <conare-viz-window> drawing its own title and body.
const windows = [
	{ name: 'Conare', tag: 'Write', ask: 'Add our refund and shipping policies to docs', context: 'Policies.pdf', working: 'Writing', took: 'Worked for 2s' },
	{ name: 'Conare', tag: 'Source', ask: 'Keep HubSpot in sync with CRM', context: 'HubSpot', working: 'Syncing', took: 'Synced 3 records' },
	{ name: 'Conare', tag: 'Search', ask: 'How do refunds work?', context: 'Docs', working: 'Searching', took: 'Reranked in 62 ms' },
	{ name: 'Your agent', tag: 'MCP', ask: 'How do refunds work?', context: 'Conare', working: 'Thinking', took: 'Worked for 1s' },
]

// Found in one order, shown after the rerank in another: `from` and `to` are each row's place before and after.
const results = [
	{ id: 'Refunds', text: 'Refunds are available for 30 days.', score: '0.91', from: 2, to: 0 },
	{ id: 'Returns', text: 'Return an item from your orders page.', score: '0.47', from: 0, to: 1 },
	{ id: 'Shipping', text: 'Orders ship within two days.', score: '0.12', from: 1, to: 2 },
]

// The loader's nine squares, each blinking a beat after the last.
const matrix = () => html`<span class="ds-viz-matrix" aria-hidden="true">${Array.from({ length: 9 }, (_, i) => html`<i style="--k: ${i + 1}"></i>`)}</span>`

/**
 * @summary How it works' agent window, one step at a time.
 */
export class StepViz extends VizWindow {
	static styles = [VizWindow.styles, styles]
	static properties = { ...VizWindow.properties, step: { type: Number }, runs: { type: Array } }

	/** 0 write, 1 sync, 2 search, 3 an agent over MCP. */
	step = 0
	/** Each step's run: a new number plays it again. */
	runs: number[] = []

	protected rootClass() {
		return 'max-w-100'
	}

	protected renderTitle() {
		return html`<span class="grid">${windows.map((w, i) => html`<span class="ds-viz-title flex items-center gap-2 whitespace-nowrap [grid-area:1/1]" data-active=${String(i === this.step)}><span class="text-ui leading-4">${w.name}</span><span class="bg-ds-neutral-200 px-1.5 py-0.5 text-caption text-ds-neutral-500">${w.tag}</span></span>`)}</span>`
	}

	protected renderBody() {
		return html`<div class="grid grid-cols-[minmax(0,1fr)]">${windows.map((w, k) => html`<div class="ds-viz-body [grid-area:1/1]" data-active=${String(k === this.step)} ?inert=${k !== this.step}>${repeat([`${k}-${this.runs[k] ?? 0}`], (key) => key, () => this.renderStep(w, k))}</div>`)}</div>`
	}

	private renderStep(w: (typeof windows)[number], k: number) {
		return html`<div class="ds-viz flex flex-col gap-3 px-4 pt-1 pb-4" data-active=${String(this.active)}><p class="ds-viz-in ml-10 bg-ds-neutral-200 px-3 py-2.5 text-ui" style="--d: 200">${w.ask}</p><p class="ds-viz-in flex items-center justify-end gap-1.5 text-meta text-ds-neutral-500" style="--d: 600"><svg width="12" height="12" viewBox="0 0 12 12" aria-hidden="true"><rect x="0.5" y="0.5" width="11" height="11" fill="none" stroke="currentColor"></rect><rect x="3" y="3" width="3" height="6" fill="currentColor"></rect></svg><span class="text-ds-neutral-600">${w.context}</span> added to context</p><p class="ds-viz-in grid text-meta" style="--d: 900"><span class="ds-viz-swap-a ds-viz-shimmer [grid-area:1/1]" style="--d: 2400">${`${w.working}…`}</span><span class="ds-viz-swap-b [grid-area:1/1] text-ds-neutral-500" style="--d: 2400">${`${w.took} `}<span class="ds-step-play">▶</span></span></p>${this.renderOutcome(k)}</div>`
	}

	private renderOutcome(k: number) {
		// Write
		if (k === 0) return html`<p class="ds-viz-in text-ui leading-6" style="--d: 1300">Wrote <span class="ds-viz-chip"><span class="ds-viz-dot bg-home-red"></span>Refunds</span> and <span class="ds-viz-chip"><span class="ds-viz-dot bg-home-red"></span>Shipping</span> to the docs namespace, searchable now.</p><div class="ds-viz-in ds-viz-progress" style="--d: 1600">${matrix()}<span class="grid flex-1"><span class="ds-viz-swap-a [grid-area:1/1]" style="--d: 2400">Writing 2 documents…</span><span class="ds-viz-swap-b [grid-area:1/1] text-ds-neutral-500" style="--d: 2400">2 documents created</span></span><span class="ds-viz-timer" style="--to: 2; --d: 1600"></span></div>`
		// Sync
		if (k === 1) return html`<p class="ds-viz-in text-ui leading-6" style="--d: 1300">Updated <span class="ds-viz-chip"><span class="ds-viz-dot bg-home-red"></span>Deal 4821</span>, created <span class="ds-viz-chip"><span class="ds-viz-dot bg-home-red"></span>Deal 4830</span> and deleted <span class="ds-viz-chip"><span class="ds-viz-dot bg-ds-neutral-500"></span><span class="line-through">Contact 913</span></span>.</p><div class="ds-viz-in ds-viz-progress" style="--d: 1600">${matrix()}<span class="grid flex-1"><span class="ds-viz-swap-a [grid-area:1/1]" style="--d: 2400">Syncing HubSpot…</span><span class="ds-viz-swap-b [grid-area:1/1] text-ds-neutral-500" style="--d: 2400">Next sync in 15 min</span></span><span class="ds-viz-timer" style="--to: 4; --d: 1600"></span></div>`
		// Search: results land where they were found, then glide to the reranked order on a 48px track.
		if (k === 2) return html`<div class="relative h-[146px] border border-ds-neutral-300">${results.map((r) => html`<div class="ds-viz-row absolute inset-x-0 top-0 flex h-12 items-center gap-3 border-b border-ds-neutral-300 bg-ds-neutral-100 px-3" style="--from: ${r.from}; --to: ${r.to}; --d: ${1200 + r.from * 160}"><span class=${r.to === 0 ? 'ds-viz-dot bg-home-red' : 'ds-viz-dot bg-ds-neutral-500'}></span><span class="min-w-0 flex-1"><span class="block text-ui leading-4">${r.id}</span><span class="block truncate text-meta text-ds-neutral-500">${r.text}</span></span><span class="w-16 shrink-0"><span class="block text-right text-caption text-ds-neutral-500 tabular-nums">${r.score}</span><span class="mt-1 block h-0.5 bg-ds-neutral-300"><span class="ds-viz-bar block h-full bg-off-white" style="--w: ${r.score}; --d: ${2900 + r.to * 120}"></span></span></span></div>`)}</div>`
		// An agent over MCP
		return html`<p class="ds-viz-in text-ui leading-6" style="--d: 1300">Called <span class="ds-viz-chip">Search</span> in docs. Refunds are available for 30 days.</p><p class="ds-viz-in flex items-center gap-2 text-meta text-ds-neutral-500" style="--d: 2600">Source <span class="ds-viz-chip text-off-white"><span class="ds-viz-dot bg-home-red"></span>Refunds</span></p>`
	}
}

define('step-viz', StepViz)
