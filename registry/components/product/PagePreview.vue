<script setup lang="ts">
import { computed } from 'vue'
import type { ResultPage } from '@/composables/useSearchResults'
import MarkedText from '@/components/ui/MarkedText.vue'

// A document's page drawn small, with the passage marked where it sits on it (search/PagePreview.vue). A result
// carries only its passage, so the page's other lines are drawn as rules: at thumb and mid size the passage is a band
// of darker rules on the red tint with a red edge; at full size it is its own words, the query's in medium weight.
// Thumb and mid are pictures (say the page number beside them); full is read.
const props = withDefaults(defineProps<{ page: ResultPage, text?: string, query?: string, size?: 'thumb' | 'mid' | 'full', marked?: boolean, here?: boolean }>(), { text: '', query: '', size: 'mid', marked: true })

const COUNT = { thumb: 11, mid: 22, full: 26 }
// Line lengths in percent; 0 is the gap between paragraphs.
const WIDTHS = [100, 97, 99, 94, 100, 62, 0, 98, 100, 95, 100, 71, 0]
const band = computed(() => (props.size === 'thumb' ? 2 : 4))
const lines = computed(() => {
  const n = COUNT[props.size]
  const at = Math.min(n - 3, Math.round(props.page.top * n))
  const span = props.size === 'thumb' ? 2 : props.size === 'mid' ? 4 : 1
  return Array.from({ length: n }, (_, i) => ({ w: WIDTHS[(i + props.page.number * 3) % WIDTHS.length]!, hit: props.marked && i >= at && i < at + span, first: i === at }))
})
</script>

<template>
  <div data-ds="page-preview" class="ds-pg" :data-size="size" :data-here="here || undefined" :aria-hidden="size === 'full' ? undefined : 'true'">
    <span class="ds-pg-head" />
    <template v-for="(l, i) in lines" :key="i">
      <p v-if="size === 'full' && l.first" class="ds-pg-hit ds-pg-words"><MarkedText :text="text" :query="query" /></p>
      <span v-else-if="l.hit && size !== 'full' && l.first" class="ds-pg-hit">
        <span v-for="k in band" :key="k" class="ds-pg-line" :style="{ width: k === band ? '68%' : '100%' }" />
      </span>
      <span v-else-if="!l.hit" class="ds-pg-line" :style="{ width: `${l.w}%` }" :data-gap="l.w === 0 || undefined" />
    </template>
    <span v-if="size !== 'thumb'" class="ds-pg-foot">{{ page.number }}</span>
  </div>
</template>

<style>
.ds-pg { position: relative; display: flex; flex-shrink: 0; flex-direction: column; overflow: hidden; border: var(--ds-border-hairline) solid var(--ds-color-edge); background: var(--ds-color-surface); }
.ds-pg-line { display: block; height: 1px; flex-shrink: 0; background: var(--ds-color-edge-strong); opacity: 0.55; }
.ds-pg-line[data-gap] { opacity: 0; }
.ds-pg-head { display: block; width: 34%; height: 1px; flex-shrink: 0; background: var(--ds-color-edge-strong); }
.ds-pg-hit { display: flex; flex-shrink: 0; flex-direction: column; background: linear-gradient(var(--ds-color-edge-accent), var(--ds-color-edge-accent)) left / 2px 100% no-repeat, color-mix(in srgb, var(--ds-color-edge-accent) 14%, transparent); }
.ds-pg-hit .ds-pg-line { background: var(--ds-color-off-black); opacity: 0.8; }
/* ds-override: the folio of a drawn page, 8px as the branch draws it, not a text size */
.ds-pg-foot { position: absolute; right: 0; bottom: 6px; left: 0; color: var(--ds-color-fg-muted); font-size: 8px; line-height: 8px; text-align: center; font-variant-numeric: tabular-nums; }
.ds-pg[data-size="thumb"] { width: 28px; height: 36px; gap: 2px; padding: 4px 4px; }
.ds-pg[data-size="thumb"] .ds-pg-head { margin-bottom: 1px; }
.ds-pg[data-size="thumb"] .ds-pg-hit { gap: 2px; margin: 0 -2px; padding: 1px 2px; }
.ds-pg[data-size="mid"] { width: 152px; height: 197px; gap: 4px; padding: 14px 14px 22px; }
.ds-pg[data-size="mid"] .ds-pg-line { height: 2px; }
.ds-pg[data-size="mid"] .ds-pg-head { height: 2px; margin-bottom: 6px; }
/* ds-override: the band reaches 3px past the page's rules, as the branch draws it */
.ds-pg[data-size="mid"] .ds-pg-hit { gap: 4px; margin: -1px -4px; padding: 3px 4px; }
.ds-pg[data-size="mid"] .ds-pg-hit .ds-pg-line { height: 2px; }
.ds-pg[data-size="full"] { width: 100%; gap: 12px; padding: 40px 40px 56px; }
.ds-pg[data-size="full"] .ds-pg-line { height: 5px; }
.ds-pg[data-size="full"] .ds-pg-line[data-gap] { height: 2px; }
.ds-pg[data-size="full"] .ds-pg-head { height: 5px; margin-bottom: 12px; }
.ds-pg[data-size="full"] .ds-pg-foot { bottom: 20px; font-size: var(--ds-text-caption); line-height: 12px; }
.ds-pg-words { margin: 2px -8px; padding: 8px; color: var(--ds-color-fg); font-size: var(--ds-text-ui); line-height: var(--ds-text-ui-leading); }
.ds-pg[data-here] { outline: var(--ds-border-hairline) solid var(--ds-color-edge-accent); outline-offset: 2px; }
@media (max-width: 639px) { .ds-pg[data-size="full"] { padding: 28px 24px 48px; } }
</style>
