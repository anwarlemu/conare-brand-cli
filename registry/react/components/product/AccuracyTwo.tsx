'use client'
import { useEffect, useState, type CSSProperties } from 'react'
import { Check, ChevronDown, X } from 'lucide-react'
import { cn } from '@/react/lib/cn'
import { AccuracyDetail, AccuracyDetailStyle, type AccuracyHandlers, type AccuracyView } from '@/react/components/product/AccuracyDetail'
import { AccuracyOpens } from '@/react/components/product/AccuracyOpens'
import { Button } from '@/react/components/ui/Button'
import { Tabs } from '@/react/components/ui/Tabs'
import { Count } from '@/react/components/ui/Count'

// Accuracy, "Two searches" (accuracy/Two.vue): Conare against the search the team uses today, the count of each over a
// 6px track (Conare's red) in the double rule, then only the questions where they part, the first one open. Conare's
// misses stay in. Each row marks both searches, a check for the right page and a red cross for the wrong one.
type Show = 'differ' | 'all' | 'missed'
export interface AccuracyTwoProps extends AccuracyHandlers { view: AccuracyView }

export function AccuracyTwo({ view, onFix, onSearch, onRemove }: AccuracyTwoProps) {
  const [show, setShow] = useState<Show>('differ')
  const rows = view.rows
  const differ = rows.filter(r => r.conare.ok !== r.current.ok)
  const missed = rows.filter(r => !r.conare.ok && !r.current.ok)
  const list = show === 'differ' ? differ : show === 'missed' ? missed : rows
  const filters = [
    { value: 'differ' as Show, label: `Where they differ, ${differ.length}` },
    { value: 'all' as Show, label: `All, ${rows.length}` },
    { value: 'missed' as Show, label: `Both missed, ${missed.length}` },
  ]
  const gain = view.right - view.current_right
  const lost = rows.filter(r => !r.conare.ok && r.current.ok).length
  const [opened, setOpened] = useState(() => list[0]?.id ?? '')
  // Vue's watch on the list: the first row opens when the open one leaves it.
  const listKey = list.map(r => r.id).join(' ')
  useEffect(() => {
    if (!list.some(r => r.id === opened)) setOpened(list[0]?.id ?? '')
  }, [listKey]) // eslint-disable-line react-hooks/exhaustive-deps
  const [shown, setShown] = useState(10)
  useEffect(() => setShown(10), [show])
  const share = (n: number) => `scaleX(${view.questions ? n / view.questions : 0})`
  const pass = { onFix, onSearch, onRemove }
  return (
    <>
      <style href="ds-accuracy-two" precedence="ds">{css}</style>
      <AccuracyDetailStyle />
      <section data-ds="accuracy-two" className="m-1.25 grid grid-cols-2 gap-x-8 gap-y-6 border border-edge p-6 outline outline-offset-4 outline-edge max-md:gap-4 max-md:p-4" aria-label="your current search and Conare">
        {[{ name: view.current_name, n: view.current_right, red: false }, { name: 'Conare', n: view.right, red: true }].map(side => (
          <div key={side.name} className="min-w-0">
            <p className="type-meta text-fg-muted">{side.name}</p>
            <p className="font-heading text-display leading-14 tracking-display tabular-nums max-md:text-heading-1 max-md:leading-10"><Count value={side.n} />{` of ${view.questions}`}</p>
            <div className="ds-evaltrack" data-red={side.red || undefined} aria-hidden="true"><span style={{ transform: share(side.n) } as CSSProperties} /></div>
          </div>
        ))}
        <p className="col-span-full text-body">{'Conare reached the right page on ' + gain + ' more questions' + (lost ? `, and missed ${lost} your current search found` : '') + '.'}</p>
      </section>

      <section data-ds="accuracy-two" className="flex flex-col gap-2" aria-label="question by question">
        <Tabs value={show} onValueChange={setShow} className="self-start" options={filters} label="which questions" />
        <p className="ds-evalheads max-sm:hidden" aria-hidden="true"><span>Yours</span><span>Conare</span></p>
        <ul className="border border-edge bg-surface [&>*+*]:border-t [&>*+*]:border-edge">
          {list.slice(0, shown).map(r => (
            <li key={r.id}>
              <button type="button" className="ds-evalrow" aria-expanded={opened === r.id} onClick={() => setOpened(opened === r.id ? '' : r.id)}>
                <span className={cn('min-w-0 flex-1 truncate max-sm:whitespace-normal', opened === r.id && 'whitespace-normal')}>{r.question}</span>
                <span className="ds-evalmarks" aria-hidden="true">
                  <span data-ok={r.current.ok || undefined}><span className="sm:hidden">Yours</span>{r.current.ok ? <Check size={12} strokeWidth={2} /> : <X size={12} strokeWidth={2} />}</span>
                  <span data-ok={r.conare.ok || undefined}><span className="sm:hidden">Conare</span>{r.conare.ok ? <Check size={12} strokeWidth={2} /> : <X size={12} strokeWidth={2} />}</span>
                </span>
                <span className="sr-only">{`${view.current_name}: ${r.current.ok ? 'right page' : 'wrong page'}. Conare: ${r.conare.ok ? 'right page' : 'wrong page'}.`}</span>
                <ChevronDown size={14} strokeWidth={1.5} className="ds-chev shrink-0 text-fg-muted" data-open={opened === r.id || undefined} aria-hidden="true" />
              </button>
              <AccuracyOpens open={opened === r.id}><AccuracyDetail row={r} both name={view.current_name} {...pass} /></AccuracyOpens>
            </li>
          ))}
        </ul>
        {shown < list.length && <Button variant="ghost" press className="self-start" onClick={() => setShown(s => s + 10)}>Show 10 more</Button>}
      </section>
    </>
  )
}

