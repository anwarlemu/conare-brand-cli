<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import VizWindow from '@/components/visuals/VizWindow.vue'

// Accuracy against list price as a window (the website's PriceViz.vue): the chart draws itself (grid, then the corner
// nothing beats, then the crosshair on the model's own point, then each model's point), and under it the models as rows,
// best first. Price is on a log axis; up and to the left is better; the shaded corner is what would beat the model's own
// point on both. Points are squares. Pointing at a point or its row scopes it: a crosshair to both axes, brackets, the
// axes' readouts and a tooltip with its exact score and price, gliding from point to point (160ms, the console's curve)
// and appearing in place when it arrives from nowhere. `x` and `y` set the axes (their ticks and ends).
export interface PricePoint { name: string, price: number, score: number, ours?: boolean }
export interface PriceData { benchmark: string, metric: string, points: PricePoint[], note?: string }
type Axis = { min: number, max: number, ticks: number[] }

const props = withDefaults(defineProps<{ data: PriceData, active: boolean, x?: Axis, y?: Axis }>(), {
  x: () => ({ min: 0.05, max: 2, ticks: [0.05, 0.1, 0.2, 0.5, 1, 2] }),
  y: () => ({ min: 56, max: 70, ticks: [56, 60, 64, 68] }),
})

const W = 560
const H = 284
const L = 40
const R = W - 16
const T = 24
const B = 260
const xMin = computed(() => Math.log10(props.x.min))
const xMax = computed(() => Math.log10(props.x.max))
const px = (price: number) => L + ((Math.log10(price) - xMin.value) / (xMax.value - xMin.value)) * (R - L)
const py = (score: number) => B - ((score - props.y.min) / (props.y.max - props.y.min)) * (B - T)
const money = (v: number) => `$${v.toFixed(2)}`

const points = computed(() => [...props.data.points]
  .sort((a, b) => b.score - a.score)
  .map((p, i) => ({ ...p, cx: px(p.price), cy: py(p.score), i, mark: { '--d': 1300 + i * 140 }, row: { '--d': 1500 + i * 110 } })))
const ours = computed(() => points.value.find(p => p.ours) ?? points.value[0]!)
const hot = ref<string | null>(null)

const scoped = computed(() => points.value.find(p => p.name === hot.value) ?? null)
const scopeAt = ref(points.value[0]!)
const glide = ref(false)
watch(scoped, (p, was) => {
  if (!p) return
  scopeAt.value = p
  if (!was) {
    glide.value = false
    requestAnimationFrame(() => requestAnimationFrame(() => { glide.value = true }))
  }
})
// The tooltip opens away from the chart's nearer edges: left of points on the right half, below points near the top.
const tipLeft = computed(() => scopeAt.value.cx > (L + R) / 2)
const tipBelow = computed(() => scopeAt.value.cy < T + 70)
const BRACKET = 11
const ARM = 4
const bracket = [
  `M${-BRACKET} ${-BRACKET + ARM}V${-BRACKET}H${-BRACKET + ARM}`,
  `M${BRACKET - ARM} ${-BRACKET}H${BRACKET}V${-BRACKET + ARM}`,
  `M${BRACKET} ${BRACKET - ARM}V${BRACKET}H${BRACKET - ARM}`,
  `M${-BRACKET + ARM} ${BRACKET}H${-BRACKET}V${BRACKET - ARM}`,
].join('')
</script>

