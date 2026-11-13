'use client'
import { useState } from 'react'
import { Search } from 'lucide-react'
import { Field } from '@/react/components/ui/Field'
import { Input } from '@/react/components/ui/Input'
// A field with its label, one with a leading icon, and one that checks what is typed: focus turns the hairline ink,
// and an invalid value turns it red with its message.

export default function Product() {
  const [filter, setFilter] = useState('{ "team": ')
  const invalid = (() => { try { JSON.parse(filter); return false } catch { return true } })()
  return (
    <div className="grid items-start gap-2 md:grid-cols-[112px_minmax(0,1fr)] md:gap-x-6 md:gap-y-8">
      <p className="type-meta leading-7 text-fg-muted">With a label</p>
      <Field label="Name" className="max-w-90">
        {({ id }) => <Input id={id} placeholder="production-agent" />}
      </Field>
      <p className="mt-4 type-meta leading-7 text-fg-muted md:mt-0">With an icon</p>
      <div className="max-w-90"><Input icon={Search} placeholder="Filter namespaces" aria-label="filter namespaces" /></div>
      <p className="mt-4 type-meta leading-7 text-fg-muted md:mt-0">With a hint</p>
      <Field label="Filter" hint={invalid ? undefined : 'Matches documents whose metadata has these values.'} error={invalid ? 'Filter must be valid JSON.' : undefined} className="max-w-90">
        {({ id, hintId }) => <Input id={id} value={filter} onChange={e => setFilter(e.target.value)} className="type-code-sm" invalid={invalid} aria-describedby={hintId} />}
      </Field>
    </div>
  )
}
