import { html, nothing, svg } from 'lit'
import { DsElement, define } from '@/elements/lib/element'
import styles from 'virtual:tw'

// LineChart.vue as <conare-line-chart>: lines over time: one axis from 0, 2px lines in the brand's series order (red,
// neutral-400, neutral-600 dashed, so colour is never the only difference), the first series shading the area under
// it, a legend when there is more than one, and a crosshair with the values under the pointer. `smooth = k` draws each
// point as the mean of the points within k / 2 steps of it in time, for series too sparse to read point by point. In a
// card by default; `bare` drops the card, for a chart already inside one. Vue's `title` is `heading`; `format` is a
// property (a function).
export type LineSeries = { label: string, points: Array<{ t: number, v: number }> }

const W = 600
const H = 160
const COLORS = ['var(--ds-color-data-1)', 'var(--ds-color-data-2)', 'var(--ds-color-data-3)']
const DASH = ['', '', '5 4']

/** @summary Lines over time, with a legend and a crosshair. */
export class LineChart extends DsElement {
	static styles = [DsElement.styles, styles]
	static properties = { heading: {}, series: { type: Array }, format: { attribute: false }, smooth: { type: Number }, height: { type: Number }, bare: { type: Boolean }, hover: { state: true } }

	/** The caption (Vue's `title`; `title` is HTML's tooltip attribute). */
	heading = ''
	/** [{ label, points: [{ t (ms), v }] }], three at most. */
	series: LineSeries[] = []
	/** A value as written (a property: a function). */
	format: (value: number) => string = (v) => String(v)
	/** Points averaged over k steps. */
	smooth?: number
	/** The plot's height in px. */
	height?: number
	/** No card, inside one already. */
	bare = false
	private hover: number | null = null

