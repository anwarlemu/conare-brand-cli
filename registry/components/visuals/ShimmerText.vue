<script setup lang="ts">
// A few words that say something is working (console2.css .v2-shimmer): a lighter band runs across the muted text,
// right to left every 1.4s, for as long as the work does. Take it away when the work is done. Reduced motion shows the
// words still, in the muted grey. Wrap the sentence in role="status" so the change is read out.
</script>

<template>
  <span data-ds="shimmer-text" class="ds-shimmer"><slot /></span>
</template>

<style>
.ds-shimmer { background: linear-gradient(90deg, var(--ds-color-neutral-400) 30%, var(--ds-color-neutral-700) 50%, var(--ds-color-neutral-400) 70%) 0 0 / 300% 100%; -webkit-background-clip: text; background-clip: text; color: transparent; animation: ds-shimmer 1400ms linear infinite; }
@keyframes ds-shimmer { from { background-position: 100% 0; } to { background-position: 0 0; } }
@media (prefers-reduced-motion: reduce) { .ds-shimmer { animation: none; background: none; color: var(--ds-color-fg-muted); } }
</style>
