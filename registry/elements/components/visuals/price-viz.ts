import { html, nothing, svg, type PropertyValues } from 'lit'
import { define } from '@/elements/lib/element'
import { VizWindow } from '@/elements/components/visuals/viz-window'
import styles from 'virtual:tw'

// PriceViz.vue as <conare-price-viz>: accuracy against list price as a window (the website's PriceViz.vue): the chart
// draws itself (grid, then the corner nothing beats, then the crosshair on the model's own point, then each model's
// point), and under it the models as rows, best first. Price is on a log axis; up and to the left is better; the shaded
// corner is what would beat the model's own point on both. Points are squares. Pointing at a point or its row scopes it:
// a crosshair to both axes, brackets, the axes' readouts and a tooltip with its exact score and price, gliding from
// point to point (160ms, the console's curve) and appearing in place when it arrives from nowhere. `x` and `y` set the
// axes (their ticks and ends). `data`, `x` and `y` are JSON attributes or properties. It is a <conare-viz-window>
// drawing its own title and body.
export interface PricePoint { name: string, price: number, score: number, ours?: boolean }
export interface PriceData { benchmark: string, metric: string, points: PricePoint[], note?: string }
export type Axis = { min: number, max: number, ticks: number[] }

const W = 560
const H = 284
const L = 40
const R = W - 16
const T = 24
const B = 260
const money = (v: number) => '$' + v.toFixed(2)
const BRACKET = 11
const ARM = 4
const bracket = [
	'M' + -BRACKET + ' ' + (-BRACKET + ARM) + 'V' + -BRACKET + 'H' + (-BRACKET + ARM),
	'M' + (BRACKET - ARM) + ' ' + -BRACKET + 'H' + BRACKET + 'V' + (-BRACKET + ARM),
	'M' + BRACKET + ' ' + (BRACKET - ARM) + 'V' + BRACKET + 'H' + (BRACKET - ARM),
	'M' + (-BRACKET + ARM) + ' ' + BRACKET + 'H' + -BRACKET + 'V' + (BRACKET - ARM),
].join('')

/**
 * @summary Accuracy against list price as a window: point at a model to scope it.
 */
export class PriceViz extends VizWindow {
	static styles = [VizWindow.styles, styles]
	static properties = { ...VizWindow.properties, data: { type: Object }, x: { type: Object }, y: { type: Object }, hot: { state: true }, scopeName: { state: true }, glide: { state: true } }

	/** The benchmark, its metric, the points and a note. */
	data: PriceData = { benchmark: '', metric: '', points: [] }
	/** The price axis: its ends and ticks. */
	x: Axis = { min: 0.05, max: 2, ticks: [0.05, 0.1, 0.2, 0.5, 1, 2] }
	/** The score axis: its ends and ticks. */
	y: Axis = { min: 56, max: 70, ticks: [56, 60, 64, 68] }
	private hot: string | null = null
	private scopeName: string | null = null
	private glide = false

	private px(price: number) {
		const xMin = Math.log10(this.x.min)
		const xMax = Math.log10(this.x.max)
		return L + ((Math.log10(price) - xMin) / (xMax - xMin)) * (R - L)
	}
	private py(score: number) {
		return B - ((score - this.y.min) / (this.y.max - this.y.min)) * (B - T)
	}
	private get points() {
		return [...this.data.points].sort((a, b) => b.score - a.score).map((p, i) => ({ ...p, cx: this.px(p.price), cy: this.py(p.score), i }))
	}

	protected willUpdate(changed: PropertyValues) {
		super.willUpdate(changed)
		// Vue's watch on the scoped point: it moves the scope, and gliding starts two frames after it arrives from nowhere.
		if (!changed.has('hot')) return
		const scoped = this.points.find((p) => p.name === this.hot)
		if (!scoped) return
		const was = changed.get('hot') as string | null | undefined
		this.scopeName = scoped.name
		if (!was) {
			this.glide = false
			requestAnimationFrame(() => requestAnimationFrame(() => { this.glide = true }))
		}
	}

	protected rootClass() {
		return 'max-w-155'
	}