<template>
  <VizWindow :active="active" class="max-w-155">
    <template #title>
      <span class="truncate text-ui leading-4">{{ data.benchmark }}</span>
      <span class="hidden shrink-0 bg-neutral-200 px-1.5 py-0.5 text-caption text-neutral-500 sm:inline">Price and accuracy</span>
    </template>

    <div class="flex flex-col gap-4 px-4 pt-1 pb-4">
      <!-- The chart. -->
      <div class="border border-neutral-300 px-2 pt-2 pb-4">
        <div class="relative [container-type:inline-size]" :data-glide="glide" :data-scoped="!!scoped" @pointerleave="hot = null">
          <svg :viewBox="`0 0 ${W} ${H}`" class="block w-full" role="img" :aria-label="`${data.benchmark} ${data.metric} against list price per 1M tokens`">
            <g class="ds-viz-in" style="--d: 300">
              <g v-for="t in y.ticks" :key="`y${t}`">
                <line :x1="L" :x2="R" :y1="py(t)" :y2="py(t)" class="ds-price-grid" />
                <text :x="L - 8" :y="py(t) + 4" text-anchor="end" class="ds-price-axis" :class="t === y.min && 'ds-price-axis-floor'">{{ t }}</text>
              </g>
              <g v-for="(t, i) in x.ticks" :key="`x${t}`">
                <line :x1="px(t)" :x2="px(t)" :y1="T" :y2="B" class="ds-price-grid" />
                <text :x="px(t)" :y="B + 18" :text-anchor="i === x.ticks.length - 1 ? 'end' : i === 0 ? 'start' : 'middle'" class="ds-price-axis">{{ money(t) }}</text>
              </g>
              <text :x="L" :y="T - 10" class="ds-price-axis">{{ data.metric }}</text>
              <text :x="R" :y="T - 10" text-anchor="end" class="ds-price-axis">Up and to the left is better</text>
            </g>
            <!-- What would beat the model's own point on both. -->
            <rect class="ds-viz-in" :x="L" :y="T" :width="ours.cx - L" :height="ours.cy - T" fill="var(--ds-color-home-red)" fill-opacity="0.14" style="--d: 800" />
            <path class="ds-price-draw" :d="`M${ours.cx} ${B}V${ours.cy}H${L}`" fill="none" stroke="var(--ds-color-home-red)" stroke-opacity="0.6" style="--d: 1000" pathLength="1" />
            <!-- The scope's crosshair, under the points, each rule moved on transform alone. -->
            <g class="ds-price-scope" :data-shown="!!scoped" aria-hidden="true">
              <line class="ds-price-scope-move" :x1="L" :x2="R" y1="0" y2="0" :style="{ transform: `translateY(${scopeAt.cy}px)` }" />
              <line class="ds-price-scope-move" x1="0" x2="0" :y1="T" :y2="B" :style="{ transform: `translateX(${scopeAt.cx}px)` }" />
            </g>
            <g v-for="p in points" :key="p.name" class="ds-viz-in ds-price-point" :data-dim="hot !== null && hot !== p.name" :style="p.mark">
              <rect :x="p.cx - (p.ours ? 6 : 4)" :y="p.cy - (p.ours ? 6 : 4)" :width="p.ours ? 12 : 8" :height="p.ours ? 12 : 8" :fill="p.ours ? 'var(--ds-color-home-red)' : 'var(--ds-color-neutral-600)'" />
              <text :x="p.cx + (p.price >= 1 ? -12 : 12)" :y="p.cy + 4" :text-anchor="p.price >= 1 ? 'end' : 'start'" class="ds-price-label" :data-ours="p.ours || undefined">{{ p.name }}</text>
              <!-- A target larger than the square, for the pointer. -->
              <rect :x="p.cx - 14" :y="p.cy - 14" width="28" height="28" fill="transparent" class="cursor-crosshair" @pointerenter="hot = p.name" />
            </g>
            <!-- Over the points: the brackets round the scoped one, and its readouts on both axes. -->
            <g class="ds-price-scope" :data-shown="!!scoped" :data-ours="scopeAt.ours || undefined" aria-hidden="true">
              <g class="ds-price-scope-move" :style="{ transform: `translate(${scopeAt.cx}px, ${scopeAt.cy}px)` }">
                <path class="ds-price-scope-bracket" :d="bracket" />
              </g>
              <g class="ds-price-scope-move" :style="{ transform: `translateY(${scopeAt.cy}px)` }">
                <rect :x="L - 38" y="-8" width="36" height="16" class="ds-price-readout" />
                <text :x="L - 20" y="4" text-anchor="middle" class="ds-price-axis ds-price-readout-text">{{ scopeAt.score.toFixed(2) }}</text>
              </g>
              <g class="ds-price-scope-move" :style="{ transform: `translateX(${scopeAt.cx}px)` }">
                <rect x="-20" :y="B + 6" width="40" height="16" class="ds-price-readout" />
                <text x="0" :y="B + 18" text-anchor="middle" class="ds-price-axis ds-price-readout-text">{{ money(scopeAt.price) }}</text>
              </g>
            </g>
          </svg>
          <!-- The exact result by the scoped point, placed on transform alone in the chart's own width (cqw). -->
          <div
            class="ds-price-tip pointer-events-none absolute top-0 left-0"
            :data-shown="!!scoped"
            :style="{ transform: `translate(calc(${scopeAt.cx / W} * 100cqw), calc(${scopeAt.cy / W} * 100cqw))` }"
            aria-hidden="true"
          >
            <div
              class="ds-price-tip-box w-[172px] border border-neutral-300 bg-neutral-200 px-2.5 py-2 text-meta"
              :style="{ transform: `translate(${tipLeft ? 'calc(-100% - 18px)' : '18px'}, ${tipBelow ? '18px' : 'calc(-100% - 18px)'})` }"
            >
              <p class="flex items-center gap-1.5 truncate text-off-white">
                <span class="ds-viz-dot" :class="scopeAt.ours ? 'bg-home-red' : 'bg-neutral-500'" />{{ scopeAt.name }}
              </p>
              <p class="mt-1.5 flex justify-between gap-4 text-neutral-500">
                {{ data.metric }}<span class="text-off-white tabular-nums">{{ scopeAt.score.toFixed(2) }}</span>
              </p>
              <p class="mt-0.5 flex justify-between gap-4 text-neutral-500">
                Per 1M tokens<span class="text-off-white tabular-nums">{{ money(scopeAt.price) }}</span>
              </p>
            </div>
          </div>
        </div>
        <!-- The x axis' name, its right edge on the axis' last label. -->
        <p class="ds-viz-in mt-2 flex justify-end" :style="{ '--d': 300, paddingRight: `${((W - R) / W) * 100}%` }">
          <span class="bg-neutral-700 px-2 py-1 text-caption text-off-black">Price per 1M tokens, log scale</span>
        </p>
      </div>

      <!-- The models, best first; a row lights its point. -->
      <ol class="border border-neutral-300" @mouseleave="hot = null">
        <li
          v-for="p in points"
          :key="p.name"
          class="ds-viz-in flex h-9 items-center gap-3 border-b border-neutral-300 px-3 text-ui leading-4 transition-colors duration-200 ease-standard last:border-b-0"
          :class="hot === p.name ? 'bg-neutral-200' : ''"
          :style="p.row"
          @mouseenter="hot = p.name"
        >
          <span class="ds-viz-dot" :class="p.ours ? 'bg-home-red' : 'bg-neutral-500'" />
          <span class="min-w-0 flex-1 truncate" :class="p.ours ? 'text-off-white' : 'text-neutral-600'">{{ p.name }}</span>
          <span class="w-12 shrink-0 text-right text-neutral-500 tabular-nums max-[419px]:hidden">{{ p.score.toFixed(2) }}</span>
          <span class="w-14 shrink-0 text-right tabular-nums" :class="p.ours ? 'text-off-white' : 'text-neutral-500'">{{ money(p.price) }}</span>
        </li>
      </ol>

      <p v-if="data.note" class="ds-viz-in flex gap-2 text-meta leading-5 text-neutral-500" style="--d: 2300">
        <svg width="12" height="12" viewBox="0 0 12 12" aria-hidden="true" class="mt-1 shrink-0"><rect x="0.5" y="0.5" width="11" height="11" fill="none" stroke="currentColor" /><rect x="5.25" y="5" width="1.5" height="4" fill="currentColor" /><rect x="5.25" y="2.5" width="1.5" height="1.5" fill="currentColor" /></svg>
        {{ data.note }}
      </p>
    </div>
  </VizWindow>
