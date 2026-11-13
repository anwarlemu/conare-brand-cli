import { html } from 'lit'
import { Slash } from 'lucide'
import { DsElement, define } from '@/elements/lib/element'
import { icon } from '@/elements/lib/icon'
import styles from 'virtual:tw'

// Breadcrumb.vue as <conare-breadcrumb>: where you are (console2.css .v2-crumb): each step back a link in muted text
// that turns ink under the pointer, a 10px slash between, the page itself in ink and the only step that truncates.
// `mono` sets a namespace or an ID in Geist Mono. `items` is a JSON attribute or the property. A click on a step back
// fires `navigate` (detail.crumb, detail.event: call detail.event.preventDefault() to route it yourself).
export interface Crumb { label: string, href?: string, mono?: boolean }

/**
 * @summary Where you are: each step back a link, the page in ink.
 * @fires navigate - A step back was clicked (detail.crumb, detail.event).
 */
export class Breadcrumb extends DsElement {
	static styles = [DsElement.styles, styles]
	static properties = { items: { type: Array }, label: {} }

	/** The steps, the page last: { label, href?, mono? }. */
	items: Crumb[] = []
	/** The trail's name for assistive tech. */
	label = 'breadcrumb'

	render() {
		const last = this.items.length - 1
		return html`<nav data-ds="breadcrumb" class="flex min-w-0 flex-1 items-center gap-2 overflow-hidden text-meta leading-5" aria-label=${this.label}>${this.items.map((crumb, i) => html`${i > 0 ? icon(Slash, 'slash', { size: 10, strokeWidth: 1.5, class: 'shrink-0 text-fg-faint', attrs: { 'aria-hidden': 'true' } }) : ''}${i < last
			? html`<a href=${crumb.href ?? '#'} class=${['ds-crumb shrink-0', crumb.mono ? 'type-code-sm' : ''].join(' ')} @click=${(event: MouseEvent) => this.emit('navigate', { crumb, event })}>${crumb.label}</a>`
			: html`<span class=${['truncate text-fg', crumb.mono ? 'type-code-sm' : ''].join(' ')} aria-current="page">${crumb.label}</span>`}`)}</nav>`
	}
}

define('breadcrumb', Breadcrumb)
