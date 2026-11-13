import { html, nothing } from 'lit'
import { ChevronRight } from 'lucide'
import { DsElement, define } from '@/elements/lib/element'
import { icon } from '@/elements/lib/icon'
import styles from 'virtual:tw'

// Item.vue as <conare-item>: one row of a card's list (console2.css .v2-row, .v2-row-link): 12px, its title on the
// left and what it is on the right, 8px above and below. With `href` the whole row is one link that fills to the card's
// edges with the paper under the pointer (it runs 16px past its box, a card's inset); `arrow` adds a chevron that
// darkens with it. Rows in a list share a hairline: put them in <conare-item-group>. Vue's `title` is `heading`.

/**
 * @summary One row of a card's list; with href, the whole row is a link.
 * @slot - The title, in place of `heading`.
 * @slot media - Before the title (a logo, a tile).
 * @slot meta - Beside it (a tag, a time).
 * @slot actions - At the end, on a row without href only (a link holds no buttons).
 */
export class Item extends DsElement {
	static styles = [DsElement.styles, styles]
	static properties = { heading: {}, description: {}, href: {}, arrow: { type: Boolean } }

	/** The title (Vue's `title`; `title` is HTML's tooltip attribute). */
	heading?: string
	/** A muted second line. */
	description?: string
	/** The whole row opens this. */
	href?: string
	/** A chevron that darkens under the pointer. */
	arrow = false

	// The whitespace between named-slot children is assigned to the default slot, so a slot fallback would never show:
	// the title shows when the default slot holds nothing but whitespace.
	render() {
		const body = html`<span class="flex min-w-0 items-center gap-2">
			<slot name="media"></slot>
			<span class="min-w-0">
				<span class="block truncate text-fg"><slot></slot>${this.hasSlot() ? nothing : this.heading}</span>
				${this.description ? html`<span class="block truncate text-fg-muted">${this.description}</span>` : nothing}
			</span>
		</span>`
		if (this.href) {
			return html`<a data-ds="item" href=${this.href} class="ds-item-link group/item -mx-4 flex items-center justify-between gap-3 px-4 py-2 text-meta">
				${body}
				<span class="flex shrink-0 items-center gap-2 text-fg-muted">
					<slot name="meta"></slot>
					${this.arrow ? icon(ChevronRight, 'chevron-right', { size: 12, strokeWidth: 1.5, class: 'transition-colors duration-120 ease-standard group-hover/item:text-fg', attrs: { 'aria-hidden': 'true' } }) : nothing}
				</span>
			</a>`
		}
		const end = this.hasSlot('meta') || this.hasSlot('actions')
		return html`<div data-ds="item" class="flex items-center justify-between gap-3 py-2 text-meta">
			${body}
			${end ? html`<span class="flex shrink-0 items-center gap-2 text-fg-muted"><slot name="meta"></slot><slot name="actions"></slot></span>` : nothing}
		</div>`
	}
}

define('item', Item)
