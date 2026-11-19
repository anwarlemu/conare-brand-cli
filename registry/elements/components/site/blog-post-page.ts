import { html, nothing } from 'lit'
import { html as staticHtml } from 'lit/static-html.js'
import { define, tag } from '@/elements/lib/element'
import { SiteFrameElement, type SiteAction } from '@/elements/components/site/site-page'
import type { BlogPost } from '@/elements/components/site/blog-page'
import type { DocsBlock } from '@/elements/components/site/docs-blocks'
import '@/elements/components/site/blog-card'
import '@/elements/components/site/button-link'
import '@/elements/components/site/docs-blocks'
import '@/elements/components/visuals/cell-burst'
import '@/elements/components/visuals/grain'
import styles from 'virtual:tw'

// BlogPostPage.vue as <conare-blog-post-page>: a blog post (pages/blog/[slug].vue): the trail and the title centred, a
// wide dark panel as the picture (the grain and a jumbled sheet of cells in the double rule), who it is from and when,
// the text in one narrow column (docs-blocks), a quiet link on, then more posts from the category (blog-card) under a
// hairline. In the site's frame (site-page).

/**
 * @summary A blog post: the title, the picture, the text in one column and more posts.
 * @slot logo - The logo in the header's home link.
 * @slot actions - The header's buttons.
 * @slot sheet-actions - The same buttons again, for the header's sheet on phones.
 */
export class BlogPostPage extends SiteFrameElement {
	static styles = [SiteFrameElement.styles, styles]
	static properties = { post: { type: Object }, blogHref: { attribute: 'blog-href' }, link: { type: Object }, more: { type: Array } }

	post: { title: string, category: string, author?: string, date?: string, blocks: DocsBlock[], seed?: number } = { title: '', category: '', blocks: [] }
	blogHref = ''
	link?: SiteAction
	more: BlogPost[] = []

	render() {
		const [card, button, blocks, burst, grain] = [tag('blog-card'), tag('button-link'), tag('docs-blocks'), tag('cell-burst'), tag('grain')]
		const p = this.post
		const by = [p.author, p.date].filter(Boolean).join(' · ')
		return this.frame('blog-post-page', staticHtml`<article class="mx-auto max-w-[1440px] px-4 pt-14 pb-24 sm:px-6 lg:px-10 lg:pt-20"><header class="flex flex-col items-center text-center"><p class="flex items-center gap-2 type-ui text-fg-faint"><a href=${this.blogHref} class="ds-post-trail">Blog</a><span aria-hidden="true">/</span><span>${p.category}</span></p><h1 class="ds-post-title mt-4 max-w-[760px] font-heading text-docs-heading font-normal tracking-tight text-fg sm:text-hero">${p.title}</h1></header><div aria-hidden="true" class="relative mx-auto mt-12 aspect-[4/3] max-w-[960px] overflow-hidden border border-edge bg-ds-neutral-200 text-ds-neutral-300 outline outline-offset-4 outline-edge sm:aspect-[2/1]"><${grain}></${grain}><span class="pointer-events-none absolute inset-0 opacity-70"><${burst} seed=${p.seed ?? 31 + p.title.length * 17} jumble></${burst}></span></div>${by ? html`<p class="mt-10 text-center type-ui text-fg-faint">${by}</p>` : nothing}<div class="mx-auto mt-10 max-w-[640px]"><${blocks} .blocks=${p.blocks}></${blocks}>${this.link ? staticHtml`<div class="mt-12 flex justify-start"><${button} href=${this.link.href} variant="secondary" size="sm">${this.link.label}</${button}></div>` : nothing}</div></article>${this.more.length ? html`<section aria-labelledby="blog-more-title" class="mx-auto max-w-[1440px] px-4 pb-32 sm:px-6 lg:px-10 lg:pb-40"><div class="flex items-end justify-between gap-6 border-t border-edge pt-10"><h2 id="blog-more-title" class="font-heading text-heading-2 font-normal tracking-tight text-fg">${`More ${p.category.toLowerCase()}`}</h2><a href=${this.blogHref} class="ds-post-trail text-body text-fg-faint">All posts</a></div><ul class="mt-8 grid grid-cols-[minmax(0,1fr)] gap-6 md:grid-cols-2 lg:grid-cols-3">${this.more.map((m) => html`<li class="flex">${staticHtml`<${card} href=${m.href} .heading=${m.title} .dek=${m.dek} category=${m.category} .author=${m.author} .date=${m.date}></${card}>`}</li>`)}</ul></section>` : nothing}`)
	}
}

define('blog-post-page', BlogPostPage)
