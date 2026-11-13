import { html } from 'lit'
import { DsElement, define } from '@/elements/lib/element'
import styles from 'virtual:tw'

// Grain.vue as <conare-grain>: the website's grain (home.css .footer-grain): the brand texture tiled at 12% of the
// panel, laid over a dark or red ground at 30%. Decorative; put it first inside a `relative` panel.

/**
 * @summary The website's grain texture over a panel.
 */
export class Grain extends DsElement {
	static styles = [DsElement.styles, styles]

	render() {
		return html`<span data-ds="grain" aria-hidden="true" class="ds-grain pointer-events-none absolute inset-0 opacity-30"></span>`
	}
}

define('grain', Grain)
