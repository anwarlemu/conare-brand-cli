<script setup lang="ts">
import { computed, ref } from 'vue'

// Lines over time (LineChart.vue): one axis from 0, 2px lines in the brand's series order (red, neutral-400,
// neutral-600 dashed, so colour is never the only difference), the first series shading the area under it, a legend
// when there is more than one, and a crosshair with the values under the pointer. `smooth = k` draws each point as the
// mean of the points within k / 2 steps of it in time, for series too sparse to read point by point. In a card by
// default; `bare` drops the card, for a chart already inside one.
export type LineSeries = { label: string, points: Array<{ t: number, v: number }> }
const props = defineProps<{ title: string, series: LineSeries[], format: (value: number) => string, smooth?: number, height?: number, bare?: boolean }>()

const W = 600
const H = 160
const COLORS = ['var(--ds-color-data-1)', 'var(--ds-color-data-2)', 'var(--ds-color-data-3)']
const DASH = ['', '', '5 4']

const step = computed(() => {
  const t = [...new Set(props.series.flatMap(s => s.points.map(p => p.t)))].sort((a, b) => a - b)
  return Math.min(...t.slice(1).map((v, i) => v - t[i]!))
})
function rolling(points: Array<{ t: number, v: number }>, k: number) {
  const reach = Math.floor(k / 2) * step.value
  if (!(reach > 0) || !Number.isFinite(reach)) return points
  return points.map((p) => {
    const near = points.filter(q => Math.abs(q.t - p.t) <= reach)
    return { t: p.t, v: near.reduce((n, q) => n + q.v, 0) / near.length }
  })
}
const lines = computed(() => props.series.slice(0, 3).filter(s => s.points.length).map(s => ({ ...s, points: rolling(s.points, props.smooth ?? 1) })))
const times = computed(() => [...new Set(lines.value.flatMap(s => s.points.map(p => p.t)))].sort((a, b) => a - b))
const span = computed(() => ({ from: times.value[0] ?? 0, to: times.value[times.value.length - 1] ?? 1 }))
const max = computed(() => {
  const top = Math.max(0, ...lines.value.flatMap(s => s.points.map(p => p.v)))
  if (top <= 0) return 1
  const unit = 10 ** Math.floor(Math.log10(top))
  return Math.ceil(top / unit) * unit
})
const x = (t: number) => (span.value.to === span.value.from ? W / 2 : ((t - span.value.from) / (span.value.to - span.value.from)) * W)
const y = (v: number) => H - (v / max.value) * H

const paths = computed(() => lines.value.map((s, i) => ({
  label: s.label,
  color: COLORS[i]!,
  dash: DASH[i]!,
  d: s.points.map((p, j) => `${j ? 'L' : 'M'}${x(p.t).toFixed(1)},${y(p.v).toFixed(1)}`).join(''),
  last: s.points[s.points.length - 1]!,
  area: i ? '' : `M${x(s.points[0]!.t).toFixed(1)},${H}${s.points.map(p => `L${x(p.t).toFixed(1)},${y(p.v).toFixed(1)}`).join('')}L${x(s.points[s.points.length - 1]!.t).toFixed(1)},${H}Z`,
})))

const hover = ref<number | null>(null)
function move(event: PointerEvent) {
  const box = (event.currentTarget as HTMLElement).getBoundingClientRect()
  const t = span.value.from + ((event.clientX - box.left) / box.width) * (span.value.to - span.value.from)
  let best: number | null = null
  for (const c of times.value) if (best === null || Math.abs(c - t) < Math.abs(best - t)) best = c
  hover.value = best
}
// Local time; with the day too over a range longer than 12 hours.
function clock(t: number) {
  const long = span.value.to - span.value.from > 12 * 3_600_000
  return new Date(t).toLocaleString('en-US', { ...(long ? { month: 'short', day: 'numeric' } : {}), hour: 'numeric', minute: '2-digit', hour12: false })
}
const hovered = computed(() => {
  const t = hover.value
  if (t === null) return null
  return {
    left: `${(x(t) / W) * 100}%`,
    right: x(t) > W * 0.6,
    time: clock(t),
    values: lines.value.map((s, i) => ({ label: s.label, color: COLORS[i]!, value: s.points.find(p => p.t === t)?.v })),
  }
})
</script>

