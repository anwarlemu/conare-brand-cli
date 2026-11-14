import { html, nothing } from 'lit'
import { html as staticHtml } from 'lit/static-html.js'
import { DsElement, define, tag, tagName } from '@/elements/lib/element'
import { icon } from '@/elements/lib/icon'
import { Menu as MenuIcon, X } from 'lucide'
import type { Crumb } from '@/elements/components/ui/breadcrumb'
import '@/elements/components/ui/breadcrumb'
import '@/elements/components/ui/sidebar'
import '@/elements/components/ui/top-bar'
import styles from 'virtual:tw'

// ConsoleFrame.vue as <conare-console-frame>: the console's layout (layouts/console.vue) for page compositions: the Sidebar at the left, sticky at the screen's
// height, the TopBar with the trail over the page. Below 768px the sidebar is a drawer: the bar's menu button slides
// it in over a dimmed page (240ms in, 180ms out, on the strong ease-out), a tap on the page or Escape closes it.
// The `head` slot takes the workspace switcher, `foot` the account menu, `bar` what sits at the bar's end.
// The sidebar's labels and links go in the `nav` slot (<conare-sidebar-label>, <conare-sidebar-link> with its icon):
// Vue's `groups` carry icon components, which a page without a build has no way to pass. A link pressed closes the
// drawer and fires `navigate` ({ link }) after its default is prevented. `crumbs` is a JSON attribute or a property.

/**
 * @summary The console's layout: the sidebar, the top bar with the trail, and the page.
 * @slot - The page.
 * @slot nav - The sidebar's labels and links.
 * @slot head - The workspace switcher.
 * @slot foot - The account menu.
 * @slot bar - What sits at the bar's end.
 * @fires navigate - A sidebar link was pressed ({ link }).
 */
export class ConsoleFrame extends DsElement {
	static styles = [DsElement.styles, styles]
	static properties = { crumbs: { type: Array }, open: { state: true } }

	/** The trail in the top bar. */
	crumbs: Crumb[] = []
	private open = false

	private onClick = (event: MouseEvent) => {
		const link = event.composedPath().find((n) => n instanceof Element && n.localName === tagName('sidebar-link'))
		if (!link) return
		event.preventDefault()
		this.open = false
		this.emit('navigate', { link })
	}

	render() {
		const open = this.open
		return html`<div data-ds="console-frame" class="flex min-h-screen bg-surface" @keydown=${(e: KeyboardEvent) => { if (e.key === 'Escape') this.open = false }} @click=${this.onClick}>${staticHtml`<${tag('sidebar')} label="console" class="ds-frame-side shrink-0" ?data-open=${open}>${this.hasSlot('head') ? html`<slot name="head" slot="head"></slot>` : nothing}<slot name="nav"></slot>${this.hasSlot('foot') ? html`<slot name="foot" slot="foot"></slot>` : nothing}</${tag('sidebar')}>`}${open ? html`<div class="fixed inset-0 z-20 bg-scrim-light md:hidden" aria-hidden="true" @click=${() => { this.open = false }}></div>` : nothing}<div class="flex min-w-0 flex-1 flex-col">${staticHtml`<${tag('top-bar')}><button slot="start" type="button" class="-ml-2 inline-flex size-control-touch shrink-0 cursor-pointer items-center justify-center border border-transparent text-fg-soft transition-[color,border-color] duration-120 ease-standard hover:border-edge hover:text-fg md:hidden" aria-expanded=${String(open)} aria-label=${open ? 'close menu' : 'open menu'} @click=${() => { this.open = !this.open }}>${open ? icon(X, 'x', { size: 14, strokeWidth: 1.5 }) : icon(MenuIcon, 'menu', { size: 14, strokeWidth: 1.5 })}</button><${tag('breadcrumb')} .items=${this.crumbs} @navigate=${(e: CustomEvent<{ event: Event }>) => e.detail.event.preventDefault()}></${tag('breadcrumb')}>${this.hasSlot('bar') ? html`<slot name="bar" slot="end"></slot>` : nothing}</${tag('top-bar')}>`}<main class="min-w-0 flex-1"><slot></slot></main></div></div>`
	}
}

define('console-frame', ConsoleFrame)
