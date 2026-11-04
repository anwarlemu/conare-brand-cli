<script setup lang="ts">
import { ref } from 'vue'
import SplitBar from '@/components/ui/SplitBar.vue'
// A whole in parts, as Billing's prices draw it: one bar, the largest part first, a red mark over the part the row
// pointed at names, and one block gliding down the rows.
const usd = (cents: number) => (cents / 100).toLocaleString('en-US', { style: 'currency', currency: 'USD' })
const parts = [
  { name: 'Queries', detail: '$1.00 per 1,000 queries', value: 18431 },
  { name: 'Documents', detail: '$1.00 per 1,000 pages', value: 4821 },
  { name: 'Indexing', detail: '$0.05 per 1M tokens', value: 1928 },
  { name: 'Storage', detail: '$0.33 per GB a month', value: 268 },
].map(p => ({ ...p, display: usd(p.value) }))
const at = ref(0)
</script>

<template>
  <SplitBar v-model="at" :parts="parts" label="This month's bill by part" />
</template>