	protected renderTitle() {
		return html`<span class="truncate text-ui leading-4">${this.data.benchmark}</span><span class="hidden shrink-0 bg-ds-neutral-200 px-1.5 py-0.5 text-caption text-ds-neutral-500 sm:inline">Price and accuracy</span>`
	}

	protected renderBody() {
		const points = this.points
		if (!points.length) return nothing
		const { x, y, data, hot } = this
		const ours = points.find((p) => p.ours) ?? points[0]!
		const scoped = points.find((p) => p.name === hot) ?? null
		const scopeAt = points.find((p) => p.name === this.scopeName) ?? points[0]!
		// The tooltip opens away from the chart's nearer edges: left of points on the right half, below points near the top.
		const tipLeft = scopeAt.cx > (L + R) / 2
		const tipBelow = scopeAt.cy < T + 70
		const shown = String(!!scoped)
		return html`<div class="flex flex-col gap-4 px-4 pt-1 pb-4"><div class="border border-ds-neutral-300 px-2 pt-2 pb-4"><div class="relative [container-type:inline-size]" data-glide=${String(this.glide)} data-scoped=${shown} @pointerleave=${() => { this.hot = null }}><svg viewBox=${`0 0 ${W} ${H}`} class="block w-full" role="img" aria-label=${`${data.benchmark} ${data.metric} against list price per 1M tokens`}><g class="ds-viz-in" style="--d: 300">${y.ticks.map((t) => svg`<g><line x1=${L} x2=${R} y1=${this.py(t)} y2=${this.py(t)} class="ds-price-grid"></line><text x=${L - 8} y=${this.py(t) + 4} text-anchor="end" class=${t === y.min ? 'ds-price-axis ds-price-axis-floor' : 'ds-price-axis'}>${t}</text></g>`)}${x.ticks.map((t, i) => svg`<g><line x1=${this.px(t)} x2=${this.px(t)} y1=${T} y2=${B} class="ds-price-grid"></line><text x=${this.px(t)} y=${B + 18} text-anchor=${i === x.ticks.length - 1 ? 'end' : i === 0 ? 'start' : 'middle'} class="ds-price-axis">${money(t)}</text></g>`)}<text x=${L} y=${T - 10} class="ds-price-axis">${data.metric}</text><text x=${R} y=${T - 10} text-anchor="end" class="ds-price-axis">Up and to the left is better</text></g><rect class="ds-viz-in" x=${L} y=${T} width=${ours.cx - L} height=${ours.cy - T} fill="var(--ds-color-home-red)" fill-opacity="0.14" style="--d: 800"></rect><path class="ds-price-draw" d=${'M' + ours.cx + ' ' + B + 'V' + ours.cy + 'H' + L} fill="none" stroke="var(--ds-color-home-red)" stroke-opacity="0.6" style="--d: 1000" pathLength="1"></path><g class="ds-price-scope" data-shown=${shown} aria-hidden="true"><line class="ds-price-scope-move" x1=${L} x2=${R} y1="0" y2="0" style=${`transform: translateY(${scopeAt.cy}px)`}></line><line class="ds-price-scope-move" x1="0" x2="0" y1=${T} y2=${B} style=${`transform: translateX(${scopeAt.cx}px)`}></line></g>${points.map((p) => svg`<g class="ds-viz-in ds-price-point" data-dim=${String(hot !== null && hot !== p.name)} style="--d: ${1300 + p.i * 140}"><rect x=${p.cx - (p.ours ? 6 : 4)} y=${p.cy - (p.ours ? 6 : 4)} width=${p.ours ? 12 : 8} height=${p.ours ? 12 : 8} fill=${p.ours ? 'var(--ds-color-home-red)' : 'var(--ds-color-neutral-600)'}></rect><text x=${p.cx + (p.price >= 1 ? -12 : 12)} y=${p.cy + 4} text-anchor=${p.price >= 1 ? 'end' : 'start'} class="ds-price-label" ?data-ours=${!!p.ours}>${p.name}</text><rect x=${p.cx - 14} y=${p.cy - 14} width="28" height="28" fill="transparent" class="cursor-crosshair" @pointerenter=${() => { this.hot = p.name }}></rect></g>`)}<g class="ds-price-scope" data-shown=${shown} ?data-ours=${!!scopeAt.ours} aria-hidden="true"><g class="ds-price-scope-move" style=${`transform: translate(${scopeAt.cx}px, ${scopeAt.cy}px)`}><path class="ds-price-scope-bracket" d=${bracket}></path></g><g class="ds-price-scope-move" style=${`transform: translateY(${scopeAt.cy}px)`}><rect x=${L - 38} y="-8" width="36" height="16" class="ds-price-readout"></rect><text x=${L - 20} y="4" text-anchor="middle" class="ds-price-axis ds-price-readout-text">${scopeAt.score.toFixed(2)}</text></g><g class="ds-price-scope-move" style=${`transform: translateX(${scopeAt.cx}px)`}><rect x="-20" y=${B + 6} width="40" height="16" class="ds-price-readout"></rect><text x="0" y=${B + 18} text-anchor="middle" class="ds-price-axis ds-price-readout-text">${money(scopeAt.price)}</text></g></g></svg><div class="ds-price-tip pointer-events-none absolute top-0 left-0" data-shown=${shown} style=${`transform: translate(calc(${scopeAt.cx / W} * 100cqw), calc(${scopeAt.cy / W} * 100cqw))`} aria-hidden="true"><div class="ds-price-tip-box w-[172px] border border-ds-neutral-300 bg-ds-neutral-200 px-2.5 py-2 text-meta" style=${`transform: translate(${tipLeft ? 'calc(-100% - 18px)' : '18px'}, ${tipBelow ? '18px' : 'calc(-100% - 18px)'})`}><p class="flex items-center gap-1.5 truncate text-off-white"><span class=${scopeAt.ours ? 'ds-viz-dot bg-home-red' : 'ds-viz-dot bg-ds-neutral-500'}></span>${scopeAt.name}</p><p class="mt-1.5 flex justify-between gap-4 text-ds-neutral-500">${data.metric}<span class="text-off-white tabular-nums">${scopeAt.score.toFixed(2)}</span></p><p class="mt-0.5 flex justify-between gap-4 text-ds-neutral-500">Per 1M tokens<span class="text-off-white tabular-nums">${money(scopeAt.price)}</span></p></div></div></div><p class="ds-viz-in mt-2 flex justify-end" style=${`--d: 300; padding-right: ${((W - R) / W) * 100}%`}><span class="bg-ds-neutral-700 px-2 py-1 text-caption text-off-black">Price per 1M tokens, log scale</span></p></div><ol class="border border-ds-neutral-300" @mouseleave=${() => { this.hot = null }}>${points.map((p) => html`<li class=${['ds-viz-in flex h-9 items-center gap-3 border-b border-ds-neutral-300 px-3 text-ui leading-4 transition-colors duration-200 ease-standard last:border-b-0', hot === p.name ? 'bg-ds-neutral-200' : ''].join(' ')} style="--d: ${1500 + p.i * 110}" @mouseenter=${() => { this.hot = p.name }}><span class=${p.ours ? 'ds-viz-dot bg-home-red' : 'ds-viz-dot bg-ds-neutral-500'}></span><span class=${p.ours ? 'min-w-0 flex-1 truncate text-off-white' : 'min-w-0 flex-1 truncate text-ds-neutral-600'}>${p.name}</span><span class="w-12 shrink-0 text-right text-ds-neutral-500 tabular-nums max-[419px]:hidden">${p.score.toFixed(2)}</span><span class=${p.ours ? 'w-14 shrink-0 text-right tabular-nums text-off-white' : 'w-14 shrink-0 text-right tabular-nums text-ds-neutral-500'}>${money(p.price)}</span></li>`)}</ol>${data.note ? html`<p class="ds-viz-in flex gap-2 text-meta leading-5 text-ds-neutral-500" style="--d: 2300"><svg width="12" height="12" viewBox="0 0 12 12" aria-hidden="true" class="mt-1 shrink-0"><rect x="0.5" y="0.5" width="11" height="11" fill="none" stroke="currentColor"></rect><rect x="5.25" y="5" width="1.5" height="4" fill="currentColor"></rect><rect x="5.25" y="2.5" width="1.5" height="1.5" fill="currentColor"></rect></svg>${data.note}</p>` : nothing}</div>`
	}
}

define('price-viz', PriceViz)
