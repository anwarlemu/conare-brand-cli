import { ChevronsUpDown } from 'lucide-react'
import { Avatar } from '@/react/components/ui/Avatar'
// The organization tile in the switcher, the account's black square at the sidebar's foot, and the three sizes.
const orgs = ['Acme', 'Acme Labs', 'Globex']

export default function Product() {
  return (
    <div className="flex flex-col gap-6">
      <ul className="flex w-full max-w-60 flex-col border border-edge p-1">
        {orgs.map(o => <li key={o} className="flex h-8 items-center gap-2 px-2 type-ui"><Avatar name={o} />{o}</li>)}
      </ul>
      <div className="flex h-10 w-full max-w-60 items-center gap-2 border border-edge px-2 type-ui">
        <Avatar variant="solid" />
        <span className="min-w-0 flex-1 truncate">team@acme.com</span>
        <ChevronsUpDown size={14} strokeWidth={1.5} className="shrink-0 text-fg-muted" aria-hidden="true" />
      </div>
      <div className="flex items-center gap-3">
        <Avatar name="Acme" size={20} />
        <Avatar name="Acme" size={28} />
        <Avatar name="Acme" size={32} />
        <Avatar name="Acme" variant="solid" initial size={32} />
      </div>
    </div>
  )
}
