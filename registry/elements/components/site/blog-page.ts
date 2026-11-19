import { html, nothing } from 'lit'
import { html as staticHtml } from 'lit/static-html.js'
import { define, tag } from '@/elements/lib/element'
import { icon } from '@/elements/lib/icon'
import { Search } from 'lucide'
import { SiteFrameElement, closing } from '@/elements/components/site/site-page'
import '@/elements/components/site/blog-card'
import '@/elements/components/site/section-head'
import '@/elements/components/ui/input'
import styles from 'virtual:tw'

// BlogPage.vue as <conare-blog-page>: the blog (pages/blog/index.vue): the head, the categories with a search beside
// them, then the posts three across (blog-card), every card in a row one height; nothing matching says so under a
// hairline. The picked category rests on the paper with its red square, the others muted until the pointer reaches
// them. Then the closing band, in the site's frame (site-page).
export type BlogPost = { href: string, title: string, dek?: string, category: string, author?: string, date?: string }

/**
 * @summary The blog: the head, the categories and a search, the posts as cards and the closing band.
 * @slot logo - The logo in the header's home link.
 * @slot actions - The header's buttons.
 * @slot sheet-actions - The same buttons again, for the header's sheet on phones.
 */
export class BlogPage extends SiteFrameElement {
	static styles = [SiteFrameElement.styles, styles]
	static properties = { head: { type: Object }, categories: { type: Array }, posts: { type: Array }, cta: { type: Object }, category: { state: true }, query: { state: true } }

	head: { tag?: string, title: string } = { title: '' }
	categories: string[] = []
	/** Each a blog card: href, title, dek, category, author, date. */
	posts: BlogPost[] = []
	cta = { title: '', action: { label: '', href: '' } }
	private category = 'All'
	private query = ''

	private onQuery(event: Event) {
		this.query = (event.target as HTMLElement & { value: string }).value
	}

	render() {
		const [sectionHead, card, input] = [tag('section-head'), tag('blog-card'), tag('input')]
		const q = this.query.trim().toLowerCase()
		const shown = this.posts.filter((p) => (this.category === 'All' || p.category === this.category) && (!q || `${p.title} ${p.dek ?? ''}`.toLowerCase().includes(q)))
		return this.frame('blog-page', staticHtml`<section aria-labelledby="blog-page-title" class="mx-auto max-w-[1440px] px-4 pt-14 pb-32 sm:px-6 lg:px-10 lg:pt-20 lg:pb-40"><${sectionHead} as="h1" title-id="blog-page-title" .tag=${this.head.tag} .heading=${this.head.title}></${sectionHead}><div class="mt-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between"><div role="group" aria-label="Categories" class="flex flex-wrap gap-1 text-body leading-none">${['All', ...this.categories].map((c) => html`<button type="button" aria-pressed=${String(this.category === c)} class=${['ds-blog-cat flex h-7.5 cursor-pointer items-center gap-2 px-3', this.category === c ? 'bg-surface-subtle text-fg' : 'text-fg-muted'].join(' ')} @click=${() => { this.category = c }}>${this.category === c ? html`<span aria-hidden="true" class="size-1.5 bg-home-red"></span>` : nothing}${c}</button>`)}</div><div class="w-full sm:w-70"><${input} .value=${this.query} type="search" placeholder="Search" aria-label="Search the blog" @input=${this.onQuery} @keydown=${(e: KeyboardEvent) => { if (e.key === 'Escape') this.query = '' }}>${icon(Search, 'search', { size: 12, strokeWidth: 1.5, attrs: { slot: 'icon' } })}</${input}></div></div>${shown.length ? html`<ul class="mt-12 grid grid-cols-[minmax(0,1fr)] gap-6 md:grid-cols-2 lg:grid-cols-3">${shown.map((p) => html`<li class="flex">${staticHtml`<${card} href=${p.href} .heading=${p.title} .dek=${p.dek} category=${p.category} .author=${p.author} .date=${p.date}></${card}>`}</li>`)}</ul>` : html`<p class="mt-12 border-t border-edge pt-6 text-body text-fg-muted">${q ? `Nothing matches "${this.query}".` : `Nothing in ${this.category} yet.`}</p>`}</section>${closing(this.cta)}`)
	}
}

define('blog-page', BlogPage)
