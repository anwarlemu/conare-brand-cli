<script setup lang="ts">
import { computed } from 'vue'
import { Check, Search, X } from 'lucide-vue-next'
import AccuracyThumb from '@/components/product/AccuracyThumb.vue'
import Button from '@/components/ui/Button.vue'

// One question of an accuracy test, opened (accuracy/Detail.vue): what came back, its page drawn small, the document in
// mono and the page number, the words with the part that answers in ink, and whether it reached the right page; the
// right one carries a 2px red line on top. `both` sets the team's current search and Conare side by side. Its foot says
// what to fix with the fix as a button, then Search it and Remove question: the app wires `fix`, `search` and `remove`.
export interface AccuracyHit { id: string, number: number, count: number, top: number, text: string, key: string, ok: boolean }
export interface AccuracyRow { id: string, question: string, namespace: string, conare: AccuracyHit, current: AccuracyHit, fix?: { why: string, action: string } }
export interface AccuracyView {
  state: 'running' | 'done'
  /** When it ran, as the page says it ("3 hours ago"), who ran it, how long it took and what it cost. */
  ran: string
  by: string
  seconds: number
  cost: number
  questions: number
  done: number
  right: number
  current_right: number
  current_name: string
  rows: AccuracyRow[]
  queued: Array<{ id: string, question: string, namespace: string }>
}

const props = defineProps<{ row: AccuracyRow, both?: boolean, name?: string }>()
const emit = defineEmits<{ fix: [row: AccuracyRow], search: [row: AccuracyRow], remove: [row: AccuracyRow] }>()
const split = (h: AccuracyHit) => {
  const at = h.text.indexOf(h.key)
  return at < 0 ? [h.text, '', ''] : [h.text.slice(0, at), h.key, h.text.slice(at + h.key.length)]
}
const answers = computed(() => props.both
  ? [{ label: props.name ?? 'Your current search', hit: props.row.current }, { label: 'Conare', hit: props.row.conare }]
  : [{ label: 'What came back', hit: props.row.conare }])
</script>

<template>
  <div class="flex flex-col bg-surface-subtle">
    <div class="grid" :class="both && 'md:grid-cols-2'">
      <div v-for="(a, i) in answers" :key="a.label" class="ds-answer" :class="i > 0 && 'border-edge max-md:border-t md:border-l'" :data-won="a.hit.ok || undefined">
        <p class="type-ui-strong">{{ a.label }}</p>
        <div class="flex items-center gap-3">
          <AccuracyThumb :number="a.hit.number" :top="a.hit.top" />
          <p class="min-w-0">
            <span class="block truncate type-code-sm">{{ a.hit.id }}</span>
            <span class="block type-meta text-fg-muted">Page {{ a.hit.number }} of {{ a.hit.count }}</span>
          </p>
        </div>
        <p class="text-body leading-5.5 text-pretty text-fg-muted">{{ split(a.hit)[0] }}<span class="font-medium text-fg">{{ split(a.hit)[1] }}</span>{{ split(a.hit)[2] }}</p>
        <span class="ds-verdict" :data-ok="a.hit.ok || undefined"><Check v-if="a.hit.ok" :size="12" :stroke-width="2" aria-hidden="true" /><X v-else :size="12" :stroke-width="2" aria-hidden="true" />{{ a.hit.ok ? 'Right page' : 'Wrong page' }}</span>
      </div>
    </div>
    <div class="flex flex-wrap items-center justify-end gap-2 px-4 pb-3">
      <p v-if="row.fix" class="min-w-0 flex-1 max-sm:basis-full">{{ row.fix.why }}</p>
      <Button v-if="row.fix" press @click="emit('fix', row)">{{ row.fix.action }}</Button>
      <Button variant="ghost" press @click="emit('search', row)"><Search :size="12" :stroke-width="1.5" aria-hidden="true" />Search it</Button>
      <Button variant="ghost" press @click="emit('remove', row)">Remove question</Button>
    </div>
  </div>
</template>

<style>
.ds-answer { position: relative; display: flex; min-width: 0; flex-direction: column; align-items: flex-start; gap: var(--ds-space-lg); padding: 16px; }
.ds-answer[data-won]::before { position: absolute; inset: 0 0 auto; height: 2px; background: var(--ds-color-edge-accent); content: ""; }
/* A result's state (.v2-proc): 12px, its icon first; a miss in the darker red. */
.ds-verdict { display: inline-flex; width: fit-content; align-items: center; gap: var(--ds-space-sm); color: var(--ds-color-fg-danger); font-size: var(--ds-text-meta); line-height: var(--ds-text-meta-leading); }
.ds-verdict[data-ok] { color: var(--ds-color-fg); }
.ds-verdict svg { flex-shrink: 0; }
td > .ds-verdict { font-size: var(--ds-text-ui); }
/* The chevron turns on a transition, so a quick second click reverses it from where it is (.v2-chev). */
.ds-chev { transition: rotate var(--ds-duration-micro) var(--ds-easing-out), color var(--ds-duration-micro) var(--ds-easing-standard); }
.ds-chev[data-open] { rotate: 180deg; transition-duration: var(--ds-duration-slide), var(--ds-duration-micro); }
.ds-table tbody tr.ds-row-open td { background: var(--ds-color-surface-subtle); }
@media (prefers-reduced-motion: reduce) { .ds-chev { transition: none; } }
</style>
