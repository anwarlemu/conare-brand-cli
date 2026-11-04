<script setup lang="ts">
import { provide, useId } from 'vue'
import { useMenu } from '@/composables/useMenu'

// A button that opens a short list of choices or actions (console2.css .v2-menu): a square panel in a hairline, no
// shadow, 4px inside; rows from MenuItem. It comes in over 160ms, a 4px drop (a rise when it opens upward), and not at
// all when opened from the keyboard. Arrows, Home, End, Escape, Tab and a click outside are handled (useMenu).
// The trigger is the slot `trigger`, drawn as a secondary button unless `triggerClass` says otherwise.
withDefaults(defineProps<{ label: string, up?: boolean, align?: 'start' | 'end', width?: string, triggerClass?: string, triggerLabel?: string }>(), { align: 'start', width: '264px' })
const { open, root, trigger, close, toggle, onTriggerKey, onMenuKey } = useMenu()
provide('ds-menu-close', () => close(true))
defineExpose({ open, close })
const id = `menu-${useId()}`
</script>

<template>
  <div ref="root" class="relative inline-block">
    <button
      ref="trigger"
      type="button"
      :class="triggerClass ?? 'inline-flex h-control-sm cursor-pointer items-center gap-1.5 border border-action-secondary-edge bg-surface px-2.5 text-meta leading-5 font-medium text-fg transition-[border-color,background-color] duration-120 ease-standard hover:border-action-secondary-edge-hover active:bg-surface-subtle aria-expanded:border-action-secondary-edge-hover max-md:h-control-touch max-md:text-ui'"
      aria-haspopup="menu"
      :aria-expanded="open"
      :aria-controls="id"
      :aria-label="triggerLabel"
      @click="toggle"
      @keydown="onTriggerKey"
    >
      <slot name="trigger" :open="open" />
    </button>
    <div
      v-if="open"
      :id="id"
      class="ds-menu"
      :data-up="up || undefined"
      :style="{ width, [align === 'end' ? 'right' : 'left']: '0', [up ? 'bottom' : 'top']: 'calc(100% + 4px)' }"
      role="menu"
      :aria-label="label"
      @keydown="onMenuKey"
    >
      <slot />
    </div>
  </div>
</template>

<style>
.ds-menu { position: absolute; z-index: 40; display: flex; flex-direction: column; padding: var(--ds-space-xs); border: var(--ds-border-hairline) solid var(--ds-color-edge); background: var(--ds-color-surface); animation: ds-menu-in var(--ds-duration-glide) var(--ds-easing-standard) both; scroll-margin: 8px; }
.ds-menu[data-up] { animation-name: ds-menu-up; }
/* Opened from the keyboard, focus lands on a row at once: no animation. */
.ds-menu:has(:focus-visible) { animation: none; }
.ds-menu > * { flex-shrink: 0; }
@keyframes ds-menu-in { from { opacity: 0; transform: translateY(-4px); } }
@keyframes ds-menu-up { from { opacity: 0; transform: translateY(4px); } }
@media (prefers-reduced-motion: reduce) { .ds-menu { animation: none; } }
</style>
