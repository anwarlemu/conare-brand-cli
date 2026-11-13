import { html, nothing, type PropertyValues } from 'lit'
import { ifDefined } from 'lit/directives/if-defined.js'
import { X } from 'lucide'
import { DsElement, define } from '@/elements/lib/element'
import { icon } from '@/elements/lib/icon'
import { SheetController } from '@/elements/controllers/sheet'
import styles from 'virtual:tw'

// Sheet.vue as <conare-sheet>: a panel at the right edge over the page (the docs panel, console2.css .v2-docs): 420px
// (the screen on a phone), a hairline at its edge, the 48px bar with the title and a close button, then the body (20px
// 26px 48px), scrolling on its own. It is modal: the page dims to 16% under it and stays inert. It comes in 16px from
// the right over 220ms on the strong ease-out and leaves in 160ms; Escape closes it at once; focus returns to what
// opened it. Vue's v-model:open is the reflected `open` attribute with an `open-change` event; Vue's `title` is
// `heading`.

/**
 * @summary A modal panel at the right edge, for docs or details beside the page.
 * @slot - The body.
 * @slot bar - Controls in the bar, before the close button.
 * @slot foot - Buttons at the foot.
 * @fires open-change - It opened or closed (detail.value; read `open`).
 */
export class Sheet extends DsElement {
	static styles = [DsElement.styles, styles]
	static properties = { heading: {}, description: {}, open: { type: Boolean, reflect: true } }

	/** The bar's title, and the panel's name. */
	heading = ''
	/** A line over the body. */
	description?: string
	/** Whether it is showing. */
	open = false

	private sheet = new SheetController(this, () => this.renderRoot.querySelector('dialog'), (open) => this.setOpen(open))

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
		return html`<dialog data-ds="sheet" class="ds-sheet" data-shown=${ifDefined(this.sheet.shown ? 'true' : undefined)} aria-label=${this.heading} tabindex="-1" @cancel=${this.sheet.onCancel} @click=${this.sheet.onClick}>
			<div class="flex h-bar shrink-0 items-center gap-1 border-b border-edge pr-2 pl-6.5">
				<h2 class="min-w-0 flex-1 truncate type-ui-strong">${this.heading}</h2>
				<slot name="bar"></slot>
				<button type="button" class="inline-flex size-control-sm shrink-0 cursor-pointer items-center justify-center border border-transparent text-fg-soft transition-[color,border-color] duration-120 ease-standard hover:border-edge-strong hover:text-fg focus-visible:outline-2 focus-visible:outline-edge-focus max-md:size-control-touch" aria-label="close" @click=${() => this.setOpen(false)}>${icon(X, 'x', { size: 14, strokeWidth: 1.5 })}</button>
			</div>
			<div class="min-h-0 flex-1 overflow-y-auto overscroll-contain px-6.5 pt-5 pb-12" data-sheet-body>
				${this.description ? html`<p class="mb-4 type-ui text-fg-soft">${this.description}</p>` : nothing}
				<slot></slot>
			</div>
			${this.hasSlot('foot') ? html`<div class="flex shrink-0 justify-end gap-2 border-t border-edge px-6.5 py-3"><slot name="foot"></slot></div>` : nothing}
		</dialog>`
	}
}

define('sheet', Sheet)
