import { html } from 'lit'
import { ChevronDown } from 'lucide'
import { accordionOf } from '@/elements/controllers/accordion'
import { DsElement, define, uid } from '@/elements/lib/element'
import { icon } from '@/elements/lib/icon'
import styles from 'virtual:tw'

// AccordionItem.vue as <conare-accordion-item>: one row of an accordion: the question as a full-width button (40px,
// 13px soft text that turns ink under the pointer and while open) over a hairline, and the answer under it. The closed
// answer is inert, so its links leave the tab order. `heading` (Vue's `title`) or the `title` slot names the row; the
// default slot is the answer.

/**
 * @summary One row of an accordion.
 * @slot - The answer.
 * @slot title - The question, in place of `heading`.
 */
export class AccordionItem extends DsElement {
	static styles = [DsElement.styles, styles]
	static properties = { value: {}, heading: {}, disabled: { type: Boolean } }

	/** The value the accordion opens it by. */
	value = ''
	/** The question (Vue's `title`). */
	heading?: string
	disabled = false
	private rowId = uid('accordion')

	render() {
		const ctx = accordionOf(this)
		const open = ctx?.isOpen(this.value) ?? false
		return html`<div data-ds="accordion-item" class="border-b border-edge" data-open=${String(open)}>
			<h3>
				<button id=${`${this.rowId}-head`} type="button" aria-expanded=${String(open)} aria-controls=${`${this.rowId}-body`} ?disabled=${this.disabled} class="flex min-h-row w-full cursor-pointer items-center justify-between gap-3 py-2 text-left type-ui text-fg-soft transition-colors duration-120 ease-standard hover:text-fg aria-expanded:text-fg disabled:cursor-default disabled:text-fg-muted" @click=${() => ctx?.toggle(this.value)}><slot name="title">${this.heading}</slot>${icon(ChevronDown, 'chevron-down', { size: 12, strokeWidth: 1.5, class: 'shrink-0 text-fg-muted transition-[rotate] duration-200 ease-standard motion-reduce:transition-none', attrs: { 'aria-hidden': 'true' } })}</button>
			</h3>
			<div id=${`${this.rowId}-body`} role="region" aria-labelledby=${`${this.rowId}-head`} ?inert=${!open} class="ds-collapse" data-open=${String(open)}>
				<div><div class="ds-collapse-body pb-3 type-ui text-fg-soft"><slot></slot></div></div>
			</div>
		</div>`
	}
}

define('accordion-item', AccordionItem)
