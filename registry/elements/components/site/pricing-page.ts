import { html, nothing } from 'lit'
import { html as staticHtml } from 'lit/static-html.js'
import { define, tag } from '@/elements/lib/element'
import { SiteFrameElement, closing, type SiteAction } from '@/elements/components/site/site-page'
import type { PriceCard } from '@/elements/components/site/pricing-table'
import '@/elements/components/site/button-link'
import '@/elements/components/site/faq'
import '@/elements/components/site/pricing-table'
import '@/elements/components/site/section-head'
import '@/elements/components/visuals/grain'
import '@/elements/components/visuals/room-grid'
import styles from 'virtual:tw'

// PricingPage.vue as <conare-pricing-page>: pricing (pages/pricing.vue): the head with the one dark call to action,
// then each group of prices (pricing-table), then Enterprise, the page's one red block (the hero's frame: the grain
// and the room grid), what its terms cover as off-white cards in the double rule with the light button, its squares
// coming in black; then the questions and the closing band. In the site's frame (site-page).

/**
 * @summary Pricing: the head, each group of prices, Enterprise in red, the questions and the closing band.
 * @slot logo - The logo in the header's home link.
 * @slot actions - The header's buttons.
 * @slot sheet-actions - The same buttons again, for the header's sheet on phones.
 */
export class PricingPage extends SiteFrameElement {
	static styles = [SiteFrameElement.styles, styles]
	static properties = { head: { type: Object }, groups: { type: Array }, enterprise: { type: Object }, faq: { type: Array }, cta: { type: Object } }

	head: { tag?: string, title: string, body?: string, action: SiteAction } = { title: '', action: { label: '', href: '' } }
	groups: { key: string, title: string, body?: string, cards: PriceCard[] }[] = []
	enterprise?: { title: string, body: string, action: SiteAction, items: { name: string, line: string }[] }
	faq: { q: string, a: string }[] = []
	cta = { title: '', action: { label: '', href: '' } }

	render() {
		const [sectionHead, button, table, faq, grain, room] = [tag('section-head'), tag('button-link'), tag('pricing-table'), tag('faq'), tag('grain'), tag('room-grid')]
		const h = this.head
		const e = this.enterprise
		return this.frame('pricing-page', staticHtml`<section aria-labelledby="pricing-page-title" class="mx-auto max-w-[1440px] px-4 pt-14 pb-20 sm:px-6 lg:px-10 lg:pt-20 lg:pb-28"><${sectionHead} as="h1" title-id="pricing-page-title" .tag=${h.tag} .heading=${h.title} .body=${h.body}><${button} slot="action" href=${h.action.href} grain pixels arrow>${h.action.label}</${button}></${sectionHead}></section>${this.groups.map((g) => staticHtml`<${table} .anchor=${g.key} .titleId=${`pricing-${g.key}`} .heading=${g.title} .body=${g.body} .cards=${g.cards}></${table}>`)}${e ? staticHtml`<section aria-labelledby="pricing-enterprise" class="mx-auto max-w-[1440px] px-4 pb-24 sm:px-6 lg:px-10 lg:pb-32"><div class="relative overflow-hidden bg-home-red px-4 py-12 sm:px-8 sm:py-16 lg:px-16 lg:py-20"><${grain}></${grain}><${room}></${room}><div class="pointer-events-none relative grid grid-cols-[minmax(0,1fr)] gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,2.4fr)] lg:gap-16"><div class="flex flex-col items-start"><h2 id="pricing-enterprise" class="ds-enterprise-title font-heading text-heading-2 font-normal tracking-tight text-off-white sm:text-heading-1">${e.title}</h2><p class="mt-4 max-w-[360px] text-input text-off-white/80">${e.body}</p><div class="pointer-events-auto mt-8"><${button} href=${e.action.href} variant="light" fill="black">${e.action.label}</${button}></div></div><ul class="pointer-events-auto grid grid-cols-[minmax(0,1fr)] gap-px border border-edge bg-edge outline outline-offset-4 outline-off-white/40 sm:grid-cols-2 xl:grid-cols-3">${e.items.map((i) => html`<li class="flex flex-col bg-surface px-5 py-6 sm:px-6"><span aria-hidden="true" class="size-1.5 shrink-0 bg-home-red"></span><p class="mt-5 type-heading-3 text-fg">${i.name}</p><p class="mt-2 text-body leading-5.5 text-fg-muted">${i.line}</p></li>`)}</ul></div></div></section>` : nothing}<${faq} .items=${this.faq}></${faq}>${closing(this.cta)}`)
	}
}

define('pricing-page', PricingPage)
