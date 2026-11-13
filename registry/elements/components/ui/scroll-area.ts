import { html, type PropertyValues } from 'lit'
import { DsElement, define } from '@/elements/lib/element'
import styles from 'virtual:tw'

// ScrollArea.vue as <conare-scroll-area>: a region that scrolls on its own with the console's thin scrollbars (main.css
// html: scrollbar-width thin, the thumb in neutral-600 on a clear track; on the dark window, neutral-400 as
// .v2-agentwin-code). Native scrolling, so wheel, touch and keyboard all work; with a `label` it is a named region a
// keyboard can reach. `max-height` caps it; `axis` picks the direction. The host is the scrolling box (Vue's root div),
// so a class on the element (a width, a border) lands on it.

/**
 * @summary A region that scrolls on its own, with thin scrollbars.
 * @slot - The content.
 */
export class ScrollArea extends DsElement {
	static styles = [DsElement.styles, styles]
	static properties = { label: {}, maxHeight: { attribute: 'max-height' }, axis: { reflect: true }, tone: { reflect: true } }

	/** Names the region and lets a keyboard reach it. */
	label?: string
	/** A cap on its height, such as 240px. */
	maxHeight?: string
	axis: 'y' | 'x' | 'both' = 'y'
	tone: 'default' | 'dark' = 'default'

	protected updated(changed: PropertyValues) {
		super.updated(changed)
		// The host is the region: its role, name, tab stop and cap go on it, as on Vue's root.
		if (changed.has('maxHeight')) this.style.maxHeight = this.maxHeight ?? ''
		if (changed.has('label')) {
			if (this.label) {
				this.setAttribute('role', 'region')
				this.setAttribute('aria-label', this.label)
				this.tabIndex = 0
			} else {
				for (const a of ['role', 'aria-label', 'tabindex']) this.removeAttribute(a)
			}
		}
	}

	render() {
		return html`<slot></slot>`
	}
}

define('scroll-area', ScrollArea)
