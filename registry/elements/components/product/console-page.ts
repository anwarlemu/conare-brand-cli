import { html, nothing } from 'lit'
import { DsElement, define } from '@/elements/lib/element'
import styles from 'virtual:tw'

// ConsolePage.vue as <conare-console-page>: the frame of every console page (Page.vue, .v2-page .v2-page-wide): 1120px at most, 32px down and 16px in on a
// phone (40px and 32px from 768px), the title in Faculty Glyphic 20px (or Geist Mono when it is an identifier, shown
// as typed), the page's actions on the right, then the body in 24px steps.
// `heading` is Vue's `title`; `rootName` sets the root's data-ds, as a data-ds passed to the Vue component does.

/**
 * @summary The frame of every console page: the title, its actions, then the body.
 * @slot - The body, in 24px steps.
 * @slot meta - Beside the title.
 * @slot actions - The page's actions on the right.
 */
export class ConsolePage extends DsElement {
	static styles = [DsElement.styles, styles]
	static properties = { heading: {}, mono: { type: Boolean }, rootName: { attribute: false } }

	/** The page's title (Vue's `title`). */
	heading = ''
	/** The title is an identifier: Geist Mono, as typed. */
	mono = false
	/** The root's data-ds, for a page built on this one (Vue's fallthrough data-ds). */
	rootName = 'console-page'

	render() {
		return html`<div data-ds="${this.rootName}" class="mx-auto w-full max-w-page-wide px-4 pt-8 pb-16 md:px-8 md:pt-10 md:pb-20"><header class="mb-6 flex min-h-8 flex-wrap items-center justify-between gap-x-6 gap-y-3"><div class="flex min-w-0 flex-wrap items-center gap-x-4 gap-y-2"><h1 class=${this.mono ? 'min-w-0 font-code text-heading-3 leading-8 font-medium [overflow-wrap:anywhere]' : 'min-w-0 type-heading-3'}>${this.heading}</h1><slot name="meta"></slot></div>${this.hasSlot('actions') ? html`<div class="flex flex-wrap items-center gap-2"><slot name="actions"></slot></div>` : nothing}</header><div class="flex flex-col gap-6"><slot></slot></div></div>`
	}
}

define('console-page', ConsolePage)
