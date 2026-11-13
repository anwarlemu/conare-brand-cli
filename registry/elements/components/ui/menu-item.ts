import { html, LitElement } from 'lit'
import { ifDefined } from 'lit/directives/if-defined.js'
import { DsElement, define, tagName } from '@/elements/lib/element'
import styles from 'virtual:tw'

// MenuItem.vue as <conare-menu-item>: one row of a menu (console2.css .v2-menu-item): 32px (44px on phones), 13px, a
// 14px gutter that holds the 4px red square marker of the row under the pointer or focus, which also takes the paper
// fill. `current` sets it in medium weight; `danger` is Sign out's red. Put a 14px Lucide icon first, a count or a check
// last. Choosing it fires `select` and closes its <conare-menu>, unless `keep-open`.

/**
 * @summary One row of a menu.
 * @slot - The row: an icon, the label, a count or a check.
 * @fires select - The row was chosen.
 */
export class MenuItem extends DsElement {
	static styles = [DsElement.styles, styles]
	static shadowRootOptions = { ...LitElement.shadowRootOptions, delegatesFocus: true }
	static properties = { href: {}, current: { type: Boolean }, danger: { type: Boolean }, disabled: { type: Boolean, reflect: true }, keepOpen: { type: Boolean, attribute: 'keep-open' } }

	href?: string
	/** The current choice, in medium weight. */
	current = false
	/** Sign out's red. */
	danger = false
	disabled = false
	/** Choosing it leaves the menu open. */
	keepOpen = false

	private choose = () => {
		this.emit('select')
		if (!this.keepOpen) (this.closest(tagName('menu')) as (HTMLElement & { close?: (refocus?: boolean) => void }) | null)?.close?.(true)
	}

	render() {
		const current = this.current ? 'true' : undefined
		return this.href
			? html`<a data-ds="menu-item" href=${this.href} role="menuitem" class="ds-menu-item" aria-current=${ifDefined(current)} ?data-danger=${this.danger} @click=${this.choose}><slot></slot></a>`
			: html`<button data-ds="menu-item" type="button" role="menuitem" class="ds-menu-item" aria-current=${ifDefined(current)} ?data-danger=${this.danger} ?disabled=${this.disabled} @click=${this.choose}><slot></slot></button>`
	}
}

define('menu-item', MenuItem)