export default AccuracyTwo

const css = `
.ds-evaltrack { position: relative; height: 6px; margin-top: 12px; background: var(--ds-color-surface-sunken); }
.ds-evaltrack > span { position: absolute; inset: 0; background: var(--ds-color-fg); transform-origin: left; transition: transform var(--ds-duration-land) var(--ds-easing-out); }
.ds-evaltrack[data-red] > span { background: var(--ds-color-surface-accent); }
.ds-evalheads { display: flex; justify-content: flex-end; gap: var(--ds-space-md); padding-right: 46px; color: var(--ds-color-fg-muted); font-size: var(--ds-text-meta); line-height: var(--ds-text-meta-leading); }
.ds-evalheads > span { width: 40px; text-align: center; }
.ds-evalrow { display: flex; width: 100%; align-items: center; gap: var(--ds-space-xl); padding: 10px 16px; text-align: left; cursor: pointer; transition: background-color var(--ds-duration-micro) var(--ds-easing-standard); }
.ds-evalrow[aria-expanded="true"] { background: var(--ds-color-surface-subtle); }
.ds-evalrow:focus-visible { outline: var(--ds-border-focus) solid var(--ds-color-edge-accent); outline-offset: -2px; }
.ds-evalrow:active { background: color-mix(in srgb, var(--ds-color-fg) 8%, var(--ds-color-surface-subtle)); }
@media (hover: hover) and (pointer: fine) { .ds-evalrow:hover { background: var(--ds-color-surface-subtle); } }
.ds-evalmarks { display: flex; gap: var(--ds-space-md); }
.ds-evalmarks > span { display: flex; width: 40px; height: 16px; align-items: center; justify-content: center; color: var(--ds-color-fg-accent); }
.ds-evalmarks > span[data-ok] { color: var(--ds-color-fg); }
@media (max-width: 767px) {
  .ds-evalrow { flex-wrap: wrap; gap: 4px 8px; padding-inline: 12px; }
  .ds-evalrow > span:first-child { flex-basis: calc(100% - 22px); text-wrap: pretty; }
  .ds-evalrow .ds-chev { order: 1; align-self: flex-start; margin-top: 2px; }
  .ds-evalrow .ds-evalmarks { order: 2; flex-basis: 100%; gap: var(--ds-space-lg); }
  .ds-evalrow .ds-evalmarks > span { width: auto; gap: var(--ds-space-xs); font-size: var(--ds-text-meta); line-height: var(--ds-text-meta-leading); }
}
@media (prefers-reduced-motion: reduce) { .ds-evaltrack > span { transition: none; } }
`
