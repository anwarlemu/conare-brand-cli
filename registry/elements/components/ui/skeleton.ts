import { html } from 'lit'
import { DsElement, define } from '@/elements/lib/element'
import styles from 'virtual:tw'

// Skeleton.vue as <conare-skeleton>: loading is never empty (console2.css [data-held], useHeld.ts): a held part is the
// real part drawn from a blank record. Its layout and its rules stay and nothing in it shows, so nothing moves when the
// answer lands, and the rules come in after 300ms, so a fast answer never shows them. Never a shimmer block. Wrap the
// real markup and set `held` while it loads (held="false" once loaded).
//
// Its content is the page's, so the held rules go to the page once and the marks (data-held, aria-busy, aria-label)
// go on the page's elements: on the element itself, the held part; or, with `target` (a selector, such as "tbody >
// tr"), on each element inside it that matches, for table rows (Vue's as="tr"), which no element can stand in for,
// since an HTML parser drops a <tr> anywhere but in a table.

/** Skeleton.vue's <style>. */
const RULES = `
[data-held] { color: transparent !important; pointer-events: none; }
[data-held] * { visibility: hidden; }
tr[data-held] > * { visibility: visible; color: transparent !important; }
tr[data-held] > *, :not(tr)[data-held] { animation: ds-held-in var(--ds-duration-enter) var(--ds-easing-out) 300ms backwards; }
@keyframes ds-held-in { from { border-color: transparent; } }
`
const sheets = new WeakSet<Document | ShadowRoot>()
function adoptRules(root: Node) {
	if (!(root instanceof Document || root instanceof ShadowRoot) || sheets.has(root)) return
	const sheet = new CSSStyleSheet()
	sheet.replaceSync(RULES)
	root.adoptedStyleSheets = [...root.adoptedStyleSheets, sheet]
	sheets.add(root)
}

/** On by default, as in Vue: held="false" turns it off. */
const onByDefault = { fromAttribute: (v: string | null) => v !== 'false' }

/**
 * @summary A held part while it loads: the real markup, its rules kept, nothing in it shown.
 * @slot - The real markup, drawn from a blank record while held.
 */
export class Skeleton extends DsElement {
	static styles = [DsElement.styles, styles]
	static properties = { held: { converter: onByDefault }, target: { reflect: true }, label: {} }

	/** Loading. */
	held = true
	/** A selector for the page's elements to hold (each table row: "tbody > tr"); none holds the element itself. */
	target?: string
	/** What assistive tech hears while held. */
	label = 'Loading'

	connectedCallback() {
		super.connectedCallback()
		adoptRules(this.getRootNode())
	}

	private mark(el: Element) {
		el.toggleAttribute('data-held', this.held)
		if (this.held) {
			el.setAttribute('aria-busy', 'true')
			el.setAttribute('aria-label', this.label)
		} else {
			el.removeAttribute('aria-busy')
			el.removeAttribute('aria-label')
		}
	}

	protected updated() {
		if (!this.target) return this.mark(this)
		for (const el of this.querySelectorAll(this.target)) {
			el.setAttribute('data-ds', 'skeleton')
			this.mark(el)
		}
	}

	render() {
		return html`<slot @slotchange=${() => this.updated()}></slot>`
	}
}

define('skeleton', Skeleton)
