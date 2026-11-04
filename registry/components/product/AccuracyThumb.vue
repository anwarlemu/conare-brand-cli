<script setup lang="ts">
import { computed } from 'vue'

// A document's page drawn small (the console's SearchPagePreview at thumb size): 28 by 36, a running head, eleven
// rules, and the passage where it sits as a band of darker rules on the red tint with a 2px red edge. A picture: the
// text beside it says the page number.
const props = defineProps<{ number: number, top: number }>()
const WIDTHS = [100, 97, 99, 94, 100, 62, 0, 98, 100, 95, 100, 71, 0]
const COUNT = 11
const lines = computed(() => {
  const at = Math.min(COUNT - 3, Math.round(props.top * COUNT))
  return Array.from({ length: COUNT }, (_, i) => ({ w: WIDTHS[(i + props.number * 3) % WIDTHS.length]!, hit: i >= at && i < at + 2, first: i === at }))
})
</script>

<template>
  <span class="ds-thumb" aria-hidden="true">
    <span class="ds-thumb-head" />
    <template v-for="(l, i) in lines" :key="i">
      <span v-if="l.first" class="ds-thumb-hit"><span class="ds-thumb-line w-full" /><span class="ds-thumb-line w-[68%]" /></span>
      <span v-else-if="!l.hit" class="ds-thumb-line" :style="{ width: `${l.w}%` }" :data-gap="l.w === 0 || undefined" />
    </template>
  </span>
</template>

<style>
.ds-thumb { position: relative; display: flex; width: 28px; height: 36px; flex-shrink: 0; flex-direction: column; gap: var(--ds-space-2xs); overflow: hidden; padding: 4px; border: var(--ds-border-hairline) solid var(--ds-color-edge); background: var(--ds-color-surface); }
.ds-thumb-line { display: block; height: 1px; flex-shrink: 0; background: var(--ds-color-edge-strong); opacity: 0.55; }
.ds-thumb-line[data-gap] { opacity: 0; }
.ds-thumb-head { display: block; width: 34%; height: 1px; flex-shrink: 0; margin-bottom: 1px; background: var(--ds-color-edge-strong); }
.ds-thumb-hit { display: flex; flex-shrink: 0; flex-direction: column; gap: var(--ds-space-2xs); margin: 0 -2px; padding: 1px 2px; background: linear-gradient(var(--ds-color-edge-accent), var(--ds-color-edge-accent)) left / 2px 100% no-repeat, color-mix(in srgb, var(--ds-color-edge-accent) 14%, transparent); }
.ds-thumb-hit .ds-thumb-line { background: var(--ds-color-off-black); opacity: 0.8; }
</style>
