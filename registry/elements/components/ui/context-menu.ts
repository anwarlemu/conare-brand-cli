import { html, nothing } from 'lit'
import { DsElement, define, tagName } from '@/elements/lib/element'
import { PopoverController, popoverStyles } from '@/elements/lib/popover'
import styles from 'virtual:tw'

// ContextMenu.vue as <conare-context-menu>: a menu's panel and rows (<conare-menu-item>, <conare-menu-label>,
// <conare-menu-separator>, each with slot="menu") opened at the pointer: a right-click (or a long press on Android) on
// the default slot opens the `menu` slot where it landed, flipped and kept inside the viewport, in the top layer. From
// the keyboard, Shift+F10 or the context menu key opens it under the focused element, at once, on its first row.
// Arrows, Home and End move; Escape closes and returns focus; choosing a row closes it. `open` fires with what was
// clicked (detail.context: the closest [data-context] value), so one menu serves a list.

/**
 * @summary A menu opened at the pointer by a right-click or Shift+F10.
 * @slot - What the menu is for (a list whose rows carry data-context).
 * @slot menu - The rows: <conare-menu-item slot="menu">, labels and separators.
 * @fires open - It is opening (detail.context: the closest [data-context] value).
 */
export class ContextMenu extends DsElement {
	static styles = [DsElement.styles, popoverStyles, styles]
	static properties = { label: {}, width: {} }

	/** The menu's name for assistive tech. */
	label = ''
	width?: string
	private pop = new PopoverController(this, {
		side: 'bottom',
		align: 'start',
		gap: 0,
		anchor: () => null,
		panel: () => this.renderRoot.querySelector<HTMLElement>('.ds-pop'),
	})

	private rows() {
		return [...this.querySelectorAll<HTMLElement & { disabled?: boolean }>(`${tagName('menu-item')}[slot="menu"]`)].filter((r) => !r.disabled)
	}
	private context(event: Event) {
		return (event.composedPath()[0] as HTMLElement | null)?.closest?.<HTMLElement>('[data-context]')?.dataset.context
	}
	private onContextMenu = async (event: MouseEvent) => {
		event.preventDefault()
		this.emit('open', { context: this.context(event) })
		await this.pop.show({ at: { x: event.clientX, y: event.clientY } })
		this.renderRoot.querySelector<HTMLElement>('.ds-pop')?.focus({ preventScroll: true })
	}
	private onKey = async (event: KeyboardEvent) => {
		if (event.key !== 'ContextMenu' && !(event.shiftKey && event.key === 'F10')) return
		event.preventDefault()
		const r = (event.composedPath()[0] as HTMLElement).getBoundingClientRect()
		this.emit('open', { context: this.context(event) })
		await this.pop.show({ keyboard: true, at: { x: r.left + 8, y: r.bottom } })
		await this.updateComplete
		this.rows()[0]?.focus()
	}
	// Vue's onMenuRows: arrows, Home and End over the rows; Tab closes.
	private onMenuKey = (event: KeyboardEvent) => {
		const rows = this.rows()
		const at = rows.findIndex((r) => r.matches(':focus-within'))
		if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
			event.preventDefault()
			const step = event.key === 'ArrowDown' ? 1 : -1
			rows[(at + step + rows.length) % rows.length]?.focus()
		} else if (event.key === 'Home' || event.key === 'End') {
			event.preventDefault()
			;(event.key === 'Home' ? rows[0] : rows.at(-1))?.focus()
		} else if (event.key === 'Tab') this.pop.hide(false)
	}
	// A chosen row closes the menu (a row looks for a <conare-menu> around it, which a context menu is not).
	private onSelect = (event: Event) => {
		const row = event.target as HTMLElement & { keepOpen?: boolean }
		if (row.localName === tagName('menu-item') && !row.keepOpen) this.pop.hide(true)
	}

	connectedCallback() {
		super.connectedCallback()
		this.addEventListener('select', this.onSelect)
	}
	disconnectedCallback() {
		super.disconnectedCallback()
		this.removeEventListener('select', this.onSelect)
	}
	render() {
		const panel = this.pop.rendered
			? html`<div data-ds="context-menu" popover="manual" class="ds-pop flex flex-col p-1" role="menu" aria-label=${this.label} tabindex="-1" data-side=${this.pop.pos.side} ?data-instant=${this.pop.instant} ?data-placed=${this.pop.pos.placed} style=${this.pop.style(`width: ${this.width ?? '224px'}`)} @keydown=${this.onMenuKey} @focusout=${this.pop.onFocusOut}><slot name="menu"></slot></div>`
			: nothing
		return html`<div data-ds="context-menu" @contextmenu=${this.onContextMenu} @keydown=${this.onKey}><slot></slot></div>${panel}`
	}
}

define('context-menu', ContextMenu)
