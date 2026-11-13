'use client'
import { useState } from 'react'
import { FilterChip } from '@/react/components/product/FilterChip'
// The search's filters, as they sit under the box: pick one and the chip names it.
const apps = ['Slack', 'Notion', 'Gmail', 'HubSpot']
const types = ['Message', 'Page', 'Email', 'File']

export default function Product() {
  const [app, setApp] = useState('')
  const [type, setType] = useState('')
  return (
    <div className="flex h-65 flex-wrap items-start gap-2">
      <FilterChip value={app} onValueChange={setApp} label="App" any="Any app" options={apps.map(a => ({ value: a, label: a }))} />
      <FilterChip value={type} onValueChange={setType} label="Type" any="Any type" options={types.map(t => ({ value: t, label: t }))} />
    </div>
  )
}
