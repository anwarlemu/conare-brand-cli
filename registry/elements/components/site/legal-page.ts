import { html, nothing } from 'lit'
import { html as staticHtml } from 'lit/static-html.js'
import { define, tag } from '@/elements/lib/element'
import { SiteFrameElement, closing, type SiteAction } from '@/elements/components/site/site-page'
import type { DocsBlock } from '@/elements/components/site/docs-blocks'
import '@/elements/components/site/docs-blocks'
import '@/elements/components/ui/site-tag'
import styles from 'virtual:tw'

// LegalPage.vue as <conare-legal-page>: a page of policy text (Legal.vue: terms, privacy, disclosure): from 1024px, on
// the left in the double rule, the page's sections, held in view, the one being read on the paper with the red square;
// beside it the tag, the title, when it was last updated and the text (docs-blocks), each section with its id. Then
// the closing band, if any. In the site's frame (site-page). `heading` is Vue's `title`. The sections live in this
// element's shadow root, so the side links scroll to them themselves.
export type LegalSection = { id: string, label: string, blocks: DocsBlock[] }

/**
 * @summary A page of policy text with its sections at the side.
 * @slot logo - The logo in the header's home link.
 * @slot actions - The header's buttons.
 * @slot sheet-actions - The same buttons again, for the header's sheet on phones.
 */
export class LegalPage extends SiteFrameElement {
	static styles = [SiteFrameElement.styles, styles]
	static properties = { tag: {}, heading: {}, lastUpdated: { attribute: 'updated' }, intro: { type: Array }, sections: { type: Array }, cta: { type: Object }, active: { state: true } }

	tag?: string
	/** The page's title (Vue's `title`). */
	heading = ''
	/** When it last changed, as written (Vue's `updated`; `updated` is Lit's hook). */
	lastUpdated = ''
	intro: DocsBlock[] = []
	sections: LegalSection[] = []
	cta?: { title: string, action: SiteAction }
	private active = ''

	private track = () => {
		let on = this.sections[0]?.id ?? ''
		for (const s of this.sections) {
			const el = this.renderRoot.querySelector(`[id="${s.id}"]`)
			if (el && el.getBoundingClientRect().top < 160) on = s.id
		}
		this.active = on
	}
	connectedCallback() {
		super.connectedCallback()
		window.addEventListener('scroll', this.track, { passive: true })
	}
	disconnectedCallback() {
		window.removeEventListener('scroll', this.track)
		super.disconnectedCallback()
	}
	protected firstUpdated() {
		this.track()
	}
	// An id inside a shadow root is out of the address bar's reach: the link scrolls to its section and keeps the hash.
	private go(event: MouseEvent, id: string) {
		const el = this.renderRoot.querySelector(`[id="${id}"]`)
		if (!el) return
		event.preventDefault()
		el.scrollIntoView()
		// A fragment link leaves focus on the page, as the browser's own does.
		;(event.currentTarget as HTMLElement).blur()
		history.replaceState(history.state, '', `#${id}`)
	}

	render() {
		const [blocks, siteTag] = [tag('docs-blocks'), tag('site-tag')]
		const active = this.active || this.sections[0]?.id
		return this.frame('legal-page', staticHtml`<div class="mx-auto grid max-w-[1440px] grid-cols-[minmax(0,1fr)] gap-12 px-4 pt-14 pb-32 sm:px-6 lg:grid-cols-[224px_minmax(0,720px)] lg:gap-16 lg:px-10 lg:pt-20 lg:pb-40"><div role="navigation" aria-label="On this page" class="hidden lg:block"><div class="sticky top-28 border border-edge p-5 outline outline-offset-4 outline-edge"><p class="type-ui-strong text-fg">On this page</p><ul class="-mx-2 mt-2 flex flex-col">${this.sections.map((s) => html`<li><a href=${`#${s.id}`} aria-current=${s.id === active ? 'location' : nothing} class=${['ds-legal-side relative flex items-center py-1.5 ps-5 pe-2 type-ui', s.id === active ? 'bg-surface-subtle text-fg' : 'text-fg-muted'].join(' ')} @click=${(e: MouseEvent) => this.go(e, s.id)}>${s.id === active ? html`<span aria-hidden="true" class="absolute start-2 top-1/2 -mt-0.75 size-1.5 bg-home-red"></span>` : nothing}${s.label}</a></li>`)}</ul></div></div><article class="min-w-0">${this.tag ? html`<p class="mb-4 flex">${staticHtml`<${siteTag}>${this.tag}</${siteTag}>`}</p>` : nothing}<h1 class="ds-legal-title font-heading text-heading-2 font-normal tracking-tight text-fg sm:text-heading-1">${this.heading}</h1><p class="mt-3 text-body text-fg-faint">${`Last updated ${this.lastUpdated}`}</p><div class="mt-12 flex flex-col gap-12">${this.intro.length ? staticHtml`<${blocks} .blocks=${this.intro}></${blocks}>` : nothing}${this.sections.map((s) => html`<section id=${s.id} aria-labelledby=${`${s.id}-title`} class="scroll-mt-28"><h2 id=${`${s.id}-title`} class="text-docs-heading tracking-tight text-fg">${s.label}</h2><div class="mt-5">${staticHtml`<${blocks} .blocks=${s.blocks}></${blocks}>`}</div></section>`)}</div></article></div>${this.cta ? closing(this.cta) : nothing}`)
	}
}

define('legal-page', LegalPage)
