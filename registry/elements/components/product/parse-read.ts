import { html, nothing } from 'lit'
import { DsElement, define } from '@/elements/lib/element'
import { isTotal, tableOf, type ParsePart } from '@/elements/controllers/parse'
import styles from 'virtual:tw'

// ParseRead.vue as <conare-parse-read>: what Conare took from a page, as a person reads it (parse/Read.vue): the regions in reading order without the running
// head and foot, tables as tables. Each region takes focus, and pointing at or focusing one fires `point`, so the page
// beside it lights the same region; a click pins it (`pick`). `plays` lands them in order with the page's red line.
// The host is the column (parse-read.css), so classes on it (a scroll box) land as on <ParseRead>; `parsed` is Vue's
// `part`.

/**
 * @summary What Conare took from a page, in reading order.
 * @fires point - A region took the pointer or focus ({ order }) or lost it ({ order: null }).
 * @fires pick - A region was clicked ({ order }).
 */
export class ParseRead extends DsElement {
	static styles = [DsElement.styles, styles]
	static properties = { parsed: { type: Object }, on: { type: Number }, plays: { type: Boolean, reflect: true }, tight: { type: Boolean, reflect: true } }

	/** The page's reading (Vue's `part`). */
	parsed: ParsePart = { page: 1, markdown: '', ocr: false, confidence: null, blocks: [] }
	/** The region lit (its order). */
	on: number | null = null
	/** Lands the regions in order with the page's red line. */
	plays = false
	/** 6px rows, beside a plain reader's text. */
	tight = false

	private point(order: number | null) {
		this.emit('point', { order })
	}

	render() {
		const body = this.parsed.blocks.filter((b) => b.type !== 'header' && b.type !== 'footer')
		return html`${body.map((b) => html`<div class="ds-parseread-block" data-type=${b.type} ?data-on=${this.on === b.order} style="--o: ${b.order}" tabindex="0" @pointerenter=${() => this.point(b.order)} @pointerleave=${() => this.point(null)} @focus=${() => this.point(b.order)} @blur=${() => this.point(null)} @click=${() => this.emit('pick', { order: b.order })}>${b.type === 'table'
			? html`<table class="ds-parsetable" data-read><thead><tr>${tableOf(b.content).head.map((hd) => html`<th scope="col">${hd}</th>`)}</tr></thead><tbody>${tableOf(b.content).rows.map((r) => html`<tr ?data-total=${isTotal(r[0] ?? '')}>${r.map((cell) => html`<td>${cell}</td>`)}</tr>`)}</tbody></table>`
			: b.type === 'list'
				? b.content.split('\n').map((l) => html`<p>${l}</p>`)
				: html`<p>${b.content}</p>`}</div>`)}${nothing}`
	}
}

define('parse-read', ParseRead)
