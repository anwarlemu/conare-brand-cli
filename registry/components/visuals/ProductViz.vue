<script setup lang="ts">
import VizWindow from '@/components/visuals/VizWindow.vue'

// A product as a small window (the website's ProductViz.vue), told on the quickstart's case: search (a question and its
// best passage), sync (a source writing changed issues and deleting a deleted one), parse (a runbook PDF back as
// Markdown), embed (a passage and a question as vectors, drawn as bars) and rerank (three passages, the answer moved
// first). Each carries its call's options as tags. The content is the website's illustration, fixed per `id`.
export type ProductVizId = 'search' | 'sync' | 'parse' | 'embed' | 'rerank'
defineProps<{ id: ProductVizId, active: boolean }>()

const TITLES: Record<ProductVizId, string> = { search: 'POST /namespaces/docs/query', sync: 'Source Linear', parse: 'POST /parse', embed: 'POST /v1/embeddings', rerank: 'POST /v1/rerank' }
// An embedding's first values, drawn as bars of their size: the shape of a vector, not its numbers.
const vector = [0.62, 0.36, 0.09, 0.48, 0.21]
const synced = [
  { id: 'ENG-212 Key rotation fails in EU', result: 'Updated' },
  { id: 'ENG-219 Add rollback runbook', result: 'Created' },
  { id: 'ENG-180 Checkout timeouts', result: 'Updated' },
  { id: 'ENG-97 Old signing key', result: 'Deleted', gone: true },
]
// Found in one order, reranked into another (rows' places before and after).
const ranked = [
  { text: 'EU checkout broke after a key rotation.', from: 1, to: 0 },
  { text: 'Checkout runs in three regions.', from: 0, to: 1 },
  { text: 'Rotate keys from the console.', from: 2, to: 2 },
]
const syncedStyles = synced.map((_, i) => ({ '--d': 500 + i * 300 }))
const vectorRows = vector.map((v, i) => ({ v, row: { '--d': 500 + i * 120 }, bar: { '--w': v, '--d': 600 + i * 120 } }))
const rankedStyles = ranked.map(r => ({ '--from': r.from, '--to': r.to, '--d': 600 + r.from * 120, '--track': '32px' }))
</script>

