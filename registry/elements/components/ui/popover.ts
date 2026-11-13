import { html, nothing, type PropertyValues } from 'lit'
import { DsElement, define, uid } from '@/elements/lib/element'
import { firstFocusable, PopoverController, popoverStyles, type Align, type Side } from '@/elements/lib/popover'
import styles from 'virtual:tw'

// Popover.vue as <conare-popover>: Menu's square panel for any content (a short form, a few settings, a note). The
// trigger: a <button slot="trigger"> you style yourself (Vue's triggerClass), or other content in the `trigger` slot,
// drawn as a secondary button. Opening moves focus to the panel's first control (or the panel); Escape, a press
// outside or tabbing away closes it, and Escape returns focus to the trigger. It flips to the side with room and stays
// 8px inside the viewport, in the top layer. Vue's v-model:open is the `open` attribute with `open-change`; the slot's
// `close` is the element's close().

/**
 * @summary A square panel for any content, opened from a button.
 * @slot - The panel's content.
 * @slot trigger - A <button> to use as the trigger, or the default trigger's content.
 * @fires open-change - It opened or closed (detail.value).
 */
export class Popover extends DsElement {
	static styles = [DsElement.styles, popoverStyles, styles]
	static properties = { label: {}, side: {}, align: {}, width: {}, triggerLabel: { attribute: 'trigger-label' }, open: { type: Boolean, reflect: true } }

	/** The panel's name for assistive tech. */
	label = ''
	side: Side = 'bottom'
	align: Align = 'start'
	width = '280px'
	triggerLabel?: string
	open = false
	private panelId = uid('popover')
	private pop = new PopoverController(this, {
		anchor: () => this.trigger,
		panel: () => this.renderRoot.querySelector<HTMLElement>('.ds-pop'),
	})

	private get trigger(): HTMLElement | null {
		return this.querySelector<HTMLElement>(':scope > button[slot="trigger"]') ?? this.renderRoot.querySelector<HTMLElement>('button[data-trigger]')
	}

	/** Closes it; focus returns to the trigger unless refocus is false (the Vue slot's close). */
	close(refocus = true) {
		this.pop.hide(refocus)
	}
	private async show(keyboard = false) {
		await this.pop.show({ keyboard })
		const panel = this.renderRoot.querySelector<HTMLElement>('.ds-pop')
		;(firstFocusable(panel) ?? panel)?.focus({ preventScroll: true })
	}
	// A click from the keyboard has no pointer detail: the panel opens and closes at once.
	private onClick = (event: MouseEvent) => {
		const keyboard = event.detail === 0
		if (this.pop.open) this.pop.hide(keyboard, keyboard)
		else void this.show(keyboard)
	}

	private wired: HTMLElement | null = null
	protected willUpdate(changed: PropertyValues<this>) {
		this.pop.configure({ side: this.side, align: this.align })
		if (changed.has('open') && this.open !== this.pop.open && changed.get('open') !== undefined) {
			if (this.open) void this.show()
			else this.pop.hide()
		}
	}
	protected updated(changed: PropertyValues<this>) {
		super.updated(changed)
		const own = this.querySelector<HTMLElement>(':scope > button[slot="trigger"]')
		if (own && own !== this.wired) {
			own.addEventListener('click', this.onClick)
			own.setAttribute('aria-haspopup', 'dialog')
			this.wired = own
		}
		if (own) {
			own.setAttribute('aria-expanded', String(this.pop.open))
			if (this.triggerLabel) own.setAttribute('aria-label', this.triggerLabel)
		}
		if (this.open !== this.pop.open) {
			this.open = this.pop.open
			this.emit('open-change', { value: this.open })
		}
	}
	protected firstUpdated(changed: PropertyValues<this>) {
		super.firstUpdated(changed)
		if (this.open) void this.show()
	}

	render() {
		const own = !!this.querySelector(':scope > button[slot="trigger"]')
		const trigger = own
			? html`<slot name="trigger"></slot>`
			: html`<button data-ds="popover" data-trigger type="button" class="inline-flex h-control-sm cursor-pointer items-center gap-1.5 border border-action-secondary-edge bg-surface px-2.5 text-meta leading-5 font-medium text-fg transition-[border-color,background-color] duration-120 ease-standard hover:border-action-secondary-edge-hover active:bg-surface-subtle aria-expanded:border-action-secondary-edge-hover max-md:h-control-touch max-md:text-ui" aria-haspopup="dialog" aria-expanded=${String(this.pop.open)} aria-controls=${this.pop.open ? this.panelId : nothing} aria-label=${this.triggerLabel ?? nothing} @click=${this.onClick}><slot name="trigger"></slot></button>`
		const panel = this.pop.rendered
			? html`<div data-ds="popover" id=${this.panelId} popover="manual" class="ds-pop p-3" role="dialog" aria-label=${this.label} tabindex="-1" data-side=${this.pop.pos.side} ?data-instant=${this.pop.instant} ?data-placed=${this.pop.pos.placed} style=${this.pop.style(`width: ${this.width}`)} @focusout=${this.pop.onFocusOut}><slot></slot></div>`
			: nothing
		return html`${trigger}${panel}`
	}
}

define('popover', Popover)
