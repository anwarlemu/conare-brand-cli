import { SectionHead } from '@/react/components/site/SectionHead'

// One group of prices (pricing.vue): its case on the left, its cards on the right in the website's double rule, side by
// side from 1024px. Each card: the name in Faculty Glyphic 20px, the price large in tabular figures with its unit, one
// line, and what it includes under a hairline, each led by the red square. Two across from 640px; an odd last card
// takes the row.
export type PriceCard = { name: string, amount: string, unit?: string, line?: string, facts?: string[] }
export interface PricingTableProps { title: string, body?: string, cards: PriceCard[], titleId?: string, id?: string }

export function PricingTable({ title, body, cards, titleId = 'pricing-title', id }: PricingTableProps) {
  return (
    <section id={id} data-ds="pricing-table" aria-labelledby={titleId} className="mx-auto grid max-w-[1440px] scroll-mt-16 grid-cols-[minmax(0,1fr)] gap-8 px-4 pb-24 sm:px-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,2.4fr)] lg:gap-16 lg:px-10 lg:pb-32">
      <SectionHead title={title} body={body} titleId={titleId} align="start" />
      <ul className="grid grid-cols-[minmax(0,1fr)] gap-px border border-edge bg-edge outline outline-offset-4 outline-edge sm:grid-cols-2">
        {cards.map((c, i) => (
          <li key={c.name} className={['flex flex-col bg-surface px-5 py-6 sm:px-6', cards.length % 2 && i === cards.length - 1 ? 'sm:col-span-2' : ''].join(' ')}>
            <h3 className="type-heading-3 text-fg">{c.name}</h3>
            <p className="mt-4 flex flex-wrap items-baseline gap-x-2 gap-y-1">
              <span className="text-viz-score tracking-display text-fg tabular-nums">{c.amount}</span>
              {c.unit && <span className="text-body text-fg-muted">{c.unit}</span>}
            </p>
            {c.line && <p className="mt-3 text-body leading-5.5 text-fg-muted">{c.line}</p>}
            {!!c.facts?.length && (
              <ul className="mt-5 flex flex-col gap-2 border-t border-edge pt-5">
                {c.facts.map(f => (
                  <li key={f} className="flex items-center gap-3 text-body text-fg">
                    <span aria-hidden="true" className="size-1.5 shrink-0 bg-home-red" />
                    {f}
                  </li>
                ))}
              </ul>
            )}
          </li>
        ))}
      </ul>
    </section>
  )
}

export default PricingTable
