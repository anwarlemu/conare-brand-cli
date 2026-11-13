import { FileText, Hash, Users } from 'lucide-react'
import { Item } from '@/react/components/ui/Item'
import { StatusTag } from '@/react/components/ui/StatusTag'
// Sources as getting started lists them (source-row): the app's mark and the source's name, its sync's state, then
// when it last synced and syncs next. Each row opens its source.
const sources = [
  { id: 'drive', name: 'Contracts drive', icon: FileText, status: 'ready', last: 'synced 2 min ago', next: 'next in 58 min' },
  { id: 'slack', name: 'Acme Slack', icon: Hash, status: 'syncing', last: 'synced 1 h ago', next: '' },
  { id: 'crm', name: 'Accounts', icon: Users, status: 'error', last: 'synced yesterday', next: '' },
]

export default function Sources() {
  return (
    <ul className="flex max-w-140 flex-col gap-3">
      {sources.map(s => (
        <li key={s.id} className="border border-edge px-4">
          <Item
            href={`#${s.id}`}
            title={s.name}
            description={[s.last, s.next].filter(Boolean).join(' · ')}
            arrow
            media={<span className="inline-flex size-5 shrink-0 items-center justify-center border border-edge bg-surface-subtle" aria-hidden="true"><s.icon size={12} strokeWidth={1.5} /></span>}
            meta={<StatusTag status={s.status} />}
          />
        </li>
      ))}
    </ul>
  )
}
