import type { ReactNode } from 'react'
import { ButtonLink } from '@/react/components/site/ButtonLink'
import { CallToAction } from '@/react/components/site/CallToAction'
import { Faq } from '@/react/components/site/Faq'
import { FeatureGrid, type Feature } from '@/react/components/site/FeatureGrid'
import { Hero } from '@/react/components/site/Hero'
import { LogoStrip, type Logo } from '@/react/components/site/LogoStrip'
import { SitePage, type SiteAction, type SiteFrameProps } from '@/react/components/site/SitePage'
import { Testimonial } from '@/react/components/site/Testimonial'

// The website's home (pages/index.vue), in its order: the hero with the one dark call to action and the window in the
// red frame (`window`), who connects (logo-strip), what it does (feature-grid), one customer's words (testimonial),
// the questions (faq) and the closing red band (call-to-action), in the site's frame (site-page).
export interface HomePageProps extends SiteFrameProps {
  hero: { eyebrow?: string, title: string, body?: string, action: SiteAction }
  logos: { title: string, tag?: string, logos: Logo[] }
  features: { title: string, tag?: string, body?: string, features: Feature[] }
  testimonial: { quote: string, role: string, company: string }
  faq: { q: string, a: string }[]
  cta: { title: string, action: SiteAction }
  /** The window in the hero's red frame (Vue's `window` slot). */
  window?: () => ReactNode
}

export function HomePage({ header, footer, announcement, logo, actions, hero, logos, features, testimonial, faq, cta, window: win }: HomePageProps) {
  return (
    <SitePage data-ds="home-page" header={header} footer={footer} announcement={announcement} logo={logo} actions={actions}>
      <Hero eyebrow={hero.eyebrow} title={hero.title} body={hero.body} action={<ButtonLink href={hero.action.href} grain pixels arrow>{hero.action.label}</ButtonLink>} window={win} />
      <LogoStrip {...logos} />
      <FeatureGrid {...features} />
      <Testimonial {...testimonial} />
      <Faq items={faq} />
      <CallToAction title={cta.title}>
        <ButtonLink href={cta.action.href} variant="light" fill="black">{cta.action.label}</ButtonLink>
      </CallToAction>
    </SitePage>
  )
}

export default HomePage
