import { html } from 'lit'
import { DsElement, define } from '@/elements/lib/element'
import styles from 'virtual:tw'

// MenuLabel.vue as <conare-menu-label>: a group's name in a menu (console2.css .v2-menu-label): 12px muted, an
// optional tag at the end.

/**
 * @summary A group's name in a menu.
 * @slot - The name, and a tag if any.
 */
export class MenuLabel extends DsElement {
	static styles = [DsElement.styles, styles]
	render() {
		return html`<p data-ds="menu-label" class="flex items-center justify-between gap-2 pt-1.5 pr-2.5 pb-1 pl-3.5 text-meta text-fg-muted"><slot></slot></p>`
	}
}

define('menu-label', MenuLabel)
