<script setup lang="ts">
import VizWindow from '@/components/visuals/VizWindow.vue'

// How it works' window (the website's StepViz.vue): one search shown step by step, as an agent window. The ask in a
// filled bubble, what was added to context, a status that shimmers while it works and then says how it went, the
// outcome as a sentence with the records it touched as inline chips, and a progress row with the dot matrix and a
// ticking timer. Steps: 0 write, 1 sync a source, 2 search (results land where they were found, then glide to the
// reranked order), 3 an agent over MCP. One window for every step: picking one keeps the window and crossfades what is
// in it, every step's body in one grid cell so the window never resizes; `runs` re-keys the picked body, replaying it.
const props = defineProps<{ step: number, runs: number[], active: boolean }>()

const windows = [
  { name: 'Conare', tag: 'Write', ask: 'Add our refund and shipping policies to docs', context: 'Policies.pdf', working: 'Writing', took: 'Worked for 2s' },
  { name: 'Conare', tag: 'Source', ask: 'Keep HubSpot in sync with CRM', context: 'HubSpot', working: 'Syncing', took: 'Synced 3 records' },
  { name: 'Conare', tag: 'Search', ask: 'How do refunds work?', context: 'Docs', working: 'Searching', took: 'Reranked in 62 ms' },
  { name: 'Your agent', tag: 'MCP', ask: 'How do refunds work?', context: 'Conare', working: 'Thinking', took: 'Worked for 1s' },
]

// Found in one order, shown after the rerank in another: `from` and `to` are each row's place before and after.
const results = [
  { id: 'Refunds', text: 'Refunds are available for 30 days.', score: '0.91', from: 2, to: 0 },
  { id: 'Returns', text: 'Return an item from your orders page.', score: '0.47', from: 0, to: 1 },
  { id: 'Shipping', text: 'Orders ship within two days.', score: '0.12', from: 1, to: 2 },
].map(r => ({ ...r, row: { '--from': r.from, '--to': r.to, '--d': 1200 + r.from * 160 }, bar: { '--w': r.score, '--d': 2900 + r.to * 120 } }))

// The loader's nine squares, each blinking a beat after the last.
const MATRIX_STYLES = Array.from({ length: 9 }, (_, i) => ({ '--k': i + 1 }))
</script>

