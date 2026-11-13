'use client'
import { useState, type CSSProperties, type ReactNode } from 'react'
import { ArrowDown, ArrowUp, ArrowUpDown } from 'lucide-react'
import { FilterChip } from '@/react/components/product/FilterChip'
import { ShowMore } from '@/react/components/ui/ShowMore'
import { Table } from '@/react/components/ui/Table'
import { cn } from '@/react/lib/cn'

// A table people narrow and order (Table with the search's filter chips and the credit history's foot): a filter-chip
// per filter over it, heads that sort (aria-sort; the arrow shows the order, a faint pair where it could), and the first
// `pageSize` rows with "Show N more" under them, each new row landing as the credit history's lines do. Filters and
// sort reset what is shown. Cells render the value (numbers right, in tabular figures, en-US), or `cell[key]` with
// { row, value } (Vue's `cell-<key>` slots). Nothing matching shows one line with a way to clear the filters (`empty`
// replaces it).
export type DataColumn = { key: string, label: string, align?: 'left' | 'right', sortable?: boolean, mono?: boolean, muted?: boolean }
export type DataFilter = { key: string, label: string, options: string[], any?: string }
export interface DataTableProps<Row extends Record<string, unknown>> {
  columns: DataColumn[]
  rows: Row[]
  rowKey: string
  label: string
  filters?: DataFilter[]
  pageSize?: number
  cell?: Partial<Record<string, (slot: { row: Row, value: unknown }) => ReactNode>>
  empty?: ReactNode
  className?: string
}

const display = (v: unknown) => (typeof v === 'number' ? v.toLocaleString('en-US') : String(v ?? ''))

