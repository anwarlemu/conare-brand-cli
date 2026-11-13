'use client'
import { useEffect, useRef, useState } from 'react'
import { RefreshCw } from 'lucide-react'
import { Button } from '@/react/components/ui/Button'
// A tool in a row, as a source's Sync now: its icon turns while it syncs, and it waits until the sync lands.

export default function Ghost() {
  const [syncing, setSyncing] = useState(false)
  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined)
  useEffect(() => () => clearTimeout(timer.current), [])
  function sync() {
    setSyncing(true)
    // ds-latency: stands in for the sync request in this example.
    timer.current = setTimeout(() => setSyncing(false), 1800)
  }
  return (
    <Button variant="ghost" press disabled={syncing} onClick={sync}>
      <RefreshCw size={12} strokeWidth={1.5} className={syncing ? 'animate-spin motion-reduce:animate-none' : undefined} aria-hidden="true" />{syncing ? 'Syncing' : 'Sync now'}
    </Button>
  )
}
