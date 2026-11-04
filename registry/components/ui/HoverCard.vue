<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref, useId } from 'vue'
import PopoverPanel from '@/components/ui/PopoverPanel.vue'
import { usePopover, type Align, type Side } from '@/composables/usePopover'

// More about a link, shown while the pointer rests on it: Menu's square panel, 12px in, opened after the copy
// tooltip's 300ms wait and, on keyboard focus, at once. The pointer can cross into the card to select or follow what
// is in it; leaving both closes it after a short grace. It is a preview, never the only way to the content: on touch
// the link just works. Wrap one link; the card is the `card` slot.
const props = withDefaults(defineProps<{ side?: Side, align?: Align, width?: string }>(), { side: 'bottom', align: 'start', width: '280px' })
const WAIT = 300
const GRACE = 120
const pop = usePopover({ side: props.side, align: props.align, gap: 6, sticky: true })
const id = `card-${useId()}`
const root = ref<HTMLElement | null>(null)
let timer: ReturnType<typeof setTimeout> | undefined

onMounted(() => {
  const trigger = root.value?.firstElementChild as HTMLElement | null
  pop.anchor.value = trigger
  trigger?.setAttribute('aria-describedby', id)
})
onBeforeUnmount(() => clearTimeout(timer))

function enter(event: PointerEvent) {
  if (event.pointerType !== 'mouse') return
  clearTimeout(timer)
  // ds-latency: the wait keeps a passing pointer from opening it.
  if (!pop.open.value) timer = setTimeout(() => void pop.show(), WAIT)
}
function leave(event: PointerEvent) {
  if (event.pointerType !== 'mouse') return
  clearTimeout(timer)
  // ds-latency: a grace to cross the gap into the card.
  timer = setTimeout(() => pop.hide(), GRACE)
}
function focus(event: FocusEvent) {
  if ((event.target as HTMLElement).matches(':focus-visible')) void pop.show({ keyboard: true })
}
function blur(event: FocusEvent) {
  const next = event.relatedTarget as Node | null
  if (!next || !pop.panel.value?.contains(next)) pop.hide()
}
</script>

<template>
  <span ref="root" class="inline-flex" @pointerenter="enter" @pointerleave="leave" @focusin="focus" @focusout="blur">
    <slot />
  </span>
  <PopoverPanel :id="id" :pop="pop" class="p-3" :style="{ width }" @pointerenter="enter" @pointerleave="leave">
    <slot name="card" />
  </PopoverPanel>
</template>
