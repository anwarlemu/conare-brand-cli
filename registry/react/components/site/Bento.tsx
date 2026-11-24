import { SectionHead } from '@/react/components/site/SectionHead'

// What a product does as a bento: the band's head, then cells of different sizes in the website's double rule (a
// hairline grid, an outline 4px out). A large cell takes two columns and two rows from 1024px (two columns from 640px),
// a wide one two columns, a tall one two rows. Each cell is off-white, led by a red pixel pattern (the hero tabs' four,
// in turn), its name in Faculty Glyphic and its line, muted. The site has no bento: set from the feature grid's cells.
export type BentoCell = { title: string, body: string, size?: 'large' | 'wide' | 'tall' }
export interface BentoProps { title: string, tag?: string, body?: string, cells: BentoCell[], titleId?: string }

const span = (c: BentoCell) => (c.size === 'large' ? 'sm:col-span-2 lg:row-span-2' : c.size === 'wide' ? 'sm:col-span-2' : c.size === 'tall' ? 'lg:row-span-2' : '')
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

export function Bento({ title, tag, body, cells, titleId = 'bento-title' }: BentoProps) {
  return (
    <section data-ds="bento" aria-labelledby={titleId} className="mx-auto max-w-[1440px] px-4 pb-24 sm:px-6 lg:px-10 lg:pb-32">
      <SectionHead title={title} tag={tag} body={body} titleId={titleId} />
      <ul className="mt-10 grid grid-flow-dense grid-cols-[minmax(0,1fr)] gap-px border border-edge bg-edge outline outline-offset-4 outline-edge sm:grid-cols-2 lg:auto-rows-[minmax(200px,auto)] lg:grid-cols-3">
        {cells.map((c, i) => (
          <li key={c.title} className={['flex flex-col justify-between gap-8 bg-surface px-5 py-6 sm:px-6', span(c)].join(' ')}>
            <svg aria-hidden="true" width="16" height="16" viewBox="0 0 16 16" shapeRendering="crispEdges" className="size-4 shrink-0 text-home-red"><path d={PATTERNS[i % 4]} className="fill-current" /></svg>
            <div>
              <h3 className={['text-fg', c.size === 'large' ? 'type-heading-2' : 'type-heading-3'].join(' ')}>{c.title}</h3>
              <p className="mt-2 text-body leading-5.5 text-fg-muted">{c.body}</p>
            </div>
          </li>
        ))}
      </ul>
    </section>
  )
}

export default Bento
