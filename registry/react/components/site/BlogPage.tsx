'use client'
import { useMemo, useState } from 'react'
import { Search } from 'lucide-react'
import { BlogCard } from '@/react/components/site/BlogCard'
import { ButtonLink } from '@/react/components/site/ButtonLink'
import { CallToAction } from '@/react/components/site/CallToAction'
import { SectionHead } from '@/react/components/site/SectionHead'
import { SitePage, type SiteAction, type SiteFrameProps } from '@/react/components/site/SitePage'
import { Input } from '@/react/components/ui/Input'

// The blog (pages/blog/index.vue): the head, the categories with a search beside them, then the posts three across
// (blog-card), every card in a row one height; nothing matching says so under a hairline. The picked category rests on
// the paper with its red square, the others muted until the pointer reaches them. Then the closing band.
export type BlogPost = { href: string, title: string, dek?: string, category: string, author?: string, date?: string }
export interface BlogPageProps extends SiteFrameProps {
  head: { tag?: string, title: string }
  categories: string[]
  posts: BlogPost[]
  cta: { title: string, action: SiteAction }
}

export function BlogPage({ header, footer, announcement, logo, actions, head, categories, posts, cta }: BlogPageProps) {
  const [category, setCategory] = useState('All')
  const [query, setQuery] = useState('')
  const shown = useMemo(() => {
    const q = query.trim().toLowerCase()
    return posts.filter(p => (category === 'All' || p.category === category) && (!q || `${p.title} ${p.dek ?? ''}`.toLowerCase().includes(q)))
  }, [posts, category, query])
  return (
    <>
      <style href="ds-blog-page" precedence="ds">{css}</style>
      <SitePage data-ds="blog-page" header={header} footer={footer} announcement={announcement} logo={logo} actions={actions}>
        <section aria-labelledby="blog-page-title" className="mx-auto max-w-[1440px] px-4 pt-14 pb-32 sm:px-6 lg:px-10 lg:pt-20 lg:pb-40">
          <SectionHead as="h1" titleId="blog-page-title" tag={head.tag} title={head.title} />
          <div className="mt-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div role="group" aria-label="Categories" className="flex flex-wrap gap-1 text-body leading-none">
              {['All', ...categories].map(c => (
                <button
                  key={c}
                  type="button"
                  aria-pressed={category === c}
                  className={['ds-blog-cat flex h-7.5 cursor-pointer items-center gap-2 px-3', category === c ? 'bg-surface-subtle text-fg' : 'text-fg-muted'].join(' ')}
                  onClick={() => setCategory(c)}
                >
                  {category === c && <span aria-hidden="true" className="size-1.5 bg-home-red" />}
                  {c}
                </button>
              ))}
            </div>
            <div className="w-full sm:w-70">
              <Input value={query} onChange={e => setQuery(e.target.value)} icon={Search} type="search" enterKeyHint="search" placeholder="Search" aria-label="Search the blog" onKeyDown={(e) => { if (e.key === 'Escape') setQuery('') }} />
            </div>
          </div>
          {shown.length
            ? (
                <ul className="mt-12 grid grid-cols-[minmax(0,1fr)] gap-6 md:grid-cols-2 lg:grid-cols-3">
                  {shown.map(p => <li key={p.href} className="flex"><BlogCard {...p} /></li>)}
                </ul>
              )
            : <p className="mt-12 border-t border-edge pt-6 text-body text-fg-muted">{query ? `Nothing matches "${query}".` : `Nothing in ${category} yet.`}</p>}
        </section>
        <CallToAction title={cta.title}>
          <ButtonLink href={cta.action.href} variant="light" fill="black">{cta.action.label}</ButtonLink>
        </CallToAction>
      </SitePage>
    </>
  )
}

export default BlogPage

const css = `
.ds-blog-cat { transition: color var(--ds-duration-micro) var(--ds-easing-standard); }
@media (hover: hover) and (pointer: fine) { .ds-blog-cat:hover { color: var(--ds-color-fg); } }
.ds-blog-cat:focus-visible { outline: var(--ds-border-focus) solid var(--ds-color-edge-focus); outline-offset: -2px; }
`
