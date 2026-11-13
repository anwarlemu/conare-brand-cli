import { html, nothing } from 'lit'
import { DsElement, define } from '@/elements/lib/element'
import styles from 'virtual:tw'

// EmptyState.vue as <conare-empty-state>: a dashed box for a list with nothing in it yet (console2.css .v2-empty): one
// line on what is missing and the actions that fill it, 8px under it. No illustrations, and never without a way forward.

/**
 * @summary A dashed box for a list with nothing in it yet, with the actions that fill it.
 * @slot - The actions (buttons).
 */
export class EmptyState extends DsElement {
	static styles = [DsElement.styles, styles]
	static properties = { heading: {}, description: {} }

	/** The line on what is missing (Vue's `title`; `title` is HTML's tooltip attribute). */
	heading = ''
	/** A second, muted line. */
	description?: string

	render() {
		return html`<div data-ds="empty-state" class="flex flex-col items-center gap-1 border border-dashed border-edge-strong px-4 py-10 text-center">
			<p class="type-ui">${this.heading}</p>
			${this.description ? html`<p class="type-meta text-fg-muted">${this.description}</p>` : nothing}
			<div class="mt-2 flex flex-wrap justify-center gap-2" ?hidden=${!this.hasSlot()}><slot></slot></div>
		</div>`
	}
}

define('empty-state', EmptyState)
