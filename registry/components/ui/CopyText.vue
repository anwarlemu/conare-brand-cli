<script setup lang="ts">
import { Check, Copy } from 'lucide-vue-next'
import { useCopy } from '@/composables/useCopy'

// An identifier or an endpoint as typed, with a button that copies it (CopyText.vue): the value in 12px Geist Mono,
// cut with an ellipsis when it runs out of room (the whole value in its title), and a 20px quiet button whose glyph turns
// to a check for 1.5s. The button is round, as the console draws it, and grows a 44px place to land on phones. One value
// per copy text; never a secret after it was first shown.
const props = defineProps<{ value: string, label: string }>()
const { copied, copy } = useCopy()
</script>

<template>
  <span class="inline-flex max-w-full min-w-0 items-center gap-1">
    <code class="truncate font-code text-meta leading-5" :title="value">{{ value }}</code>
    <button
      type="button"
      class="relative inline-flex size-5 shrink-0 cursor-pointer items-center justify-center rounded-full text-fg-muted transition-colors duration-150 hover:bg-surface-sunken hover:text-fg pointer-coarse:after:absolute pointer-coarse:after:-inset-3 pointer-coarse:after:content-[''] max-md:after:absolute max-md:after:-inset-3 max-md:after:content-['']"
      :aria-label="copied ? `${label} copied` : `copy ${label}`"
      @click.stop="copy(props.value)"
    >
      <Check v-if="copied" :size="12" :stroke-width="1.5" aria-hidden="true" />
      <Copy v-else :size="12" :stroke-width="1.5" aria-hidden="true" />
    </button>
  </span>
</template>
