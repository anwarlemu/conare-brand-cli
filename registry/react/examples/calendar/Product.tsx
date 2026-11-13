'use client'
import { useState } from 'react'
import { Calendar } from '@/react/components/ui/Calendar'
// Pick the day a usage report starts: the month around today, weekends closed, nothing after today.

const weekend = (d: Date) => d.getDay() === 0 || d.getDay() === 6

export default function Product() {
  const [day, setDay] = useState<Date | null>(null)
  const [today] = useState(() => new Date())
  return (
    <div className="flex flex-col items-center gap-3">
      <Calendar value={day} onValueChange={setDay} label="report start" max={today} disabled={weekend} />
      <p className="type-meta text-fg-muted" aria-live="polite">{day ? `Starts ${day.toLocaleDateString('en-US', { month: 'long', day: 'numeric' })}` : 'No day picked'}</p>
    </div>
  )
}
