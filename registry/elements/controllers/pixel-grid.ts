import type { ReactiveController, ReactiveControllerHost } from 'lit'

// usePixelGrid as a Lit controller: 6px squares laid over an element, each with its own delay in and out, from the same
// seed as the website's, so the buttons feel like one product. It lays them again on resize. `el` returns the box
// (an element in the shadow root), read after the first render.
const PX = 6

/** A seeded random source (mulberry32), the same as the website's, so every button scatters the same way. */
function rng(seed: number) {
	let s = seed >>> 0
	return () => {
		s = (s + 0x6d2b79f5) >>> 0
		let t = s
		t = Math.imul(t ^ (t >>> 15), t | 1)
		t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
		return ((t ^ (t >>> 14)) >>> 0) / 4294967296
	}
}

export interface PixelGrid { cols: number, w: number, h: number, cells: Array<Record<string, number>> }

export class PixelGridController implements ReactiveController {
	grid: PixelGrid | null = null
	private ro?: ResizeObserver
	constructor(private host: ReactiveControllerHost & HTMLElement, private el: () => HTMLElement | null | undefined) {
		host.addController(this)
	}
	hostConnected() {
		void this.host.updateComplete.then(() => {
			const box = this.el()
			if (!box) return
			this.lay()
			this.ro = new ResizeObserver(() => this.lay())
			this.ro.observe(box)
		})
	}
	hostDisconnected() {
		this.ro?.disconnect()
	}
	private lay() {
		const box = this.el()
		if (!box) return
		const rect = box.getBoundingClientRect()
		const w = rect.width - (box.offsetWidth - box.clientWidth)
		const h = rect.height - (box.offsetHeight - box.clientHeight)
		if (this.grid?.w === w && this.grid.h === h) return
		const cols = Math.ceil(w / PX)
		const rows = Math.ceil(h / PX)
		const rand = rng(29)
		this.grid = {
			cols,
			w,
			h,
			cells: Array.from({ length: cols * rows }, (_, k) => {
				// Eased along the button, so the front starts quick and settles.
				const e = 1 - (1 - (k % cols) / cols) ** 1.6
				return { '--i': Math.round(e * 60 + rand() * 20), '--o': Math.round(e * 50 + rand() * 20) }
			}),
		}
		this.host.requestUpdate()
	}
	/** The fill's grid template, as a style string. */
	get style() {
		return this.grid ? `grid-template-columns: repeat(${this.grid.cols}, ${PX}px); grid-auto-rows: ${PX}px` : ''
	}
}

/** A cell's custom properties as a style string ({ '--i': 12 } -> "--i: 12"). */
export const vars = (cell: Record<string, number | string>) => Object.entries(cell).map(([k, v]) => `${k}: ${v}`).join('; ')