<template>
  <figure :class="!bare && 'border border-edge bg-surface p-4'">
    <figcaption class="mb-3 flex min-h-5 flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
      <span class="type-meta font-medium text-fg-muted">{{ title }}</span>
      <span v-if="lines.length > 1" class="flex flex-wrap gap-3 type-meta text-fg-muted">
        <span v-for="p in paths" :key="p.label" class="inline-flex items-center gap-1">
          <svg width="16" height="4" aria-hidden="true"><line x1="0" y1="2" x2="16" y2="2" :stroke="p.color" stroke-width="2" :stroke-dasharray="p.dash" /></svg>
          {{ p.label }}
        </span>
      </span>
    </figcaption>
    <p v-if="!lines.length" class="type-ui text-fg-muted">No data in this range.</p>
    <div v-else class="flex gap-2">
      <div class="relative h-40 w-14 shrink-0" aria-hidden="true">
        <span v-for="(v, i) in [max, max / 2, 0]" :key="i" class="type-meta text-fg-muted tabular-nums absolute right-0 -translate-y-1/2 whitespace-nowrap" :style="{ top: `${i * 50}%` }">{{ i === 2 ? '0' : format(v) }}</span>
      </div>
      <div class="min-w-0 flex-1">
        <div
          class="relative h-40 touch-none"
          :style="height ? { height: `${height}px` } : undefined"
          role="img"
          :aria-label="`${title}: ${paths.map(p => `${p.label} last ${format(p.last.v)}`).join(', ')}`"
          @pointermove="move"
          @pointerleave="hover = null"
        >
          <svg class="absolute inset-0 h-full w-full overflow-visible" :viewBox="`0 0 ${W} ${H}`" preserveAspectRatio="none">
            <line v-for="g in [0, H / 2, H]" :key="g" x1="0" :y1="g" :x2="W" :y2="g" stroke="var(--ds-color-data-grid)" stroke-width="1" vector-effect="non-scaling-stroke" />
            <path v-for="p in paths.filter(q => q.area)" :key="`${p.label}-area`" :d="p.area" :fill="p.color" fill-opacity="0.06" />
            <path v-for="p in paths" :key="p.label" :d="p.d" fill="none" :stroke="p.color" stroke-width="2" :stroke-dasharray="p.dash" stroke-linejoin="round" stroke-linecap="round" vector-effect="non-scaling-stroke" />
          </svg>
          <template v-if="hovered">
            <div class="pointer-events-none absolute inset-y-0 w-px bg-neutral-500" :style="{ left: hovered.left }" />
            <div
              class="pointer-events-none absolute top-0 z-10 border border-edge bg-surface px-3 py-2 type-meta"
              :style="hovered.right ? { right: `calc(100% - ${hovered.left} + 8px)` } : { left: `calc(${hovered.left} + 8px)` }"
            >
              <p class="mb-1 text-fg-muted tabular-nums">{{ hovered.time }}</p>
              <p v-for="v in hovered.values" :key="v.label" class="flex items-center gap-2 whitespace-nowrap tabular-nums">
                <span class="inline-block h-0.5 w-3" :style="{ background: v.color }" />
                <span v-if="lines.length > 1" class="text-fg-muted">{{ v.label }}</span>
                <span class="font-medium">{{ v.value === undefined ? '–' : format(v.value) }}</span>
              </p>
            </div>
          </template>
        </div>
        <div class="type-meta text-fg-muted tabular-nums mt-2 flex justify-between">
          <span>{{ clock(span.from) }}</span>
          <span>{{ clock(span.to) }}</span>
        </div>
      </div>
    </div>
  </figure>
</template>
