<script setup lang="ts">
import { computed, nextTick, ref } from 'vue'
import { Check, ChevronDown, X } from 'lucide-vue-next'
import AccuracyDetail, { type AccuracyRow, type AccuracyView } from '@/components/product/AccuracyDetail.vue'
import AccuracyOpens from '@/components/product/AccuracyOpens.vue'
import Button from '@/components/ui/Button.vue'
import Table from '@/components/ui/Table.vue'
import Count from '@/components/ui/Count.vue'

// Accuracy, "Verdict first" (accuracy/Verdict.vue): a count read in five seconds in the double rule, beside a field of
// a hundred squares, one a question, ink where the right page came back and red where it did not; pointing at one reads
// its question, a click opens it in the list. Then only what needs a person, each with its fix, then every question, ten
// at a time, each opening to what came back. The squares land once, row by row; reduced motion shows them at once.
const props = defineProps<{ view: AccuracyView }>()
const emit = defineEmits<{ fix: [row: AccuracyRow], search: [row: AccuracyRow], remove: [row: AccuracyRow] }>()
const rows = computed(() => props.view.rows)
const wrong = computed(() => rows.value.filter(r => !r.conare.ok))
const cells = computed(() => [...rows.value.map(r => ({ id: r.id, wrong: !r.conare.ok, queued: false })), ...props.view.queued.map(q => ({ id: q.id, wrong: false, queued: true }))])
const pointed = ref<AccuracyRow | null>(null)
const opened = ref('')
const shown = ref(10)
const rowOf = (event: Event) => rows.value.find(r => r.id === (event.target as HTMLElement).dataset.id)
function open(row: AccuracyRow) {
  opened.value = opened.value === row.id ? '' : row.id
  if (!rows.value.slice(0, shown.value).some(r => r.id === row.id)) shown.value = rows.value.length
  void nextTick(() => document.getElementById(`eval-${row.id}`)?.scrollIntoView({ block: 'center', behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth' }))
}
function clicked(event: MouseEvent) {
  const r = rowOf(event)
  if (r) open(r)
}
</script>

<template>
  <section data-ds="accuracy-verdict" class="m-1.25 grid grid-cols-[minmax(0,1fr)_240px] gap-8 border border-edge p-6 outline outline-offset-4 outline-edge max-md:grid-cols-1 max-md:p-4" aria-labelledby="eval-score">
    <div class="flex min-w-0 flex-col gap-1">
      <p id="eval-score" class="font-heading text-display leading-14 tracking-display tabular-nums max-md:text-heading-1 max-md:leading-10"><Count :value="view.right" /> of {{ view.questions }}</p>
      <p class="text-input">{{ view.state === 'running' ? `Running. ${view.done} of ${view.questions} done.` : 'questions reached the right page.' }}</p>
      <p class="mt-auto type-meta text-fg-muted">{{ pointed ? pointed.question : `Run ${view.ran} by ${view.by}, ${view.seconds} s, $${view.cost.toFixed(2)}` }}</p>
    </div>
    <div class="ds-evalfield max-md:max-w-50" role="img" :aria-label="`${view.right} of ${view.questions} questions reached the right page`" @pointermove="pointed = rowOf($event) ?? null" @pointerleave="pointed = null" @click="clicked">
      <span v-for="(c, i) in cells" :key="c.id" :data-id="c.id" :data-wrong="c.wrong || undefined" :data-queued="c.queued || undefined" :style="{ '--i': Math.floor(i / 10) }" />
    </div>
  </section>

  <section data-ds="accuracy-verdict" v-if="wrong.length" class="flex flex-col gap-2" aria-labelledby="eval-look">
    <h2 id="eval-look" class="type-ui-strong">{{ wrong.length === 1 ? '1 to look at' : `${wrong.length} to look at` }}</h2>
    <ul class="border border-edge bg-surface [&>*+*]:border-t [&>*+*]:border-edge">
      <li v-for="r in wrong" :key="r.id" class="flex min-h-10 items-center justify-between gap-4 px-4 py-1.5 max-sm:flex-col max-sm:items-start max-sm:gap-2 max-sm:py-3">
        <span class="min-w-0">
          <span class="block">{{ r.question }}</span>
          <span class="block type-meta text-fg-muted"><span class="font-code whitespace-nowrap">{{ r.namespace }}</span>. {{ r.fix?.why ?? 'The wrong page came back first.' }}</span>
        </span>
        <Button v-if="r.fix" press @click="emit('fix', r)">{{ r.fix.action }}</Button>
      </li>
    </ul>
  </section>

  <section data-ds="accuracy-verdict" class="flex flex-col gap-2" aria-labelledby="eval-all">
    <h2 id="eval-all" class="type-ui-strong">Every question</h2>
    <div class="overflow-hidden border border-edge bg-surface">
      <Table>
        <thead class="max-sm:sr-only"><tr><th scope="col">Question</th><th scope="col" class="w-40 max-lg:hidden">Namespace</th><th scope="col" class="w-28 max-sm:hidden">Result</th><th scope="col" class="w-8"><span class="sr-only">Open</span></th></tr></thead>
        <tbody>
          <template v-for="r in rows.slice(0, shown)" :key="r.id">
            <tr :id="`eval-${r.id}`" class="is-link" :class="opened === r.id && 'ds-row-open'" @click="open(r)">
              <td class="max-w-0 max-sm:w-full">
                <button type="button" class="block w-full cursor-pointer truncate text-left focus-visible:outline-2 focus-visible:outline-edge-accent max-sm:whitespace-normal" :class="opened === r.id && 'whitespace-normal'" :aria-expanded="opened === r.id" @click.stop="open(r)">{{ r.question }}</button>
                <span class="ds-verdict mt-0.5 sm:hidden" :data-ok="r.conare.ok || undefined">{{ r.conare.ok ? `Page ${r.conare.number}` : 'Wrong page' }}</span>
              </td>
              <td class="type-code-sm max-lg:hidden">{{ r.namespace }}</td>
              <td class="max-sm:hidden"><span class="ds-verdict" :data-ok="r.conare.ok || undefined"><Check v-if="r.conare.ok" :size="12" :stroke-width="2" aria-hidden="true" /><X v-else :size="12" :stroke-width="2" aria-hidden="true" />{{ r.conare.ok ? `Page ${r.conare.number}` : 'Wrong page' }}</span></td>
              <td class="text-right"><ChevronDown :size="14" :stroke-width="1.5" class="ds-chev inline text-fg-muted" :data-open="opened === r.id || undefined" aria-hidden="true" /></td>
            </tr>
            <AccuracyOpens :open="opened === r.id" :colspan="4"><AccuracyDetail :row="r" @fix="emit('fix', $event)" @search="emit('search', $event)" @remove="emit('remove', $event)" /></AccuracyOpens>
          </template>
        </tbody>
      </Table>
    </div>
    <Button v-if="shown < rows.length" variant="ghost" press class="self-start" @click="shown += 10">Show 10 more</Button>
  </section>
</template>

<style>
.ds-evalfield { display: grid; grid-template-columns: repeat(10, minmax(0, 1fr)); gap: var(--ds-space-xs); }
.ds-evalfield > span { display: block; aspect-ratio: 1; background: var(--ds-color-fg); transition: opacity var(--ds-duration-micro) var(--ds-easing-standard); }
.ds-evalfield > span[data-wrong] { background: var(--ds-color-surface-accent); }
.ds-evalfield > span[data-queued] { background: var(--ds-color-surface-sunken); }
@media (hover: hover) and (pointer: fine) { .ds-evalfield:hover > span:not(:hover) { opacity: 0.32; } }
@media (prefers-reduced-motion: no-preference) {
  .ds-evalfield > span { animation: ds-evalcell var(--ds-duration-enter) var(--ds-easing-out) both; animation-delay: calc(var(--i) * 30ms); }
}
@keyframes ds-evalcell { from { opacity: 0; transform: scale(0.9); } }
</style>
