import { html } from 'lit'
import { DsElement, define } from '@/elements/lib/element'
import styles from 'virtual:tw'

// ItemGroup.vue as <conare-item-group>: rows of one list, a hairline between each (console2.css .v2-rows). Put
// <conare-item> rows in it, one per <li>.

/**
 * @summary Rows of one list, a hairline between each.
 * @slot - <li> elements, each holding a <conare-item>.
 */
export class ItemGroup extends DsElement {
	static styles = [DsElement.styles, styles]

	render() {
		return html`<ul class="contents"><slot></slot></ul>`
	}
}

define('item-group', ItemGroup)