<template>
  <VizWindow :active="active" class="max-w-100">
    <template #title>
      <span class="grid">
        <span v-for="(w, i) in windows" :key="w.tag" class="ds-viz-title flex items-center gap-2 whitespace-nowrap [grid-area:1/1]" :data-active="i === props.step">
          <span class="text-ui leading-4">{{ w.name }}</span>
          <span class="bg-neutral-200 px-1.5 py-0.5 text-caption text-neutral-500">{{ w.tag }}</span>
        </span>
      </span>
    </template>

    <div class="grid grid-cols-[minmax(0,1fr)]">
      <div v-for="(w, k) in windows" :key="w.tag" class="ds-viz-body [grid-area:1/1]" :data-active="k === props.step" :inert="k !== props.step">
        <div :key="`${k}-${props.runs[k] ?? 0}`" class="ds-viz flex flex-col gap-3 px-4 pt-1 pb-4" :data-active="active">
          <!-- The ask, and what came with it. -->
          <p class="ds-viz-in ml-10 bg-neutral-200 px-3 py-2.5 text-ui" style="--d: 200">{{ w.ask }}</p>
          <p class="ds-viz-in flex items-center justify-end gap-1.5 text-meta text-neutral-500" style="--d: 600">
            <svg width="12" height="12" viewBox="0 0 12 12" aria-hidden="true"><rect x="0.5" y="0.5" width="11" height="11" fill="none" stroke="currentColor" /><rect x="3" y="3" width="3" height="6" fill="currentColor" /></svg>
            <span class="text-neutral-600">{{ w.context }}</span> added to context
          </p>

          <!-- Status: shimmers while it works, then says how it went. -->
          <p class="ds-viz-in grid text-meta" style="--d: 900">
            <span class="ds-viz-swap-a ds-viz-shimmer [grid-area:1/1]" style="--d: 2400">{{ w.working }}…</span>
            <span class="ds-viz-swap-b [grid-area:1/1] text-neutral-500" style="--d: 2400">{{ w.took }} <span class="ds-step-play">▶</span></span>
          </p>

          <!-- Write -->
          <template v-if="k === 0">
            <p class="ds-viz-in text-ui leading-6" style="--d: 1300">
              Wrote <span class="ds-viz-chip"><span class="ds-viz-dot bg-home-red" />Refunds</span> and <span class="ds-viz-chip"><span class="ds-viz-dot bg-home-red" />Shipping</span> to the docs namespace, searchable now.
            </p>
            <div class="ds-viz-in ds-viz-progress" style="--d: 1600">
              <span class="ds-viz-matrix" aria-hidden="true"><i v-for="m in 9" :key="m" :style="MATRIX_STYLES[m - 1]" /></span>
              <span class="grid flex-1">
                <span class="ds-viz-swap-a [grid-area:1/1]" style="--d: 2400">Writing 2 documents…</span>
                <span class="ds-viz-swap-b [grid-area:1/1] text-neutral-500" style="--d: 2400">2 documents created</span>
              </span>
              <span class="ds-viz-timer" style="--to: 2; --d: 1600" />
            </div>
          </template>

          <!-- Sync -->
          <template v-else-if="k === 1">
            <p class="ds-viz-in text-ui leading-6" style="--d: 1300">
              Updated <span class="ds-viz-chip"><span class="ds-viz-dot bg-home-red" />Deal 4821</span>, created <span class="ds-viz-chip"><span class="ds-viz-dot bg-home-red" />Deal 4830</span> and deleted <span class="ds-viz-chip"><span class="ds-viz-dot bg-neutral-500" /><span class="line-through">Contact 913</span></span>.
            </p>
            <div class="ds-viz-in ds-viz-progress" style="--d: 1600">
              <span class="ds-viz-matrix" aria-hidden="true"><i v-for="m in 9" :key="m" :style="MATRIX_STYLES[m - 1]" /></span>
              <span class="grid flex-1">
                <span class="ds-viz-swap-a [grid-area:1/1]" style="--d: 2400">Syncing HubSpot…</span>
                <span class="ds-viz-swap-b [grid-area:1/1] text-neutral-500" style="--d: 2400">Next sync in 15 min</span>
              </span>
              <span class="ds-viz-timer" style="--to: 4; --d: 1600" />
            </div>
          </template>

          <!-- Search: results land where they were found, then glide to the reranked order on a 48px track. -->
          <div v-else-if="k === 2" class="relative h-[146px] border border-neutral-300">
            <div v-for="r in results" :key="r.id" class="ds-viz-row absolute inset-x-0 top-0 flex h-12 items-center gap-3 border-b border-neutral-300 bg-neutral-100 px-3" :style="r.row">
              <span class="ds-viz-dot" :class="r.to === 0 ? 'bg-home-red' : 'bg-neutral-500'" />
              <span class="min-w-0 flex-1">
                <span class="block text-ui leading-4">{{ r.id }}</span>
                <span class="block truncate text-meta text-neutral-500">{{ r.text }}</span>
              </span>
              <span class="w-16 shrink-0">
                <span class="block text-right text-caption text-neutral-500 tabular-nums">{{ r.score }}</span>
                <span class="mt-1 block h-0.5 bg-neutral-300">
                  <span class="ds-viz-bar block h-full bg-off-white" :style="r.bar" />
                </span>
              </span>
            </div>
          </div>

          <!-- An agent over MCP -->
          <template v-else>
            <p class="ds-viz-in text-ui leading-6" style="--d: 1300">
              Called <span class="ds-viz-chip">Search</span> in docs. Refunds are available for 30 days.
            </p>
            <p class="ds-viz-in flex items-center gap-2 text-meta text-neutral-500" style="--d: 2600">
              Source <span class="ds-viz-chip text-off-white"><span class="ds-viz-dot bg-home-red" />Refunds</span>
            </p>
          </template>
        </div>
      </div>
    </div>
  </VizWindow>
</template>

<style>
/* The finished status's play mark, three quarters of the line's size (9px on 12px). */
.ds-step-play { font-size: 0.75em; }
</style>
