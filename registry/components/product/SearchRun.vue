<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import CodePop from '@/components/ui/CodePop.vue'
import type { SearchResult } from '@/composables/useSearchResults'

// A search on the request's clock (SearchRun.vue), the website's demo window in the console's light colours:
// "Searching" shimmers over the namespaces it reads while cells of the index flicker. When the answer is in, "Found in"
// takes its place, the namespaces that held a result keep a red square and the rest step back, each document found
// lights as a red square on the index, and the count reads "4 of 2,749,690 documents", with when it finished and the
// API's time. Each square names its document when pointed at or focused, and a press emits `reveal` with its key (for
// SearchResults to show it). `nsHref` makes each namespace a link once the answer is in; `code` (the request as the
// app would send it) puts Show code (code-pop) at the end of the footer, opening under it. It follows the request:
// never fake a delay.
const props = defineProps<{
  searching: boolean
  answer: { results: SearchResult[], took_ms: number } | null
  namespaces: Array<{ name: string, documents: number }>
  ns?: string
  logoOf?: (namespace: string) => string | null | undefined
  nsHref?: (namespace: string) => string
  code?: string
}>()
const emit = defineEmits<{ reveal: [key: string] }>()

const fmt = (n: number) => n.toLocaleString('en-US')
const logo = (ns: string) => props.logoOf?.(ns) ?? null
const read = computed(() => {
  const all = props.namespaces.filter(n => n.documents > 0).sort((a, b) => b.documents - a.documents)
  return props.ns ? all.filter(n => n.name === props.ns) : all
})
const shown = computed(() => read.value.slice(0, 4))
const more = computed(() => read.value.length - shown.value.length)
const total = computed(() => read.value.reduce((a, n) => a + n.documents, 0))
const hitNs = computed(() => new Set((props.answer?.results ?? []).map(r => r.namespace)))
const found = computed(() => !props.searching && !!props.answer)

// Where a cell lights: a small hash, so a document keeps its place.
function hash(text: string) {
  let h = 2166136261
  for (let i = 0; i < text.length; i++) h = Math.imul(h ^ text.charCodeAt(i), 16777619)
  return (h >>> 0) / 4294967296
}
const cell = (x: number, y: number) => ({ left: `round(down, ${(x * 100).toFixed(2)}%, 5px)`, top: `${Math.floor(y * 3) * 5}px` })
const sparks = Array.from({ length: 36 }, (_, k) => ({ id: k, style: { ...cell(hash(`s${k}x`), hash(`s${k}y`)), '--s': Math.floor(hash(`s${k}t`) * 900) } }))
// Each found document takes a slot of its own across the field, at a height its id picks, so their 24px targets
// never overlap.
const hits = computed(() => {
  const results = props.answer?.results ?? []
  const n = Math.max(1, results.length)
  const order = results.map((r, k) => ({ r, k })).sort((a, b) => hash(a.r.id) - hash(b.r.id))
  return order.map(({ r, k }, slot) => {
    const x = 0.04 + ((slot + 0.25 + hash(`${r.id}x`) * 0.5) / n) * 0.9
    return { key: `${r.namespace}/${r.id}`, id: r.id, ns: r.namespace ?? props.ns, x, style: { ...cell(x, hash(`${r.id}y`) * 0.8), '--s': 80 + k * 70 } }
  })
})
const tip = ref<(typeof hits.value)[number] | null>(null)

const doneAt = ref('')
watch(found, (f) => {
  if (f) doneAt.value = new Date().toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })
}, { immediate: true })
</script>

