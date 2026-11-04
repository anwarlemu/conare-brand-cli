<script setup lang="ts">
import { Copy } from 'lucide-vue-next'
import Button from '@/components/ui/Button.vue'
// Every other action, the default: a hairline that turns ink under the pointer, the paper while pressed.
</script>

<template>
  <Button press><Copy :size="12" :stroke-width="1.5" aria-hidden="true" />Copy as code</Button>
</template>
