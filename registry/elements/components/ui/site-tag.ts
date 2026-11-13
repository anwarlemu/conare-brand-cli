import { html } from 'lit'
import { DsElement, define } from '@/elements/lib/element'
import styles from 'virtual:tw'

// SiteTag.vue as <conare-site-tag>: the website's tag (Tag.vue on conare.ai): 10px capitals on the red, tracked
// 0.06em, the system's only capitals. `framed` adds a second rule 2px outside, as the cards' double rule (the hero's
// eyebrow).

/**
 * @summary The website's tag: small capitals on the red.
 * @slot - The word.
 */
export class SiteTag extends DsElement {
	static styles = [DsElement.styles, styles]
	static properties = { framed: { type: Boolean } }

	/** A second rule 2px outside. */
	framed = false

	render() {
		return html`<span data-ds="site-tag" class=${['inline-block bg-home-red py-0.75 pr-[calc(4px-0.06em)] pl-1 type-tag text-off-white [text-box:trim-both_cap_alphabetic]', this.framed ? 'outline outline-offset-2 outline-home-red' : ''].join(' ')}><slot></slot></span>`
	}
}

define('site-tag', SiteTag)
