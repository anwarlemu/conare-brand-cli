import { html } from 'lit'
import { DsElement, define } from '@/elements/lib/element'
import styles from 'virtual:tw'

// Fact.vue as <conare-fact>: one fact, a 24px hairline box, 12px, the name muted and the value in ink. Inside
// <conare-facts>.

/**
 * @summary One fact: its name, muted, and its value.
 * @slot - The value, in place of `value`.
 */
export class Fact extends DsElement {
	static styles = [DsElement.styles, styles]
	static properties = { name: {}, value: {}, mono: { type: Boolean } }

	/** The fact's name. */
	name = ''
	/** Its value. */
	value?: string
	/** The value in Geist Mono (a domain, an ID). */
	mono = false

	render() {
		return html`<div data-ds="fact" class="flex min-w-0 items-center gap-1.5 border border-edge bg-surface px-2 py-1 type-meta">
			<dt class="text-fg-muted">${this.name}</dt>
			<dd class=${['min-w-0', this.mono ? 'font-code' : ''].join(' ')}><slot>${this.value}</slot></dd>
		</div>`
	}
}

define('fact', Fact)
