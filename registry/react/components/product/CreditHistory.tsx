'use client'
import { useEffect, useLayoutEffect, useRef, useState, type CSSProperties } from 'react'
import { cn } from '@/react/lib/cn'

// Every time credits were added, newest first (the console's billing/Grants.vue, take 1, show more). A team can add
// credits for years, so it never opens all at once: the latest five, then five more at a time. The list is a rule
// with a square on it for each grant, the newest red; new lines land on the rule one after the other (30ms apart)
// while the list tweens to its new height in 200ms. Past six lines it scrolls inside its window, the edges with more
// behind them fading, its own slim bar in the margin while it moves, and Show more runs it down to the new lines.
// `timeZone` fixes the dates' zone (rendered on a server, pass the reader's or UTC so both renders agree).
export interface Grant { amount: number, reason: string, date: string }

export interface CreditHistoryProps {
  grants: Grant[]
  currency?: string
  step?: number
  timeZone?: string
  className?: string
}

const reduced = () => matchMedia('(prefers-reduced-motion: reduce)').matches

// A full list runs down to the new lines on its own curve (320ms, a quartic ease-out).
function glide(el: HTMLElement, to: number) {
  if (to <= el.scrollTop) return
  if (reduced()) {
    el.scrollTop = to
    return
  }
  const from = el.scrollTop
  const start = performance.now()
  const step = (now: number) => {
    const t = Math.min(1, (now - start) / 320)
    el.scrollTop = from + (to - from) * (1 - (1 - t) ** 4)
    if (t < 1) requestAnimationFrame(step)
  }
  requestAnimationFrame(step)
}

export function CreditHistory({ grants, currency = 'USD', step = 5, timeZone, className }: CreditHistoryProps) {
  const money = (n: number) => n.toLocaleString('en-US', { style: 'currency', currency })
  const when = (iso: string) => {
    const d = new Date(iso)
    return Number.isNaN(d.getTime()) ? iso : d.toLocaleString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: 'numeric', minute: '2-digit', timeZone })
  }
  const sorted = [...grants].sort((a, b) => b.date.localeCompare(a.date))
  const [shown, setShown] = useState(step)
  const more = Math.min(step, sorted.length - shown)
  const [fresh, setFresh] = useState<number>()

  const box = useRef<HTMLDivElement | null>(null)
  const list = useRef<HTMLDivElement | null>(null)
  // The height before Show more, read again once the new lines are in the page (Vue's nextTick).
  const from = useRef<number | null>(null)
  function showMore() {
    setFresh(shown)
    from.current = box.current?.offsetHeight ?? 0
    setShown(s => s + step)
  }

  // The slim bar: there while the list moves or is pointed at.
  const [bar, setBar] = useState({ top: 0, height: 0, above: false, below: false })
  const [moving, setMoving] = useState(false)
  const resting = useRef<ReturnType<typeof setTimeout> | undefined>(undefined)
  function placeBar() {
    const el = list.current
    if (!el) return
    const { scrollTop, scrollHeight, clientHeight } = el
    const room = scrollHeight - clientHeight
    setBar({ top: (scrollTop / scrollHeight) * clientHeight, height: room > 0 ? (clientHeight / scrollHeight) * clientHeight : 0, above: scrollTop > 1, below: scrollTop < room - 1 })
  }
  function onScroll() {
    placeBar()
    setMoving(true)
    clearTimeout(resting.current)
    // ds-latency: the bar fades a moment after the list stops; nothing waits on it.
    resting.current = setTimeout(() => setMoving(false), 700)
  }
  useEffect(() => () => clearTimeout(resting.current), [])

  useLayoutEffect(() => {
    const start = from.current
    if (start === null) return
    from.current = null
    const el = box.current
    const to = el?.offsetHeight ?? start
    if (el && to !== start && !reduced()) {
      const easing = getComputedStyle(el).getPropertyValue('--ds-easing-out').trim() || 'ease-out'
      el.animate([{ height: `${start}px`, overflow: 'hidden' }, { height: `${to}px`, overflow: 'hidden' }], { duration: 200, easing })
    }
    placeBar()
    if (list.current) glide(list.current, list.current.scrollHeight - list.current.clientHeight)
  }, [shown])

  return (
    <div data-ds="credit-history" ref={box} className={cn('flex min-w-0 flex-col gap-4', className)}>
      <style href="ds-credit-history" precedence="ds">{css}</style>
      <div className="ds-grants-view relative">
        <div ref={list} className="ds-grants" data-above={bar.above || undefined} data-below={bar.below || undefined} tabIndex={0} role="region" aria-label="credits added" onScroll={onScroll}>
          <ol className="ds-ledger">
            {sorted.slice(0, shown).map((g, i) => {
              const isNew = fresh != null && i >= fresh
              return (
                <li key={g.date + g.reason} data-new={isNew || undefined} style={isNew ? { '--i': i - fresh } as CSSProperties : undefined}>
                  <span className="min-w-0">
                    <span className="block">{g.reason}</span>
                    <span className="block type-meta text-fg-muted">{when(g.date)}</span>
                  </span>
                  <span className="shrink-0 font-medium tabular-nums">{`+${money(g.amount)}`}</span>
                </li>
              )
            })}
          </ol>
        </div>
        {bar.height > 0 && <span className="ds-grants-bar" data-on={moving || undefined} style={{ height: `${bar.height}px`, transform: `translateY(${bar.top}px)` }} aria-hidden="true" />}
      </div>
      {more > 0 && <button type="button" className="ds-more self-start" onClick={showMore}>{`Show ${more} more`}</button>}
    </div>
  )
}

