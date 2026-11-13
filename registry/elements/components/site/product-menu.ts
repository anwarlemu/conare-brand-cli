import { html, nothing, type PropertyValues } from 'lit'
import { html as staticHtml } from 'lit/static-html.js'
import { DsElement, define, tag, uid } from '@/elements/lib/element'
import { icon } from '@/elements/lib/icon'
import { GlideMarkController } from '@/elements/controllers/glide-mark'
import { ChevronDown } from 'lucide'
import '@/elements/components/visuals/grain'
import styles from 'virtual:tw'

// ProductMenu.vue as <conare-product-menu>: the website header's Product dropdown (home/ProductMenu.vue): one column of the products with their one line, a
// rule, then the extra links (benchmarks, pricing), beside a portrait of the one under the pointer or focus on the dark
// grained panel, crossfading between items and playing again each time it shows (slot `window`). One highlight, the
// paper with a red square at its left, glides between items (glide-mark's useGlideMark, 160ms) while the item's title eases right to clear the
// square; it rests on the portrait's item when the pointer leaves the list. It opens on hover for a mouse and on
// press for touch and the keyboard; Escape (focus back on the button) or a press outside closes it. `current` gives the
// button the header's resting block and red square. Render it as an item of the header's link list.
//
// Each item's window goes in the slot `window-<index>` (Vue's scoped `#window`): the element puts `active` on what is in
// it (and on anything inside that takes `active`, a viz window) while that item shows, so it plays again each time;
// an item with nothing in its slot shows a plain window with its label. `open` opens it from a script. `items` and
// `more` are JSON attributes or properties.
export interface ProductMenuItem { label: string, desc: string, href: string }

/**
 * @summary The website header's Product dropdown, with a window for the item under the pointer.
 * @slot window-0 - The first item's window (window-1 the second, and so on through the more links).
 */
export class ProductMenu extends DsElement {
	static styles = [DsElement.styles, styles]
	static properties = { items: { type: Array }, more: { type: Array }, label: {}, current: { type: Boolean }, open: { type: Boolean, reflect: true }, pick: { state: true }, plays: { state: true }, opened: { state: true } }

	items: ProductMenuItem[] = []
	/** The extra links after the rule. */
	more: ProductMenuItem[] = []
	label = 'Product'
	/** The header's resting block and red square on the button. */
	current = false
	/** Whether the panel is open. */
	open = false
	// The portrait's item: the last one pointed at, back to the first on each opening. Each change bumps `plays`.
	private pick = 0
	private plays = 0
	// The portraits are built the first time the menu opens, not with the page.
	private opened = false
	private panelId = uid('product-menu')
	// One highlight for the list, resting on the portrait's item when the pointer leaves.
	private glide = new GlideMarkController(this, () => this.renderRoot.querySelector<HTMLElement>('ul'), () => this.pick)
	private lastHot: number | null = null

	private get all() {
		return [...this.items, ...this.more]
	}

	private onPointerDown = (event: PointerEvent) => {
		if (this.open && !event.composedPath().includes(this)) this.open = false
	}
	private onKeydown = (event: KeyboardEvent) => {
		if (event.key !== 'Escape' || !this.open) return
		this.open = false
		this.renderRoot.querySelector<HTMLButtonElement>('button[aria-expanded]')?.focus()
	}
	private hover(event: PointerEvent, now: boolean) {
		if (event.pointerType === 'mouse') this.open = now
	}
	private leave(event?: FocusEvent) {
		if (event && (event.currentTarget as HTMLElement).contains(event.relatedTarget as Node)) return
		this.glide.leave()
	}

	connectedCallback() {
		super.connectedCallback()
		document.addEventListener('pointerdown', this.onPointerDown)
		document.addEventListener('keydown', this.onKeydown)
	}
	disconnectedCallback() {
		super.disconnectedCallback()
		document.removeEventListener('pointerdown', this.onPointerDown)
		document.removeEventListener('keydown', this.onKeydown)
	}

	protected willUpdate(changed: PropertyValues) {
		super.willUpdate(changed)
		// Vue's watch on the highlight's row: the portrait follows it.
		const hot = this.glide.hot
		if (hot !== this.lastHot) {
			this.lastHot = hot
			if (hot !== null && hot !== this.pick) {
				this.pick = hot
				this.plays += 1
			}
		}
		if (changed.has('open') && this.open) {
			this.opened = true
			this.pick = 0
			this.plays += 1
		}
	}

