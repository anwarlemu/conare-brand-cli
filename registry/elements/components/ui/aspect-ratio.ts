import { html, type PropertyValues } from 'lit'
import { DsElement, define } from '@/elements/lib/element'
import styles from 'virtual:tw'

// AspectRatio.vue as <conare-aspect-ratio>: a box that keeps its shape as it grows (CSS aspect-ratio), for a picture or
// a window that must not reflow: the blog card's 5:4 picture, the hero's 2:1 frame. `ratio` is width over height; the
// content fills it. The host is the box (aspect-ratio.css), so a class on it (a ground, a width) lands as a class on
// <AspectRatio> does.

/**
 * @summary A box that keeps its shape as it grows.
 * @slot - What fills it (position it absolutely to fill the box).
 */
export class AspectRatio extends DsElement {
	static styles = [DsElement.styles, styles]
	static properties = { ratio: { type: Number } }

	/** Width over height. */
	ratio = 1

	protected updated(changed: PropertyValues) {
		super.updated(changed)
		// As Vue's :style on the root: the host is the root.
		if (changed.has('ratio')) this.style.aspectRatio = String(this.ratio)
	}

	render() {
		return html`<slot></slot>`
	}
}

define('aspect-ratio', AspectRatio)
