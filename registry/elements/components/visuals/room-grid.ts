import { html, nothing, svg, type PropertyValues } from 'lit'
import { DsElement, define } from '@/elements/lib/element'
import styles from 'virtual:tw'

// RoomGrid.vue as <conare-room-grid>: the hero's frame drawn as a room in one-point perspective: the frame its picture plane, the vanishing
// point its centre, the same point Burst's slabs recede to. Orthogonals run from evenly spaced points on every edge to
// the back wall; transversals are the frame scaled about the centre, an equal step deeper each time, so the rings close
// up as floor tiles do. Each wall tile lights a shade above the red under the pointer, and a few light on their own,
// trading places every 600ms while the frame is on screen and the tab visible (never for reduced motion). Lay it in a
// `relative` red frame; the svg is click-through, only the tiles take the pointer.
const ACROSS = 12
const DOWN = 6
const DEPTH = 0.18
const INNER = 0.4

// Paths are joined with + rather than template strings: the registry's class check reads a path command followed by
// an interpolation as a class glued to one.
const orthogonals = (() => {
	let d = ''
	for (let i = 0; i <= ACROSS; i++) {
		const x = -1 + (2 * i) / ACROSS
		d += 'M' + x + ' -1L' + x * INNER + ' ' + -INNER + 'M' + x + ' 1L' + x * INNER + ' ' + INNER
	}
	for (let j = 1; j < DOWN; j++) {
		const y = -1 + (2 * j) / DOWN
		d += 'M-1 ' + y + 'L' + -INNER + ' ' + y * INNER + 'M1 ' + y + 'L' + INNER + ' ' + y * INNER
	}
	return d
})()

const rings = (() => {
	const out: number[] = []
	for (let k = 1; ; k++) {
		const s = 1 / (1 + k * DEPTH)
		if (s < INNER) break
		out.push(Math.round(s * 1e4) / 1e4)
	}
	out.push(INNER)
	return out
})()

// Each cell of the four walls, between two neighbouring orthogonals and two neighbouring rings, as its own quad.
const tiles = (() => {
	const depths = [1, ...rings]
	const xs = Array.from({ length: ACROSS + 1 }, (_, i) => -1 + (2 * i) / ACROSS)
	const ys = Array.from({ length: DOWN + 1 }, (_, j) => -1 + (2 * j) / DOWN)
	type P = [number, number]
	const out: { pts: string, k: number }[] = []
	const r = (n: number) => Math.round(n * 1e4) / 1e4
	const add = (q: P[], k: number) => out.push({ pts: q.map(p => r(p[0]) + ',' + r(p[1])).join(' '), k })
	for (let k = 0; k < depths.length - 1; k++) {
		const a = depths[k]!
		const b = depths[k + 1]!
		for (let i = 0; i < ACROSS; i++) {
			for (const y of [-1, 1]) add([[xs[i]! * a, y * a], [xs[i + 1]! * a, y * a], [xs[i + 1]! * b, y * b], [xs[i]! * b, y * b]], k)
		}
		for (let j = 0; j < DOWN; j++) {
			for (const x of [-1, 1]) add([[x * a, ys[j]! * a], [x * a, ys[j + 1]! * a], [x * b, ys[j + 1]! * b], [x * b, ys[j]! * b]], k)
		}
	}
	return out
})()

// Tile picks: a seeded source when check-parity defines __dsRandom for comparisons; real pages never do.
const random = () => ((globalThis as { __dsRandom?: () => number }).__dsRandom ?? Math.random)()
// A few tiles lit at random from the outer rings (the slabs cover the deeper ones), one swapped every SWAP_MS.
const LIT = 6
const SWAP_MS = 600
const OUTER = 4

/**
 * @summary The hero's red frame as a room in one-point perspective, its tiles lighting.
 */
export class RoomGrid extends DsElement {
	static styles = [DsElement.styles, styles]
	static properties = { lit: { state: true } }

	private lit: number[] = []
	private timer: number | undefined
	private io?: IntersectionObserver
	private visible = false
	private onVisibility = () => this.play(this.visible)

	private pickTile() {
		const pool = tiles.flatMap((t, i) => (t.k < OUTER && !this.lit.includes(i) ? [i] : []))
		return pool[Math.floor(random() * pool.length)]!
	}
	private swap = () => {
		const next = [...this.lit]
		next.splice(Math.floor(random() * next.length), 1, this.pickTile())
		this.lit = next
	}
	private play(on: boolean) {
		window.clearInterval(this.timer)
		if (on && !document.hidden) this.timer = window.setInterval(this.swap, SWAP_MS)
	}

	protected firstUpdated(changed: PropertyValues) {
		super.firstUpdated(changed)
		if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
		for (let n = 0; n < LIT; n++) this.lit = [...this.lit, this.pickTile()]
		this.io = new IntersectionObserver(([e]) => {
			this.visible = !!e?.isIntersecting
			this.play(this.visible)
		})
		const root = this.renderRoot.querySelector('svg')
		if (root) this.io.observe(root)
		document.addEventListener('visibilitychange', this.onVisibility)
	}

	disconnectedCallback() {
		super.disconnectedCallback()
		window.clearInterval(this.timer)
		this.io?.disconnect()
		document.removeEventListener('visibilitychange', this.onVisibility)
	}

	render() {
		const litSet = new Set(this.lit)
		return html`<svg data-ds="room-grid" class="pointer-events-none absolute inset-0 h-full w-full" viewBox="-1 -1 2 2" preserveAspectRatio="none" aria-hidden="true"><g class="ds-room-tiles" pointer-events="fill">${tiles.map((t, i) => svg`<polygon points=${t.pts} data-lit=${litSet.has(i) ? 'true' : nothing}></polygon>`)}</g><g fill="none" stroke="var(--ds-color-off-white)" stroke-width="0.5" stroke-opacity="0.35" vector-effect="non-scaling-stroke"><path d=${orthogonals} vector-effect="non-scaling-stroke"></path>${rings.map((s) => svg`<rect x=${-s} y=${-s} width=${2 * s} height=${2 * s} vector-effect="non-scaling-stroke"></rect>`)}</g></svg>`
	}
}

define('room-grid', RoomGrid)
