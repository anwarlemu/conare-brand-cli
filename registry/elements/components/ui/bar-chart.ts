import { html, nothing } from 'lit'
import { repeat } from 'lit/directives/repeat.js'
import { ifDefined } from 'lit/directives/if-defined.js'
import { DsElement, define } from '@/elements/lib/element'
import { type DayPoint, compactNumber, formatDay, formatNumber, niceTicks } from '@/elements/controllers/chart'
import styles from 'virtual:tw'

// BarChart.vue as <conare-bar-chart>: a red bar per day. The axis starts at 0 and ends on a round number in four
// steps; grid lines are 1px hairlines. A day with any activity keeps a visible bar. Pointing at a bar names its day and
// value in the caption and quiets the others. The bars rise from the axis once, staggered over the same 120ms for 7
// days or 90. `focus`: bars lit from outside, the rest quiet, as under the pointer; `note`: what the caption says
// meanwhile. `week`: the change over the last seven days, set over those bars. `held`: on its way, the axis alone at
// its height. `bare` drops the caption's label, for a chart under a stat that already names it.

/** @summary A red bar per day, with its axis, grid and dates. */
export class BarChart extends DsElement {
	static styles = [DsElement.styles, styles]
	static properties = { points: { type: Array }, label: {}, height: { type: Number }, lit: { type: Array, attribute: 'focus' }, note: {}, week: {}, held: { type: Boolean }, bare: { type: Boolean }, hover: { state: true } }

	/** [{ day (ISO), value }]. */
	points: DayPoint[] = []
	/** The caption. */
	label = ''
	/** The bars' height in px. */
	height = 160
	/** Indexes lit from outside, the rest quiet (Vue's `focus`, the attribute focus; `focus` is HTMLElement's own method). */
	lit?: number[]
	/** What the caption says while nothing is pointed at. */
	note?: string
	/** The last seven days' change, over those bars. */
	week?: string
	/** On its way: the axis alone at its height. */
	held = false
	/** No caption label, under a stat that names it. */
	bare = false
	private hover: number | null = null

	render() {
		const points = this.points ?? []
		const ticks = niceTicks(points.map((p) => p.value))
		const top = ticks[ticks.length - 1]!
		const n = points.length
		// Four dates under the bars: the first, the last and two between.
		const marks = n ? [...new Set([0, Math.round((n - 1) / 3), Math.round((2 * (n - 1)) / 3), n - 1])].map((i) => ({ left: `${((i + 0.5) / n) * 100}%`, text: formatDay(points[i]!.day) })) : []
		const shown = this.hover === null ? null : points[this.hover] ?? null
		const peak = formatNumber(Math.max(0, ...points.map((p) => p.value)))
		const h = `height: ${this.height}px`
		let body
		if (this.held) {
			body = html`<div class="grid grid-cols-[40px_minmax(0,1fr)] gap-x-2" aria-hidden="true"><div></div><div class="relative" style=${h}><div class="absolute inset-x-0 bottom-0 border-t border-edge"></div></div><div></div><div class="mt-2 h-4"></div></div>`
		} else if (!n) {
			body = html`<p class="flex items-center justify-center type-ui text-fg-muted" style=${h}>No activity yet.</p>`
		} else {
			body = html`<div class="grid grid-cols-[40px_minmax(0,1fr)] gap-x-2">
				<div class="relative" style=${h} aria-hidden="true">${ticks.map((t) => html`<span class="ds-chart-meta absolute right-0 -translate-y-1/2" style=${`top: ${(1 - t / top) * 100}%`}>${compactNumber(t)}</span>`)}</div>
				<div class="relative" style=${h} role="img" aria-label=${`${this.label}: ${n} days, peak ${peak}${this.week ? `, ${this.week} this week` : ''}`} @pointerleave=${() => { this.hover = null }}>
					${ticks.map((t) => html`<div class="pointer-events-none absolute inset-x-0 border-t border-data-grid" style=${`top: ${(1 - t / top) * 100}%`}></div>`)}
					${this.week && !shown ? html`<p class="ds-chart-week" style=${`width: ${(Math.min(7, n) / n) * 100}%`}><span class="font-medium tabular-nums">${this.week}</span><span class="text-fg-muted">this week</span></p>` : nothing}
					<div class="absolute inset-0 flex items-end">${repeat(points, (p) => p.day, (p, i) => html`<div class="flex h-full flex-1 items-end" @pointerenter=${() => { this.hover = i }}><div class=${['ds-bar mx-auto w-[70%]', this.hover === i || (this.hover === null && (!this.lit || this.lit.includes(i))) ? 'bg-data-highlight' : 'bg-ds-neutral-600'].join(' ')} style=${`height: ${p.value > 0 ? `max(2px, ${(p.value / top) * 100}%)` : '0'}; --i: ${(i * 30) / n}`}></div></div>`)}</div>
				</div>
				<div></div>
				<div class="relative mt-2 h-4" aria-hidden="true">${marks.map((m, i) => html`<span class=${['ds-chart-meta absolute whitespace-nowrap', i === 0 ? 'left-0' : i === marks.length - 1 ? 'right-0' : '-translate-x-1/2'].join(' ')} style=${ifDefined(i === 0 || i === marks.length - 1 ? undefined : `left: ${m.left}`)}>${m.text}</span>`)}</div>
			</div>`
		}
		return html`<figure data-ds="bar-chart" class="ds-barchart flex flex-col gap-3" data-bare=${ifDefined(this.bare ? 'true' : undefined)}>
			<figcaption class="ds-barchart-cap flex h-5 items-baseline justify-between gap-4">
				<span class="ds-chart-caption">${this.label}</span>
				${shown ? html`<span class="ds-chart-meta">${`${formatDay(shown.day, true)} `}<span class="font-medium text-fg">${formatNumber(shown.value)}</span></span>` : this.note ? html`<span class="ds-chart-meta">${this.note}</span>` : nothing}
			</figcaption>
			${body}
		</figure>`
	}
}

define('bar-chart', BarChart)
