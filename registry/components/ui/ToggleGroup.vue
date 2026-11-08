<script setup lang="ts" generic="T extends string">
import { computed } from 'vue'

// Buttons that stay pressed, on the segmented control's track (console2.css .v2-tabs with aria-pressed): a paper track in
// a hairline, each pressed one a white block with its own hairline. `multiple` lets several stay on (the model is an
// array); otherwise one at most, pressing it again lets it go, and where the browser has anchor positioning the white
// block glides to the pick in 180ms. For views of one thing use Tabs; this is for options that are on or off.
const props = defineProps<{ options: readonly T[] | { value: T, label: string, disabled?: boolean }[], label: string, multiple?: boolean }>()
const model = defineModel<T | T[] | null>({ required: true })
const norm = (o: T | { value: T, label: string, disabled?: boolean }) => (typeof o === 'string' ? { value: o, label: o, disabled: false } : { disabled: false, ...o })
const items = computed(() => props.options.map(norm))
const on = (v: T) => (Array.isArray(model.value) ? model.value.includes(v) : model.value === v)
function press(v: T) {
  if (props.multiple) {
    const list = Array.isArray(model.value) ? model.value : []
    model.value = list.includes(v) ? list.filter(x => x !== v) : [...list, v]
  }
  else model.value = model.value === v ? null : v
}
</script>

<template>
  <div data-ds="toggle-group" class="ds-toggles" role="group" :aria-label="label" :data-multiple="multiple || undefined">
    <button v-for="o in items" :key="o.value" type="button" :aria-pressed="on(o.value)" :disabled="o.disabled" @click="press(o.value)">{{ o.label }}</button>
  </div>
</template>

<style>
.ds-toggles { display: inline-flex; padding: var(--ds-space-2xs); border: var(--ds-border-hairline) solid var(--ds-color-edge); background: var(--ds-color-surface-subtle); }
.ds-toggles > button { height: var(--ds-size-control-xs); padding: 0 8px; color: var(--ds-color-fg-muted); font-size: var(--ds-text-meta); cursor: pointer; transition: color var(--ds-duration-glide) var(--ds-easing-standard), background-color var(--ds-duration-micro) var(--ds-easing-standard), transform var(--ds-duration-glide) var(--ds-easing-out); }
.ds-toggles > button:active:not(:disabled) { transform: scale(0.97); }
@media (hover: hover) and (pointer: fine) { .ds-toggles > button:hover { color: var(--ds-color-fg); } }
.ds-toggles > button:disabled { color: var(--ds-color-fg-faint); cursor: not-allowed; }
.ds-toggles > button[aria-pressed="true"] { position: relative; z-index: 1; background: var(--ds-color-surface); color: var(--ds-color-fg); outline: var(--ds-border-hairline) solid var(--ds-color-edge); }
.ds-toggles > button[aria-pressed="true"]:focus-visible { outline: var(--ds-border-focus) solid var(--ds-color-edge-focus); }
/* Two pressed side by side keep a gap between their blocks. */
.ds-toggles[data-multiple] { gap: var(--ds-space-2xs); }
@supports (anchor-scope: all) {
  .ds-toggles:not([data-multiple]) { position: relative; anchor-scope: --ds-toggle-thumb; }
  .ds-toggles:not([data-multiple])::before { position: absolute; top: anchor(top); right: anchor(right); bottom: anchor(bottom); left: anchor(left); background: var(--ds-color-surface); content: ""; outline: var(--ds-border-hairline) solid var(--ds-color-edge); position-anchor: --ds-toggle-thumb; }
  .ds-toggles:not([data-multiple]):is(:hover, :focus-within)::before { transition: top var(--ds-duration-slide) var(--ds-easing-out), right var(--ds-duration-slide) var(--ds-easing-out), bottom var(--ds-duration-slide) var(--ds-easing-out), left var(--ds-duration-slide) var(--ds-easing-out); }
  .ds-toggles:not([data-multiple]):not(:has(> [aria-pressed="true"]))::before { content: none; }
  .ds-toggles:not([data-multiple]) > button { position: relative; z-index: 1; }
  .ds-toggles:not([data-multiple]) > button[aria-pressed="true"] { anchor-name: --ds-toggle-thumb; background: none; outline: 0; }
  .ds-toggles:not([data-multiple]) > button[aria-pressed="true"]:focus-visible { outline: var(--ds-border-focus) solid var(--ds-color-edge-focus); }
}
@media (pointer: coarse), (max-width: 767px) {
  .ds-toggles > button { position: relative; height: 34px; padding-inline: 12px; font-size: var(--ds-text-ui); }
  .ds-toggles > button::after { position: absolute; inset: -3px 0; content: ""; }
}
@media (prefers-reduced-motion: reduce) {
  .ds-toggles:is(:hover, :focus-within)::before { transition: none; }
  .ds-toggles > button:active:not(:disabled) { transform: none; }
}
</style>
