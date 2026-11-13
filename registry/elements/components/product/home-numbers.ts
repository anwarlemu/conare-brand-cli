import { html, nothing } from 'lit'
import { html as staticHtml } from 'lit/static-html.js'
import { DsElement, define, tag } from '@/elements/lib/element'
import '@/elements/components/ui/count'
import styles from 'virtual:tw'

// HomeNumbers.vue as <conare-home-numbers>: the numbers on Explorer's first screen (search/Numbers.vue): the documents, the queries this month and the typical
// search, each leading to its page. Three takes: `strip`, a strip fixed along the board's foot (from the sidebar's
// edge; the full width on a phone); `rule`, three cells in the website's double rule with this month's queries as
// bars that rise once, today's in red; `line`, a quiet line under the box, for when the title carries the documents.
// The documents and this month's queries count up the first time they show in a session (count). Links are anchors
// with `hrefs`; `navigate` ({{ target, event }}) lets a router take them.
// `days` and `hrefs` are JSON attributes or properties.
export type HomeNumbersTake = 'strip' | 'rule' | 'line'
export type HomeNumbersTarget = 'documents' | 'queries' | 'performance'
const num = (n: number) => n.toLocaleString('en-US')

/**
 * @summary The numbers on Explorer's first screen, each leading to its page.
 * @fires navigate - A number was pressed ({ target, event }; prevent the event's default to route it yourself).
 */
export class HomeNumbers extends DsElement {
	static styles = [DsElement.styles, styles]
	static properties = { take: {}, documents: { type: Number }, namespaces: { type: Number }, queries: { type: Number }, typical: { type: Number }, slowest: { type: Number }, days: { type: Array }, hrefs: { type: Object }, plays: { type: Boolean } }

	/** strip, rule or line. */
	take: HomeNumbersTake = 'strip'
	documents = 0
	namespaces = 0
	queries = 0
	/** The typical search, in ms. */
	typical = 0
	/** The slowest 5%, in ms. */
	slowest = 0
	/** This month's queries per day. */
	days: number[] = []
	hrefs: Partial<Record<HomeNumbersTarget, string>> = {}
	/** The bars rise as they land (the first visit of a session). */
	plays = true

	private href(t: HomeNumbersTarget) {
		return this.hrefs[t] ?? '#'
	}
	private go(t: HomeNumbersTarget) {
		return (event: MouseEvent) => this.emit('navigate', { target: t, event })
	}
	private count(value: number, once: string) {
		return staticHtml`<${tag('count')} .value=${value} once=${once}></${tag('count')}>`
	}

	render() {
		const { take, typical } = this
		if (take === 'strip') return html`<nav data-ds="home-numbers" class="ds-homefoot" aria-label="key numbers"><a href=${this.href('documents')} @click=${this.go('documents')}><span class="ds-homefoot-num">${this.count(this.documents, 'home-documents')}</span> documents</a><a href=${this.href('queries')} @click=${this.go('queries')}><span class="ds-homefoot-num">${this.count(this.queries, 'home-queries')}</span> queries this month</a><a href=${this.href('performance')} @click=${this.go('performance')}><span class="ds-homefoot-num">${`${typical} ms`}</span> typical search</a></nav>`
		if (take === 'rule') {
			const peak = Math.max(1, ...this.days)
			return html`<section data-ds="home-numbers" class="ds-homecards mx-auto w-full max-w-160" aria-label="key numbers"><a href=${this.href('documents')} @click=${this.go('documents')}><span class="type-meta text-fg-muted">Documents</span><span class="ds-homecards-num">${this.count(this.documents, 'home-documents')}</span><span class="type-meta text-fg-muted">${`In ${this.namespaces} namespaces`}</span></a><a href=${this.href('queries')} @click=${this.go('queries')}><span class="type-meta text-fg-muted">Queries this month</span><span class="ds-homecards-num">${this.count(this.queries, 'home-queries')}</span><span class="ds-homebars" ?data-plays=${this.plays} aria-hidden="true">${this.days.map((d, i) => html`<span style=${`height: ${Math.max(8, (d / peak) * 100)}%; --i: ${i}`}></span>`)}</span></a><a href=${this.href('performance')} @click=${this.go('performance')}><span class="type-meta text-fg-muted">Typical search</span><span class="ds-homecards-num">${`${typical} ms`}</span><span class="type-meta text-fg-muted">${`${this.slowest} ms for the slowest 5%`}</span></a></section>`
		}
		return html`<p data-ds="home-numbers" class="ds-homeline"><a href=${this.href('queries')} @click=${this.go('queries')}>${`${num(this.queries)} queries this month`}</a><span aria-hidden="true">·</span><a href=${this.href('performance')} @click=${this.go('performance')}>${`${typical} ms typical search`}</a></p>${nothing}`
	}
}

define('home-numbers', HomeNumbers)
