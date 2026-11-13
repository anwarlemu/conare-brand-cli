import { html, type PropertyValues } from 'lit'
import { ifDefined } from 'lit/directives/if-defined.js'
import { Check, Copy } from 'lucide'
import { DsElement, define } from '@/elements/lib/element'
import { icon } from '@/elements/lib/icon'
import { CopyController } from '@/elements/controllers/copy'
import styles from 'virtual:tw'

// CodeCopy.vue as <conare-code-copy>: the code window's Copy (the console's CodeCopy.vue): on the dark bar, the icon and
// the word swap in one cell, so nothing moves. Used by <conare-code-block>; `light` is its form on the paper install line.

/**
 * @summary The code window's Copy: the icon and the word swap in one cell.
 * @fires copied - The text is on the clipboard.
 */
export class CodeCopy extends DsElement {
	static styles = [DsElement.styles, styles]
	static properties = { text: {}, light: { type: Boolean } }

	/** What it copies. */
	text = ''
	/** Its form on the paper install line. */
	light = false
	private copier = new CopyController(this)

	// Where the clipboard is refused, the copy command's fallback hands focus back to document.activeElement, which is
	// this element's host, not the button inside it; the button takes focus back itself, as it keeps it in Vue.
	private async run() {
		const button = this.renderRoot.querySelector('button')
		const had = (this.renderRoot as ShadowRoot).activeElement === button
		const ok = await this.copier.copy(this.text)
		if (had && button && (this.renderRoot as ShadowRoot).activeElement !== button) button.focus()
		if (ok) this.emit('copied')
	}

	// The glyphs' data-on is set on the nodes Lit keeps (their markup never changes), so the swap's transition runs.
	protected updated(changed: PropertyValues) {
		super.updated(changed)
		const copied = this.copier.copied
		const [a, b] = this.renderRoot.querySelectorAll('.ds-codecopy-icon > svg')
		a?.toggleAttribute('data-on', !copied)
		b?.toggleAttribute('data-on', copied)
	}

	render() {
		const copied = this.copier.copied
		const on = (v: boolean) => ifDefined(v ? 'true' : undefined)
		return html`<button data-ds="code-copy" type="button" class="ds-codecopy" data-light=${on(this.light)} @click=${() => this.run()}>
			<span class="ds-codecopy-icon" aria-hidden="true">${icon(Copy, 'copy', { size: 12, strokeWidth: 1.5 })}${icon(Check, 'check', { size: 12, strokeWidth: 2 })}</span>
			<span class="ds-codecopy-word"><span data-on=${on(!copied)} aria-hidden=${String(copied)}>Copy</span><span data-on=${on(copied)} aria-hidden=${String(!copied)}>Copied</span></span>
			<span class="sr-only" aria-live="polite">${copied ? 'copied' : ''}</span>
		</button>`
	}
}

define('code-copy', CodeCopy)
