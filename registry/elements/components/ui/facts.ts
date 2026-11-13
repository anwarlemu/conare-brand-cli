import { html } from 'lit'
import { repeat } from 'lit/directives/repeat.js'
import { DsElement, define, tag } from '@/elements/lib/element'
import { html as staticHtml } from 'lit/static-html.js'
import '@/elements/components/ui/fact'
import styles from 'virtual:tw'

// Facts.vue as <conare-facts>: short facts about one thing (console2.css .v2-fact): each a small hairline box with its
// name, muted, and its value, so a row of them wraps cleanly. Pass `facts`, or write <conare-fact> inside. `mono` sets a
// value in Geist Mono (a domain, an ID). Six at most; a value that needs a sentence is not a fact.
export type FactItem = { name: string, value: string, mono?: boolean }

/**
 * @summary Short facts about one thing, each a small hairline box.
 * @slot - <conare-fact> elements, in place of `facts`.
 */
export class Facts extends DsElement {
	static styles = [DsElement.styles, styles]
	static properties = { facts: { type: Array } }

	/** The facts: [{ name, value, mono? }]. */
	facts: FactItem[] = []

	render() {
		const fact = tag('fact')
		return html`<dl class="contents"><slot>${repeat(this.facts ?? [], (f) => f.name, (f) => staticHtml`<${fact} name=${f.name} value=${f.value} ?mono=${!!f.mono}></${fact}>`)}</slot></dl>`
	}
}

define('facts', Facts)
