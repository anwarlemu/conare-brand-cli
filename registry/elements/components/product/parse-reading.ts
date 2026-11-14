import { html, nothing } from 'lit'
import { html as staticHtml } from 'lit/static-html.js'
import { DsElement, define, tag } from '@/elements/lib/element'
import { ParsePointController, type ParseAnswer } from '@/elements/controllers/parse'
import '@/elements/components/product/parse-output'
import '@/elements/components/product/parse-plain'
import '@/elements/components/product/parse-regions'
import '@/elements/components/product/parse-sheet'
import '@/elements/components/ui/count'
import styles from 'virtual:tw'

// ParseReading.vue as <conare-parse-reading>: a file as Conare read it (parse/Reading.vue), three ways. 1 "Page beside text" (the one that ships): the page on the
// paper beside the dark window of what was read, with four facts over it (how long, regions, tables, OCR; the counts
// roll up as they land), joined by pointing. 2 "Regions": the page's structure, every region numbered with its
// confidence. 3 "Plain or Conare": a plain reader's text and Conare's on the same page, one handle between them.
// `answer` is a JSON attribute or a property.

/**
 * @summary A file as Conare read it: page beside text, regions, or plain beside Conare.
 */
export class ParseReading extends DsElement {
	static styles = [DsElement.styles, styles]
	static properties = { answer: { type: Object }, version: { type: Number }, rootName: { attribute: false } }

	answer?: ParseAnswer
	/** 1 page beside text, 2 regions, 3 plain or Conare. */
	version: 1 | 2 | 3 = 1
	/** The root's data-ds (a page built on this one says its own, as Vue's fallthrough does). */
	rootName = 'parse-reading'
	private pt = new ParsePointController(this)

	private onPoint = (e: CustomEvent<{ order: number | null }>) => this.pt.point(e.detail.order)
	private onPick = (e: CustomEvent<{ order: number }>) => this.pt.pick(e.detail.order)

	render() {
		const a = this.answer
		if (!a) return nothing
		if (this.version === 2) return staticHtml`<${tag('parse-regions')} .answer=${a} .rootName=${this.rootName}></${tag('parse-regions')}>`
		if (this.version === 3) return staticHtml`<${tag('parse-plain')} .answer=${a} .rootName=${this.rootName}></${tag('parse-plain')}>`
		const p = a.part
		const tables = p.blocks.filter((b) => b.type === 'table').length
		const facts: Array<{ label: string, value: string, count?: number }> = [
			{ label: 'Read in', value: `${(a.took_ms / 1000).toLocaleString('en-US', { maximumFractionDigits: 1 })} s` },
			{ label: 'Regions', value: '', count: p.blocks.length },
			{ label: 'Tables', value: '', count: tables },
			{ label: 'OCR', value: p.ocr ? `${Math.round((p.confidence ?? 0) * 100)}% sure` : 'Not needed' },
		]
		const lit = this.pt.lit
		return html`<section data-ds="${this.rootName}" class="m-1.25 grid grid-cols-2 border border-edge outline outline-offset-4 outline-edge max-lg:grid-cols-1" aria-label="the page and what was read"><div class="flex min-w-0 flex-col gap-2 bg-surface-subtle p-4">${staticHtml`<${tag('parse-sheet')} class="border border-edge" .parsed=${p} ?scan=${!!a.scan} .on=${lit} plays @point=${this.onPoint} @pick=${this.onPick}></${tag('parse-sheet')}>`}<p class="flex justify-between gap-4 type-meta text-fg-muted"><span class="truncate">${a.name}</span><span class="shrink-0">${`Page ${a.page} of ${a.pages}`}</span></p></div><div class="flex min-w-0 flex-col bg-code text-code-fg"><dl class="grid grid-cols-4 border-b border-code-edge max-md:grid-cols-2">${facts.map((f, i) => html`<div class=${['min-w-0 px-4 py-3', i > 0 ? 'border-code-edge md:border-l' : '', i % 2 === 1 ? 'max-md:border-l' : '', i > 1 ? 'max-md:border-t' : ''].join(' ')}><dt class="type-meta text-code-muted">${f.label}</dt><dd class="text-body tabular-nums">${f.count != null ? staticHtml`<${tag('count')} .value=${f.count} rolls></${tag('count')}>` : f.value}</dd></div>`)}</dl>${staticHtml`<${tag('parse-output')} .answer=${a} .on=${lit} plays @point=${this.onPoint} @pick=${this.onPick}></${tag('parse-output')}>`}</div></section>`
	}
}

define('parse-reading', ParseReading)
