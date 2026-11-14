import { nothing, type PropertyValues } from 'lit'
import { html } from 'lit/static-html.js'
import { repeat } from 'lit/directives/repeat.js'
import { ifDefined } from 'lit/directives/if-defined.js'
import { DsElement, define, tag } from '@/elements/lib/element'
import type { SearchResult } from '@/elements/controllers/search-results'
import '@/elements/components/ui/code-pop'
import styles from 'virtual:tw'

// SearchRun.vue as <conare-search-run>: a search on the request's clock, the website's demo window in the console's
// light colours: "Searching" shimmers over the namespaces it reads while cells of the index flicker. When the answer is
// in, "Found in" takes its place, the namespaces that held a result keep a red square and the rest step back, each
// document found lights as a red square on the index, and the count reads "4 of 2,749,690 documents", with when it
// finished and the API's time. Each square names its document when pointed at or focused, and a press fires `reveal`
// with its key (for <conare-search-results> to show it). `nsHref` (a function) makes each namespace a link once the
// answer is in; `code` (the request as the app would send it) puts Show code (code-pop) at the end of the footer,
// opening under it. It follows the request: never fake a delay.

const fmt = (n: number) => n.toLocaleString('en-US')
// Where a cell lights: a small hash, so a document keeps its place.
function hash(text: string) {
	let h = 2166136261
	for (let i = 0; i < text.length; i++) h = Math.imul(h ^ text.charCodeAt(i), 16777619)
	return (h >>> 0) / 4294967296
}
const cell = (x: number, y: number) => `left: round(down, ${(x * 100).toFixed(2)}%, 5px); top: ${Math.floor(y * 3) * 5}px`
const sparks = Array.from({ length: 36 }, (_, k) => `${cell(hash('s' + k + 'x'), hash('s' + k + 'y'))}; --s: ${Math.floor(hash('s' + k + 't') * 900)}`)

type Hit = { key: string, id: string, ns?: string, x: number, style: string }

/**
 * @summary A search on the request's clock: the namespaces read, the index, and what was found.
 * @fires reveal - A found document's square was pressed; detail { key }.
 */
export class SearchRun extends DsElement {
	static styles = [DsElement.styles, styles]
	static properties = { searching: { type: Boolean }, answer: { type: Object }, namespaces: { type: Array }, ns: {}, logoOf: { attribute: false }, nsHref: { attribute: false }, code: {}, tip: { state: true }, doneAt: { state: true } }

	/** The request is out. */
	searching = false
	/** { results, took_ms } once it is in. */
	answer: { results: SearchResult[], took_ms: number } | null = null
	/** [{ name, documents }]: the namespaces it reads. */
	namespaces: Array<{ name: string, documents: number }> = []
	/** One namespace only. */
	ns?: string
	/** A namespace's app mark (a property: a function). */
	logoOf?: (namespace: string) => string | null | undefined
	/** A namespace's page, once the answer is in (a property: a function). */
	nsHref?: (namespace: string) => string
	/** The request as the app would send it: Show code. */
	code?: string
	private tip: Hit | null = null
	private doneAt = ''

