'use client'
import { ParseOutput } from '@/react/components/product/ParseOutput'
import { ParsePlain } from '@/react/components/product/ParsePlain'
import { ParseRegions } from '@/react/components/product/ParseRegions'
import { ParseSheet } from '@/react/components/product/ParseSheet'
import { useParsePoint, type ParseAnswer } from '@/react/hooks/useParse'
import { Count } from '@/react/components/ui/Count'
import { cn } from '@/react/lib/cn'

// A file as Conare read it (parse/Reading.vue), three ways. 1 "Page beside text" (the one that ships): the page on the
// paper beside the dark window of what was read, with four facts over it (how long, regions, tables, OCR; the counts
// roll up as they land), joined by pointing. 2 "Regions": the page's structure, every region numbered with its
// confidence. 3 "Plain or Conare": a plain reader's text and Conare's on the same page, one handle between them.
export interface ParseReadingProps {
  answer: ParseAnswer
  version?: 1 | 2 | 3
  /** The root's data-ds (a page built on this one says its own, as Vue's fallthrough does). */
  'data-ds'?: string
}

export function ParseReading({ answer, version = 1, 'data-ds': ds = 'parse-reading' }: ParseReadingProps) {
  const { setOn, lit, pick } = useParsePoint()
  const p = answer.part
  const tables = p.blocks.filter(b => b.type === 'table').length
  const facts: Array<{ label: string, value: string, count?: number }> = [
    { label: 'Read in', value: `${(answer.took_ms / 1000).toLocaleString('en-US', { maximumFractionDigits: 1 })} s` },
    { label: 'Regions', value: '', count: p.blocks.length },
    { label: 'Tables', value: '', count: tables },
    { label: 'OCR', value: p.ocr ? `${Math.round((p.confidence ?? 0) * 100)}% sure` : 'Not needed' },
  ]
  if (version === 2) return <ParseRegions data-ds={ds} answer={answer} />
  if (version === 3) return <ParsePlain data-ds={ds} answer={answer} />
  return (
    <section data-ds={ds} className="m-1.25 grid grid-cols-2 border border-edge outline outline-offset-4 outline-edge max-lg:grid-cols-1" aria-label="the page and what was read">
      <div className="flex min-w-0 flex-col gap-2 bg-surface-subtle p-4">
        <ParseSheet className="border border-edge" part={answer.part} scan={answer.scan} on={lit} plays onPoint={setOn} onPick={pick} />
        <p className="flex justify-between gap-4 type-meta text-fg-muted"><span className="truncate">{answer.name}</span><span className="shrink-0">{`Page ${answer.page} of ${answer.pages}`}</span></p>
      </div>
      <div className="flex min-w-0 flex-col bg-code text-code-fg">
        <dl className="grid grid-cols-4 border-b border-code-edge max-md:grid-cols-2">
          {facts.map((f, i) => (
            <div key={f.label} className={cn('min-w-0 px-4 py-3', i > 0 && 'border-code-edge md:border-l', i % 2 === 1 && 'max-md:border-l', i > 1 && 'max-md:border-t')}>
              <dt className="type-meta text-code-muted">{f.label}</dt>
              <dd className="text-body tabular-nums">{f.count != null ? <Count value={f.count} rolls /> : f.value}</dd>
            </div>
          ))}
        </dl>
        <ParseOutput answer={answer} on={lit} plays onPoint={setOn} onPick={pick} />
      </div>
    </section>
  )
}

export default ParseReading
