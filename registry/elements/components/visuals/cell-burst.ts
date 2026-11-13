import { html, svg, nothing } from 'lit'
import { DsElement, define } from '@/elements/lib/element'
import { cellPaths, NearViewController, rng } from '@/elements/controllers/cell-burst'
import styles from 'virtual:tw'

// CellBurst.vue as <conare-cell-burst>: the website's "endless data cells": the panel is a sheet of cells, and some cells on its border are
// redrawn smaller and smaller down to a vanishing point, each becoming a wedge of hairlines. The wedges are
// translucent, so where they overlap toward the centre they build up lighter. Each seed picks its own cells.
// `jumble` scatters it (a finer sheet, the vanishing point off centre, wedges from anywhere); `ledger` makes it a
// spreadsheet's (few columns, many thin rows, cells running in from the right); `strong` raises every layer for a red
// ground; `trace` sets the grid's own lines wiping away and drawing back in, each at its own pace. Drawn in a -1..1
// box stretched to the panel, so it fills it at any size. Put it in a `relative` panel; it is decorative.

// Hatch pitch in box units (about 3px), how near the centre the copies run, and how many cells light.
const PITCH = 0.012
const INNER = 0.04
const WEDGES = 12

type P = [number, number]

/** The convex hull of a cell's corners and the centre: the wedge its copies sweep out on their way in. */
function hull(points: P[]) {
	const pts = [...points].sort((a, b) => a[0] - b[0] || a[1] - b[1])
	const cross = (q: P, a: P, b: P) => (a[0] - q[0]) * (b[1] - q[1]) - (a[1] - q[1]) * (b[0] - q[0])
	const half = (list: P[]) => {
		const out: P[] = []
		for (const p of list) {
			while (out.length >= 2 && cross(out[out.length - 2]!, out[out.length - 1]!, p) <= 0) out.pop()
			out.push(p)
		}
		out.pop()
		return out
	}
	return [...half(pts), ...half([...pts].reverse())].map(p => p.join(',')).join(' ')
}

/** Everything the burst draws, from its props. */
function draw({ seed, jumble, ledger, strong, trace }: { seed: number, jumble: boolean, ledger: boolean, strong: boolean, trace: boolean }) {
	const o = strong ? { grid: 0.3, cross: 0.5, hull: 0.14, lines: 0.42 } : { grid: 0.18, cross: 0.3, hull: 0.07, lines: 0.16 }
	const COLS = ledger ? 5 : jumble ? 10 : 6
	const ROWS = ledger ? 16 : 6

	let grid = ''
	for (let i = 1; i < COLS; i++) grid += `M${-1 + (2 * i) / COLS} -1V1`
	for (let j = 1; j < ROWS; j++) grid += `M-1 ${-1 + (2 * j) / ROWS}H1`

	// The vanishing point: the centre; with `jumble` somewhere in the middle half; with `ledger` near the left edge.
	const vp: P = (() => {
		const rand = rng(seed * 7 + 3)
		if (ledger) return [-0.84, (rand() - 0.5) * 0.6]
		if (!jumble) return [0, 0]
		return [rand() - 0.5, rand() - 0.5]
	})()

	const wedges = (() => {
		const w = 2 / COLS
		const h = 2 / ROWS
		const [vx, vy] = vp
		const pool: P[] = []
		for (let i = 0; i < COLS; i++) {
			for (let j = 0; j < ROWS; j++) {
				if (ledger ? i >= COLS - 2 : jumble || i === 0 || j === 0 || i === COLS - 1 || j === ROWS - 1) pool.push([i, j])
			}
		}
		const rand = rng(seed)
		for (let n = pool.length - 1; n > 0; n--) {
			const m = Math.floor(rand() * (n + 1))
			;[pool[n], pool[m]] = [pool[m]!, pool[n]!]
		}
		return pool.slice(0, WEDGES).map(([i, j]) => {
			const x0 = -1 + i * w
			const y0 = -1 + j * h
			return { hull: hull([[x0, y0], [x0 + w, y0], [x0 + w, y0 + h], [x0, y0 + h], [vx, vy]]), lines: cellPaths(x0 - vx, y0 - vy, w, h, PITCH, INNER).lines }
		})
	})()

	// With `trace`, the grid's lines and the cross through the vanishing point are drawn one by one in screen
	// percentages (no viewBox), so the stroke stays a hairline and the wipe runs in pixels.
	const traces = (() => {
		if (!trace) return []
		const rand = rng(seed * 13 + 1)
		const [vx, vy] = vp
		const out: { d: Record<'x1' | 'y1' | 'x2' | 'y2', string>, opacity: number, style: Record<'--dur' | '--delay', string> }[] = []
		const pct = (v: number) => `${((v + 1) * 50).toFixed(2)}%`
		const line = (x: number | null, y: number | null, opacity: number) => {
			const [a, b] = rand() < 0.5 ? ['100%', '0%'] : ['0%', '100%']
			const d = x !== null ? { x1: pct(x), y1: a, x2: pct(x), y2: b } : { x1: a, y1: pct(y!), x2: b, y2: pct(y!) }
			const dur = 6 + rand() * 8
			out.push({ d, opacity, style: { '--dur': `${dur.toFixed(2)}s`, '--delay': `${(-rand() * dur).toFixed(2)}s` } })
		}
		for (let i = 1; i < COLS; i++) line(-1 + (2 * i) / COLS, null, o.grid)
		for (let j = 1; j < ROWS; j++) line(null, -1 + (2 * j) / ROWS, o.grid)
		line(vx, null, o.cross)
		line(null, vy, o.cross)
		return out
	})()

	return { o, grid, vp, wedges, traces }
}

