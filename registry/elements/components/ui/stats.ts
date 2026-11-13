import { html } from 'lit'
import { DsElement, define } from '@/elements/lib/element'
import styles from 'virtual:tw'

// Stats.vue as <conare-stats>: a row of stats (console2.css .v2-stats): two columns on phones, three from 640px, cells
// split by hairlines. On a phone an odd last stat takes the whole row. Put <conare-stat> inside; four at most.

/**
 * @summary A row of stats, split by hairlines.
 * @slot - <conare-stat> elements.
 */
export class Stats extends DsElement {
	static styles = [DsElement.styles, styles]

	render() {
		return html`<div data-ds="stats" class="ds-stats"><slot></slot></div>`
	}
}

define('stats', Stats)
