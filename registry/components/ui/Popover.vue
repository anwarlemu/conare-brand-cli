<script setup lang="ts">
import { useId, watch } from 'vue'
import PopoverPanel from '@/components/ui/PopoverPanel.vue'
import { firstFocusable, usePopover, type Align, type Side } from '@/composables/usePopover'

// Menu's square panel for any content (a short form, a few settings, a note): the trigger is the slot `trigger`, drawn
// as a secondary button unless `triggerClass` says otherwise. Opening moves focus to the panel's first control (or
// the panel); Escape, a press outside or tabbing away closes it, and Escape returns focus to the trigger. It flips
// to the side with room and stays 8px inside the viewport. The default slot gets `close`.
const props = withDefaults(defineProps<{ label: string, side?: Side, align?: Align, width?: string, triggerClass?: string, triggerLabel?: string }>(), { side: 'bottom', align: 'start', width: '280px' })
const open = defineModel<boolean>('open', { default: false })
const pop = usePopover({ side: props.side, align: props.align })
const id = `popover-${useId()}`

async function show(keyboard = false) {
  await pop.show({ keyboard })
  ;(firstFocusable(pop.panel.value) ?? pop.panel.value)?.focus({ preventScroll: true })
}
watch(open, (now) => {
  if (now && !pop.open.value) void show()
  if (!now && pop.open.value) pop.hide()
})
watch(pop.open, (now) => { open.value = now })
// A click from the keyboard has no pointer detail: the panel opens and closes at once.
function onClick(event: MouseEvent) {
  const keyboard = event.detail === 0
  if (pop.open.value) pop.hide(keyboard, keyboard)
  else void show(keyboard)
}
defineExpose({ close: (refocus = true) => pop.hide(refocus) })
</script>

<template>
  <button data-ds="popover"
    :ref="(el) => { pop.anchor.value = el as HTMLElement | null }"
    type="button"
    :class="triggerClass ?? 'inline-flex h-control-sm cursor-pointer items-center gap-1.5 border border-action-secondary-edge bg-surface px-2.5 text-meta leading-5 font-medium text-fg transition-[border-color,background-color] duration-120 ease-standard hover:border-action-secondary-edge-hover active:bg-surface-subtle aria-expanded:border-action-secondary-edge-hover max-md:h-control-touch max-md:text-ui'"
    aria-haspopup="dialog"
    :aria-expanded="pop.open.value"
    :aria-controls="pop.open.value ? id : undefined"
    :aria-label="triggerLabel"
    @click="onClick"
  >
    <slot name="trigger" :open="pop.open.value" />
  </button>
  <PopoverPanel data-ds="popover" :id="id" :pop="pop" role="dialog" :aria-label="label" tabindex="-1" class="p-3" :style="{ width }">
    <slot :close="(refocus = true) => pop.hide(refocus)" />
  </PopoverPanel>
</template>
