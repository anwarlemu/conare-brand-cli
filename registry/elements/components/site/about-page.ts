import { html } from 'lit'
import { html as staticHtml } from 'lit/static-html.js'
import { define, tag } from '@/elements/lib/element'
import { SiteFrameElement, closing } from '@/elements/components/site/site-page'
import type { DocsBlock } from '@/elements/components/site/docs-blocks'
import type { Feature } from '@/elements/components/site/feature-grid'
import '@/elements/components/site/docs-blocks'
import '@/elements/components/site/feature-grid'
import '@/elements/components/site/section-head'
import styles from 'virtual:tw'

// AboutPage.vue as <conare-about-page>: about the company: the head, the story in one narrow column (docs-blocks, as
// a blog post's text), the numbers in the double rule (each large in tabular figures over its label, as a price), what
// the team holds to (feature-grid) and the closing band, in the site's frame (site-page).

/**
 * @summary About the company: the head, the story, the numbers, what the team holds to and the closing band.
 * @slot logo - The logo in the header's home link.
 * @slot actions - The header's buttons.
 * @slot sheet-actions - The same buttons again, for the header's sheet on phones.
 */
export class AboutPage extends SiteFrameElement {
	static styles = [SiteFrameElement.styles, styles]
	static properties = { head: { type: Object }, story: { type: Array }, numbers: { type: Array }, values: { type: Object }, cta: { type: Object } }

	head: { tag?: string, title: string, body?: string } = { title: '' }
	story: DocsBlock[] = []
	numbers: { value: string, label: string }[] = []
	values: { title: string, tag?: string, body?: string, features: Feature[] } = { title: '', features: [] }
	cta = { title: '', action: { label: '', href: '' } }

	render() {
		const [sectionHead, blocks, grid] = [tag('section-head'), tag('docs-blocks'), tag('feature-grid')]
		const h = this.head
		const v = this.values
		return this.frame('about-page', staticHtml`<section aria-labelledby="about-page-title" class="mx-auto max-w-[1440px] px-4 pt-14 pb-16 sm:px-6 lg:px-10 lg:pt-20 lg:pb-20"><${sectionHead} as="h1" title-id="about-page-title" .tag=${h.tag} .heading=${h.title} .body=${h.body}></${sectionHead}><div class="mx-auto mt-12 max-w-[640px]"><${blocks} .blocks=${this.story}></${blocks}></div></section><section aria-label="In numbers" class="mx-auto max-w-[1440px] px-4 pb-24 sm:px-6 lg:px-10 lg:pb-32"><dl class="grid grid-cols-2 gap-px border border-edge bg-edge outline outline-offset-4 outline-edge lg:grid-cols-4">${this.numbers.map((n) => html`<div class="flex flex-col-reverse gap-2 bg-surface px-5 py-6 sm:px-6"><dt class="text-body text-fg-muted">${n.label}</dt><dd class="text-viz-score tracking-display text-fg tabular-nums">${n.value}</dd></div>`)}</dl></section><${grid} .heading=${v.title} .tag=${v.tag} .body=${v.body} .features=${v.features}></${grid}>${closing(this.cta)}`)
	}
}

define('about-page', AboutPage)
