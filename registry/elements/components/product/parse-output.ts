import { html, nothing } from 'lit'
import { html as staticHtml } from 'lit/static-html.js'
import { DsElement, define, tag } from '@/elements/lib/element'
import type { ParseAnswer } from '@/elements/controllers/parse'
import '@/elements/components/product/parse-read'
import styles from 'virtual:tw'

// ParseOutput.vue as <conare-parse-output>: what was read, on the dark window (parse/Output.vue): as text, as Markdown or as the API's JSON, picked by line tabs
// whose red underline draws from the left. The text and the page beside it point at each other.
// The text's `point` and `pick` events pass on out of it.
const TABS = [{ id: 'text', label: 'Text' }, { id: 'markdown', label: 'Markdown' }, { id: 'json', label: 'JSON' }] as const

/**
 * @summary What was read, as text, Markdown or JSON.
 */
export class ParseOutput extends DsElement {
	static styles = [DsElement.styles, styles]
	static properties = { answer: { type: Object }, on: { type: Number }, plays: { type: Boolean }, tab: { state: true } }

	answer?: ParseAnswer
	/** The region lit (its order). */
	on: number | null = null
	plays = false
	private tab: typeof TABS[number]['id'] = 'text'

	render() {
		const a = this.answer
		if (!a) return nothing
		const json = JSON.stringify({ id: a.id, state: 'done', name: a.name, pages: a.pages, parts: [{ page: a.part.page, ocr: a.part.ocr, confidence: a.part.confidence, blocks: a.part.blocks }] }, null, 2)
		return html`<div data-ds="parse-output" class="flex min-h-0 flex-1 flex-col"><div class="flex gap-4 border-b border-code-edge px-4" role="tablist" aria-label="what was read">${TABS.map((t) => html`<button type="button" role="tab" class="ds-parsetab" aria-selected=${String(this.tab === t.id)} @click=${() => { this.tab = t.id }}>${t.label}</button>`)}</div>${this.tab === 'text'
			? staticHtml`<${tag('parse-read')} role="tabpanel" class="fade-xy min-h-0 flex-1 overflow-auto p-2" .parsed=${a.part} .on=${this.on} ?plays=${this.plays}></${tag('parse-read')}>`
			: html`<pre class="fade-xy m-0 min-h-0 flex-1 overflow-auto p-4 font-code text-meta leading-4.5 whitespace-pre" tabindex="0" role="tabpanel">${this.tab === 'markdown' ? a.markdown : json}</pre>`}</div>`
	}
}

define('parse-output', ParseOutput)
