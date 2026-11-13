import { StatusTag } from '@/react/components/ui/StatusTag'
import { Tag } from '@/react/components/ui/Tag'
// A source's states, and the quiet tags beside them.

export default function Product() {
  return (
    <div className="grid items-start gap-2 md:grid-cols-[112px_minmax(0,1fr)] md:gap-x-6 md:gap-y-8">
      <p className="type-meta leading-7 text-fg-muted">A state</p>
      <div className="flex flex-wrap items-center gap-2">
        <StatusTag status="ready" />
        <StatusTag status="syncing" />
        <StatusTag status="connecting" />
        <StatusTag status="error" />
      </div>
      <p className="mt-4 type-meta leading-7 text-fg-muted md:mt-0">A note</p>
      <div className="flex flex-wrap items-center gap-2">
        <Tag tone="quiet">default</Tag>
        <Tag tone="quiet">invited</Tag>
      </div>
    </div>
  )
}
