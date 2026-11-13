'use client'
import { Fragment, useState } from 'react'
import { Activity, Atom, CreditCard, Gauge, House, KeyRound, Layers, Network, Settings, SquareTerminal } from 'lucide-react'
import { Sidebar } from '@/react/components/ui/Sidebar'
import { SidebarLabel } from '@/react/components/ui/SidebarLabel'
import { SidebarLink } from '@/react/components/ui/SidebarLink'
// The console's navigation: a label over each group, a row with its icon and count, a red edge on the page you are on,
// and the count turning red when something failed.
const groups = [
  { label: 'Platform', links: [{ label: 'Overview', icon: House }, { label: 'Namespaces', icon: Layers, status: '11' }, { label: 'Sources', icon: Network, status: '1 failed', alert: true }, { label: 'Agents', icon: SquareTerminal }, { label: 'Custom models', icon: Atom }] },
  { label: 'Manage', links: [{ label: 'API keys', icon: KeyRound, status: '4' }, { label: 'Performance', icon: Gauge }, { label: 'Usage', icon: Activity }, { label: 'Billing', icon: CreditCard }, { label: 'Settings', icon: Settings }] },
]

export default function Product() {
  const [picked, setPicked] = useState('Namespaces')
  return (
    <Sidebar label="console" className="border border-edge">
      {groups.map(group => (
        <Fragment key={group.label}>
          <SidebarLabel>{group.label}</SidebarLabel>
          {group.links.map((link: { label: string, icon: typeof House, status?: string, alert?: boolean }) => (
            <SidebarLink key={link.label} href="#" icon={link.icon} status={link.status} alert={link.alert} active={picked === link.label} onClick={(e) => { e.preventDefault(); setPicked(link.label) }}>{link.label}</SidebarLink>
          ))}
        </Fragment>
      ))}
    </Sidebar>
  )
}
