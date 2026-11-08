<script setup lang="ts">
import { computed, ref } from 'vue'
import { cellPaths, rng, useNearView } from '@/composables/useCellBurst'

// The website's "endless data cells" (CellBurst.vue): the panel is a sheet of cells, and some cells on its border are
// redrawn smaller and smaller down to a vanishing point, each becoming a wedge of hairlines. The wedges are
// translucent, so where they overlap toward the centre they build up lighter. Each seed picks its own cells.
// `jumble` scatters it (a finer sheet, the vanishing point off centre, wedges from anywhere); `ledger` makes it a
// spreadsheet's (few columns, many thin rows, cells running in from the right); `strong` raises every layer for a red
// ground; `trace` sets the grid's own lines wiping away and drawing back in, each at its own pace. Drawn in a -1..1
// box stretched to the panel, so it fills it at any size. Put it in a `relative` panel; it is decorative.
const props = withDefaults(defineProps<{ seed: number, jumble?: boolean, ledger?: boolean, strong?: boolean, trace?: boolean }>(), { jumble: false, ledger: false, strong: false, trace: false })

const root = ref<SVGSVGElement | null>(null)
const near = useNearView(root)
const o = computed(() => (props.strong ? { grid: 0.3, cross: 0.5, hull: 0.14, lines: 0.42 } : { grid: 0.18, cross: 0.3, hull: 0.07, lines: 0.16 }))

const COLS = computed(() => (props.ledger ? 5 : props.jumble ? 10 : 6))
const ROWS = computed(() => (props.ledger ? 16 : 6))
// Hatch pitch in box units (about 3px), how near the centre the copies run, and how many cells light.
const PITCH = 0.012
const INNER = 0.04
const WEDGES = 12

type P = [number, number]

/** The convex hull of a cell's corners and the centre: the wedge its copies sweep out on their way in. */
function hull(points: P[]) {
  const pts = [...points].sort((a, b) => a[0] - b[0] || a[1] - b[1])
  const cross = (q: P, a: P, b: P) => (a[0] - q[0]) * (b[1] - q[1]) - (a[1] - q[1]) * (b[0] - q[0])
  const half = (list: P[]) => {
    const out: P[] = []
    for (const p of list) {
      while (out.length >= 2 && cross(out[out.length - 2]!, out[out.length - 1]!, p) <= 0) out.pop()
      out.push(p)
    }
    out.pop()
    return out
  }
  return [...half(pts), ...half([...pts].reverse())].map(p => p.join(',')).join(' ')
}

const grid = computed(() => {
  let d = ''
  for (let i = 1; i < COLS.value; i++) d += `M${-1 + (2 * i) / COLS.value} -1V1`
  for (let j = 1; j < ROWS.value; j++) d += `M-1 ${-1 + (2 * j) / ROWS.value}H1`
  return d
})

// The vanishing point: the centre; with `jumble` somewhere in the middle half; with `ledger` near the left edge.
const vp = computed<P>(() => {
  const rand = rng(props.seed * 7 + 3)
  if (props.ledger) return [-0.84, (rand() - 0.5) * 0.6]
  if (!props.jumble) return [0, 0]
  return [rand() - 0.5, rand() - 0.5]
})

const wedges = computed(() => {
  const cols = COLS.value
  const rows = ROWS.value
  const w = 2 / cols
  const h = 2 / rows
  const [vx, vy] = vp.value
  const pool: P[] = []
  for (let i = 0; i < cols; i++) {
    for (let j = 0; j < rows; j++) {
      if (props.ledger ? i >= cols - 2 : props.jumble || i === 0 || j === 0 || i === cols - 1 || j === rows - 1) pool.push([i, j])
    }
  }
  const rand = rng(props.seed)
  for (let n = pool.length - 1; n > 0; n--) {
    const m = Math.floor(rand() * (n + 1))
    ;[pool[n], pool[m]] = [pool[m]!, pool[n]!]
  }
  return pool.slice(0, WEDGES).map(([i, j]) => {
    const x0 = -1 + i * w
    const y0 = -1 + j * h
    return { hull: hull([[x0, y0], [x0 + w, y0], [x0 + w, y0 + h], [x0, y0 + h], [vx, vy]]), lines: cellPaths(x0 - vx, y0 - vy, w, h, PITCH, INNER).lines }
  })
})

