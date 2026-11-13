import { html } from 'lit'
import { DsElement, define } from '@/elements/lib/element'
import styles from 'virtual:tw'

// MarkedText.vue as <conare-marked-text>: a passage with the query's words in medium weight and ink (Marked.vue,
// utils/marks.ts), so the reader sees why it matched. Words of three letters or fewer ("a", "the", "to") don't count.
// Never a fill or a colour for a match. Each word is its own span with its place in `--w`, so a reveal can play the
// passage in reading order.
function marks(text: string, query: string): Array<{ text: string, hit: boolean }> {
	const words = [...new Set(query.toLowerCase().match(/[\p{L}\p{N}]{4,}/gu) ?? [])]
	if (!words.length) return [{ text, hit: false }]
	const pattern = new RegExp(`(${words.map((w) => w.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join('|')})`, 'giu')
	return text.split(pattern).filter(Boolean).map((part) => ({ text: part, hit: words.includes(part.toLowerCase()) }))
}

/**
 * @summary A passage with the query's words marked in medium weight and ink.
 */
export class MarkedText extends DsElement {
	static styles = [DsElement.styles, styles]
	static properties = { text: {}, query: {} }

	/** The passage. */
	text = ''
	/** The question asked of it: its words of four letters or more are marked. */
	query = ''

	render() {
		let w = 0
		const words = marks(this.text, this.query).flatMap((r) => r.text.split(/(\s+)/).filter(Boolean).map((t) => ({ text: t, hit: r.hit, w: /\s/.test(t) ? -1 : w++ })))
		return html`<span data-ds="marked-text" class="ds-words">${words.map((t) => (t.w < 0 ? t.text : t.hit ? html`<strong class="ds-word font-medium text-fg" style="--w: ${t.w}">${t.text}</strong>` : html`<span class="ds-word" style="--w: ${t.w}">${t.text}</span>`))}</span>`
	}
}

define('marked-text', MarkedText)