	render() {
		const series = this.series ?? []
		const format = this.format
		const all = [...new Set(series.flatMap((s) => s.points.map((p) => p.t)))].sort((a, b) => a - b)
		const step = Math.min(...all.slice(1).map((v, i) => v - all[i]!))
		const rolling = (points: Array<{ t: number, v: number }>, k: number) => {
			const reach = Math.floor(k / 2) * step
			if (!(reach > 0) || !Number.isFinite(reach)) return points
			return points.map((p) => {
				const near = points.filter((q) => Math.abs(q.t - p.t) <= reach)
				return { t: p.t, v: near.reduce((n, q) => n + q.v, 0) / near.length }
			})
		}
		const lines = series.slice(0, 3).filter((s) => s.points.length).map((s) => ({ ...s, points: rolling(s.points, this.smooth ?? 1) }))
		const times = [...new Set(lines.flatMap((s) => s.points.map((p) => p.t)))].sort((a, b) => a - b)
		const span = { from: times[0] ?? 0, to: times[times.length - 1] ?? 1 }
		const top = Math.max(0, ...lines.flatMap((s) => s.points.map((p) => p.v)))
		const unit = top > 0 ? 10 ** Math.floor(Math.log10(top)) : 1
		const max = top <= 0 ? 1 : Math.ceil(top / unit) * unit
		const x = (t: number) => (span.to === span.from ? W / 2 : ((t - span.from) / (span.to - span.from)) * W)
		const y = (v: number) => H - (v / max) * H
		const paths = lines.map((s, i) => ({
			label: s.label,
			color: COLORS[i]!,
			dash: DASH[i]!,
			d: s.points.map((p, j) => `${j ? 'L' : 'M'}${x(p.t).toFixed(1)},${y(p.v).toFixed(1)}`).join(''),
			last: s.points[s.points.length - 1]!,
			area: i ? '' : `M${x(s.points[0]!.t).toFixed(1)},${H}${s.points.map((p) => `L${x(p.t).toFixed(1)},${y(p.v).toFixed(1)}`).join('')}L${x(s.points[s.points.length - 1]!.t).toFixed(1)},${H}Z`,
		}))
		// Local time; with the day too over a range longer than 12 hours.
		const clock = (t: number) => new Date(t).toLocaleString('en-US', { ...(span.to - span.from > 12 * 3_600_000 ? { month: 'short', day: 'numeric' } : {}), hour: 'numeric', minute: '2-digit', hour12: false })
		const move = (event: PointerEvent) => {
			const box = (event.currentTarget as HTMLElement).getBoundingClientRect()
			const t = span.from + ((event.clientX - box.left) / box.width) * (span.to - span.from)
			let best: number | null = null
			for (const c of times) if (best === null || Math.abs(c - t) < Math.abs(best - t)) best = c
			this.hover = best
		}
		const hv = this.hover
		const hovered = hv === null ? null : { left: `${(x(hv) / W) * 100}%`, right: x(hv) > W * 0.6, time: clock(hv), values: lines.map((s, i) => ({ label: s.label, color: COLORS[i]!, value: s.points.find((p) => p.t === hv)?.v })) }

		return html`<figure data-ds="line-chart" class=${this.bare ? '' : 'border border-edge bg-surface p-4'}>
			<figcaption class="mb-3 flex min-h-5 flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
				<span class="type-meta font-medium text-fg-muted">${this.heading}</span>
				${lines.length > 1 ? html`<span class="flex flex-wrap gap-3 type-meta text-fg-muted">${paths.map((p) => html`<span class="inline-flex items-center gap-1"><svg width="16" height="4" aria-hidden="true"><line x1="0" y1="2" x2="16" y2="2" stroke=${p.color} stroke-width="2" stroke-dasharray=${p.dash}></line></svg>${p.label}</span>`)}</span>` : nothing}
			</figcaption>
			${!lines.length
				? html`<p class="type-ui text-fg-muted">No data in this range.</p>`
				: html`<div class="flex gap-2">
						<div class="relative h-40 w-14 shrink-0" aria-hidden="true">${[max, max / 2, 0].map((v, i) => html`<span class="type-meta text-fg-muted tabular-nums absolute right-0 -translate-y-1/2 whitespace-nowrap" style=${`top: ${i * 50}%`}>${i === 2 ? '0' : format(v)}</span>`)}</div>
						<div class="min-w-0 flex-1">
							<div class="relative h-40 touch-none" style=${this.height ? `height: ${this.height}px` : ''} role="img" aria-label=${`${this.heading}: ${paths.map((p) => `${p.label} last ${format(p.last.v)}`).join(', ')}`} @pointermove=${move} @pointerleave=${() => { this.hover = null }}>
								<svg class="absolute inset-0 h-full w-full overflow-visible" viewBox=${`0 0 ${W} ${H}`} preserveAspectRatio="none">
									${[0, H / 2, H].map((g) => svg`<line x1="0" y1=${g} x2=${W} y2=${g} stroke="var(--ds-color-data-grid)" stroke-width="1" vector-effect="non-scaling-stroke"></line>`)}
									${paths.filter((q) => q.area).map((p) => svg`<path d=${p.area} fill=${p.color} fill-opacity="0.06"></path>`)}
									${paths.map((p) => svg`<path d=${p.d} fill="none" stroke=${p.color} stroke-width="2" stroke-dasharray=${p.dash} stroke-linejoin="round" stroke-linecap="round" vector-effect="non-scaling-stroke"></path>`)}
								</svg>
								${hovered
									? html`<div class="pointer-events-none absolute inset-y-0 w-px bg-ds-neutral-500" style=${`left: ${hovered.left}`}></div><div class="pointer-events-none absolute top-0 z-10 border border-edge bg-surface px-3 py-2 type-meta" style=${hovered.right ? `right: calc(100% - ${hovered.left} + 8px)` : `left: calc(${hovered.left} + 8px)`}><p class="mb-1 text-fg-muted tabular-nums">${hovered.time}</p>${hovered.values.map((v) => html`<p class="flex items-center gap-2 whitespace-nowrap tabular-nums"><span class="inline-block h-0.5 w-3" style=${`background: ${v.color}`}></span>${lines.length > 1 ? html`<span class="text-fg-muted">${v.label}</span>` : nothing}<span class="font-medium">${v.value === undefined ? '–' : format(v.value)}</span></p>`)}</div>`
									: nothing}
							</div>
							<div class="type-meta text-fg-muted tabular-nums mt-2 flex justify-between"><span>${clock(span.from)}</span><span>${clock(span.to)}</span></div>
						</div>
					</div>`}
		</figure>`
	}
}

define('line-chart', LineChart)
