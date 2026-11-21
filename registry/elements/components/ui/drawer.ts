import { html, nothing, type PropertyValues } from 'lit'
import { ifDefined } from 'lit/directives/if-defined.js'
import { X } from 'lucide'
import { DsElement, define } from '@/elements/lib/element'
import { icon } from '@/elements/lib/icon'
import { SheetController } from '@/elements/controllers/sheet'
import styles from 'virtual:tw'

// Drawer.vue as <conare-drawer>: a panel that slides in from an edge over a dimmed page (the console's phone sidebar,
// console2.css .v2-side on a phone): `left` (the default) and `right` are min(300px, 84vw) and full height, `bottom` is
// the screen's width and up to 85% of its height. It slides its own size in over 240ms on the strong ease-out and out
// in 180ms; the scrim is the page at 16%. A tap on the scrim or Escape (at once) closes it, and focus returns to what
// opened it. The heading is for screen readers unless `bar` shows it in a 48px bar with a close button. Vue's
// v-model:open is the reflected `open` attribute with an `open-change` event; Vue's `title` is `heading`; the slot's
// `close` is the element's close().

/**
 * @summary A panel that slides in from an edge over a dimmed page.
 * @slot - The panel's content.
 * @fires open-change - It opened or closed (detail.value; read `open`).
 */
export class Drawer extends DsElement {
	static styles = [DsElement.styles, styles]
	static properties = { heading: {}, side: { reflect: true }, bar: { type: Boolean }, open: { type: Boolean, reflect: true } }

	/** The panel's name, shown in the bar with `bar`. */
	heading = ''
	side: 'left' | 'right' | 'bottom' = 'left'
	/** The 48px bar with the heading and a close button. */
	bar = false
	/** Whether it is showing. */
	open = false

	private sheet = new SheetController(this, () => this.renderRoot.querySelector('dialog'), (open) => this.setOpen(open))

	/** Closes it, with its exit (the Vue slot's close). */
	close() {
		this.setOpen(false)
	}
	private setOpen(open: boolean) {
		if (this.open === open) return
		this.open = open
		this.emit('open-change', { value: open })
	}

	// Vue's watch(open) and onMounted: show when it opens (or starts open), hide when it closes.
	protected updated(changed: PropertyValues) {
		super.updated(changed)
		if (!changed.has('open')) return
		if (this.open) void this.sheet.show()
		else if (changed.get('open') !== undefined) void this.sheet.hide()
	}

	render() {
		return html`<dialog data-ds="drawer" class="ds-drawer" data-side=${this.side} data-shown=${ifDefined(this.sheet.shown ? 'true' : undefined)} aria-label=${this.heading} tabindex="-1" @cancel=${this.sheet.onCancel} @click=${this.sheet.onClick}>
			${this.bar
				? html`<div class="flex h-bar shrink-0 items-center gap-1 border-b border-edge pr-2 pl-4">
						<h2 class="min-w-0 flex-1 truncate type-ui-strong">${this.heading}</h2>
						<button type="button" class="inline-flex size-control-touch shrink-0 cursor-pointer items-center justify-center border border-transparent text-fg-soft transition-[color,border-color] duration-120 ease-standard hover:border-edge-strong hover:text-fg focus-visible:outline-2 focus-visible:outline-edge-focus" aria-label="close" @click=${() => this.close()}>${icon(X, 'x', { size: 14, strokeWidth: 1.5 })}</button>
					</div>`
				: nothing}
			<div class="fade-y flex min-h-0 flex-1 flex-col overflow-y-auto overscroll-contain" data-sheet-body><slot></slot></div>
		</dialog>`
	}
}

define('drawer', Drawer)
