import { BlogCard } from '@/react/components/site/BlogCard'
import { ButtonLink } from '@/react/components/site/ButtonLink'
import { DocsBlocks, type DocsBlock } from '@/react/components/site/DocsBlocks'
import { SitePage, type SiteAction, type SiteFrameProps } from '@/react/components/site/SitePage'
import { CellBurst } from '@/react/components/visuals/CellBurst'
import { Grain } from '@/react/components/visuals/Grain'
import type { BlogPost } from '@/react/components/site/BlogPage'

// A blog post (pages/blog/[slug].vue): the trail and the title centred, a wide dark panel as the picture (the grain
// and a jumbled sheet of cells in the double rule), who it is from and when, the text in one narrow column
// (docs-blocks), a quiet link on, then more posts from the category (blog-card) under a hairline.
export interface BlogPostPageProps extends SiteFrameProps {
  post: { title: string, category: string, author?: string, date?: string, blocks: DocsBlock[], seed?: number }
  blogHref: string
  link?: SiteAction
  more?: BlogPost[]
}

export function BlogPostPage({ header, footer, announcement, logo, actions, post, blogHref, link, more }: BlogPostPageProps) {
  return (
    <>
      <style href="ds-blog-post-page" precedence="ds">{css}</style>
      <SitePage data-ds="blog-post-page" header={header} footer={footer} announcement={announcement} logo={logo} actions={actions}>
        <article className="mx-auto max-w-[1440px] px-4 pt-14 pb-24 sm:px-6 lg:px-10 lg:pt-20">
          <header className="flex flex-col items-center text-center">
            <p className="flex items-center gap-2 type-ui text-fg-faint">
              <a href={blogHref} className="ds-post-trail">Blog</a>
              <span aria-hidden="true">/</span>
              <span>{post.category}</span>
            </p>
            <h1 className="ds-post-title mt-4 max-w-[760px] font-heading text-docs-heading font-normal tracking-tight text-fg sm:text-hero">{post.title}</h1>
          </header>
          <div aria-hidden="true" className="relative mx-auto mt-12 aspect-[4/3] max-w-[960px] overflow-hidden border border-edge bg-ds-neutral-200 text-ds-neutral-300 outline outline-offset-4 outline-edge sm:aspect-[2/1]">
            <Grain />
            <span className="pointer-events-none absolute inset-0 opacity-70"><CellBurst seed={post.seed ?? 31 + post.title.length * 17} jumble /></span>
          </div>
          {(post.author || post.date) && <p className="mt-10 text-center type-ui text-fg-faint">{[post.author, post.date].filter(Boolean).join(' · ')}</p>}
          <div className="mx-auto mt-10 max-w-[640px]">
            <DocsBlocks blocks={post.blocks} />
            {link && <div className="mt-12 flex justify-start"><ButtonLink href={link.href} variant="secondary" size="sm">{link.label}</ButtonLink></div>}
          </div>
        </article>
        {!!more?.length && (
          <section aria-labelledby="blog-more-title" className="mx-auto max-w-[1440px] px-4 pb-32 sm:px-6 lg:px-10 lg:pb-40">
            <div className="flex items-end justify-between gap-6 border-t border-edge pt-10">
              <h2 id="blog-more-title" className="font-heading text-heading-2 font-normal tracking-tight text-fg">{`More ${post.category.toLowerCase()}`}</h2>
              <a href={blogHref} className="ds-post-trail text-body text-fg-faint">All posts</a>
            </div>
            <ul className="mt-8 grid grid-cols-[minmax(0,1fr)] gap-6 md:grid-cols-2 lg:grid-cols-3">
              {more.map(p => <li key={p.href} className="flex"><BlogCard {...p} /></li>)}
            </ul>
          </section>
        )}
      </SitePage>
    </>
  )
}

export default BlogPostPage

const css = `
.ds-post-title { line-height: 1.15; text-wrap: balance; }
.ds-post-trail { transition: color var(--ds-duration-micro) var(--ds-easing-standard); }
@media (hover: hover) and (pointer: fine) { .ds-post-trail:hover { color: var(--ds-color-fg); } }
`