</template>

<style>
/* The price chart (home.css .price-*): hairline grid and axes on the window's dark; a row under the pointer lights its
   point while the others dim. */
.ds-price-grid { stroke: var(--ds-color-neutral-300); stroke-width: 1; }
.ds-price-axis { fill: var(--ds-color-neutral-500); font-family: var(--ds-font-text); font-size: var(--ds-text-tag); font-variant-numeric: tabular-nums; transition: opacity var(--ds-duration-micro) var(--ds-easing-standard); }
.ds-price-label { fill: var(--ds-color-neutral-600); font-size: var(--ds-text-meta); }
.ds-price-label[data-ours] { fill: var(--ds-color-off-white); }
/* On a phone the chart draws at under half size: its axis labels go up to stay legible, and the points' names give
   way (the rows under the chart name every model). */
@media (max-width: 639px) {
  .ds-price-axis { font-size: var(--ds-text-heading-3); }
  .ds-price-axis-floor, .ds-price-label { display: none; }
}
.ds-price-point { transition: opacity var(--ds-duration-micro) var(--ds-easing-standard); }
.ds-price-point[data-dim="true"] { opacity: 0.3 !important; }
.ds-price-scope, .ds-price-tip { opacity: 0; transition: opacity var(--ds-duration-micro) var(--ds-easing-standard); }
.ds-price-scope[data-shown="true"], .ds-price-tip[data-shown="true"] { opacity: 1; }
[data-glide="true"] .ds-price-scope-move { transition: transform var(--ds-duration-glide) var(--ds-easing-standard); }
[data-glide="true"] .ds-price-tip { transition: opacity var(--ds-duration-micro) var(--ds-easing-standard), transform var(--ds-duration-glide) var(--ds-easing-standard); }
[data-glide="true"] .ds-price-tip-box { transition: transform var(--ds-duration-glide) var(--ds-easing-standard); }
.ds-price-scope line { stroke: var(--ds-color-off-white); stroke-opacity: 0.35; stroke-dasharray: 2 3; }
.ds-price-scope-bracket { fill: none; stroke: var(--ds-color-off-white); stroke-width: 1.5; }
.ds-price-scope[data-ours] .ds-price-scope-bracket { stroke: var(--ds-color-home-red); }
/* While a point is scoped the axes' own labels step back for its readouts. */
[data-scoped="true"] .ds-price-axis:not(.ds-price-readout-text) { opacity: 0.35; }
.ds-price-readout { fill: var(--ds-color-off-white); }
.ds-price-readout-text { fill: var(--ds-color-off-black); }
@media (max-width: 639px) { .ds-price-readout, .ds-price-readout-text { display: none; } }
.ds-price-draw { stroke-dasharray: 1; stroke-dashoffset: 1; }
.ds-viz[data-active="true"] .ds-price-draw { animation: ds-price-draw var(--ds-duration-viz-draw) var(--ds-easing-swap) both; animation-delay: calc(var(--d) * 1ms); }
@keyframes ds-price-draw { to { stroke-dashoffset: 0; } }
@media (prefers-reduced-motion: reduce) {
  [data-glide="true"] :is(.ds-price-scope-move, .ds-price-tip, .ds-price-tip-box) { transition: opacity var(--ds-duration-micro) var(--ds-easing-standard); }
  .ds-viz[data-active="true"] .ds-price-draw { animation: none; }
  .ds-price-draw { stroke-dashoffset: 0; }
}
</style>
