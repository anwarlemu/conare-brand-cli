<script setup lang="ts">
// A label over a number (console2.css .v2-stat): 12px muted label, 16px medium value in tabular figures. A stat that
// drives a chart is a button: pass `pressed` and it fills with the paper under the pointer, and the pinned one stays
// filled with a 2px red edge on top. Inside Stats, or alone at the top of a card.
const props = defineProps<{ label: string, value?: string, pressed?: boolean }>()
defineEmits<{ press: [] }>()
const pressable = props.pressed !== undefined
</script>

<template>
  <button data-ds="stat" v-if="pressable" type="button" class="ds-stat" :aria-pressed="pressed" :data-on="pressed || undefined" @click="$emit('press')">
    <p class="type-meta text-fg-muted">{{ label }}</p>
    <p class="ds-stat-value"><slot>{{ value }}</slot></p>
  </button>
  <div data-ds="stat" v-else class="ds-stat">
    <p class="type-meta text-fg-muted">{{ label }}</p>
    <p class="ds-stat-value"><slot>{{ value }}</slot></p>
  </div>
</template>

<style>
.ds-stat { position: relative; padding: var(--ds-space-md) var(--ds-space-lg); border-right: var(--ds-border-hairline) solid var(--ds-color-edge); border-bottom: var(--ds-border-hairline) solid var(--ds-color-edge); transition: background-color var(--ds-duration-micro) var(--ds-easing-standard); }
.ds-stat-value { font-size: var(--ds-text-heading-4); font-weight: var(--ds-font-weight-medium); line-height: var(--ds-text-heading-4-leading); font-variant-numeric: tabular-nums; }
button.ds-stat { width: 100%; text-align: left; cursor: pointer; }
.ds-stat[data-on] { background: var(--ds-color-surface-subtle); }
@media (hover: hover) and (pointer: fine) { button.ds-stat:hover { background: var(--ds-color-surface-subtle); } }
.ds-stat[aria-pressed="true"]::before { position: absolute; top: -1px; right: -1px; left: -1px; height: 2px; background: var(--ds-color-edge-accent); content: ""; }
button.ds-stat:focus-visible { outline-offset: -2px; }
</style>
