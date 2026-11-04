<script setup lang="ts">
import Count from '@/components/ui/Count.vue'

// The numbers on Explorer's first screen (search/Numbers.vue): the documents, the queries this month and the typical
// search, each leading to its page. Three takes: `strip`, a strip fixed along the board's foot (from the sidebar's
// edge; the full width on a phone); `rule`, three cells in the website's double rule with this month's queries as
// bars that rise once, today's in red; `line`, a quiet line under the box, for when the title carries the documents.
// The documents and this month's queries count up the first time they show in a session (count). Links are anchors
// with `hrefs`; `navigate` lets a router take them.
export type HomeNumbersTake = 'strip' | 'rule' | 'line'
export type HomeNumbersTarget = 'documents' | 'queries' | 'performance'
const props = withDefaults(defineProps<{
  take: HomeNumbersTake
  documents: number
  namespaces: number
  queries: number
  typical: number
  slowest: number
  days?: number[]
  hrefs?: Partial<Record<HomeNumbersTarget, string>>
  /** The bars rise as they land (the first visit of a session). */
  plays?: boolean
}>(), { days: () => [], hrefs: () => ({}), plays: true })
const emit = defineEmits<{ navigate: [target: HomeNumbersTarget, event: MouseEvent] }>()
const num = (n: number) => n.toLocaleString('en-US')
const peak = () => Math.max(1, ...props.days)
const href = (t: HomeNumbersTarget) => props.hrefs[t] ?? '#'
</script>

<template>
  <nav v-if="take === 'strip'" class="ds-homefoot" aria-label="key numbers">
    <a :href="href('documents')" @click="emit('navigate', 'documents', $event)"><span class="ds-homefoot-num"><Count :value="documents" once="home-documents" /></span> documents</a>
    <a :href="href('queries')" @click="emit('navigate', 'queries', $event)"><span class="ds-homefoot-num"><Count :value="queries" once="home-queries" /></span> queries this month</a>
    <a :href="href('performance')" @click="emit('navigate', 'performance', $event)"><span class="ds-homefoot-num">{{ typical }} ms</span> typical search</a>
  </nav>

  <section v-else-if="take === 'rule'" class="ds-homecards mx-auto w-full max-w-160" aria-label="key numbers">
    <a :href="href('documents')" @click="emit('navigate', 'documents', $event)">
      <span class="type-meta text-fg-muted">Documents</span>
      <span class="ds-homecards-num"><Count :value="documents" once="home-documents" /></span>
      <span class="type-meta text-fg-muted">In {{ namespaces }} namespaces</span>
    </a>
    <a :href="href('queries')" @click="emit('navigate', 'queries', $event)">
      <span class="type-meta text-fg-muted">Queries this month</span>
      <span class="ds-homecards-num"><Count :value="queries" once="home-queries" /></span>
      <span class="ds-homebars" :data-plays="plays || undefined" aria-hidden="true"><span v-for="(d, i) in days" :key="i" :style="{ height: `${Math.max(8, (d / peak()) * 100)}%`, '--i': i }" /></span>
    </a>
    <a :href="href('performance')" @click="emit('navigate', 'performance', $event)">
      <span class="type-meta text-fg-muted">Typical search</span>
      <span class="ds-homecards-num">{{ typical }} ms</span>
      <span class="type-meta text-fg-muted">{{ slowest }} ms for the slowest 5%</span>
    </a>
  </section>

  <p v-else class="ds-homeline">
    <a :href="href('queries')" @click="emit('navigate', 'queries', $event)">{{ num(queries) }} queries this month</a>
    <span aria-hidden="true">·</span>
    <a :href="href('performance')" @click="emit('navigate', 'performance', $event)">{{ typical }} ms typical search</a>
  </p>
</template>

<style>
.ds-homefoot { position: fixed; right: 0; bottom: 0; left: 0; z-index: 1; display: flex; justify-content: space-between; gap: var(--ds-space-md); padding: 12px 16px; border-top: var(--ds-border-hairline) solid var(--ds-color-edge); background: var(--ds-color-surface); color: var(--ds-color-fg-muted); font-size: var(--ds-text-meta); line-height: var(--ds-text-meta-leading); white-space: nowrap; }
@media (min-width: 768px) { .ds-homefoot { left: var(--ds-layout-sidebar); justify-content: center; gap: 32px; } }
.ds-homefoot a, .ds-homeline a { transition: color var(--ds-duration-micro) var(--ds-easing-standard); }
.ds-homefoot-num { color: var(--ds-color-fg); font-size: var(--ds-text-ui); font-variant-numeric: tabular-nums; }
@media (hover: hover) and (pointer: fine) { .ds-homefoot a:hover, .ds-homeline a:hover { color: var(--ds-color-fg); } }
@media (max-width: 767px) {
  .ds-homefoot a { display: inline-flex; min-height: 40px; flex-wrap: wrap; align-items: baseline; align-content: center; gap: 0 4px; white-space: normal; }
  .ds-homeline a { display: inline-flex; min-height: 40px; align-items: center; }
}
.ds-homecards { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); margin-top: 16px; border: var(--ds-border-hairline) solid var(--ds-color-edge); outline: var(--ds-border-hairline) solid var(--ds-color-edge); outline-offset: 4px; }
.ds-homecards > a { display: flex; min-width: 0; flex-direction: column; gap: var(--ds-space-xs); padding: 12px; transition: background-color var(--ds-duration-micro) var(--ds-easing-standard); }
.ds-homecards > a + a { border-left: var(--ds-border-hairline) solid var(--ds-color-edge); }
.ds-homecards > a:active { background: color-mix(in srgb, var(--ds-color-fg) 8%, var(--ds-color-surface-subtle)); }
@media (hover: hover) and (pointer: fine) { .ds-homecards > a:hover { background: var(--ds-color-surface-subtle); } }
.ds-homecards > a:focus-visible, .ds-homefoot a:focus-visible, .ds-homeline a:focus-visible { outline: var(--ds-border-focus) solid var(--ds-color-edge-focus); outline-offset: -2px; }
.ds-homecards .type-meta { text-wrap: balance; }
.ds-homecards-num { font-family: var(--ds-font-heading); font-size: var(--ds-text-heading-2); line-height: var(--ds-text-heading-2-leading); font-variant-numeric: tabular-nums; }
.ds-homebars { display: flex; height: 16px; align-items: flex-end; gap: 1px; }
.ds-homebars > span { min-width: 0; flex: 1; background: var(--ds-color-fg); transform-origin: bottom; }
.ds-homebars > span:last-child { background: var(--ds-color-surface-accent); }
@media (max-width: 767px) {
  .ds-homecards { grid-template-columns: minmax(0, 1fr); }
  .ds-homecards > a + a { border-top: var(--ds-border-hairline) solid var(--ds-color-edge); border-left: 0; }
}
.ds-homeline { display: flex; flex-wrap: wrap; justify-content: center; gap: 4px 8px; margin: 0; color: var(--ds-color-fg-muted); font-size: var(--ds-text-ui); line-height: var(--ds-text-ui-leading); }
@media (prefers-reduced-motion: no-preference) {
  .ds-homebars[data-plays] > span { animation: ds-homebar-rise var(--ds-duration-entrance) var(--ds-easing-out) both; animation-delay: calc(var(--i) * 12ms); }
}
@keyframes ds-homebar-rise { from { transform: scaleY(0.05); } }
</style>
