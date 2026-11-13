import { html } from 'lit'
import { Check, Copy } from 'lucide'
import { DsElement, define } from '@/elements/lib/element'
import { icon } from '@/elements/lib/icon'
import { CopyController } from '@/elements/controllers/copy'
import styles from 'virtual:tw'

// CopyText.vue as <conare-copy-text>: an identifier or an endpoint as typed, with a button that copies it: the value in
// 12px Geist Mono, cut with an ellipsis when it runs out of room (the whole value in its title), and a 20px quiet button
// whose glyph turns to a check for 1.5s. The button is round, as the console draws it, and grows a 44px place to land on
// phones. One value per copy text; never a secret after it was first shown.

/** @summary A value in mono with a quiet button that copies it. */
export class CopyText extends DsElement {
	static styles = [DsElement.styles, styles]
	static properties = { value: {}, label: {} }

	/** The value, as typed. */
	value = ''
	/** What the value is, for the button's name (copy <label>). */
	label = ''
	private copier = new CopyController(this)

	render() {
		const copied = this.copier.copied
		return html`<span data-ds="copy-text" class="inline-flex max-w-full min-w-0 items-center gap-1">
			<code class="truncate font-code text-meta leading-5" title=${this.value}>${this.value}</code>
			<button
				type="button"
				class="relative inline-flex size-5 shrink-0 cursor-pointer items-center justify-center rounded-full text-fg-muted transition-colors duration-150 hover:bg-surface-sunken hover:text-fg pointer-coarse:after:absolute pointer-coarse:after:-inset-3 pointer-coarse:after:content-[''] max-md:after:absolute max-md:after:-inset-3 max-md:after:content-['']"
				aria-label=${copied ? `${this.label} copied` : `copy ${this.label}`}
				@click=${(e: Event) => { e.stopPropagation(); void this.copier.copy(this.value) }}
			>${copied ? icon(Check, 'check', { size: 12, strokeWidth: 1.5, attrs: { 'aria-hidden': 'true' } }) : icon(Copy, 'copy', { size: 12, strokeWidth: 1.5, attrs: { 'aria-hidden': 'true' } })}</button>
		</span>`
	}
}

define('copy-text', CopyText)
