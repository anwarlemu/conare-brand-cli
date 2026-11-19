'use client'
import { useEffect, useState } from 'react'
import { ButtonLink } from '@/react/components/site/ButtonLink'
import { CallToAction } from '@/react/components/site/CallToAction'
import { DocsBlocks, type DocsBlock } from '@/react/components/site/DocsBlocks'
import { SitePage, type SiteAction, type SiteFrameProps } from '@/react/components/site/SitePage'
import { SiteTag } from '@/react/components/ui/SiteTag'

// A page of policy text (Legal.vue: terms, privacy, disclosure): from 1024px, on the left in the double rule, the
// page's sections, held in view, the one being read on the paper with the red square; beside it the tag, the title,
// when it was last updated and the text (docs-blocks), each section with its id. Then the closing band, if any.
export type LegalSection = { id: string, label: string, blocks: DocsBlock[] }
export interface LegalPageProps extends SiteFrameProps {
  tag?: string
  title: string
  updated: string
  intro?: DocsBlock[]
  sections: LegalSection[]
  cta?: { title: string, action: SiteAction }
}

export function LegalPage({ header, footer, announcement, logo, actions, tag, title, updated, intro, sections, cta }: LegalPageProps) {
  // The section being read: the last one whose top has passed a band under the header.
  const [active, setActive] = useState(sections[0]?.id ?? '')
  useEffect(() => {
    const track = () => {
      let on = sections[0]?.id ?? ''
      for (const s of sections) {
        const el = document.getElementById(s.id)
        if (el && el.getBoundingClientRect().top < 160) on = s.id
      }
      setActive(on)
    }
    track()
    window.addEventListener('scroll', track, { passive: true })
    return () => window.removeEventListener('scroll', track)
  }, [sections])
  return (
    <>
      <style href="ds-legal-page" precedence="ds">{css}</style>
      <SitePage data-ds="legal-page" header={header} footer={footer} announcement={announcement} logo={logo} actions={actions}>
        <div className="mx-auto grid max-w-[1440px] grid-cols-[minmax(0,1fr)] gap-12 px-4 pt-14 pb-32 sm:px-6 lg:grid-cols-[224px_minmax(0,720px)] lg:gap-16 lg:px-10 lg:pt-20 lg:pb-40">
          <div role="navigation" aria-label="On this page" className="hidden lg:block">
            <div className="sticky top-28 border border-edge p-5 outline outline-offset-4 outline-edge">
              <p className="type-ui-strong text-fg">On this page</p>
              <ul className="-mx-2 mt-2 flex flex-col">
                {sections.map(s => (
                  <li key={s.id}>
                    <a href={`#${s.id}`} aria-current={s.id === active ? 'location' : undefined} className={['ds-legal-side relative flex items-center py-1.5 ps-5 pe-2 type-ui', s.id === active ? 'bg-surface-subtle text-fg' : 'text-fg-muted'].join(' ')}>
                      {s.id === active && <span aria-hidden="true" className="absolute start-2 top-1/2 -mt-0.75 size-1.5 bg-home-red" />}
                      {s.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          </div>
          <article className="min-w-0">
            {tag && <p className="mb-4 flex"><SiteTag>{tag}</SiteTag></p>}
            <h1 className="ds-legal-title font-heading text-heading-2 font-normal tracking-tight text-fg sm:text-heading-1">{title}</h1>
            <p className="mt-3 text-body text-fg-faint">{`Last updated ${updated}`}</p>
            <div className="mt-12 flex flex-col gap-12">
              {!!intro?.length && <DocsBlocks blocks={intro} />}
              {sections.map(s => (
                <section key={s.id} id={s.id} aria-labelledby={`${s.id}-title`} className="scroll-mt-28">
                  <h2 id={`${s.id}-title`} className="text-docs-heading tracking-tight text-fg">{s.label}</h2>
                  <div className="mt-5"><DocsBlocks blocks={s.blocks} /></div>
                </section>
              ))}
            </div>
          </article>
        </div>
        {cta && (
          <CallToAction title={cta.title}>
            <ButtonLink href={cta.action.href} variant="light" fill="black">{cta.action.label}</ButtonLink>
          </CallToAction>
        )}
      </SitePage>
    </>
  )
}

export default LegalPage

const css = `
.ds-legal-title { line-height: 1.15; text-wrap: balance; }
.ds-legal-side { transition: color var(--ds-duration-micro) var(--ds-easing-standard); }
@media (hover: hover) and (pointer: fine) { .ds-legal-side:hover { color: var(--ds-color-fg); } }
`
