<script setup lang="ts">
import OverviewBand, { type OverviewStep } from '@/components/product/OverviewBand.vue'
// Pipeline: the website's four steps with the team's numbers, so the console teaches what the product does. A broken
// step turns red where it broke.
const steps: OverviewStep[] = [
  { name: 'Connect', value: '6 sources', line: 'Into 4 namespaces', href: '#sources' },
  { name: 'Sync', value: '2,749,690', line: 'crm stopped syncing', href: '#sources', red: true },
  { name: 'Retrieve', value: '312 ms', line: '94.2% strong answers', href: '#performance' },
  { name: 'Deliver', value: '3 agents', line: '1,284 searches today', href: '#agents' },
]
</script>

<template>
  <OverviewBand view="pipeline" :steps="steps" />
</template>