	private get found() {
		return !this.searching && !!this.answer
	}
	// Vue's watch(found, { immediate: true }).
	protected willUpdate(changed: PropertyValues) {
		if ((changed.has('searching') || changed.has('answer')) && this.found) {
			const was = !(changed.has('searching') ? changed.get('searching') : this.searching) && !!(changed.has('answer') ? changed.get('answer') : this.answer)
			if (!was || !this.hasUpdated) this.doneAt = new Date().toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })
		}
	}

	render() {
		const logo = (name: string) => this.logoOf?.(name) ?? null
		const all = (this.namespaces ?? []).filter((n) => n.documents > 0).sort((a, b) => b.documents - a.documents)
		const read = this.ns ? all.filter((n) => n.name === this.ns) : all
		const shown = read.slice(0, 4)
		const more = read.length - shown.length
		const total = read.reduce((a, n) => a + n.documents, 0)
		const results = this.answer?.results ?? []
		const hitNs = new Set(results.map((r) => r.namespace))
		const found = this.found
		const n = Math.max(1, results.length)
		// Each found document takes a slot of its own across the field, at a height its id picks, so their 24px targets
		// never overlap.
		const hits: Hit[] = results.map((r, k) => ({ r, k })).sort((a, b) => hash(a.r.id) - hash(b.r.id)).map(({ r, k }, slot) => {
			const x = 0.04 + ((slot + 0.25 + hash(`${r.id}x`) * 0.5) / n) * 0.9
			return { key: `${r.namespace}/${r.id}`, id: r.id, ns: r.namespace ?? this.ns, x, style: `${cell(x, hash(`${r.id}y`) * 0.8)}; --s: ${80 + k * 70}` }
		})
		const pop = tag('code-pop')
		const chip = (s: { name: string }) => {
			const hit = ifDefined(found && hitNs.has(s.name) ? 'true' : found ? 'false' : undefined)
			const inner = html`${logo(s.name) ? html`<img src=${logo(s.name)!} alt="" width="12" height="12" class="size-2.5 shrink-0 object-contain">` : nothing}<span class="type-code-sm">${s.name}</span>${found && hitNs.has(s.name) ? html`<span class="ds-runchip-mark" aria-hidden="true"></span><span class="sr-only">, has results</span>` : nothing}`
			return found && this.nsHref ? html`<a href=${this.nsHref(s.name)} class="ds-runchip ds-runchip-link" data-hit=${hit}>${inner}</a>` : html`<span class="ds-runchip" data-hit=${hit}>${inner}</span>`
		}
		return html`<section data-ds="search-run" class="ds-run flex flex-col gap-2" data-found=${ifDefined(found ? 'true' : undefined)} aria-label="search progress">
			<div class="flex flex-wrap items-center gap-x-3 gap-y-2">
				<span class="grid type-meta" role="status">${!found ? html`<span class="ds-run-shimmer [grid-area:1/1]">Searching</span>` : html`<span class="ds-run-in text-fg-muted [grid-area:1/1]">Found in</span>`}</span>
				<span class="flex flex-wrap items-center gap-x-3 gap-y-2">${repeat(shown, (s) => s.name, chip)}${more > 0 ? html`<span class="ds-runchip" data-hit=${ifDefined(found ? 'false' : undefined)}>${`+${more} more`}</span>` : nothing}</span>
			</div>
			<div class="relative mt-1">
				<div class="ds-index">${!found
					? sparks.map((s) => html`<i class="ds-flick" style=${s} aria-hidden="true"></i>`)
					: repeat(hits, (h) => h.key, (h) => html`<button type="button" class="ds-hitbtn" style=${h.style} aria-label=${`${h.id} in ${h.ns}, show it`} @pointerenter=${() => { this.tip = h }} @pointerleave=${() => { this.tip = null }} @focus=${() => { this.tip = h }} @blur=${() => { this.tip = null }} @click=${() => this.emit('reveal', { key: h.key })}><i class="ds-hit" aria-hidden="true"></i></button>`)}</div>
				${this.tip ? html`<p class="ds-hit-tip" style=${`left: clamp(0px, calc(${(this.tip.x * 100).toFixed(2)}% - 12px), calc(100% - 220px))`} aria-hidden="true"><span class="type-code-sm truncate">${this.tip.id}</span><span class="text-ds-neutral-500">${this.tip.ns}</span></p>` : nothing}
			</div>
			<div class="flex flex-wrap items-center gap-x-3 gap-y-1 type-meta text-fg-muted tabular-nums">${!found
				? html`${'Searching'}${total ? ` ${fmt(total)}` : nothing}${' documents'}`
				: html`<span class="ds-run-in"><span class="text-home-red-press">${results.length}</span>${total ? ` of ${fmt(total)}` : nothing} documents</span><span class="ds-run-in">${`Done ${this.doneAt}`}</span><span class="ds-run-in">${`${this.answer!.took_ms} ms`}</span>${this.code && results.length ? html`<${pop} .code=${this.code}></${pop}>` : nothing}`}</div>
		</section>`
	}
}

define('search-run', SearchRun)
