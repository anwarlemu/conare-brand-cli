'use client'
import { useEffect, useRef, useState, type CSSProperties, type MouseEvent, type PointerEvent } from 'react'
import { Check, Search, X } from 'lucide-react'
import { AccuracyDetailStyle, type AccuracyHandlers, type AccuracyRow, type AccuracyView } from '@/react/components/product/AccuracyDetail'
import { AccuracyThumb } from '@/react/components/product/AccuracyThumb'
import { Button } from '@/react/components/ui/Button'
import { DotMatrix } from '@/react/components/ui/DotMatrix'
import { Count } from '@/react/components/ui/Count'
import { PixelButton } from '@/react/components/ui/PixelButton'
import { CellBurst } from '@/react/components/visuals/CellBurst'
import { Grain } from '@/react/components/visuals/Grain'
import { useGlideMark } from '@/react/hooks/useGlideMark'
import { TransitionGroup } from '@/react/lib/transition'

// Accuracy, "Test at work" (accuracy/AtWork.vue, the version that ships): the website's benchmarks on the team's own
// questions. Four tiles in the double rule carry the results and filter the list on a click (a 2px red line runs across
// the picked one). Beside the list, a dark window holds a hundred squares, one a question, red where Conare reached the
// right page and hollow where it missed. Pointing at a question, in the list or on the field, glides a block to its row
// and a bracket to its square, and the window shows what each search handed back. The block follows the pointer at
// once; the window waits 80ms for it to rest, so a pointer crossing to the window's buttons changes nothing.
type Show = 'all' | 'current' | 'differ' | 'look'
export interface AccuracyAtWorkProps extends AccuracyHandlers { view: AccuracyView }

// The field, twenty squares to a row, with a crosshair and a bracket on the question on show.
const COLS = 20
const pitch = (n: number) => `calc(${n} * (100cqw + 4px) / ${COLS})`
const half = `(100cqw + 4px) / ${COLS * 2} - 2px`
const split = (text: string, key: string) => {
  const i = text.indexOf(key)
  return i < 0 ? [text, '', ''] : [text.slice(0, i), key, text.slice(i + key.length)]
}

