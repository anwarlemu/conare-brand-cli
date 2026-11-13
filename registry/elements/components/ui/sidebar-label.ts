import { html } from 'lit'
import { DsElement, define } from '@/elements/lib/element'
import styles from 'virtual:tw'

// SidebarLabel.vue as <conare-sidebar-label>: a group's name in the sidebar (console2.css .v2-nav-label): 12px muted,
// 16px over it.

/**
 * @summary A group's name in the sidebar.
 * @slot - The name.
 */
export class SidebarLabel extends DsElement {
	static styles = [DsElement.styles, styles]
	render() {
		return html`<p data-ds="sidebar-label" class="px-3 pt-4 pb-1 text-meta text-fg-muted"><slot></slot></p>`
	}
}

define('sidebar-label', SidebarLabel)
