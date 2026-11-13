import { BarChart } from '@/react/components/ui/BarChart'
import { ChartTrend } from '@/react/components/ui/ChartTrend'
import { type DayPoint, formatNumber, totalOf, weekChange } from '@/react/hooks/useChart'
// The usage page's cards: a meter's total for the month, the week's change and its bars per day, with the grid and
// the dates. Point at a bar to read it.
const days = Array.from({ length: 30 }, (_, i) => `2026-10-${String(i + 2).padStart(2, '0')}`)
const series = (peak: number, step: number): DayPoint[] => days.map((day, i) => ({ day, value: Math.round(peak * (0.16 + (((i * step) % 23) / 23) ** 2 * 0.84)) }))
const metrics = [
  { key: 'queries', label: 'Queries', points: series(15000, 7) },
  { key: 'documents', label: 'Documents written', points: series(13000, 11) },
]

export default function Usage() {
  return (
    <ul className="grid gap-4 md:grid-cols-2">
      {metrics.map(m => (
        <li key={m.key} className="flex flex-col gap-8 border border-edge bg-surface p-4">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="type-meta text-fg-muted">{m.label}</p>
              <p className="text-heading-4 font-medium tabular-nums">{formatNumber(totalOf(m.points))}</p>
            </div>
            {weekChange(m.points) !== null && <ChartTrend change={weekChange(m.points)!} />}
          </div>
          <BarChart points={m.points} label={`${m.label} per day`} height={120} bare />
        </li>
      ))}
    </ul>
  )
}
