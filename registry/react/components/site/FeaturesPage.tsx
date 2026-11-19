import { ButtonLink } from '@/react/components/site/ButtonLink'
import { CallToAction } from '@/react/components/site/CallToAction'
import { FeatureGrid, type Feature } from '@/react/components/site/FeatureGrid'
import { LogoStrip, type Logo } from '@/react/components/site/LogoStrip'
import { SectionHead } from '@/react/components/site/SectionHead'
import { SitePage, type SiteAction, type SiteFrameProps } from '@/react/components/site/SitePage'
import { Testimonial } from '@/react/components/site/Testimonial'

// A product's page: the head with the one dark call to action, what it does (feature-grid), what it connects to
// (logo-strip), one customer's words (testimonial) and the closing band, in the site's frame.
export interface FeaturesPageProps extends SiteFrameProps {
  head: { tag?: string, title: string, body?: string, action: SiteAction }
  features: { title: string, tag?: string, body?: string, features: Feature[] }
  logos: { title: string, tag?: string, logos: Logo[] }
  testimonial: { quote: string, role: string, company: string }
  cta: { title: string, action: SiteAction }
}

export function FeaturesPage({ header, footer, announcement, logo, actions, head, features, logos, testimonial, cta }: FeaturesPageProps) {
  return (
    <SitePage data-ds="features-page" header={header} footer={footer} announcement={announcement} logo={logo} actions={actions}>
      <section aria-labelledby="features-page-title" className="mx-auto max-w-[1440px] px-4 pt-14 pb-20 sm:px-6 lg:px-10 lg:pt-20 lg:pb-28">
        <SectionHead as="h1" titleId="features-page-title" tag={head.tag} title={head.title} body={head.body} action={<ButtonLink href={head.action.href} grain pixels arrow>{head.action.label}</ButtonLink>} />
      </section>
      <FeatureGrid {...features} />
      <LogoStrip {...logos} />
      <Testimonial {...testimonial} />
      <CallToAction title={cta.title}>
        <ButtonLink href={cta.action.href} variant="light" fill="black">{cta.action.label}</ButtonLink>
      </CallToAction>
    </SitePage>
  )
}

export default FeaturesPage
