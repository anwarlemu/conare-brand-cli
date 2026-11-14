import { html, nothing, type PropertyValues } from 'lit'
import { DsElement, define } from '@/elements/lib/element'
import { enter, leave } from '@/elements/lib/transition'
import styles from 'virtual:tw'

// AccuracyOpens.vue as <conare-accuracy-opens>: A panel opening in place under its row (the console's RowOpen and Opens): the height grows from 0fr to 1fr on the
// strong ease-out, 180ms both ways as a table row, 200ms in and 140ms out as a list's; what is inside settles 4px as it
// fades in and only fades as it leaves, so nothing pops. Transitions, so a second click turns it around. Vue's table form (`colspan`)
// cannot be an element (a table holds only rows): the accuracy views draw that row themselves, as this element draws
// its list form. `rootName` is the data-ds its root says (accuracy-panel's, as Vue's fallthrough does).

/**
 * @summary A panel opening in place under its row.
 * @slot - What opens.
 */
export class AccuracyOpens extends DsElement {
	static styles = [DsElement.styles, styles]
	static properties = { open: { type: Boolean }, rootName: { attribute: false }, shown: { state: true } }

	open = false
	/** The root's data-ds. */
	rootName = 'accuracy-opens'
	// In the page from the moment it opens until its leave has ended.
	private shown = false

	protected willUpdate(changed: PropertyValues) {
		super.willUpdate(changed)
		if (changed.has('open') && this.open) this.shown = true
	}

	protected updated(changed: PropertyValues) {
		super.updated(changed)
		if (!changed.has('open') || changed.get('open') === undefined) return
		const box = this.renderRoot.querySelector<HTMLElement>('.ds-opens-list')
		if (!box) return
		if (this.open) void enter(box, 'ds-opens', { enter: 200, leave: 140 })
		else void leave(box, 'ds-opens', { enter: 200, leave: 140 }).then(() => { if (!this.open) this.shown = false })
	}

	render() {
		if (!this.shown) return nothing
		return html`<div data-ds="${this.rootName}" class="ds-opens-list"><div class="ds-opens-grow"><div><slot></slot></div></div></div>`
	}
}

define('accuracy-opens', AccuracyOpens)
