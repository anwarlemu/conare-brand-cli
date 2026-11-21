import { html, nothing, type PropertyValues } from 'lit'
import { html as staticHtml } from 'lit/static-html.js'
import { DsElement, define, tag, tagName, uid } from '@/elements/lib/element'
import type { ProductMenuItem } from '@/elements/components/site/product-menu'
import '@/elements/components/site/product-menu'
import styles from 'virtual:tw'

// SiteHeader.vue as <conare-site-header>: the website header (home/Header.vue): solid off-white, 64px, a hairline under it, three columns so the links sit on
// the page's true center whatever the widths of the logo (the `logo` slot) and the buttons (the `actions` slot). The links are
// 14px soft, the Product menu first. Two paper blocks glide under them on transform: one rests on the current link
// (`current`, or `productCurrent`) with its red square, the other follows the pointer or focus, appearing in place on
// the first link and fading when it leaves the row. Below 768px the links fold into a sheet under the bar, opened by a
// square button whose 3 by 3 red squares turn into an X: the sheet unrolls on a clip and its rows rise in one after
// another; a link, Escape or a wider window closes it, quickly and all at once.
//
// Vue's `actions` slot renders twice; a slot shows its nodes once, so the bar's buttons go in `actions` and the
// sheet's copies in `sheet-actions`. `items`, `more` and `links` are JSON attributes or properties.
export interface SiteLink { label: string, href: string, current?: boolean }
// The two blocks: x and width of the item they sit under, drawn as a 1px block scaled to it so only transform moves.
interface Mark { x: number, w: number, shown: boolean, instant: boolean }

/** The nav item an event came from or an element marked current, through the Product menu's shadow root. */
function navItem(path: EventTarget[]) {
	return path.find((n): n is HTMLElement => n instanceof HTMLElement && n.hasAttribute('data-nav-item'))
}

/**
 * @summary The website header: the logo, the links with the Product menu, the buttons, and a sheet on phones.
 * @slot logo - The logo in the home link.
 * @slot actions - The bar's buttons.
 * @slot sheet-actions - The same buttons again, for the sheet on phones.
 */
export class SiteHeader extends DsElement {
	static styles = [DsElement.styles, styles]
	static properties = { items: { type: Array }, more: { type: Array }, links: { type: Array }, productCurrent: { type: Boolean, attribute: 'product-current' }, homeHref: { attribute: 'home-href' }, homeLabel: { attribute: 'home-label' }, menu: { state: true }, restMark: { state: true }, hoverMark: { state: true }, ready: { state: true } }

	/** The Product menu's items. */
	items: ProductMenuItem[] = []
	/** The Product menu's extra links. */
	more: ProductMenuItem[] = []
	links: SiteLink[] = []
	/** The Product menu is the current place. */
	productCurrent = false
	homeHref = '/'
	homeLabel = 'home'
	private menu = false
	private restMark: Mark | null = null
	private hoverMark: Mark | null = null
	// The page's first frame places the blocks and colors without gliding into them.
	private ready = false
	private sheetId = uid('site-menu')
	private mq?: MediaQueryList

	private get row() {
		return this.renderRoot.querySelector<HTMLElement>('ul[data-row]')
	}
	private measure(item: HTMLElement, mark: Mark | null): Mark | null {
		const row = this.row
		if (!row) return mark
		return { x: item.getBoundingClientRect().left - row.getBoundingClientRect().left, w: item.offsetWidth, shown: true, instant: !mark?.shown }
	}
	private point = (event: Event) => {
		const item = navItem(event.composedPath())
		if (item) this.hoverMark = this.measure(item, this.hoverMark)
	}
	private rest(instant = false) {
		const row = this.row
		const menu = row?.querySelector(tagName('product-menu'))
		const here = row?.querySelector<HTMLElement>('[data-nav-item][aria-current]') ?? menu?.shadowRoot?.querySelector<HTMLElement>('[data-nav-item][aria-current]')
		if (here) this.restMark = this.measure(here, instant ? null : this.restMark)
		else if (this.restMark) this.restMark = { ...this.restMark, shown: false }
	}
	private leave = (event?: FocusEvent) => {
		if (event && event.relatedTarget instanceof Node && (this.row?.contains(event.relatedTarget) || this.contains(event.relatedTarget))) return
		if (this.hoverMark) this.hoverMark = { ...this.hoverMark, shown: false }
	}
	private onKey = (event: KeyboardEvent) => {
		if (event.key === 'Escape') this.menu = false
	}
	private onWide = (event: MediaQueryListEvent) => {
		if (event.matches) this.menu = false
	}

	connectedCallback() {
		super.connectedCallback()
		document.addEventListener('keydown', this.onKey)
		this.mq = window.matchMedia('(min-width: 768px)')
		this.mq.addEventListener('change', this.onWide)
	}
	disconnectedCallback() {
		super.disconnectedCallback()
		document.removeEventListener('keydown', this.onKey)
		this.mq?.removeEventListener('change', this.onWide)
	}

