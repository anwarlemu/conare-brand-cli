import { html, nothing } from 'lit'
import { ifDefined } from 'lit/directives/if-defined.js'
import { DsElement, define, uid } from '@/elements/lib/element'
import styles from 'virtual:tw'

// Card.vue as <conare-card>: a bordered box for one subject (console2.css .v2-card): a head with its title and actions
// over a hairline, then the body. Square, no shadow. `framed` adds the website's double rule, a second hairline 4px
// outside, for the one block a page leads with. `flush` drops the body's padding.

/**
 * @summary A bordered box for one subject.
 * @slot - The body.
 * @slot actions - The head's actions: links or buttons at its end.
 */
export class Card extends DsElement {
	static styles = [DsElement.styles, styles]
	static properties = { heading: {}, framed: { type: Boolean }, flush: { type: Boolean } }

	/** The head's title (Vue's `title`; `title` is HTML's tooltip attribute). */
	heading = ''
	/** The website's double rule. */
	framed = false
	/** No padding in the body, for a table that runs to the edges. */
	flush = false
	private headingId = uid('card')

	render() {
		const actions = this.hasSlot('actions')
		return html`<section data-ds="card" class=${['border border-edge bg-surface', this.framed ? 'outline outline-offset-4 outline-edge' : ''].join(' ')} aria-labelledby=${ifDefined(this.heading ? this.headingId : undefined)}>
			${this.heading || actions
				? html`<div class="flex flex-wrap items-center justify-between gap-x-3 gap-y-1 border-b border-edge px-4 py-3">${this.heading ? html`<h3 id=${this.headingId} class="type-ui-strong">${this.heading}</h3>` : nothing}${actions ? html`<div class="flex items-center gap-2 type-meta text-fg-muted"><slot name="actions"></slot></div>` : nothing}</div>`
				: nothing}
			<div class=${this.flush ? '' : 'p-4'}><slot></slot></div>
		</section>`
	}
}

define('card', Card)
