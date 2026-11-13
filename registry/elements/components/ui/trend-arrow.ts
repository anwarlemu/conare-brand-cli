import { html, nothing, svg } from 'lit'
import { DsElement, define } from '@/elements/lib/element'
import styles from 'virtual:tw'

// TrendArrow.vue as <conare-trend-arrow>: the way a number moved, in the website button's pixel arrow
// (usage/TrendArrow.vue): lit squares on a grid of dim ones, red going up, ink going down (turned over). `bare` is a
// solid pixel triangle with no grid, for beside a stat. It holds still: icons never move on hover.

const CELL = 3
const SIZE = 5
const GRID = Array.from({ length: SIZE * SIZE }, (_, k) => [k % SIZE, Math.floor(k / SIZE)] as const)
// [column, row] of the lit squares, pointing up.
const ARROW: Array<[number, number]> = [[2, 0], [1, 1], [2, 1], [3, 1], [0, 2], [2, 2], [4, 2], [2, 3], [2, 4]]
const TRIANGLE: Array<[number, number]> = [[2, 0], [1, 1], [2, 1], [3, 1], [0, 2], [1, 2], [2, 2], [3, 2], [4, 2]]

/** @summary A pixel arrow: red going up, ink going down. */
export class TrendArrow extends DsElement {
	static styles = [DsElement.styles, styles]
	static properties = { down: { type: Boolean }, bare: { type: Boolean } }

	/** Going down: ink, turned over. */
	down = false
	/** A solid triangle with no grid, beside a stat. */
	bare = false

	render() {
		const bare = this.bare
		const rows = bare ? 3 : SIZE
		const ink = bare ? CELL : 2
		const wide = SIZE * CELL - (bare ? 0 : 1)
		const tall = rows * CELL - (bare ? 0 : 1)
		const lit = bare ? TRIANGLE : ARROW
		return html`<svg data-ds="trend-arrow" class=${['shrink-0 overflow-hidden', this.down ? 'rotate-180' : ''].join(' ')} width=${wide} height=${tall} viewBox=${`0 0 ${wide} ${tall}`} aria-hidden="true">
			${bare ? nothing : svg`<g class="fill-ds-neutral-700">${GRID.map(([x, y]) => svg`<rect x=${x * CELL} y=${y * CELL} width="2" height="2"></rect>`)}</g>`}
			<g class=${this.down ? 'fill-fg' : 'fill-edge-accent'}>${lit.map(([x, y]) => svg`<rect x=${x * CELL} y=${y * CELL} width=${ink} height=${ink}></rect>`)}</g>
		</svg>`
	}
}

define('trend-arrow', TrendArrow)
