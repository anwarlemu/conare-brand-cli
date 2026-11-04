<script setup lang="ts">
import { X } from 'lucide-vue-next'
import Button from '@/components/ui/Button.vue'
// A tool with no label, as the docs panel's close: its name goes to assistive tech.
</script>

<template>
  <Button variant="ghost" icon aria-label="close docs"><X :size="14" :stroke-width="1.5" /></Button>
</template>
