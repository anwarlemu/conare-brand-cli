import { CodeBlock } from '@/react/components/ui/CodeBlock'
import { DocsFields, type DocsField } from '@/react/components/site/DocsFields'
import { DocsInline } from '@/react/components/site/DocsInline'
import { DocsTable } from '@/react/components/site/DocsTable'
import { cn } from '@/react/lib/cn'

// A docs page's body, block by block (docs/Blocks.vue): paragraphs, headings (steps are the smaller ones), lists led
// by a red square, callouts (a warning on the wash), tables, code in the one code window, an endpoint's fields, and the
// link cards, each in the double rule with a pixel pattern that turns red under the pointer. Text takes `code`,
// **bold** and [links](href). `wide` drops the 880px measure, for a page of cards. Follows the theme (data-theme).
export type DocsBlock =
  | { kind: 'p', text: string }
  | { kind: 'h2' | 'h3', id: string, text: string }
  | { kind: 'list', items: string[] }
  | { kind: 'callout', tone: 'note' | 'warning' | 'caution' | (string & {}), text: string }
  | { kind: 'table', head?: string[], rows: string[][] }
  | { kind: 'code', samples: { label: string, code: string }[] }
  | { kind: 'cards', items: { title: string, body: string, href: string }[] }
  | { kind: 'fields', media?: string, fields: DocsField[] }
export type { DocsField }

export interface DocsBlocksProps {
  blocks: DocsBlock[]
  wide?: boolean
  className?: string
}

// The hero tabs' pixel patterns, each a path on a 16px square of 2px cells, centred.
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

function Block({ b }: { b: DocsBlock }) {
  switch (b.kind) {
    case 'h2': return <h2 id={b.id} className="mt-10 scroll-mt-28 text-docs-heading tracking-tight">{b.text}</h2>
    case 'h3': return <h3 id={b.id} className="mt-4 scroll-mt-28 text-heading-4 font-medium">{b.text}</h3>
    case 'p': return <p className="text-input leading-7 text-fg-muted"><DocsInline text={b.text} /></p>
    case 'list':
      return (
        <ul className="flex flex-col gap-2 text-input leading-7 text-fg-muted">
          {b.items.map(t => (
            <li key={t} className="flex gap-3">
              <span aria-hidden="true" className="mt-2.75 size-1.5 shrink-0 bg-edge-accent" />
              <span><DocsInline text={t} /></span>
            </li>
          ))}
        </ul>
      )
    case 'callout':
      return (
        <div className="ds-docs-callout flex gap-3 px-4 py-3 type-body-lg" data-tone={b.tone}>
          <span aria-hidden="true" className="mt-2.25 size-1.5 shrink-0 bg-edge-accent" />
          <span><DocsInline text={b.text} /></span>
        </div>
      )
    case 'table': return <DocsTable head={b.head} rows={b.rows} />
    case 'fields':
      return (
        <div>
          {b.media && <p className="-mt-2 mb-1 type-code-sm text-fg-muted" dir="ltr">{b.media}</p>}
          <DocsFields fields={b.fields} />
        </div>
      )
    case 'code': return <CodeBlock className="my-2" samples={b.samples.length > 1 ? b.samples : undefined} code={b.samples.length > 1 ? undefined : b.samples[0]?.code} label={b.samples.length > 1 ? undefined : b.samples[0]?.label} />
    case 'cards':
      return (
        <ul className="my-4 grid gap-6 sm:grid-cols-2">
          {b.items.map((c, j) => (
            <li key={c.title} className="border border-edge-strong outline outline-offset-4 outline-edge-strong">
              <a href={c.href} className="ds-docs-card flex h-full flex-col gap-4 p-5">
                <svg width="16" height="16" viewBox="0 0 16 16" shapeRendering="crispEdges" aria-hidden="true" className="ds-docs-card-mark"><path d={PATTERNS[j % 4]} fill="currentColor" /></svg>
                <span>
                  <span className="block type-heading-3">{c.title}</span>
                  <span className="mt-1 block type-body text-fg-muted"><DocsInline text={c.body} /></span>
                </span>
              </a>
            </li>
          ))}
        </ul>
      )
  }
}

export function DocsBlocks({ blocks, wide, className }: DocsBlocksProps) {
  return (
    <div data-ds="docs-blocks" className={cn('flex flex-col gap-5 text-fg', !wide && 'max-w-220', className)}>
      <style href="ds-docs-blocks" precedence="ds">{css}</style>
      {blocks.map((b, i) => <Block key={i} b={b} />)}
    </div>
  )
}

export default DocsBlocks

const css = `
.ds-docs-callout { border: var(--ds-border-hairline) solid var(--ds-color-edge); background: var(--ds-color-surface-subtle); color: var(--ds-color-fg); }
.ds-docs-callout:is([data-tone="warning"], [data-tone="caution"]) { border-color: color-mix(in srgb, var(--ds-color-edge-accent) 30%, transparent); background: var(--ds-color-surface-danger); }
.ds-docs-card { transition: background-color var(--ds-duration-micro) var(--ds-easing-standard); }
.ds-docs-card-mark { color: var(--ds-color-fg-faint); transition: color var(--ds-duration-micro) var(--ds-easing-standard); }
@media (hover: hover) and (pointer: fine) {
  .ds-docs-card:hover { background: var(--ds-color-surface-subtle); }
  .ds-docs-card:hover .ds-docs-card-mark { color: var(--ds-color-edge-accent); }
}
`
