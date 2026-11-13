'use client'
import { Table } from '@/react/components/ui/Table'
import { ParseSheet } from '@/react/components/product/ParseSheet'
import { REGION, tableOf, useParsePoint, type ParseAnswer, type ParseBlock } from '@/react/hooks/useParse'

// Parse, "Regions" (parse/Regions.vue): the page's structure is the result. The page in the double rule with every
// region outlined and numbered, beside a table of the regions in reading order, what each is and how sure OCR was; the
// least sure (under 80%) in red, so a reader sees at once what to check by hand. Pointing joins the two.
export interface ParseRegionsProps {
  answer: ParseAnswer
  'data-ds'?: string
}

const preview = (b: ParseBlock) => (b.type === 'table' ? `${tableOf(b.content).rows.length} rows, ${tableOf(b.content).head.length} columns` : b.content.split('\n')[0]!)
const UNSURE = 0.8

export function ParseRegions({ answer, 'data-ds': ds = 'parse-regions' }: ParseRegionsProps) {
  const { setOn, pinned, lit, pick } = useParsePoint()
  const part = answer.part
  const unsure = part.blocks.filter(b => b.conf != null && b.conf < UNSURE).length
  return (
    <>
      <style href="ds-parse-regions" precedence="ds">{css}</style>
      <section data-ds={ds} className="grid grid-cols-[minmax(0,5fr)_minmax(0,7fr)] items-start gap-6 max-lg:grid-cols-1" aria-label="regions in reading order">
        <div className="m-1.25 border border-edge bg-surface-subtle p-3 outline outline-offset-4 outline-edge">
          <ParseSheet part={part} scan={answer.scan} on={lit} all plays onPoint={setOn} onPick={pick} />
        </div>
        <div className="min-w-0">
          <div className="mb-2 flex items-center justify-between gap-4">
            <h2 className="type-ui-strong">{part.blocks.length} regions in reading order</h2>
            <p className="type-meta text-fg-muted">{part.ocr ? (unsure ? `${unsure} to check by hand` : 'All read clearly') : 'Read from the text layer, no OCR needed'}</p>
          </div>
          <div className="overflow-hidden border border-edge bg-surface">
            <Table>
              <thead><tr><th scope="col" className="w-8"><span className="sr-only">Order</span></th><th scope="col" className="w-20">Region</th><th scope="col">Text</th>{part.ocr && <th scope="col" className="w-20 text-right">OCR</th>}</tr></thead>
              <tbody>
                {part.blocks.map(b => (
                  <tr key={b.order} className={lit === b.order ? 'is-link ds-parse-on' : 'is-link'} onPointerEnter={() => setOn(b.order)} onPointerLeave={() => setOn(null)} onClick={() => pick(b.order)}>
                    <td className="text-fg-muted tabular-nums">{b.order}</td>
                    <td>{REGION[b.type] ?? b.type}</td>
                    <td className="max-w-0"><button type="button" className="block w-full cursor-pointer truncate text-left focus-visible:outline-2 focus-visible:outline-edge-accent" aria-pressed={pinned === b.order} onClick={(e) => { e.stopPropagation(); pick(b.order) }} onFocus={() => setOn(b.order)} onBlur={() => setOn(null)}>{preview(b)}</button></td>
                    {part.ocr && <td className={b.conf != null && b.conf < UNSURE ? 'text-right tabular-nums text-fg-accent' : 'text-right tabular-nums'}>{b.conf == null ? '' : `${Math.round(b.conf * 100)}%`}</td>}
                  </tr>
                ))}
              </tbody>
            </Table>
          </div>
        </div>
      </section>
    </>
  )
}

export default ParseRegions

const css = `
.ds-table tbody tr.ds-parse-on td { background: color-mix(in srgb, var(--ds-color-surface-accent) 6%, transparent); }
`
