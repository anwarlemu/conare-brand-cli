<script setup lang="ts">
import { computed, ref } from 'vue'
import Tabs from '@/components/ui/Tabs.vue'

// Overview's Queries card (platform/Queries.vue): volume or latency, three numbers over the chart. Pointing at a
// number shows its part (this month's bars, today's bar, or the latency); a press pins it, with a 2px red edge.
// Nothing navigates: the chart changes in place, crossing over in 200ms. The chart here is the minimum, bars per day
// in neutral-600 with the picked ones red and a latency line; the chart item draws the full one.
export interface QueryDay { day: string, value: number }
const props = defineProps<{ thisMonth: number, p50: number, p95: number, days: QueryDay[], latency: number[] }>()
type Stat = '' | 'month' | 'today' | 'latency'
const chart = ref<'volume' | 'latency'>('volume')
const pinned = ref<Stat>('')
const hot = ref<Stat>('')
const pointed = ref<number | null>(null)
const active = computed(() => hot.value || pinned.value)
const view = computed(() => (active.value === 'latency' ? 'latency' : active.value ? 'volume' : chart.value))
function pin(stat: Exclude<Stat, ''>) {
  pinned.value = pinned.value === stat ? '' : stat
  chart.value = stat === 'latency' ? 'latency' : 'volume'
}
const tab = computed({ get: () => view.value, set: (v: 'volume' | 'latency') => { chart.value = v; pinned.value = '' } })
const today = computed(() => props.days.at(-1)?.value ?? 0)
const month = computed(() => props.days.at(-1)?.day.slice(0, 7) ?? '')
const peak = computed(() => Math.max(1, ...props.days.map(d => d.value)))
const lit = (i: number) => {
  if (pointed.value !== null) return pointed.value === i
  if (active.value === 'today') return i === props.days.length - 1
  if (active.value === 'month') return props.days[i]!.day.startsWith(month.value)
  return true
}
const num = (n: number) => n.toLocaleString('en-US')
const day = (d: string) => new Date(`${d}T00:00:00Z`).toLocaleString('en-US', { month: 'short', day: 'numeric', timeZone: 'UTC' })
const note = computed(() => {
  if (pointed.value !== null) return `${day(props.days[pointed.value]!.day)} ${num(props.days[pointed.value]!.value)}`
  if (active.value === 'today') return `Today ${num(today.value)}`
  if (active.value === 'month') return `${new Date(`${month.value}-01T00:00:00Z`).toLocaleString('en-US', { month: 'long', timeZone: 'UTC' })} so far`
  return ''
})
const top = computed(() => Math.max(1, ...props.latency) * 1.15)
const line = computed(() => props.latency.map((v, i) => `${(i / Math.max(1, props.latency.length - 1)) * 100},${100 - (v / top.value) * 100}`).join(' '))
</script>

<template>
  <section class="min-w-0 border border-edge bg-surface" aria-labelledby="queries-title">
    <div class="flex flex-wrap items-center justify-between gap-x-3 gap-y-1 border-b border-edge px-4 py-3">
      <h2 id="queries-title" class="type-ui-strong">Queries</h2>
      <Tabs v-model="tab" :options="[{ value: 'volume', label: 'Volume' }, { value: 'latency', label: 'Latency' }]" label="chart" />
    </div>
    <div class="flex flex-col gap-4 p-4">
      <div class="grid grid-cols-2 border-t border-l border-edge sm:grid-cols-3">
        <button v-for="s in ([['month', 'This month', num(thisMonth)], ['today', 'Today', num(today)], ['latency', 'Search p50, 24 h', `${p50} ms`]] as const)" :key="s[0]" type="button" class="ds-ovstat" :aria-pressed="pinned === s[0]" :data-on="active === s[0] || undefined" @click="pin(s[0])" @pointerenter="hot = s[0]" @pointerleave="hot = ''">
          <span class="block type-meta text-fg-muted">{{ s[1] }}</span>
          <span class="block text-heading-4 font-medium tabular-nums">{{ s[2] }}<span v-if="s[0] === 'latency'" class="ml-2 type-meta text-fg-muted">p95 {{ p95 }} ms</span></span>
        </button>
      </div>
      <Transition name="ds-ovchart" mode="out-in">
        <figure v-if="view === 'volume'" key="volume" class="flex flex-col gap-3">
          <figcaption class="flex h-5 items-baseline justify-between gap-4 type-caption text-fg-muted">
            <span>Queries per day</span><span class="type-meta tabular-nums">{{ note }}</span>
          </figcaption>
          <div class="flex h-48 items-end border-b border-edge" role="img" :aria-label="`Queries per day, ${days.length} days`" @pointerleave="pointed = null">
            <span v-for="(d, i) in days" :key="d.day" class="flex h-full flex-1 items-end" @pointerenter="pointed = i">
              <span class="ds-ovbar mx-auto w-[70%]" :data-lit="lit(i) || undefined" :style="{ height: `${Math.max(1, (d.value / peak) * 100)}%`, '--i': i }" />
            </span>
          </div>
        </figure>
        <figure v-else key="latency" class="flex flex-col gap-3">
          <figcaption class="flex h-5 items-baseline justify-between gap-4 type-caption text-fg-muted"><span>Search latency, last 24 hours</span><span class="type-meta tabular-nums">p50 {{ p50 }} ms</span></figcaption>
          <svg class="h-48 w-full border-b border-edge" viewBox="0 0 100 100" preserveAspectRatio="none" role="img" aria-label="Search latency, last 24 hours"><polyline :points="line" fill="none" stroke="var(--ds-color-data-1)" stroke-width="1.5" vector-effect="non-scaling-stroke" /></svg>
        </figure>
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
.ds-ovbar { display: block; min-height: 1px; background: var(--ds-color-neutral-600); transform-origin: bottom; animation: ds-ovbar-in var(--ds-duration-drawer) var(--ds-easing-out) both; animation-delay: calc(var(--i, 0) * 4ms); transition: background-color var(--ds-duration-glide) var(--ds-easing-standard); }
.ds-ovbar[data-lit] { background: var(--ds-color-home-red); }
@keyframes ds-ovbar-in { from { transform: scaleY(0.04); } }
.ds-ovchart-enter-active { transition: opacity var(--ds-duration-enter) var(--ds-easing-out), transform var(--ds-duration-drawer) var(--ds-easing-out); }
.ds-ovchart-leave-active { transition: opacity var(--ds-duration-exit) var(--ds-easing-standard), transform var(--ds-duration-exit) var(--ds-easing-standard); }
.ds-ovchart-enter-from { opacity: 0; transform: translateY(6px); }
.ds-ovchart-leave-to { opacity: 0; transform: translateY(-4px); }
.ds-ovchart-enter-active .ds-ovbar { animation: none; }
@media (prefers-reduced-motion: reduce) {
  .ds-ovbar { animation: none; }
  .ds-ovchart-enter-from, .ds-ovchart-leave-to { transform: none; }
}
</style>
