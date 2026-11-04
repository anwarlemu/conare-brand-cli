<script setup lang="ts">
import LineChart from '@/components/ui/LineChart.vue'
// Search latency, p50 and p95, as smoothed lines over a day.
const hour = (i: number) => Date.UTC(2026, 9, 29, i)
const latency = [
  { label: 'p50', points: Array.from({ length: 24 }, (_, i) => ({ t: hour(i), v: 230 + ((i * 13) % 7) * 3 })) },
  { label: 'p95', points: Array.from({ length: 24 }, (_, i) => ({ t: hour(i), v: 400 + ((i * 17) % 9) * 6 })) },
]
const ms = (v: number) => `${Math.round(v)} ms`
</script>

<template>
  <LineChart title="Search latency, last 24 hours" :series="latency" :format="ms" :smooth="3" bare />
</template>
