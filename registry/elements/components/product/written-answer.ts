import { nothing, type PropertyValues } from 'lit'
import { html } from 'lit/static-html.js'
import { PenLine } from 'lucide'
import { DsElement, define, tag } from '@/elements/lib/element'
import { icon } from '@/elements/lib/icon'
import { resultKey, type SearchResult } from '@/elements/controllers/search-results'
import '@/elements/components/product/answer-text'
import '@/elements/components/product/page-preview'
import '@/elements/components/ui/button'
import '@/elements/components/ui/dot-matrix'
import styles from 'virtual:tw'

// WrittenAnswer.vue as <conare-written-answer>: the written answer above the passages (search/Written.vue): on the
// paper with a red edge, the answer's words at 16px citing the results it stands on, [1] and [2] as small ink squares.
// A written answer takes about 2s more than the passages, so they land first and the answer follows. Three ways to
// show it: `first`, by itself above the passages; `request`, one button (it costs a second query), which fires `write`;
// `beside`, the cited page at reading size next to the words, following the citation pointed at. `writing` shows the
// dot matrix; `error` says what went wrong. Citations fire `cite` with the result's key, for the results below to show it.
// (Vue keys the page by its result to draw it afresh; a page preview holds no state, so drawing it again is the same.)

// Two of Vue's rules reach into elements that draw their boxes in their own shadow roots: the request button's
// fallthrough (data-ds="written-answer", class self-start) lands on the button's root, and `.ds-written .ds-matrix i`
// turns the dot matrix red. The element marks them and gives their shadow roots these rules once.
const RULES = ':host([data-answer-button]) > [data-ds] { align-self: flex-start; } :host([data-red]) i { background: var(--ds-color-edge-accent); }'
const sheets = new WeakSet<ShadowRoot>()

/**
 * @summary The written answer above the passages: first, on request, or beside the cited page.
 * @fires write - Write an answer was pressed (request mode).
 * @fires cite - A citation was pressed; detail { key } (the result's key).
 */
export class WrittenAnswer extends DsElement {
	static styles = [DsElement.styles, styles]
	static properties = { results: { type: Array }, text: {}, writing: { type: Boolean }, error: {}, mode: {}, pointed: { state: true } }

	/** The results the answer cites, in order. */
	results: SearchResult[] = []
	/** The answer, citing [1], [2]. */
	text = ''
	/** Being written: the dot matrix. */
	writing = false
	/** What went wrong. */
	error?: string
	/** first, request or beside. */
	mode: 'first' | 'request' | 'beside' = 'first'
	private pointed = 1

	protected willUpdate(changed: PropertyValues) {
		if (changed.has('results') && this.hasUpdated) this.pointed = 1
	}

	protected async updated(changed: PropertyValues) {
		super.updated(changed)
		for (const el of this.renderRoot.querySelectorAll<HTMLElement & { updateComplete?: Promise<unknown> }>('[data-answer-button], [data-red]')) {
			await customElements.whenDefined(el.localName)
			await el.updateComplete
			const root = el.shadowRoot
			if (!root) continue
			if (el.hasAttribute('data-answer-button')) root.querySelector('[data-ds="button"]')?.setAttribute('data-ds', 'written-answer')
			if (sheets.has(root)) continue
			const sheet = new CSSStyleSheet()
			sheet.replaceSync(RULES)
			root.adoptedStyleSheets = [...root.adoptedStyleSheets, sheet]
			sheets.add(root)
		}
	}

	// The answer's own cite and point events stop here: composed, they would leave this element too, beside its cite.
	private cite(n: number) {
		this.pointed = n
		const r = this.results[n - 1]
		if (r) this.emit('cite', { key: resultKey(r) })
	}

	render() {
		const [button, dots, answer, preview] = ['button', 'dot-matrix', 'answer-text', 'page-preview'].map(tag)
		if (this.mode === 'request' && !this.text && !this.writing && !this.error) {
			return html`<${button} data-answer-button press @click=${() => this.emit('write')}>${icon(PenLine, 'pen-line', { size: 12, strokeWidth: 1.5, attrs: { 'aria-hidden': 'true' } })}Write an answer</${button}>`
		}
		const results = this.results ?? []
		const shown = results[this.pointed - 1] ?? results[0]
		return html`<section data-ds="written-answer" class="ds-written" aria-label="written answer" aria-live="polite">
			<div class="min-w-0 flex-1">${this.error
				? html`<p class="bg-surface-danger px-3 py-2 type-ui text-fg" role="alert">${this.error}</p>`
				: this.writing
					? html`<p class="inline-flex items-center gap-1.5 type-meta"><${dots} data-red></${dots}>Writing an answer</p>`
					: !this.text
						? html`<p class="type-meta text-fg-muted">Nothing here to write an answer from.</p>`
						: html`<${answer} .text=${this.text} .pointed=${this.mode === 'beside' ? this.pointed : undefined} @point=${(e: CustomEvent<{ n: number }>) => { e.stopPropagation(); this.pointed = e.detail.n }} @cite=${(e: CustomEvent<{ n: number }>) => { e.stopPropagation(); this.cite(e.detail.n) }}></${answer}>`}</div>
			${this.mode === 'beside' && this.text && shown?.page
				? html`<figure class="ds-written-page"><${preview} .page=${shown.page} size="mid"></${preview}><figcaption class="type-meta text-fg-muted"><span class="block truncate type-code-sm">${shown.id}</span>${`Page ${shown.page.number} of ${shown.page.count}`}</figcaption></figure>`
				: nothing}
		</section>`
	}
}

define('written-answer', WrittenAnswer)
