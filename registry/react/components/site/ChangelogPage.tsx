import { ButtonLink } from '@/react/components/site/ButtonLink'
import { CallToAction } from '@/react/components/site/CallToAction'
import { DocsBlocks, type DocsBlock } from '@/react/components/site/DocsBlocks'
import { SectionHead } from '@/react/components/site/SectionHead'
import { SitePage, type SiteAction, type SiteFrameProps } from '@/react/components/site/SitePage'
import { Tag } from '@/react/components/ui/Tag'

// What changed, newest first: the head, then each release under a hairline, laid out as a policy page (Legal.vue): its
// date and version tag on the left, held in view from 1024px while its notes pass, the title and the notes
// (docs-blocks) in a 720px column beside it. Then the closing band.
export type ChangelogEntry = { id: string, date: string, version?: string, title: string, blocks: DocsBlock[] }
export interface ChangelogPageProps extends SiteFrameProps {
  head: { tag?: string, title: string, body?: string }
  entries: ChangelogEntry[]
  cta: { title: string, action: SiteAction }
}

export function ChangelogPage({ header, footer, announcement, logo, actions, head, entries, cta }: ChangelogPageProps) {
  return (
    <SitePage data-ds="changelog-page" header={header} footer={footer} announcement={announcement} logo={logo} actions={actions}>
      <section aria-labelledby="changelog-page-title" className="mx-auto max-w-[1440px] px-4 pt-14 pb-32 sm:px-6 lg:px-10 lg:pt-20 lg:pb-40">
        <SectionHead as="h1" titleId="changelog-page-title" tag={head.tag} title={head.title} body={head.body} />
        <ol className="mx-auto mt-16 flex max-w-[1008px] flex-col gap-16">
          {entries.map(e => (
            <li key={e.id} id={e.id} className="grid scroll-mt-24 grid-cols-[minmax(0,1fr)] gap-6 border-t border-edge pt-10 lg:grid-cols-[224px_minmax(0,720px)] lg:gap-16">
              <div className="flex items-center gap-3 self-start lg:sticky lg:top-28 lg:flex-col lg:items-start">
                <time className="type-ui text-fg-muted">{e.date}</time>
                {e.version && <Tag>{e.version}</Tag>}
              </div>
              <div className="min-w-0">
                <h2 className="font-heading text-heading-2 font-normal tracking-tight text-fg">{e.title}</h2>
                <div className="mt-6"><DocsBlocks blocks={e.blocks} /></div>
              </div>
            </li>
          ))}
        </ol>
      </section>
      <CallToAction title={cta.title}>
        <ButtonLink href={cta.action.href} variant="light" fill="black">{cta.action.label}</ButtonLink>
      </CallToAction>
    </SitePage>
  )
}

export default ChangelogPage