export function DataTable<Row extends Record<string, unknown>>({ columns, rows, rowKey, label, filters = [], pageSize = 5, cell = {}, empty, className }: DataTableProps<Row>) {
  const [picked, setPicked] = useState<Record<string, string>>({})
  const [sort, setSort] = useState<{ key: string, dir: 'ascending' | 'descending' } | null>(null)
  const [shown, setShown] = useState(pageSize)
  const [fresh, setFresh] = useState<number | null>(null)

  const filtered = rows.filter(r => filters.every(f => !picked[f.key] || String(r[f.key]) === picked[f.key]))
  const sorted = (() => {
    if (!sort) return filtered
    const sign = sort.dir === 'ascending' ? 1 : -1
    return [...filtered].sort((a, b) => {
      const x = a[sort.key]
      const y = b[sort.key]
      return sign * (typeof x === 'number' && typeof y === 'number' ? x - y : String(x).localeCompare(String(y)))
    })
  })()
  const visible = sorted.slice(0, shown)
  const more = Math.min(pageSize, sorted.length - shown)
  const anyOn = Object.values(picked).some(Boolean)

  // Vue's watch on the filters and the sort: what is shown starts over.
  const restart = () => {
    setShown(pageSize)
    setFresh(null)
  }
  function pick(next: Record<string, string>) {
    setPicked(next)
    restart()
  }
  function toggleSort(key: string) {
    setSort(s => (s?.key !== key ? { key, dir: 'ascending' } : s.dir === 'ascending' ? { key, dir: 'descending' } : null))
    restart()
  }
  function showMore() {
    setFresh(shown)
    setShown(shown + pageSize)
  }

  return (
    <>
      <style href="ds-data-table" precedence="ds">{css}</style>
      <div data-ds="data-table" className={cn('ds-data-table flex min-w-0 flex-col gap-3', className)}>
        {filters.length > 0 && (
          <div className="flex flex-wrap items-center gap-2">
            {filters.map(f => (
              <FilterChip key={f.key} value={picked[f.key] ?? ''} onValueChange={(v: string) => pick({ ...picked, [f.key]: v })} label={f.label} options={f.options.map(o => ({ value: o, label: o }))} any={f.any ?? 'Any'} />
            ))}
            {anyOn && <button type="button" className="ds-more relative ml-1 cursor-pointer text-meta font-medium text-fg-soft" onClick={() => pick({})}>Clear filters</button>}
          </div>
        )}
        <Table framed label={label}>
          <thead>
            <tr>
              {columns.map(c => (
                <th key={c.key} className={c.align === 'right' ? 'text-right' : undefined} aria-sort={sort?.key === c.key ? sort.dir : c.sortable ? 'none' : undefined}>
                  {c.sortable
                    ? (
                        <button type="button" className={cn('ds-sort inline-flex cursor-pointer items-center gap-1', c.align === 'right' && 'flex-row-reverse')} onClick={() => toggleSort(c.key)}>
                          {c.label}
                          {sort?.key === c.key && sort.dir === 'ascending'
                            ? <ArrowUp size={12} strokeWidth={1.5} className="text-fg" aria-hidden="true" />
                            : sort?.key === c.key
                              ? <ArrowDown size={12} strokeWidth={1.5} className="text-fg" aria-hidden="true" />
                              : <ArrowUpDown size={12} strokeWidth={1.5} className="ds-sort-idle" aria-hidden="true" />}
                        </button>
                      )
                    : c.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {visible.map((r, i) => {
              const isNew = fresh !== null && i >= fresh
              return (
                <tr key={String(r[rowKey])} data-new={isNew ? '' : undefined} style={isNew ? { '--i': i - fresh! } as CSSProperties : undefined}>
                  {columns.map(c => (
                    <td key={c.key} className={cn([c.align === 'right' && 'text-right tabular-nums', c.mono && 'type-code-sm', c.muted && 'type-meta whitespace-nowrap text-fg-muted']) || undefined}>
                      {cell[c.key] ? cell[c.key]!({ row: r, value: r[c.key] }) : display(r[c.key])}
                    </td>
                  ))}
                </tr>
              )
            })}
            {!visible.length && (
              <tr>
                <td colSpan={columns.length} className="py-6 text-center type-meta text-fg-muted">
                  {empty ?? <>Nothing matches these filters. <button type="button" className="ds-more relative ml-1 cursor-pointer font-medium text-fg-soft" onClick={() => pick({})}>Clear filters</button></>}
                </td>
              </tr>
            )}
          </tbody>
        </Table>
        {sorted.length > pageSize && (
          <div className="flex items-center justify-between gap-3">
            {more > 0 && <ShowMore count={more} onClick={showMore} />}
            <span className="ml-auto type-meta text-fg-muted tabular-nums">{visible.length} of {sorted.length}</span>
          </div>
        )}
      </div>
    </>
  )
}

export default DataTable

const css = `
.ds-sort { margin: 0 -4px; padding: 0 var(--ds-space-xs); color: inherit; font: inherit; transition: color var(--ds-duration-micro) var(--ds-easing-standard); }
.ds-sort-idle { color: var(--ds-color-fg-faint); transition: color var(--ds-duration-micro) var(--ds-easing-standard); }
@media (hover: hover) and (pointer: fine) {
  .ds-sort:hover { color: var(--ds-color-fg); }
  .ds-sort:hover .ds-sort-idle { color: var(--ds-color-fg-muted); }
}
.ds-sort:focus-visible { outline: var(--ds-border-focus) solid var(--ds-color-edge-focus); outline-offset: 0; }
/* Five more: each new row lands on the one above, one after the other (.v2-ledger li[data-new]). */
.ds-data-table tr[data-new] { animation: ds-row-in var(--ds-duration-rise) var(--ds-easing-out) both; animation-delay: calc(var(--i) * 30ms); }
@keyframes ds-row-in { from { opacity: 0; transform: translateY(8px); } }
@media (prefers-reduced-motion: reduce) { .ds-data-table tr[data-new] { animation-name: ds-row-fade; } }
@keyframes ds-row-fade { from { opacity: 0; } }
`
