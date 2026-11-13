import { html } from 'lit'
import { html as staticHtml } from 'lit/static-html.js'
import { DsElement, define, tag } from '@/elements/lib/element'
import { icon } from '@/elements/lib/icon'
import { GripVertical } from 'lucide'
import type { ParseAnswer } from '@/elements/controllers/parse'
import '@/elements/components/product/parse-read'
import '@/elements/components/product/parse-sheet'
import styles from 'virtual:tw'

// ParsePlain.vue as <conare-parse-plain>: parse, "Plain or Conare" (parse/Plain.vue): what a plain PDF reader gets beside what Conare read, the same page, one
// red handle between them, so the difference is seen and not claimed: a plain reader runs a table's columns together and
// finds nothing on a scan. The handle is a range input, so arrows move it too; each side keeps reading at any width. On
// a phone the two stack and there is no handle.
// Its rule for the read blocks' rows is parse-read's `tight`. `rootName` is the data-ds its root says.

/**
 * @summary A plain PDF reader's text beside Conare's, one handle between them.
 */
export class ParsePlain extends DsElement {
	static styles = [DsElement.styles, styles]
	static properties = { answer: { type: Object }, rootName: { attribute: false }, at: { state: true } }

	answer?: ParseAnswer
	/** The root's data-ds. */
	rootName = 'parse-plain'
	private at = 50

	render() {
		const a = this.answer
		if (!a) return html``
		return html`<section data-ds="${this.rootName}" class="grid grid-cols-[minmax(0,4fr)_minmax(0,8fr)] items-stretch gap-6 max-lg:grid-cols-1" aria-label="a plain reader and Conare, the same page"><div class="m-1.25 self-start border border-edge bg-surface-subtle p-3 outline outline-offset-4 outline-edge">${staticHtml`<${tag('parse-sheet')} .parsed=${a.part} ?scan=${!!a.scan} plays mini></${tag('parse-sheet')}>`}</div><div class="ds-parseplain m-1.25" style=${`--at: ${this.at}%`}><div class="ds-parseplain-layer" data-side="plain"><p class="mb-3 type-meta text-fg-muted">A plain PDF reader</p>${!a.plain ? html`<p class="max-w-80 text-fg-soft">No text found. A scan is a picture, so a plain reader has nothing to read.</p>` : html`<pre class="m-0 font-code text-meta leading-4.5 break-words whitespace-pre-wrap text-fg-soft">${a.plain}</pre>`}</div><div class="ds-parseplain-layer" data-side="conare"><p class="mb-3 type-meta text-fg">Conare</p>${staticHtml`<${tag('parse-read')} .parsed=${a.part} tight></${tag('parse-read')}>`}</div><span class="ds-parseplain-rule" aria-hidden="true"><span>${icon(GripVertical, 'grip-vertical', { size: 12, strokeWidth: 1.5 })}</span></span><input .value=${String(this.at)} @input=${(e: Event) => { this.at = Number((e.target as HTMLInputElement).value) }} type="range" min="24" max="76" step="1" class="ds-parseplain-range" aria-label="move between a plain reader and Conare"></div></section>`
	}
}

define('parse-plain', ParsePlain)
