'use client'
import { useEffect, useRef, useState } from 'react'
import { FixButton, type FixState } from '@/react/components/product/FixButton'
// The fix for a failure, as a namespace's row has it, and in the failure's own red as Home's banner has it: hover runs
// its squares across; a press signs in, counts the changes as they come back, and ends on the check. Here each comes
// back to the start after a few seconds.
type Which = 'dark' | 'red'

export default function Product() {
  const [states, setStates] = useState<Record<Which, FixState>>({ dark: 'broken', red: 'broken' })
  const [counts, setCounts] = useState({ dark: 0, red: 0 })
  const timers = useRef<Array<ReturnType<typeof setTimeout>>>([])
  useEffect(() => () => timers.current.forEach(clearTimeout), [])
  const set = (which: Which, state: FixState, count?: number) => {
    setStates(s => ({ ...s, [which]: state }))
    if (count !== undefined) setCounts(c => ({ ...c, [which]: count }))
  }
  function press(which: Which) {
    set(which, 'signing')
    timers.current.push(setTimeout(() => set(which, 'catching', 1240), 1000))
    timers.current.push(setTimeout(() => set(which, 'done'), 2800))
    timers.current.push(setTimeout(() => set(which, 'broken', 0), 6000))
  }
  return (
    <div className="grid items-center gap-2 md:grid-cols-[112px_minmax(0,1fr)] md:gap-x-6 md:gap-y-8">
      <p className="type-meta leading-7 text-fg-muted">In a row</p>
      <div><FixButton state={states.dark} app="Acme CRM" count={counts.dark} onPress={() => press('dark')} /></div>
      <p className="mt-4 type-meta leading-7 text-fg-muted md:mt-0">Red, on a calm page</p>
      <div><FixButton state={states.red} app="Acme CRM" count={counts.red} tone="red" onPress={() => press('red')} /></div>
    </div>
  )
}
