import { html, nothing, type PropertyValues } from 'lit'
import { DsElement, define } from '@/elements/lib/element'
import styles from 'virtual:tw'

// Sidebar.vue as <conare-sidebar>: the console's navigation (console2.css .v2-side): 216px of paper with a hairline at
// its edge. Put a <conare-sidebar-label> over each group and a <conare-sidebar-link> per page; the `head` slot holds
// the workspace switcher (48px, over a hairline) and `foot` the account menu. It stays open on wide screens; on a
// phone the app shows it as a drawer over the page. The host is the column (a navigation landmark named by `label`,
// as Vue's <nav> is), so classes on it land on the column.

/**
 * @summary The console's navigation column.
 * @slot - Labels and links.
 * @slot head - The workspace switcher.
 * @slot foot - The account menu.
 */
export class Sidebar extends DsElement {
	static styles = [DsElement.styles, styles]
	static properties = { label: {} }

	/** The navigation's name for assistive tech (main by default). */
	label?: string
	private internals = this.attachInternals()

	connectedCallback() {
		super.connectedCallback()
		this.internals.role = 'navigation'
	}
	protected willUpdate(changed: PropertyValues<this>) {
		if (changed.has('label') || !this.hasUpdated) this.internals.ariaLabel = this.label ?? 'main'
	}

	render() {
		return html`${this.hasSlot('head') ? html`<div class="h-bar shrink-0 border-b border-edge"><slot name="head"></slot></div>` : nothing}<div class="flex min-h-0 flex-1 flex-col overflow-y-auto pb-4"><slot></slot></div>${this.hasSlot('foot') ? html`<div class="shrink-0 border-t border-edge"><slot name="foot"></slot></div>` : nothing}`
	}
}

define('sidebar', Sidebar)
