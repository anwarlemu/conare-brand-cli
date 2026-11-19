import { html as staticHtml } from 'lit/static-html.js'
import { nothing, type PropertyDeclarations } from 'lit'
import { DsElement, define, tag } from '@/elements/lib/element'
import type { FooterLink } from '@/elements/components/site/site-footer'
import type { SiteLink } from '@/elements/components/site/site-header'
import type { ProductMenuItem } from '@/elements/components/site/product-menu'
import '@/elements/components/site/announcement-bar'
import '@/elements/components/site/button-link'
import '@/elements/components/site/call-to-action'
import '@/elements/components/site/site-footer'
import '@/elements/components/site/site-header'
import styles from 'virtual:tw'

// SitePage.vue as <conare-site-page>: every website page's frame (pages/index.vue, pricing.vue, blog): the
// announcement bar if there is one, the header, then the page in <main> on its own off-white ground above the footer,
// which waits pinned under it from 768px and is uncovered as the page scrolls off it. `header` is site-header's
// properties, `footer` site-footer's and `announcement` announcement-bar's (JSON attributes or properties). The
// `logo`, `actions` and `sheet-actions` slots go to the header. `rootName` sets the root's data-ds, for a page built
// on this one, as Vue's fallthrough data-ds does.
export interface SiteHeaderData { items: ProductMenuItem[], more?: ProductMenuItem[], links: SiteLink[], productCurrent?: boolean, homeHref?: string, homeLabel?: string }
export interface SiteFooterData { columns: { title: string, links: FooterLink[] }[], tagline?: string, legal?: string, legalLinks?: FooterLink[], name?: string }
export interface SiteAnnouncement { tag: string, text: string, cta?: string, href: string }
/** A page's call to action: its words and where it goes. */
export type SiteAction = { label: string, href: string }

/**
 * @summary The website page's frame: announcement, header, the page, the pinned footer.
 * @slot - The page.
 * @slot logo - The logo in the header's home link.
 * @slot actions - The header's buttons.
 * @slot sheet-actions - The same buttons again, for the header's sheet on phones.
 */
export class SitePage extends DsElement {
	static styles = [DsElement.styles, styles]
	static properties = { header: { type: Object }, footer: { type: Object }, announcement: { type: Object }, rootName: { attribute: false } }

	/** The header: items, more, links, productCurrent, homeHref, homeLabel. */
	header: SiteHeaderData = { items: [], links: [] }
	/** The footer: columns, tagline, legal, legalLinks, name. */
	footer: SiteFooterData = { columns: [] }
	/** The bar above the header: tag, text, cta, href. */
	announcement?: SiteAnnouncement
	/** The root's data-ds (Vue's fallthrough data-ds). */
	rootName = 'site-page'

	render() {
		const h = this.header
		const f = this.footer
		const a = this.announcement
		const bar = tag('announcement-bar')
		const head = tag('site-header')
		const foot = tag('site-footer')
		return staticHtml`<div data-ds=${this.rootName} class="relative bg-surface text-fg">${a ? staticHtml`<${bar} tag=${a.tag} text=${a.text} cta=${a.cta ?? nothing} href=${a.href}></${bar}>` : nothing}<${head} .items=${h.items} .more=${h.more ?? []} .links=${h.links} ?product-current=${!!h.productCurrent} home-href=${h.homeHref ?? '/'} home-label=${h.homeLabel ?? 'home'}><slot name="logo" slot="logo"></slot><slot name="actions" slot="actions"></slot><slot name="sheet-actions" slot="sheet-actions"></slot></${head}><main class="relative z-10 bg-surface"><slot></slot></main><${foot} .columns=${f.columns} tagline=${f.tagline ?? nothing} legal=${f.legal ?? nothing} .legalLinks=${f.legalLinks ?? []} name=${f.name ?? 'Conare'} pinned></${foot}></div>`
	}
}

define('site-page', SitePage)

/**
 * What every page built on site-page shares: the frame's three properties, and `frame(name, body)`, which draws
 * <conare-site-page> with them, the root named `name`, the header's slots passed on and `body` as the page.
 */
export class SiteFrameElement extends DsElement {
	static properties: PropertyDeclarations = { header: { type: Object }, footer: { type: Object }, announcement: { type: Object } }

	/** The header: items, more, links, productCurrent, homeHref, homeLabel. */
	header: SiteHeaderData = { items: [], links: [] }
	/** The footer: columns, tagline, legal, legalLinks, name. */
	footer: SiteFooterData = { columns: [] }
	/** The bar above the header: tag, text, cta, href. */
	announcement?: SiteAnnouncement

	protected frame(name: string, body: unknown) {
		const page = tag('site-page')
		return staticHtml`<${page} data-ds=${name} .rootName=${name} .header=${this.header} .footer=${this.footer} .announcement=${this.announcement}><slot name="logo" slot="logo"></slot><slot name="actions" slot="actions"></slot><slot name="sheet-actions" slot="sheet-actions"></slot>${body}</${page}>`
	}
}

/** The closing band with its light button, as every page ends. */
export function closing(cta: { title: string, action: SiteAction }) {
	const band = tag('call-to-action')
	const button = tag('button-link')
	return staticHtml`<${band} .heading=${cta.title}><${button} href=${cta.action.href} variant="light" fill="black">${cta.action.label}</${button}></${band}>`
}
