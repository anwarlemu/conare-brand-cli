import { ButtonLink } from '@/react/components/site/ButtonLink'
import { CallToAction } from '@/react/components/site/CallToAction'
import { Faq } from '@/react/components/site/Faq'
import { PricingTable, type PriceCard } from '@/react/components/site/PricingTable'
import { SectionHead } from '@/react/components/site/SectionHead'
import { SitePage, type SiteAction, type SiteFrameProps } from '@/react/components/site/SitePage'
import { Grain } from '@/react/components/visuals/Grain'
import { RoomGrid } from '@/react/components/visuals/RoomGrid'

// Pricing (pages/pricing.vue): the head with the one dark call to action, then each group of prices (pricing-table),
// then Enterprise, the page's one red block (the hero's frame: the grain and the room grid), what its terms cover as
// off-white cards in the double rule with the light button, its squares coming in black; then the questions and the
// closing band.
export interface PricingPageProps extends SiteFrameProps {
  head: { tag?: string, title: string, body?: string, action: SiteAction }
  groups: { key: string, title: string, body?: string, cards: PriceCard[] }[]
  enterprise?: { title: string, body: string, action: SiteAction, items: { name: string, line: string }[] }
  faq: { q: string, a: string }[]
  cta: { title: string, action: SiteAction }
}

export function PricingPage({ header, footer, announcement, logo, actions, head, groups, enterprise, faq, cta }: PricingPageProps) {
  return (
    <>
      <style href="ds-pricing-page" precedence="ds">{css}</style>
      <SitePage data-ds="pricing-page" header={header} footer={footer} announcement={announcement} logo={logo} actions={actions}>
        <section aria-labelledby="pricing-page-title" className="mx-auto max-w-[1440px] px-4 pt-14 pb-20 sm:px-6 lg:px-10 lg:pt-20 lg:pb-28">
          <SectionHead as="h1" titleId="pricing-page-title" tag={head.tag} title={head.title} body={head.body} action={<ButtonLink href={head.action.href} grain pixels arrow>{head.action.label}</ButtonLink>} />
        </section>
        {groups.map(g => <PricingTable key={g.key} id={g.key} titleId={`pricing-${g.key}`} title={g.title} body={g.body} cards={g.cards} />)}
        {enterprise && (
          <section aria-labelledby="pricing-enterprise" className="mx-auto max-w-[1440px] px-4 pb-24 sm:px-6 lg:px-10 lg:pb-32">
            <div className="relative overflow-hidden bg-home-red px-4 py-12 sm:px-8 sm:py-16 lg:px-16 lg:py-20">
              <Grain />
              <RoomGrid />
              {/* Click-through but for the button and the cards, so the room's tiles light under the pointer around them. */}
              <div className="pointer-events-none relative grid grid-cols-[minmax(0,1fr)] gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,2.4fr)] lg:gap-16">
                <div className="flex flex-col items-start">
                  <h2 id="pricing-enterprise" className="ds-enterprise-title font-heading text-heading-2 font-normal tracking-tight text-off-white sm:text-heading-1">{enterprise.title}</h2>
                  <p className="mt-4 max-w-[360px] text-input text-off-white/80">{enterprise.body}</p>
                  <div className="pointer-events-auto mt-8"><ButtonLink href={enterprise.action.href} variant="light" fill="black">{enterprise.action.label}</ButtonLink></div>
                </div>
                <ul className="pointer-events-auto grid grid-cols-[minmax(0,1fr)] gap-px border border-edge bg-edge outline outline-offset-4 outline-off-white/40 sm:grid-cols-2 xl:grid-cols-3">
                  {enterprise.items.map(e => (
                    <li key={e.name} className="flex flex-col bg-surface px-5 py-6 sm:px-6">
                      <span aria-hidden="true" className="size-1.5 shrink-0 bg-home-red" />
                      <p className="mt-5 type-heading-3 text-fg">{e.name}</p>
                      <p className="mt-2 text-body leading-5.5 text-fg-muted">{e.line}</p>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </section>
        )}
        <Faq items={faq} />
        <CallToAction title={cta.title}>
          <ButtonLink href={cta.action.href} variant="light" fill="black">{cta.action.label}</ButtonLink>
        </CallToAction>
      </SitePage>
    </>
  )
}

export default PricingPage

const css = `
.ds-enterprise-title { line-height: 1.15; text-wrap: balance; }
`
