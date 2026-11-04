<script setup lang="ts">
import { computed, ref, useId } from 'vue'

// Two panes and the hairline between them (new in Conare's style, from the docs panel's split: a 1px edge beside the
// page). The handle is the hairline itself with an 8px reach either side; it turns ink under the pointer, while
// dragged and when focused. Drag it, or focus it and use the arrow keys (Shift for bigger steps, Home and End for the
// limits). `v-model` is the first pane's share in percent, held between `min` and `max`. Write the panes in the
// `first` and `second` slots.
const size = defineModel<number>({ default: 50 })
const props = withDefaults(defineProps<{ direction?: 'horizontal' | 'vertical', min?: number, max?: number, label?: string }>(), { direction: 'horizontal', min: 20, max: 80, label: 'resize panes' })
const root = ref<HTMLElement | null>(null)
const dragging = ref(false)
const firstId = `pane-${useId()}`
const across = computed(() => props.direction === 'horizontal')
const clamp = (n: number) => Math.min(props.max, Math.max(props.min, Math.round(n * 10) / 10))

function onDown(e: PointerEvent) {
  if (e.button !== 0) return
  const el = e.currentTarget as HTMLElement
  el.setPointerCapture(e.pointerId)
  dragging.value = true
}
function onMove(e: PointerEvent) {
  if (!dragging.value || !root.value) return
  const box = root.value.getBoundingClientRect()
  size.value = clamp(across.value ? ((e.clientX - box.left) / box.width) * 100 : ((e.clientY - box.top) / box.height) * 100)
}
function onUp(e: PointerEvent) {
  dragging.value = false
  ;(e.currentTarget as HTMLElement).releasePointerCapture(e.pointerId)
}
function onKey(e: KeyboardEvent) {
  const step = e.shiftKey ? 10 : 2
  const back = across.value ? 'ArrowLeft' : 'ArrowUp'
  const fwd = across.value ? 'ArrowRight' : 'ArrowDown'
  if (e.key === back) size.value = clamp(size.value - step)
  else if (e.key === fwd) size.value = clamp(size.value + step)
  else if (e.key === 'Home') size.value = props.min
  else if (e.key === 'End') size.value = props.max
  else return
  e.preventDefault()
}
</script>

<template>
  <div ref="root" class="flex min-h-0 min-w-0" :class="[across ? 'flex-row' : 'flex-col', dragging && 'select-none']">
    <div :id="firstId" class="min-h-0 min-w-0 overflow-auto" :style="{ flexBasis: `${size}%` }"><slot name="first" /></div>
    <div
      class="ds-resize-handle"
      :data-direction="direction"
      :data-dragging="dragging || undefined"
      role="separator"
      tabindex="0"
      :aria-label="label"
      :aria-orientation="across ? 'vertical' : 'horizontal'"
      :aria-controls="firstId"
      :aria-valuenow="size"
      :aria-valuemin="min"
      :aria-valuemax="max"
      @pointerdown="onDown"
      @pointermove="onMove"
      @pointerup="onUp"
      @pointercancel="onUp"
      @keydown="onKey"
    />
    <div class="min-h-0 min-w-0 flex-1 overflow-auto"><slot name="second" /></div>
  </div>
</template>

<style>
.ds-resize-handle { position: relative; flex-shrink: 0; background: var(--ds-color-edge); touch-action: none; transition: background-color var(--ds-duration-micro) var(--ds-easing-standard); }
.ds-resize-handle[data-direction="horizontal"] { width: var(--ds-border-hairline); cursor: col-resize; }
.ds-resize-handle[data-direction="vertical"] { height: var(--ds-border-hairline); cursor: row-resize; }
/* The reach: 8px either side of the hairline, 20px on touch. */
.ds-resize-handle::before { position: absolute; content: ""; }
.ds-resize-handle[data-direction="horizontal"]::before { inset: 0 calc(var(--ds-space-md) * -1); }
.ds-resize-handle[data-direction="vertical"]::before { inset: calc(var(--ds-space-md) * -1) 0; }
@media (pointer: coarse) {
  .ds-resize-handle[data-direction="horizontal"]::before { inset: 0 -20px; }
  .ds-resize-handle[data-direction="vertical"]::before { inset: -20px 0; }
}
.ds-resize-handle[data-dragging], .ds-resize-handle:focus-visible { background: var(--ds-color-edge-focus); }
.ds-resize-handle:focus-visible { outline: none; }
@media (hover: hover) and (pointer: fine) { .ds-resize-handle:hover { background: var(--ds-color-edge-focus); } }
</style>
