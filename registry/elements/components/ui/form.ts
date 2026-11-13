import { html, nothing, type PropertyValues } from 'lit'
import { DsElement, define } from '@/elements/lib/element'
import styles from 'virtual:tw'

// Form.vue as <conare-form>: a form in the console's grammar (new, composed from Field, Input and Button): fields
// stacked 16px apart, each a <conare-field> with its label over it and its hint or error under it; a `failure` from the
// server in a red-wash box above the actions; the actions (slot="actions") at the end, the main one last. It never
// validates as the first value is typed: the page shows an error once its field is left or the form is sent, and on a
// send with errors focus moves to the first field that is wrong (the first with `invalid` or aria-invalid="true").
//
// A <form> in a shadow root does not own the fields the page puts in its slots, so the element is the form's behavior
// itself: a press on a submit button in it (a <button type="submit"> or an element with type="submit"), or Enter in a
// one-line field, fires `submit`; a press on a reset button fires `reset`. The browser's own bubbles are off, as with
// novalidate. The host is the form's box (Vue's root <form>), so a class on the element lands on it.

const TEXT_INPUT = /^(text|email|password|search|tel|url|number|date|datetime-local|month|time|week)$/

/**
 * @summary A form in the console's grammar: fields, a failure, the actions.
 * @slot - The fields.
 * @slot actions - The buttons at the end, the main one last.
 * @fires submit - It was sent (a submit button or Enter in a field).
 * @fires reset - A reset button was pressed.
 */
export class Form extends DsElement {
	static styles = [DsElement.styles, styles]
	static properties = { failure: {}, label: {} }

	/** A failure from the server, shown above the actions. */
	failure?: string
	/** The form's name for assistive tech. */
	label?: string

	constructor() {
		super()
		this.addEventListener('click', this.onClick)
		this.addEventListener('keydown', this.onKey)
	}

	protected updated(changed: PropertyValues) {
		super.updated(changed)
		// The host is the form, for assistive tech too.
		this.setAttribute('role', 'form')
		if (this.label) this.setAttribute('aria-label', this.label)
		else this.removeAttribute('aria-label')
	}

	/** The control in the event's path that submits or resets, if any. */
	private kind(event: Event): 'submit' | 'reset' | null {
		for (const n of event.composedPath()) {
			if (n === this) break
			if (!(n instanceof HTMLElement)) continue
			const type = n.getAttribute('type')
			const pressable = n.localName === 'button' || n.localName.includes('-')
			if (pressable && (type === 'submit' || type === 'reset')) return n.matches(':disabled, [disabled]') ? null : type
		}
		return null
	}
	private onClick = (event: MouseEvent) => {
		const kind = this.kind(event)
		if (kind === 'submit') this.send()
		else if (kind === 'reset') this.emit('reset')
	}
	// Enter in a one-line field sends it, as in a native form, unless its submit button is disabled.
	private onKey = (event: KeyboardEvent) => {
		if (event.key !== 'Enter' || event.isComposing || event.defaultPrevented) return
		const target = event.composedPath()[0]
		if (!(target instanceof HTMLInputElement) || !TEXT_INPUT.test(target.type)) return
		const button = this.querySelector('[type="submit"]')
		if (button?.matches(':disabled, [disabled]')) return
		event.preventDefault()
		this.send()
	}

	/** Sends it, as a submit button does. */
	async send() {
		this.emit('submit')
		// Vue moves focus after the next render (nextTick), once the errors the submit raised are drawn.
		await new Promise((resolve) => setTimeout(resolve))
		;[...this.querySelectorAll<HTMLElement>('[invalid], [aria-invalid="true"]')][0]?.focus()
	}

	render() {
		return html`<slot></slot>
			${this.failure
				? html`<p class="flex items-start gap-2 border border-transparent bg-surface-danger px-3 py-2 type-meta text-fg-danger" role="alert"><span class="mt-1.5 size-1 shrink-0 bg-edge-accent" aria-hidden="true"></span>${this.failure}</p>`
				: nothing}
			${this.hasSlot('actions') ? html`<div class="flex flex-wrap items-center justify-end gap-2 pt-2"><slot name="actions"></slot></div>` : nothing}`
	}
}

define('form', Form)
