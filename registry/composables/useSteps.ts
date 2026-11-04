import { ref } from 'vue'

/**
 * Steps that open one at a time (the console's useMoveSteps.ts). `reached` is the furthest step; one step shows at a
 * time, and any step reached opens again, so there is always a way back. state(n) is what Step takes: now (open),
 * done (reached and passed), todo (reached, folded) or next (not reached, locked).
 */
export type StepState = 'now' | 'done' | 'todo' | 'next'
export function useSteps(start = 1) {
  const reached = ref(start)
  const shown = ref(start)
  const state = (n: number): StepState => (n === shown.value ? 'now' : n < reached.value ? 'done' : n === reached.value ? 'todo' : 'next')
  function reach(n: number) {
    reached.value = Math.max(reached.value, n)
    shown.value = n
  }
  const toggle = (n: number) => { shown.value = shown.value === n ? 0 : n }
  /** Back to the first step, nothing reached. */
  function reset() {
    reached.value = start
    shown.value = start
  }
  return { reached, shown, state, reach, toggle, reset }
}
