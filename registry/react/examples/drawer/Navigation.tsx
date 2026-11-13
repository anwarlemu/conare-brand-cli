'use client'
import { Fragment, useState } from 'react'
import { Activity, House, KeyRound, Layers, Menu as MenuIcon, Network, Settings } from 'lucide-react'
import { Button } from '@/react/components/ui/Button'
import { Drawer } from '@/react/components/ui/Drawer'
import { SidebarLabel } from '@/react/components/ui/SidebarLabel'
import { SidebarLink } from '@/react/components/ui/SidebarLink'
// The console's navigation on a phone: the bar's menu button slides the sidebar in from the left over the dimmed page.
// Pick a page, tap the page or press Escape to close it.

const groups = [
  { label: 'Platform', links: [{ label: 'Overview', icon: House }, { label: 'Namespaces', icon: Layers, status: '11' }, { label: 'Sources', icon: Network, status: '1 failed', alert: true }] },
  { label: 'Manage', links: [{ label: 'API keys', icon: KeyRound, status: '4' }, { label: 'Usage', icon: Activity }, { label: 'Settings', icon: Settings }] },
]

export default function Navigation() {
  const [open, setOpen] = useState(false)
  const [picked, setPicked] = useState('Namespaces')
  function go(label: string) {
    setPicked(label)
    setOpen(false)
  }
  return (
    <div className="flex min-h-40 items-center justify-center">
      <Button icon aria-label="open menu" aria-expanded={open} onClick={() => setOpen(true)}><MenuIcon size={14} strokeWidth={1.5} /></Button>
      <Drawer open={open} onOpenChange={setOpen} title="console">
        <nav className="flex flex-col pb-4" aria-label="console">
          {groups.map(group => (
            <Fragment key={group.label}>
              <SidebarLabel>{group.label}</SidebarLabel>
              {group.links.map(link => (
                <SidebarLink key={link.label} href="#" icon={link.icon} status={link.status} alert={link.alert} active={picked === link.label} onClick={(e) => { e.preventDefault(); go(link.label) }}>{link.label}</SidebarLink>
              ))}
            </Fragment>
          ))}
        </nav>
      </Drawer>
    </div>
  )
}
