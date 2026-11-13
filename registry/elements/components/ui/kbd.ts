import { html } from 'lit'
import { DsElement, define } from '@/elements/lib/element'
import styles from 'virtual:tw'

// Kbd.vue as <conare-kbd>: a key or a shortcut (console2.css .v2-side-search kbd): 11px in the face around it, no box, in
// the colour around it. `boxed` adds the prompt bar's hairline box (1px, 4px across). Hidden on touch screens, which have
// no keyboard to press it on. Several keys in one read as one shortcut: <conare-kbd>⌘K</conare-kbd>. The host is the
// key's box (Vue's root kbd), so a class on the element (ml-auto) lands on it.

/**
 * @summary A key or a shortcut.
 * @slot - The key or keys.
 */
export class Kbd extends DsElement {
	static styles = [DsElement.styles, styles]
	static properties = { boxed: { type: Boolean, reflect: true } }

	boxed = false

	render() {
		return html`<kbd class="contents"><slot></slot></kbd>`
	}
}

define('kbd', Kbd)
