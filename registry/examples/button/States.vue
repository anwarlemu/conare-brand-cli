<script setup lang="ts">
import { Check, Copy } from 'lucide-vue-next'
import Button from '@/components/ui/Button.vue'
import { useCopy } from '@/composables/useCopy'
// The states a button goes through: at rest, waiting (disabled is grey with a dark label, never faded), and done (the
// check and "Copied" for 1.5s).
const { copied, copy } = useCopy()
</script>

<template>
  <div class="flex flex-wrap items-center gap-2">
    <Button>At rest</Button>
    <Button variant="dark" disabled>Create key</Button>
    <Button disabled>Disabled</Button>
    <Button @click="copy('ns_contracts')">
      <Check v-if="copied" :size="12" :stroke-width="2" aria-hidden="true" />
      <Copy v-else :size="12" :stroke-width="1.5" aria-hidden="true" />{{ copied ? 'Copied' : 'Copy ID' }}
    </Button>
  </div>
</template>
