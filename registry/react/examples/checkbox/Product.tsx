'use client'
import { useState } from 'react'
import { Checkbox } from '@/react/components/ui/Checkbox'
// Which events a webhook sends: each a checkbox with a hint, and one over them all that shows a bar while some are on.

export default function Product() {
  const [events, setEvents] = useState({ synced: true, failed: true, deleted: false })
  const all = Object.values(events).every(Boolean)
  const some = !all && Object.values(events).some(Boolean)
  return (
    <fieldset className="flex flex-col">
      <legend className="mb-1 type-meta text-fg-soft">Send these events</legend>
      <Checkbox checked={all} onCheckedChange={on => setEvents({ synced: on, failed: on, deleted: on })} indeterminate={some} label="All events" />
      <div className="flex flex-col pl-6">
        <Checkbox checked={events.synced} onCheckedChange={on => setEvents({ ...events, synced: on })} label="Source synced" hint="When a sync finishes with new documents." />
        <Checkbox checked={events.failed} onCheckedChange={on => setEvents({ ...events, failed: on })} label="Source failed" hint="When a sync stops and needs you." />
        <Checkbox checked={events.deleted} onCheckedChange={on => setEvents({ ...events, deleted: on })} label="Document deleted" />
      </div>
      <Checkbox className="mt-2" label="Signed payloads (always on)" checked disabled />
    </fieldset>
  )
}
