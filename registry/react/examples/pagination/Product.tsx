'use client'
import { useState } from 'react'
import { Pagination } from '@/react/components/ui/Pagination'
import { ShowMore } from '@/react/components/ui/ShowMore'
import { Table } from '@/react/components/ui/Table'
// The audit log by page, where a page is a place to come back to; and credits added, read from the top, five more at
// a time.
const events = Array.from({ length: 23 }, (_, i) => ({ id: i, what: ['Key created', 'Member invited', 'Namespace deleted', 'Key revoked'][i % 4]!, who: 'member' + ((i % 3) + 1) + '@acme.dev', when: `Oct ${28 - i}` }))
const PER = 5
const pages = Math.ceil(events.length / PER)
const grants = Array.from({ length: 12 }, (_, i) => ({ id: i, amount: (12 - i) * 50, when: `${['Oct', 'Sep', 'Aug', 'Jul'][i % 4]} ${1 + i}` }))

export default function Product() {
  const [page, setPage] = useState(1)
  const [shown, setShown] = useState(5)
  const onPage = events.slice((page - 1) * PER, page * PER)
  return (
    <div className="grid gap-8 md:grid-cols-2">
      <div className="flex flex-col gap-3">
        <Table framed label="audit log">
          <thead><tr><th>Event</th><th>By</th><th className="text-right">When</th></tr></thead>
          <tbody>{onPage.map(e => <tr key={e.id}><td>{e.what}</td><td className="type-code-sm">{e.who}</td><td className="text-right type-meta text-fg-muted">{e.when}</td></tr>)}</tbody>
        </Table>
        <Pagination page={page} onPageChange={setPage} pages={pages} label="audit log pages" className="self-end" />
      </div>
      <div className="flex flex-col gap-3">
        <ul className="flex flex-col border border-edge">
          {grants.slice(0, shown).map(g => <li key={g.id} className="flex justify-between border-b border-edge px-3 py-2.5 last:border-b-0 type-ui"><span className="text-fg-muted">{g.when}</span><span className="tabular-nums">{`+$${g.amount.toFixed(2)}`}</span></li>)}
        </ul>
        {shown < grants.length && <ShowMore className="self-start" count={Math.min(5, grants.length - shown)} onClick={() => setShown(s => s + 5)} />}
      </div>
    </div>
  )
}