export default CreditHistory

const css = `
.ds-grants { --fade-top: 0px; --fade-foot: 0px; max-height: max(224px, calc(76vh - 264px)); overflow-y: auto; overscroll-behavior: contain; scrollbar-width: none; -webkit-mask-image: linear-gradient(transparent, var(--ds-color-off-black) var(--fade-top), var(--ds-color-off-black) calc(100% - var(--fade-foot)), transparent); mask-image: linear-gradient(transparent, var(--ds-color-off-black) var(--fade-top), var(--ds-color-off-black) calc(100% - var(--fade-foot)), transparent); }
.ds-grants::-webkit-scrollbar { display: none; }
.ds-grants[data-above] { --fade-top: 28px; }
.ds-grants[data-below] { --fade-foot: 28px; }
.ds-grants:focus-visible { outline: var(--ds-border-focus) solid var(--ds-color-edge-accent); outline-offset: -2px; }
.ds-grants-bar { position: absolute; top: 0; right: -12px; width: 3px; background: var(--ds-color-edge-strong); opacity: 0; pointer-events: none; transition: opacity var(--ds-duration-enter) var(--ds-easing-standard); }
.ds-grants-bar[data-on] { opacity: 1; transition-duration: var(--ds-duration-cell); }
@media (hover: hover) and (pointer: fine) { .ds-grants-view:hover > .ds-grants-bar { opacity: 1; transition-duration: var(--ds-duration-cell); } }
/* ds-override: 3px in centers the 5px squares on the 1px rule, as the console measures it. */
.ds-ledger { display: flex; flex-direction: column; margin: 0 0 0 3px; padding: 0; border-left: var(--ds-border-hairline) solid var(--ds-color-edge); list-style: none; }
.ds-ledger > li { position: relative; display: flex; align-items: center; justify-content: space-between; gap: var(--ds-space-xl); padding: 10px 0 10px 18px; font-size: var(--ds-text-ui); line-height: var(--ds-text-ui-leading); }
/* ds-override: the 5px square sits centered on the row and the rule (-3px), as measured. */
.ds-ledger > li::before { position: absolute; top: 50%; left: -3px; width: 5px; height: 5px; margin-top: -3px; background: var(--ds-color-surface-inverse); content: ""; }
.ds-ledger > li:first-child::before { background: var(--ds-color-edge-accent); }
.ds-ledger > li[data-new] > * { animation: ds-grant-in var(--ds-duration-drawer) var(--ds-easing-out) both; animation-delay: calc(var(--i) * 30ms); }
.ds-ledger > li[data-new]::before { animation: ds-grant-mark var(--ds-duration-enter) var(--ds-easing-out) both; animation-delay: calc(var(--i) * 30ms); }
@keyframes ds-grant-in { from { opacity: 0; transform: translateY(8px); } }
@keyframes ds-grant-mark { from { opacity: 0; transform: scale(0.4); } }
.ds-more { position: relative; margin-left: 4px; color: var(--ds-color-fg-soft); font-size: var(--ds-text-meta); font-weight: var(--ds-font-weight-medium); line-height: var(--ds-text-meta-leading); white-space: nowrap; cursor: pointer; transition: color var(--ds-duration-micro) var(--ds-easing-standard); }
@media (hover: hover) and (pointer: fine) { .ds-more:hover { color: var(--ds-color-fg); } }
.ds-more:focus-visible { outline: var(--ds-border-focus) solid var(--ds-color-edge-accent); outline-offset: 2px; }
@media (pointer: coarse), (max-width: 767px) { .ds-more::after { position: absolute; inset: -12px; content: ""; } }
@media (prefers-reduced-motion: reduce) { .ds-ledger > li[data-new] > *, .ds-ledger > li[data-new]::before { animation: none; } }
`
