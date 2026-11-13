import { html } from 'lit'
import { DsElement, define } from '@/elements/lib/element'
import styles from 'virtual:tw'

// ShimmerText.vue as <conare-shimmer-text>: a few words that say something is working (console2.css .v2-shimmer): a
// lighter band runs across the muted text, right to left every 1.4s, for as long as the work does. Take it away when
// the work is done. Reduced motion shows the words still, in the muted grey. Wrap the sentence in role="status" so the
// change is read out.

/**
 * @summary Words that shimmer while something works.
 * @slot - The words.
 */
export class ShimmerText extends DsElement {
	static styles = [DsElement.styles, styles]

	render() {
		return html`<span data-ds="shimmer-text" class="ds-shimmer"><slot></slot></span>`
	}
}

define('shimmer-text', ShimmerText)
