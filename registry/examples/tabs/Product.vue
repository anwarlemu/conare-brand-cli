<script setup lang="ts">
import { ref } from 'vue'
import Tabs from '@/components/ui/Tabs.vue'
// The segmented control, for a chart's view and its range: the white block glides to the pick.
const view = ref('volume')
const range = ref('24h')
</script>

<template>
  <div class="grid items-start gap-2 md:grid-cols-[112px_minmax(0,1fr)] md:gap-x-6 md:gap-y-8">
    <p class="type-meta leading-7 text-fg-muted">Views of one thing</p>
    <div><Tabs v-model="view" :options="[{ value: 'volume', label: 'Volume' }, { value: 'latency', label: 'Latency' }]" label="chart view" /></div>
    <p class="mt-4 type-meta leading-7 text-fg-muted md:mt-0">A range</p>
    <div><Tabs v-model="range" :options="['1h', '24h', '7d']" label="range" /></div>
  </div>
</template>
