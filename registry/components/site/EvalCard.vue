<script setup lang="ts">
import { computed } from 'vue'

// A benchmark as a card (EvalCard.vue, the evals page and a model's page): its name, our score and rank, the top
// rows as bars, ours in red and kept in (in the last place) when it falls outside them, and the way to its page. The
// paper comes in under the pointer. Every figure comes through props; `better` sorts the rows by its own direction.
export type EvalRow = { name: string, value: number, ours?: boolean, rank?: number }

const props = withDefaults(defineProps<{
  href: string
  name: string
  metric: string
  score: number
  rank: { n: number, of: number, word?: string }
  rows: EvalRow[]
  max: number
  better?: 'higher' | 'lower'
  unit?: '%'
  limit?: number
  linkLabel?: string
}>(), { better: 'higher', limit: 5, linkLabel: 'See the benchmark' })

const format = (value: number) => (props.unit === '%' ? `${value.toFixed(1)}%` : value.toFixed(1))
const rankLabel = computed(() => `#${props.rank.n} of ${props.rank.of}${props.rank.word ? `, ${props.rank.word}` : ''}`)

const top = computed(() => {
  const sorted = [...props.rows].sort((a, b) => (props.better === 'higher' ? b.value - a.value : a.value - b.value))
  let rows = sorted
  if (props.limit && sorted.length > props.limit) {
    rows = sorted.slice(0, props.limit)
    const ours = sorted.find(r => r.ours)
    if (ours && !rows.some(r => r.ours)) rows = [...rows.slice(0, props.limit - 1), ours]
  }
  return rows.map(r => ({ ...r, bar: { width: `${Math.min(100, (r.value / props.max) * 100)}%` } }))
})
</script>

<template>
  <a :href="href" class="ds-eval-card flex w-full flex-col bg-surface px-5 py-6 sm:px-6">
    <span class="type-heading-3 text-fg">{{ name }}</span>
    <span class="mt-3 text-heading-1 leading-none tracking-display text-fg tabular-nums">{{ format(score) }}</span>
    <span class="mt-2 type-ui text-fg-muted">{{ metric }}<template v-if="better === 'lower'">, lower is better</template> · {{ rankLabel }}</span>
    <ol class="mt-6 flex flex-col gap-3">
      <li v-for="(r, i) in top" :key="r.name" class="grid grid-cols-[16px_minmax(0,1fr)_auto] items-center gap-x-2 gap-y-1.5 text-ui leading-4">
        <span class="text-caption text-fg-faint tabular-nums">{{ r.rank ?? i + 1 }}</span>
        <span class="truncate" :class="r.ours ? 'text-fg' : 'text-fg-muted'">{{ r.name }}</span>
        <span class="tabular-nums" :class="r.ours ? 'text-fg' : 'text-fg-muted'">{{ format(r.value) }}</span>
        <span class="col-start-2 col-end-4 h-1 bg-edge">
          <span class="block h-full" :class="r.ours ? 'bg-home-red' : 'bg-ds-neutral-500'" :style="r.bar" />
        </span>
      </li>
    </ol>
    <span class="mt-auto flex items-center gap-1.5 pt-8 type-ui text-fg-faint">
      {{ linkLabel }}
      <svg width="10" height="10" viewBox="0 0 10 10" fill="none" stroke="currentColor" stroke-width="1.2" aria-hidden="true"><path d="M1.5 5h7M5.5 2l3 3-3 3" /></svg>
    </span>
  </a>
</template>

<style>
.ds-eval-card { transition: background-color var(--ds-duration-micro) var(--ds-easing-standard); }
@media (hover: hover) and (pointer: fine) { .ds-eval-card:hover { background: var(--ds-color-surface-subtle); } }
</style>
