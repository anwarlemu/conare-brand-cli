'use client'
import { useState } from 'react'
import { Field } from '@/react/components/ui/Field'
import { NativeSelect } from '@/react/components/ui/NativeSelect'
// A member's role, a namespace in mono, and the small size in a row of filters.

export default function Product() {
  const [role, setRole] = useState('member')
  const [ns, setNs] = useState('contracts')
  const [range, setRange] = useState('7d')
  return (
    <div className="flex w-90 max-w-full flex-col gap-4">
      <Field label="Role">
        {({ id }) => <NativeSelect id={id} value={role} onChange={e => setRole(e.target.value)}><option value="admin">Admin</option><option value="member">Member</option><option value="viewer">Viewer</option></NativeSelect>}
      </Field>
      <Field label="Namespace">
        {({ id }) => <NativeSelect id={id} value={ns} onChange={e => setNs(e.target.value)} mono><option>contracts</option><option>slack</option><option>sec-filings</option></NativeSelect>}
      </Field>
      <div className="flex items-center gap-2">
        <span className="type-meta text-fg-muted">Range</span>
        <NativeSelect value={range} onChange={e => setRange(e.target.value)} small aria-label="range"><option value="24h">Last 24 hours</option><option value="7d">Last 7 days</option><option value="30d">Last 30 days</option></NativeSelect>
      </div>
    </div>
  )
}
