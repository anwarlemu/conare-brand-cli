'use client'
import { useEffect, useRef, useState } from 'react'
import { FilterMenu, type FilterGroup, type FilterValues } from '@/react/components/product/FilterMenu'
// The menu, opened as the frame loads; pick a filter and the button counts it. Sample apps and types.
const groups: FilterGroup[] = [
  { key: 'app', label: 'App', options: ['Slack', 'Notion', 'Gmail', 'HubSpot'].map(a => ({ value: a, label: a })) },
  { key: 'type', label: 'Type', options: ['PDF', 'Word', 'Email', 'Message', 'Page', 'Code', 'Issue', 'Record', 'Transcript'].map(t => ({ value: t, label: t })) },
  { key: 'days', label: 'Date', options: [{ value: 7, label: 'Past week' }, { value: 30, label: 'Past month' }, { value: 365, label: 'Past year' }] },
]

export default function Product() {
  const [filters, setFilters] = useState<FilterValues>({ app: '', type: '', days: 0 })
  const root = useRef<HTMLDivElement | null>(null)
  useEffect(() => {
    const timer = setTimeout(() => root.current?.querySelector<HTMLButtonElement>('button')?.click(), 300)
    return () => clearTimeout(timer)
  }, [])
  return (
    <div ref={root} className="flex h-110 items-start gap-3">
      <FilterMenu value={filters} onValueChange={setFilters} groups={groups} />
    </div>
  )
}