<template>
  <section data-ds="search-run" class="ds-run flex flex-col gap-2" :data-found="found || undefined" aria-label="search progress">
    <div class="flex flex-wrap items-center gap-x-3 gap-y-2">
      <span class="grid type-meta" role="status">
        <span v-if="!found" class="ds-run-shimmer [grid-area:1/1]">Searching</span>
        <span v-else class="ds-run-in text-fg-muted [grid-area:1/1]">Found in</span>
      </span>
      <span class="flex flex-wrap items-center gap-x-3 gap-y-2">
        <component :is="found && nsHref ? 'a' : 'span'" v-for="n in shown" :key="n.name" :href="found && nsHref ? nsHref(n.name) : undefined" class="ds-runchip" :class="{ 'ds-runchip-link': found && nsHref }" :data-hit="found && hitNs.has(n.name) ? 'true' : found ? 'false' : undefined">
          <img v-if="logo(n.name)" :src="logo(n.name)!" alt="" width="12" height="12" class="size-2.5 shrink-0 object-contain">
          <span class="type-code-sm">{{ n.name }}</span>
          <span v-if="found && hitNs.has(n.name)" class="ds-runchip-mark" aria-hidden="true" /><span v-if="found && hitNs.has(n.name)" class="sr-only">, has results</span>
        </component>
        <span v-if="more > 0" class="ds-runchip" :data-hit="found ? 'false' : undefined">+{{ more }} more</span>
      </span>
    </div>
    <div class="relative mt-1">
      <div class="ds-index">
        <template v-if="!found"><i v-for="s in sparks" :key="s.id" class="ds-flick" :style="s.style" aria-hidden="true" /></template>
        <button
          v-for="h in hits"
          v-else
          :key="h.key"
          type="button"
          class="ds-hitbtn"
          :style="h.style"
          :aria-label="`${h.id} in ${h.ns}, show it`"
          @pointerenter="tip = h"
          @pointerleave="tip = null"
          @focus="tip = h"
          @blur="tip = null"
          @click="emit('reveal', h.key)"
        ><i class="ds-hit" aria-hidden="true" /></button>
      </div>
      <p v-if="tip" class="ds-hit-tip" :style="{ left: `clamp(0px, calc(${(tip.x * 100).toFixed(2)}% - 12px), calc(100% - 220px))` }" aria-hidden="true"><span class="type-code-sm truncate">{{ tip.id }}</span><span class="text-ds-neutral-500">{{ tip.ns }}</span></p>
    </div>
    <div class="flex flex-wrap items-center gap-x-3 gap-y-1 type-meta text-fg-muted tabular-nums">
      <template v-if="!found">Searching<template v-if="total"> {{ fmt(total) }}</template> documents</template>
      <template v-else>
        <span class="ds-run-in"><span class="text-home-red-press">{{ answer!.results.length }}</span><template v-if="total"> of {{ fmt(total) }}</template> documents</span>
        <span class="ds-run-in">Done {{ doneAt }}</span>
        <span class="ds-run-in">{{ answer!.took_ms }} ms</span>
        <CodePop v-if="code && answer!.results.length" :code="code" />
      </template>
    </div>
  </section>
</template>

<style>
/* The namespaces read, as quiet words: those that held a result keep a red square, the rest step back. */
.ds-runchip { display: inline-flex; align-items: center; gap: var(--ds-space-xs); color: var(--ds-color-fg-soft); font-size: var(--ds-text-meta); line-height: var(--ds-text-meta-leading); white-space: nowrap; transition: color var(--ds-duration-micro) var(--ds-easing-standard); }
.ds-runchip img { transition: opacity var(--ds-duration-enter) var(--ds-easing-standard); }
.ds-runchip[data-hit="false"] { color: var(--ds-color-fg-muted); }
.ds-runchip[data-hit="false"] img { opacity: 0.5; }
.ds-runchip-mark { width: 4px; height: 4px; flex-shrink: 0; background: var(--ds-color-edge-accent); }
/* Small to the eye, 24px to the pointer. */
.ds-runchip-link { margin-block: -4px; padding-block: 4px; }
@media (hover: hover) and (pointer: fine) { .ds-runchip-link:hover { color: var(--ds-color-fg); } }
.ds-runchip-link:focus-visible { outline: var(--ds-border-focus) solid var(--ds-color-edge-accent); outline-offset: 1px; }
/* Searching: light running across the word (.v2-shimmer). */
.ds-run-shimmer { background: linear-gradient(90deg, var(--ds-color-neutral-400) 30%, var(--ds-color-neutral-700) 50%, var(--ds-color-neutral-400) 70%) 0 0 / 300% 100%; -webkit-background-clip: text; background-clip: text; color: transparent; animation: ds-run-shimmer 1400ms linear infinite; }
@keyframes ds-run-shimmer { from { background-position: 100% 0; } to { background-position: 0 0; } }
/* The index: a field of 3px cells on a 5px pitch drawn by a mask over one fill. Cells flicker while it searches;
   each document found is a 2 by 2 block of them, in red, so it sits on the field's grid. */
