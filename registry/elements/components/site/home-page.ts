import { nothing } from 'lit'
import { html as staticHtml } from 'lit/static-html.js'
import { define, tag } from '@/elements/lib/element'
import { SiteFrameElement, closing, type SiteAction } from '@/elements/components/site/site-page'
import type { Feature } from '@/elements/components/site/feature-grid'
import type { Logo } from '@/elements/components/site/logo-strip'
import '@/elements/components/site/button-link'
import '@/elements/components/site/faq'
import '@/elements/components/site/feature-grid'
import '@/elements/components/site/hero'
import '@/elements/components/site/logo-strip'
import '@/elements/components/site/testimonial'
import styles from 'virtual:tw'

// HomePage.vue as <conare-home-page>: the website's home (pages/index.vue), in its order: the hero with the one dark
// call to action and the window in the red frame (the `window` slot), who connects (logo-strip), what it does
// (feature-grid), one customer's words (testimonial), the questions (faq) and the closing red band (call-to-action),
// in the site's frame (site-page: `header`, `footer`, `announcement`, and the logo, actions and sheet-actions slots).

/**
 * @summary The website's home: hero, logos, features, a quote, questions and the closing band.
 * @slot window - The window in the hero's red frame.
 * @slot logo - The logo in the header's home link.
 * @slot actions - The header's buttons.
 * @slot sheet-actions - The same buttons again, for the header's sheet on phones.
 */
export class HomePage extends SiteFrameElement {
	static styles = [SiteFrameElement.styles, styles]
	static properties = { hero: { type: Object }, logos: { type: Object }, features: { type: Object }, testimonial: { type: Object }, faq: { type: Array }, cta: { type: Object } }

	hero: { eyebrow?: string, title: string, body?: string, action: SiteAction } = { title: '', action: { label: '', href: '' } }
	logos: { title: string, tag?: string, logos: Logo[] } = { title: '', logos: [] }
	features: { title: string, tag?: string, body?: string, features: Feature[] } = { title: '', features: [] }
	testimonial: { quote: string, role: string, company: string } = { quote: '', role: '', company: '' }
	faq: { q: string, a: string }[] = []
	cta = { title: '', action: { label: '', href: '' } }

	render() {
		const [hero, button, logos, grid, quote, faq] = [tag('hero'), tag('button-link'), tag('logo-strip'), tag('feature-grid'), tag('testimonial'), tag('faq')]
		const h = this.hero
		const l = this.logos
		const f = this.features
		const t = this.testimonial
		return this.frame('home-page', staticHtml`<${hero} eyebrow=${h.eyebrow ?? nothing} .heading=${h.title} body=${h.body ?? nothing}><${button} slot="action" href=${h.action.href} grain pixels arrow>${h.action.label}</${button}><slot name="window" slot="window"></slot></${hero}><${logos} .heading=${l.title} .tag=${l.tag} .logos=${l.logos}></${logos}><${grid} .heading=${f.title} .tag=${f.tag} .body=${f.body} .features=${f.features}></${grid}><${quote} .quote=${t.quote} .jobTitle=${t.role} .company=${t.company}></${quote}><${faq} .items=${this.faq}></${faq}>${closing(this.cta)}`)
	}
}

define('home-page', HomePage)
