'use client'
import { useState } from 'react'
import { Check, ChevronsUpDown, Plus, Settings, Users } from 'lucide-react'
import { Menu } from '@/react/components/ui/Menu'
import { MenuItem } from '@/react/components/ui/MenuItem'
import { MenuLabel } from '@/react/components/ui/MenuLabel'
import { MenuSeparator } from '@/react/components/ui/MenuSeparator'
// The sidebar's organization switcher, open to show its rows: the organizations under their customer, the current one
// checked, then what goes with an organization. Sample data; wire `onSelect` to your own switch.
const organizations = [
  { id: 'prod', name: 'Acme production', default: true },
  { id: 'staging', name: 'Acme staging' },
  { id: 'research', name: 'Acme research' },
]

export default function Product() {
  const [current, setCurrent] = useState('prod')
  const org = organizations.find(o => o.id === current)!
  return (
    <div className="h-80 w-sidebar">
      <div className="h-bar">
        <Menu
          label="workspaces"
          offset="8px"
          defaultOpen
          className="!flex h-full w-full"
          triggerClass="relative isolate flex h-full w-full cursor-pointer items-center gap-2 px-3 text-left before:absolute before:inset-x-2 before:inset-y-1.5 before:-z-10 before:transition-colors before:duration-120 before:ease-standard hover:before:bg-edge/45 aria-expanded:before:bg-edge/45 focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-edge-focus"
          trigger={(
            <>
              <span className="inline-flex size-5 shrink-0 items-center justify-center border border-edge bg-surface text-caption leading-none font-medium" aria-hidden="true">{org.name.charAt(0)}</span>
              <span className="min-w-0 flex-1">
                <span className="block truncate text-meta leading-3 font-medium">{org.name}</span>
                <span className="mt-0.5 block truncate text-caption leading-3 text-fg-muted">Acme · admin</span>
              </span>
              <ChevronsUpDown size={14} strokeWidth={1.5} className="mr-0.75 shrink-0 text-fg-muted" aria-hidden="true" />
            </>
          )}
        >
          <MenuLabel><span className="truncate">Acme</span><span className="shrink-0 border border-edge px-1 text-caption leading-4">admin</span></MenuLabel>
          {organizations.map(o => (
            <MenuItem key={o.id} current={o.id === current} onSelect={() => setCurrent(o.id)}>
              <span className="inline-flex size-5 shrink-0 items-center justify-center border border-edge bg-surface text-caption leading-none font-medium" aria-hidden="true">{o.name.charAt(0)}</span>
              <span className="min-w-0 flex-1 truncate">{o.name}</span>
              {o.default && <span className="type-meta text-fg-muted">default</span>}
              {o.id === current && <Check size={14} strokeWidth={1.5} className="shrink-0" aria-label="current" />}
            </MenuItem>
          ))}
          <MenuSeparator />
          <MenuItem><Plus size={14} strokeWidth={1.5} className="shrink-0 text-fg-muted" aria-hidden="true" />New organization</MenuItem>
          <MenuItem><Settings size={14} strokeWidth={1.5} className="shrink-0 text-fg-muted" aria-hidden="true" />Organization settings</MenuItem>
          <MenuItem><Users size={14} strokeWidth={1.5} className="shrink-0 text-fg-muted" aria-hidden="true" />Invite members</MenuItem>
        </Menu>
      </div>
    </div>
  )
}
