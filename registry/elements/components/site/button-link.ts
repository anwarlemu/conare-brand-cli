import { html, nothing, svg } from 'lit'
import { ifDefined } from 'lit/directives/if-defined.js'
import { DsElement, define } from '@/elements/lib/element'
import { PixelGridController, vars } from '@/elements/controllers/pixel-grid'
import styles from 'virtual:tw'

// ButtonLink.vue as <conare-button-link>: the website's button (home.css .btn-px): a square link, 36px with a 13px
// label (28px and 12px when small), whose hover is a fill of 6px squares coming in from the left with a little scatter
// and going out the same way; the label never changes size or weight. red is the flat red block (its squares come in
// black); secondary is outlined (its border turns red, the squares red); light and ghost are for a dark band. `pixels`
// is the dark main call to action (black, red squares); `arrow` adds the pixel arrow, lit and still. `grain` lays the
// footer's grain over the button. `fill="black"` brings the squares in black, for a light button on a red band. Where
// the label changes colour over the fill (secondary, light), each column of squares carries its own off-white copy of
// the label, so the label turns as the squares land and never fades through grey.
export type ButtonLinkVariant = 'red' | 'secondary' | 'light' | 'ghost'

const PX = 6
// The arrow's lit cells on a 5 by 5 of dim ones, as [column, row]; each cell is 2px and a 1px gap.
const ARROW = [[2, 0], [3, 1], [0, 2], [1, 2], [2, 2], [3, 2], [4, 2], [3, 3], [2, 4]] as const
const CELL = 3

/**
 * @summary The website's square link button, its hover a fill of 6px squares.
 * @slot - The label.
 */
export class ButtonLink extends DsElement {
	static styles = [DsElement.styles, styles]
	static properties = {
		href: {},
		variant: {},
		size: {},
		pixels: { type: Boolean },
		arrow: { type: Boolean },
		grain: { type: Boolean },
		fill: {},
		armed: { state: true },
	}

	href = ''
	/** red, secondary, light or ghost. */
	variant: ButtonLinkVariant = 'red'
	/** md (36px) or sm (28px). */
	size: 'sm' | 'md' = 'md'
	/** The dark main call to action: black, red squares. */
	pixels = false
	/** The pixel arrow, lit and still. */
	arrow = false
	/** The footer's grain over the button. */
	grain = false
	/** "black" brings the squares in black, for a light button on a red band. */
	fill?: 'black'
	private armed = false
	private text = ''

	private grid = new PixelGridController(this, () => this.renderRoot.querySelector<HTMLElement>('.ds-btnlink'))

	private get inks() {
		return !this.pixels && (this.variant === 'secondary' || this.variant === 'light')
	}

	// The copies are made the first time the pointer or focus arrives, from the label's text.
	private arm() {
		if (this.armed || !this.inks) return
		this.text = this.textContent?.trim() ?? ''
		this.armed = true
	}

	render() {
		const g = this.grid.grid
		const inks = this.inks
		const arm = () => this.arm()
		return html`<a data-ds="button-link" href=${this.href} class="ds-btnlink" data-variant=${this.pixels ? 'dark' : this.variant} data-size=${this.size} data-grain=${ifDefined(this.grain ? 'true' : undefined)} data-arrow=${ifDefined(this.arrow ? 'true' : undefined)} data-fill=${ifDefined(this.fill)} @pointerenter=${arm} @pointerdown=${arm} @focus=${arm}>
			${g ? html`<span aria-hidden="true" class="ds-btnlink-fill" data-inks=${ifDefined(inks ? 'true' : undefined)} style=${this.grid.style}>${g.cells.map((c) => html`<i style=${vars(c)}></i>`)}</span>` : nothing}
			${g && inks && this.armed
				? html`<span aria-hidden="true" class="ds-btnlink-inks" style=${`grid-template-columns: repeat(${g.cols}, ${PX}px)`}>${Array.from({ length: g.cols }, (_, c) => html`<i style=${vars(g.cells[c]!)}><span class="ds-btnlink-ink" style=${`width: ${g.w}px; height: ${g.h}px; transform: translateX(${-c * PX}px)`}><span class="ds-btnlink-label">${this.text}</span></span></i>`)}</span>`
				: nothing}
			<span class="ds-btnlink-label"><slot></slot></span>
			${this.arrow
				? html`<svg aria-hidden="true" class="ds-btnlink-arrow" viewBox=${`0 0 ${5 * CELL - 1} ${5 * CELL - 1}`} width="11" height="11">
						<g class="ds-btnlink-arrow-dim">${[0, 1, 2, 3, 4].flatMap((c) => [0, 1, 2, 3, 4].map((r) => svg`<rect x=${c * CELL} y=${r * CELL} width=${CELL - 1} height=${CELL - 1}></rect>`))}</g>
						<g class="ds-btnlink-arrow-lit">${ARROW.map(([c, r]) => svg`<rect x=${c * CELL} y=${r * CELL} width=${CELL - 1} height=${CELL - 1}></rect>`)}</g>
					</svg>`
				: nothing}
		</a>`
	}
}

define('button-link', ButtonLink)
