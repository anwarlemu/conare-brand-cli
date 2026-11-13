import { html, nothing } from 'lit'
import { html as staticHtml } from 'lit/static-html.js'
import { DsElement, define, tag } from '@/elements/lib/element'
import { ParsePointController, REGION, tableOf, type ParseAnswer, type ParseBlock } from '@/elements/controllers/parse'
import '@/elements/components/product/parse-sheet'
import '@/elements/components/ui/table'
import styles from 'virtual:tw'

// ParseRegions.vue as <conare-parse-regions>: parse, "Regions" (parse/Regions.vue): the page's structure is the result. The page in the double rule with every
// region outlined and numbered, beside a table of the regions in reading order, what each is and how sure OCR was; the
// least sure (under 80%) in red, so a reader sees at once what to check by hand. Pointing joins the two.
// `rootName` is the data-ds its root says (parse-reading draws it as its second version, as Vue's fallthrough does).
const preview = (b: ParseBlock) => (b.type === 'table' ? `${tableOf(b.content).rows.length} rows, ${tableOf(b.content).head.length} columns` : b.content.split('\n')[0]!)
const UNSURE = 0.8

/**
 * @summary The page's regions numbered in reading order, with how sure OCR was.
 */
export class ParseRegions extends DsElement {
	static styles = [DsElement.styles, styles]
	static properties = { answer: { type: Object }, rootName: { attribute: false } }

	answer?: ParseAnswer
	/** The root's data-ds. */
	rootName = 'parse-regions'
	private pt = new ParsePointController(this)

	render() {
		const a = this.answer
		if (!a) return nothing
		const part = a.part
		const unsure = part.blocks.filter((b) => b.conf != null && b.conf < UNSURE).length
		const { lit, pinned } = this.pt
		return html`<section data-ds="${this.rootName}" class="grid grid-cols-[minmax(0,5fr)_minmax(0,7fr)] items-start gap-6 max-lg:grid-cols-1" aria-label="regions in reading order"><div class="m-1.25 border border-edge bg-surface-subtle p-3 outline outline-offset-4 outline-edge">${staticHtml`<${tag('parse-sheet')} .parsed=${part} ?scan=${!!a.scan} .on=${lit} all plays @point=${(e: CustomEvent<{ order: number | null }>) => this.pt.point(e.detail.order)} @pick=${(e: CustomEvent<{ order: number }>) => this.pt.pick(e.detail.order)}></${tag('parse-sheet')}>`}</div><div class="min-w-0"><div class="mb-2 flex items-center justify-between gap-4"><h2 class="type-ui-strong">${`${part.blocks.length} regions in reading order`}</h2><p class="type-meta text-fg-muted">${part.ocr ? (unsure ? `${unsure} to check by hand` : 'All read clearly') : 'Read from the text layer, no OCR needed'}</p></div><div class="overflow-hidden border border-edge bg-surface">${staticHtml`<${tag('table')}><table><thead><tr><th scope="col" class="w-8"><span class="sr-only">Order</span></th><th scope="col" class="w-20">Region</th><th scope="col">Text</th>${part.ocr ? html`<th scope="col" class="w-20 text-right">OCR</th>` : nothing}</tr></thead><tbody>${part.blocks.map((b) => html`<tr class=${lit === b.order ? 'is-link ds-parse-on' : 'is-link'} @pointerenter=${() => this.pt.point(b.order)} @pointerleave=${() => this.pt.point(null)} @click=${() => this.pt.pick(b.order)}><td class="text-fg-muted tabular-nums">${b.order}</td><td>${REGION[b.type] ?? b.type}</td><td class="max-w-0"><button type="button" class="block w-full cursor-pointer truncate text-left focus-visible:outline-2 focus-visible:outline-edge-accent" aria-pressed=${String(pinned === b.order)} @click=${(e: Event) => { e.stopPropagation(); this.pt.pick(b.order) }} @focus=${() => this.pt.point(b.order)} @blur=${() => this.pt.point(null)}>${preview(b)}</button></td>${part.ocr ? html`<td class=${b.conf != null && b.conf < UNSURE ? 'text-right tabular-nums text-fg-accent' : 'text-right tabular-nums'}>${b.conf == null ? '' : `${Math.round(b.conf * 100)}%`}</td>` : nothing}</tr>`)}</tbody></table></${tag('table')}>`}</div></div></section>`
	}
}

define('parse-regions', ParseRegions)
