import { html, nothing } from 'lit'
import { ifDefined } from 'lit/directives/if-defined.js'
import { DsElement, define } from '@/elements/lib/element'
import styles from 'virtual:tw'

// Avatar.vue as <conare-avatar>: who or what something belongs to, always square (never round). `tile` (console2.css
// .v2-tile, the workspace switcher's organization): a 20px hairline box with the name's initial, 11px medium. `solid`
// (AccountMenu.vue): the black square that stands in for a profile picture; with `initial` it carries the letter in
// off-white. A `src` shows a picture cropped square, falling back to the initial if it fails. Sizes follow the
// controls: 20 (in a row), 28, 32.
const SIZES = { 20: 'size-5 text-caption', 28: 'size-7 text-meta', 32: 'size-8 text-ui' }

/**
 * @summary Who or what something belongs to, always square.
 */
export class Avatar extends DsElement {
	static styles = [DsElement.styles, styles]
	static properties = { name: {}, src: {}, variant: {}, size: { type: Number }, initial: { type: Boolean }, failed: { state: true } }

	/** Whose it is: its initial, and the name for assistive tech. */
	name?: string
	/** A picture, cropped square. */
	src?: string
	variant: 'tile' | 'solid' = 'tile'
	size: 20 | 28 | 32 = 20
	/** On `solid`, the letter in off-white. */
	initial = false
	private failed = false

	render() {
		const letter = (this.name?.trim()[0] ?? '').toUpperCase()
		const showLetter = this.variant === 'tile' || this.initial
		const classes = ['inline-flex shrink-0 items-center justify-center overflow-hidden leading-none font-medium select-none', SIZES[this.size] ?? SIZES[20], this.variant === 'tile' ? 'border border-edge bg-surface text-fg' : 'bg-off-black text-off-white'].join(' ')
		return html`<span data-ds="avatar" class=${classes} role=${ifDefined(this.name ? 'img' : undefined)} aria-label=${ifDefined(this.name)} aria-hidden=${ifDefined(this.name ? undefined : 'true')}>${this.src && !this.failed ? html`<img src=${this.src} alt="" class="size-full object-cover" @error=${() => { this.failed = true }}>` : showLetter ? letter : nothing}</span>`
	}
}

define('avatar', Avatar)
