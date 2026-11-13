import { type PropertyValues } from 'lit'
import { DsElement, define } from '@/elements/lib/element'
import styles from 'virtual:tw'

// Separator.vue as <conare-separator>: the hairline (console2.css .v2-menu-sep, .v2-rows) as its own part: 1px in the
// edge colour, across or down. `inset` is the menu's: 4px of air above and below, running out to the panel's edges
// through its 4px padding. Decorative by default; pass `semantic` when it separates content a screen reader should hear
// as split. The host is the hairline (Vue's root div), so a class on the element (my-3) lands on it.

/** @summary The hairline, across or down. */
export class Separator extends DsElement {
	static styles = [DsElement.styles, styles]
	static properties = { orientation: { reflect: true }, inset: { type: Boolean, reflect: true }, semantic: { type: Boolean } }

	orientation: 'horizontal' | 'vertical' = 'horizontal'
	inset = false
	semantic = false

	protected updated(changed: PropertyValues) {
		super.updated(changed)
		this.setAttribute('role', this.semantic ? 'separator' : 'none')
		if (this.semantic) this.setAttribute('aria-orientation', this.orientation)
		else this.removeAttribute('aria-orientation')
	}

	render() {
		return null
	}
}

define('separator', Separator)
