'use client'
import { useEffect, useRef, useState } from 'react'

// The one counter (Count.vue): a number that counts to its new value when it changes (700ms, easing out), so a syncing
// source's documents visibly climb between polls. `rolls` also counts up from nothing as it lands, as the website's
// figures do; `once` does that only the first time this key shows in the browser tab's session. `format` reads it as an
// amount or a share; plain counts get thousands separators. Tabular figures, so the width holds. Reduced motion shows
// the new value at once.
export interface CountProps {
  value: number
  rolls?: boolean
  once?: string
  format?: (n: number) => string
}

const ROLL_MS = 700
const still = () => !globalThis.matchMedia || globalThis.matchMedia('(prefers-reduced-motion: reduce)').matches
const plain = (n: number) => Math.round(n).toLocaleString('en-US')

// True the first time a key is seen in this tab's session; storage blocked keeps the entrance.
function firstTime(key: string) {
  try {
    const name = `ds-seen:${key}`
    if (sessionStorage.getItem(name)) return false
    sessionStorage.setItem(name, '1')
  }
  catch { /* storage blocked */ }
  return true
}

export function Count({ value, rolls, once, format }: CountProps) {
  const [shown, setShown] = useState(value)
  const current = useRef(value)
  const raf = useRef(0)
  const mounted = useRef(false)

  function roll(to: number) {
    cancelAnimationFrame(raf.current)
    const show = (n: number) => {
      current.current = n
      setShown(n)
    }
    if (still()) return show(to)
    const from = current.current
    const start = performance.now()
    const tick = (now: number) => {
      const t = Math.min(1, (now - start) / ROLL_MS)
      show(from + (to - from) * (1 - (1 - t) ** 3))
      if (t < 1) raf.current = requestAnimationFrame(tick)
    }
    raf.current = requestAnimationFrame(tick)
  }

  // A new value counts to it (Vue's watch: not on the first render).
  useEffect(() => {
    if (!mounted.current) return
    roll(value)
  }, [value]) // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    mounted.current = true
    if (!still() && (rolls || (once && firstTime(once)))) {
      current.current = 0
      setShown(0)
      roll(value)
    }
    return () => cancelAnimationFrame(raf.current)
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  return <span data-ds="count" className="tabular-nums">{format ? format(shown) : plain(shown)}</span>
}

export default Count