.ds-index { position: relative; height: 19px; overflow: hidden; }
.ds-run[data-found] .ds-index { overflow: visible; }
.ds-index::before, .ds-hit {
  -webkit-mask-image: linear-gradient(90deg, var(--ds-color-off-black) 3px, transparent 3px), linear-gradient(var(--ds-color-off-black) 3px, transparent 3px);
  mask-image: linear-gradient(90deg, var(--ds-color-off-black) 3px, transparent 3px), linear-gradient(var(--ds-color-off-black) 3px, transparent 3px);
  -webkit-mask-size: 5px 5px;
  mask-size: 5px 5px;
  -webkit-mask-composite: source-in;
  mask-composite: intersect;
}
.ds-index::before { position: absolute; inset: 0; background: var(--ds-color-neutral-700); content: ""; opacity: 0.6; }
.ds-flick { position: absolute; z-index: 1; width: 3px; height: 3px; background: var(--ds-color-neutral-400); opacity: 0; animation: ds-flick 900ms var(--ds-easing-standard) infinite; animation-delay: calc(var(--s) * 1ms); }
@keyframes ds-flick { 0%, 18%, 100% { opacity: 0; } 6% { opacity: 1; } }
.ds-hitbtn { position: absolute; z-index: 2; display: grid; width: 24px; height: 24px; margin: -8px 0 0 -8px; padding: 0; place-items: center; cursor: pointer; }
.ds-hit { position: static; display: block; width: 8px; height: 8px; background: var(--ds-color-edge-accent); animation: ds-hit-in var(--ds-duration-glide) steps(1, end) calc(var(--s) * 1ms) both; transition: transform var(--ds-duration-micro) var(--ds-easing-standard); }
@keyframes ds-hit-in { from { opacity: 0; } }
@media (hover: hover) and (pointer: fine) { .ds-hitbtn:hover .ds-hit { transform: scale(1.25); } }
.ds-hitbtn:focus-visible { outline: var(--ds-border-focus) solid var(--ds-color-off-black); outline-offset: 2px; }
.ds-hit-tip { position: absolute; top: calc(100% + 6px); z-index: 5; display: flex; max-width: 240px; flex-direction: column; gap: var(--ds-space-2xs); padding: var(--ds-space-sm) var(--ds-space-md); background: var(--ds-color-surface-inverse); color: var(--ds-color-off-white); font-size: var(--ds-text-meta); line-height: var(--ds-text-meta-leading); pointer-events: none; }
/* What the answer brings in. */
.ds-run-in { animation: ds-run-in var(--ds-duration-enter) var(--ds-easing-out) both; }
@keyframes ds-run-in { from { opacity: 0; transform: translateY(4px); } }
@media (prefers-reduced-motion: reduce) {
  .ds-flick, .ds-hit, .ds-run-in, .ds-run-shimmer { animation: none; }
  .ds-run-shimmer { color: var(--ds-color-fg-muted); }
  .ds-flick { opacity: 0.6; }
  .ds-hit { transition: none; }
}
</style>
