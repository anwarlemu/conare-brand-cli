'use client'
import { useState } from 'react'
import { Stat } from '@/react/components/ui/Stat'
import { Stats } from '@/react/components/ui/Stats'
// The queries card's stats; press one to pin it.
const stats = [
  { id: 'month', label: 'This month', value: '186,402' },
  { id: 'today', label: 'Today', value: '7,912' },
  { id: 'latency', label: 'Search p50, 24 h', value: '238 ms' },
]

export default function Product() {
  const [pinned, setPinned] = useState('month')
  return (
    <div className="max-w-160 border border-edge bg-surface">
      <Stats>
        {stats.map(s => <Stat key={s.id} label={s.label} value={s.value} pressed={pinned === s.id} onPress={() => setPinned(s.id)} />)}
      </Stats>
    </div>
  )
}
