<script setup lang="ts">
// A short label for a state or a kind (console2.css .c-badge under the console): 18px, square, 11px lowercase words.
// default: a hairline in ink; working: black, for a source at work; failed: the red wash with a red square; quiet: a
// hairline in the muted grey, for a note such as "default" or "invited". The word carries the state, never colour alone.
withDefaults(defineProps<{ tone?: 'default' | 'working' | 'failed' | 'quiet' }>(), { tone: 'default' })
const TONES = {
  default: 'border-edge text-fg',
  working: 'border-status-working bg-status-working text-status-working-fg',
  failed: 'border-transparent bg-status-failed text-status-failed-fg',
  quiet: 'border-edge text-fg-muted',
}
</script>

<template>
  <span data-ds="tag" class="inline-flex h-4.5 items-center gap-1 border px-1.25 pb-0.5 text-caption leading-4 font-normal whitespace-nowrap" :class="TONES[tone]">
    <slot name="mark"><span v-if="tone === 'failed'" class="mt-0.5 size-1 shrink-0 bg-edge-accent" aria-hidden="true" /></slot>
    <slot />
  </span>
</template>
