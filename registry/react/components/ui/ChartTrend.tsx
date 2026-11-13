import { TrendArrow } from '@/react/components/ui/TrendArrow'

// The week's change on a usage card (usage/Trend.vue, take 1, the one picked): a second stat on the card's right, This
// week over the percent with the pixel triangle, red up and ink down. `change` is a share (0.12 is 12%).
export interface ChartTrendProps { change: number, label?: string }

export function ChartTrend({ change, label = 'This week' }: ChartTrendProps) {
  const down = change < 0
  const percent = `${Math.abs(Math.round(change * 100))}%`
  return (
    <div data-ds="chart-trend" className="shrink-0 text-right" title="The last 7 days against the 7 before">
      <p className="type-meta text-fg-muted">{label}</p>
      <p className="flex items-center justify-end gap-1.5 text-heading-4 font-medium tabular-nums"><TrendArrow down={down} bare /><span className="sr-only">{down ? 'down' : 'up'}</span>{percent}</p>
    </div>
  )
}

export default ChartTrend
