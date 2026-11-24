import { html, nothing } from 'lit'
import { html as staticHtml } from 'lit/static-html.js'
import { define, tag } from '@/elements/lib/element'
import { SiteFrameElement } from '@/elements/components/site/site-page'
import '@/elements/components/site/section-head'
import styles from 'virtual:tw'

// CareersPage.vue as <conare-careers-page>: the open roles: the page's head, then a row per role in the website's double
// rule (its name in Faculty Glyphic, the team and the place under it, the whole row a link that takes the paper under
// the pointer), or the line the page gives when there are none. In the site's frame (site-page). `heading` is Vue's
// `title`.
export type CareersRole = { title: string, team?: string, place?: string, href: string }

/**
 * @summary The open roles, a row each in the double rule.
 * @slot logo - The logo in the header's home link.
 * @slot actions - The header's buttons.
 * @slot sheet-actions - The same buttons again, for the header's sheet on phones.
 */
export class CareersPage extends SiteFrameElement {
	static styles = [SiteFrameElement.styles, styles]
	static properties = { tag: {}, heading: {}, body: {}, roles: { type: Array }, empty: {} }

	tag?: string
	/** The page's line (Vue's `title`). */
	heading = ''
	body?: string
	/** Each { title, team?, place?, href }. */
	roles: CareersRole[] = []
	/** The line shown when there are no roles. */
	empty = ''

	render() {
		const head = tag('section-head')
		return this.frame('careers-page', staticHtml`<section aria-labelledby="careers-title" class="mx-auto max-w-[1440px] px-4 pt-14 pb-32 sm:px-6 lg:px-10 lg:pt-20 lg:pb-40"><${head} as="h1" title-id="careers-title" .tag=${this.tag} .heading=${this.heading} .body=${this.body}></${head}>${this.roles.length ? html`<ul aria-label="Open roles" class="mx-auto mt-14 grid max-w-[1008px] gap-px border border-edge bg-edge outline outline-offset-4 outline-edge">${this.roles.map((r) => html`<li class="flex bg-surface"><a href=${r.href} class="ds-role-link flex w-full flex-col gap-1 px-5 py-5 sm:flex-row sm:items-baseline sm:justify-between sm:px-6"><span class="type-heading-3 text-fg">${r.title}</span>${r.team || r.place ? html`<span class="type-meta text-fg-muted">${[r.team, r.place].filter(Boolean).join(' · ')}</span>` : nothing}</a></li>`)}</ul>` : this.empty ? html`<p class="mx-auto mt-14 max-w-[1008px] border border-edge px-5 py-6 text-center type-ui text-fg-muted outline outline-offset-4 outline-edge">${this.empty}</p>` : nothing}</section>`)
	}
}

define('careers-page', CareersPage)
