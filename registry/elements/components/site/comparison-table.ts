import { html } from 'lit'
import { html as staticHtml } from 'lit/static-html.js'
import { DsElement, define, tag } from '@/elements/lib/element'
import '@/elements/components/site/section-head'
import styles from 'virtual:tw'

// ComparisonTable.vue as <conare-comparison-table>: what each plan includes, side by side: the band's head, then a table
// in the website's double rule. A row per thing; a column per plan. A cell is the red square (included), a short
// hairline (not included, said aloud for screen readers) or a few words. It scrolls sideways on phones and fades at its
// edges. `heading` is Vue's `title`.
export type ComparisonRow = { feature: string, values: (boolean | string)[] }

/** @summary What each plan includes, side by side, in the double rule. */
export class ComparisonTable extends DsElement {
	static styles = [DsElement.styles, styles]
	static properties = { heading: {}, tag: {}, body: {}, plans: { type: Array }, rows: { type: Array }, titleId: { attribute: 'title-id' }, included: {}, excluded: {} }

	/** The band's line (Vue's `title`). */
	heading = ''
	tag?: string
	body?: string
	plans: string[] = []
	/** Each { feature, values } with a value per plan: true, false or words. */
	rows: ComparisonRow[] = []
	titleId = 'comparison-title'
	included = 'Included'
	excluded = 'Not included'

	render() {
		const head = tag('section-head')
		const cell = (v: boolean | string) => (v === true ? html`<span aria-hidden="true" class="inline-block size-2 bg-home-red"></span><span class="sr-only">${this.included}</span>` : v === false ? html`<span aria-hidden="true" class="inline-block h-px w-3 bg-edge-strong align-middle"></span><span class="sr-only">${this.excluded}</span>` : v)
		return html`<section data-ds="comparison-table" aria-labelledby=${this.titleId} class="mx-auto max-w-[1440px] px-4 pb-24 sm:px-6 lg:px-10 lg:pb-32">${staticHtml`<${head} .heading=${this.heading} .tag=${this.tag} .body=${this.body} .titleId=${this.titleId}></${head}>`}<div class="mt-10 border border-edge outline outline-offset-4 outline-edge"><div class="fade-x overflow-x-auto" tabindex="0" role="region" aria-labelledby=${this.titleId}><table class="w-full min-w-[560px] border-collapse text-left"><thead><tr><th scope="col" class="w-2/5 px-5 py-4 type-meta font-normal text-fg-muted"><span class="sr-only">Feature</span></th>${this.plans.map((p) => html`<th scope="col" class="px-5 py-4 type-heading-3 font-normal text-fg">${p}</th>`)}</tr></thead><tbody>${this.rows.map((r) => html`<tr class="border-t border-edge"><th scope="row" class="px-5 py-4 text-body font-normal text-fg">${r.feature}</th>${r.values.map((v) => html`<td class="px-5 py-4 text-body text-fg">${cell(v)}</td>`)}</tr>`)}</tbody></table></div></div></section>`
	}
}

define('comparison-table', ComparisonTable)