/**
 * @summary The website's endless data cells: wedges of hairlines running to a vanishing point.
 */
export class CellBurst extends DsElement {
	static styles = [DsElement.styles, styles]
	static properties = { seed: { type: Number }, jumble: { type: Boolean }, ledger: { type: Boolean }, strong: { type: Boolean }, trace: { type: Boolean } }

	/** Which cells light: the same seed draws the same burst. */
	seed = 0
	/** Scatters it: a finer sheet, the vanishing point off centre. */
	jumble = false
	/** A spreadsheet's: few columns, many thin rows. */
	ledger = false
	/** Every layer raised, for a red ground. */
	strong = false
	/** The grid's lines wipe away and draw back in. */
	trace = false

	private near = new NearViewController(this, () => this.renderRoot.querySelector('svg'))

	render() {
		const { o, grid, vp, wedges, traces } = draw({ seed: this.seed, jumble: this.jumble, ledger: this.ledger, strong: this.strong, trace: this.trace })
		return html`<svg data-ds="cell-burst" class="pointer-events-none absolute inset-0 h-full w-full" viewBox="-1 -1 2 2" preserveAspectRatio="none" aria-hidden="true">${!traces.length
			? svg`<g fill="none" stroke="var(--ds-color-off-white)" stroke-width="0.5" vector-effect="non-scaling-stroke"><path d=${grid} stroke-opacity=${o.grid} vector-effect="non-scaling-stroke"></path><path d=${`M${vp[0]} -1V1M-1 ${vp[1]}H1`} stroke-opacity=${o.cross} vector-effect="non-scaling-stroke"></path></g>`
			: nothing}${(this.near.near ? wedges : []).map((wg) => svg`<g class="ds-art-in"><polygon points=${wg.hull} fill="var(--ds-color-off-white)" fill-opacity=${o.hull}></polygon><path d=${wg.lines} transform=${`translate(${vp[0]} ${vp[1]})`} fill="none" stroke="var(--ds-color-off-white)" stroke-width="0.5" stroke-opacity=${o.lines} vector-effect="non-scaling-stroke"></path></g>`)}</svg>${traces.length
			? html`<svg data-ds="cell-burst" class="pointer-events-none absolute inset-0 h-full w-full" aria-hidden="true"><g fill="none" stroke="var(--ds-color-off-white)" stroke-width="1">${traces.map((t) => svg`<line x1=${t.d.x1} y1=${t.d.y1} x2=${t.d.x2} y2=${t.d.y2} pathLength="1" class="ds-cell-trace" stroke-opacity=${t.opacity} style=${`--dur: ${t.style['--dur']}; --delay: ${t.style['--delay']}`}></line>`)}</g></svg>`
			: nothing}`
	}
}

define('cell-burst', CellBurst)
