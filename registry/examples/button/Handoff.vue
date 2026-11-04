<script setup lang="ts">
import { Check, Copy } from 'lucide-vue-next'
import PixelButton from '@/components/ui/PixelButton.vue'
import { useCopy } from '@/composables/useCopy'
// The dark button handing something off, as Copy prompt: hover runs the red squares across, a press darkens them at
// once with no change of size, and once copied the red holds while it says so.
const { copied, copy } = useCopy()
</script>

<template>
  <PixelButton :done="copied" @click="copy('Connect Conare to this project and run a first search.')">
    <Check v-if="copied" :size="12" :stroke-width="2" aria-hidden="true" />
    <Copy v-else :size="12" :stroke-width="1.5" aria-hidden="true" />
    {{ copied ? 'Copied' : 'Copy prompt' }}
  </PixelButton>
  <span class="sr-only" aria-live="polite">{{ copied ? 'prompt copied' : '' }}</span>
</template>
