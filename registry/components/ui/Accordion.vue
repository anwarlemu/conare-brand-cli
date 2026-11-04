<script setup lang="ts">
import { provide, type Ref } from 'vue'
import { accordionKey } from '@/composables/useAccordion'

// A stack of disclosures, built in Conare's style from the console's disclosure (.v2-collapse, .c-details) and the
// website's FAQ: hairlines between rows, a 12px muted chevron that turns as a row opens, the row's height opening from
// 0fr to 1fr over 260ms and closing in 180ms on the strong ease-out, its words fading down into place a beat after.
// One open at a time by default (a second press closes it); `multiple` lets several stay open. v-model is the open
// item's value (or the list of them with `multiple`). Compose with AccordionItem.
const props = defineProps<{ multiple?: boolean }>()
const model = defineModel<string | string[] | null>({ default: null })

const list = (m: Ref<string | string[] | null>) => (Array.isArray(m.value) ? m.value : m.value ? [m.value] : [])
provide(accordionKey, {
  isOpen: v => list(model).includes(v),
  toggle: (v) => {
    const open = list(model)
    if (props.multiple) model.value = open.includes(v) ? open.filter(x => x !== v) : [...open, v]
    else model.value = open.includes(v) ? null : v
  },
})
</script>

<template>
  <div class="ds-accordion border-t border-edge"><slot /></div>
</template>
