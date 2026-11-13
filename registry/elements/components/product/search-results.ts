import { nothing, type PropertyValues } from 'lit'
import { html } from 'lit/static-html.js'
import { repeat } from 'lit/directives/repeat.js'
import { ifDefined } from 'lit/directives/if-defined.js'
import { ChevronDown } from 'lucide'
import { DsElement, define, tag, uid } from '@/elements/lib/element'
import { icon } from '@/elements/lib/icon'
import { resultKey, type ResultPage, type SearchResult } from '@/elements/controllers/search-results'
import '@/elements/components/product/answer-text'
import '@/elements/components/product/download-button'
import '@/elements/components/product/page-preview'
import '@/elements/components/ui/dot-matrix'
import '@/elements/components/ui/marked-text'
import styles from 'virtual:tw'

// SearchResults.vue as <conare-search-results>: search results, "Best match" (search/BestMatch.vue): the top result is
// the answer most of the time, so it gets the card, the full passage at a larger size with the query's words marked,
// the pages around it (its own outlined in red) and its source; the rest follow as one quiet line each, to scan, and a
// line opens in place to its full passage. `answer` puts a written answer in the card instead of the passage, citing
// results [1], [2]; `writing` holds the card's room with the dot matrix while it is written. `reveal` (a result's key
// and a time) opens that result, brings it into view and flashes it once, as the search run's squares do. `logoOf`
// gives a namespace's app mark. `download` (a function of the result) puts the document's dark Download button
// (document-download) under the best match and each opened match, keyed by the result's key so it says Downloaded once
// it has. Vue's scoped `actions` slot is renderActions(result), for a subclass to fill. Results rise in, 60ms apart.

// `.ds-results .ds-matrix i` (the dot matrix in red while the answer is written) has to reach the cells
// <conare-dot-matrix> draws in its own shadow root: the matrix is marked data-red and its shadow root takes this rule.
const RED_RULE = ':host([data-red]) i { background: var(--ds-color-edge-accent); }'
const redSheets = new WeakSet<ShadowRoot>()

const pageLine = (p: ResultPage) => `Page ${p.number} of ${p.count}`
// The pages before and after the passage's, unmarked.
const around = (p: ResultPage) => [p.number - 1, p.number, p.number + 1].filter((n) => n >= 1 && n <= p.count).map((n) => ({ ...p, number: n, here: n === p.number }))

/**
 * @summary Search results: the best match in its card, then the other matches, each opening in place.
 * @fires cite - A citation in the answer was pressed; detail { key } (the result's key).
 */
export class SearchResults extends DsElement {
	static styles = [DsElement.styles, styles]
	static properties = { results: { type: Array }, query: {}, answer: {}, writing: { type: Boolean }, reveal: { type: Object }, logoOf: { attribute: false }, download: { attribute: false }, open: { state: true }, flash: { state: true } }

	/** [{ namespace, id, score, text, page? }], best first. */
	results: SearchResult[] = []
	/** The question, its words marked. */
	query = ''
	/** A written answer in the card, citing results [1], [2]. */
	answer?: string
	/** The answer is being written. */
	writing = false
	/** { key, at }: open that result, bring it into view, flash it. */
	reveal: { key: string, at: number } | null = null
	/** A namespace's app mark (a property: a function). */
	logoOf?: (namespace: string) => string | null | undefined
	/** Download a result's document (a property: a function); shows the Download buttons. */
	download?: (result: SearchResult) => void
	private open = ''
	private flash = ''
	private pre = uid('match')

	/** Other buttons beside a result's Download (Vue's scoped `actions` slot): override in a subclass. */
	protected renderActions(_result: SearchResult): unknown {
		return nothing
	}

	protected willUpdate(changed: PropertyValues) {
		if (changed.has('results') && this.hasUpdated) this.open = ''
		const was = changed.get('reveal') as { at: number } | null | undefined
		if (changed.has('reveal') && this.reveal && was?.at !== this.reveal.at) void this.bringIn(this.reveal.key)
	}

	protected async updated(changed: PropertyValues) {
		super.updated(changed)
		const red = this.renderRoot.querySelector<HTMLElement & { updateComplete?: Promise<unknown> }>('[data-red]')
		if (!red) return
		await customElements.whenDefined(red.localName)
		await red.updateComplete
		const root = red.shadowRoot
		if (!root || redSheets.has(root)) return
		const sheet = new CSSStyleSheet()
		sheet.replaceSync(RED_RULE)
		root.adoptedStyleSheets = [...root.adoptedStyleSheets, sheet]
		redSheets.add(root)
	}

