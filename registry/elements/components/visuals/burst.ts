import { html, nothing, svg, type PropertyValues } from 'lit'
import { DsElement, define } from '@/elements/lib/element'
import { HALFTONE_BLOCK, HALFTONE_DOT, cellPaths, halftone, rng } from '@/elements/controllers/cell-burst'
import styles from 'virtual:tw'

// Burst.vue as <conare-burst>: the brand pattern in the hero's frame, "infinite cells" (Burst.vue): every ray is one cell, a level rectangle out
// near the frame's edge, redrawn over and over as it recedes to a vanishing point at the centre. The copies' edges make
// the hatch; no outline is drawn and the cells are never rotated. A fixed seed keeps server and client identical.
// `inner`: how far in the copies run (small and the slabs meet at the centre). `corners`: a halftone square in each
// face's outer top corner, kept clear of the frame's edges and of a sibling marked `data-burst-clear` (the hero's
// window). Lay it in a `relative` red frame (`text-ds-neutral-300` sets the hatch's colour); it is decorative.
// The marked sibling is looked for among the host's parent's descendants. Its fade-in class (ds-art-in) is styled only
// where cell-burst's sheet is, as in Vue, so it draws at once.

// Gap between copies at the face, in viewBox units (1px at full width), and the corner square's share of a face.
const PITCH = 2
const CORNER = 0.38
const MIN_SIDE = HALFTONE_BLOCK * HALFTONE_DOT

type Face = { x0: number, y0: number, w: number, h: number }
// What the frame shows, in viewBox units, and the box the marked sibling covers; measured on the page.
type Box = { x0: number, y0: number, x1: number, y1: number }
type View = { hw: number, hh: number, cover: Box | null }

function facesOf(seed: number, rays: number) {
	const rand = rng(seed)
	const out: Face[] = []
	for (let i = 0; i < rays; i++) {
		// Even spread with a little jitter; the first ray leans off the horizontal so no face sits dead level.
		const a = ((i + 0.3 + (rand() - 0.5) * 0.4) / rays) * Math.PI * 2
		const ux = Math.cos(a)
		const uy = Math.sin(a)
		// Reach follows an ellipse the frame's shape, a step inside its border.
		const reach = 1 / Math.hypot(ux / 560, uy / 282)
		const w = reach * (0.1 + rand() * 0.2)
		const h = reach * (0.1 + rand() * 0.2)
		const dist = reach * (0.94 + rand() * 0.06) - Math.max(w, h) / 2
		out.push({ x0: ux * dist - w / 2, y0: uy * dist - h / 2, w, h })
	}
	return out
	return out
}

// Each face's square, snapped to whole dots; where the marked sibling covers it, it shrinks a dot at a time, then
// tries the bottom corner; none if neither shows enough of the face.
function cornersOf(seed: number, faces: Face[], view: View) {
	const tones = rng(seed + 1)
	const { hw, hh, cover } = view
	const hidden = (x: number, y: number, side: number) => !!cover && x < cover.x1 && x + side > cover.x0 && y < cover.y1 && y + side > cover.y0
	return faces.map(({ x0, y0, w, h }) => {
		const left = x0 + w / 2 < 0
		const fx0 = Math.max(x0, -hw)
		const fx1 = Math.min(x0 + w, hw)
		const fy0 = Math.max(y0, -hh)
		const fy1 = Math.min(y0 + h, hh)
		const full = Math.max(MIN_SIDE, Math.floor((Math.min(w, h) * CORNER) / HALFTONE_DOT) * HALFTONE_DOT)
		for (const atTop of [true, false]) {
			for (let side = full; side >= MIN_SIDE; side -= HALFTONE_DOT) {
				const x = left ? fx0 : fx1 - side
				const y = atTop ? fy0 : fy1 - side
				if (x < fx0 || x + side > fx1 || y < fy0 || y + side > fy1 || hidden(x, y, side)) continue
				return halftone(x, y, side, left, tones)
			}
		}
		return undefined
	})
}

/** The view and cover, measured: `el` the svg, `clear` the marked sibling's box. */
function measureView(el: Element, clear: DOMRect | undefined): View | null {
	if (!el.clientWidth || !el.clientHeight) return null
	const scale = Math.max(el.clientWidth / 1200, el.clientHeight / 606)
	const box = el.getBoundingClientRect()
	const at = (px: number, py: number) => [(px - box.left - box.width / 2) / scale, (py - box.top - box.height / 2) / scale] as const
	let cover: Box | null = null
	if (clear) {
		const [x0, y0] = at(clear.left, clear.top)
		const [x1, y1] = at(clear.right, clear.bottom)
		cover = { x0, y0, x1, y1 }
	}
	return { hw: el.clientWidth / scale / 2, hh: el.clientHeight / scale / 2, cover }
}

/**
 * @summary The hero's infinite cells: slabs receding to a vanishing point.
 */
export class Burst extends DsElement {
	static styles = [DsElement.styles, styles]
	static properties = { seed: { type: Number }, rays: { type: Number }, inner: { type: Number }, corners: { type: Boolean }, view: { state: true }, drawn: { state: true } }

	/** The same seed draws the same slabs. */
	seed = 7
	rays = 14
	/** How far in the copies run (small and the slabs meet at the centre). */
	inner = 0.42
	/** A halftone square in each face's outer top corner, clear of a sibling marked data-burst-clear. */
	corners = false
	private view: View = { hw: 600, hh: 303, cover: null }
	private drawn = false
	private ro?: ResizeObserver

	private measure = () => {
		const el = this.renderRoot.querySelector('svg')
		if (!el) return
		const v = measureView(el, this.parentElement?.querySelector('[data-burst-clear]')?.getBoundingClientRect())
		if (v) this.view = v
	}

	protected firstUpdated(changed: PropertyValues) {
		super.firstUpdated(changed)
		// The slabs are drawn in the browser (thousands of hatch copies would fill the page's HTML).
		this.drawn = true
		if (!this.corners) return
		this.measure()
		this.ro = new ResizeObserver(this.measure)
		const el = this.renderRoot.querySelector('svg')
		if (el) this.ro.observe(el)
		const clear = this.parentElement?.querySelector('[data-burst-clear]')
		if (clear) this.ro.observe(clear)
	}

	disconnectedCallback() {
		super.disconnectedCallback()
		this.ro?.disconnect()
	}

	render() {
		const faces = facesOf(this.seed, this.rays)
		const cells = faces.map((f) => cellPaths(f.x0, f.y0, f.w, f.h, PITCH, this.inner))
		const squares = this.corners ? cornersOf(this.seed, faces, this.view) : []
		return html`<svg data-ds="burst" class="pointer-events-none absolute inset-0 h-full w-full" viewBox="-600 -303 1200 606" preserveAspectRatio="xMidYMid slice" aria-hidden="true">${(this.drawn ? cells : []).map((c, i) => svg`<g class="ds-art-in"><path d=${c.fill} fill="var(--ds-color-off-white)"></path><path d=${c.lines} fill="none" stroke="currentColor" stroke-width="0.5" stroke-opacity="0.55" vector-effect="non-scaling-stroke"></path>${squares[i] ? svg`<path d=${squares[i]!.square} fill="var(--ds-color-red-wash)"></path><path d=${squares[i]!.dots} fill="var(--ds-color-home-red)"></path>` : nothing}</g>`)}</svg>`
	}
}

define('burst', Burst)
