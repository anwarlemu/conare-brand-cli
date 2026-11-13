import { html } from 'lit'
import { DsElement, define } from '@/elements/lib/element'
import styles from 'virtual:tw'

// DotMatrix.vue as <conare-dot-matrix>: the website's dot-matrix loader (console2.css .v2-matrix): a 3 by 3 of 2px
// squares that blink in a sweep, for anything at work (a search, a sync). Put it beside the word for what is working;
// show it only after 300ms. Reduced motion holds it still. `tone="inverse"` is for a dark ground (a working tag, a dark
// button). The host is the grid (dot-matrix.css), so a class on it (a margin) lands as one on <DotMatrix> does.
const ORDER = [0, 1, 2, 7, 8, 3, 6, 5, 4]

/**
 * @summary A 3 by 3 of squares that blink while something works.
 */
export class DotMatrix extends DsElement {
	static styles = [DsElement.styles, styles]
	static properties = { tone: { reflect: true } }

	/** `inverse` on a dark ground. */
	tone?: 'default' | 'inverse'

	connectedCallback() {
		super.connectedCallback()
		this.setAttribute('aria-hidden', 'true')
	}

	render() {
		return html`${ORDER.map((k) => html`<i style="--k: ${k}"></i>`)}`
	}
}

define('dot-matrix', DotMatrix)
