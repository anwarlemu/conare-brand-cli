<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { PenLine } from 'lucide-vue-next'
import Button from '@/components/ui/Button.vue'
import DotMatrix from '@/components/ui/DotMatrix.vue'
import AnswerText from '@/components/product/AnswerText.vue'
import PagePreview from '@/components/product/PagePreview.vue'
import { resultKey, type SearchResult } from '@/composables/useSearchResults'

// The written answer above the passages (search/Written.vue): on the paper with a red edge, the answer's words at 16px
// citing the results it stands on, [1] and [2] as small ink squares. A written answer takes about 2s more than the
// passages, so they land first and the answer follows. Three ways to show it: `first`, by itself above the passages;
// `request`, one button (it costs a second query), which emits `write`; `beside`, the cited page at reading size next
// to the words, following the citation pointed at. `writing` shows the dot matrix; `error` says what went wrong.
// Citations emit `cite` with the result's key, for the results below to show it.
const props = withDefaults(defineProps<{ results: SearchResult[], text?: string, writing?: boolean, error?: string, mode?: 'first' | 'request' | 'beside' }>(), { text: '', mode: 'first' })
const emit = defineEmits<{ write: [], cite: [key: string] }>()

const pointed = ref(1)
watch(() => props.results, () => { pointed.value = 1 })
const shown = computed(() => props.results[pointed.value - 1] ?? props.results[0])
function cite(n: number) {
  pointed.value = n
  const r = props.results[n - 1]
  if (r) emit('cite', resultKey(r))
}
</script>

<template>
  <section data-ds="written-answer" v-if="mode !== 'request' || text || writing || error" class="ds-written" aria-label="written answer" aria-live="polite">
    <div class="min-w-0 flex-1">
      <p v-if="error" class="bg-surface-danger px-3 py-2 type-ui text-fg" role="alert">{{ error }}</p>
      <p v-else-if="writing" class="inline-flex items-center gap-1.5 type-meta"><DotMatrix />Writing an answer</p>
      <p v-else-if="!text" class="type-meta text-fg-muted">Nothing here to write an answer from.</p>
      <AnswerText v-else :text="text" :pointed="mode === 'beside' ? pointed : undefined" @point="pointed = $event" @cite="cite" />
    </div>
    <figure v-if="mode === 'beside' && text && shown?.page" class="ds-written-page">
      <PagePreview :key="shown.id" :page="shown.page" size="mid" />
      <figcaption class="type-meta text-fg-muted"><span class="block truncate type-code-sm">{{ shown.id }}</span>Page {{ shown.page.number }} of {{ shown.page.count }}</figcaption>
    </figure>
  </section>
  <Button data-ds="written-answer" v-else press class="self-start" @click="emit('write')"><PenLine :size="12" :stroke-width="1.5" aria-hidden="true" />Write an answer</Button>
</template>

<style>
.ds-written { display: flex; gap: var(--ds-space-xl); padding: var(--ds-space-lg) var(--ds-space-xl); border-left: var(--ds-border-focus) solid var(--ds-color-edge-accent); background: var(--ds-color-surface-subtle); }
.ds-written .ds-matrix i { background: var(--ds-color-edge-accent); }
.ds-written-page { display: flex; width: 132px; flex-shrink: 0; flex-direction: column; gap: var(--ds-space-sm); margin: 0; }
@media (max-width: 767px) { .ds-written { flex-direction: column; } }
</style>