	protected updated(changed: PropertyValues) {
		super.updated(changed)
		// After the render that shows the panel (Vue's nextTick).
		if (changed.has('open') && this.open) this.glide.settle()
		// Vue's scoped `active`: on each item's slotted window while it shows.
		this.all.forEach((_, i) => {
			const slot = this.renderRoot.querySelector<HTMLSlotElement>(`slot[name="window-${i}"]`)
			const on = this.open && i === this.pick
			for (const el of slot?.assignedElements() ?? []) {
				for (const n of [el, ...el.querySelectorAll('*')]) if (n === el || 'active' in n) n.toggleAttribute('active', on)
			}
		})
	}

	render() {
		const { open, current, label } = this
		const all = this.all
		const m = this.glide.mark
		const hot = this.glide.hot
		return html`<li data-ds="product-menu" class="relative flex" @pointerenter=${(e: PointerEvent) => this.hover(e, true)} @pointerleave=${(e: PointerEvent) => this.hover(e, false)}><button type="button" aria-expanded=${String(open)} aria-controls=${this.panelId} data-nav-item aria-current=${current ? 'location' : nothing} class=${['ds-navlink-site relative flex cursor-pointer items-center gap-1 py-2 hover:text-fg', open || current ? 'text-fg' : '', current ? 'px-2.75' : 'px-4'].join(' ')} @pointerdown=${() => { this.open = !this.open }} @click=${(e: MouseEvent) => { if (e.detail === 0) this.open = !this.open }}>${current ? html`<span aria-hidden="true" class="size-1.5 shrink-0 bg-home-red"></span>` : nothing}${label}${icon(ChevronDown, 'chevron-down', { size: 14, strokeWidth: 1.5, class: ['transition-[rotate] duration-200 ease-out motion-reduce:transition-none', open ? 'rotate-180' : ''].join(' ').trim(), attrs: { 'aria-hidden': 'true' } })}</button><div id=${this.panelId} ?hidden=${!open} class="absolute top-full left-1/2 z-30 -translate-x-1/2 pt-3"><div class="grid w-160 max-w-[calc(100vw-32px)] grid-cols-2 gap-px border border-edge bg-edge"><div class="bg-surface p-2"><p class="ds-product-menu-label px-3 pt-2 pb-1 text-meta text-fg-muted">${label}</p><ul class="relative" @mouseleave=${() => this.leave()} @focusout=${(e: FocusEvent) => this.leave(e)}>${m ? html`<li aria-hidden="true" class="ds-product-mark pointer-events-none absolute inset-x-0 top-0 bg-surface-subtle" ?data-shown=${this.glide.shown} ?data-instant=${this.glide.instant} style=${`height: ${m.h}px; transform: translateY(${m.y}px)`}><span class="ds-product-dot absolute top-3.5 left-3 size-2 bg-home-red"></span></li>` : nothing}${all.map((item, i) => html`${i === this.items.length && this.more.length ? html`<li aria-hidden="true" class="mx-3 my-1 border-t border-edge"></li>` : nothing}<li class="relative" data-glide-row><a href=${item.href} class="block px-3 py-2 outline-none focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-edge-focus" @mouseenter=${() => this.glide.point(i)} @focus=${() => this.glide.point(i)} @click=${() => { this.open = false }}><span class="ds-product-text block text-body leading-5 font-medium text-fg" ?data-hot=${hot === i}>${item.label}</span><span class="block text-ui leading-5 text-fg-muted">${item.desc}</span></a></li>`)}</ul></div><div class="bg-surface p-2"><div aria-hidden="true" class="relative grid h-full min-h-62.5 grid-cols-[minmax(0,1fr)] overflow-hidden bg-ds-neutral-200 text-ds-neutral-300">${staticHtml`<${tag('grain')}></${tag('grain')}>`}${this.opened ? all.map((item, i) => html`<div class="ds-product-art relative flex items-center justify-center px-3 py-4 [grid-area:1/1]" ?data-active=${i === this.pick}>${this.hasSlot(`window-${i}`) ? html`<slot name=${`window-${i}`} @slotchange=${() => this.requestUpdate()}></slot>` : html`<slot name=${`window-${i}`} @slotchange=${() => this.requestUpdate()}><div class="relative w-full max-w-60 border border-ds-neutral-300 bg-ds-neutral-100 text-off-white"><div class="flex h-6 items-center gap-1 border-b border-ds-neutral-300 px-2">${[1, 2, 3].map(() => html`<i class="size-1.5 bg-ds-neutral-300"></i>`)}</div><div class="flex flex-col gap-1 p-3"><span class="type-code-sm">${item.label.toLowerCase()}</span><span class="type-meta text-ds-neutral-500">${item.desc}</span></div></div></slot>`}</div>`) : nothing}</div></div></div></div></li>`
	}
}

define('product-menu', ProductMenu)
