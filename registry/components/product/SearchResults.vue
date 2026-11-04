<script setup lang="ts">
import { computed, nextTick, ref, useId, watch } from 'vue'
import { ChevronDown } from 'lucide-vue-next'
import DotMatrix from '@/components/ui/DotMatrix.vue'
import AnswerText from '@/components/product/AnswerText.vue'
import MarkedPassage from '@/components/product/MarkedPassage.vue'
import PagePreview from '@/components/product/PagePreview.vue'
import { resultKey, type ResultPage, type SearchResult } from '@/composables/useSearchResults'

// Search results, "Best match" (search/BestMatch.vue): the top result is the answer most of the time, so it gets the
// card, the full passage at a larger size with the query's words marked, the pages around it (its own outlined in red)
// and its source; the rest follow as one quiet line each, to scan, and a line opens in place to its full passage.
// `answer` puts a written answer in the card instead of the passage, citing results [1], [2]; `writing` holds the
// card's room with the dot matrix while it is written. `reveal` (a result's key and a time) opens that result, brings
// it into view and flashes it once, as the search run's squares do. `logoOf` gives a namespace's app mark; the
// `actions` slot (with `result`) holds a result's buttons, such as a download. Results rise in, 60ms apart.
const props = defineProps<{
  results: SearchResult[]
  query: string
  answer?: string
  writing?: boolean
  reveal?: { key: string, at: number } | null
  logoOf?: (namespace: string) => string | null | undefined
}>()
const emit = defineEmits<{ cite: [key: string] }>()
defineSlots<{ actions?: (p: { result: SearchResult }) => unknown }>()

const pre = `match-${useId()}`
const open = ref('')
watch(() => props.results, () => { open.value = '' })
const logo = (ns: string) => props.logoOf?.(ns) ?? null
const answers = computed(() => props.writing || props.answer !== undefined)

