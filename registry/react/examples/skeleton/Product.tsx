'use client'
import { useEffect, useRef, useState } from 'react'
import { Button } from '@/react/components/ui/Button'
import { Skeleton } from '@/react/components/ui/Skeleton'
import { Table } from '@/react/components/ui/Table'
// Held rows while the namespaces load: each is the real row from a blank record, so its rules stay and nothing moves
// when the answer lands. Reload holds them for a second and a half; the rules come in only after 300ms.
const BLANK = { name: 'namespace', documents: 0, queried: 'never' }
const rows = [
  { name: 'contracts', documents: 412830, queried: '2 min ago' },
  { name: 'slack', documents: 96410, queried: '1 h ago' },
  { name: 'crm', documents: 52660, queried: 'yesterday' },
]

export default function Product() {
  const [held, setHeld] = useState(true)
  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined)
  function load() {
    setHeld(true)
    clearTimeout(timer.current)
    timer.current = setTimeout(() => setHeld(false), 1500)
  }
  useEffect(() => {
    load()
    return () => clearTimeout(timer.current)
  }, [])
  return (
    <div className="flex flex-col items-start gap-4">
      <Table framed label="namespaces" className="w-full">
        <thead><tr><th>Namespace</th><th className="text-right">Documents</th><th>Last query</th></tr></thead>
        <tbody>
          {rows.map((r, i) => (
            <Skeleton key={i} as="tr" held={held}>
              <td className="type-code-sm">{held ? BLANK.name : r.name}</td>
              <td className="text-right tabular-nums">{(held ? BLANK : r).documents.toLocaleString('en-US')}</td>
              <td className="type-meta whitespace-nowrap text-fg-muted">{held ? BLANK.queried : r.queried}</td>
            </Skeleton>
          ))}
        </tbody>
      </Table>
      <Button disabled={held} onClick={load}>Reload</Button>
    </div>
  )
}
