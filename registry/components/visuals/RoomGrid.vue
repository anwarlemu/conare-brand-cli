<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'

// The hero's frame drawn as a room in one-point perspective (RoomGrid.vue): the frame its picture plane, the vanishing
// point its centre, the same point Burst's slabs recede to. Orthogonals run from evenly spaced points on every edge to
// the back wall; transversals are the frame scaled about the centre, an equal step deeper each time, so the rings close
// up as floor tiles do. Each wall tile lights a shade above the red under the pointer, and a few light on their own,
// trading places every 600ms while the frame is on screen and the tab visible (never for reduced motion). Lay it in a
// `relative` red frame; the svg is click-through, only the tiles take the pointer.
const ACROSS = 12
const DOWN = 6
const DEPTH = 0.18
const INNER = 0.4

const orthogonals = computed(() => {
  let d = ''
  for (let i = 0; i <= ACROSS; i++) {
    const x = -1 + (2 * i) / ACROSS
    d += `M${x} -1L${x * INNER} ${-INNER}M${x} 1L${x * INNER} ${INNER}`
  }
  for (let j = 1; j < DOWN; j++) {
    const y = -1 + (2 * j) / DOWN
    d += `M-1 ${y}L${-INNER} ${y * INNER}M1 ${y}L${INNER} ${y * INNER}`
  }
  return d
})

const rings = computed(() => {
  const out: number[] = []
  for (let k = 1; ; k++) {
    const s = 1 / (1 + k * DEPTH)
    if (s < INNER) break
    out.push(Math.round(s * 1e4) / 1e4)
  }
  out.push(INNER)
  return out
})

// Each cell of the four walls, between two neighbouring orthogonals and two neighbouring rings, as its own quad.
const tiles = computed(() => {
  const depths = [1, ...rings.value]
  const xs = Array.from({ length: ACROSS + 1 }, (_, i) => -1 + (2 * i) / ACROSS)
  const ys = Array.from({ length: DOWN + 1 }, (_, j) => -1 + (2 * j) / DOWN)
  type P = [number, number]
  const out: { pts: string, k: number }[] = []
  const r = (n: number) => Math.round(n * 1e4) / 1e4
  const add = (q: P[], k: number) => out.push({ pts: q.map(p => `${r(p[0])},${r(p[1])}`).join(' '), k })
  for (let k = 0; k < depths.length - 1; k++) {
    const a = depths[k]!
    const b = depths[k + 1]!
    for (let i = 0; i < ACROSS; i++) {
      for (const y of [-1, 1]) add([[xs[i]! * a, y * a], [xs[i + 1]! * a, y * a], [xs[i + 1]! * b, y * b], [xs[i]! * b, y * b]], k)
    }
    for (let j = 0; j < DOWN; j++) {
      for (const x of [-1, 1]) add([[x * a, ys[j]! * a], [x * a, ys[j + 1]! * a], [x * b, ys[j + 1]! * b], [x * b, ys[j]! * b]], k)
    }
  }
  return out
})

// A few tiles lit at random from the outer rings (the slabs cover the deeper ones), one swapped every SWAP_MS.
const LIT = 6
const SWAP_MS = 600
const OUTER = 4
const lit = ref<number[]>([])
const litSet = computed(() => new Set(lit.value))
const root = ref<SVGSVGElement | null>(null)
let timer: number | undefined
let io: IntersectionObserver | undefined

function pickTile() {
  const pool = tiles.value.flatMap((t, i) => (t.k < OUTER && !lit.value.includes(i) ? [i] : []))
  return pool[Math.floor(Math.random() * pool.length)]!
}
function swap() {
  const next = [...lit.value]
  next.splice(Math.floor(Math.random() * next.length), 1, pickTile())
  lit.value = next
}
function play(on: boolean) {
  window.clearInterval(timer)
  if (on && !document.hidden) timer = window.setInterval(swap, SWAP_MS)
}
let visible = false
const onVisibility = () => play(visible)

onMounted(() => {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
  for (let n = 0; n < LIT; n++) lit.value = [...lit.value, pickTile()]
  io = new IntersectionObserver(([e]) => {
    visible = !!e?.isIntersecting
    play(visible)
  })
  if (root.value) io.observe(root.value)
  document.addEventListener('visibilitychange', onVisibility)
})
onBeforeUnmount(() => {
  window.clearInterval(timer)
  io?.disconnect()
  document.removeEventListener('visibilitychange', onVisibility)
})
</script>

<template>
  <svg data-ds="room-grid" ref="root" class="pointer-events-none absolute inset-0 h-full w-full" viewBox="-1 -1 2 2" preserveAspectRatio="none" aria-hidden="true">
    <g class="ds-room-tiles" pointer-events="fill">
      <polygon v-for="(t, i) in tiles" :key="t.pts" :points="t.pts" :data-lit="litSet.has(i) || undefined" />
    </g>
    <g fill="none" stroke="var(--ds-color-off-white)" stroke-width="0.5" stroke-opacity="0.35" vector-effect="non-scaling-stroke">
      <path :d="orthogonals" vector-effect="non-scaling-stroke" />
      <rect v-for="s in rings" :key="s" :x="-s" :y="-s" :width="2 * s" :height="2 * s" vector-effect="non-scaling-stroke" />
    </g>
  </svg>
</template>

<style>
/* A tile fades out slowly, lights a little quicker on its own, and at once under the pointer (home.css .room-tiles). */
.ds-room-tiles > polygon { fill: var(--ds-color-off-white); fill-opacity: 0; transition: fill-opacity var(--ds-duration-tile-fade) ease; }
.ds-room-tiles > polygon[data-lit="true"] { fill-opacity: 0.16; transition-duration: var(--ds-duration-tile-lit); }
@media (hover: hover) and (pointer: fine) {
  .ds-room-tiles > polygon:hover { fill-opacity: 0.22; transition-duration: var(--ds-duration-cell); }
}
@media (prefers-reduced-motion: reduce) { .ds-room-tiles > polygon { transition: none; } }
</style>
