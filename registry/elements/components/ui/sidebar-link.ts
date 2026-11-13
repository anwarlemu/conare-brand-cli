import { html, nothing } from 'lit'
import { ifDefined } from 'lit/directives/if-defined.js'
import { DsElement, define } from '@/elements/lib/element'
import styles from 'virtual:tw'

// SidebarLink.vue as <conare-sidebar-link>: one page in the sidebar (console2.css .v2-nav-link): a 28px row (44px on
// phones) with its 14px icon (an svg in the `icon` slot), the label and a count or health at the end. The page you are
// on sits on white in a hairline, in medium, with a 2px red edge at the sidebar's side. `alert` turns the count red
// when something failed.

/**
 * @summary One page in the sidebar.
 * @slot - The label.
 * @slot icon - A 14px Lucide icon.
 */
export class SidebarLink extends DsElement {
	static styles = [DsElement.styles, styles]
	static properties = { href: {}, active: { type: Boolean, reflect: true }, status: {}, alert: { type: Boolean } }

	href?: string
	/** The page you are on. */
	active = false
	/** A count or health at the end. */
	status?: string
	/** The count in red: something failed. */
	alert = false

	render() {
		return html`<a data-ds="sidebar-link" href=${ifDefined(this.href)} class="ds-navlink" ?data-active=${this.active} aria-current=${ifDefined(this.active ? 'page' : undefined)}><slot name="icon"></slot><span class="min-w-0 flex-1 truncate"><slot></slot></span>${this.status ? html`<span class=${['text-meta tabular-nums', this.alert ? 'text-home-red-press' : 'text-fg-muted'].join(' ')}>${this.status}</span>` : nothing}</a>`
	}
}

define('sidebar-link', SidebarLink)
