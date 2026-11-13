import { html, nothing } from 'lit'
import { html as staticHtml } from 'lit/static-html.js'
import { ifDefined } from 'lit/directives/if-defined.js'
import { DsElement, define, tag } from '@/elements/lib/element'
import type { ResultPage } from '@/elements/controllers/search-results'
import '@/elements/components/ui/marked-text'
import styles from 'virtual:tw'

// PagePreview.vue as <conare-page-preview>: a document's page drawn small, with the passage marked where it sits on it
// (search/PagePreview.vue). A result carries only its passage, so the page's other lines are drawn as rules: at thumb
// and mid size the passage is a band of darker rules on the red tint with a red edge; at full size it is its own
// words, the query's in medium weight. Thumb and mid are pictures (say the page number beside them); full is read.

const COUNT = { thumb: 11, mid: 22, full: 26 }
// Line lengths in percent; 0 is the gap between paragraphs.
const WIDTHS = [100, 97, 99, 94, 100, 62, 0, 98, 100, 95, 100, 71, 0]

/** On by default, as in Vue: marked="false" turns it off. */
const onByDefault = { fromAttribute: (v: string | null) => v !== 'false' }

/** @summary A document's page drawn small, the passage marked where it sits. */
export class PagePreview extends DsElement {
	static styles = [DsElement.styles, styles]
	static properties = { page: { type: Object }, text: {}, query: {}, size: {}, marked: { converter: onByDefault }, here: { type: Boolean } }

	/** { number, count, top (0 to 1), file }. */
	page: ResultPage = { number: 1, count: 1, top: 0, file: '' }
	/** The passage, read at full size. */
	text = ''
	/** The question, its words marked at full size. */
	query = ''
	/** thumb, mid or full. */
	size: 'thumb' | 'mid' | 'full' = 'mid'
	/** The passage's band. */
	marked = true
	/** This page is the passage's: a red outline. */
	here = false

	render() {
		const size = this.size
		const band = size === 'thumb' ? 2 : 4
		const n = COUNT[size] ?? COUNT.mid
		const at = Math.min(n - 3, Math.round(this.page.top * n))
		const span = size === 'thumb' ? 2 : size === 'mid' ? 4 : 1
		const marked = tag('marked-text')
		const lines = Array.from({ length: n }, (_, i) => ({ w: WIDTHS[(i + this.page.number * 3) % WIDTHS.length]!, hit: this.marked && i >= at && i < at + span, first: i === at }))
		return html`<div data-ds="page-preview" class="ds-pg" data-size=${size} data-here=${ifDefined(this.here ? 'true' : undefined)} aria-hidden=${ifDefined(size === 'full' ? undefined : 'true')}>
			<span class="ds-pg-head"></span>
			${lines.map((l) => (size === 'full' && l.first
				? staticHtml`<p class="ds-pg-hit ds-pg-words"><${marked} .text=${this.text} .query=${this.query}></${marked}></p>`
				: l.hit && size !== 'full' && l.first
					? html`<span class="ds-pg-hit">${Array.from({ length: band }, (_, k) => html`<span class="ds-pg-line" style=${`width: ${k + 1 === band ? '68%' : '100%'}`}></span>`)}</span>`
					: !l.hit ? html`<span class="ds-pg-line" style=${`width: ${l.w}%`} data-gap=${ifDefined(l.w === 0 ? 'true' : undefined)}></span>` : nothing))}
			${size !== 'thumb' ? html`<span class="ds-pg-foot">${this.page.number}</span>` : nothing}
		</div>`
	}
}

define('page-preview', PagePreview)
