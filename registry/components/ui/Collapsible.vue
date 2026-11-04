<script setup lang="ts">
import { ref, useId } from 'vue'
import { ChevronDown } from 'lucide-vue-next'

// A part that opens in place and pushes what follows (console2.css .v2-collapse, CodePop's open-in-place): the row
// grows to its content's height (0fr to 1fr) over 260ms on the strong ease-out and closes in 180ms; the content fades
// up 6px from a 2px blur, a beat after the row starts. The chevron turns 180 degrees (180ms, 120ms back). Toggled from
// the keyboard it opens at once. The trigger is the slot `trigger`, drawn as a quiet row unless `triggerClass` says
// otherwise; it is a real button with aria-expanded and aria-controls.
defineProps<{ triggerClass?: string }>()
const open = defineModel<boolean>('open', { default: false })
const instant = ref(false)
const id = `collapse-${useId()}`
function toggle(event: MouseEvent) {
  instant.value = event.detail === 0
  open.value = !open.value
}
</script>

<template>
  <div class="ds-collapsible" :data-open="open || undefined" :data-instant="instant || undefined">
    <button
      type="button"
      :class="triggerClass ?? 'flex w-full cursor-pointer items-center gap-2 py-2 text-left type-ui text-fg focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-edge-focus max-md:min-h-11'"
      :aria-expanded="open"
      :aria-controls="id"
      @click="toggle"
    >
      <slot name="trigger" :open="open" />
      <ChevronDown :size="14" :stroke-width="1.5" class="ds-collapsible-chev ml-auto shrink-0 text-fg-muted" aria-hidden="true" />
    </button>
    <div :id="id" class="ds-collapsible-region" :inert="!open || undefined">
      <div><div class="ds-collapsible-content"><slot /></div></div>
    </div>
  </div>
</template>

<style>
.ds-collapsible-region { display: grid; grid-template-rows: 0fr; transition: grid-template-rows var(--ds-duration-slide) var(--ds-easing-out); }
.ds-collapsible[data-open] > .ds-collapsible-region { grid-template-rows: 1fr; transition-duration: var(--ds-duration-collapse); }
.ds-collapsible-region > div { min-height: 0; overflow: hidden; }
.ds-collapsible-content { opacity: 0; filter: blur(2px); transform: translateY(-6px); transition: opacity var(--ds-duration-micro) var(--ds-easing-standard), filter var(--ds-duration-micro) var(--ds-easing-standard), transform var(--ds-duration-slide) var(--ds-easing-out); }
.ds-collapsible[data-open] > .ds-collapsible-region .ds-collapsible-content { opacity: 1; filter: none; transform: none; transition-delay: 40ms; transition-duration: var(--ds-duration-settle), var(--ds-duration-settle), var(--ds-duration-collapse); }
.ds-collapsible-chev { transition: rotate var(--ds-duration-micro) var(--ds-easing-out); }
.ds-collapsible[data-open] > button .ds-collapsible-chev { rotate: 180deg; transition-duration: var(--ds-duration-slide); }
.ds-collapsible[data-instant] :is(.ds-collapsible-region, .ds-collapsible-content, .ds-collapsible-chev) { transition: none; }
@media (prefers-reduced-motion: reduce) {
  .ds-collapsible-region, .ds-collapsible-chev { transition: none; }
  .ds-collapsible-content, .ds-collapsible[data-open] > .ds-collapsible-region .ds-collapsible-content { filter: none; transform: none; }
}
</style>
