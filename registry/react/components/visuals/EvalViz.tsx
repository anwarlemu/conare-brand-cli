import type { CSSProperties } from 'react'
import { VizWindow } from '@/react/components/visuals/VizWindow'

// One benchmark as a window (the website's EvalViz.vue): the benchmark and its metric in the title bar, what it
// measures, the model's score and rank, then the top of the leaderboard as bars that grow in rank order, the model's own
// row in red, and the benchmark's disclosure under them. Rows are ranked best first by the benchmark's direction, the
// model's row kept in (last) when it falls outside the top `limit`. `items`, `pick` and `runs` make it one window for
// several results: it keeps its place and crossfades what is in it, the picked body re-keyed by its run so its timeline
// plays again. `wide` lets it grow past 560px.
export interface EvalRow { name: string, value: number, ours?: boolean, rank?: number, note?: string }
export interface Eval {
  id: string
  name: string
  description: string
  metric: string
  better: 'higher' | 'lower'
  unit?: '%'
  model: string
  score: number
  rank: { n: number, of: number, word?: string }
  rows: EvalRow[]
  /** The value a full bar stands for. */
  max: number
  disclosure?: string
}

export interface EvalVizProps {
  item: Eval
  active: boolean
  limit?: number
  wide?: boolean
  items?: Eval[]
  pick?: number
  runs?: number[]
}

const formatScore = (e: Eval, value: number) => (e.unit === '%' ? `${value.toFixed(1)}%` : value.toFixed(1))
const rankLabel = (e: Eval) => `#${e.rank.n} of ${e.rank.of}${e.rank.word ? `, ${e.rank.word}` : ''}`
function topRows(e: Eval, limit: number) {
  const sorted = [...e.rows].sort((a, b) => (e.better === 'higher' ? b.value - a.value : a.value - b.value))
  if (!limit || sorted.length <= limit) return sorted
  const top = sorted.slice(0, limit)
  const ours = sorted.find(r => r.ours)
  return top.some(r => r.ours) || !ours ? top : [...top.slice(0, limit - 1), ours]
}

export function EvalViz({ item, active, limit = 6, wide = false, items, pick = 0, runs }: EvalVizProps) {
  const list = items ?? [item]
  // Each row with its entrance and its bar as styles.
  const rows = list.map(e => topRows(e, limit).map((row, i) => ({
    ...row,
    enter: { '--d': 700 + i * 110 } as CSSProperties,
    bar: { '--w': Math.min(1, row.value / e.max), '--d': 900 + i * 110 } as CSSProperties,
  })))
  return (
    <VizWindow
      data-ds="eval-viz"
      active={active}
      className={wide ? 'max-w-190' : 'max-w-140'}
      title={(
        <span className="grid min-w-0">
          {list.map((e, k) => (
            <span key={e.id} className="ds-viz-title flex min-w-0 items-center gap-2 [grid-area:1/1]" data-active={k === pick}>
              <span className="truncate text-ui leading-4">{e.name}</span>
              <span className="hidden shrink-0 bg-ds-neutral-200 px-1.5 py-0.5 text-caption text-ds-neutral-500 sm:inline">{e.metric}</span>
            </span>
          ))}
        </span>
      )}
    >
      <div className="grid grid-cols-[minmax(0,1fr)]">
        {list.map((e, k) => (
          <div key={e.id} className="ds-viz-body [grid-area:1/1]" data-active={k === pick} inert={k !== pick}>
            <div key={`${k}-${runs?.[k] ?? 0}`} className="ds-viz flex flex-col gap-4 px-4 pt-1 pb-4" data-active={active}>
              <p className="ds-viz-in text-meta leading-5 text-ds-neutral-500" style={{ '--d': 200 } as CSSProperties}>{e.description}</p>

              {/* The score and where it ranks; the rank line wraps under the score when the window is narrow. */}
              <div className="ds-viz-in flex flex-wrap items-end justify-between gap-x-4 gap-y-3" style={{ '--d': 400 } as CSSProperties}>
                <span className="shrink-0">
                  <span className="block text-caption whitespace-nowrap text-ds-neutral-500">{e.model}</span>
                  <span className="mt-1 block text-viz-score leading-none tracking-display tabular-nums">{formatScore(e, e.score)}</span>
                </span>
                <span className="flex min-w-0 flex-wrap items-center gap-2 text-meta text-ds-neutral-500">
                  <span className="ds-viz-chip text-off-white"><span className="ds-viz-dot bg-home-red" />{rankLabel(e)}</span>
                  {e.better === 'lower' && 'Lower is better'}
                </span>
              </div>

              {/* The leaderboard's top rows, bars from zero. */}
              <ol className="border border-ds-neutral-300">
                {rows[k]!.map((row, i) => (
                  <li key={row.name} className="ds-viz-in flex h-10 items-center gap-2 border-b border-ds-neutral-300 px-3 last:border-b-0 sm:gap-3" style={row.enter} title={row.note}>
                    <span className="w-4 shrink-0 text-right text-caption text-ds-neutral-500 tabular-nums">{row.rank ?? i + 1}</span>
                    {/* On a phone the name takes the room and the bar is short. */}
                    <span className={row.ours ? 'min-w-0 flex-1 truncate text-ui leading-4 sm:w-56 sm:flex-none text-off-white' : 'min-w-0 flex-1 truncate text-ui leading-4 sm:w-56 sm:flex-none text-ds-neutral-600'}>{row.name}</span>
                    <span className="h-1 w-12 shrink-0 bg-ds-neutral-300 sm:w-auto sm:min-w-0 sm:flex-1">
                      <span className={row.ours ? 'ds-viz-bar block h-full bg-home-red' : 'ds-viz-bar block h-full bg-ds-neutral-500'} style={row.bar} />
                    </span>
                    <span className={row.ours ? 'w-12 shrink-0 text-right text-meta tabular-nums text-off-white' : 'w-12 shrink-0 text-right text-meta tabular-nums text-ds-neutral-500'}>{formatScore(e, row.value)}</span>
                  </li>
                ))}
              </ol>

              {/* The benchmark's own caveat, losses included. */}
              {e.disclosure && (
                <p className="ds-viz-in flex gap-2 text-meta leading-5 text-ds-neutral-500" style={{ '--d': 1700 } as CSSProperties}>
                  <svg width="12" height="12" viewBox="0 0 12 12" aria-hidden="true" className="mt-1 shrink-0"><rect x="0.5" y="0.5" width="11" height="11" fill="none" stroke="currentColor" /><rect x="5.25" y="5" width="1.5" height="4" fill="currentColor" /><rect x="5.25" y="2.5" width="1.5" height="1.5" fill="currentColor" /></svg>
                  {e.disclosure}
                </p>
              )}
            </div>
          </div>
        ))}
      </div>
    </VizWindow>
  )
}

export default EvalViz
