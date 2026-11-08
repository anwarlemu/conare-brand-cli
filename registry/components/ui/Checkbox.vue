<script setup lang="ts">
import { computed, useId } from 'vue'

// A yes or no that is part of a form (new, in the console's grammar): a 16px square in the #C3C1BF hairline that turns
// ink on hover; on, it fills ink and a white check draws its stroke (160ms on the strong ease-out); `indeterminate` shows
// a bar for a group partly on. Focus is the switch's red outline. The label sits right of it at 13px, the whole row
// pressable, 28px tall (40px on phones). A setting that takes effect at once is a Switch.
const checked = defineModel<boolean>({ default: false })
const props = defineProps<{ label?: string, hint?: string, indeterminate?: boolean, disabled?: boolean, invalid?: boolean, id?: string, name?: string, value?: string }>()
const auto = useId()
const id = computed(() => props.id ?? `checkbox-${auto}`)
</script>

<template>
  <label data-ds="checkbox" class="ds-checkrow" :for="id" :data-disabled="disabled || undefined">
    <span class="ds-checkbox">
      <input :id="id" v-model="checked" type="checkbox" :name="name" :value="value" :disabled="disabled" :indeterminate="indeterminate" :aria-invalid="invalid || undefined" :aria-describedby="hint ? `${id}-hint` : undefined">
      <svg v-if="indeterminate" viewBox="0 0 16 16" aria-hidden="true"><path d="M4 8h8" /></svg>
      <svg v-else viewBox="0 0 16 16" aria-hidden="true"><path d="M3.5 8.5 6.5 11.5 12.5 4.5" pathLength="1" /></svg>
    </span>
    <span v-if="label || $slots.default || hint" class="flex min-w-0 flex-col">
      <span><slot>{{ label }}</slot></span>
      <span v-if="hint" :id="`${id}-hint`" class="type-meta text-fg-muted">{{ hint }}</span>
    </span>
  </label>
</template>

<style>
.ds-checkrow { display: inline-flex; min-height: var(--ds-size-control-sm); align-items: flex-start; gap: var(--ds-space-md); padding-block: 6px; color: var(--ds-color-fg); font-size: var(--ds-text-ui); line-height: var(--ds-text-ui-leading); cursor: pointer; }
.ds-checkrow[data-disabled] { color: var(--ds-color-fg-muted); cursor: not-allowed; }
.ds-checkbox { position: relative; display: inline-grid; width: 16px; height: 16px; flex-shrink: 0; margin-top: 2px; }
.ds-checkbox > * { grid-area: 1 / 1; }
.ds-checkbox > input { width: 16px; height: 16px; margin: 0; border: var(--ds-border-hairline) solid var(--ds-color-edge-strong); background: var(--ds-color-surface); appearance: none; cursor: inherit; transition: border-color var(--ds-duration-micro) var(--ds-easing-standard), background-color var(--ds-duration-micro) var(--ds-easing-standard); }
.ds-checkbox > input:is(:checked, :indeterminate) { border-color: var(--ds-color-action-primary); background: var(--ds-color-action-primary); }
.ds-checkbox > input:focus-visible { outline: var(--ds-border-focus) solid var(--ds-color-edge-accent); outline-offset: var(--ds-border-focus); }
.ds-checkbox > input[aria-invalid="true"]:not(:checked) { border-color: var(--ds-color-action-danger); }
.ds-checkbox > input:disabled { border-color: var(--ds-color-edge); background: var(--ds-color-surface-sunken); }
.ds-checkbox > input:disabled:is(:checked, :indeterminate) { border-color: var(--ds-color-edge-strong); background: var(--ds-color-edge-strong); }
@media (hover: hover) and (pointer: fine) { .ds-checkrow:hover > .ds-checkbox > input:not(:disabled, :checked, :indeterminate) { border-color: var(--ds-color-edge-focus); } }
.ds-checkbox > svg { width: 16px; height: 16px; fill: none; stroke: var(--ds-color-action-primary-fg); stroke-width: 2; stroke-linecap: square; pointer-events: none; }
.ds-checkbox > svg path[pathLength] { stroke-dasharray: 1; stroke-dashoffset: 1; transition: stroke-dashoffset var(--ds-duration-micro) var(--ds-easing-standard); }
.ds-checkbox > input:checked + svg path[pathLength] { stroke-dashoffset: 0; transition: stroke-dashoffset var(--ds-duration-glide) var(--ds-easing-out); }
.ds-checkbox > input:not(:indeterminate) + svg path:not([pathLength]) { opacity: 0; }
@media (pointer: coarse), (max-width: 767px) { .ds-checkrow { min-height: var(--ds-size-control-touch); align-items: center; padding-block: 8px; font-size: var(--ds-text-body); } .ds-checkbox { margin-top: 0; } }
@media (prefers-reduced-motion: reduce) { .ds-checkbox > svg path[pathLength], .ds-checkbox > input:checked + svg path[pathLength] { transition: none; } }
</style>
