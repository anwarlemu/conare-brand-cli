import { html, nothing } from 'lit'
import { html as staticHtml } from 'lit/static-html.js'
import { define, tag } from '@/elements/lib/element'
import { SiteFrameElement, closing } from '@/elements/components/site/site-page'
import type { DocsBlock } from '@/elements/components/site/docs-blocks'
import '@/elements/components/site/docs-blocks'
import '@/elements/components/site/section-head'
import '@/elements/components/ui/tag'
import styles from 'virtual:tw'

// ChangelogPage.vue as <conare-changelog-page>: what changed, newest first: the head, then each release under a
// hairline, laid out as a policy page (Legal.vue): its date and version tag on the left, held in view from 1024px
// while its notes pass, the title and the notes (docs-blocks) in a 720px column beside it. Then the closing band, in
// the site's frame (site-page).
export type ChangelogEntry = { id: string, date: string, version?: string, title: string, blocks: DocsBlock[] }

/**
 * @summary What changed: each release with its date, version and notes, newest first.
 * @slot logo - The logo in the header's home link.
 * @slot actions - The header's buttons.
 * @slot sheet-actions - The same buttons again, for the header's sheet on phones.
 */
export class ChangelogPage extends SiteFrameElement {
	static styles = [SiteFrameElement.styles, styles]
	static properties = { head: { type: Object }, entries: { type: Array }, cta: { type: Object } }

	head: { tag?: string, title: string, body?: string } = { title: '' }
	entries: ChangelogEntry[] = []
	cta = { title: '', action: { label: '', href: '' } }

	render() {
		const [sectionHead, blocks, badge] = [tag('section-head'), tag('docs-blocks'), tag('tag')]
		const h = this.head
		return this.frame('changelog-page', staticHtml`<section aria-labelledby="changelog-page-title" class="mx-auto max-w-[1440px] px-4 pt-14 pb-32 sm:px-6 lg:px-10 lg:pt-20 lg:pb-40"><${sectionHead} as="h1" title-id="changelog-page-title" .tag=${h.tag} .heading=${h.title} .body=${h.body}></${sectionHead}><ol class="mx-auto mt-16 flex max-w-[1008px] flex-col gap-16">${this.entries.map((e) => html`<li id=${e.id} class="grid scroll-mt-24 grid-cols-[minmax(0,1fr)] gap-6 border-t border-edge pt-10 lg:grid-cols-[224px_minmax(0,720px)] lg:gap-16"><div class="flex items-center gap-3 self-start lg:sticky lg:top-28 lg:flex-col lg:items-start"><time class="type-ui text-fg-muted">${e.date}</time>${e.version ? staticHtml`<${badge}>${e.version}</${badge}>` : nothing}</div><div class="min-w-0"><h2 class="font-heading text-heading-2 font-normal tracking-tight text-fg">${e.title}</h2><div class="mt-6">${staticHtml`<${blocks} .blocks=${e.blocks}></${blocks}>`}</div></div></li>`)}</ol></section>${closing(this.cta)}`)
	}
}

define('changelog-page', ChangelogPage)