<template>
  <VizWindow data-ds="product-viz" :active="active" size="sm" class="max-w-75">
    <template #title>
      <span class="truncate text-caption text-ds-neutral-600">{{ TITLES[id] }}</span>
    </template>

    <div class="flex flex-col gap-2 px-3 pt-0.5 pb-3 text-meta">
      <!-- Search: the ask with its filter, the reranked results, the timing. -->
      <template v-if="id === 'search'">
        <p class="ds-viz-in bg-ds-neutral-200 px-2.5 py-2" style="--d: 200">Why did checkout break?</p>
        <p class="ds-viz-in flex flex-wrap gap-1.5" style="--d: 400">
          <span class="ds-viz-tag">Filter Team payments</span><span class="ds-viz-tag">Top 5</span><span class="ds-viz-tag">Vector and keyword</span>
        </p>
        <div class="border border-ds-neutral-300">
          <p class="ds-viz-in flex items-center gap-2 border-b border-ds-neutral-300 px-2.5 py-2" style="--d: 700">
            <span class="ds-viz-dot bg-home-red" />
            <span class="min-w-0 flex-1 truncate">EU checkout broke after a key rotation.</span>
            <span class="text-ds-neutral-500 tabular-nums">0.91</span>
          </p>
          <p class="ds-viz-in flex items-center gap-2 border-b border-ds-neutral-300 px-2.5 py-2 text-ds-neutral-500" style="--d: 850">
            <span class="ds-viz-dot bg-ds-neutral-500" />
            <span class="min-w-0 flex-1 truncate">Rotate keys from the console.</span>
          </p>
          <p class="ds-viz-in flex items-center gap-2 px-2.5 py-2 text-ds-neutral-500" style="--d: 1000">
            <span class="ds-viz-dot bg-ds-neutral-500" />
            <span class="min-w-0 flex-1 truncate">Checkout runs in three regions.</span>
          </p>
        </div>
        <p class="ds-viz-in flex justify-between text-caption text-ds-neutral-500" style="--d: 1300">
          <span>Reranked</span><span class="tabular-nums">Took 62 ms</span>
        </p>
      </template>

      <!-- Sync: a run writing what changed and deleting what went, with its progress and the next run. -->
      <template v-else-if="id === 'sync'">
        <p class="ds-viz-in flex items-center justify-between text-caption text-ds-neutral-500" style="--d: 200">
          Namespace Eng
          <span class="grid">
            <span class="ds-viz-swap-a [grid-area:1/1] bg-ds-neutral-200 px-1.5 text-caption leading-4.5 text-ds-neutral-400" style="--d: 1900">Syncing</span>
            <span class="ds-viz-swap-b [grid-area:1/1] bg-home-red px-1.5 text-caption leading-4.5 text-off-white" style="--d: 1900">Synced</span>
          </span>
        </p>
        <div class="border border-ds-neutral-300">
          <p v-for="(r, i) in synced" :key="r.id" class="ds-viz-in flex items-center gap-2 border-b border-ds-neutral-300 px-2.5 py-2 last:border-b-0" :style="syncedStyles[i]">
            <span class="ds-viz-dot" :class="r.gone ? 'bg-ds-neutral-500' : 'bg-home-red'" />
            <span class="min-w-0 flex-1 truncate" :class="r.gone && 'text-ds-neutral-500 line-through'">{{ r.id }}</span>
            <span class="text-ds-neutral-500">{{ r.result }}</span>
          </p>
        </div>
        <p class="ds-viz-in flex items-center gap-2 text-caption text-ds-neutral-500" style="--d: 600">
          <span class="h-0.5 flex-1 bg-ds-neutral-300"><span class="ds-viz-bar block h-full bg-off-white" style="--w: 1; --d: 600" /></span>
          <span class="tabular-nums">4 records</span>
        </p>
        <p class="ds-viz-in text-caption text-ds-neutral-500" style="--d: 2100">Next sync in 15 min, picked by Conare</p>
      </template>

      <!-- Parse: the file's facts, then its Markdown. -->
      <template v-else-if="id === 'parse'">
        <p class="ds-viz-in flex items-center gap-2 text-caption text-ds-neutral-500" style="--d: 200">
          <svg width="10" height="12" viewBox="0 0 10 12" aria-hidden="true"><path d="M.5.5h6l3 3v8H.5z" fill="none" stroke="currentColor" /></svg>
          <span class="text-ds-neutral-600">Runbook.pdf</span> to Markdown
        </p>
        <p class="ds-viz-in flex flex-wrap gap-1.5" style="--d: 400">
          <span class="ds-viz-tag">12 pages</span><span class="ds-viz-tag">Scans read by OCR</span><span class="ds-viz-tag">Stores nothing</span>
        </p>
        <div class="border border-ds-neutral-300 px-2.5 py-2 text-caption leading-5">
          <p class="ds-viz-in" style="--d: 600"><span class="text-red-lift"># </span>Key rotation</p>
          <p class="ds-viz-in text-ds-neutral-600" style="--d: 750">Rotate the signing key every 90 days.</p>
          <p class="ds-viz-in" style="--d: 900"><span class="text-red-lift">## </span>Rollback</p>
          <p class="ds-viz-in text-ds-neutral-600" style="--d: 1050">Restore the previous key from the vault.</p>
          <p class="ds-viz-in text-ds-neutral-500" style="--d: 1200"><span class="text-red-lift">| </span>EU <span class="text-red-lift">| </span>Payments <span class="text-red-lift">|</span></p>
        </div>
      </template>

      <!-- Embed: a passage and a query, each as its first values. -->
      <template v-else-if="id === 'embed'">
        <p class="ds-viz-in flex items-center justify-between gap-2" style="--d: 200">
          <span class="min-w-0 flex-1 truncate bg-ds-neutral-200 px-2.5 py-2">EU checkout broke after a key rotation.</span>
          <span class="ds-viz-tag">Document</span>
        </p>
        <div class="border border-ds-neutral-300 px-2.5 py-2">
          <p v-for="(row, i) in vectorRows" :key="row.v" class="ds-viz-in flex items-center gap-2 text-caption tabular-nums" :style="row.row">
            <span class="w-6 shrink-0 text-ds-neutral-500">{{ i + 1 }}</span>
            <span class="h-0.5 flex-1 bg-ds-neutral-300"><span class="ds-viz-bar block h-full bg-off-white" :style="row.bar" /></span>
          </p>
          <p class="ds-viz-in text-caption text-ds-neutral-500" style="--d: 1100">And 1,019 more</p>
        </div>
        <p class="ds-viz-in flex items-center justify-between gap-2" style="--d: 1300">
          <span class="min-w-0 flex-1 truncate bg-ds-neutral-200 px-2.5 py-2">Why did checkout break?</span>
          <span class="ds-viz-tag">Query</span>
        </p>
        <p class="ds-viz-in flex justify-between text-caption text-ds-neutral-500" style="--d: 1500">
          <span>conare-embed-1, 1,024 dimensions</span><span>OpenAI-compatible</span>
        </p>
      </template>

      <!-- Rerank: three passages, the answer moved first on a 32px track. -->
      <template v-else>
        <p class="ds-viz-in bg-ds-neutral-200 px-2.5 py-2" style="--d: 200">Why did checkout break?</p>
        <p class="ds-viz-in flex flex-wrap gap-1.5" style="--d: 400">
          <span class="ds-viz-tag">3 documents</span><span class="ds-viz-tag">Top 1</span>
        </p>
        <!-- Three 32px rows plus the box's 2px of border, so none is clipped. -->
        <div class="relative h-[98px] border border-ds-neutral-300">
          <div
            v-for="(r, i) in ranked"
            :key="r.text"
            class="ds-viz-row absolute inset-x-0 top-0 flex h-8 items-center gap-2 border-b border-ds-neutral-300 bg-ds-neutral-100 px-2.5 last:border-b-0"
            :style="rankedStyles[i]"
          >
            <span class="ds-viz-dot" :class="r.to === 0 ? 'bg-home-red' : 'bg-ds-neutral-500'" />
            <span class="min-w-0 flex-1 truncate" :class="r.to !== 0 && 'text-ds-neutral-500'">{{ r.text }}</span>
          </div>
        </div>
        <p class="ds-viz-in flex justify-between text-caption text-ds-neutral-500" style="--d: 1300">
          <span>conare-rerank-1, best first</span><span>Cohere-compatible</span>
        </p>
      </template>
    </div>
  </VizWindow>
</template>
