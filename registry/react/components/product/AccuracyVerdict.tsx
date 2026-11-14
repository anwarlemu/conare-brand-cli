'use client'
import { Fragment, useState, type CSSProperties, type SyntheticEvent } from 'react'
import { Check, ChevronDown, X } from 'lucide-react'
import { cn } from '@/react/lib/cn'
import { AccuracyDetail, AccuracyDetailStyle, type AccuracyHandlers, type AccuracyRow, type AccuracyView } from '@/react/components/product/AccuracyDetail'
import { AccuracyOpens } from '@/react/components/product/AccuracyOpens'
import { Button } from '@/react/components/ui/Button'
import { Table } from '@/react/components/ui/Table'
import { Count } from '@/react/components/ui/Count'

// Accuracy, "Verdict first" (accuracy/Verdict.vue): a count read in five seconds in the double rule, beside a field of
// a hundred squares, one a question, ink where the right page came back and red where it did not; pointing at one reads
// its question, a click opens it in the list. Then only what needs a person, each with its fix, then every question, ten
// at a time, each opening to what came back. The squares land once, row by row; reduced motion shows them at once.
export interface AccuracyVerdictProps extends AccuracyHandlers { view: AccuracyView }

export function AccuracyVerdict({ view, onFix, onSearch, onRemove }: AccuracyVerdictProps) {
  const rows = view.rows
  const wrong = rows.filter(r => !r.conare.ok)
  const cells = [...rows.map(r => ({ id: r.id, wrong: !r.conare.ok, queued: false })), ...view.queued.map(q => ({ id: q.id, wrong: false, queued: true }))]
  const [pointed, setPointed] = useState<AccuracyRow | null>(null)
  const [opened, setOpened] = useState('')
  const [shown, setShown] = useState(10)
  const rowOf = (event: SyntheticEvent) => rows.find(r => r.id === (event.target as HTMLElement).dataset.id)
  function open(row: AccuracyRow) {
    setOpened(o => (o === row.id ? '' : row.id))
    if (!rows.slice(0, shown).some(r => r.id === row.id)) setShown(rows.length)
    requestAnimationFrame(() => document.getElementById(`eval-${row.id}`)?.scrollIntoView({ block: 'center', behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth' }))
  }
  const pass = { onFix, onSearch, onRemove }
  return (
    <>
      <style href="ds-accuracy-verdict" precedence="ds">{css}</style>
      <AccuracyDetailStyle />
      <section data-ds="accuracy-verdict" className="m-1.25 grid grid-cols-[minmax(0,1fr)_240px] gap-8 border border-edge p-6 outline outline-offset-4 outline-edge max-md:grid-cols-1 max-md:p-4" aria-labelledby="eval-score">
        <div className="flex min-w-0 flex-col gap-1">
          <p id="eval-score" className="font-heading text-display leading-14 tracking-display tabular-nums max-md:text-heading-1 max-md:leading-10"><Count value={view.right} />{` of ${view.questions}`}</p>
          <p className="text-input">{view.state === 'running' ? `Running. ${view.done} of ${view.questions} done.` : 'questions reached the right page.'}</p>
          <p className="mt-auto type-meta text-fg-muted">{pointed ? pointed.question : `Run ${view.ran} by ${view.by}, ${view.seconds} s, $${view.cost.toFixed(2)}`}</p>
        </div>
        <div className="ds-evalfield max-md:max-w-50" role="img" aria-label={`${view.right} of ${view.questions} questions reached the right page`} onPointerMove={e => setPointed(rowOf(e) ?? null)} onPointerLeave={() => setPointed(null)} onClick={(e) => { const r = rowOf(e); if (r) open(r) }}>
          {cells.map((c, i) => <span key={c.id} data-id={c.id} data-wrong={c.wrong || undefined} data-queued={c.queued || undefined} style={{ '--i': Math.floor(i / 10) } as CSSProperties} />)}
        </div>
      </section>

      {wrong.length > 0 && (
        <section data-ds="accuracy-verdict" className="flex flex-col gap-2" aria-labelledby="eval-look">
          <h2 id="eval-look" className="type-ui-strong">{wrong.length === 1 ? '1 to look at' : `${wrong.length} to look at`}</h2>
          <ul className="border border-edge bg-surface [&>*+*]:border-t [&>*+*]:border-edge">
            {wrong.map(r => (
              <li key={r.id} className="flex min-h-10 items-center justify-between gap-4 px-4 py-1.5 max-sm:flex-col max-sm:items-start max-sm:gap-2 max-sm:py-3">
                <span className="min-w-0">
                  <span className="block">{r.question}</span>
                  <span className="block type-meta text-fg-muted"><span className="font-code whitespace-nowrap">{r.namespace}</span>{`. ${r.fix?.why ?? 'The wrong page came back first.'}`}</span>
                </span>
                {r.fix && <Button press onClick={() => onFix?.(r)}>{r.fix.action}</Button>}
              </li>
            ))}
          </ul>
        </section>
      )}

      <section data-ds="accuracy-verdict" className="flex flex-col gap-2" aria-labelledby="eval-all">
        <h2 id="eval-all" className="type-ui-strong">Every question</h2>
        <div className="overflow-hidden border border-edge bg-surface">
          <Table>
            <thead className="max-sm:sr-only"><tr><th scope="col">Question</th><th scope="col" className="w-40 max-lg:hidden">Namespace</th><th scope="col" className="w-28 max-sm:hidden">Result</th><th scope="col" className="w-8"><span className="sr-only">Open</span></th></tr></thead>
            <tbody>
              {rows.slice(0, shown).map(r => (
                <Fragment key={r.id}>
                  <tr id={`eval-${r.id}`} className={cn('is-link', opened === r.id && 'ds-row-open')} onClick={() => open(r)}>
                    <td className="max-w-0 max-sm:w-full">
                      <button type="button" className={cn('block w-full cursor-pointer truncate text-left focus-visible:outline-2 focus-visible:outline-edge-accent max-sm:whitespace-normal', opened === r.id && 'whitespace-normal')} aria-expanded={opened === r.id} onClick={(e) => { e.stopPropagation(); open(r) }}>{r.question}</button>
                      <span className="ds-verdict mt-0.5 sm:hidden" data-ok={r.conare.ok || undefined}>{r.conare.ok ? `Page ${r.conare.number}` : 'Wrong page'}</span>
                    </td>
                    <td className="type-code-sm max-lg:hidden">{r.namespace}</td>
                    <td className="max-sm:hidden"><span className="ds-verdict" data-ok={r.conare.ok || undefined}>{r.conare.ok ? <Check size={12} strokeWidth={2} aria-hidden="true" /> : <X size={12} strokeWidth={2} aria-hidden="true" />}{r.conare.ok ? `Page ${r.conare.number}` : 'Wrong page'}</span></td>
                    <td className="text-right"><ChevronDown size={14} strokeWidth={1.5} className="ds-chev inline text-fg-muted" data-open={opened === r.id || undefined} aria-hidden="true" /></td>
                  </tr>
                  <AccuracyOpens open={opened === r.id} colspan={4}><AccuracyDetail row={r} {...pass} /></AccuracyOpens>
                </Fragment>
              ))}
            </tbody>
          </Table>
        </div>
        {shown < rows.length && <Button variant="ghost" press className="self-start" onClick={() => setShown(s => s + 10)}>Show 10 more</Button>}
      </section>
    </>
  )
}

export default AccuracyVerdict

const css = `
.ds-evalfield { display: grid; grid-template-columns: repeat(10, minmax(0, 1fr)); gap: var(--ds-space-xs); }
.ds-evalfield > span { display: block; aspect-ratio: 1; background: var(--ds-color-fg); transition: opacity var(--ds-duration-micro) var(--ds-easing-standard); }
.ds-evalfield > span[data-wrong] { background: var(--ds-color-surface-accent); }
.ds-evalfield > span[data-queued] { background: var(--ds-color-surface-sunken); }
@media (hover: hover) and (pointer: fine) { .ds-evalfield:hover > span:not(:hover) { opacity: 0.32; } }
@media (prefers-reduced-motion: no-preference) {
  .ds-evalfield > span { animation: ds-evalcell var(--ds-duration-enter) var(--ds-easing-out) both; animation-delay: calc(var(--i) * 30ms); }
}
@keyframes ds-evalcell { from { opacity: 0; transform: scale(0.9); } }
`
