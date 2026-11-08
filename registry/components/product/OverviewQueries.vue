<script setup lang="ts">
import { computed, ref } from 'vue'
import BarChart from '@/components/ui/BarChart.vue'
import LineChart, { type LineSeries } from '@/components/ui/LineChart.vue'
import Tabs from '@/components/ui/Tabs.vue'
import { formatNumber } from '@/composables/useChart'

// Overview's Queries card (platform/Queries.vue): volume or latency, three numbers over the chart (the chart item:
// BarChart for queries per day, LineChart for the last 24 hours' latency). Pointing at a number shows its part (this
// month's bars, today's bar, or the latency); a press pins it, with a 2px red edge. Nothing navigates: the chart changes
// in place, crossing over in 200ms. `latency` is the chart's series (p50, p95), each point a time and milliseconds.
export interface QueryDay { day: string, value: number }
const props = defineProps<{ thisMonth: number, p50: number, p95: number, days: QueryDay[], latency: LineSeries[] }>()
type Stat = '' | 'month' | 'today' | 'latency'
const chart = ref<'volume' | 'latency'>('volume')
const pinned = ref<Stat>('')
const hot = ref<Stat>('')
const active = computed(() => hot.value || pinned.value)
const view = computed(() => (active.value === 'latency' ? 'latency' : active.value ? 'volume' : chart.value))
function pin(stat: Exclude<Stat, ''>) {
  pinned.value = pinned.value === stat ? '' : stat
  chart.value = stat === 'latency' ? 'latency' : 'volume'
}
const tab = computed({ get: () => view.value, set: (v: 'volume' | 'latency') => { chart.value = v; pinned.value = '' } })
const today = computed(() => props.days.at(-1)?.value ?? 0)
const month = computed(() => props.days.at(-1)?.day.slice(0, 7) ?? '')
const focus = computed(() => {
  if (active.value === 'today') return props.days.length ? [props.days.length - 1] : []
  if (active.value === 'month') return props.days.flatMap((d, i) => (d.day.startsWith(month.value) ? [i] : []))
  return undefined
})
const note = computed(() => {
  if (active.value === 'today') return `Today ${formatNumber(today.value)}`
  if (active.value === 'month') return `${new Date(`${month.value}-01T00:00:00Z`).toLocaleString('en-US', { month: 'long', timeZone: 'UTC' })} so far`
  return undefined
})
const ms = (v: number) => `${Math.round(v)} ms`
</script>

<template>
  <section data-ds="overview-queries" class="min-w-0 border border-edge bg-surface" aria-labelledby="queries-title">
    <div class="flex flex-wrap items-center justify-between gap-x-3 gap-y-1 border-b border-edge px-4 py-3">
      <h2 id="queries-title" class="type-ui-strong">Queries</h2>
      <Tabs v-model="tab" :options="[{ value: 'volume', label: 'Volume' }, { value: 'latency', label: 'Latency' }]" label="chart" />
    </div>
    <div class="flex flex-col gap-4 p-4">
      <div class="grid grid-cols-2 border-t border-l border-edge sm:grid-cols-3">
        <button v-for="s in ([['month', 'This month', formatNumber(thisMonth)], ['today', 'Today', formatNumber(today)], ['latency', 'Search p50, 24 h', `${p50} ms`]] as const)" :key="s[0]" type="button" class="ds-ovstat" :aria-pressed="pinned === s[0]" :data-on="active === s[0] || undefined" @click="pin(s[0])" @pointerenter="hot = s[0]" @pointerleave="hot = ''">
          <span class="block type-meta text-fg-muted">{{ s[1] }}</span>
          <span class="block text-heading-4 font-medium tabular-nums">{{ s[2] }}<span v-if="s[0] === 'latency'" class="ml-2 type-meta text-fg-muted">p95 {{ p95 }} ms</span></span>
        </button>
      </div>
      <Transition name="ds-ovchart" mode="out-in">
        <div :key="view">
          <BarChart v-if="view === 'volume' && days.some(d => d.value > 0)" :points="days" label="Queries per day" :height="192" :focus="focus" :note="note" />
          <p v-else-if="view === 'volume'" class="py-8 text-center type-meta text-fg-muted">No queries yet.</p>
          <LineChart v-else-if="latency.some(l => l.points.length)" title="Search latency, last 24 hours" :series="latency" :format="ms" :smooth="3" :height="192" bare />
          <p v-else class="py-8 text-center type-meta text-fg-muted">No searches in the last 24 hours.</p>
        </div>
      </Transition>
    </div>
  </section>
</template>

<style>
.ds-ovstat { position: relative; width: 100%; padding: 8px 12px; border-right: var(--ds-border-hairline) solid var(--ds-color-edge); border-bottom: var(--ds-border-hairline) solid var(--ds-color-edge); text-align: left; cursor: pointer; transition: background-color var(--ds-duration-micro) var(--ds-easing-standard); }
.ds-ovstat[data-on] { background: var(--ds-color-surface-subtle); }
@media (hover: hover) and (pointer: fine) { .ds-ovstat:hover { background: var(--ds-color-surface-subtle); } }
.ds-ovstat[aria-pressed="true"]::before { position: absolute; top: -1px; right: -1px; left: -1px; height: 2px; background: var(--ds-color-edge-accent); content: ""; }
.ds-ovstat:focus-visible { outline: var(--ds-border-focus) solid var(--ds-color-edge-focus); outline-offset: -2px; }
.ds-ovchart-enter-active { transition: opacity var(--ds-duration-enter) var(--ds-easing-out), transform var(--ds-duration-drawer) var(--ds-easing-out); }
.ds-ovchart-leave-active { transition: opacity var(--ds-duration-exit) var(--ds-easing-standard), transform var(--ds-duration-exit) var(--ds-easing-standard); }
.ds-ovchart-enter-from { opacity: 0; transform: translateY(6px); }
.ds-ovchart-leave-to { opacity: 0; transform: translateY(-4px); }
@media (prefers-reduced-motion: reduce) {
  .ds-ovchart-enter-from, .ds-ovchart-leave-to { transform: none; }
}
</style>
