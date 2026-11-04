<script setup lang="ts">
import { ref } from 'vue'
import ToggleGroup from '@/components/ui/ToggleGroup.vue'
// Kinds of document a search may return, several at once; and a single pick that can be let go.
const kinds = ref<string[] | string | null>(['Pages', 'Files'])
const weight = ref<string[] | string | null>('Recent first')
</script>

<template>
  <div class="grid items-start gap-2 md:grid-cols-[112px_minmax(0,1fr)] md:gap-x-6 md:gap-y-8">
    <p class="type-meta leading-7 text-fg-muted">Several</p>
    <div><ToggleGroup v-model="kinds" multiple label="kinds of document" :options="['Messages', 'Pages', 'Emails', 'Files']" /></div>
    <p class="mt-4 type-meta leading-7 text-fg-muted md:mt-0">One or none</p>
    <div><ToggleGroup v-model="weight" label="ordering" :options="['Recent first', 'Most cited']" /></div>
  </div>
</template>
