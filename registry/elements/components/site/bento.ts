import { html } from 'lit'
import { html as staticHtml } from 'lit/static-html.js'
import { DsElement, define, tag } from '@/elements/lib/element'
import '@/elements/components/site/section-head'
import styles from 'virtual:tw'

// Bento.vue as <conare-bento>: what a product does as a bento: the band's head, then cells of different sizes in the
// website's double rule. A large cell takes two columns and two rows from 1024px (two columns from 640px), a wide one
// two columns, a tall one two rows. Each cell is off-white, led by a red pixel pattern, its name in Faculty Glyphic and
// its line, muted. `heading` is Vue's `title`.
export type BentoCell = { title: string, body: string, size?: 'large' | 'wide' | 'tall' }

const span = (c: BentoCell) => (c.size === 'large' ? 'sm:col-span-2 lg:row-span-2' : c.size === 'wide' ? 'sm:col-span-2' : c.size === 'tall' ? 'lg:row-span-2' : '')
const pattern = (on: (x: number, y: number) => boolean) => {
	const lit: [number, number][] = []
	for (let y = 0; y < 8; y++) for (let x = 0; x < 8; x++) if (on(x, y)) lit.push([x, y])
	const ox = (16 - (Math.max(...lit.map(c => c[0])) + Math.min(...lit.map(c => c[0])) + 1) * 2) / 2
	const oy = (16 - (Math.max(...lit.map(c => c[1])) + Math.min(...lit.map(c => c[1])) + 1) * 2) / 2
	return lit.map(([x, y]) => `M${x * 2 + ox} ${y * 2 + oy}h2v2h-2Z`).join('')
}
const PATTERNS = [
	pattern((x, y) => x % 2 === 0 && y % 2 === 0),
	pattern((x, y) => (x + y) % 3 === 0),
	pattern((x, y) => (Math.floor(x / 2) + Math.floor(y / 2)) % 2 === 0),
	pattern((_, y) => y % 2 === 0),
]

/** @summary What a product does: cells of different sizes in the double rule. */
export class Bento extends DsElement {
	static styles = [DsElement.styles, styles]
	static properties = { heading: {}, tag: {}, body: {}, cells: { type: Array }, titleId: { attribute: 'title-id' } }

	/** The band's line (Vue's `title`). */
	heading = ''
	tag?: string
	body?: string
	/** Each { title, body, size? } with size large, wide or tall. */
	cells: BentoCell[] = []
	titleId = 'bento-title'

	render() {
		const head = tag('section-head')
		return html`<section data-ds="bento" aria-labelledby=${this.titleId} class="mx-auto max-w-[1440px] px-4 pb-24 sm:px-6 lg:px-10 lg:pb-32">${staticHtml`<${head} .heading=${this.heading} .tag=${this.tag} .body=${this.body} .titleId=${this.titleId}></${head}>`}<ul class="mt-10 grid grid-flow-dense grid-cols-[minmax(0,1fr)] gap-px border border-edge bg-edge outline outline-offset-4 outline-edge sm:grid-cols-2 lg:auto-rows-[minmax(200px,auto)] lg:grid-cols-3">${this.cells.map((c, i) => html`<li class=${['flex flex-col justify-between gap-8 bg-surface px-5 py-6 sm:px-6', span(c)].join(' ')}><svg aria-hidden="true" width="16" height="16" viewBox="0 0 16 16" shape-rendering="crispEdges" class="size-4 shrink-0 text-home-red"><path d=${PATTERNS[i % 4]!} class="fill-current"></path></svg><div><h3 class=${['text-fg', c.size === 'large' ? 'type-heading-2' : 'type-heading-3'].join(' ')}>${c.title}</h3><p class="mt-2 text-body leading-5.5 text-fg-muted">${c.body}</p></div></li>`)}</ul></section>`
	}
}

define('bento', Bento)
