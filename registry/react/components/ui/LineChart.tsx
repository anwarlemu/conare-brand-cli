'use client'
import { useState, type PointerEvent } from 'react'
import { cn } from '@/react/lib/cn'

// Lines over time (LineChart.vue): one axis from 0, 2px lines in the brand's series order (red, neutral-400,
// neutral-600 dashed, so colour is never the only difference), the first series shading the area under it, a legend
// when there is more than one, and a crosshair with the values under the pointer. `smooth = k` draws each point as the
// mean of the points within k / 2 steps of it in time, for series too sparse to read point by point. In a card by
// default; `bare` drops the card, for a chart already inside one.
export type LineSeries = { label: string, points: Array<{ t: number, v: number }> }

export interface LineChartProps {
  title: string
  series: LineSeries[]
  format: (value: number) => string
  smooth?: number
  height?: number
  bare?: boolean
}

const W = 600
const H = 160
const COLORS = ['var(--ds-color-data-1)', 'var(--ds-color-data-2)', 'var(--ds-color-data-3)']
const DASH = ['', '', '5 4']

export function LineChart({ title, series, format, smooth, height, bare }: LineChartProps) {
  const all = [...new Set(series.flatMap(s => s.points.map(p => p.t)))].sort((a, b) => a - b)
  const step = Math.min(...all.slice(1).map((v, i) => v - all[i]!))
  function rolling(points: Array<{ t: number, v: number }>, k: number) {
    const reach = Math.floor(k / 2) * step
    if (!(reach > 0) || !Number.isFinite(reach)) return points
    return points.map((p) => {
      const near = points.filter(q => Math.abs(q.t - p.t) <= reach)
      return { t: p.t, v: near.reduce((n, q) => n + q.v, 0) / near.length }
    })
  }
  const lines = series.slice(0, 3).filter(s => s.points.length).map(s => ({ ...s, points: rolling(s.points, smooth ?? 1) }))
  const times = [...new Set(lines.flatMap(s => s.points.map(p => p.t)))].sort((a, b) => a - b)
  const span = { from: times[0] ?? 0, to: times[times.length - 1] ?? 1 }
  const top = Math.max(0, ...lines.flatMap(s => s.points.map(p => p.v)))
  const max = top <= 0 ? 1 : Math.ceil(top / 10 ** Math.floor(Math.log10(top))) * 10 ** Math.floor(Math.log10(top))
  const x = (t: number) => (span.to === span.from ? W / 2 : ((t - span.from) / (span.to - span.from)) * W)
  const y = (v: number) => H - (v / max) * H

  const paths = lines.map((s, i) => ({
    label: s.label,
    color: COLORS[i]!,
    dash: DASH[i]!,
    d: s.points.map((p, j) => `${j ? 'L' : 'M'}${x(p.t).toFixed(1)},${y(p.v).toFixed(1)}`).join(''),
    last: s.points[s.points.length - 1]!,
    area: i ? '' : `M${x(s.points[0]!.t).toFixed(1)},${H}${s.points.map(p => `L${x(p.t).toFixed(1)},${y(p.v).toFixed(1)}`).join('')}L${x(s.points[s.points.length - 1]!.t).toFixed(1)},${H}Z`,
  }))

  const [hover, setHover] = useState<number | null>(null)
  function move(event: PointerEvent<HTMLDivElement>) {
    const box = event.currentTarget.getBoundingClientRect()
    const t = span.from + ((event.clientX - box.left) / box.width) * (span.to - span.from)
    let best: number | null = null
    for (const c of times) if (best === null || Math.abs(c - t) < Math.abs(best - t)) best = c
    setHover(best)
  }
  // Local time; with the day too over a range longer than 12 hours.
  function clock(t: number) {
    const long = span.to - span.from > 12 * 3_600_000
    return new Date(t).toLocaleString('en-US', { ...(long ? { month: 'short', day: 'numeric' } : {}), hour: 'numeric', minute: '2-digit', hour12: false })
  }
  const hovered = hover === null
    ? null
    : {
        left: `${(x(hover) / W) * 100}%`,
        right: x(hover) > W * 0.6,
        time: clock(hover),
        values: lines.map((s, i) => ({ label: s.label, color: COLORS[i]!, value: s.points.find(p => p.t === hover)?.v })),
      }

  return (
    <figure data-ds="line-chart" className={cn(!bare && 'border border-edge bg-surface p-4')}>
      <figcaption className="mb-3 flex min-h-5 flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
        <span className="type-meta font-medium text-fg-muted">{title}</span>
        {lines.length > 1 && (
          <span className="flex flex-wrap gap-3 type-meta text-fg-muted">
            {paths.map(p => (
              <span key={p.label} className="inline-flex items-center gap-1">
                <svg width="16" height="4" aria-hidden="true"><line x1="0" y1="2" x2="16" y2="2" stroke={p.color} strokeWidth="2" strokeDasharray={p.dash} /></svg>
                {p.label}
              </span>
            ))}
          </span>
        )}
      </figcaption>
      {!lines.length
        ? <p className="type-ui text-fg-muted">No data in this range.</p>
        : (
            <div className="flex gap-2">
              <div className="relative h-40 w-14 shrink-0" aria-hidden="true">
                {[max, max / 2, 0].map((v, i) => <span key={i} className="type-meta text-fg-muted tabular-nums absolute right-0 -translate-y-1/2 whitespace-nowrap" style={{ top: `${i * 50}%` }}>{i === 2 ? '0' : format(v)}</span>)}
              </div>
              <div className="min-w-0 flex-1">
                <div
                  className="relative h-40 touch-none"
                  style={height ? { height: `${height}px` } : undefined}
                  role="img"
                  aria-label={`${title}: ${paths.map(p => `${p.label} last ${format(p.last.v)}`).join(', ')}`}
                  onPointerMove={move}
                  onPointerLeave={() => setHover(null)}
                >
                  <svg className="absolute inset-0 h-full w-full overflow-visible" viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="none">
                    {[0, H / 2, H].map(g => <line key={g} x1="0" y1={g} x2={W} y2={g} stroke="var(--ds-color-data-grid)" strokeWidth="1" vectorEffect="non-scaling-stroke" />)}
                    {paths.filter(q => q.area).map(p => <path key={`${p.label}-area`} d={p.area} fill={p.color} fillOpacity="0.06" />)}
                    {paths.map(p => <path key={p.label} d={p.d} fill="none" stroke={p.color} strokeWidth="2" strokeDasharray={p.dash} strokeLinejoin="round" strokeLinecap="round" vectorEffect="non-scaling-stroke" />)}
                  </svg>
                  {hovered && (
                    <>
                      <div className="pointer-events-none absolute inset-y-0 w-px bg-ds-neutral-500" style={{ left: hovered.left }} />
                      <div
                        className="pointer-events-none absolute top-0 z-10 border border-edge bg-surface px-3 py-2 type-meta"
                        style={hovered.right ? { right: `calc(100% - ${hovered.left} + 8px)` } : { left: `calc(${hovered.left} + 8px)` }}
                      >
                        <p className="mb-1 text-fg-muted tabular-nums">{hovered.time}</p>
                        {hovered.values.map(v => (
                          <p key={v.label} className="flex items-center gap-2 whitespace-nowrap tabular-nums">
                            <span className="inline-block h-0.5 w-3" style={{ background: v.color }} />
                            {lines.length > 1 && <span className="text-fg-muted">{v.label}</span>}
                            <span className="font-medium">{v.value === undefined ? '–' : format(v.value)}</span>
                          </p>
                        ))}
                      </div>
                    </>
                  )}
                </div>
                <div className="type-meta text-fg-muted tabular-nums mt-2 flex justify-between">
                  <span>{clock(span.from)}</span>
                  <span>{clock(span.to)}</span>
                </div>
              </div>
            </div>
          )}
    </figure>
  )
}

export default LineChart