	protected async firstUpdated(changed: PropertyValues) {
		super.firstUpdated(changed)
		// The Product menu draws its button first.
		const menu = this.row?.querySelector(tagName('product-menu')) as (HTMLElement & { updateComplete?: Promise<unknown> }) | null
		await menu?.updateComplete
		this.rest(true)
		void document.fonts?.ready.then(() => this.rest(true))
		requestAnimationFrame(() => requestAnimationFrame(() => { this.ready = true }))
	}

	protected updated(changed: PropertyValues) {
		super.updated(changed)
		// A new current link: the resting block goes there.
		if (this.hasUpdated && (changed.has('links') || changed.has('productCurrent')) && changed.get('links') !== undefined) this.rest()
	}

	render() {
		const { items, more, links, menu } = this
		const rowsBefore = items.length + more.length
		const markStyle = (m: Mark | null) => (m ? `transform: translateX(${m.x}px) scaleX(${m.w})` : 'display: none')
		return html`<header data-ds="site-header" class="sticky top-0 z-20 border-b border-edge bg-surface" ?data-ready=${this.ready}><div class="mx-auto grid h-16 max-w-[1440px] grid-cols-[1fr_auto_1fr] items-center px-4 sm:px-6 lg:px-10"><a href=${this.homeHref} aria-label=${this.homeLabel} class="flex shrink-0 justify-self-start outline-none focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-edge-focus"><slot name="logo"></slot></a><div role="navigation" aria-label="primary" class="hidden md:block"><ul data-row class="relative flex items-center gap-1 text-body leading-none text-fg-soft" @pointerover=${this.point} @focusin=${this.point} @pointerleave=${() => this.leave()} @focusout=${this.leave}>${[this.restMark, this.hoverMark].map((m) => html`<li aria-hidden="true" class="ds-site-mark pointer-events-none absolute inset-y-0 left-0 my-auto h-7.5 w-px origin-left bg-surface-subtle" ?data-shown=${!!m?.shown} ?data-instant=${!!m?.instant} style=${markStyle(m)}></li>`)}${staticHtml`<${tag('product-menu')} .items=${items} .more=${more} ?current=${this.productCurrent}></${tag('product-menu')}>`}${links.map((link) => html`<li class="relative flex"><a href=${link.href} data-nav-item aria-current=${link.current ? 'page' : nothing} class=${['ds-navlink-site relative flex items-center py-2 hover:text-fg', link.current ? 'gap-1.5 px-2.5 text-fg' : 'px-4'].join(' ')}>${link.current ? html`<span aria-hidden="true" class="size-1.5 shrink-0 bg-home-red"></span>` : nothing}${link.label}</a></li>`)}</ul></div><div class="col-start-3 flex gap-2 justify-self-end"><div class="flex gap-2 max-md:hidden"><slot name="actions"></slot></div><button type="button" class="ds-site-menu-btn flex size-6.5 cursor-pointer items-center justify-center border border-edge-strong text-fg transition-[border-color] duration-200 ease-standard hover:border-edge-focus focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-edge-focus md:hidden" ?data-open=${menu} aria-expanded=${String(menu)} aria-controls=${this.sheetId} aria-label=${menu ? 'Close menu' : 'Open menu'} @pointerdown=${() => { this.menu = !this.menu }} @click=${(e: MouseEvent) => { if (e.detail === 0) this.menu = !this.menu }}><span aria-hidden="true" class="ds-site-grid">${Array.from({ length: 9 }, (_, i) => html`<i ?data-edge=${(i + 1) % 2 === 0}></i>`)}</span></button></div></div><div id=${this.sheetId} class="ds-site-sheet fade-y absolute inset-x-0 top-full max-h-[calc(100dvh-4rem)] overflow-y-auto border-b border-edge bg-surface md:hidden" ?data-open=${menu} ?inert=${!menu}><div class="mx-auto max-w-[1440px] px-4 pt-4 pb-5 sm:px-6"><p class="ds-site-row ds-site-caps px-1 pb-1 text-caption text-fg-muted" style="--i: 0">Product</p><ul class="border-b border-edge pb-3">${[...items, ...more].map((item, i) => html`<li class="ds-site-row" style="--i: ${i + 1}"><a href=${item.href} class="block px-1 py-2" @click=${() => { this.menu = false }}><span class="block text-body-lg leading-5 font-medium text-fg">${item.label}</span><span class="block text-ui leading-5 text-fg-muted">${item.desc}</span></a></li>`)}</ul><ul class="pt-2">${links.map((link, j) => html`<li class="ds-site-row" style="--i: ${rowsBefore + 1 + j}"><a href=${link.href} class="block px-1 py-2.5 text-body-lg leading-5 text-fg" aria-current=${link.current ? 'page' : nothing} @click=${() => { this.menu = false }}>${link.label}</a></li>`)}</ul><div class="ds-site-row mt-4 grid grid-cols-2 gap-2" style="--i: ${rowsBefore + links.length + 1}" @click=${() => { this.menu = false }}><slot name="sheet-actions"></slot></div></div></div></header>`
	}
}


define('site-header', SiteHeader)
