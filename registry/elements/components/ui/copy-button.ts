import { html } from 'lit'
import { ifDefined } from 'lit/directives/if-defined.js'
import { Copy } from 'lucide'
import { DsElement, define } from '@/elements/lib/element'
import { icon } from '@/elements/lib/icon'
import { CopyController } from '@/elements/controllers/copy'
import styles from 'virtual:tw'

// CopyButton.vue as <conare-copy-button>: the copy button beside a value, a new key or an endpoint (the console's
// Copy.vue, version 2 "Copy to Copied", the one picked): the console's secondary button. The label swaps in place, Copy
// leaving up and Copied coming up from below, and the check draws its stroke; the width is the longer word's, so
// nothing moves.

/**
 * @summary Copies a value; its label swaps to Copied in place.
 * @fires copied - The text is on the clipboard.
 */
export class CopyButton extends DsElement {
	static styles = [DsElement.styles, styles]
	static properties = { text: {}, label: {}, rootName: { attribute: false } }

	/** What it copies. */
	text = ''
	/** The word at rest. */
	label = 'Copy'
	/** The data-ds its box says: copy-button, or the name of an item drawn as one (Vue's data-ds falls through). */
	rootName = 'copy-button'
	private copier = new CopyController(this)

	private async run() {
		if (await this.copier.copy(this.text)) this.emit('copied')
	}

	render() {
		const copied = this.copier.copied
		return html`<button data-ds="${this.rootName}" part="control" type="button" class="ds-copy" data-done=${ifDefined(copied ? 'true' : undefined)} @click=${() => this.run()}>
			<span class="ds-copy-icon" data-state=${copied ? 'b' : 'a'} aria-hidden="true">
				${icon(Copy, 'copy', { size: 12, strokeWidth: 1.5, class: 'ds-copy-a' })}
				<svg class="ds-copy-b ds-copy-check" viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 12 9 17 20 6" pathLength="1"></path></svg>
			</span>
			<span class="ds-copy-word"><span data-on=${ifDefined(copied ? undefined : 'true')} aria-hidden=${String(copied)}>${this.label}</span><span data-on=${ifDefined(copied ? 'true' : undefined)} aria-hidden=${String(!copied)}>Copied</span></span>
		</button>`
	}
}

define('copy-button', CopyButton)
