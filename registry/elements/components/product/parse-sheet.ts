import { html, nothing, type PropertyValues } from 'lit'
import { DsElement, define } from '@/elements/lib/element'
import { REGION, isTotal, tableOf, type ParseBlock, type ParsePart } from '@/elements/controllers/parse'
import styles from 'virtual:tw'

// ParseSheet.vue as <conare-parse-sheet>: a page as Conare read it (parse/Sheet.vue): each region drawn at its box in reading order, in a document face (a
// typewriter face, a little askew and soft, for a scan). Sizes follow the page's width, so it reads the same as a
// thumbnail and full size. `on` lights a region with a red edge and its kind; `all` outlines every region and numbers
// it; `plays` runs a red line down the page once while the regions land in order (reduced motion shows them at once);
// `mini` is a picture only. The boxes are the pointer's way in; the keyboard reaches the same regions in the text or the
// list beside the page, so they stay out of the tab order.
// The host is the page (parse-sheet.css), so a class on it (a border) lands as one on <ParseSheet> does; `parsed` is
// Vue's `part` (HTML's `part` is taken). Pointing fires `point` ({ order }, null when it leaves), a click `pick`.

const box = (b: ParseBlock) => `left: ${b.bbox[0] * 100}%; top: ${b.bbox[1] * 100}%; width: ${(b.bbox[2] - b.bbox[0]) * 100}%; height: ${(b.bbox[3] - b.bbox[1]) * 100}%; --o: ${b.order}`
const name = (b: ParseBlock) => `${REGION[b.type] ?? b.type}: ${b.type === 'table' ? `${tableOf(b.content).rows.length} rows` : b.content.slice(0, 60)}`
const stamp = (b: ParseBlock) => b.content.replace(/^Stamp:\s*/, '').split(', ')

/**
 * @summary A page as Conare read it: each region at its box.
 * @fires point - The pointer is on a region ({ order }) or left it ({ order: null }).
 * @fires pick - A region was clicked ({ order }).
 */
export class ParseSheet extends DsElement {
	static styles = [DsElement.styles, styles]
	static properties = { parsed: { type: Object }, scan: { type: Boolean, reflect: true }, on: { type: Number }, mini: { type: Boolean }, plays: { type: Boolean, reflect: true }, all: { type: Boolean, reflect: true } }

	/** The page's reading (Vue's `part`). */
	parsed: ParsePart = { page: 1, markdown: '', ocr: false, confidence: null, blocks: [] }
	/** Drawn as a scan. */
	scan = false
	/** The region lit (its order). */
	on: number | null = null
	/** A picture only. */
	mini = false
	/** A red line runs down once while the regions land. */
	plays = false
	/** Every region outlined and numbered. */
	all = false

	protected willUpdate(changed: PropertyValues) {
		super.willUpdate(changed)
		if (changed.has('mini')) this.toggleAttribute('aria-hidden', this.mini)
	}

	private point(order: number | null) {
		this.emit('point', { order })
	}

	render() {
		return html`${this.plays ? html`<span class="ds-parse-sweep" aria-hidden="true"></span>` : nothing}${this.parsed.blocks.map((b) => html`<div class="ds-parseregion" data-type=${b.type} ?data-on=${this.on === b.order} style=${box(b)}>${b.type === 'table'
			? html`<table class="ds-parsetable"><thead><tr>${tableOf(b.content).head.map((hd) => html`<th scope="col">${hd}</th>`)}</tr></thead><tbody>${tableOf(b.content).rows.map((r) => html`<tr ?data-total=${isTotal(r[0] ?? '')}>${r.map((cell) => html`<td>${cell}</td>`)}</tr>`)}</tbody></table>`
			: b.type === 'image'
				? b.content.startsWith('Signature')
					? html`<svg viewBox="0 0 120 40" class="ds-parsesign" aria-hidden="true"><path d="M4 28c10-20 15-22 17-16s-6 18-3 18 10-20 15-18 0 14 4 14 8-12 12-10-2 10 2 10 10-8 16-8 12 4 22 2 18-6 27-6"></path></svg>`
					: html`<span class="ds-parsestamp"><span>${stamp(b)[0]}</span><span>${stamp(b).slice(1).join(', ')}</span></span>`
				: b.type === 'list'
					? b.content.split('\n').map((l) => html`<p>${l}</p>`)
					: html`<p>${b.content}</p>`}${!this.mini
			? html`${this.all ? html`<span class="ds-parsenum" aria-hidden="true">${b.order}</span>` : nothing}<span class="ds-parsetag" aria-hidden="true">${REGION[b.type] ?? b.type}</span><button type="button" tabindex="-1" class="ds-parsehit" aria-label=${name(b)} aria-pressed=${String(this.on === b.order)} @pointerenter=${() => this.point(b.order)} @pointerleave=${() => this.point(null)} @click=${() => this.emit('pick', { order: b.order })}></button>`
			: nothing}</div>`)}`
	}
}

define('parse-sheet', ParseSheet)
