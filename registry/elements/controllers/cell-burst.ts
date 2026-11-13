import type { ReactiveController, ReactiveControllerHost } from 'lit'

// useCellBurst for elements: the "infinite cells" geometry behind the website's art (CellBurst, Burst): a level
// rectangle redrawn smaller and smaller as it recedes to a vanishing point at the origin, plus the seeded random source
// that keeps every flavor drawing the same thing, and the two viewport helpers the art waits on, as Lit controllers.
// `el` returns the observed box (an element in the shadow root), read after the first render.

/** A seeded random source (mulberry32), so server and client paths match. */
export function rng(seed: number) {
  let s = seed >>> 0
  return () => {
    s = (s + 0x6D2B79F5) >>> 0
    let t = s
    t = Math.imul(t ^ (t >>> 15), t | 1)
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

// Paths are joined with + rather than template strings: the registry's class check reads a path command followed by
// an interpolation as a class glued to one.
const r1 = (n: number) => Math.round(n * 10) / 10

/**
 * One cell: the face at (x0, y0), w by h, relative to the vanishing point, with its copies `pitch` apart on screen
 * until they reach `inner` of the face's distance. `fill` is the slab's ground, laid under it so it hides what lies
 * behind; `lines` is the hatch.
 */
export function cellPaths(x0: number, y0: number, w: number, h: number, pitch: number, inner: number) {
  // The ground: copies stepping back by a constant fraction, which overlap into one solid shape.
  const dist = Math.hypot(x0 + w / 2, y0 + h / 2)
  const step = 1 - pitch / dist
  let fill = ''
  for (let s = 1; s > inner; s *= step) fill += 'M' + r1(x0 * s) + ' ' + r1(y0 * s) + 'h' + r1(w * s) + 'v' + r1(h * s) + 'h' + r1(-w * s) + 'z'
  // The hatch: each edge redrawn as it recedes, at its own step, so its copies land `pitch` apart all the way in.
  let lines = ''
  const edges = [
    { c: y0, a: x0, len: w, level: true },
    { c: y0 + h, a: x0, len: w, level: true },
    { c: x0, a: y0, len: h, level: false },
    { c: x0 + w, a: y0, len: h, level: false },
  ]
  for (const e of edges) {
    const ds = pitch / Math.abs(e.c)
    for (let s = 1; s > inner; s -= ds) lines += e.level ? 'M' + r1(e.a * s) + ' ' + r1(e.c * s) + 'h' + r1(e.len * s) : 'M' + r1(e.c * s) + ' ' + r1(e.a * s) + 'v' + r1(e.len * s)
  }
  return { fill, lines }
}

/** Halftone squares: dots 4px apart in blocks of 3 by 3, each block one size, growing towards one top corner. */
export const HALFTONE_DOT = 4
export const HALFTONE_BLOCK = 3
const LEVELS = [0.25, 0.45, 0.7, 0.95]
const r2 = (n: number) => Math.round(n * 100) / 100

export function halftone(x: number, y: number, size: number, left: boolean, rand: () => number) {
  const n = Math.max(HALFTONE_BLOCK, Math.floor(size / HALFTONE_DOT))
  const blocks = Math.ceil(n / HALFTONE_BLOCK)
  const tone = Array.from({ length: blocks * blocks }, () => rand())
  let dots = ''
  for (let row = 0; row < n; row++) {
    for (let col = 0; col < n; col++) {
      const across = left ? 1 - col / n : col / n
      const lean = (across + (1 - row / n)) / 2
      const t = tone[Math.floor(row / HALFTONE_BLOCK) * blocks + Math.floor(col / HALFTONE_BLOCK)]!
      const level = LEVELS[Math.min(LEVELS.length - 1, Math.floor((lean * 0.6 + t * 0.4) * LEVELS.length))]!
      const r = (HALFTONE_DOT / 2) * level
      const cx = x + (col + 0.5) * HALFTONE_DOT
      const cy = y + (row + 0.5) * HALFTONE_DOT
      dots += 'M' + r2(cx - r) + ' ' + r2(cy - r) + 'h' + r2(2 * r) + 'v' + r2(2 * r) + 'h' + r2(-2 * r) + 'z'
    }
  }
  const side = n * HALFTONE_DOT
  return { square: 'M' + r2(x) + ' ' + r2(y) + 'h' + side + 'v' + side + 'h' + -side + 'z', dots }
}

/** useNearView: `near` turns true once `el` comes within `margin` of the viewport, and stays. */
export class NearViewController implements ReactiveController {
	near = false
	private io?: IntersectionObserver
	constructor(private host: ReactiveControllerHost, private el: () => Element | null | undefined, private margin = '400px') {
		host.addController(this)
	}
	hostConnected() {
		void this.host.updateComplete.then(() => {
			const el = this.el()
			if (!el || !('IntersectionObserver' in window)) {
				this.near = true
				this.host.requestUpdate()
				return
			}
			this.io = new IntersectionObserver(([e]) => {
				if (!e?.isIntersecting) return
				this.near = true
				this.host.requestUpdate()
				this.io?.disconnect()
			}, { rootMargin: this.margin })
			this.io.observe(el)
		})
	}
	hostDisconnected() {
		this.io?.disconnect()
	}
}

/** useSeen: `seen` turns true once `threshold` of `el` has been on screen, and stays: a window that plays once. */
export class SeenController implements ReactiveController {
	seen = false
	private io?: IntersectionObserver
	constructor(private host: ReactiveControllerHost, private el: () => Element | null | undefined, private threshold = 0.2) {
		host.addController(this)
	}
	hostConnected() {
		void this.host.updateComplete.then(() => {
			const el = this.el()
			if (!el || !('IntersectionObserver' in window)) {
				this.seen = true
				this.host.requestUpdate()
				return
			}
			this.io = new IntersectionObserver(([e]) => {
				if (!e?.isIntersecting) return
				this.seen = true
				this.host.requestUpdate()
				this.io?.disconnect()
			}, { threshold: this.threshold })
			this.io.observe(el)
		})
	}
	hostDisconnected() {
		this.io?.disconnect()
	}
}
