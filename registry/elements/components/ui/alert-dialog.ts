import { html, type LitElement, type PropertyValues } from 'lit'
import { DsElement, define, tag, uid } from '@/elements/lib/element'
import { html as staticHtml } from 'lit/static-html.js'
import '@/elements/components/ui/button'
import styles from 'virtual:tw'

// AlertDialog.vue as <conare-alert-dialog>: a question that needs an answer before anything else (Dialog's window,
// Modal.vue): the title, one line saying what happens, then Cancel and the action, the danger button for what removes
// something. Focus starts on Cancel; the scrim does nothing, so only a choice closes it; Escape cancels and focus
// returns to what opened it. It rises 8px over 320ms, as the dialog. In a row, a held danger button
// (<conare-hold-button>) is better. Vue's v-model:open is the `open` attribute with `open-change`; Vue's `title` is
// `heading` (title is HTML's tooltip attribute); `cancel` is the Cancel button's label, and the `cancel` event fires
// when it is chosen (or on Escape).

/**
 * @summary A question that needs an answer before anything else.
 * @slot - More about what happens, under the line.
 * @fires confirm - The action was chosen.
 * @fires cancel - Cancel was chosen, or Escape pressed.
 * @fires open-change - It opened or closed (detail.value).
 */
export class AlertDialog extends DsElement {
	static styles = [DsElement.styles, styles]
	static properties = { heading: {}, description: {}, action: {}, cancel: {}, danger: { converter: { fromAttribute: (v: string | null) => v !== 'false' } }, open: { type: Boolean, reflect: true } }

	/** The question (Vue's `title`). */
	heading = ''
	/** One line saying what happens. */
	description = ''
	/** The action button's label. */
	action = ''
	/** The Cancel button's label. */
	cancel = 'Cancel'
	/** The danger button for the action; danger="false" draws the dark one. */
	danger = true
	open = false
	private dialogId = uid('alert')
	private returnTo: HTMLElement | null = null

	private get dialog() {
		return this.renderRoot.querySelector('dialog')
	}
	private async show() {
		const d = this.dialog
		if (!d || d.open) return
		let a = document.activeElement as Element | null
		while (a?.shadowRoot?.activeElement) a = a.shadowRoot.activeElement
		this.returnTo = a instanceof HTMLElement ? a : null
		d.showModal()
		const cancel = d.querySelector<LitElement>('[data-cancel]')
		await cancel?.updateComplete
		;(cancel?.shadowRoot?.querySelector('button') ?? cancel)?.focus()
	}
	private close() {
		if (this.dialog?.open) this.dialog.close()
		this.returnTo?.focus({ preventScroll: true })
		this.returnTo = null
	}
	protected updated(changed: PropertyValues<this>) {
		super.updated(changed)
		if (!changed.has('open')) return
		if (this.open) void this.show()
		else if (changed.get('open') !== undefined) this.close()
	}
	private setOpen(open: boolean) {
		if (this.open === open) return
		this.open = open
		this.emit('open-change', { value: open })
	}
	private onCancel = (event: Event) => {
		event.preventDefault()
		this.emit('cancel')
		this.setOpen(false)
	}
	private choose(confirmed: boolean) {
		this.emit(confirmed ? 'confirm' : 'cancel')
		this.setOpen(false)
	}

	render() {
		const button = tag('button')
		return html`<dialog data-ds="alert-dialog" class="ds-alert" role="alertdialog" aria-labelledby=${`${this.dialogId}-title`} aria-describedby=${`${this.dialogId}-text`} @cancel=${this.onCancel}>
			<h2 id=${`${this.dialogId}-title`} class="type-ui-strong">${this.heading}</h2>
			<p id=${`${this.dialogId}-text`} class="mt-2 type-ui text-fg-soft">${this.description}</p>
			<slot></slot>
			<div class="mt-6 flex justify-end gap-2">
				${staticHtml`<${button} data-cancel @click=${() => this.choose(false)}>${this.cancel}</${button}><${button} variant=${this.danger ? 'danger' : 'dark'} @click=${() => this.choose(true)}>${this.action}</${button}>`}
			</div>
		</dialog>`
	}
}

define('alert-dialog', AlertDialog)
