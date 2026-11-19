import { html, nothing } from 'lit'
import { html as staticHtml } from 'lit/static-html.js'
import { define, tag } from '@/elements/lib/element'
import { SiteFrameElement, type SiteAction } from '@/elements/components/site/site-page'
import '@/elements/components/site/button-link'
import '@/elements/components/site/section-head'
import styles from 'virtual:tw'

// NotFoundPage.vue as <conare-not-found-page>: the page for an address that leads nowhere: the tag with the code, one
// line on what happened, the one dark way home, then where people usually meant to go, as cells in the double rule
// that take the paper under the pointer. In the site's frame (site-page), so the header and the footer still lead on.
// `heading` is Vue's `title`.

/**
 * @summary The 404 page: what happened, the way home and the pages people look for.
 * @slot logo - The logo in the header's home link.
 * @slot actions - The header's buttons.
 * @slot sheet-actions - The same buttons again, for the header's sheet on phones.
 */
export class NotFoundPage extends SiteFrameElement {
	static styles = [SiteFrameElement.styles, styles]
	static properties = { code: {}, heading: {}, body: {}, home: { type: Object }, links: { type: Array } }

	code = '404'
	/** The line (Vue's `title`). */
	heading = 'This page is not here.'
	body = 'It moved, or the address has a typo. Start again from the home page.'
	/** The one way home: label and href. */
	home: SiteAction = { label: '', href: '' }
	/** The pages people usually look for. */
	links: SiteAction[] = []

	render() {
		const [sectionHead, button] = [tag('section-head'), tag('button-link')]
		return this.frame('not-found-page', staticHtml`<section aria-labelledby="not-found-title" class="mx-auto max-w-[1440px] px-4 pt-24 pb-32 sm:px-6 lg:px-10 lg:pt-32 lg:pb-40"><${sectionHead} as="h1" title-id="not-found-title" .tag=${this.code} .heading=${this.heading} .body=${this.body}><${button} slot="action" href=${this.home.href} grain pixels arrow>${this.home.label}</${button}></${sectionHead}>${this.links.length ? html`<ul aria-label="Pages people look for" class="mx-auto mt-16 grid max-w-[880px] grid-cols-2 gap-px border border-edge bg-edge outline outline-offset-4 outline-edge sm:grid-cols-4">${this.links.map((l) => html`<li class="flex bg-surface"><a href=${l.href} class="ds-lost-link flex h-16 w-full items-center justify-center px-3 text-body text-fg">${l.label}</a></li>`)}</ul>` : nothing}</section>`)
	}
}

define('not-found-page', NotFoundPage)
