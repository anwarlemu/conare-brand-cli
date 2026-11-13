'use client'
import { useCallback, useState } from 'react'

/**
 * Steps that open one at a time (the console's useMoveSteps.ts). `reached` is the furthest step; one step shows at a
 * time, and any step reached opens again, so there is always a way back. state(n) is what Step takes: now (open),
 * done (reached and passed), todo (reached, folded) or next (not reached, locked).
 */
export type StepState = 'now' | 'done' | 'todo' | 'next'
export function useSteps(start = 1) {
  const [reached, setReached] = useState(start)
  const [shown, setShown] = useState(start)
  const state = (n: number): StepState => (n === shown ? 'now' : n < reached ? 'done' : n === reached ? 'todo' : 'next')
  const reach = useCallback((n: number) => {
    setReached(r => Math.max(r, n))
    setShown(n)
  }, [])
  const toggle = useCallback((n: number) => setShown(s => (s === n ? 0 : n)), [])
  /** Back to the first step, nothing reached. */
  const reset = useCallback(() => {
    setReached(start)
    setShown(start)
  }, [start])
  return { reached, shown, state, reach, toggle, reset }
}
