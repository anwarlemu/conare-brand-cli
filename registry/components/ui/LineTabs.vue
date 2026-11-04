<script setup lang="ts" generic="T extends string">
// Line tabs for a page's sections (console2.css .v2-tabline): 13px muted labels 24px apart over a hairline; the current
// one in ink with a 2px ink underline and a 4px red square before it, which also shows under the pointer.
const model = defineModel<T>({ required: true })
defineProps<{ options: readonly T[] | { value: T, label: string }[], label: string }>()
const norm = (o: T | { value: T, label: string }) => (typeof o === 'string' ? { value: o, label: o } : o)
</script>

<template>
  <div class="ds-tabline" role="tablist" :aria-label="label">
    <button v-for="o in options.map(norm)" :key="o.value" type="button" role="tab" :aria-selected="model === o.value" @click="model = o.value">{{ o.label }}</button>
  </div>
</template>

<style>
.ds-tabline { display: flex; gap: var(--ds-space-2xl); border-bottom: var(--ds-border-hairline) solid var(--ds-color-edge); }
.ds-tabline > button { position: relative; display: flex; height: var(--ds-size-control-lg); flex-shrink: 0; align-items: center; color: var(--ds-color-fg-muted); font-size: var(--ds-text-ui); cursor: pointer; transition: color var(--ds-duration-micro) var(--ds-easing-standard); }
@media (hover: hover) and (pointer: fine) { .ds-tabline > button:hover { color: var(--ds-color-fg); } }
.ds-tabline > [aria-selected="true"] { color: var(--ds-color-fg); }
.ds-tabline > [aria-selected="true"]::after { position: absolute; right: 0; bottom: -1px; left: 0; height: 2px; background: var(--ds-color-surface-inverse); content: ""; }
.ds-tabline > button::before { position: absolute; top: 50%; left: -10px; width: 4px; height: 4px; margin-top: -2px; background: var(--ds-color-edge-accent); opacity: 0; content: ""; transition: opacity var(--ds-duration-micro) ease-out; }
.ds-tabline > [aria-selected="true"]::before { opacity: 1; }
@media (hover: hover) and (pointer: fine) { .ds-tabline > button:hover::before { opacity: 1; } }
@media (pointer: coarse), (max-width: 767px) { .ds-tabline > button { min-height: 44px; } }
</style>
