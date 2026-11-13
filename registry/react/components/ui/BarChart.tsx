'use client'
import { useState, type CSSProperties } from 'react'
import { type DayPoint, compactNumber, formatDay, formatNumber, niceTicks } from '@/react/hooks/useChart'
import { cn } from '@/react/lib/cn'

// A red bar per day (BarChart.vue). The axis starts at 0 and ends on a round number in four steps; grid lines are 1px
// hairlines. A day with any activity keeps a visible bar. Pointing at a bar names its day and value in the caption and
// quiets the others. The bars rise from the axis once, staggered over the same 120ms for 7 days or 90.
// `focus`: bars lit from outside, the rest quiet, as under the pointer; `note`: what the caption says meanwhile.
// `week`: the change over the last seven days, set over those bars. `held`: on its way, the axis alone at its height.
// `bare` drops the caption's label, for a chart under a stat that already names it.
export interface BarChartProps {
  points: DayPoint[]
  label: string
  height?: number
  focus?: number[]
  note?: string
  week?: string
  held?: boolean
  bare?: boolean
}

export function BarChart({ points, label, height = 160, focus, note, week, held, bare }: BarChartProps) {
  const ticks = niceTicks(points.map(p => p.value))
  const top = ticks[ticks.length - 1]!
  // Four dates under the bars: the first, the last and two between.
  const n = points.length
  const marks = n ? [...new Set([0, Math.round((n - 1) / 3), Math.round((2 * (n - 1)) / 3), n - 1])].map(i => ({ left: `${((i + 0.5) / n) * 100}%`, text: formatDay(points[i]!.day) })) : []
  const [hover, setHover] = useState<number | null>(null)
  const shown = hover === null ? null : points[hover] ?? null
  const peak = formatNumber(Math.max(0, ...points.map(p => p.value)))
  return (
    <figure data-ds="bar-chart" className="ds-barchart flex flex-col gap-3" data-bare={bare || undefined}>
      <style href="ds-bar-chart" precedence="ds">{css}</style>
      <figcaption className="ds-barchart-cap flex h-5 items-baseline justify-between gap-4">
        <span className="ds-chart-caption">{label}</span>
        {shown
          ? <span className="ds-chart-meta">{`${formatDay(shown.day, true)} `}<span className="font-medium text-fg">{formatNumber(shown.value)}</span></span>
          : note ? <span className="ds-chart-meta">{note}</span> : null}
      </figcaption>
      {held
        ? (
            <div className="grid grid-cols-[40px_minmax(0,1fr)] gap-x-2" aria-hidden="true">
              <div />
              <div className="relative" style={{ height: `${height}px` }}><div className="absolute inset-x-0 bottom-0 border-t border-edge" /></div>
              <div />
              <div className="mt-2 h-4" />
            </div>
          )
        : !points.length
            ? <p className="flex items-center justify-center type-ui text-fg-muted" style={{ height: `${height}px` }}>No activity yet.</p>
            : (
                <div className="grid grid-cols-[40px_minmax(0,1fr)] gap-x-2">
                  <div className="relative" style={{ height: `${height}px` }} aria-hidden="true">
                    {ticks.map(t => <span key={t} className="ds-chart-meta absolute right-0 -translate-y-1/2" style={{ top: `${(1 - t / top) * 100}%` }}>{compactNumber(t)}</span>)}
                  </div>
                  <div
                    className="relative"
                    style={{ height: `${height}px` }}
                    role="img"
                    aria-label={`${label}: ${points.length} days, peak ${peak}${week ? `, ${week} this week` : ''}`}
                    onPointerLeave={() => setHover(null)}
                  >
                    {ticks.map(t => <div key={t} className="pointer-events-none absolute inset-x-0 border-t border-data-grid" style={{ top: `${(1 - t / top) * 100}%` }} />)}
                    {week && !shown && <p className="ds-chart-week" style={{ width: `${(Math.min(7, points.length) / points.length) * 100}%` }}><span className="font-medium tabular-nums">{week}</span><span className="text-fg-muted">this week</span></p>}
                    <div className="absolute inset-0 flex items-end">
                      {points.map((p, i) => (
                        <div key={p.day} className="flex h-full flex-1 items-end" onPointerEnter={() => setHover(i)}>
                          <div
                            className={cn('ds-bar mx-auto w-[70%]', hover === i || (hover === null && (!focus || focus.includes(i))) ? 'bg-data-highlight' : 'bg-ds-neutral-600')}
                            style={{ height: p.value > 0 ? `max(2px, ${(p.value / top) * 100}%)` : '0', '--i': (i * 30) / points.length } as CSSProperties}
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                  <div />
                  <div className="relative mt-2 h-4" aria-hidden="true">
                    {marks.map((m, i) => (
                      <span
                        key={m.text}
                        className={cn('ds-chart-meta absolute whitespace-nowrap', i === 0 ? 'left-0' : i === marks.length - 1 ? 'right-0' : '-translate-x-1/2')}
                        style={i === 0 || i === marks.length - 1 ? {} : { left: m.left }}
                      >{m.text}</span>
                    ))}
                  </div>
                </div>
              )}
    </figure>
  )
}

export default BarChart

const css = `
/* The charts' caption: 12px medium, muted (written in sentence case); meta and axis labels 12px muted in tabular figures. */
.ds-chart-caption { color: var(--ds-color-fg-muted); font-size: var(--ds-text-meta); font-weight: var(--ds-font-weight-medium); line-height: var(--ds-text-meta-leading); }
.ds-chart-meta { color: var(--ds-color-fg-muted); font-size: var(--ds-text-meta); line-height: var(--ds-text-meta-leading); font-variant-numeric: tabular-nums; }
/* A bar rises from the axis once (console2.css .c-bar), then only its colour changes. */
.ds-bar { transform-origin: bottom; animation: ds-bar-in var(--ds-duration-rise) var(--ds-easing-out) both; animation-delay: calc(var(--i, 0) * 4ms); transition: background-color var(--ds-duration-glide) var(--ds-easing-standard); }
@keyframes ds-bar-in { from { transform: scaleY(0.02); } }
/* The week's change, over the last seven bars on a red rule. */
.ds-chart-week { position: absolute; right: 0; bottom: 100%; display: flex; justify-content: flex-end; gap: var(--ds-space-xs); margin-bottom: var(--ds-space-xs); padding-bottom: calc(var(--ds-space-xs) - 1px); border-bottom: var(--ds-border-hairline) solid var(--ds-color-edge-accent); font-size: var(--ds-text-meta); line-height: var(--ds-text-meta-leading); white-space: nowrap; }
/* Under a stat that names it (the usage cards), the value read out sits over the chart's top right. */
.ds-barchart[data-bare] { position: relative; }
.ds-barchart[data-bare] > .ds-barchart-cap { position: absolute; top: -24px; right: 0; z-index: 1; height: auto; }
.ds-barchart[data-bare] .ds-chart-caption { display: none; }
.ds-barchart[data-bare] .ds-barchart-cap .ds-chart-meta { padding: 0 var(--ds-space-xs); background: var(--ds-color-surface); }
@media (prefers-reduced-motion: reduce) { .ds-bar { animation: none; } }
`
