import { html, nothing } from 'lit'
import { DsElement, define } from '@/elements/lib/element'
import styles from 'virtual:tw'

// AccuracyThumb.vue as <conare-accuracy-thumb>: A document's page drawn small (the console's SearchPagePreview at thumb size): 28 by 36, a running head, eleven
// rules, and the passage where it sits as a band of darker rules on the red tint with a 2px red edge. A picture: the
// text beside it says the page number.
const WIDTHS = [100, 97, 99, 94, 100, 62, 0, 98, 100, 95, 100, 71, 0]
const COUNT = 11

/**
 * @summary A document's page drawn small, its passage marked.
 */
export class AccuracyThumb extends DsElement {
	static styles = [DsElement.styles, styles]
	static properties = { number: { type: Number }, top: { type: Number } }

	/** The page number (it picks the rules' widths). */
	number = 1
	/** Where the passage sits, 0 to 1 down the page. */
	top = 0

	render() {
		const at = Math.min(COUNT - 3, Math.round(this.top * COUNT))
		const lines = Array.from({ length: COUNT }, (_, i) => ({ w: WIDTHS[(i + this.number * 3) % WIDTHS.length]!, hit: i >= at && i < at + 2, first: i === at }))
		return html`<span data-ds="accuracy-thumb" class="ds-thumb" aria-hidden="true"><span class="ds-thumb-head"></span>${lines.map((l) => (l.first ? html`<span class="ds-thumb-hit"><span class="ds-thumb-line w-full"></span><span class="ds-thumb-line w-[68%]"></span></span>` : !l.hit ? html`<span class="ds-thumb-line" style="width: ${l.w}%" ?data-gap=${l.w === 0}></span>` : nothing))}</span>`
	}
}

define('accuracy-thumb', AccuracyThumb)
