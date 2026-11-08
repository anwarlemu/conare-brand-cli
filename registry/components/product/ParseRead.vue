<script setup lang="ts">
import { computed } from 'vue'
import { isTotal, tableOf, type ParsePart } from '@/composables/useParse'

// What Conare took from a page, as a person reads it (parse/Read.vue): the regions in reading order without the running
// head and foot, tables as tables. Each region takes focus, and pointing at or focusing one emits `point`, so the page
// beside it lights the same region; a click pins it (`pick`). `plays` lands them in order with the page's red line.
const props = defineProps<{ part: ParsePart, on?: number | null, plays?: boolean }>()
const emit = defineEmits<{ point: [order: number | null], pick: [order: number] }>()
const body = computed(() => props.part.blocks.filter(b => b.type !== 'header' && b.type !== 'footer'))
</script>

<template>
  <div data-ds="parse-read" class="ds-parseread" :data-plays="plays || undefined">
    <div v-for="b in body" :key="b.order" class="ds-parseread-block" :data-type="b.type" :data-on="on === b.order || undefined" :style="{ '--o': b.order }" tabindex="0" @pointerenter="emit('point', b.order)" @pointerleave="emit('point', null)" @focus="emit('point', b.order)" @blur="emit('point', null)" @click="emit('pick', b.order)">
      <table v-if="b.type === 'table'" class="ds-parsetable" data-read>
        <thead><tr><th v-for="(h, i) in tableOf(b.content).head" :key="i" scope="col">{{ h }}</th></tr></thead>
        <tbody>
          <tr v-for="(r, k) in tableOf(b.content).rows" :key="k" :data-total="isTotal(r[0] ?? '') || undefined">
            <td v-for="(c, i) in r" :key="i">{{ c }}</td>
          </tr>
        </tbody>
      </table>
      <template v-else-if="b.type === 'list'"><p v-for="(l, i) in b.content.split('\n')" :key="i">{{ l }}</p></template>
      <p v-else>{{ b.content }}</p>
    </div>
  </div>
</template>

<style>
.ds-parseread { display: flex; flex-direction: column; gap: var(--ds-space-2xs); font-size: var(--ds-text-ui); line-height: var(--ds-text-ui-leading); }
.ds-parseread-block { padding: 8px; border-left: 2px solid transparent; transition: background-color var(--ds-duration-micro) var(--ds-easing-standard), border-color var(--ds-duration-micro) var(--ds-easing-standard); }
.ds-parseread-block p { margin: 0; }
.ds-parseread-block[data-type="title"] { font-size: var(--ds-text-heading-4); font-weight: var(--ds-font-weight-medium); line-height: var(--ds-text-heading-4-leading); }
.ds-parseread-block:is([data-type="footnote"], [data-type="image"]) { font-size: var(--ds-text-meta); line-height: var(--ds-text-meta-leading); opacity: 0.7; }
.ds-parseread-block[data-on] { border-left-color: var(--ds-color-edge-accent); background: color-mix(in srgb, var(--ds-color-surface-accent) 12%, transparent); }
.ds-parseread-block:focus-visible { outline: var(--ds-border-focus) solid var(--ds-color-edge-accent); outline-offset: -2px; }
.ds-parsetable[data-read] { font-size: var(--ds-text-meta); line-height: var(--ds-text-meta-leading); }
@media (prefers-reduced-motion: no-preference) {
  .ds-parseread[data-plays] .ds-parseread-block { animation: ds-parse-land var(--ds-duration-land) var(--ds-easing-standard) both; animation-delay: calc(var(--o) * 90ms); }
}
@media (max-width: 767px) { .ds-parsetable[data-read] :is(th, td) + :is(th, td) { padding-left: 0.6em; } }
</style>
