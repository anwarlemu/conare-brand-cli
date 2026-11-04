<script setup lang="ts">
import { ref, watch } from 'vue'
import { Check, ChevronDown, Minus, Search, X } from 'lucide-vue-next'
import Button from '@/components/ui/Button.vue'
import Table from '@/components/ui/Table.vue'
import DownloadMark from '@/components/product/DownloadMark.vue'

// Every search, newest first (searches/Log.vue with the Simple detail): the question, the agent, the outcome in
// Performance's words, the time and when, twelve at a time. A row opens in place under itself (180ms both ways on
// the strong ease-out, what's inside fading in and settling 4px), holding what came back: each passage's sentence
// with the part that answers in ink, its document to download, why a search went wrong and what to do about it.
export type SearchOutcome = 'strong' | 'weak' | 'none' | 'failed'
export interface SearchPassage { id: string, namespace: string, text: string, key: string }
export interface SearchRow { id: string, when: string, question: string, agent: string, outcome: SearchOutcome, tookMs: number, passages: SearchPassage[], why?: string, fix?: { action: string } }
const OUTCOME: Record<SearchOutcome, string> = { strong: 'Strong answer', weak: 'Weak match', none: 'Nothing found', failed: 'Failed' }
const props = withDefaults(defineProps<{ rows: SearchRow[], page?: number }>(), { page: 12 })
const emit = defineEmits<{ download: [passage: SearchPassage], fix: [row: SearchRow], search: [question: string] }>()
const open = ref('')
const shown = ref(props.page)
watch(() => props.rows, () => { open.value = ''; shown.value = props.page })
const toggle = (id: string) => { open.value = open.value === id ? '' : id }
const took = (ms: number) => (ms >= 1000 ? `${(ms / 1000).toFixed(1)} s` : `${ms} ms`)
const parts = (p: SearchPassage) => {
  const at = p.text.indexOf(p.key)
  return at < 0 ? [p.text, '', ''] : [p.text.slice(0, at), p.key, p.text.slice(at + p.key.length)]
}
</script>

<template>
  <div class="overflow-hidden border border-edge bg-surface">
    <Table>
      <thead class="max-sm:sr-only"><tr><th scope="col">Question</th><th scope="col" class="w-40 max-lg:hidden">Agent</th><th scope="col" class="w-44 max-md:hidden">Outcome</th><th scope="col" class="w-20 text-right max-md:hidden">Time</th><th scope="col" class="w-24 text-right max-lg:hidden">When</th><th scope="col" class="w-8"><span class="sr-only">Open</span></th></tr></thead>
      <tbody>
        <template v-for="r in rows.slice(0, shown)" :key="r.id">
          <tr class="is-link" @click="toggle(r.id)">
            <td class="max-w-0 max-sm:w-full">
              <button type="button" class="block w-full truncate text-left focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-edge-focus max-sm:whitespace-normal" :class="{ 'whitespace-normal': open === r.id }" :aria-expanded="open === r.id" :aria-controls="`search-${r.id}`" @click.stop="toggle(r.id)">{{ r.question }}</button>
              <span class="block truncate type-meta text-fg-muted lg:hidden">{{ r.agent }}, {{ r.when }}</span>
            </td>
            <td class="max-w-0 truncate max-lg:hidden">{{ r.agent }}</td>
            <td class="whitespace-nowrap max-md:hidden">
              <span class="inline-flex items-center gap-1.5" :class="r.outcome !== 'strong' && 'text-home-red-press'">
                <Check v-if="r.outcome === 'strong'" :size="12" :stroke-width="2" aria-hidden="true" class="shrink-0" />
                <Minus v-else-if="r.outcome === 'weak'" :size="12" :stroke-width="2" aria-hidden="true" class="shrink-0" />
                <X v-else :size="12" :stroke-width="2" aria-hidden="true" class="shrink-0" />{{ OUTCOME[r.outcome] }}
              </span>
            </td>
            <td class="text-right tabular-nums max-md:hidden">{{ took(r.tookMs) }}</td>
            <td class="text-right text-fg-muted max-lg:hidden">{{ r.when }}</td>
            <td class="text-right"><ChevronDown :size="14" :stroke-width="1.5" class="ds-slog-chev inline text-fg-muted" :data-open="open === r.id || undefined" aria-hidden="true" /></td>
          </tr>
          <Transition name="ds-slog" :duration="180">
            <tr v-if="open === r.id" :id="`search-${r.id}`" class="ds-slog-open">
              <td colspan="6">
                <div class="ds-slog-grow"><div>
                  <div class="flex flex-col gap-3 px-4 pt-3 pb-4">
                    <p v-if="r.why">{{ r.why }}</p>
                    <ul v-if="r.passages.length" class="flex flex-col gap-2">
                      <li v-for="p in r.passages" :key="p.id" class="flex items-center justify-between gap-6 text-fg-soft max-sm:flex-col max-sm:items-start max-sm:gap-0.5">
                        <p class="min-w-0 flex-1">{{ parts(p)[0] }}<span class="font-medium text-fg">{{ parts(p)[1] }}</span>{{ parts(p)[2] }}</p>
                        <span class="flex shrink-0 items-center gap-1">
                          <button type="button" class="ds-slog-doc type-code-sm whitespace-nowrap" :aria-label="`download ${p.id}`" @click="emit('download', p)">{{ p.id }}</button>
                          <DownloadMark :id="p.id" @press="emit('download', p)" />
                        </span>
                      </li>
                    </ul>
                    <div class="flex flex-wrap gap-2">
                      <Button v-if="r.fix" press @click="emit('fix', r)">{{ r.fix.action }}</Button>
                      <Button press @click="emit('search', r.question)"><Search :size="12" :stroke-width="1.5" aria-hidden="true" />Search it</Button>
                    </div>
                  </div>
                </div></div>
              </td>
            </tr>
          </Transition>
        </template>
      </tbody>
    </Table>
  </div>
  <button v-if="shown < rows.length" type="button" class="ds-slog-more self-start" @click="shown += page">Show {{ Math.min(page, rows.length - shown) }} more</button>
