<script setup lang="ts">
import { computed } from 'vue'

// A value on a range (new, in the console's grammar): the meter's 4px track (console2.css .v2-meter: a hairline-grey
// track, ink up to the value) and a square 12px ink thumb, with the switch's red focus outline. It follows the pointer
// with no easing, since the hand is moving it; arrows step it, Page Up and Down by tens, Home and End to the ends. The
// whole 28px row takes the pointer (40px on phones). Show the value beside it in tabular figures.
const value = defineModel<number>({ default: 0 })
const props = withDefaults(defineProps<{ label: string, min?: number, max?: number, step?: number, disabled?: boolean, valueText?: string }>(), { min: 0, max: 100, step: 1 })
const share = computed(() => (props.max > props.min ? ((value.value - props.min) / (props.max - props.min)) * 100 : 0))
</script>

<template>
  <span class="ds-slider" :style="{ '--p': `${share}%` }" :data-disabled="disabled || undefined">
    <span class="ds-slider-track" aria-hidden="true"><span /></span>
    <input v-model.number="value" type="range" :min="min" :max="max" :step="step" :disabled="disabled" :aria-label="label" :aria-valuetext="valueText">
  </span>
</template>

<style>
.ds-slider { position: relative; display: flex; width: 100%; height: var(--ds-size-control-sm); align-items: center; }
.ds-slider-track { position: absolute; right: 0; left: 0; height: 4px; background: var(--ds-color-edge); pointer-events: none; }
.ds-slider-track > span { display: block; width: var(--p); height: 100%; background: var(--ds-color-surface-inverse); }
.ds-slider[data-disabled] .ds-slider-track > span { background: var(--ds-color-fg-faint); }
.ds-slider > input { position: relative; width: 100%; height: 100%; margin: 0; background: transparent; appearance: none; cursor: pointer; }
.ds-slider > input:disabled { cursor: not-allowed; }
.ds-slider > input:focus-visible { outline: none; }
.ds-slider > input::-webkit-slider-runnable-track { height: 4px; background: transparent; }
.ds-slider > input::-moz-range-track { height: 4px; background: transparent; }
.ds-slider > input::-webkit-slider-thumb { width: 12px; height: 12px; margin-top: -4px; border: 0; border-radius: 0; background: var(--ds-color-surface-inverse); appearance: none; }
.ds-slider > input::-moz-range-thumb { width: 12px; height: 12px; border: 0; border-radius: 0; background: var(--ds-color-surface-inverse); }
.ds-slider > input:disabled::-webkit-slider-thumb { background: var(--ds-color-fg-faint); }
.ds-slider > input:disabled::-moz-range-thumb { background: var(--ds-color-fg-faint); }
.ds-slider > input:focus-visible::-webkit-slider-thumb { outline: var(--ds-border-focus) solid var(--ds-color-edge-accent); outline-offset: var(--ds-border-focus); }
.ds-slider > input:focus-visible::-moz-range-thumb { outline: var(--ds-border-focus) solid var(--ds-color-edge-accent); outline-offset: var(--ds-border-focus); }
@media (pointer: coarse), (max-width: 767px) { .ds-slider { height: var(--ds-size-control-touch); } }
</style>
