'use client'
import { Fragment, useState } from 'react'
import { ChevronDown } from 'lucide-react'
import { StatusTag } from '@/react/components/ui/StatusTag'
import { Table } from '@/react/components/ui/Table'
import { cn } from '@/react/lib/cn'
// The namespaces table on sample data: press a row and it opens in place to where its documents come from; press it
// again, or another row, and it closes as the next one opens. Names in mono, numbers in tabular figures.
const rows = [
  { name: 'contracts', documents: 412830, source: 'Google Drive', status: 'ready', queried: '2 min ago' },
  { name: 'slack', documents: 96410, source: 'Slack', status: 'syncing', queried: '1 h ago' },
  { name: 'crm', documents: 52660, source: 'HubSpot', status: 'error', queried: 'yesterday' },
  { name: 'support', documents: 18204, source: 'API', status: 'ready', queried: '3 days ago' },
]

export default function Product() {
  const [opened, setOpened] = useState<string | null>(null)
  const toggle = (name: string) => setOpened(o => (o === name ? null : name))
  return (
    <Table framed label="namespaces">
      <thead>
        <tr><th>Namespace</th><th className="text-right">Documents</th><th>Health</th><th>Last query</th><th className="w-px"><span className="sr-only">Open</span></th></tr>
      </thead>
      <tbody>
        {rows.map(r => (
          <Fragment key={r.name}>
            <tr className="is-link" tabIndex={0} aria-expanded={opened === r.name} onClick={() => toggle(r.name)} onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); toggle(r.name) } }}>
              <td className="type-code-sm">{r.name}</td>
              <td className="text-right tabular-nums">{r.documents.toLocaleString('en-US')}</td>
              <td><StatusTag status={r.status} /></td>
              <td className="type-meta whitespace-nowrap text-fg-muted">{r.queried}</td>
              <td><ChevronDown size={14} strokeWidth={1.5} className={cn('text-fg-muted transition-[rotate] duration-160 ease-out motion-reduce:transition-none', opened === r.name && 'rotate-180')} aria-hidden="true" /></td>
            </tr>
            {opened === r.name && (
              <tr>
                <td colSpan={5} className="bg-surface-subtle">
                  <p className="type-meta text-fg-soft">{r.documents.toLocaleString('en-US')} documents from {r.source}. Searched {r.queried}.</p>
                </td>
              </tr>
            )}
          </Fragment>
        ))}
      </tbody>
    </Table>
  )
}
