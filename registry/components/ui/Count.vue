<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref, watch } from 'vue'

// The one counter (Count.vue): a number that counts to its new value when it changes (700ms, easing out), so a syncing
// source's documents visibly climb between polls. `rolls` also counts up from nothing as it lands, as the website's
// figures do; `once` does that only the first time this key shows in the browser tab's session. `format` reads it as an
// amount or a share; plain counts get thousands separators. Tabular figures, so the width holds. Reduced motion shows
// the new value at once.
const props = defineProps<{ value: number, rolls?: boolean, once?: string, format?: (n: number) => string }>()
const shown = ref(props.value)
let raf = 0
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

function roll(to: number) {
  cancelAnimationFrame(raf)
  if (still()) {
    shown.value = to
    return
  }
  const from = shown.value
  const start = performance.now()
  const tick = (now: number) => {
    const t = Math.min(1, (now - start) / ROLL_MS)
    shown.value = from + (to - from) * (1 - (1 - t) ** 3)
    if (t < 1) raf = requestAnimationFrame(tick)
  }
  raf = requestAnimationFrame(tick)
}
watch(() => props.value, roll)
onMounted(() => {
  if (still() || !(props.rolls || (props.once && firstTime(props.once)))) return
  shown.value = 0
  roll(props.value)
})
onBeforeUnmount(() => cancelAnimationFrame(raf))
</script>

<template>
  <span class="tabular-nums">{{ format ? format(shown) : plain(shown) }}</span>
</template>
