<script setup lang="ts">
import { ChevronDown } from 'lucide-vue-next'

// The browser's own select, drawn as the console's field (main.css select.c-input, square under the console): 32px (28px
// with `small`), 13px, the #C3C1BF hairline that darkens on hover and turns to a 2px ink edge on focus, and its own 12px
// chevron in the muted grey, the same in every browser. 40px and 16px on phones, where the system picker opens. Options
// go in the slot as <option>s. For a pick with search or marks, use Menu.
defineOptions({ inheritAttrs: false })
const model = defineModel<string | number>()
defineProps<{ small?: boolean, invalid?: boolean, mono?: boolean }>()
</script>

<template>
  <span data-ds="native-select" class="ds-select" :data-small="small || undefined" :class="$attrs.class">
    <select v-model="model" v-bind="{ ...$attrs, class: undefined }" :aria-invalid="invalid || undefined" :class="mono && 'font-code'"><slot /></select>
    <ChevronDown :size="12" :stroke-width="2" aria-hidden="true" />
  </span>
</template>

<style>
.ds-select { position: relative; display: inline-flex; width: 100%; align-items: center; }
.ds-select > select { width: 100%; height: var(--ds-size-control-md); padding: 0 32px 0 12px; border: var(--ds-border-hairline) solid var(--ds-color-edge-strong); background: var(--ds-color-surface); color: var(--ds-color-fg); font-size: var(--ds-text-ui); line-height: var(--ds-text-ui-leading); appearance: none; cursor: pointer; transition: border-color var(--ds-duration-enter) var(--ds-easing-standard); }
.ds-select > svg { position: absolute; right: 12px; color: var(--ds-color-fg-muted); pointer-events: none; }
@media (hover: hover) and (pointer: fine) { .ds-select > select:hover:not(:disabled, :focus) { border-color: var(--ds-color-neutral-500); } }
.ds-select > select:focus { padding: 0 calc(32px - 1px) 0 calc(12px - 1px); border: var(--ds-border-focus) solid var(--ds-color-edge-focus); outline: none; }
.ds-select > select[aria-invalid="true"] { border-color: var(--ds-color-action-danger); }
.ds-select > select:disabled { border-color: var(--ds-color-edge); color: var(--ds-color-fg-muted); cursor: not-allowed; }
.ds-select[data-small] { width: auto; }
.ds-select[data-small] > select { height: var(--ds-size-control-sm); padding: 0 28px 0 8px; font-size: var(--ds-text-meta); }
.ds-select[data-small] > select:focus { padding: 0 calc(28px - 1px) 0 calc(8px - 1px); }
.ds-select[data-small] > svg { right: 8px; }
@media (pointer: coarse), (max-width: 767px) { .ds-select > select, .ds-select[data-small] > select { height: var(--ds-size-control-touch); font-size: var(--ds-text-input); } }
</style>
