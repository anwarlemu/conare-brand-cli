import { DocsInline } from '@/react/components/site/DocsInline'
import { cn } from '@/react/lib/cn'

// A docs table (docs/Table.vue): ruled rows under a paper head, or none for a key-value table, whose first column is
// set in ink. Cells take DocsInline. It scrolls sideways in its own frame on a phone.
export interface DocsTableProps {
  head?: string[]
  rows: string[][]
  label?: string
  className?: string
}

export function DocsTable({ head, rows, label, className }: DocsTableProps) {
  return (
    <>
      <style href="ds-docs-table" precedence="ds">{css}</style>
      <div data-ds="docs-table" className={cn('ds-docs-table overflow-x-auto border border-edge', className)} role="region" aria-label={label ?? head?.join(', ') ?? 'table'} tabIndex={0}>
        <table className="w-full text-left type-body">
          {head && (
            <thead className="bg-surface-subtle text-fg-muted">
              <tr>{head.map(h => <th key={h} className="px-4 py-3 text-meta font-normal whitespace-nowrap">{h}</th>)}</tr>
            </thead>
          )}
          <tbody>
            {rows.map(row => (
              <tr key={row[0]}>
                {row.map((cell, c) => <td key={c} className={cn('px-4 py-3 align-top', c === 0 ? 'min-w-35 text-fg' : 'text-fg-muted')}><DocsInline text={cell} /></td>)}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  )
}

export default DocsTable

const css = `
.ds-docs-table tr + tr, .ds-docs-table thead + tbody tr:first-child { border-top: var(--ds-border-hairline) solid var(--ds-color-edge); }
`
