<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { Check, ChevronDown, X } from 'lucide-vue-next'
import AccuracyDetail, { type AccuracyRow, type AccuracyView } from '@/components/product/AccuracyDetail.vue'
import AccuracyOpens from '@/components/product/AccuracyOpens.vue'
import Button from '@/components/ui/Button.vue'
import Tabs from '@/components/ui/Tabs.vue'

// Accuracy, "Two searches" (accuracy/Two.vue): Conare against the search the team uses today, the count of each over a
// 6px track (Conare's red) in the double rule, then only the questions where they part, the first one open. Conare's
// misses stay in. Each row marks both searches, a check for the right page and a red cross for the wrong one.
type Show = 'differ' | 'all' | 'missed'
const props = defineProps<{ view: AccuracyView }>()
const emit = defineEmits<{ fix: [row: AccuracyRow], search: [row: AccuracyRow], remove: [row: AccuracyRow] }>()
const show = ref<Show>('differ')
const rows = computed(() => props.view.rows)
const differ = computed(() => rows.value.filter(r => r.conare.ok !== r.current.ok))
const missed = computed(() => rows.value.filter(r => !r.conare.ok && !r.current.ok))
const list = computed(() => (show.value === 'differ' ? differ.value : show.value === 'missed' ? missed.value : rows.value))
const filters = computed(() => [
  { value: 'differ' as Show, label: `Where they differ, ${differ.value.length}` },
  { value: 'all' as Show, label: `All, ${rows.value.length}` },
  { value: 'missed' as Show, label: `Both missed, ${missed.value.length}` },
])
const gain = computed(() => props.view.right - props.view.current_right)
const lost = computed(() => rows.value.filter(r => !r.conare.ok && r.current.ok).length)
const opened = ref('')
watch(list, (l) => { if (!l.some(r => r.id === opened.value)) opened.value = l[0]?.id ?? '' }, { immediate: true })
const shown = ref(10)
watch(show, () => { shown.value = 10 })
const share = (n: number) => `scaleX(${props.view.questions ? n / props.view.questions : 0})`
</script>

<template>
  <section class="m-1.25 grid grid-cols-2 gap-x-8 gap-y-6 border border-edge p-6 outline outline-offset-4 outline-edge max-md:gap-4 max-md:p-4" aria-label="your current search and Conare">
    <div v-for="side in [{ name: view.current_name, n: view.current_right, red: false }, { name: 'Conare', n: view.right, red: true }]" :key="side.name" class="min-w-0">
      <p class="type-meta text-fg-muted">{{ side.name }}</p>
      <p class="font-heading text-display leading-14 tracking-display tabular-nums max-md:text-heading-1 max-md:leading-10">{{ side.n }} of {{ view.questions }}</p>
      <div class="ds-evaltrack" :data-red="side.red || undefined" aria-hidden="true"><span :style="{ transform: share(side.n) }" /></div>
    </div>
    <p class="col-span-full text-body">Conare reached the right page on {{ gain }} more questions{{ lost ? `, and missed ${lost} your current search found` : '' }}.</p>
  </section>

  <section class="flex flex-col gap-2" aria-label="question by question">
    <Tabs v-model="show" class="self-start" :options="filters" label="which questions" />
    <p class="ds-evalheads max-sm:hidden" aria-hidden="true"><span>Yours</span><span>Conare</span></p>
    <ul class="border border-edge bg-surface [&>*+*]:border-t [&>*+*]:border-edge">
      <li v-for="r in list.slice(0, shown)" :key="r.id">
        <button type="button" class="ds-evalrow" :aria-expanded="opened === r.id" @click="opened = opened === r.id ? '' : r.id">
          <span class="min-w-0 flex-1 truncate max-sm:whitespace-normal" :class="opened === r.id && 'whitespace-normal'">{{ r.question }}</span>
          <span class="ds-evalmarks" aria-hidden="true">
            <span :data-ok="r.current.ok || undefined"><span class="sm:hidden">Yours</span><Check v-if="r.current.ok" :size="12" :stroke-width="2" /><X v-else :size="12" :stroke-width="2" /></span>
            <span :data-ok="r.conare.ok || undefined"><span class="sm:hidden">Conare</span><Check v-if="r.conare.ok" :size="12" :stroke-width="2" /><X v-else :size="12" :stroke-width="2" /></span>
          </span>
          <span class="sr-only">{{ view.current_name }}: {{ r.current.ok ? 'right page' : 'wrong page' }}. Conare: {{ r.conare.ok ? 'right page' : 'wrong page' }}.</span>
          <ChevronDown :size="14" :stroke-width="1.5" class="ds-chev shrink-0 text-fg-muted" :data-open="opened === r.id || undefined" aria-hidden="true" />
        </button>
        <AccuracyOpens :open="opened === r.id"><AccuracyDetail :row="r" both :name="view.current_name" @fix="emit('fix', $event)" @search="emit('search', $event)" @remove="emit('remove', $event)" /></AccuracyOpens>
      </li>
    </ul>
    <Button v-if="shown < list.length" variant="ghost" press class="self-start" @click="shown += 10">Show 10 more</Button>
  </section>
</template>

<style>
.ds-evaltrack { position: relative; height: 6px; margin-top: 12px; background: var(--ds-color-surface-sunken); }
.ds-evaltrack > span { position: absolute; inset: 0; background: var(--ds-color-fg); transform-origin: left; transition: transform var(--ds-duration-land) var(--ds-easing-out); }
.ds-evaltrack[data-red] > span { background: var(--ds-color-surface-accent); }
.ds-evalheads { display: flex; justify-content: flex-end; gap: var(--ds-space-md); padding-right: 46px; color: var(--ds-color-fg-muted); font-size: var(--ds-text-meta); line-height: var(--ds-text-meta-leading); }
.ds-evalheads > span { width: 40px; text-align: center; }
.ds-evalrow { display: flex; width: 100%; align-items: center; gap: var(--ds-space-xl); padding: 10px 16px; text-align: left; cursor: pointer; transition: background-color var(--ds-duration-micro) var(--ds-easing-standard); }
.ds-evalrow[aria-expanded="true"] { background: var(--ds-color-surface-subtle); }
.ds-evalrow:focus-visible { outline: var(--ds-border-focus) solid var(--ds-color-edge-accent); outline-offset: -2px; }
.ds-evalrow:active { background: color-mix(in srgb, var(--ds-color-fg) 8%, var(--ds-color-surface-subtle)); }
@media (hover: hover) and (pointer: fine) { .ds-evalrow:hover { background: var(--ds-color-surface-subtle); } }
.ds-evalmarks { display: flex; gap: var(--ds-space-md); }
.ds-evalmarks > span { display: flex; width: 40px; height: 16px; align-items: center; justify-content: center; color: var(--ds-color-fg-accent); }
.ds-evalmarks > span[data-ok] { color: var(--ds-color-fg); }
@media (max-width: 767px) {
  .ds-evalrow { flex-wrap: wrap; gap: 4px 8px; padding-inline: 12px; }
  .ds-evalrow > span:first-child { flex-basis: calc(100% - 22px); text-wrap: pretty; }
  .ds-evalrow .ds-chev { order: 1; align-self: flex-start; margin-top: 2px; }
  .ds-evalrow .ds-evalmarks { order: 2; flex-basis: 100%; gap: var(--ds-space-lg); }
  .ds-evalrow .ds-evalmarks > span { width: auto; gap: var(--ds-space-xs); font-size: var(--ds-text-meta); line-height: var(--ds-text-meta-leading); }
}
@media (prefers-reduced-motion: reduce) { .ds-evaltrack > span { transition: none; } }
</style>
