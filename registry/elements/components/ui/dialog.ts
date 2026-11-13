import { html, nothing, type PropertyValues } from 'lit'
import { X } from 'lucide'
import { DsElement, define } from '@/elements/lib/element'
import { icon } from '@/elements/lib/icon'
import styles from 'virtual:tw'

// Dialog.vue as <conare-dialog>: a native dialog (the console's Modal.vue): the title, a close button, the form. Focus
// stays inside; Escape and the scrim close it. It starts in the first field; with none, focus rests on the window
// itself. `locked`: the scrim does nothing. Square, a hairline, no shadow; it rises 8px over 320ms. Vue's
// v-model:open is the `open` attribute (set it to show the dialog) with an `open-change` event, and `close` fires as
// it closes; Vue's `title` is `heading` (title is HTML's tooltip attribute).

/**
 * @summary A modal dialog for a short form.
 * @slot - The body (a form).
 * @slot foot - Buttons at the end, under the body.
 * @fires open-change - It opened or closed (detail.value; read `open`).
 * @fires close - It closed (Escape, the scrim, the close button, or open set to false).
 */
export class Dialog extends DsElement {
	static styles = [DsElement.styles, styles]
	static properties = { heading: {}, wide: { type: Boolean }, locked: { type: Boolean }, open: { type: Boolean, reflect: true } }

	/** The title, as the window's name too. */
	heading = ''
	/** 720px instead of 480px. */
	wide = false
	/** The scrim does nothing (the window holds what can't be shown again). */
	locked = false
	/** Whether it is showing. */
	open = false

	private get dialog() {
		return this.renderRoot.querySelector('dialog')
	}

	private show() {
		const d = this.dialog
		if (!d || d.open) return
		d.showModal()
		// The first field in the body (a native field, or an element that declares itself a field), else the window.
		const field = [...this.querySelectorAll<HTMLElement>('*')].find((el) => (el.matches('input:not([type="hidden"], [type="file"]), textarea, select') || (el.constructor as { dsField?: boolean }).dsField) && !(el as HTMLInputElement).disabled && !el.closest('[slot="foot"]'))
		const box = field?.shadowRoot?.querySelector('input, textarea, select, button') ?? field
		;(field && box && box.getBoundingClientRect().bottom <= d.getBoundingClientRect().bottom ? field : d).focus()
	}

	protected updated(changed: PropertyValues<this>) {
		super.updated(changed)
		if (!changed.has('open')) return
		if (this.open) this.show()
		else if (this.dialog?.open) this.dialog.close()
	}

	private setOpen(open: boolean) {
		if (this.open === open) return
		this.open = open
		this.emit('open-change', { value: open })
		if (!open) this.emit('close')
	}

	// A click on the scrim lands on the dialog element itself.
	private backdrop(event: MouseEvent) {
		if (event.target === this.dialog && !this.locked) this.setOpen(false)
	}

	render() {
		return html`<dialog data-ds="dialog" class="ds-dialog" ?data-wide=${this.wide} tabindex="-1" aria-label=${this.heading} @close=${() => this.setOpen(false)} @click=${this.backdrop}>
			<div class="flex items-center justify-between gap-4 pt-4 pr-4 pl-6">
				<h2 class="type-ui-strong">${this.heading}</h2>
				<button type="button" class="inline-flex size-control-sm shrink-0 cursor-pointer items-center justify-center border border-transparent text-fg-soft transition-[color,border-color] duration-120 ease-standard hover:border-edge-strong hover:text-fg max-md:size-control-touch" aria-label="close" @click=${() => this.setOpen(false)}>${icon(X, 'x', { size: 14, strokeWidth: 1.5 })}</button>
			</div>
			<div class="ds-dialog-body px-6 pt-4 pb-6"><slot></slot></div>
			${this.hasSlot('foot') ? html`<div class="flex justify-end gap-2 px-6 pb-6"><slot name="foot"></slot></div>` : nothing}
		</dialog>`
	}
}

define('dialog', Dialog)
