<script lang="ts">
// When the last tooltip closed: one opened right after it shows at once, so moving along a toolbar reads fast.
let lastClosed = 0
</script>

<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref, useId, watch } from 'vue'
import PopoverPanel from '@/components/ui/PopoverPanel.vue'
import { usePopover, type Align, type Side } from '@/composables/usePopover'

// A control's name, for icon buttons (Copy.vue version 1's tip): the inverse fill, 11px, 2px by 6px, 2px under its
// trigger. Under the pointer it waits 300ms, then fades and drops 2px in over 125ms; on keyboard focus it shows at
// once, without motion; a press, Escape or leaving hides it. Right after another tooltip it shows at once. It never
// shows on touch (a tap presses the button). Wrap one focusable trigger; it gets aria-describedby.
const props = withDefaults(defineProps<{ text: string, side?: Side, align?: Align }>(), { side: 'bottom', align: 'center' })
const WAIT = 300
const pop = usePopover({ side: props.side, align: props.align, gap: 2, sticky: true })
const id = `tip-${useId()}`
const root = ref<HTMLElement | null>(null)
let timer: ReturnType<typeof setTimeout> | undefined

onMounted(() => {
  const trigger = root.value?.firstElementChild as HTMLElement | null
  pop.anchor.value = trigger
  trigger?.setAttribute('aria-describedby', id)
})
watch(pop.open, (now) => { if (!now) lastClosed = Date.now() })
onBeforeUnmount(() => clearTimeout(timer))

function enter(event: PointerEvent) {
  if (event.pointerType !== 'mouse' || pop.open.value) return
  clearTimeout(timer)
  if (Date.now() - lastClosed < WAIT) return void pop.show({ keyboard: true })
  // ds-latency: the wait is the point; a pass of the pointer shows nothing.
  timer = setTimeout(() => void pop.show(), WAIT)
}
function leave() {
  clearTimeout(timer)
  pop.hide()
}
function focus(event: FocusEvent) {
  if ((event.target as HTMLElement).matches(':focus-visible')) void pop.show({ keyboard: true })
}
</script>

<template>
  <span ref="root" class="inline-flex" @pointerenter="enter" @pointerleave="leave" @pointerdown="leave" @focusin="focus" @focusout="leave">
    <slot />
  </span>
  <PopoverPanel :id="id" :pop="pop" tip role="tooltip">{{ text }}</PopoverPanel>
</template>