export function AccuracyAtWork({ view, onFix, onSearch, onRemove }: AccuracyAtWorkProps) {
  const [show, setShow] = useState<Show>('all')
  const rows = view.rows
  const lists: Record<Show, AccuracyRow[]> = {
    all: rows,
    current: rows.filter(r => !r.current.ok),
    differ: rows.filter(r => r.conare.ok !== r.current.ok),
    look: rows.filter(r => !r.conare.ok),
  }
  const list = lists[show]
  const inList = new Set(list.map(r => r.id))
  const tiles = [
    { id: 'all' as Show, label: 'Conare', value: view.right, of: view.questions, line: 'reached the right page' },
    { id: 'current' as Show, label: view.current_name, value: view.current_right, of: view.questions, line: 'reached the right page' },
    { id: 'differ' as Show, label: 'Where they differ', value: lists.differ.length, of: 0, line: view.right >= view.current_right ? `Conare is ahead by ${view.right - view.current_right}` : 'Your search is ahead' },
    { id: 'look' as Show, label: 'To look at', value: lists.look.length, of: 0, line: lists.look.length ? 'each with its fix' : 'nothing left to fix' },
  ]
  const running = view.state === 'running'
  const [pickedId, setPickedId] = useState('')
  const picked = (running ? rows.at(-1) : rows.find(r => r.id === pickedId)) ?? list[0] ?? rows[0] ?? null
  const [shown, setShown] = useState(12)
  // Vue's watch on the filter: back to its first row and twelve shown; a square clicked outside the filter switches to
  // all and is then picked (pending).
  const firstShow = useRef(true)
  const pending = useRef<AccuracyRow | null>(null)
  useEffect(() => {
    if (firstShow.current) { firstShow.current = false; return }
    const row = pending.current
    pending.current = null
    setPickedId(row?.id ?? list[0]?.id ?? '')
    const i = row ? list.findIndex(r => r.id === row.id) : -1
    setShown(i >= 12 ? i + 1 : 12)
  }, [show]) // eslint-disable-line react-hooks/exhaustive-deps
  const pick = (row: AccuracyRow) => setPickedId(row.id)

  // The list's block (glide-mark's useGlideMark): one block for the whole list, gliding to the row pointed at or picked.
  const listEl = useRef<HTMLDivElement | null>(null)
  const restAt = () => {
    const i = list.slice(0, shown).findIndex(r => r.id === picked?.id)
    return i < 0 ? null : i
  }
  const { mark, shown: markShown, instant: markInstant, point, leave, settle } = useGlideMark(listEl, restAt)
  const resting = useRef<ReturnType<typeof setTimeout> | undefined>(undefined)
  function onRow(row: AccuracyRow, i: number, event: PointerEvent) {
    if (event.pointerType !== 'mouse') return
    point(i)
    clearTimeout(resting.current)
    // ds-latency: the window waits for the pointer to rest on a row; the block under it moved at once.
    resting.current = setTimeout(() => pick(row), 80)
  }
  function offList() {
    clearTimeout(resting.current)
    leave()
  }
  useEffect(() => settle(), [picked?.id, show, shown, rows.length]) // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => () => clearTimeout(resting.current), [])

  const cells = [...rows.map(r => ({ id: r.id, ok: r.conare.ok, queued: false })), ...view.queued.map(q => ({ id: q.id, ok: false, queued: true }))]
  const at = Math.max(0, cells.findIndex(c => c.id === picked?.id))
  const scope = { c: at % COLS, r: Math.floor(at / COLS) }
  const rowAt = (event: { target: EventTarget }) => rows.find(r => r.id === (event.target as HTMLElement).dataset.id)
  function pointField(event: PointerEvent) {
    const row = rowAt(event)
    if (row && event.pointerType === 'mouse' && inList.has(row.id)) pick(row)
  }
  function clickField(event: MouseEvent) {
    const row = rowAt(event)
    if (!row) return
    if (!inList.has(row.id)) {
      pending.current = row
      setShow('all')
      return
    }
    pick(row)
    const i = list.findIndex(r => r.id === row.id)
    if (i >= shown) setShown(i + 1)
  }
  // On a narrow page the window sits above the list, so a tap takes you to it.
  const panel = useRef<HTMLElement | null>(null)
  function tap(row: AccuracyRow) {
    pick(row)
    if (matchMedia('(max-width: 1023px)').matches) panel.current?.scrollIntoView({ block: 'start', behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth' })
  }
  const answers = picked ? [{ id: 'current', label: view.current_name, hit: picked.current }, { id: 'conare', label: 'Conare', hit: picked.conare }] : []

  return (
    <>
      <style href="ds-accuracy-at-work" precedence="ds">{css}</style>
      <AccuracyDetailStyle />
      <section data-ds="accuracy-at-work" className="m-1.25 grid grid-cols-4 gap-px border border-edge bg-edge outline outline-offset-4 outline-edge max-lg:grid-cols-2" aria-label="results">
        {tiles.map(t => (
          <button key={t.id} type="button" className="ds-testtile" aria-pressed={show === t.id} data-red={(t.id === 'look' && t.value > 0) || undefined} onClick={() => setShow(t.id)}>
            <span className="block type-meta">{t.label}</span>
            <span className="ds-testtile-num"><Count value={t.value} once={`accuracy-${t.id}`} />{t.of ? <span className="ds-testtile-of">{` of ${t.of}`}</span> : null}</span>
            <span className="block type-meta">{t.line}</span>
          </button>
        ))}
      </section>

      <div data-ds="accuracy-at-work" className="grid grid-cols-2 items-start gap-6 max-lg:grid-cols-1">
        <div ref={listEl} className="relative flex min-w-0 flex-col" onPointerLeave={offList}>
          {mark && <span className="ds-glidemark" data-shown={markShown || undefined} data-instant={markInstant || undefined} style={{ transform: `translateY(${mark.y}px)`, height: `${mark.h}px` }} aria-hidden="true" />}
          {!list.length
            ? <p className="px-3 py-3 type-meta text-fg-muted">No questions here.</p>
            : <p className="flex items-center gap-3 border-b border-edge px-3 pb-2 type-meta text-fg-muted" aria-hidden="true"><span className="flex-1">Question</span><span className="ds-testmarks"><span>Current</span><span>Conare</span></span></p>}
          {list.slice(0, shown).map((r, i) => (
            <button key={r.id} type="button" data-glide-row className="ds-testrow" aria-current={picked?.id === r.id || undefined} onPointerEnter={e => onRow(r, i, e)} onFocus={() => { pick(r); point(i) }} onClick={() => tap(r)}>
              <span className="min-w-0 flex-1 truncate max-sm:whitespace-normal">{r.question}</span>
              <span className="ds-testmarks" aria-hidden="true">
                <span data-ok={r.current.ok || undefined}>{r.current.ok ? <Check size={12} strokeWidth={2} /> : <X size={12} strokeWidth={2} />}</span>
                <span data-ok={r.conare.ok || undefined}>{r.conare.ok ? <Check size={12} strokeWidth={2} /> : <X size={12} strokeWidth={2} />}</span>
              </span>
              <span className="sr-only">{`${view.current_name}: ${r.current.ok ? 'right page' : 'wrong page'}. Conare: ${r.conare.ok ? 'right page' : 'wrong page'}.`}</span>
            </button>
          ))}
          {shown < list.length && <Button variant="ghost" press className="mt-2 self-start" onClick={() => setShown(s => s + 12)}>Show 12 more</Button>}
        </div>

        <section ref={panel} className="ds-testpanel m-1.25" aria-label="the question on show">
          <Grain />
          <div className="pointer-events-none absolute inset-0 opacity-70" aria-hidden="true"><CellBurst seed={31} jumble /></div>
          <div className="relative w-full border border-code-edge bg-code text-code-fg">
            <div className="flex h-11 items-center gap-2 px-4 text-ui leading-4">
              <span className="size-2 shrink-0 bg-surface-accent" aria-hidden="true" />
              <span className="truncate">Your test</span>
              <span className="shrink-0 bg-code-raised px-1.5 py-0.5 type-meta tabular-nums">{running ? `${view.done} of ${view.questions}` : `${view.questions} questions`}</span>
            </div>
            <div className="ds-testfield" role="img" aria-label={`${view.right} of ${view.questions} questions reached the right page`} onPointerMove={pointField} onClick={clickField}>
              {cells.map((c, i) => <span key={c.id} className="ds-testcell" data-id={c.id} data-ok={c.ok || undefined} data-queued={c.queued || undefined} data-dim={(!c.queued && !inList.has(c.id)) || undefined} style={{ '--r': Math.floor(i / COLS) } as CSSProperties} />)}
              {picked && <span className="ds-testline" data-h aria-hidden="true" style={{ transform: `translateY(calc(${pitch(scope.r)} + ${half}))` }} />}
              {picked && <span className="ds-testline" data-v aria-hidden="true" style={{ transform: `translateX(calc(${pitch(scope.c)} + ${half}))` }} />}
              {picked && <svg className="ds-bracket" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true" style={{ transform: `translate(${pitch(scope.c)}, ${pitch(scope.r)})` }}><path d="M0 34V0H34M66 0H100V34M100 66V100H66M34 100H0V66" vectorEffect="non-scaling-stroke" /></svg>}
            </div>
            <div className="grid min-h-85 border-t border-code-edge max-lg:min-h-0">
              <TransitionGroup name="ds-winswap">
                {picked
                  ? [(
                      <div key={running ? 'run' : picked.id} className="ds-testswap">
                        <p className="bg-code-raised px-3 py-2 text-ui">{picked.question}</p>
                        {running
                          ? <p className="flex items-center gap-2 text-ui text-code-muted"><DotMatrix tone="inverse" />Searching your data</p>
                          : (
                              <>
                                {answers.map(a => (
                                  <div key={a.id} className="ds-testanswer">
                                    <AccuracyThumb number={a.hit.number} top={a.hit.top} />
                                    <div className="min-w-0 flex-1">
                                      <p className="flex items-center justify-between gap-3 type-meta text-code-muted"><span>{a.label}</span><span className="ds-testverdict" data-ok={a.hit.ok || undefined}>{a.hit.ok ? 'Right page' : 'Wrong page'}</span></p>
                                      <p className="mt-1 text-ui text-code-muted">{split(a.hit.text, a.hit.key)[0]}<strong className="font-medium text-code-fg">{split(a.hit.text, a.hit.key)[1]}</strong>{split(a.hit.text, a.hit.key)[2]}</p>
                                      <p className="mt-1 flex justify-between gap-3 type-meta text-code-muted"><span className="truncate">{a.hit.id}</span><span className="shrink-0">{`Page ${a.hit.number} of ${a.hit.count}`}</span></p>
                                    </div>
                                  </div>
                                ))}
                                {picked.fix && <p className="text-ui">{picked.fix.why}</p>}
                                <div className="mt-auto flex flex-wrap items-center gap-x-4 gap-y-2">
                                  {picked.fix && <PixelButton onClick={() => onFix?.(picked)}>{picked.fix.action}</PixelButton>}
                                  <button type="button" className="ds-testlink" onClick={() => onSearch?.(picked)}><Search size={12} strokeWidth={1.5} aria-hidden="true" />Search it</button>
                                  <button type="button" className="ds-testlink" onClick={() => onRemove?.(picked)}>Remove question</button>
                                </div>
                              </>
                            )}
                      </div>
                    )]
                  : []}
              </TransitionGroup>
            </div>
          </div>
        </section>
      </div>
    </>
  )
}

export default AccuracyAtWork

const css = `
.ds-testtile { position: relative; display: flex; min-width: 0; flex-direction: column; gap: var(--ds-space-xs); padding: 16px; background: var(--ds-color-surface); color: var(--ds-color-fg-muted); text-align: left; cursor: pointer; touch-action: manipulation; transition: background-color var(--ds-duration-enter) var(--ds-easing-standard), color var(--ds-duration-enter) var(--ds-easing-standard); }
.ds-testtile::before { position: absolute; inset: 0 0 auto; height: 2px; background: var(--ds-color-surface-accent); content: ""; transform: scaleX(0); transform-origin: left; transition: transform var(--ds-duration-enter) var(--ds-easing-out); }
.ds-testtile[aria-pressed="true"] { background: var(--ds-color-surface-subtle); color: var(--ds-color-fg); }
.ds-testtile[aria-pressed="true"]::before { transform: scaleX(1); }
.ds-testtile:active { background: color-mix(in srgb, var(--ds-color-fg) 8%, var(--ds-color-surface-subtle)); }
.ds-testtile:focus-visible { outline: var(--ds-border-focus) solid var(--ds-color-edge-accent); outline-offset: -2px; }
.ds-testtile-num { display: block; margin-top: 16px; color: var(--ds-color-fg); font-family: var(--ds-font-heading); font-size: var(--ds-text-heading-1); line-height: var(--ds-text-heading-1-leading); letter-spacing: var(--ds-tracking-display); font-variant-numeric: tabular-nums; white-space: nowrap; }
.ds-testtile-of { font-size: var(--ds-text-heading-4); letter-spacing: 0; }
.ds-testtile[data-red] .ds-testtile-num { color: var(--ds-color-fg-accent); }
.ds-testmarks { display: flex; flex-shrink: 0; }
.ds-testmarks > span { display: inline-flex; width: 56px; justify-content: center; color: var(--ds-color-fg-accent); }
.ds-testmarks > span[data-ok] { color: var(--ds-color-fg); }
p > .ds-testmarks > span { color: inherit; }
.ds-glidemark { position: absolute; top: 0; right: 0; left: 0; border-left: 2px solid var(--ds-color-edge-accent); background: var(--ds-color-surface-subtle); opacity: 0; pointer-events: none; transition: transform var(--ds-duration-glide) var(--ds-easing-out), opacity var(--ds-duration-micro) var(--ds-easing-standard); }
.ds-glidemark[data-shown] { opacity: 1; }
.ds-glidemark[data-instant] { transition: opacity var(--ds-duration-micro) var(--ds-easing-standard); }
.ds-testrow { position: relative; display: flex; width: 100%; min-height: 40px; align-items: center; gap: var(--ds-space-lg); padding: 8px 12px; border-bottom: var(--ds-border-hairline) solid var(--ds-color-edge); line-height: 20px; text-align: left; cursor: pointer; touch-action: manipulation; }
.ds-testrow:focus-visible { outline: var(--ds-border-focus) solid var(--ds-color-edge-accent); outline-offset: -2px; }
.ds-testpanel { position: sticky; top: 64px; display: flex; min-height: 480px; align-items: flex-start; padding: 24px; overflow: hidden; outline: var(--ds-border-hairline) solid var(--ds-color-edge); outline-offset: 4px; background: var(--ds-color-code-raised); }
.ds-testfield { position: relative; display: grid; grid-template-columns: repeat(20, minmax(0, 1fr)); gap: var(--ds-space-xs); margin: 4px 16px 16px; container-type: inline-size; cursor: crosshair; touch-action: manipulation; }
.ds-testcell { aspect-ratio: 1; border: var(--ds-border-hairline) solid var(--ds-color-code-muted); transition: opacity var(--ds-duration-micro) var(--ds-easing-standard), background-color var(--ds-duration-micro) var(--ds-easing-standard), border-color var(--ds-duration-micro) var(--ds-easing-standard); }
.ds-testcell[data-ok] { border-color: var(--ds-color-surface-accent); background: var(--ds-color-surface-accent); }
.ds-testcell[data-queued] { border-color: var(--ds-color-code-edge); background: var(--ds-color-code-edge); }
.ds-testcell[data-dim] { opacity: 0.24; }
@media (prefers-reduced-motion: no-preference) {
  .ds-testcell { animation: ds-testcell var(--ds-duration-enter) var(--ds-easing-out) both; animation-delay: calc(var(--r) * 40ms); }
}
@keyframes ds-testcell { from { opacity: 0; transform: scale(0.9); } }
.ds-testline { position: absolute; top: 0; left: 0; background: var(--ds-color-code-fg); opacity: 0.24; pointer-events: none; transition: transform var(--ds-duration-glide) var(--ds-easing-out); }
.ds-testline[data-h] { right: 0; height: 1px; }
.ds-testline[data-v] { bottom: 0; width: 1px; }
.ds-bracket { position: absolute; top: -2px; left: -2px; width: calc((100cqw + 4px) / 20); height: calc((100cqw + 4px) / 20); overflow: visible; color: var(--ds-color-code-fg); pointer-events: none; transition: transform var(--ds-duration-glide) var(--ds-easing-out); }
.ds-bracket path { fill: none; stroke: currentColor; stroke-width: 1.5; }
.ds-testswap { display: flex; min-width: 0; flex-direction: column; gap: var(--ds-space-lg); padding: 16px; grid-area: 1 / 1; }
.ds-winswap-enter-active { transition: opacity var(--ds-duration-fade) var(--ds-easing-out), filter var(--ds-duration-fade) var(--ds-easing-out); }
.ds-winswap-leave-active { transition: opacity var(--ds-duration-swap-out) var(--ds-easing-out); }
.ds-winswap-enter-from { opacity: 0; filter: blur(2px); }
.ds-winswap-leave-to { opacity: 0; }
.ds-testanswer { display: flex; align-items: flex-start; gap: var(--ds-space-lg); }
.ds-testanswer + .ds-testanswer { padding-top: 12px; border-top: var(--ds-border-hairline) solid var(--ds-color-code-edge); }
.ds-testverdict { display: inline-flex; flex-shrink: 0; align-items: center; gap: var(--ds-space-sm); }
.ds-testverdict::before { width: 6px; height: 6px; border: var(--ds-border-hairline) solid var(--ds-color-code-muted); content: ""; }
.ds-testverdict[data-ok] { color: var(--ds-color-code-fg); }
.ds-testverdict[data-ok]::before { border-color: var(--ds-color-surface-accent); background: var(--ds-color-surface-accent); }
.ds-testlink { display: inline-flex; min-height: 28px; align-items: center; gap: var(--ds-space-sm); color: var(--ds-color-code-muted); font-size: var(--ds-text-meta); line-height: var(--ds-text-meta-leading); cursor: pointer; transition: color var(--ds-duration-micro) var(--ds-easing-standard); }
@media (hover: hover) and (pointer: fine) { .ds-testlink:hover { color: var(--ds-color-code-fg); } }
.ds-testlink:focus-visible { outline: var(--ds-border-focus) solid var(--ds-color-edge-accent); outline-offset: 2px; }
@media (max-width: 1023px) {
  .ds-testpanel { position: relative; top: auto; order: -1; min-height: 0; padding: 12px; scroll-margin-top: 64px; }
}
@media (max-width: 767px) {
  .ds-testtile { padding: 12px; }
  .ds-testtile-num { font-size: var(--ds-text-heading-2); line-height: var(--ds-text-heading-2-leading); }
  .ds-testtile-of { font-size: var(--ds-text-body); }
  .ds-testfield { margin-inline: 12px; }
  .ds-testswap { padding: 12px; }
  .ds-testmarks > span { width: 48px; }
}
@media (pointer: coarse), (max-width: 767px) { .ds-testrow { min-height: 44px; } .ds-testlink { min-height: 40px; } }
@media (prefers-reduced-motion: reduce) {
  .ds-glidemark, .ds-testline, .ds-bracket { transition: none; }
  .ds-winswap-enter-from { filter: none; }
}
`
