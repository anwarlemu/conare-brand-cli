import { html } from 'lit'
import { ifDefined } from 'lit/directives/if-defined.js'
import { DsElement, define } from '@/elements/lib/element'
import styles from 'virtual:tw'

// TextSwap.vue as <conare-text-swap>: two labels in one cell, so nothing around them moves (console2.css .v2-swap):
// when `on` turns true the first leaves up and the second arrives from below, each with a touch of blur (160ms fade,
// 220ms move on the strong ease-out), and a check in the second label draws its stroke. Put the labels in the `a` and
// `b` slots, an icon first in each (`<span slot="b" class="contents"><svg ...></svg>Copied</span>`). Reduced motion
// keeps the cross-fade only. The host is the cell (text-swap.css), so a class on it lands as one on <TextSwap> does.

/**
 * @summary Two labels in one cell that swap with a touch of blur.
 * @slot a - The first label, shown while `on` is false.
 * @slot b - The second label, shown once `on` is true.
 */
export class TextSwap extends DsElement {
	static styles = [DsElement.styles, styles]
	static properties = { on: { type: Boolean, reflect: true } }

	/** Shows the second label. */
	on = false

	render() {
		return html`<span class="ds-swap-a" aria-hidden=${ifDefined(this.on ? 'true' : undefined)}><slot name="a"></slot></span><span class="ds-swap-b" aria-hidden=${ifDefined(!this.on ? 'true' : undefined)}><slot name="b"></slot></span>`
	}
}

define('text-swap', TextSwap)
