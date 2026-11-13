import { html, nothing } from 'lit'
import { ifDefined } from 'lit/directives/if-defined.js'
import { ArrowRight } from 'lucide'
import { DsElement, define } from '@/elements/lib/element'
import { icon } from '@/elements/lib/icon'
import styles from 'virtual:tw'

// Door.vue as <conare-door>: a whole card that opens something (console2.css .v2-door), such as Connect an app or Send
// by API. Its border turns ink under the pointer and while what it opens is open (`expanded`). One link or one button.
// Vue's `icon` prop is the `icon` slot here: a 14px Lucide svg with stroke-width 1.5.

/**
 * @summary A whole card that opens something.
 * @slot - Replaces the description.
 * @slot icon - A 14px Lucide icon before the title.
 * @fires click - When pressed.
 */
export class Door extends DsElement {
	static styles = [DsElement.styles, styles]
	static properties = { heading: {}, description: {}, href: {}, arrow: { type: Boolean }, expanded: { type: Boolean } }

	/** The title (Vue's `title`; `title` is HTML's tooltip attribute). */
	heading = ''
	description?: string
	href?: string
	/** An arrow at the end of the title. */
	arrow = false
	/** What it opens is open (aria-expanded). */
	expanded = false

	render() {
		const classes = 'flex cursor-pointer flex-col gap-1 border border-edge bg-surface p-3 text-left transition-[border-color,background-color] duration-120 ease-standard hover:border-edge-focus active:bg-surface-subtle aria-expanded:border-edge-focus'
		const body = this.description || this.hasSlot()
		const content = html`<span class="flex items-center gap-2 type-ui-strong"><slot name="icon"></slot>${this.heading}${this.arrow ? icon(ArrowRight, 'arrow-right', { size: 12, strokeWidth: 1.5, class: 'ml-auto text-fg-muted', attrs: { 'aria-hidden': 'true' } }) : nothing}</span>${body ? html`<span class="type-meta text-fg-muted"><slot>${this.description}</slot></span>` : nothing}`
		return this.href
			? html`<a data-ds="door" href=${this.href} class=${classes}>${content}</a>`
			: html`<button data-ds="door" type="button" aria-expanded=${ifDefined(this.expanded === undefined ? undefined : String(this.expanded))} class=${classes}>${content}</button>`
	}
}

define('door', Door)
