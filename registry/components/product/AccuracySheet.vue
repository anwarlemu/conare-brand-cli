<script setup lang="ts">
import { computed, ref } from 'vue'
import { Check, ChevronDown, Plus, X } from 'lucide-vue-next'
import AccuracyDetail, { type AccuracyRow, type AccuracyView } from '@/components/product/AccuracyDetail.vue'
import AccuracyOpens from '@/components/product/AccuracyOpens.vue'
import Button from '@/components/ui/Button.vue'
import DotMatrix from '@/components/ui/DotMatrix.vue'
import Table from '@/components/ui/Table.vue'
import Count from '@/components/ui/Count.vue'

// Accuracy, "Question sheet" (accuracy/Sheet.vue): the questions are the page, as teams keep them in a spreadsheet.
// Right and wrong counted over a 2px line that fills as the run lands; a numbered sheet whose first row takes a new
// question (or a pasted list, one a line), questions still waiting with the dot matrix, each answered row opening to
// what came back. Twelve at a time. `add` gets the new questions.
const props = defineProps<{ view: AccuracyView }>()
const emit = defineEmits<{ add: [questions: string[]], fix: [row: AccuracyRow], search: [row: AccuracyRow], remove: [row: AccuracyRow] }>()
const text = ref('')
function submit() {
  const questions = text.value.split('\n').map(l => l.trim()).filter(Boolean)
  if (!questions.length) return
  emit('add', questions)
  text.value = ''
}
function paste(event: ClipboardEvent) {
  const pasted = event.clipboardData?.getData('text') ?? ''
  if (!pasted.includes('\n')) return
  event.preventDefault()
  text.value = pasted
  submit()
}
const rows = computed(() => [
  ...props.view.rows.map(r => ({ id: r.id, question: r.question, namespace: r.namespace, row: r as AccuracyRow | null })),
  ...props.view.queued.map(q => ({ ...q, row: null })),
])
const shown = ref(12)
const opened = ref('')
const wrong = computed(() => props.view.done - props.view.right)
</script>

<template>
  <section class="relative flex flex-wrap items-baseline gap-x-6 gap-y-1 pb-3" aria-live="polite">
    <p><span class="font-heading text-heading-2 tabular-nums"><Count :value="view.right" /></span> right</p>
    <p><span class="font-heading text-heading-2 tabular-nums" :class="wrong > 0 && 'text-fg-accent'"><Count :value="wrong" /></span> wrong</p>
    <p class="ml-auto type-meta text-fg-muted">{{ view.state === 'running' ? `${view.done} of ${view.questions} done` : `${view.questions} questions, run ${view.ran}` }}</p>
    <span class="ds-sheetline" aria-hidden="true"><span :style="{ transform: `scaleX(${view.questions ? view.done / view.questions : 0})` }" /></span>
  </section>
  <div class="overflow-hidden border border-edge bg-surface">
    <Table>
      <thead><tr><th scope="col" class="w-10 text-right max-sm:hidden"><span class="sr-only">Number</span></th><th scope="col">Question</th><th scope="col" class="w-40 max-lg:hidden">Namespace</th><th scope="col" class="w-32 max-sm:hidden">Result</th><th scope="col" class="w-8"><span class="sr-only">Open</span></th></tr></thead>
      <tbody>
        <tr>
          <td class="text-right text-fg-muted max-sm:hidden"><Plus :size="12" :stroke-width="1.5" class="inline" aria-hidden="true" /></td>
          <td colspan="4" class="!p-0">
            <form @submit.prevent="submit">
              <label class="sr-only" for="eval-add">add a question</label>
              <input id="eval-add" v-model="text" class="h-10 w-full bg-transparent px-3 text-ui placeholder:text-fg-muted focus:outline-2 focus:-outline-offset-2 focus:outline-edge-accent max-md:text-input" autocomplete="off" placeholder="Add a question, or paste a list" @paste="paste">
            </form>
          </td>
        </tr>
        <template v-for="(r, i) in rows.slice(0, shown)" :key="r.id">
          <tr :class="[r.row && 'is-link', opened === r.id && 'ds-row-open']" @click="r.row && (opened = opened === r.id ? '' : r.id)">
            <td class="text-right text-fg-muted tabular-nums max-sm:hidden">{{ i + 1 }}</td>
            <td class="max-w-0 max-sm:w-full">
              <button v-if="r.row" type="button" class="block w-full cursor-pointer truncate text-left focus-visible:outline-2 focus-visible:outline-edge-accent max-sm:whitespace-normal" :class="opened === r.id && 'whitespace-normal'" :aria-expanded="opened === r.id" @click.stop="opened = opened === r.id ? '' : r.id">{{ r.question }}</button>
              <span v-else class="block truncate max-sm:whitespace-normal">{{ r.question }}</span>
              <span v-if="r.row" class="ds-verdict mt-0.5 sm:hidden" :data-ok="r.row.conare.ok || undefined">{{ r.row.conare.ok ? `Page ${r.row.conare.number}` : 'Wrong page' }}</span>
            </td>
            <td class="type-code-sm max-lg:hidden">{{ r.namespace }}</td>
            <td class="max-sm:hidden">
              <span v-if="!r.row" class="ds-verdict !text-fg-muted"><DotMatrix />Waiting</span>
              <span v-else class="ds-verdict" :data-ok="r.row.conare.ok || undefined"><Check v-if="r.row.conare.ok" :size="12" :stroke-width="2" aria-hidden="true" /><X v-else :size="12" :stroke-width="2" aria-hidden="true" />{{ r.row.conare.ok ? `Page ${r.row.conare.number}` : 'Wrong page' }}</span>
            </td>
            <td class="text-right"><ChevronDown v-if="r.row" :size="14" :stroke-width="1.5" class="ds-chev inline text-fg-muted" :data-open="opened === r.id || undefined" aria-hidden="true" /></td>
          </tr>
          <AccuracyOpens :open="opened === r.id && !!r.row" :colspan="5"><AccuracyDetail v-if="r.row" :row="r.row" @fix="emit('fix', $event)" @search="emit('search', $event)" @remove="emit('remove', $event)" /></AccuracyOpens>
        </template>
      </tbody>
    </Table>
  </div>
  <Button v-if="shown < rows.length" variant="ghost" press class="self-start" @click="shown += 12">Show 12 more</Button>
</template>

<style>
.ds-sheetline { position: absolute; inset: auto 0 0 0; height: 2px; background: var(--ds-color-surface-sunken); }
.ds-sheetline > span { display: block; height: 100%; background: var(--ds-color-fg); transform-origin: left; transition: transform var(--ds-duration-glide) linear; }
@media (prefers-reduced-motion: reduce) { .ds-sheetline > span { transition: none; } }
</style>
