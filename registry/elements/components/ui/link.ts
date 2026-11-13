import { html } from 'lit'
import { ifDefined } from 'lit/directives/if-defined.js'
import { DsElement, define } from '@/elements/lib/element'
import styles from 'virtual:tw'

// Link.vue as <conare-link>: text that goes somewhere (console2.css .v2-link): ink with a quiet #C3C1BF underline 4px
// under it that turns ink on hover, in 200ms. `more` is the quiet link under a list (.v2-more): 12px medium, soft grey
// to ink, no underline, and a button unless it has an href. Vue's `as` (a router link) has no equivalent: a router
// that intercepts anchors (most do) works with the inner <a>. The host passes its colour to the link (a class such as
// text-fg on the element reaches it).

/**
 * @summary Text that goes somewhere.
 * @slot - The link's text.
 * @fires click - When pressed (the native click).
 */
export class Link extends DsElement {
	static styles = [DsElement.styles, styles]
	static properties = { href: {}, more: { type: Boolean }, target: {}, rel: {} }

	href?: string
	/** The quiet link under a list (a button unless it has an href). */
	more = false
	target?: string
	rel?: string

	render() {
		if (this.more && !this.href) return html`<button data-ds="link" type="button" class="ds-more"><slot></slot></button>`
		return html`<a data-ds="link" href=${ifDefined(this.href)} target=${ifDefined(this.target)} rel=${ifDefined(this.rel)} class=${this.more ? 'ds-more' : 'ds-link'}><slot></slot></a>`
	}
}

define('link', Link)
