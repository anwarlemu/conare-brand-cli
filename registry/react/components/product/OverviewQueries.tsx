'use client'
import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import { BarChart } from '@/react/components/ui/BarChart'
import { LineChart, type LineSeries } from '@/react/components/ui/LineChart'
import { Tabs } from '@/react/components/ui/Tabs'
import { formatNumber } from '@/react/hooks/useChart'
import { runTransition } from '@/react/lib/transition'

// Overview's Queries card (platform/Queries.vue): volume or latency, three numbers over the chart (the chart item:
// BarChart for queries per day, LineChart for the last 24 hours' latency). Pointing at a number shows its part (this
// month's bars, today's bar, or the latency); a press pins it, with a 2px red edge. Nothing navigates: the chart changes
// in place, crossing over in 200ms. `latency` is the chart's series (p50, p95), each point a time and milliseconds.
export interface QueryDay { day: string, value: number }
export interface OverviewQueriesProps { thisMonth: number, p50: number, p95: number, days: QueryDay[], latency: LineSeries[] }
type Stat = '' | 'month' | 'today' | 'latency'
type View = 'volume' | 'latency'
const ms = (v: number) => `${Math.round(v)} ms`

export function OverviewQueries({ thisMonth, p50, p95, days, latency }: OverviewQueriesProps) {
  const [chart, setChart] = useState<View>('volume')
  const [pinned, setPinned] = useState<Stat>('')
  const [hot, setHot] = useState<Stat>('')
  const active = hot || pinned
  const view: View = active === 'latency' ? 'latency' : active ? 'volume' : chart
  function pin(stat: Exclude<Stat, ''>) {
    setPinned(pinned === stat ? '' : stat)
    setChart(stat === 'latency' ? 'latency' : 'volume')
  }
  const setTab = (v: View) => { setChart(v); setPinned('') }
  const today = days.at(-1)?.value ?? 0
  const month = days.at(-1)?.day.slice(0, 7) ?? ''
  const focus = active === 'today' ? (days.length ? [days.length - 1] : []) : active === 'month' ? days.flatMap((d, i) => (d.day.startsWith(month) ? [i] : [])) : undefined
  const note = active === 'today' ? `Today ${formatNumber(today)}` : active === 'month' ? `${new Date(`${month}-01T00:00:00Z`).toLocaleString('en-US', { month: 'long', timeZone: 'UTC' })} so far` : undefined

  // Vue's <Transition mode="out-in"> keyed by the view: the chart shown leaves, then the next enters.
  const [shown, setShown] = useState<View>(view)
  const box = useRef<HTMLDivElement | null>(null)
  const entering = useRef(false)
  useEffect(() => {
    if (view === shown) return
    const node = box.current
    if (!node) return setShown(view)
    let done = false
    void runTransition(node, 'ds-ovchart', 'leave').then(() => {
      if (done) return
      entering.current = true
      setShown(view)
    })
    return () => { done = true }
  }, [view, shown])
  useLayoutEffect(() => {
    if (!entering.current || !box.current) return
    entering.current = false
    void runTransition(box.current, 'ds-ovchart', 'enter')
  }, [shown])

  const stats = [['month', 'This month', formatNumber(thisMonth)], ['today', 'Today', formatNumber(today)], ['latency', 'Search p50, 24 h', `${p50} ms`]] as const
  return (
    <>
      <style href="ds-overview-queries" precedence="ds">{css}</style>
      <section data-ds="overview-queries" className="min-w-0 border border-edge bg-surface" aria-labelledby="queries-title">
        <div className="flex flex-wrap items-center justify-between gap-x-3 gap-y-1 border-b border-edge px-4 py-3">
          <h2 id="queries-title" className="type-ui-strong">Queries</h2>
          <Tabs value={view} onValueChange={setTab} options={[{ value: 'volume', label: 'Volume' }, { value: 'latency', label: 'Latency' }]} label="chart" />
        </div>
        <div className="flex flex-col gap-4 p-4">
          <div className="grid grid-cols-2 border-t border-l border-edge sm:grid-cols-3">
            {stats.map(s => (
              <button key={s[0]} type="button" className="ds-ovstat" aria-pressed={pinned === s[0]} data-on={active === s[0] || undefined} onClick={() => pin(s[0])} onPointerEnter={() => setHot(s[0])} onPointerLeave={() => setHot('')}>
                <span className="block type-meta text-fg-muted">{s[1]}</span>
                <span className="block text-heading-4 font-medium tabular-nums">{s[2]}{s[0] === 'latency' && <span className="ml-2 type-meta text-fg-muted">{`p95 ${p95} ms`}</span>}</span>
              </button>
            ))}
          </div>
          <div key={shown} ref={box}>
            {shown === 'volume' && days.some(d => d.value > 0)
              ? <BarChart points={days} label="Queries per day" height={192} focus={focus} note={note} />
              : shown === 'volume'
                ? <p className="py-8 text-center type-meta text-fg-muted">No queries yet.</p>
                : latency.some(l => l.points.length)
                  ? <LineChart title="Search latency, last 24 hours" series={latency} format={ms} smooth={3} height={192} bare />
                  : <p className="py-8 text-center type-meta text-fg-muted">No searches in the last 24 hours.</p>}
          </div>
        </div>
      </section>
    </>
  )
}

export default OverviewQueries

const css = `
.ds-ovstat { position: relative; width: 100%; padding: 8px 12px; border-right: var(--ds-border-hairline) solid var(--ds-color-edge); border-bottom: var(--ds-border-hairline) solid var(--ds-color-edge); text-align: left; cursor: pointer; transition: background-color var(--ds-duration-micro) var(--ds-easing-standard); }
.ds-ovstat[data-on] { background: var(--ds-color-surface-subtle); }
@media (hover: hover) and (pointer: fine) { .ds-ovstat:hover { background: var(--ds-color-surface-subtle); } }
.ds-ovstat[aria-pressed="true"]::before { position: absolute; top: -1px; right: -1px; left: -1px; height: 2px; background: var(--ds-color-edge-accent); content: ""; }
.ds-ovstat:focus-visible { outline: var(--ds-border-focus) solid var(--ds-color-edge-focus); outline-offset: -2px; }
.ds-ovchart-enter-active { transition: opacity var(--ds-duration-enter) var(--ds-easing-out), transform var(--ds-duration-drawer) var(--ds-easing-out); }
.ds-ovchart-leave-active { transition: opacity var(--ds-duration-exit) var(--ds-easing-standard), transform var(--ds-duration-exit) var(--ds-easing-standard); }
.ds-ovchart-enter-from { opacity: 0; transform: translateY(6px); }
.ds-ovchart-leave-to { opacity: 0; transform: translateY(-4px); }
@media (prefers-reduced-motion: reduce) {
  .ds-ovchart-enter-from, .ds-ovchart-leave-to { transform: none; }
}
`
