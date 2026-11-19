import { SectionHead } from '@/react/components/site/SectionHead'

// What a product does, a card per feature (the pricing page's Enterprise cards and the Products grid, home.css): the
// band's head, then the cards in the website's double rule (a hairline grid, an outline 4px out), one across on phones,
// two from 640px and three from 1024px; an odd last card on two columns takes the row. Each card is off-white: a 16px
// pixel pattern in red (the hero tabs' four, in turn), the name in Faculty Glyphic 20px and its line, muted.
export type Feature = { title: string, body: string }
export interface FeatureGridProps { title: string, tag?: string, body?: string, features: Feature[], titleId?: string }

// The hero tabs' pixel patterns, each a path on a 16px square of 2px cells, centred (as DocsBlocks' link cards).
const pattern = (on: (x: number, y: number) => boolean) => {
  const lit: [number, number][] = []
  for (let y = 0; y < 8; y++) for (let x = 0; x < 8; x++) if (on(x, y)) lit.push([x, y])
  const ox = (16 - (Math.max(...lit.map(c => c[0])) + Math.min(...lit.map(c => c[0])) + 1) * 2) / 2
  const oy = (16 - (Math.max(...lit.map(c => c[1])) + Math.min(...lit.map(c => c[1])) + 1) * 2) / 2
  return lit.map(([x, y]) => `M${x * 2 + ox} ${y * 2 + oy}h2v2h-2Z`).join('')
}
const PATTERNS = [
  pattern((x, y) => x % 2 === 0 && y % 2 === 0),
  pattern((x, y) => (x + y) % 3 === 0),
  pattern((x, y) => (Math.floor(x / 2) + Math.floor(y / 2)) % 2 === 0),
  pattern((_, y) => y % 2 === 0),
]

export function FeatureGrid({ title, tag, body, features, titleId = 'features-title' }: FeatureGridProps) {
  return (
    <section data-ds="feature-grid" aria-labelledby={titleId} className="mx-auto max-w-[1440px] px-4 pb-24 sm:px-6 lg:px-10 lg:pb-32">
      <SectionHead title={title} tag={tag} body={body} titleId={titleId} />
      <ul className="mt-10 grid grid-cols-[minmax(0,1fr)] gap-px border border-edge bg-edge outline outline-offset-4 outline-edge sm:grid-cols-2 lg:grid-cols-3">
        {features.map((f, i) => (
          <li key={f.title} className={['flex flex-col bg-surface px-5 py-6 sm:px-6', features.length % 2 && i === features.length - 1 ? 'sm:max-lg:col-span-2' : ''].join(' ')}>
            <svg aria-hidden="true" width="16" height="16" viewBox="0 0 16 16" shapeRendering="crispEdges" className="size-4 shrink-0 text-home-red"><path d={PATTERNS[i % 4]} className="fill-current" /></svg>
            <h3 className="mt-5 type-heading-3 text-fg">{f.title}</h3>
            <p className="mt-2 text-body leading-5.5 text-fg-muted">{f.body}</p>
          </li>
        ))}
      </ul>
    </section>
  )
}

export default FeatureGrid
