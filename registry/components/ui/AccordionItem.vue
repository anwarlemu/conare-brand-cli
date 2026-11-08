<script setup lang="ts">
import { computed, inject, useId } from 'vue'
import { ChevronDown } from 'lucide-vue-next'
import { accordionKey } from '@/composables/useAccordion'

// One row of an Accordion: the question as a full-width button (40px, 13px soft text that turns ink under the pointer
// and while open) over a hairline, and the answer under it. The closed answer is inert, so its links leave the tab
// order. `title` or the `title` slot names the row; the default slot is the answer.
const props = defineProps<{ value: string, title?: string, disabled?: boolean }>()
const ctx = inject(accordionKey)
const open = computed(() => ctx?.isOpen(props.value) ?? false)
const id = useId()
</script>

<template>
  <div data-ds="accordion-item" class="border-b border-edge" :data-open="open">
    <h3>
      <button
        :id="`${id}-head`"
        type="button"
        :aria-expanded="open"
        :aria-controls="`${id}-body`"
        :disabled="disabled"
        class="flex min-h-row w-full cursor-pointer items-center justify-between gap-3 py-2 text-left type-ui text-fg-soft transition-colors duration-120 ease-standard hover:text-fg aria-expanded:text-fg disabled:cursor-default disabled:text-fg-muted"
        @click="ctx?.toggle(value)"
      >
        <slot name="title">{{ title }}</slot>
        <ChevronDown :size="12" :stroke-width="1.5" aria-hidden="true" class="shrink-0 text-fg-muted transition-[rotate] duration-200 ease-standard motion-reduce:transition-none" :class="open && 'rotate-180'" />
      </button>
    </h3>
    <div :id="`${id}-body`" role="region" :aria-labelledby="`${id}-head`" :inert="!open" class="ds-collapse" :data-open="open">
      <div><div class="ds-collapse-body pb-3 type-ui text-fg-soft"><slot /></div></div>
    </div>
  </div>
</template>

<style>
/* The console's disclosure (console2.css .v2-collapse): open over 260ms, close in 180ms, the words fading and
   settling 6px down with a 2px blur that clears, so the text never pops. Reduced motion: no height or move, opacity only. */
.ds-collapse { display: grid; grid-template-rows: 0fr; transition: grid-template-rows var(--ds-duration-slide) var(--ds-easing-out); }
.ds-collapse[data-open="true"] { grid-template-rows: 1fr; transition-duration: var(--ds-duration-collapse); }
.ds-collapse > div { min-height: 0; overflow: hidden; }
.ds-collapse-body { opacity: 0; filter: blur(2px); transform: translateY(-6px); transition: opacity var(--ds-duration-micro) ease, filter var(--ds-duration-micro) ease, transform var(--ds-duration-slide) var(--ds-easing-out); }
.ds-collapse[data-open="true"] .ds-collapse-body { opacity: 1; filter: none; transform: none; transition: opacity var(--ds-duration-settle) ease 40ms, filter var(--ds-duration-settle) ease 40ms, transform var(--ds-duration-collapse) var(--ds-easing-out) 40ms; }
@media (prefers-reduced-motion: reduce) {
  .ds-collapse, .ds-collapse[data-open="true"] { transition: none; }
  .ds-collapse-body, .ds-collapse[data-open="true"] .ds-collapse-body { filter: none; transform: none; transition: opacity var(--ds-duration-micro) ease; }
}
</style>
