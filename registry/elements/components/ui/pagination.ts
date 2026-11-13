import { html } from 'lit/static-html.js'
import { ChevronLeft, ChevronRight } from 'lucide'
import { DsElement, define, tag } from '@/elements/lib/element'
import { icon } from '@/elements/lib/icon'
import '@/elements/components/ui/button'
import styles from 'virtual:tw'

// Pagination.vue as <conare-pagination>: pages of a long list, when its order means a place to come back to (an audit
// log): two secondary icon buttons around the page count in tabular figures, 12px muted. The buttons go grey at either
// end. Prefer <conare-show-more> for a list read from the top: it keeps what was read on screen. v-model:page is `page`
// with `page-change`.

/**
 * @summary Previous and next around the page count.
 * @fires page-change - The page changed (detail.value; read `page`).
 */
export class Pagination extends DsElement {
	static styles = [DsElement.styles, styles]
	static properties = { page: { type: Number }, pages: { type: Number }, label: {} }

	/** The page shown, from 1. */
	page = 1
	/** How many pages. */
	pages = 1
	/** The nav's name. */
	label = 'pages'

	render() {
		const button = tag('button')
		return html`<nav class="contents" aria-label=${this.label}>
			<${button} icon aria-label="Previous page" ?disabled=${this.page <= 1} @click=${() => this.commit(Math.max(1, this.page - 1), 'page')}>${icon(ChevronLeft, 'chevron-left', { size: 14, strokeWidth: 1.5, attrs: { 'aria-hidden': 'true' } })}</${button}>
			<span class="type-meta text-fg-muted tabular-nums" aria-live="polite">Page <span class="text-fg">${this.page}</span>${` of ${this.pages}`}</span>
			<${button} icon aria-label="Next page" ?disabled=${this.page >= this.pages} @click=${() => this.commit(Math.min(this.pages, this.page + 1), 'page')}>${icon(ChevronRight, 'chevron-right', { size: 14, strokeWidth: 1.5, attrs: { 'aria-hidden': 'true' } })}</${button}>
		</nav>`
	}
}

define('pagination', Pagination)
