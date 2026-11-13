import { nothing } from 'lit'
import { html } from 'lit/static-html.js'
import { DsElement, define, tag } from '@/elements/lib/element'
import '@/elements/components/ui/code-block'
import '@/elements/components/site/docs-fields'
import '@/elements/components/site/docs-inline'
import '@/elements/components/site/docs-table'
import type { DocsField } from '@/elements/components/site/docs-fields'
import styles from 'virtual:tw'

// DocsBlocks.vue as <conare-docs-blocks>: a docs page's body, block by block (docs/Blocks.vue): paragraphs, headings
// (steps are the smaller ones), lists led by a red square, callouts (a warning on the wash), tables, code in the one
// code window, an endpoint's fields, and the link cards, each in the double rule with a pixel pattern that turns red
// under the pointer. Text takes `code`, **bold** and [links](href). `wide` drops the 880px measure, for a page of
// cards. Follows the theme (data-theme).
export type DocsBlock =
	| { kind: 'p', text: string }
	| { kind: 'h2' | 'h3', id: string, text: string }
	| { kind: 'list', items: string[] }
	| { kind: 'callout', tone: 'note' | 'warning' | 'caution' | (string & {}), text: string }
	| { kind: 'table', head?: string[], rows: string[][] }
	| { kind: 'code', samples: { label: string, code: string }[] }
	| { kind: 'cards', items: { title: string, body: string, href: string }[] }
	| { kind: 'fields', media?: string, fields: DocsField[] }

// The hero tabs' pixel patterns, each a path on a 16px square of 2px cells, centred.
const pattern = (on: (x: number, y: number) => boolean) => {
	const lit: [number, number][] = []
	for (let y = 0; y < 8; y++) for (let x = 0; x < 8; x++) if (on(x, y)) lit.push([x, y])
	const ox = (16 - (Math.max(...lit.map((c) => c[0])) + Math.min(...lit.map((c) => c[0])) + 1) * 2) / 2
	const oy = (16 - (Math.max(...lit.map((c) => c[1])) + Math.min(...lit.map((c) => c[1])) + 1) * 2) / 2
	return lit.map(([x, y]) => `M${x * 2 + ox} ${y * 2 + oy}h2v2h-2Z`).join('')
}
const PATTERNS = [
	pattern((x, y) => x % 2 === 0 && y % 2 === 0),
	pattern((x, y) => (x + y) % 3 === 0),
	pattern((x, y) => (Math.floor(x / 2) + Math.floor(y / 2)) % 2 === 0),
	pattern((_, y) => y % 2 === 0),
]

/** @summary A docs page's body, block by block. */
export class DocsBlocks extends DsElement {
	static styles = [DsElement.styles, styles]
	static properties = { blocks: { type: Array }, wide: { type: Boolean } }

	/** The blocks: { kind: p, h2, h3, list, callout, table, code, cards or fields, ... }. */
	blocks: DocsBlock[] = []
	/** No 880px measure, for a page of cards. */
	wide = false

	private block(b: DocsBlock) {
		const inline = tag('docs-inline')
		const text = (t: string) => html`<${inline} .text=${t}></${inline}>`
		switch (b.kind) {
			case 'h2': return html`<h2 id=${b.id} class="mt-10 scroll-mt-28 text-docs-heading tracking-tight">${b.text}</h2>`
			case 'h3': return html`<h3 id=${b.id} class="mt-4 scroll-mt-28 text-heading-4 font-medium">${b.text}</h3>`
			case 'p': return html`<p class="text-input leading-7 text-fg-muted">${text(b.text)}</p>`
			case 'list': return html`<ul class="flex flex-col gap-2 text-input leading-7 text-fg-muted">${b.items.map((t) => html`<li class="flex gap-3"><span aria-hidden="true" class="mt-2.75 size-1.5 shrink-0 bg-edge-accent"></span><span>${text(t)}</span></li>`)}</ul>`
			case 'callout': return html`<div class="ds-docs-callout flex gap-3 px-4 py-3 type-body-lg" data-tone=${b.tone}><span aria-hidden="true" class="mt-2.25 size-1.5 shrink-0 bg-edge-accent"></span><span>${text(b.text)}</span></div>`
			case 'table': {
				const t = tag('docs-table')
				return html`<${t} .head=${b.head} .rows=${b.rows}></${t}>`
			}
			case 'fields': {
				const f = tag('docs-fields')
				return html`<div>${b.media ? html`<p class="-mt-2 mb-1 type-code-sm text-fg-muted" dir="ltr">${b.media}</p>` : nothing}<${f} .fields=${b.fields}></${f}></div>`
			}
			case 'code': {
				const c = tag('code-block')
				const many = b.samples.length > 1
				return html`<${c} class="my-2" .samples=${many ? b.samples : undefined} .code=${many ? undefined : b.samples[0]?.code} .label=${many ? undefined : b.samples[0]?.label}></${c}>`
			}
			case 'cards': return html`<ul class="my-4 grid gap-6 sm:grid-cols-2">${b.items.map((c, j) => html`<li class="border border-edge-strong outline outline-offset-4 outline-edge-strong">
				<a href=${c.href} class="ds-docs-card flex h-full flex-col gap-4 p-5">
					<svg width="16" height="16" viewBox="0 0 16 16" shape-rendering="crispEdges" aria-hidden="true" class="ds-docs-card-mark"><path d=${PATTERNS[j % 4]!} fill="currentColor"></path></svg>
					<span>
						<span class="block type-heading-3">${c.title}</span>
						<span class="mt-1 block type-body text-fg-muted">${text(c.body)}</span>
					</span>
				</a>
			</li>`)}</ul>`
		}
	}

	render() {
		return html`<div data-ds="docs-blocks" class=${['flex flex-col gap-5 text-fg', this.wide ? '' : 'max-w-220'].join(' ')}>${(this.blocks ?? []).map((b) => this.block(b))}</div>`
	}
}

define('docs-blocks', DocsBlocks)