// With `trace`, the grid's lines and the cross through the vanishing point are drawn one by one in screen
// percentages (no viewBox), so the stroke stays a hairline and the wipe runs in pixels.
const traces = computed(() => {
  if (!props.trace) return []
  const rand = rng(props.seed * 13 + 1)
  const [vx, vy] = vp.value
  const out: { d: Record<'x1' | 'y1' | 'x2' | 'y2', string>, opacity: number, style: Record<'--dur' | '--delay', string> }[] = []
  const pct = (v: number) => `${((v + 1) * 50).toFixed(2)}%`
  const line = (x: number | null, y: number | null, opacity: number) => {
    const [a, b] = rand() < 0.5 ? ['100%', '0%'] : ['0%', '100%']
    const d = x !== null ? { x1: pct(x), y1: a, x2: pct(x), y2: b } : { x1: a, y1: pct(y!), x2: b, y2: pct(y!) }
    const dur = 6 + rand() * 8
    out.push({ d, opacity, style: { '--dur': `${dur.toFixed(2)}s`, '--delay': `${(-rand() * dur).toFixed(2)}s` } })
  }
  for (let i = 1; i < COLS.value; i++) line(-1 + (2 * i) / COLS.value, null, o.value.grid)
  for (let j = 1; j < ROWS.value; j++) line(null, -1 + (2 * j) / ROWS.value, o.value.grid)
  line(vx, null, o.value.cross)
  line(null, vy, o.value.cross)
  return out
})
</script>

<template>
  <svg data-ds="cell-burst" ref="root" class="pointer-events-none absolute inset-0 h-full w-full" viewBox="-1 -1 2 2" preserveAspectRatio="none" aria-hidden="true">
    <g v-if="!traces.length" fill="none" stroke="var(--ds-color-off-white)" stroke-width="0.5" vector-effect="non-scaling-stroke">
      <path :d="grid" :stroke-opacity="o.grid" vector-effect="non-scaling-stroke" />
      <path :d="`M${vp[0]} -1V1M-1 ${vp[1]}H1`" :stroke-opacity="o.cross" vector-effect="non-scaling-stroke" />
    </g>
    <g v-for="wg in (near ? wedges : [])" :key="wg.hull" class="ds-art-in">
      <polygon :points="wg.hull" fill="var(--ds-color-off-white)" :fill-opacity="o.hull" />
      <path :d="wg.lines" :transform="`translate(${vp[0]} ${vp[1]})`" fill="none" stroke="var(--ds-color-off-white)" stroke-width="0.5" :stroke-opacity="o.lines" vector-effect="non-scaling-stroke" />
    </g>
  </svg>
  <svg data-ds="cell-burst" v-if="traces.length" class="pointer-events-none absolute inset-0 h-full w-full" aria-hidden="true">
    <g fill="none" stroke="var(--ds-color-off-white)" stroke-width="1">
      <line v-for="(t, i) in traces" :key="i" v-bind="t.d" pathLength="1" class="ds-cell-trace" :stroke-opacity="t.opacity" :style="t.style" />
    </g>
  </svg>
</template>

<style>
.ds-art-in { animation: ds-art-in var(--ds-duration-art) var(--ds-easing-standard) both; }
@keyframes ds-art-in { from { opacity: 0; } }
/* Each line holds, wipes away from one end, then draws back in from the same end (home.css .cell-trace). */
.ds-cell-trace { stroke-dasharray: 1 1; stroke-dashoffset: 0; animation: ds-cell-trace var(--dur) var(--ds-easing-swap) infinite; animation-delay: var(--delay); }
@keyframes ds-cell-trace {
  0%, 62% { stroke-dashoffset: 0; }
  80% { stroke-dashoffset: -1; }
  80.01% { stroke-dashoffset: 1; }
  100% { stroke-dashoffset: 0; }
}
@media (prefers-reduced-motion: reduce) {
  .ds-art-in, .ds-cell-trace { animation: none; }
}
</style>
