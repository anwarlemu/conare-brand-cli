// A benchmark as a card (EvalCard.vue, the evals page and a model's page): its name, our score and rank, the top
// rows as bars, ours in red and kept in (in the last place) when it falls outside them, and the way to its page. The
// paper comes in under the pointer. Every figure comes through props; `better` sorts the rows by its own direction.
export type EvalRow = { name: string, value: number, ours?: boolean, rank?: number }

export interface EvalCardProps {
  href: string
  name: string
  metric: string
  score: number
  rank: { n: number, of: number, word?: string }
  rows: EvalRow[]
  max: number
  better?: 'higher' | 'lower'
  unit?: '%'
  limit?: number
  linkLabel?: string
}

export function EvalCard({ href, name, metric, score, rank, rows, max, better = 'higher', unit, limit = 5, linkLabel = 'See the benchmark' }: EvalCardProps) {
  const format = (value: number) => (unit === '%' ? `${value.toFixed(1)}%` : value.toFixed(1))
  const rankLabel = `#${rank.n} of ${rank.of}${rank.word ? `, ${rank.word}` : ''}`
  const sorted = [...rows].sort((a, b) => (better === 'higher' ? b.value - a.value : a.value - b.value))
  let picked = sorted
  if (limit && sorted.length > limit) {
    picked = sorted.slice(0, limit)
    const ours = sorted.find(r => r.ours)
    if (ours && !picked.some(r => r.ours)) picked = [...picked.slice(0, limit - 1), ours]
  }
  const top = picked.map(r => ({ ...r, bar: { width: `${Math.min(100, (r.value / max) * 100)}%` } }))
  return (
    <>
      <style href="ds-eval-card" precedence="ds">{css}</style>
      <a data-ds="eval-card" href={href} className="ds-eval-card flex w-full flex-col bg-surface px-5 py-6 sm:px-6">
        <span className="type-heading-3 text-fg">{name}</span>
        <span className="mt-3 text-heading-1 leading-none tracking-display text-fg tabular-nums">{format(score)}</span>
        <span className="mt-2 type-ui text-fg-muted">{metric}{better === 'lower' && ', lower is better'}{` · ${rankLabel}`}</span>
        <ol className="mt-6 flex flex-col gap-3">
          {top.map((r, i) => (
            <li key={r.name} className="grid grid-cols-[16px_minmax(0,1fr)_auto] items-center gap-x-2 gap-y-1.5 text-ui leading-4">
              <span className="text-caption text-fg-faint tabular-nums">{r.rank ?? i + 1}</span>
              <span className={r.ours ? 'truncate text-fg' : 'truncate text-fg-muted'}>{r.name}</span>
              <span className={r.ours ? 'tabular-nums text-fg' : 'tabular-nums text-fg-muted'}>{format(r.value)}</span>
              <span className="col-start-2 col-end-4 h-1 bg-edge">
                <span className={r.ours ? 'block h-full bg-home-red' : 'block h-full bg-ds-neutral-500'} style={r.bar} />
              </span>
            </li>
          ))}
        </ol>
        <span className="mt-auto flex items-center gap-1.5 pt-8 type-ui text-fg-faint">
          {linkLabel}
          <svg width="10" height="10" viewBox="0 0 10 10" fill="none" stroke="currentColor" strokeWidth="1.2" aria-hidden="true"><path d="M1.5 5h7M5.5 2l3 3-3 3" /></svg>
        </span>
      </a>
    </>
  )
}

export default EvalCard

const css = `
.ds-eval-card { transition: background-color var(--ds-duration-micro) var(--ds-easing-standard); }
@media (hover: hover) and (pointer: fine) { .ds-eval-card:hover { background: var(--ds-color-surface-subtle); } }
`