const flash = ref('')
watch(() => props.reveal?.at, () => { if (props.reveal) bringIn(props.reveal.key) })
async function bringIn(key: string) {
  const i = props.results.findIndex(r => resultKey(r) === key)
  if (i < 0) return
  if (i > 0) open.value = key
  flash.value = ''
  await nextTick()
  flash.value = key
  document.getElementById(i === 0 ? `${pre}-top` : `${pre}-row-${i - 1}`)?.scrollIntoView({ behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth', block: 'center' })
}
function cite(n: number) {
  const r = props.results[n - 1]
  if (!r) return
  emit('cite', resultKey(r))
  bringIn(resultKey(r))
}

const pageLine = (p: ResultPage) => `Page ${p.number} of ${p.count}`
// The pages before and after the passage's, unmarked.
const around = (p: ResultPage) => [p.number - 1, p.number, p.number + 1].filter(n => n >= 1 && n <= p.count).map(n => ({ ...p, number: n, here: n === p.number }))
</script>

<template>
  <div class="ds-results flex flex-col gap-6">
    <article v-if="results[0]" :id="`${pre}-top`" class="ds-rise border border-edge bg-surface" :data-flash="flash === resultKey(results[0]) || undefined" :style="{ '--i': 0 }">
      <div class="flex min-w-0 flex-col gap-9 px-4 pt-4 pb-4.5">
        <div v-if="answers" class="min-h-12" aria-live="polite">
          <p v-if="writing" class="inline-flex items-center gap-1.5 type-meta"><DotMatrix />Writing an answer</p>
          <AnswerText v-else-if="answer" :text="answer" @cite="cite" />
          <p v-else class="ds-answer-text"><MarkedPassage :text="results[0].text" :query="query" /></p>
        </div>
        <p v-else class="type-body-lg text-neutral-200"><MarkedPassage :text="results[0].text" :query="query" /></p>
        <div v-if="results[0].page" class="flex items-end gap-2">
          <PagePreview v-for="p in around(results[0].page)" :key="p.number" :page="p" size="thumb" :marked="p.here" :here="p.here" />
          <span class="ml-1 type-meta text-fg-muted">{{ pageLine(results[0].page) }} in <span class="type-code-sm">{{ results[0].page.file }}</span></span>
        </div>
      </div>
      <div class="flex flex-wrap items-center justify-between gap-3 border-t border-edge py-2.5 pr-2 pl-4">
        <span class="flex min-w-0 items-center gap-1.5">
          <img v-if="logo(results[0].namespace)" :src="logo(results[0].namespace)!" alt="" width="14" height="14" class="size-3.5 shrink-0 object-contain">
          <span class="truncate type-code-sm">{{ results[0].id }}</span>
          <span class="shrink-0 type-meta text-fg-muted">in <span class="type-code-sm">{{ results[0].namespace }}</span>, {{ results[0].score.toFixed(2) }}</span>
        </span>
        <span v-if="$slots.actions" class="flex items-center gap-2"><slot name="actions" :result="results[0]" /></span>
      </div>
    </article>

    <section v-if="results.length > 1" class="ds-others flex flex-col gap-1" :aria-labelledby="`${pre}-more`">
      <h2 :id="`${pre}-more`" class="type-meta text-fg-muted">Other matches</h2>
      <ol class="ds-others-rows">
        <li v-for="(r, i) in results.slice(1)" :id="`${pre}-row-${i}`" :key="resultKey(r)" class="ds-rise" :data-flash="flash === resultKey(r) || undefined" :style="{ '--i': i + 1 }">
          <button type="button" class="ds-match w-full text-left" :aria-expanded="open === resultKey(r)" :aria-controls="`${pre}-${i}`" @click="open = open === resultKey(r) ? '' : resultKey(r)">
            <img v-if="logo(r.namespace)" :src="logo(r.namespace)!" alt="" width="12" height="12" class="size-3 shrink-0 object-contain">
            <span class="ds-match-id w-40 shrink-0 truncate max-sm:w-auto max-sm:min-w-0 max-sm:flex-1">{{ r.id }}</span>
            <span class="hidden min-w-0 flex-1 truncate sm:block" :class="{ invisible: open === resultKey(r) }">{{ r.text }}</span>
            <span v-if="r.page" class="hidden shrink-0 tabular-nums sm:inline">p. {{ r.page.number }}</span>
            <span class="shrink-0 tabular-nums">{{ r.score.toFixed(2) }}</span>
            <ChevronDown :size="12" :stroke-width="1.5" class="ds-match-chev shrink-0 text-fg-muted" aria-hidden="true" />
          </button>
          <!-- Opens by its rows' height (0fr to 1fr), so it grows to fit. -->
          <div :id="`${pre}-${i}`" class="ds-expand" :data-open="open === resultKey(r) || undefined" :inert="open !== resultKey(r)">
            <div class="min-h-0 overflow-hidden">
              <div class="flex min-w-0 flex-col gap-3 pt-1 pb-3">
                <p class="leading-5.5 text-neutral-200"><MarkedPassage :text="r.text" :query="query" /></p>
                <div class="flex flex-wrap items-center justify-between gap-3">
                  <span class="flex flex-wrap gap-x-4 gap-y-1 type-meta text-fg-muted">
                    <span>in <span class="type-code-sm">{{ r.namespace }}</span></span>
                    <span v-if="r.page">{{ pageLine(r.page) }}</span>
                  </span>
                  <span v-if="$slots.actions" class="flex items-center gap-2"><slot name="actions" :result="r" /></span>
                </div>
              </div>
            </div>
          </div>
        </li>
      </ol>
    </section>
  </div>
</template>

<style>
/* Results rise in, each 60ms after the last (console2.css .v2-results[data-motion="1"] .v2-rise). */
.ds-results .ds-rise { animation: ds-results-in var(--ds-duration-enter) var(--ds-easing-out) both; animation-delay: calc(var(--i, 0) * 60ms); }
@keyframes ds-results-in { from { opacity: 0; transform: translateY(12px); } }
/* The dot matrix in red while the answer is written (.v2-proc .v2-matrix). */
.ds-results .ds-matrix i { background: var(--ds-color-edge-accent); }
.ds-others-rows > * + * { border-top: var(--ds-border-hairline) solid var(--ds-color-edge); }
/* Other matches: a quiet list under the answer, every row still opening. */
.ds-match { display: flex; min-height: var(--ds-size-control-md); align-items: center; gap: var(--ds-space-md); padding: 0; color: var(--ds-color-fg-muted); font-size: var(--ds-text-meta); line-height: var(--ds-text-meta-leading); transition: color var(--ds-duration-micro) var(--ds-easing-standard); }
.ds-match-id { color: var(--ds-color-fg-soft); font-family: var(--ds-font-code); font-size: var(--ds-text-meta); transition: color var(--ds-duration-micro) var(--ds-easing-standard); }
@media (hover: hover) and (pointer: fine) {
  .ds-match:hover { color: var(--ds-color-fg-soft); }
  .ds-match:hover .ds-match-id { color: var(--ds-color-fg); }
}
.ds-match:focus-visible { outline: var(--ds-border-focus) solid var(--ds-color-edge-accent); outline-offset: -2px; }
.ds-match-chev { transition: rotate var(--ds-duration-micro) var(--ds-easing-out); }
.ds-match[aria-expanded="true"] .ds-match-chev { rotate: 180deg; transition-duration: var(--ds-duration-slide); }
.ds-expand { display: grid; grid-template-rows: 0fr; transition: grid-template-rows var(--ds-duration-slide) var(--ds-easing-out); }
.ds-expand[data-open] { grid-template-rows: 1fr; }
/* A result shown from its square flashes its red outline once. */
.ds-results [data-flash] { animation: ds-results-flash var(--ds-duration-flash) var(--ds-easing-standard) both; }
@keyframes ds-results-flash { 0%, 40% { outline: var(--ds-border-focus) solid var(--ds-color-edge-accent); outline-offset: -2px; } 100% { outline: var(--ds-border-focus) solid transparent; outline-offset: -2px; } }
@media (prefers-reduced-motion: reduce) {
  .ds-results .ds-rise, .ds-results [data-flash] { animation: none; }
  .ds-match-chev, .ds-expand { transition: none; }
}
</style>
