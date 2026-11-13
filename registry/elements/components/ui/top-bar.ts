import { html } from 'lit'
import { DsElement, define } from '@/elements/lib/element'
import styles from 'virtual:tw'

// TopBar.vue as <conare-top-bar>: the 48px bar over every console page (console2.css .v2-bar): sticky, a hairline
// under it, the page showing faintly through it (92% of the surface under an 8px blur), 12px text. Put a
// <conare-breadcrumb> in it; the `start` slot holds the phone's menu button, `end` what belongs to the whole console
// (setup progress, a loading mark), never the page's own actions. The host is the bar (a banner landmark, as Vue's
// <header> is), so classes on it land on the bar.

/**
 * @summary The bar over every console page, with where you are.
 * @slot - A <conare-breadcrumb>.
 * @slot start - The phone's menu button.
 * @slot end - What belongs to the whole console.
 */
export class TopBar extends DsElement {
	static styles = [DsElement.styles, styles]
	private internals = this.attachInternals()

	connectedCallback() {
		super.connectedCallback()
		this.internals.role = 'banner'
	}

	render() {
		return html`<slot name="start"></slot><slot></slot><slot name="end"></slot>`
	}
}

define('top-bar', TopBar)
