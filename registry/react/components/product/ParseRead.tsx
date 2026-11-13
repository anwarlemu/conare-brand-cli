import type { CSSProperties, HTMLAttributes } from 'react'
import { cn } from '@/react/lib/cn'
import { isTotal, tableOf, type ParsePart } from '@/react/hooks/useParse'

// What Conare took from a page, as a person reads it (parse/Read.vue): the regions in reading order without the running
// head and foot, tables as tables. Each region takes focus, and pointing at or focusing one calls `onPoint`, so the page
// beside it lights the same region; a click pins it (`onPick`). `plays` lands them in order with the page's red line.
export interface ParseReadProps extends Omit<HTMLAttributes<HTMLDivElement>, 'onPointerEnter' | 'part'> {
  part: ParsePart
  on?: number | null
  plays?: boolean
  onPoint?: (order: number | null) => void
  onPick?: (order: number) => void
}

export function ParseRead({ part, on, plays, onPoint, onPick, className, ...rest }: ParseReadProps) {
  const body = part.blocks.filter(b => b.type !== 'header' && b.type !== 'footer')
  return (
    <>
      <style href="ds-parse-read" precedence="ds">{css}</style>
      <div data-ds="parse-read" className={cn('ds-parseread', className)} data-plays={plays || undefined} {...rest}>
        {body.map(b => (
          <div key={b.order} className="ds-parseread-block" data-type={b.type} data-on={on === b.order || undefined} style={{ '--o': b.order } as CSSProperties} tabIndex={0} onPointerEnter={() => onPoint?.(b.order)} onPointerLeave={() => onPoint?.(null)} onFocus={() => onPoint?.(b.order)} onBlur={() => onPoint?.(null)} onClick={() => onPick?.(b.order)}>
            {b.type === 'table'
              ? (
                  <table className="ds-parsetable" data-read>
                    <thead><tr>{tableOf(b.content).head.map((hd, i) => <th key={i} scope="col">{hd}</th>)}</tr></thead>
                    <tbody>
                      {tableOf(b.content).rows.map((r, k) => (
                        <tr key={k} data-total={isTotal(r[0] ?? '') || undefined}>
                          {r.map((cell, i) => <td key={i}>{cell}</td>)}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )
              : b.type === 'list'
                ? b.content.split('\n').map((l, i) => <p key={i}>{l}</p>)
                : <p>{b.content}</p>}
          </div>
        ))}
      </div>
    </>
  )
}

export default ParseRead

const css = `
.ds-parseread { display: flex; flex-direction: column; gap: var(--ds-space-2xs); font-size: var(--ds-text-ui); line-height: var(--ds-text-ui-leading); }
.ds-parseread-block { padding: 8px; border-left: 2px solid transparent; transition: background-color var(--ds-duration-micro) var(--ds-easing-standard), border-color var(--ds-duration-micro) var(--ds-easing-standard); }
.ds-parseread-block p { margin: 0; }
.ds-parseread-block[data-type="title"] { font-size: var(--ds-text-heading-4); font-weight: var(--ds-font-weight-medium); line-height: var(--ds-text-heading-4-leading); }
.ds-parseread-block:is([data-type="footnote"], [data-type="image"]) { font-size: var(--ds-text-meta); line-height: var(--ds-text-meta-leading); opacity: 0.7; }
.ds-parseread-block[data-on] { border-left-color: var(--ds-color-edge-accent); background: color-mix(in srgb, var(--ds-color-surface-accent) 12%, transparent); }
.ds-parseread-block:focus-visible { outline: var(--ds-border-focus) solid var(--ds-color-edge-accent); outline-offset: -2px; }
.ds-parsetable[data-read] { font-size: var(--ds-text-meta); line-height: var(--ds-text-meta-leading); }
@media (prefers-reduced-motion: no-preference) {
  .ds-parseread[data-plays] .ds-parseread-block { animation: ds-parse-land var(--ds-duration-land) var(--ds-easing-standard) both; animation-delay: calc(var(--o) * 90ms); }
}
@media (max-width: 767px) { .ds-parsetable[data-read] :is(th, td) + :is(th, td) { padding-left: 0.6em; } }
`
