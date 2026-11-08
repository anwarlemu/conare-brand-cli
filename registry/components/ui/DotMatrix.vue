<script setup lang="ts">
// The website's dot-matrix loader (console2.css .v2-matrix): a 3 by 3 of 2px squares that blink in a sweep, for
// anything at work (a search, a sync). Put it beside the word for what is working; show it only after 300ms.
// Reduced motion holds it still. `tone="inverse"` is for a dark ground (a working tag, a dark button).
defineProps<{ tone?: 'default' | 'inverse' }>()
const ORDER = [0, 1, 2, 7, 8, 3, 6, 5, 4]
</script>

<template>
  <span data-ds="dot-matrix" class="ds-matrix" :data-tone="tone" aria-hidden="true"><i v-for="k in 9" :key="k" :style="{ '--k': ORDER[k - 1] }" /></span>
</template>

<style>
.ds-matrix { display: grid; grid-template-columns: repeat(3, 2px); gap: var(--ds-space-2xs); flex-shrink: 0; }
.ds-matrix i { width: 2px; height: 2px; background: var(--ds-color-neutral-500); animation: ds-blink 900ms steps(1, end) infinite; animation-delay: calc(var(--k) * 100ms); }
.ds-matrix[data-tone="inverse"] i { background: var(--ds-color-surface); }
@keyframes ds-blink { 0% { opacity: 1; } 50% { opacity: 0.2; } }
@media (prefers-reduced-motion: reduce) { .ds-matrix i { animation: none; } }
</style>
