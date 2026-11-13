import { html, nothing } from 'lit'
import { DsElement, define } from '@/elements/lib/element'
import styles from 'virtual:tw'

// WorkWindow.vue as <conare-work-window>: the small dark window a work panel shows (console2.css .v2-win): a 44px bar with its title and a tag (a time, a
// count), the body, and a foot line whose square turns red when the work is done (`done`). Code colours, Geist.
// `heading` is Vue's `title`.

/**
 * @summary The small dark window a work panel shows.
 * @slot - The body.
 */
export class WorkWindow extends DsElement {
	static styles = [DsElement.styles, styles]
	static properties = { heading: {}, tag: {}, foot: {}, done: { type: Boolean } }

	/** The bar's title (Vue's `title`). */
	heading = ''
	/** A time or a count in the bar. */
	tag?: string
	/** The foot line. */
	foot?: string
	/** The foot's square turns red. */
	done = false

	render() {
		return html`<div data-ds="work-window" class="ds-win w-full max-w-120"><div class="ds-win-bar"><span class="min-w-0 flex-1 truncate">${this.heading}</span>${this.tag ? html`<span class="ds-win-tag">${this.tag}</span>` : nothing}</div><slot></slot>${this.foot ? html`<p class="ds-win-foot" ?data-on=${this.done}><span class="ds-win-dot" aria-hidden="true"></span>${this.foot}</p>` : nothing}</div>`
	}
}

define('work-window', WorkWindow)
