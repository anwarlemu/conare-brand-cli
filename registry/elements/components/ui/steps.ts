import { html } from 'lit'
import { DsElement, define } from '@/elements/lib/element'
import styles from 'virtual:tw'

// Steps.vue as <conare-steps>: steps that open one at a time (console2.css .v2-movesteps): <conare-step> rows, each
// over a hairline.

/**
 * @summary Steps that open one at a time.
 * @slot - <conare-step> elements.
 */
export class Steps extends DsElement {
	static styles = [DsElement.styles, styles]

	render() {
		return html`<ol class="contents"><slot></slot></ol>`
	}
}

define('steps', Steps)
