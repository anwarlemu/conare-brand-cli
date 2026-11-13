import { html } from 'lit'
import { DsElement, define } from '@/elements/lib/element'
import styles from 'virtual:tw'

// DocsInline.vue as <conare-docs-inline>: a line of docs text with its `code`, **bold** and [links](href) set
// (docs/Inline.vue): code in the mono on the paper, bold in ink, links in the red with a quiet underline that turns full
// under the pointer. The host lays out nothing, so the text flows in the line around it.
type Part = { kind: 'text' | 'code' | 'bold', text: string } | { kind: 'link', text: string, href: string }

export function docsParts(text: string): Part[] {
	const out: Part[] = []
	const re = /`([^`]+)`|\[([^\]]+)\]\(([^)]+)\)|\*\*(.+?)\*\*/g
	let last = 0
	for (const m of text.matchAll(re)) {
		if (m.index > last) out.push({ kind: 'text', text: text.slice(last, m.index) })
		if (m[1] !== undefined) out.push({ kind: 'code', text: m[1] })
		else if (m[4] !== undefined) out.push({ kind: 'bold', text: m[4] })
		else out.push({ kind: 'link', text: m[2]!, href: m[3]! })
		last = m.index + m[0].length
	}
	if (last < text.length) out.push({ kind: 'text', text: text.slice(last) })
	return out
}

/** @summary A line of docs text with its code, bold and links set. */
export class DocsInline extends DsElement {
	static styles = [DsElement.styles, styles]
	static properties = { text: {} }

	/** The text: `code`, **bold** and [links](href). */
	text = ''

	render() {
		return html`${docsParts(this.text ?? '').map((p) => (p.kind === 'code'
			? html`<code data-ds="docs-inline" dir="ltr" class="ds-docs-code">${p.text}</code>`
			: p.kind === 'link'
				? html`<a data-ds="docs-inline" href=${p.href} class="ds-docs-link">${p.text}</a>`
				: p.kind === 'bold'
					? html`<strong data-ds="docs-inline" class="font-medium text-fg">${p.text}</strong>`
					: p.text))}`
	}
}

define('docs-inline', DocsInline)
