import { html as staticHtml } from 'lit/static-html.js'
import { define, tag } from '@/elements/lib/element'
import { SiteFrameElement, closing, type SiteAction } from '@/elements/components/site/site-page'
import type { Feature } from '@/elements/components/site/feature-grid'
import type { Logo } from '@/elements/components/site/logo-strip'
import '@/elements/components/site/button-link'
import '@/elements/components/site/feature-grid'
import '@/elements/components/site/logo-strip'
import '@/elements/components/site/section-head'
import '@/elements/components/site/testimonial'
import styles from 'virtual:tw'

// FeaturesPage.vue as <conare-features-page>: a product's page: the head with the one dark call to action, what it
// does (feature-grid), what it connects to (logo-strip), one customer's words (testimonial) and the closing band, in
// the site's frame (site-page).

/**
 * @summary A product's page: the head, its features, what it connects to, a quote and the closing band.
 * @slot logo - The logo in the header's home link.
 * @slot actions - The header's buttons.
 * @slot sheet-actions - The same buttons again, for the header's sheet on phones.
 */
export class FeaturesPage extends SiteFrameElement {
	static styles = [SiteFrameElement.styles, styles]
	static properties = { head: { type: Object }, features: { type: Object }, logos: { type: Object }, testimonial: { type: Object }, cta: { type: Object } }

	head: { tag?: string, title: string, body?: string, action: SiteAction } = { title: '', action: { label: '', href: '' } }
	features: { title: string, tag?: string, body?: string, features: Feature[] } = { title: '', features: [] }
	logos: { title: string, tag?: string, logos: Logo[] } = { title: '', logos: [] }
	testimonial: { quote: string, role: string, company: string } = { quote: '', role: '', company: '' }
	cta = { title: '', action: { label: '', href: '' } }

	render() {
		const [sectionHead, button, logos, grid, quote] = [tag('section-head'), tag('button-link'), tag('logo-strip'), tag('feature-grid'), tag('testimonial')]
		const h = this.head
		const f = this.features
		const l = this.logos
		const t = this.testimonial
		return this.frame('features-page', staticHtml`<section aria-labelledby="features-page-title" class="mx-auto max-w-[1440px] px-4 pt-14 pb-20 sm:px-6 lg:px-10 lg:pt-20 lg:pb-28"><${sectionHead} as="h1" title-id="features-page-title" .tag=${h.tag} .heading=${h.title} .body=${h.body}><${button} slot="action" href=${h.action.href} grain pixels arrow>${h.action.label}</${button}></${sectionHead}></section><${grid} .heading=${f.title} .tag=${f.tag} .body=${f.body} .features=${f.features}></${grid}><${logos} .heading=${l.title} .tag=${l.tag} .logos=${l.logos}></${logos}><${quote} .quote=${t.quote} .jobTitle=${t.role} .company=${t.company}></${quote}>${closing(this.cta)}`)
	}
}

define('features-page', FeaturesPage)
