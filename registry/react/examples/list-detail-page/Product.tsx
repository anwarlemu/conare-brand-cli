'use client'
import { useState } from 'react'
import { Activity, House, KeyRound, Layers, Network, Settings, SquareTerminal } from 'lucide-react'
import { ConsoleFrame } from '@/react/components/product/ConsoleFrame'
import { ListDetailPage } from '@/react/components/product/ListDetailPage'
import type { ListRow } from '@/react/components/product/ListDetailPage'
// Namespaces in the console's frame, on sample data: filter the list, open a row, come back.
const groups = [
  { label: 'Platform', links: [{ label: "Overview", icon: House }, { label: "Namespaces", icon: Layers, active: true }, { label: "Sources", icon: Network }, { label: "Agents", icon: SquareTerminal }] },
  { label: 'Manage', links: [{ label: "API keys", icon: KeyRound }, { label: "Usage", icon: Activity }, { label: "Settings", icon: Settings }] },
]
const rows: ListRow[] = [
  {
    "name": "support",
    "documents": 48210,
    "created": "Mar 4, 2026",
    "searched": "2 min ago",
    "model": "acme-embed-1",
    "docs": [
      {
        "id": "help-center/reset-api-key.md",
        "updated": "Today",
        "size": "4 KB"
      },
      {
        "id": "help-center/billing-faq.md",
        "updated": "Yesterday",
        "size": "12 KB"
      },
      {
        "id": "tickets/2026-11-18.jsonl",
        "updated": "Yesterday",
        "size": "1.2 MB"
      },
      {
        "id": "policies/refunds.pdf",
        "updated": "Nov 2",
        "size": "220 KB"
      }
    ]
  },
  {
    "name": "contracts",
    "documents": 3120,
    "created": "Apr 18, 2026",
    "searched": "1 h ago",
    "model": "acme-embed-1",
    "docs": [
      {
        "id": "acme-reseller-msa.pdf",
        "updated": "Nov 14",
        "size": "640 KB"
      },
      {
        "id": "acme-reseller-amendment-2.pdf",
        "updated": "Oct 30",
        "size": "180 KB"
      }
    ]
  },
  {
    "name": "engineering",
    "documents": 127904,
    "created": "Jun 2, 2026",
    "searched": "Yesterday",
    "docs": []
  },
  {
    "name": "wiki",
    "documents": 9688,
    "created": "Aug 21, 2026",
    "searched": "3 days ago",
    "docs": [
      {
        "id": "handbook/security.md",
        "updated": "Oct 12",
        "size": "18 KB"
      }
    ]
  }
]
export default function Product() {
  const [open, setOpen] = useState('')
  return (
    <ConsoleFrame groups={groups} crumbs={[{ label: 'Overview', href: '#' }, { label: 'Namespaces' }]}>
      <ListDetailPage
        rows={rows}
        open={open}
        onOpenChange={setOpen}
      />
    </ConsoleFrame>
  )
}
