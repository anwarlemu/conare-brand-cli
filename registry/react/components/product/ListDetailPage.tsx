'use client'
import { useMemo, useState, type KeyboardEvent } from 'react'
import { ArrowLeft, Search } from 'lucide-react'
import { ConsolePage } from '@/react/components/product/ConsolePage'
import { Button } from '@/react/components/ui/Button'
import { Card } from '@/react/components/ui/Card'
import { Facts } from '@/react/components/ui/Facts'
import { Input } from '@/react/components/ui/Input'
import { PixelButton } from '@/react/components/ui/PixelButton'
import { Table } from '@/react/components/ui/Table'
import { useControllable } from '@/react/hooks/useControllable'

// A list and the page of one thing in it (pages/dashboard/namespaces, index and [namespace]): the list's head has a
// filter and the one dark button; each row opens its thing (a press, or Enter on the focused row). The thing's page
// takes its name in mono as the title, a way back and its own dark button, its facts, then what it holds in a flush
// card. A filter with no match says so. It calls nothing: `open` is the open row's name ('' for the list, Vue's
// v-model:open), `onCreate` and `onSearch` are the dark buttons.
export type ListDoc = { id: string, updated: string, size: string }
export type ListRow = { name: string, documents: number, created: string, searched: string, model?: string, docs?: ListDoc[] }
export interface ListDetailPageProps {
  rows: ListRow[]
  title?: string
  noun?: string
  open?: string
  defaultOpen?: string
  onOpenChange?: (open: string) => void
  onCreate?: () => void
  onSearch?: (row: ListRow) => void
}
const count = (n: number) => n.toLocaleString('en-US')

export function ListDetailPage({ rows, title, noun, open: openValue, defaultOpen = '', onOpenChange, onCreate, onSearch }: ListDetailPageProps) {
  const [open, setOpen] = useControllable(openValue, defaultOpen, onOpenChange)
  const [filter, setFilter] = useState('')
  const shown = useMemo(() => {
    const q = filter.trim().toLowerCase()
    return q ? rows.filter(r => r.name.toLowerCase().includes(q)) : rows
  }, [rows, filter])
  const row = rows.find(r => r.name === open)
  const thing = noun ?? 'namespace'
  function onRowKey(event: KeyboardEvent, name: string) {
    if (event.key !== 'Enter' && event.key !== ' ') return
    event.preventDefault()
    setOpen(name)
  }

  if (row) {
    return (
      <ConsolePage
        data-ds="list-detail-page"
        title={row.name}
        mono
        actions={(
          <>
            <Button onClick={() => setOpen('')}><ArrowLeft size={12} strokeWidth={1.5} aria-hidden="true" />{`All ${thing}s`}</Button>
            <PixelButton onClick={() => onSearch?.(row)}><Search size={12} strokeWidth={1.5} aria-hidden="true" />Test a search</PixelButton>
          </>
        )}
      >
        <Facts facts={[{ name: 'Documents', value: count(row.documents) }, { name: 'Created', value: row.created }, { name: 'Last searched', value: row.searched }, ...(row.model ? [{ name: 'Model', value: row.model, mono: true }] : [])]} />
        <Card title="Documents" flush>
          <Table>
            <thead><tr><th>Document</th><th className="w-px text-right max-sm:hidden">Size</th><th className="w-px">Updated</th></tr></thead>
            <tbody>
              {!row.docs?.length && <tr><td colSpan={3} className="py-10 text-center text-fg-muted">No documents yet.</td></tr>}
              {row.docs?.map(d => (
                <tr key={d.id}>
                  <td className="max-w-0 truncate font-code" title={d.id}>{d.id}</td>
                  <td className="text-right whitespace-nowrap text-fg-muted tabular-nums max-sm:hidden">{d.size}</td>
                  <td className="whitespace-nowrap text-fg-muted">{d.updated}</td>
                </tr>
              ))}
            </tbody>
          </Table>
        </Card>
      </ConsolePage>
    )
  }

  return (
    <ConsolePage
      data-ds="list-detail-page"
      title={title ?? 'Namespaces'}
      actions={(
        <>
          <label className="w-64 max-sm:w-full"><Input value={filter} onChange={e => setFilter(e.target.value)} icon={Search} placeholder={`Filter ${thing}s`} aria-label={`filter ${thing}s`} /></label>
          <PixelButton className="shrink-0" onClick={() => onCreate?.()}>{`New ${thing}`}</PixelButton>
        </>
      )}
    >
      {!shown.length
        ? <p className="type-meta text-fg-muted">{`No ${thing} matches "${filter}".`}</p>
        : (
            <Table framed>
              <thead><tr><th>Name</th><th className="w-32 text-right">Documents</th><th className="w-36 max-md:hidden">Last searched</th><th className="w-32 max-sm:hidden">Created</th></tr></thead>
              <tbody>
                {shown.map(r => (
                  <tr key={r.name} className="is-link" tabIndex={0} onClick={() => setOpen(r.name)} onKeyDown={e => onRowKey(e, r.name)}>
                    <td className="max-w-0 truncate font-code">{r.name}</td>
                    <td className="text-right tabular-nums">{count(r.documents)}</td>
                    <td className="whitespace-nowrap text-fg-muted max-md:hidden">{r.searched}</td>
                    <td className="whitespace-nowrap text-fg-muted max-sm:hidden">{r.created}</td>
                  </tr>
                ))}
              </tbody>
            </Table>
          )}
    </ConsolePage>
  )
}

export default ListDetailPage
