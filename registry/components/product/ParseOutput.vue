<script setup lang="ts">
import { computed, ref } from 'vue'
import ParseRead from '@/components/product/ParseRead.vue'
import type { ParseAnswer } from '@/composables/useParse'

// What was read, on the dark window (parse/Output.vue): as text, as Markdown or as the API's JSON, picked by line tabs
// whose red underline draws from the left. The text and the page beside it point at each other.
const props = defineProps<{ answer: ParseAnswer, on?: number | null, plays?: boolean }>()
defineEmits<{ point: [order: number | null], pick: [order: number] }>()
const TABS = [{ id: 'text', label: 'Text' }, { id: 'markdown', label: 'Markdown' }, { id: 'json', label: 'JSON' }] as const
const tab = ref<typeof TABS[number]['id']>('text')
const json = computed(() => JSON.stringify({ id: props.answer.id, state: 'done', name: props.answer.name, pages: props.answer.pages, parts: [{ page: props.answer.part.page, ocr: props.answer.part.ocr, confidence: props.answer.part.confidence, blocks: props.answer.part.blocks }] }, null, 2))
</script>

<template>
  <div data-ds="parse-output" class="flex min-h-0 flex-1 flex-col">
    <div class="flex gap-4 border-b border-code-edge px-4" role="tablist" aria-label="what was read">
      <button v-for="t in TABS" :key="t.id" type="button" role="tab" class="ds-parsetab" :aria-selected="tab === t.id" @click="tab = t.id">{{ t.label }}</button>
    </div>
    <ParseRead v-if="tab === 'text'" role="tabpanel" class="min-h-0 flex-1 overflow-auto p-2" :part="answer.part" :on="on" :plays="plays" @point="$emit('point', $event)" @pick="$emit('pick', $event)" />
    <pre v-else class="m-0 min-h-0 flex-1 overflow-auto p-4 font-code text-meta leading-4.5 whitespace-pre" tabindex="0" role="tabpanel">{{ tab === 'markdown' ? answer.markdown : json }}</pre>
  </div>
</template>

<style>
.ds-parsetab { position: relative; padding: 10px 0; color: var(--ds-color-code-muted); font-size: var(--ds-text-meta); line-height: var(--ds-text-meta-leading); cursor: pointer; touch-action: manipulation; transition: color var(--ds-duration-micro) var(--ds-easing-standard); }
.ds-parsetab::after { position: absolute; inset: auto 0 -1px; height: 1px; background: var(--ds-color-surface-accent); content: ""; transform: scaleX(0); transform-origin: left; transition: transform var(--ds-duration-glide) var(--ds-easing-out); }
.ds-parsetab[aria-selected="true"] { color: var(--ds-color-code-fg); }
.ds-parsetab[aria-selected="true"]::after { transform: scaleX(1); }
.ds-parsetab:focus-visible { outline: var(--ds-border-focus) solid var(--ds-color-edge-accent); outline-offset: -2px; }
@media (hover: hover) and (pointer: fine) { .ds-parsetab:hover { color: var(--ds-color-code-fg); } }
@media (pointer: coarse), (max-width: 767px) { .ds-parsetab { min-width: 40px; min-height: 40px; } }
@media (prefers-reduced-motion: reduce) { .ds-parsetab::after { transition: none; } }
</style>
