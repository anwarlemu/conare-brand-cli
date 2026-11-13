'use client'
import { Fragment, useState, type ClipboardEvent } from 'react'
import { Check, ChevronDown, Plus, X } from 'lucide-react'
import { cn } from '@/react/lib/cn'
import { AccuracyDetail, AccuracyDetailStyle, type AccuracyHandlers, type AccuracyRow, type AccuracyView } from '@/react/components/product/AccuracyDetail'
import { AccuracyOpens } from '@/react/components/product/AccuracyOpens'
import { Button } from '@/react/components/ui/Button'
import { DotMatrix } from '@/react/components/ui/DotMatrix'
import { Table } from '@/react/components/ui/Table'
import { Count } from '@/react/components/ui/Count'

// Accuracy, "Question sheet" (accuracy/Sheet.vue): the questions are the page, as teams keep them in a spreadsheet.
// Right and wrong counted over a 2px line that fills as the run lands; a numbered sheet whose first row takes a new
// question (or a pasted list, one a line), questions still waiting with the dot matrix, each answered row opening to
// what came back. Twelve at a time. `onAdd` gets the new questions.
export interface AccuracySheetProps extends AccuracyHandlers {
  view: AccuracyView
  onAdd?: (questions: string[]) => void
}

export function AccuracySheet({ view, onAdd, onFix, onSearch, onRemove }: AccuracySheetProps) {
  const [text, setText] = useState('')
  function submit(value = text) {
    const questions = value.split('\n').map(l => l.trim()).filter(Boolean)
    if (!questions.length) return
    onAdd?.(questions)
    setText('')
  }
  function paste(event: ClipboardEvent<HTMLInputElement>) {
    const pasted = event.clipboardData?.getData('text') ?? ''
    if (!pasted.includes('\n')) return
    event.preventDefault()
    setText(pasted)
    submit(pasted)
  }
  const rows = [
    ...view.rows.map(r => ({ id: r.id, question: r.question, namespace: r.namespace, row: r as AccuracyRow | null })),
    ...view.queued.map(q => ({ ...q, row: null })),
  ]
  const [shown, setShown] = useState(12)
  const [opened, setOpened] = useState('')
  const wrong = view.done - view.right
  const pass = { onFix, onSearch, onRemove }
  const toggle = (id: string) => setOpened(opened === id ? '' : id)
  return (
    <>
      <style href="ds-accuracy-sheet" precedence="ds">{css}</style>
      <AccuracyDetailStyle />
      <section data-ds="accuracy-sheet" className="relative flex flex-wrap items-baseline gap-x-6 gap-y-1 pb-3" aria-live="polite">
        <p><span className="font-heading text-heading-2 tabular-nums"><Count value={view.right} /></span> right</p>
        <p><span className={cn('font-heading text-heading-2 tabular-nums', wrong > 0 && 'text-fg-accent')}><Count value={wrong} /></span> wrong</p>
        <p className="ml-auto type-meta text-fg-muted">{view.state === 'running' ? `${view.done} of ${view.questions} done` : `${view.questions} questions, run ${view.ran}`}</p>
        <span className="ds-sheetline" aria-hidden="true"><span style={{ transform: `scaleX(${view.questions ? view.done / view.questions : 0})` }} /></span>
      </section>
      <div data-ds="accuracy-sheet" className="overflow-hidden border border-edge bg-surface">
        <Table>
          <thead><tr><th scope="col" className="w-10 text-right max-sm:hidden"><span className="sr-only">Number</span></th><th scope="col">Question</th><th scope="col" className="w-40 max-lg:hidden">Namespace</th><th scope="col" className="w-32 max-sm:hidden">Result</th><th scope="col" className="w-8"><span className="sr-only">Open</span></th></tr></thead>
          <tbody>
            <tr>
              <td className="text-right text-fg-muted max-sm:hidden"><Plus size={12} strokeWidth={1.5} className="inline" aria-hidden="true" /></td>
              <td colSpan={4} className="!p-0">
                <form onSubmit={(e) => { e.preventDefault(); submit() }}>
                  <label className="sr-only" htmlFor="eval-add">add a question</label>
                  <input id="eval-add" value={text} onChange={e => setText(e.target.value)} className="h-10 w-full bg-transparent px-3 text-ui placeholder:text-fg-muted focus:outline-2 focus:-outline-offset-2 focus:outline-edge-accent max-md:text-input" autoComplete="off" placeholder="Add a question, or paste a list" onPaste={paste} />
                </form>
              </td>
            </tr>
            {rows.slice(0, shown).map((r, i) => (
              <Fragment key={r.id}>
                <tr className={cn(r.row && 'is-link', opened === r.id && 'ds-row-open') || undefined} onClick={() => { if (r.row) toggle(r.id) }}>
                  <td className="text-right text-fg-muted tabular-nums max-sm:hidden">{i + 1}</td>
                  <td className="max-w-0 max-sm:w-full">
                    {r.row
                      ? <button type="button" className={cn('block w-full cursor-pointer truncate text-left focus-visible:outline-2 focus-visible:outline-edge-accent max-sm:whitespace-normal', opened === r.id && 'whitespace-normal')} aria-expanded={opened === r.id} onClick={(e) => { e.stopPropagation(); toggle(r.id) }}>{r.question}</button>
                      : <span className="block truncate max-sm:whitespace-normal">{r.question}</span>}
                    {r.row && <span className="ds-verdict mt-0.5 sm:hidden" data-ok={r.row.conare.ok || undefined}>{r.row.conare.ok ? `Page ${r.row.conare.number}` : 'Wrong page'}</span>}
                  </td>
                  <td className="type-code-sm max-lg:hidden">{r.namespace}</td>
                  <td className="max-sm:hidden">
                    {!r.row
                      ? <span className="ds-verdict !text-fg-muted"><DotMatrix />Waiting</span>
                      : <span className="ds-verdict" data-ok={r.row.conare.ok || undefined}>{r.row.conare.ok ? <Check size={12} strokeWidth={2} aria-hidden="true" /> : <X size={12} strokeWidth={2} aria-hidden="true" />}{r.row.conare.ok ? `Page ${r.row.conare.number}` : 'Wrong page'}</span>}
                  </td>
                  <td className="text-right">{r.row && <ChevronDown size={14} strokeWidth={1.5} className="ds-chev inline text-fg-muted" data-open={opened === r.id || undefined} aria-hidden="true" />}</td>
                </tr>
                <AccuracyOpens open={opened === r.id && !!r.row} colspan={5}>{r.row && <AccuracyDetail row={r.row} {...pass} />}</AccuracyOpens>
              </Fragment>
            ))}
          </tbody>
        </Table>
      </div>
      {shown < rows.length && <Button data-ds="accuracy-sheet" variant="ghost" press className="self-start" onClick={() => setShown(s => s + 12)}>Show 12 more</Button>}
    </>
  )
}

export default AccuracySheet

const css = `
.ds-sheetline { position: absolute; inset: auto 0 0 0; height: 2px; background: var(--ds-color-surface-sunken); }
.ds-sheetline > span { display: block; height: 100%; background: var(--ds-color-fg); transform-origin: left; transition: transform var(--ds-duration-glide) linear; }
@media (prefers-reduced-motion: reduce) { .ds-sheetline > span { transition: none; } }
`
