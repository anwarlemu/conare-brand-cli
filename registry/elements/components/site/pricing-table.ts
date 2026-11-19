import { html, nothing } from 'lit'
import { html as staticHtml } from 'lit/static-html.js'
import { DsElement, define, tag } from '@/elements/lib/element'
import '@/elements/components/site/section-head'
import styles from 'virtual:tw'

// PricingTable.vue as <conare-pricing-table>: one group of prices (pricing.vue): its case on the left, its cards on
// the right in the website's double rule, side by side from 1024px. Each card: the name in Faculty Glyphic 20px, the
// price large in tabular figures with its unit, one line, and what it includes under a hairline, each led by the red
// square. Two across from 640px; an odd last card takes the row. `heading` is Vue's `title`; `anchor` is the
// section's id (Vue's fallthrough id).
export type PriceCard = { name: string, amount: string, unit?: string, line?: string, facts?: string[] }

/** @summary One group of prices: its case, then its cards in the double rule. */
export class PricingTable extends DsElement {
	static styles = [DsElement.styles, styles]
	static properties = { heading: {}, body: {}, cards: { type: Array }, titleId: { attribute: 'title-id' }, anchor: {} }

	/** The group's name (Vue's `title`). */
	heading = ''
	body?: string
	/** Each { name, amount, unit, line, facts }. */
	cards: PriceCard[] = []
	titleId = 'pricing-title'
	/** The section's id, to link to the group. */
	anchor?: string

	render() {
		const head = tag('section-head')
		const n = this.cards.length
		return html`<section id=${this.anchor ?? nothing} data-ds="pricing-table" aria-labelledby=${this.titleId} class="mx-auto grid max-w-[1440px] scroll-mt-16 grid-cols-[minmax(0,1fr)] gap-8 px-4 pb-24 sm:px-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,2.4fr)] lg:gap-16 lg:px-10 lg:pb-32">${staticHtml`<${head} .heading=${this.heading} .body=${this.body} .titleId=${this.titleId} align="start"></${head}>`}<ul class="grid grid-cols-[minmax(0,1fr)] gap-px border border-edge bg-edge outline outline-offset-4 outline-edge sm:grid-cols-2">${this.cards.map((c, i) => html`<li class=${['flex flex-col bg-surface px-5 py-6 sm:px-6', n % 2 && i === n - 1 ? 'sm:col-span-2' : ''].join(' ')}><h3 class="type-heading-3 text-fg">${c.name}</h3><p class="mt-4 flex flex-wrap items-baseline gap-x-2 gap-y-1"><span class="text-viz-score tracking-display text-fg tabular-nums">${c.amount}</span>${c.unit ? html`<span class="text-body text-fg-muted">${c.unit}</span>` : nothing}</p>${c.line ? html`<p class="mt-3 text-body leading-5.5 text-fg-muted">${c.line}</p>` : nothing}${c.facts?.length ? html`<ul class="mt-5 flex flex-col gap-2 border-t border-edge pt-5">${c.facts.map((f) => html`<li class="flex items-center gap-3 text-body text-fg"><span aria-hidden="true" class="size-1.5 shrink-0 bg-home-red"></span>${f}</li>`)}</ul>` : nothing}</li>`)}</ul></section>`
	}
}

define('pricing-table', PricingTable)
