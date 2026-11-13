import { html, nothing } from 'lit'
import { ifDefined } from 'lit/directives/if-defined.js'
import { DsFormElement, define } from '@/elements/lib/element'
import { PixelGridController, vars } from '@/elements/controllers/pixel-grid'
import styles from 'virtual:tw'

// PixelButton.vue as <conare-pixel-button>: the website's dark button as a console button (console2.css .v2-px): black
// at rest; on hover a red fill comes in as 6px squares from the left with a little scatter and goes out the same way,
// while the white label holds still. A press darkens the squares at once with no change of size. `done` holds the red
// while an action shows it happened (Copied). `large` is the 36px size with the grain. `href` renders a link.

/**
 * @summary The website's dark button: red squares run in on hover.
 * @slot - The label, with a Lucide icon if any.
 * @fires click - When pressed.
 */
export class PixelButton extends DsFormElement {
	static styles = [DsFormElement.styles, styles]
	static properties = {
		done: { type: Boolean, reflect: true },
		large: { type: Boolean },
		href: {},
		type: {},
		disabled: { type: Boolean, reflect: true },
		label: { attribute: 'aria-label' },
	}

	/** Holds the red while an action shows it happened. */
	done = false
	/** The 36px size with the grain, for the one main action of a page. */
	large = false
	href?: string
	type: 'button' | 'submit' = 'button'
	disabled = false
	label?: string

	private grid = new PixelGridController(this, () => this.renderRoot.querySelector<HTMLElement>('.ds-px'))

	private onClick() {
		if (!this.disabled && !this.href && this.type === 'submit') this.form?.requestSubmit()
	}

	render() {
		const g = this.grid.grid
		const inner = html`${g ? html`<span aria-hidden="true" class="ds-px-fill" style=${this.grid.style}>${g.cells.map((c) => html`<i style=${vars(c)}></i>`)}</span>` : nothing}<span class="ds-px-label"><slot></slot></span>`
		const done = this.done ? 'true' : undefined
		const large = this.large ? 'true' : undefined
		return this.href
			? html`<a data-ds="pixel-button" href=${this.href} class="ds-px" data-done=${ifDefined(done)} data-large=${ifDefined(large)} aria-label=${ifDefined(this.label)}>${inner}</a>`
			: html`<button data-ds="pixel-button" type="button" ?disabled=${this.disabled} class="ds-px" data-done=${ifDefined(done)} data-large=${ifDefined(large)} aria-label=${ifDefined(this.label)} @click=${this.onClick}>${inner}</button>`
	}
}

define('pixel-button', PixelButton)