	private async bringIn(key: string) {
		const i = this.results.findIndex((r) => resultKey(r) === key)
		if (i < 0) return
		if (i > 0) this.open = key
		this.flash = ''
		await this.updateComplete
		this.flash = key
		;(this.renderRoot as ShadowRoot).getElementById(i === 0 ? `${this.pre}-top` : `${this.pre}-row-${i - 1}`)?.scrollIntoView({ behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth', block: 'center' })
	}
	// The answer's own cite and point events stop here: composed, they would leave this element too, beside its cite.
	private cite(n: number) {
		const r = this.results[n - 1]
		if (!r) return
		this.emit('cite', { key: resultKey(r) })
		void this.bringIn(resultKey(r))
	}

	render() {
		const results = this.results ?? []
		const pre = this.pre
		const top = results[0]
		const [dots, answerText, marked, preview, dl] = ['dot-matrix', 'answer-text', 'marked-text', 'page-preview', 'download-button'].map(tag)
		const logo = (ns: string) => this.logoOf?.(ns) ?? null
		const mark = (text: string) => html`<${marked} .text=${text} .query=${this.query}></${marked}>`
		const flash = (r: SearchResult) => ifDefined(this.flash === resultKey(r) ? 'true' : undefined)
		const ends = (r: SearchResult) => {
			const extra = this.renderActions(r)
			return extra !== nothing || this.download ? html`<span class="flex items-center gap-2">${extra}${this.download ? html`<${dl} doc-id=${resultKey(r)} @press=${() => this.download?.(r)}></${dl}>` : nothing}</span>` : nothing
		}
		const answers = this.writing || this.answer !== undefined
		return html`<div data-ds="search-results" class="ds-results flex flex-col gap-6">
			${top
				? html`<article id=${`${pre}-top`} class="ds-rise border border-edge bg-surface" data-flash=${flash(top)} style="--i: 0">
						<div class="flex min-w-0 flex-col gap-9 px-4 pt-4 pb-4.5">
							${answers
								? html`<div class="min-h-12" aria-live="polite">${this.writing
									? html`<p class="inline-flex items-center gap-1.5 type-meta"><${dots} data-red></${dots}>Writing an answer</p>`
									: this.answer ? html`<${answerText} .text=${this.answer} @cite=${(e: CustomEvent<{ n: number }>) => { e.stopPropagation(); this.cite(e.detail.n) }} @point=${(e: Event) => e.stopPropagation()}></${answerText}>` : html`<p class="ds-answer-text">${mark(top.text)}</p>`}</div>`
								: html`<p class="type-body-lg text-ds-neutral-200">${mark(top.text)}</p>`}
							${top.page
								? html`<div class="flex items-end gap-2">${around(top.page).map((p) => html`<${preview} .page=${p} size="thumb" .marked=${p.here} ?here=${p.here}></${preview}>`)}<span class="ml-1 type-meta text-fg-muted">${`${pageLine(top.page)} in `}<span class="type-code-sm">${top.page.file}</span></span></div>`
								: nothing}
						</div>
						<div class="flex flex-wrap items-center justify-between gap-3 border-t border-edge py-2.5 pr-2 pl-4">
							<span class="flex min-w-0 items-center gap-1.5">${logo(top.namespace) ? html`<img src=${logo(top.namespace)!} alt="" width="14" height="14" class="size-3.5 shrink-0 object-contain">` : nothing}<span class="truncate type-code-sm">${top.id}</span><span class="shrink-0 type-meta text-fg-muted">in <span class="type-code-sm">${top.namespace}</span>${`, ${top.score.toFixed(2)}`}</span></span>
							${ends(top)}
						</div>
					</article>`
				: nothing}

			${results.length > 1
				? html`<section class="ds-others flex flex-col gap-1" aria-labelledby=${`${pre}-more`}>
						<h2 id=${`${pre}-more`} class="type-meta text-fg-muted">Other matches</h2>
						<ol class="ds-others-rows">${repeat(results.slice(1), (r) => resultKey(r), (r, i) => {
							const key = resultKey(r)
							const on = this.open === key
							return html`<li id=${`${pre}-row-${i}`} class="ds-rise" data-flash=${flash(r)} style=${`--i: ${i + 1}`}>
								<button type="button" class="ds-match w-full text-left" aria-expanded=${String(on)} aria-controls=${`${pre}-${i}`} @click=${() => { this.open = on ? '' : key }}>${logo(r.namespace) ? html`<img src=${logo(r.namespace)!} alt="" width="12" height="12" class="size-3 shrink-0 object-contain">` : nothing}<span class="ds-match-id w-40 shrink-0 truncate max-sm:w-auto max-sm:min-w-0 max-sm:flex-1">${r.id}</span><span class=${['hidden min-w-0 flex-1 truncate sm:block', on ? 'invisible' : ''].join(' ')}>${r.text}</span>${r.page ? html`<span class="hidden shrink-0 tabular-nums sm:inline">${`p. ${r.page.number}`}</span>` : nothing}<span class="shrink-0 tabular-nums">${r.score.toFixed(2)}</span>${icon(ChevronDown, 'chevron-down', { size: 12, strokeWidth: 1.5, class: 'ds-match-chev shrink-0 text-fg-muted', attrs: { 'aria-hidden': 'true' } })}</button>
								<!-- Opens by its rows' height (0fr to 1fr), so it grows to fit. -->
								<div id=${`${pre}-${i}`} class="ds-expand" data-open=${ifDefined(on ? 'true' : undefined)} ?inert=${!on}>
									<div class="min-h-0 overflow-hidden">
										<div class="flex min-w-0 flex-col gap-3 pt-1 pb-3">
											<p class="leading-5.5 text-ds-neutral-200">${mark(r.text)}</p>
											<div class="flex flex-wrap items-center justify-between gap-3">
												<span class="flex flex-wrap gap-x-4 gap-y-1 type-meta text-fg-muted"><span>in <span class="type-code-sm">${r.namespace}</span></span>${r.page ? html`<span>${pageLine(r.page)}</span>` : nothing}</span>
												${ends(r)}
											</div>
										</div>
									</div>
								</div>
							</li>`
						})}</ol>
					</section>`
				: nothing}
		</div>`
	}
}

define('search-results', SearchResults)
