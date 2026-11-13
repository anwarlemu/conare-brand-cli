'use client'
import { useEffect, useRef, useState } from 'react'
import { Check, RefreshCw } from 'lucide-react'
import { PixelButton } from '@/react/components/ui/PixelButton'
import { DotMatrix } from '@/react/components/ui/DotMatrix'
import { StatusTag } from '@/react/components/ui/StatusTag'
// The dot matrix where the product uses it: beside what is working, inside a source's dark status, and in the dark button
// while it syncs. Press Sync now to watch it go to Syncing, then Synced, and back.

export default function Product() {
  const [sync, setSync] = useState<'idle' | 'busy' | 'done'>('idle')
  const timers = useRef<Array<ReturnType<typeof setTimeout>>>([])
  useEffect(() => () => timers.current.forEach(clearTimeout), [])
  function press() {
    if (sync !== 'idle') return
    setSync('busy')
    // ds-latency: stands in for the sync request and its confirmation in this example.
    timers.current.push(setTimeout(() => setSync('done'), 2200))
    // ds-latency: the example returns to its start after showing Synced.
    timers.current.push(setTimeout(() => setSync('idle'), 4200))
  }
  // PixelButton passes aria-* to its button; its props name only aria-label.
  return (
    <div className="grid items-start gap-2 md:grid-cols-[112px_minmax(0,1fr)] md:gap-x-6 md:gap-y-8">
      <p className="type-meta leading-7 text-fg-muted">Beside what is working</p>
      <p className="flex items-center gap-2 type-meta text-fg-muted" aria-live="polite"><DotMatrix />Syncing HubSpot</p>
      <p className="mt-4 type-meta leading-7 text-fg-muted md:mt-0">In a status</p>
      <div className="flex flex-wrap items-center gap-2">
        <StatusTag status="syncing" />
        <StatusTag status="connecting" />
      </div>
      <p className="mt-4 type-meta leading-7 text-fg-muted md:mt-0">In a button</p>
      <div className="flex items-center">
        <PixelButton done={sync === 'done'} aria-busy={sync === 'busy'} onClick={press}>
          {sync === 'busy'
            ? <DotMatrix tone="inverse" />
            : sync === 'done'
              ? <Check size={12} strokeWidth={2} aria-hidden="true" />
              : <RefreshCw size={12} strokeWidth={1.5} aria-hidden="true" />}
          {sync === 'busy' ? 'Syncing' : sync === 'done' ? 'Synced' : 'Sync now'}
        </PixelButton>
      </div>
    </div>
  )
}
