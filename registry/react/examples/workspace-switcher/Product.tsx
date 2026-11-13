'use client'
import { useState } from 'react'
import { WorkspaceSwitcher, type WorkspaceGroup } from '@/react/components/product/WorkspaceSwitcher'
// The switcher at the top of the sidebar, with sample organizations. Its row has its four edges here, where no
// sidebar frames it. Picking one switches the sample; wire `onValueChange` to your own switch.
const groups: WorkspaceGroup[] = [
  { id: 'acme', name: 'Acme', role: 'admin', organizations: [{ id: 'prod', name: 'Acme production', default: true }, { id: 'staging', name: 'Acme staging' }] },
  { id: 'acme-labs', name: 'Acme labs', role: 'member', organizations: [{ id: 'research', name: 'Acme research' }] },
]

export default function Product() {
  const [current, setCurrent] = useState('prod')
  return (
    <div className="h-96">
      <div className="h-bar w-sidebar border border-edge bg-surface-subtle">
        <WorkspaceSwitcher value={current} onValueChange={setCurrent} groups={groups} admin mark={<img src="/conare-ds/logo/svg/mark.svg" alt="" height={20} className="h-5 w-auto shrink-0" />} />
      </div>
    </div>
  )
}
