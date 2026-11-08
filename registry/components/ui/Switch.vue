<script setup lang="ts">
// On or off, with no words (console2.css .v2-switch): a square thumb in a square track. The thumb slides on the
// console's curve and the track turns black at once, so the end state lands straight away. The row beside it says
// what the state means. Grey while it can't be changed.
const on = defineModel<boolean>({ default: false })
defineProps<{ label: string, disabled?: boolean }>()
</script>

<template>
  <button data-ds="switch" type="button" role="switch" class="ds-switch" :aria-checked="on" :aria-label="label" :disabled="disabled" @click="on = !on"><span aria-hidden="true" /></button>
</template>

<style>
.ds-switch { --w: 36px; --h: 20px; position: relative; display: inline-flex; width: var(--w); height: var(--h); flex-shrink: 0; align-items: center; padding: var(--ds-space-2xs); border: var(--ds-border-hairline) solid var(--ds-color-edge-strong); background: var(--ds-color-surface-sunken); cursor: pointer; touch-action: manipulation; transition: border-color var(--ds-duration-micro) var(--ds-easing-standard), background-color var(--ds-duration-micro) var(--ds-easing-standard); }
.ds-switch > span { width: calc(var(--h) - 6px); height: calc(var(--h) - 6px); background: var(--ds-color-fg-muted); transition: transform var(--ds-duration-swap) var(--ds-easing-standard), background-color var(--ds-duration-micro) var(--ds-easing-standard); }
.ds-switch[aria-checked="true"] { border-color: var(--ds-color-action-primary); background: var(--ds-color-action-primary); }
.ds-switch[aria-checked="true"] > span { background: var(--ds-color-action-primary-fg); transform: translateX(calc(var(--w) - var(--h))); }
.ds-switch:disabled { border-color: var(--ds-color-edge-strong); background: var(--ds-color-surface-sunken); cursor: not-allowed; }
.ds-switch:disabled > span { background: var(--ds-color-fg-muted); }
.ds-switch:focus-visible { outline: var(--ds-border-focus) solid var(--ds-color-edge-accent); outline-offset: var(--ds-border-focus); }
@media (hover: hover) and (pointer: fine) { .ds-switch:hover:not(:disabled, [aria-checked="true"]) { border-color: var(--ds-color-edge-focus); } }
/* A 44px place to land on phones, the switch keeping its size. */
@media (pointer: coarse), (max-width: 767px) { .ds-switch::after { position: absolute; inset: -12px; content: ""; } }
@media (prefers-reduced-motion: reduce) { .ds-switch, .ds-switch > span { transition: none; } }
</style>
