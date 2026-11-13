import { html } from 'lit'
import { DsElement, define } from '@/elements/lib/element'
import styles from 'virtual:tw'

// ShowMore.vue as <conare-show-more>: the quiet "Show 5 more" under a list (console2.css .v2-more): 12px medium in the
// soft ink that darkens under the pointer, a red focus ring, and a hit area 12px past its words. A list that can grow
// for years opens a few at a time with it, rather than paging. The host is the button: it takes focus, and Enter and
// Space press it, as a <button> does.

/**
 * @summary The quiet "Show 5 more" under a list.
 * @slot - The words, in place of `label`.
 * @fires click - Pressed (pointer, Enter or Space).
 */
export class ShowMore extends DsElement {
	static styles = [DsElement.styles, styles]
	static properties = { count: { type: Number }, label: {} }

	/** How many more it shows. */
	count = 5
	/** The words (else "Show <count> more"). */
	label?: string

	connectedCallback() {
		super.connectedCallback()
		if (!this.hasAttribute('role')) this.setAttribute('role', 'button')
		if (!this.hasAttribute('tabindex')) this.setAttribute('tabindex', '0')
		this.addEventListener('keydown', this.onKey)
	}
	disconnectedCallback() {
		super.disconnectedCallback()
		this.removeEventListener('keydown', this.onKey)
	}
	private onKey = (e: KeyboardEvent) => {
		if (e.key !== 'Enter' && e.key !== ' ') return
		e.preventDefault()
		this.click()
	}

	render() {
		return html`${this.hasSlot() ? html`<slot></slot>` : (this.label ?? `Show ${this.count} more`)}`
	}
}

define('show-more', ShowMore)
