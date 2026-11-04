<script setup lang="ts">
import { ref } from 'vue'
import Switch from '@/components/ui/Switch.vue'
// A setting to press, on or off, and one that can't be changed.
const on = ref(true)
</script>

<template>
  <div class="grid items-start gap-2 md:grid-cols-[112px_minmax(0,1fr)] md:gap-x-6 md:gap-y-8">
    <p class="type-meta leading-7 text-fg-muted">A setting</p>
    <div class="flex min-h-7 items-center"><Switch v-model="on" label="email sign-in" /></div>
    <p class="mt-4 type-meta leading-7 text-fg-muted md:mt-0">Can't be changed</p>
    <div class="flex min-h-7 items-center"><Switch :model-value="true" label="on, can't be changed" disabled /></div>
  </div>
</template>
