import { ButtonLink } from '@/react/components/site/ButtonLink'
import { CallToAction } from '@/react/components/site/CallToAction'
import { DocsBlocks, type DocsBlock } from '@/react/components/site/DocsBlocks'
import { FeatureGrid, type Feature } from '@/react/components/site/FeatureGrid'
import { SectionHead } from '@/react/components/site/SectionHead'
import { SitePage, type SiteAction, type SiteFrameProps } from '@/react/components/site/SitePage'

// About the company: the head, the story in one narrow column (docs-blocks, as a blog post's text), the numbers in the
// double rule (each large in tabular figures over its label, as a price), what the team holds to (feature-grid) and the
// closing band, in the site's frame.
export interface AboutPageProps extends SiteFrameProps {
  head: { tag?: string, title: string, body?: string }
  story: DocsBlock[]
  numbers: { value: string, label: string }[]
  values: { title: string, tag?: string, body?: string, features: Feature[] }
  cta: { title: string, action: SiteAction }
}

export function AboutPage({ header, footer, announcement, logo, actions, head, story, numbers, values, cta }: AboutPageProps) {
  return (
    <SitePage data-ds="about-page" header={header} footer={footer} announcement={announcement} logo={logo} actions={actions}>
      <section aria-labelledby="about-page-title" className="mx-auto max-w-[1440px] px-4 pt-14 pb-16 sm:px-6 lg:px-10 lg:pt-20 lg:pb-20">
        <SectionHead as="h1" titleId="about-page-title" tag={head.tag} title={head.title} body={head.body} />
        <div className="mx-auto mt-12 max-w-[640px]"><DocsBlocks blocks={story} /></div>
      </section>
      <section aria-label="In numbers" className="mx-auto max-w-[1440px] px-4 pb-24 sm:px-6 lg:px-10 lg:pb-32">
        <dl className="grid grid-cols-2 gap-px border border-edge bg-edge outline outline-offset-4 outline-edge lg:grid-cols-4">
          {numbers.map(n => (
            <div key={n.label} className="flex flex-col-reverse gap-2 bg-surface px-5 py-6 sm:px-6">
              <dt className="text-body text-fg-muted">{n.label}</dt>
              <dd className="text-viz-score tracking-display text-fg tabular-nums">{n.value}</dd>
            </div>
          ))}
        </dl>
      </section>
      <FeatureGrid {...values} />
      <CallToAction title={cta.title}>
        <ButtonLink href={cta.action.href} variant="light" fill="black">{cta.action.label}</ButtonLink>
      </CallToAction>
    </SitePage>
  )
}

export default AboutPage