</template>

<style>
.ds-slog-open > td { height: 0 !important; max-width: 0; padding: 0 !important; background: var(--ds-color-surface-subtle); white-space: normal; }
.ds-slog-open p { margin: 0; }
.ds-slog-grow { display: grid; grid-template-rows: 1fr; }
.ds-slog-grow > div { min-width: 0; min-height: 0; }
:is(.ds-slog-enter-from, .ds-slog-leave-to) .ds-slog-grow { grid-template-rows: 0fr; }
:is(.ds-slog-enter-active, .ds-slog-leave-active) .ds-slog-grow { transition: grid-template-rows var(--ds-duration-slide) var(--ds-easing-out); }
:is(.ds-slog-enter-active, .ds-slog-leave-active) .ds-slog-grow > div { overflow: hidden; }
.ds-slog-enter-active .ds-slog-grow > div { transition: opacity var(--ds-duration-micro) var(--ds-easing-out), transform var(--ds-duration-slide) var(--ds-easing-out); }
.ds-slog-leave-active .ds-slog-grow > div { transition: opacity var(--ds-duration-cell) var(--ds-easing-out); }
.ds-slog-enter-from .ds-slog-grow > div { opacity: 0; transform: translateY(-4px); }
.ds-slog-leave-to .ds-slog-grow > div { opacity: 0; }
/* The chevron turns with the row: 180ms opening, 120ms closing, from where it is. */
.ds-slog-chev { transition: rotate var(--ds-duration-micro) var(--ds-easing-out), color var(--ds-duration-micro) var(--ds-easing-standard); }
.ds-slog-chev[data-open] { rotate: 180deg; transition-duration: var(--ds-duration-slide), var(--ds-duration-micro); }
@media (hover: hover) and (pointer: fine) { tr.is-link:hover .ds-slog-chev { color: var(--ds-color-fg); } }
.ds-slog-doc { text-decoration: underline; text-decoration-color: var(--ds-color-edge-strong); text-underline-offset: 3px; transition: text-decoration-color var(--ds-duration-micro) var(--ds-easing-standard); }
@media (hover: hover) and (pointer: fine) { .ds-slog-doc:hover { text-decoration-color: var(--ds-color-fg); } }
.ds-slog-more { position: relative; margin-left: 4px; color: var(--ds-color-fg-soft); font-size: var(--ds-text-meta); font-weight: var(--ds-font-weight-medium); line-height: var(--ds-text-meta-leading); white-space: nowrap; cursor: pointer; transition: color var(--ds-duration-micro) var(--ds-easing-standard); }
.ds-slog-more::after { position: absolute; inset: -12px; content: ""; }
@media (hover: hover) and (pointer: fine) { .ds-slog-more:hover { color: var(--ds-color-fg); } }
.ds-slog-more:focus-visible, .ds-slog-doc:focus-visible { outline: var(--ds-border-focus) solid var(--ds-color-edge-focus); outline-offset: 2px; }
@media (prefers-reduced-motion: reduce) {
  :is(.ds-slog-enter-active, .ds-slog-leave-active) :is(.ds-slog-grow, .ds-slog-grow > div), .ds-slog-chev { transition: none; }
}
</style>
