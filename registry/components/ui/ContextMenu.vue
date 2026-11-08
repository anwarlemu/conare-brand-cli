<script setup lang="ts">
import { nextTick, provide } from 'vue'
import PopoverPanel from '@/components/ui/PopoverPanel.vue'
import { onMenuRows, usePopover } from '@/composables/usePopover'

// Menu's panel and rows (MenuItem, MenuLabel, MenuSeparator) opened at the pointer: a right-click (or a long press on
// Android) on the default slot opens the `menu` slot where it landed, flipped and kept inside the viewport. From the
// keyboard, Shift+F10 or the context menu key opens it under the focused element, at once, on its first row. Arrows,
// Home and End move; Escape closes and returns focus; choosing a row closes it. `context` is what was clicked
// (the closest [data-context] value), so one menu serves a list.
defineProps<{ label: string, width?: string }>()
const emit = defineEmits<{ open: [context: string | undefined] }>()
const pop = usePopover({ side: 'bottom', align: 'start', gap: 0 })
provide('ds-menu-close', () => pop.hide(true))

function context(target: EventTarget | null) {
  return (target as HTMLElement | null)?.closest<HTMLElement>('[data-context]')?.dataset.context
}
async function onContextMenu(event: MouseEvent) {
  event.preventDefault()
  emit('open', context(event.target))
  await pop.show({ at: { x: event.clientX, y: event.clientY } })
  pop.panel.value?.focus({ preventScroll: true })
}
async function onKey(event: KeyboardEvent) {
  if (event.key !== 'ContextMenu' && !(event.shiftKey && event.key === 'F10')) return
  event.preventDefault()
  const r = (event.target as HTMLElement).getBoundingClientRect()
  emit('open', context(event.target))
  await pop.show({ keyboard: true, at: { x: r.left + 8, y: r.bottom } })
  await nextTick()
  pop.panel.value?.querySelector<HTMLElement>('[role^="menuitem"]:not([disabled])')?.focus()
}
</script>

<template>
  <div data-ds="context-menu" @contextmenu="onContextMenu" @keydown="onKey">
    <slot />
  </div>
  <PopoverPanel data-ds="context-menu" :pop="pop" role="menu" :aria-label="label" tabindex="-1" class="flex flex-col p-1" :style="{ width: width ?? '224px' }" @keydown="onMenuRows($event, pop.panel.value, pop.hide)">
    <slot name="menu" />
  </PopoverPanel>
</template>
