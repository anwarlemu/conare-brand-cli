<script setup lang="ts" generic="T extends string">
// The segmented control (console2.css .v2-tabs), for a few views of one thing or a range: a paper track in a hairline,
// the pick a white block with its own hairline. Where the browser has anchor positioning, one white block glides to the
// pick (180ms, strong ease-out) while the row is in use, so a pick moves instead of blinking.
const model = defineModel<T>({ required: true })
defineProps<{ options: readonly T[] | { value: T, label: string, disabled?: boolean }[], label: string }>()
const norm = (o: T | { value: T, label: string, disabled?: boolean }) => (typeof o === 'string' ? { value: o, label: o, disabled: false } : { disabled: false, ...o })
</script>

<template>
  <div data-ds="tabs" class="ds-tabs" role="tablist" :aria-label="label">
    <button
      v-for="o in options.map(norm)"
      :key="o.value"
      type="button"
      role="tab"
      :aria-selected="model === o.value"
      :disabled="o.disabled"
      @click="model = o.value"
    >
      {{ o.label }}
    </button>
  </div>
</template>

<style>
.ds-tabs { display: inline-flex; padding: var(--ds-space-2xs); border: var(--ds-border-hairline) solid var(--ds-color-edge); background: var(--ds-color-surface-subtle); }
.ds-tabs > button { height: var(--ds-size-control-xs); padding: 0 8px; color: var(--ds-color-fg-muted); font-size: var(--ds-text-meta); cursor: pointer; transition: color var(--ds-duration-glide) var(--ds-easing-standard), background-color var(--ds-duration-micro) var(--ds-easing-standard), transform var(--ds-duration-glide) var(--ds-easing-out); }
.ds-tabs > button:active:not(:disabled) { transform: scale(0.97); }
@media (hover: hover) and (pointer: fine) { .ds-tabs > button:hover { color: var(--ds-color-fg); } }
.ds-tabs > button:disabled { color: var(--ds-color-fg-faint); cursor: not-allowed; }
.ds-tabs > button[aria-selected="true"] { background: var(--ds-color-surface); color: var(--ds-color-fg); outline: var(--ds-border-hairline) solid var(--ds-color-edge); }
@supports (anchor-scope: all) {
  .ds-tabs { position: relative; anchor-scope: --ds-thumb; }
  .ds-tabs::before { position: absolute; top: anchor(top); right: anchor(right); bottom: anchor(bottom); left: anchor(left); background: var(--ds-color-surface); content: ""; outline: var(--ds-border-hairline) solid var(--ds-color-edge); position-anchor: --ds-thumb; }
  .ds-tabs:is(:hover, :focus-within)::before { transition: top var(--ds-duration-slide) var(--ds-easing-out), right var(--ds-duration-slide) var(--ds-easing-out), bottom var(--ds-duration-slide) var(--ds-easing-out), left var(--ds-duration-slide) var(--ds-easing-out); }
  .ds-tabs:not(:has(> [aria-selected="true"]))::before { content: none; }
  .ds-tabs > button { position: relative; z-index: 1; }
  .ds-tabs > button[aria-selected="true"] { anchor-name: --ds-thumb; background: none; outline: 0; }
  .ds-tabs > button[aria-selected="true"]:focus-visible { outline: var(--ds-border-focus) solid var(--ds-color-edge-focus); }
}
@media (pointer: coarse), (max-width: 767px) {
  .ds-tabs > button { position: relative; height: 34px; padding-inline: 12px; font-size: var(--ds-text-ui); }
  .ds-tabs > button::after { position: absolute; inset: -3px 0; content: ""; }
}
@media (prefers-reduced-motion: reduce) {
  .ds-tabs:is(:hover, :focus-within)::before { transition: none; }
  .ds-tabs > button:active:not(:disabled) { transform: none; }
}
</style>
