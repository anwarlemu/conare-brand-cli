import { html } from 'lit'
import { DsElement, define } from '@/elements/lib/element'
import styles from 'virtual:tw'

// MenuSeparator.vue as <conare-menu-separator>: a hairline between a menu's groups, edge to edge
// (console2.css .v2-menu-sep).

/** @summary A hairline between a menu's groups. */
export class MenuSeparator extends DsElement {
	static styles = [DsElement.styles, styles]
	render() {
		return html`<div data-ds="menu-separator" class="-mx-1 my-1 h-px bg-edge" role="separator"></div>`
	}
}

define('menu-separator', MenuSeparator)
