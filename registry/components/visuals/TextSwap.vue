<script setup lang="ts">
// Two labels in one cell, so nothing around them moves (console2.css .v2-swap): when `on` turns true the first leaves
// up and the second arrives from below, each with a touch of blur (160ms fade, 220ms move on the strong ease-out), and
// a check in the second label draws its stroke. Put the labels in the `a` and `b` slots, an icon first in each. Reduced
// motion keeps the cross-fade only.
defineProps<{ on: boolean }>()
</script>

<template>
  <span class="ds-swap" :data-on="on">
    <span class="ds-swap-a" :aria-hidden="on || undefined"><slot name="a" /></span>
    <span class="ds-swap-b" :aria-hidden="!on || undefined"><slot name="b" /></span>
  </span>
</template>

<style>
.ds-swap { display: inline-grid; }
.ds-swap > span { display: inline-flex; grid-area: 1 / 1; align-items: center; justify-content: center; gap: var(--ds-space-sm); transition: opacity var(--ds-duration-glide) ease, filter var(--ds-duration-glide) ease, transform var(--ds-duration-settle) var(--ds-easing-out); }
.ds-swap-b { opacity: 0; filter: blur(2px); transform: translateY(5px) scale(0.96); }
.ds-swap[data-on="true"] .ds-swap-a { opacity: 0; filter: blur(2px); transform: translateY(-5px) scale(0.96); }
.ds-swap[data-on="true"] .ds-swap-b { opacity: 1; filter: none; transform: none; }
.ds-swap-b svg path { stroke-dasharray: 24; stroke-dashoffset: 24; transition: stroke-dashoffset var(--ds-duration-micro) ease; }
.ds-swap[data-on="true"] .ds-swap-b svg path { stroke-dashoffset: 0; transition: stroke-dashoffset var(--ds-duration-enter) var(--ds-easing-out) 40ms; }
@media (prefers-reduced-motion: reduce) {
  .ds-swap > span { filter: none !important; transform: none !important; transition: opacity var(--ds-duration-micro) ease; }
  .ds-swap-b svg path { stroke-dashoffset: 0; transition: none; }
}
</style>
